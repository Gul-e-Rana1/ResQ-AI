import React, { useState } from "react";
import {
  HeartHandshake, Eye, EyeOff, ArrowLeft, Mail, Lock, User, Phone,
  MapPin, CheckCircle, AlertTriangle, Shield
} from "lucide-react";
import { Button, Input, Alert } from "../components/ui";

interface AuthProps {
  page: "login" | "register" | "forgot_password" | "reset_password";
  onNavigate: (page: string) => void;
}

function AuthLayout({ children, title, subtitle, showBack, onBack }: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showBack?: boolean;
  onBack?: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <HeartHandshake size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-[#0F172A] font-[family-name:var(--font-display)] tracking-tight">
            ResQ<span className="text-[#2563EB]"> AI</span>
          </span>
        </div>
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#334155] transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#0F172A] font-[family-name:var(--font-display)] mb-1">{title}</h1>
            <p className="text-sm text-[#64748B]">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (role: string) => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      if (role === "admin") onNavigate("admin_dashboard");
      else if (role === "camp") onNavigate("camp_dashboard");
      else onNavigate("user_dashboard");
    }, 1000);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your ResQ AI account"
      showBack
      onBack={() => onNavigate("landing")}
    >
      <div className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          prefixIcon={<Mail size={14} />}
          fullWidth
        />

        <div className="flex flex-col gap-1.5">
          <Input
            label="Password"
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            prefixIcon={<Lock size={14} />}
            suffixIcon={
              <button onClick={() => setShowPass(!showPass)} className="pointer-events-auto">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
            fullWidth
          />
          <div className="flex justify-end">
            <button
              onClick={() => onNavigate("forgot_password")}
              className="text-xs text-[#2563EB] hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button fullWidth loading={loading} onClick={() => handleLogin("user")}>
          Sign In as User
        </Button>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-xs text-[#94A3B8]">or continue as</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleLogin("camp")}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#334155] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all font-medium"
          >
            <div className="w-5 h-5 rounded bg-[#ECFDF5] flex items-center justify-center">
              <Shield size={11} className="text-[#059669]" />
            </div>
            Camp Manager
          </button>
          <button
            onClick={() => handleLogin("admin")}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#334155] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all font-medium"
          >
            <div className="w-5 h-5 rounded bg-[#F5F3FF] flex items-center justify-center">
              <Shield size={11} className="text-[#7C3AED]" />
            </div>
            Admin
          </button>
        </div>

        <p className="text-xs text-center text-[#64748B]">
          Don't have an account?{" "}
          <button onClick={() => onNavigate("register")} className="text-[#2563EB] font-medium hover:underline">
            Create one
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

function RegisterPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", location: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
    }, 1200);
  };

  if (step === "success") {
    return (
      <AuthLayout title="Account Created" subtitle="Your ResQ AI account is ready.">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#ECFDF5] border-2 border-[#D1FAE5] mx-auto mb-4 flex items-center justify-center">
            <CheckCircle size={24} className="text-[#059669]" />
          </div>
          <h3 className="text-base font-semibold text-[#0F172A] mb-2">Welcome to ResQ AI!</h3>
          <p className="text-sm text-[#64748B] mb-6">Your account has been created successfully. Sign in to get started.</p>
          <Button fullWidth onClick={() => onNavigate("login")}>Continue to Sign In</Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join ResQ AI for disaster relief assistance"
      showBack
      onBack={() => onNavigate("login")}
    >
      <div className="space-y-3">
        <Input
          label="Full Name"
          placeholder="Sarah Johnson"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          prefixIcon={<User size={14} />}
          fullWidth
        />
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          prefixIcon={<Mail size={14} />}
          fullWidth
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          prefixIcon={<Phone size={14} />}
          fullWidth
        />
        <Input
          label="Location / City"
          placeholder="New Delhi, India"
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          prefixIcon={<MapPin size={14} />}
          fullWidth
        />
        <Input
          label="Password"
          type={showPass ? "text" : "password"}
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          prefixIcon={<Lock size={14} />}
          suffixIcon={
            <button onClick={() => setShowPass(!showPass)} className="pointer-events-auto">
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          fullWidth
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={form.confirm}
          onChange={(e) => update("confirm", e.target.value)}
          prefixIcon={<Lock size={14} />}
          fullWidth
        />

        <div className="flex items-start gap-2 pt-1">
          <input type="checkbox" id="terms" className="mt-0.5 accent-[#2563EB]" />
          <label htmlFor="terms" className="text-xs text-[#64748B] leading-relaxed">
            I agree to the{" "}
            <span className="text-[#2563EB] cursor-pointer hover:underline">Terms of Service</span>{" "}
            and{" "}
            <span className="text-[#2563EB] cursor-pointer hover:underline">Privacy Policy</span>
          </label>
        </div>

        <Button fullWidth loading={loading} onClick={handleRegister}>
          Create Account
        </Button>

        <p className="text-xs text-center text-[#64748B]">
          Already have an account?{" "}
          <button onClick={() => onNavigate("login")} className="text-[#2563EB] font-medium hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

function ForgotPasswordPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="We'll send a reset link to your email"
      showBack
      onBack={() => onNavigate("login")}
    >
      {sent ? (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#ECFDF5] mx-auto mb-4 flex items-center justify-center">
            <Mail size={20} className="text-[#059669]" />
          </div>
          <h3 className="text-base font-semibold text-[#0F172A] mb-2">Check your email</h3>
          <p className="text-sm text-[#64748B] mb-6">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <Button variant="outline" fullWidth onClick={() => onNavigate("login")}>
            Back to Sign In
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            prefixIcon={<Mail size={14} />}
            fullWidth
          />
          <Button fullWidth loading={loading} onClick={handleSend}>
            Send Reset Link
          </Button>
          <Button variant="ghost" fullWidth onClick={() => onNavigate("login")}>
            Back to Sign In
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}

function ResetPasswordPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1000);
  };

  return (
    <AuthLayout title="Reset password" subtitle="Enter your new password below">
      {done ? (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#ECFDF5] mx-auto mb-4 flex items-center justify-center">
            <CheckCircle size={20} className="text-[#059669]" />
          </div>
          <h3 className="text-base font-semibold text-[#0F172A] mb-2">Password reset!</h3>
          <p className="text-sm text-[#64748B] mb-6">Your password has been updated. Sign in with your new password.</p>
          <Button fullWidth onClick={() => onNavigate("login")}>Sign In</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            prefixIcon={<Lock size={14} />}
            fullWidth
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            prefixIcon={<Lock size={14} />}
            fullWidth
          />
          <Button fullWidth loading={loading} onClick={handleReset}>
            Reset Password
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}

export default function AuthPage({ page, onNavigate }: AuthProps) {
  if (page === "login") return <LoginPage onNavigate={onNavigate} />;
  if (page === "register") return <RegisterPage onNavigate={onNavigate} />;
  if (page === "forgot_password") return <ForgotPasswordPage onNavigate={onNavigate} />;
  if (page === "reset_password") return <ResetPasswordPage onNavigate={onNavigate} />;
  return null;
}
