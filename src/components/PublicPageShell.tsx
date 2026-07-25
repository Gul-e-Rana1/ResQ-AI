import React from "react";
import { HeartHandshake, ArrowLeft } from "lucide-react";
import { Button } from "./ui";

interface PublicPageShellProps {
  onNavigate: (page: string) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function PublicPageShell({ onNavigate, title, subtitle, children }: PublicPageShellProps) {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-sans)]">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => onNavigate("landing")} className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <HeartHandshake size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-[#0F172A] font-[family-name:var(--font-display)] tracking-tight">
              ResQ<span className="text-[#2563EB]"> AI</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("login")}>Sign In</Button>
            <Button size="sm" onClick={() => onNavigate("register")}>Get Started</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to home
        </button>

        <h1 className="text-2xl font-bold text-[#0F172A] font-[family-name:var(--font-display)] mb-2">{title}</h1>
        {subtitle && <p className="text-sm text-[#64748B] mb-8">{subtitle}</p>}

        <div className="prose-content">{children}</div>
      </div>

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
