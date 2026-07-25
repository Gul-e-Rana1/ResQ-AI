import React from "react";
import { Mail, Phone, AlertTriangle, Building2 } from "lucide-react";
import { PublicPageShell } from "../components/PublicPageShell";
import { Alert, Button } from "../components/ui";
import { PAKISTAN_EMERGENCY_HELPLINES } from "@/lib/constants/pakistan";

interface Props {
  onNavigate: (page: string) => void;
}

const SUPPORT_EMAIL = "admin.resq.ai@gmail.com";

export default function Contact({ onNavigate }: Props) {
  const primaryHelpline = PAKISTAN_EMERGENCY_HELPLINES[0];

  return (
    <PublicPageShell
      onNavigate={onNavigate}
      title="Contact Us"
      subtitle="Reach the ResQ AI team, or get help immediately in an emergency."
    >
      <div className="space-y-6">
        <Alert type="error" title="In an active emergency?">
          Don't wait for a reply here — call {primaryHelpline.name} at{" "}
          <span className="font-semibold">{primaryHelpline.phone}</span> immediately, or{" "}
          <button onClick={() => onNavigate("register")} className="font-semibold underline">
            sign up
          </button>{" "}
          to submit a request through ResQ AI.
        </Alert>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center mb-2.5">
              <Mail size={14} className="text-[#2563EB]" />
            </div>
            <p className="text-sm font-semibold text-[#0F172A] mb-1">Email Support</p>
            <p className="text-xs text-[#64748B] mb-2">
              For non-emergency questions, partnership inquiries, or issues with the platform.
            </p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm text-[#2563EB] font-medium hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div className="p-4 rounded-xl border border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center mb-2.5">
              <Phone size={14} className="text-[#059669]" />
            </div>
            <p className="text-sm font-semibold text-[#0F172A] mb-1">Emergency Helplines</p>
            <p className="text-xs text-[#64748B] mb-2">
              For life-threatening emergencies, always use a national emergency number, not email.
            </p>
            <button onClick={() => onNavigate("helplines_public")} className="text-sm text-[#2563EB] font-medium hover:underline">
              View all helplines
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center flex-shrink-0">
              <Building2 size={14} className="text-[#7C3AED]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A] mb-1">Registering a relief camp?</p>
              <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                Camp managers can register their relief camp directly after creating an account — no need to email
                us first. Your camp will be reviewed by an admin before it can accept emergencies.
              </p>
              <Button size="sm" variant="outline" onClick={() => onNavigate("register")}>
                Register as a Camp Manager
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8] flex items-start gap-1.5">
          <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
          ResQ AI is a coordination platform and does not dispatch emergency services directly — always contact
          official emergency numbers for immediate, life-threatening situations.
        </p>
      </div>
    </PublicPageShell>
  );
}
