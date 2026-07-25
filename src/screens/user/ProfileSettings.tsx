import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  User, Mail, Phone, MapPin, Lock, Shield, Eye, EyeOff,
  Camera, Save, Smartphone, AlertTriangle
} from "lucide-react";
import { Card, Button, Input, Toggle, Tabs, Select, Avatar, Alert } from "../../components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { updateProfile } from "@/lib/services/profile";
import { PAKISTAN_PROVINCES } from "@/lib/constants/pakistan";

interface Props {
  onNavigate: (page: string) => void;
  page: "profile" | "user_settings";
}

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  province: z.string().optional().or(z.literal("")),
  district: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormState = z.infer<typeof profileSchema>;
type ProfileFormErrors = Partial<Record<keyof ProfileFormState, string>>;
type PasswordFormState = z.infer<typeof passwordSchema>;
type PasswordFormErrors = Partial<Record<keyof PasswordFormState, string>>;

export default function ProfileSettings({ onNavigate, page }: Props) {
  const { user, profile, updatePassword, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(page === "user_settings" ? "notifications" : "personal");
  const [showPass, setShowPass] = useState(false);

  const [formData, setFormData] = useState<ProfileFormState>({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    city: "",
  });
  const [formErrors, setFormErrors] = useState<ProfileFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({ newPassword: "", confirmPassword: "" });
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [notifications, setNotifications] = useState({
    emergencyUpdates: true,
    campAlerts: true,
    smsAlerts: true,
    emailAlerts: false,
    marketingEmails: false,
    weeklyDigest: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        phone: profile.phone || "",
        province: profile.province || "",
        district: profile.district || "",
        city: profile.city || "",
      });
    }
  }, [profile]);

  const tabs = [
    { id: "personal", label: "Personal Info" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
    { id: "emergency", label: "Emergency Profile" },
  ];

  const handleSave = async () => {
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const errors: ProfileFormErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof ProfileFormState | undefined;
        if (key) errors[key] = issue.message;
      });
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    if (!user?.id) {
      setSaveMessage({ type: "error", text: "You must be signed in to update your profile." });
      return;
    }

    setSaving(true);
    setSaveMessage(null);

    const { profile: updated, error } = await updateProfile(user.id, {
      fullName: result.data.fullName,
      phone: result.data.phone || null,
      province: result.data.province || null,
      district: result.data.district || null,
      city: result.data.city || null,
    });

    setSaving(false);

    if (error || !updated) {
      setSaveMessage({ type: "error", text: error || "Failed to save changes. Please try again." });
      return;
    }

    setSaveMessage({ type: "success", text: "Profile updated successfully." });
    await refreshProfile();
  };

  const handlePasswordUpdate = async () => {
    const result = passwordSchema.safeParse(passwordForm);
    if (!result.success) {
      const errors: PasswordFormErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof PasswordFormState | undefined;
        if (key) errors[key] = issue.message;
      });
      setPasswordErrors(errors);
      return;
    }
    setPasswordErrors({});
    setPasswordSaving(true);
    setPasswordMessage(null);

    try {
      await updatePassword(result.data.newPassword);
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update password. Please try again.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="p-5 md:p-6 max-w-3xl space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
          {page === "profile" ? "My Profile" : "Settings"}
        </h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          {page === "profile" ? "Manage your personal information" : "Configure your account preferences"}
        </p>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "personal" && (
        <div className="space-y-5">
          {/* Avatar */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name={formData.fullName || profile?.email || "User"} size="xl" />
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2563EB] text-white rounded-full flex items-center justify-center hover:bg-[#1D4ED8] transition-colors shadow-sm">
                  <Camera size={11} />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{formData.fullName || "Your name"}</p>
                <p className="text-xs text-[#64748B]">{profile?.email}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {profile?.created_at
                    ? `Member since ${new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                    : ""}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Personal Information</h2>
            <div className="space-y-3">
              {saveMessage && (
                <Alert type={saveMessage.type === "success" ? "success" : "error"}>{saveMessage.text}</Alert>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                  error={formErrors.fullName}
                  prefixIcon={<User size={13} />}
                  fullWidth
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  prefixIcon={<Mail size={13} />}
                  hint="Email is tied to your account and cannot be changed here."
                  fullWidth
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  error={formErrors.phone}
                  prefixIcon={<Phone size={13} />}
                  fullWidth
                />
                <Select
                  label="Province"
                  value={formData.province}
                  onChange={(e) => setFormData((p) => ({ ...p, province: e.target.value }))}
                  options={[
                    { value: "", label: "Select province" },
                    ...PAKISTAN_PROVINCES.map((p) => ({ value: p, label: p })),
                  ]}
                  fullWidth
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="District"
                  value={formData.district}
                  onChange={(e) => setFormData((p) => ({ ...p, district: e.target.value }))}
                  prefixIcon={<MapPin size={13} />}
                  fullWidth
                />
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                  prefixIcon={<MapPin size={13} />}
                  fullWidth
                />
              </div>
              <Button loading={saving} onClick={handleSave} icon={<Save size={13} />} size="sm">
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "security" && (
        <Card>
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Security Settings</h2>
          <div className="space-y-4">
            {passwordMessage && (
              <Alert type={passwordMessage.type === "success" ? "success" : "error"}>{passwordMessage.text}</Alert>
            )}
            <div className="relative">
              <Input
                label="New Password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                error={passwordErrors.newPassword}
                prefixIcon={<Lock size={13} />}
                suffixIcon={
                  <button onClick={() => setShowPass(!showPass)} className="pointer-events-auto">
                    {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                }
                fullWidth
              />
            </div>
            <Input
              label="Confirm New Password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              error={passwordErrors.confirmPassword}
              prefixIcon={<Lock size={13} />}
              fullWidth
            />
            <Button loading={passwordSaving} onClick={handlePasswordUpdate} size="sm" icon={<Shield size={13} />}>
              Update Password
            </Button>

            <div className="pt-4 border-t border-[#F1F5F9]">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Smartphone size={16} className="text-[#64748B]" />
                  <div>
                    <p className="text-sm font-medium text-[#334155]">SMS Authentication</p>
                    <p className="text-xs text-[#94A3B8]">Not yet available for your account</p>
                  </div>
                </div>
                <Toggle checked={false} onChange={() => {}} disabled />
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Notification Preferences</h2>
          <p className="text-xs text-[#94A3B8] mb-3">
            These preferences are stored locally in this session only — server-side notification preferences are not yet supported.
          </p>
          <div className="space-y-1">
            {[
              { key: "emergencyUpdates", label: "Emergency Updates", desc: "Status updates for your active emergencies" },
              { key: "campAlerts", label: "Camp Capacity Alerts", desc: "When nearby camps have available space" },
              { key: "smsAlerts", label: "SMS Alerts", desc: "Critical alerts via text message" },
              { key: "emailAlerts", label: "Email Alerts", desc: "Updates sent to your email" },
              { key: "weeklyDigest", label: "Weekly Summary", desc: "Weekly digest of your activity" },
              { key: "marketingEmails", label: "Product Updates", desc: "News and updates from ResQ AI" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-[#F8FAFC] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#334155]">{item.label}</p>
                  <p className="text-xs text-[#94A3B8]">{item.desc}</p>
                </div>
                <Toggle
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={(v) => setNotifications(p => ({ ...p, [item.key]: v }))}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "emergency" && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Emergency Profile</h2>
            <p className="text-xs text-[#64748B] mb-4">This information helps responders prepare before arriving at your location.</p>
            <div className="space-y-3">
              <Select
                label="Blood Type"
                options={[
                  { value: "", label: "Select blood type" },
                  { value: "a+", label: "A+" }, { value: "a-", label: "A-" },
                  { value: "b+", label: "B+" }, { value: "b-", label: "B-" },
                  { value: "o+", label: "O+" }, { value: "o-", label: "O-" },
                  { value: "ab+", label: "AB+" }, { value: "ab-", label: "AB-" },
                ]}
                fullWidth
              />
              <Input label="Medical Conditions (if any)" placeholder="e.g., Diabetes, Hypertension..." fullWidth />
              <Input label="Current Medications" placeholder="List any important medications..." fullWidth />
              <Input label="Emergency Contact Name" placeholder="Parent, sibling, friend..." prefixIcon={<User size={13} />} fullWidth />
              <Input label="Emergency Contact Phone" placeholder="+92 000 0000000" prefixIcon={<Phone size={13} />} fullWidth />
              <Input label="Home Address" placeholder="Full address for responders" prefixIcon={<MapPin size={13} />} fullWidth />
            </div>
            <Button className="mt-4" size="sm" icon={<Save size={13} />} disabled title="Emergency profile persistence is not yet supported">
              Save Emergency Profile
            </Button>
            <p className="text-xs text-[#94A3B8] mt-2">This section is not yet connected to storage — entries won't be saved.</p>
          </Card>

          <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl">
            <AlertTriangle size={14} className="text-[#2563EB] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#1D4ED8]">
              Your emergency profile is only shared with verified relief camp coordinators and responders during active emergencies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
