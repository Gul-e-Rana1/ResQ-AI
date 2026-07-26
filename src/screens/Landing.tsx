import React, { useState } from "react";
import {
  HeartHandshake, MapPin, MessageSquare, Shield, Zap, ChevronRight,
  Phone, AlertTriangle, CheckCircle, ArrowRight, Star,
  Activity, Globe, Menu, X
} from "lucide-react";
import { Button, Badge } from "../components/ui";

interface LandingProps {
  onNavigate: (page: string) => void;
}

const features = [
  {
    icon: <MapPin size={20} />,
    color: "blue",
    title: "Find Nearby Camps",
    description: "Instantly locate verified relief camps within your area. Real-time capacity and status updates.",
  },
  {
    icon: <MessageSquare size={20} />,
    color: "purple",
    title: "AI-Powered Guidance",
    description: "Our AI assistant provides personalized emergency guidance, risk assessment, and recommended actions.",
  },
  {
    icon: <Zap size={20} />,
    color: "orange",
    title: "Rapid Emergency Request",
    description: "Submit an emergency request in under 30 seconds. Get assigned to a camp within minutes.",
  },
  {
    icon: <Activity size={20} />,
    color: "green",
    title: "Live Status Tracking",
    description: "Track your emergency in real-time from submission to resolution with our detailed timeline.",
  },
  {
    icon: <Shield size={20} />,
    color: "blue",
    title: "Verified Responders",
    description: "All camps and relief workers are verified and approved. You can trust who's responding.",
  },
  {
    icon: <Phone size={20} />,
    color: "red",
    title: "Emergency Helplines",
    description: "Access verified emergency contact numbers for police, fire, medical, and disaster authorities.",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-[#EFF6FF] text-[#2563EB]",
  purple: "bg-[#F5F3FF] text-[#7C3AED]",
  orange: "bg-[#FFF7ED] text-[#EA580C]",
  green: "bg-[#ECFDF5] text-[#059669]",
  red: "bg-[#FEF2F2] text-[#DC2626]",
};

const testimonials = [
  {
    name: "Ayesha Malik",
    role: "Flood Survivor",
    location: "Multan, Punjab",
    text: "ResQ AI found a camp 1.4km away within seconds. The response team arrived in 9 minutes. I don't know what I would've done without it.",
    stars: 5,
  },
  {
    name: "Bilal Hussain",
    role: "Earthquake Survivor",
    location: "Mansehra, Khyber Pakhtunkhwa",
    text: "The AI assistant told me exactly what to do step by step. The emergency team had my details before they even arrived. Incredible platform.",
    stars: 5,
  },
  {
    name: "Sana Baloch",
    role: "Displaced Family",
    location: "Quetta, Balochistan",
    text: "I found my family's emergency camp assignment on the map within 2 minutes of registering. Clear, calm, and incredibly well designed.",
    stars: 5,
  },
];

const helplines = [
  { name: "National Disaster Response", number: "1800-180-1253", type: "disaster" },
  { name: "Medical Emergency", number: "108", type: "medical" },
  { name: "Police Emergency", number: "100", type: "police" },
  { name: "Fire & Rescue", number: "101", type: "fire" },
];

export default function Landing({ onNavigate }: LandingProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-sans)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <HeartHandshake size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-[#0F172A] font-[family-name:var(--font-display)] tracking-tight">
              ResQ<span className="text-[#2563EB]"> AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => onNavigate("about")} className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">About</button>
            <button onClick={() => onNavigate("contact")} className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">Contact</button>
            <button onClick={() => onNavigate("helplines_public")} className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">Helplines</button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("login")}>Sign In</Button>
            <Button size="sm" onClick={() => onNavigate("register")}>Get Started</Button>
          </div>

          <button
            className="md:hidden w-8 h-8 flex items-center justify-center text-[#64748B]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-3 space-y-1 slide-down">
            <button onClick={() => onNavigate("about")} className="w-full text-left px-3 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC] rounded-lg">About</button>
            <button onClick={() => onNavigate("contact")} className="w-full text-left px-3 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC] rounded-lg">Contact</button>
            <button onClick={() => onNavigate("helplines_public")} className="w-full text-left px-3 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC] rounded-lg">Helplines</button>
            <div className="pt-2 flex gap-2">
              <Button variant="outline" size="sm" fullWidth onClick={() => onNavigate("login")}>Sign In</Button>
              <Button size="sm" fullWidth onClick={() => onNavigate("register")}>Get Started</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EFF6FF] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ECFDF5] rounded-full blur-3xl opacity-40 translate-y-1/4 pointer-events-none" />

        <div className="relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFF7ED] border border-[#FED7AA] rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] blink" />
              <span className="text-xs font-semibold text-[#C2410C]">Live Emergency Support Available 24/7</span>
            </div>

            <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-extrabold text-[#0F172A] leading-[1.1] tracking-tight mb-5">
              AI-Powered Disaster{" "}
              <span className="text-[#2563EB]">Relief Coordination</span>
            </h1>

            <p className="text-base text-[#64748B] leading-relaxed mb-8 max-w-xl">
              ResQ AI connects you with verified relief camps instantly. Submit emergency requests, receive AI guidance, and track help in real-time — when you need it most.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
              <Button size="lg" onClick={() => onNavigate("register")} iconRight={<ArrowRight size={16} />}>
                Request Emergency Help
              </Button>
              <Button variant="outline" size="lg" onClick={() => onNavigate("nearby_camps")}>
                Find Nearby Camps
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-[#94A3B8]">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#059669]" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#059669]" />
                <span>Verified camps</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#059669]" />
                <span>AI assistance</span>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden lg:block relative">
            <div className="relative bg-white border border-[#E2E8F0] rounded-2xl shadow-xl overflow-hidden">
              {/* Mock app header */}
              <div className="bg-[#0F172A] px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#DC2626]/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D97706]/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#059669]/60" />
                </div>
                <div className="flex-1 mx-4 h-5 bg-white/10 rounded-full" />
              </div>

              {/* Mock map */}
              <div className="relative h-56 bg-[#EDF4ED] overflow-hidden">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
                  <rect width="300" height="200" fill="#EDF4ED" />
                  <ellipse cx="250" cy="160" rx="50" ry="35" fill="#D4E8F4" />
                  {[[20,30,60,30],[95,30,60,30],[175,30,55,30],[20,75,55,30],[95,75,65,30],[180,75,55,30],[20,120,50,25],[85,120,55,25],[160,120,55,25]].map(([x,y,w,h],i) => (
                    <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="#E8EDF0" stroke="#D4DAE0" strokeWidth="0.5" />
                  ))}
                  <path d="M 0 55 Q 150 50 300 58" stroke="white" strokeWidth="4" fill="none" />
                  <path d="M 90 0 Q 95 100 88 200" stroke="white" strokeWidth="3" fill="none" />
                  <path d="M 160 0 Q 162 100 158 200" stroke="white" strokeWidth="2" fill="none" />

                  {/* Camp markers */}
                  <circle cx="45" cy="95" r="10" fill="#2563EB" stroke="white" strokeWidth="2" />
                  <text x="45" y="99" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">A</text>

                  <circle cx="140" cy="70" r="10" fill="#059669" stroke="white" strokeWidth="2" />
                  <text x="140" y="74" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">B</text>

                  <circle cx="210" cy="110" r="10" fill="#EA580C" stroke="white" strokeWidth="2" />
                  <text x="210" y="114" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">D</text>

                  {/* User location */}
                  <circle cx="150" cy="115" r="16" fill="#2563EB" fillOpacity="0.15" />
                  <circle cx="150" cy="115" r="8" fill="#2563EB" fillOpacity="0.25" />
                  <circle cx="150" cy="115" r="5" fill="#2563EB" stroke="white" strokeWidth="2" />
                </svg>

                {/* Floating card */}
                <div className="absolute top-3 right-3 bg-white rounded-xl p-3 shadow-lg border border-[#E2E8F0] w-44">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#059669] blink" />
                    <span className="text-xs font-semibold text-[#0F172A]">Camp Alpha</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 mb-1">
                    <div className="h-1.5 rounded-full bg-[#059669]" style={{ width: "72%" }} />
                  </div>
                  <p className="text-[10px] text-[#64748B]">72% occupied · 1.2 km away</p>
                </div>
              </div>

              {/* Emergency card */}
              <div className="p-4 border-t border-[#F1F5F9]">
                <div className="flex items-center gap-3 p-3 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EA580C] flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#92400E]">Emergency #EM-2891</p>
                    <p className="text-[10px] text-[#C2410C]">Team En Route · ETA 8 min</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#EA580C] blink" />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-[#F8FAFC] rounded-lg">
                    <p className="text-[10px] text-[#94A3B8]">Status</p>
                    <p className="text-xs font-semibold text-[#334155]">En Route</p>
                  </div>
                  <div className="flex-1 p-2 bg-[#F8FAFC] rounded-lg">
                    <p className="text-[10px] text-[#94A3B8]">Camp</p>
                    <p className="text-xs font-semibold text-[#334155]">Alpha</p>
                  </div>
                  <div className="flex-1 p-2 bg-[#F8FAFC] rounded-lg">
                    <p className="text-[10px] text-[#94A3B8]">ETA</p>
                    <p className="text-xs font-semibold text-[#059669]">8 min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <Badge variant="blue" className="mb-4">Platform Features</Badge>
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-[#0F172A] mb-4 tracking-tight">
            Everything you need in a crisis
          </h2>
          <p className="text-base text-[#64748B] max-w-lg mx-auto">
            ResQ AI combines intelligent automation, verified data, and human coordination to deliver life-saving assistance faster.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-5 bg-white border border-[#E2E8F0] rounded-xl hover:border-[#CBD5E1] hover:shadow-sm transition-all duration-200 group cursor-default"
            >
              <div className={`w-9 h-9 rounded-lg ${colorMap[feature.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-2 font-[family-name:var(--font-display)]">{feature.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F8FAFC] border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F172A] mb-3 tracking-tight">
              Lives changed by ResQ AI
            </h2>
            <p className="text-sm text-[#64748B]">Illustrative stories of how ResQ AI helps people during emergencies.</p>
            <p className="text-xs text-[#94A3B8] mt-1">
              These are sample testimonials for illustration only — any resemblance of names to real people is coincidental.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                <div className="flex mb-3">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={13} className="text-[#D97706] fill-[#D97706]" />
                  ))}
                </div>
                <p className="text-sm text-[#334155] leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] text-xs font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">{t.name}</p>
                    <p className="text-[11px] text-[#94A3B8]">{t.role} · {t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Helplines preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="red" className="mb-4">Emergency Helplines</Badge>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F172A] mb-4 tracking-tight">
              Verified emergency contacts at your fingertips
            </h2>
            <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
              Access verified emergency numbers for disaster response, medical aid, police, and fire services. All numbers are verified and regularly updated.
            </p>
            <Button variant="outline" onClick={() => onNavigate("helplines_public")} iconRight={<ChevronRight size={14} />}>
              View All Helplines
            </Button>
          </div>

          <div className="space-y-3">
            {helplines.map((h, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white border border-[#E2E8F0] rounded-xl hover:border-[#CBD5E1] hover:shadow-sm transition-all group cursor-pointer" onClick={() => onNavigate("helplines_public")}>
                <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center flex-shrink-0">
                  <Phone size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0F172A]">{h.name}</p>
                  <p className="text-xs text-[#64748B] font-[family-name:var(--font-mono)]">{h.number}</p>
                </div>
                <ChevronRight size={14} className="text-[#CBD5E1] group-hover:text-[#94A3B8] group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative bg-[#0F172A] rounded-2xl p-10 md:p-14 overflow-hidden text-center">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#059669]/15 rounded-full blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full mb-6">
              <Globe size={12} className="text-white/60" />
              <span className="text-xs font-medium text-white/80">Available worldwide, 24/7</span>
            </div>

            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Be prepared. Get help fast.
            </h2>
            <p className="text-sm text-white/60 mb-8 max-w-md mx-auto">
              Register now and be ready before disaster strikes. Your emergency profile helps responders reach you faster.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-[#0F172A] hover:bg-[#F8FAFC] shadow-lg"
                onClick={() => onNavigate("register")}
                iconRight={<ArrowRight size={16} />}
              >
                Create Free Account
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10"
                onClick={() => onNavigate("login")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#2563EB] rounded-lg flex items-center justify-center">
                <HeartHandshake size={12} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
                ResQ <span className="text-[#2563EB]">AI</span>
              </span>
              <span className="text-sm text-[#94A3B8]">·</span>
              <span className="text-xs text-[#94A3B8]">Disaster Relief Coordination Platform</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-[#94A3B8]">
              <button onClick={() => onNavigate("about")} className="hover:text-[#64748B] transition-colors">About</button>
              <button onClick={() => onNavigate("contact")} className="hover:text-[#64748B] transition-colors">Contact</button>
              <button onClick={() => onNavigate("privacy")} className="hover:text-[#64748B] transition-colors">Privacy Policy</button>
              <span>© 2026 ResQ AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
