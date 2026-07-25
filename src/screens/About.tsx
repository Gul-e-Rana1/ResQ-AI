import React from "react";
import { AlertTriangle, MapPin, MessageSquare, Shield } from "lucide-react";
import { PublicPageShell } from "../components/PublicPageShell";

interface Props {
  onNavigate: (page: string) => void;
}

const pillars = [
  {
    icon: <AlertTriangle size={16} className="text-[#DC2626]" />,
    title: "Fast emergency reporting",
    text: "Residents can submit a disaster or emergency request in minutes, with their location and situation shared instantly with the nearest relief camp.",
  },
  {
    icon: <MapPin size={16} className="text-[#2563EB]" />,
    title: "Real relief camp coordination",
    text: "Relief camps register with real capacity, supplies, and service coverage, so requests are matched by disaster type, remaining capacity, and distance — not just proximity.",
  },
  {
    icon: <MessageSquare size={16} className="text-[#7C3AED]" />,
    title: "AI-assisted guidance",
    text: "An AI assistant helps detect disaster type, urgency, and language, and gives safety guidance while help is on the way — and stays focused strictly on disaster-related help.",
  },
  {
    icon: <Shield size={16} className="text-[#059669]" />,
    title: "Verified, role-based access",
    text: "Relief camps are reviewed and approved by ResQ AI administrators before they can accept emergencies, and every status change is tracked from submission to resolution.",
  },
];

export default function About({ onNavigate }: Props) {
  return (
    <PublicPageShell
      onNavigate={onNavigate}
      title="About ResQ AI"
      subtitle="A disaster relief coordination platform built for Pakistan."
    >
      <div className="space-y-6 text-sm text-[#334155] leading-relaxed">
        <p>
          ResQ AI connects people affected by floods, earthquakes, storms, and other emergencies with verified
          relief camps across Pakistan. Our goal is to remove the delay and confusion that follows a disaster —
          getting the right help to the right place as fast as possible.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {pillars.map((p) => (
            <div key={p.title} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center mb-2.5">
                {p.icon}
              </div>
              <p className="text-sm font-semibold text-[#0F172A] mb-1">{p.title}</p>
              <p className="text-xs text-[#64748B] leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>

        <p>
          The platform serves four roles: residents who need help, camp managers who run relief camps, camp
          helpers who support day-to-day operations, and administrators who approve camps and oversee the system.
          Every emergency, camp, and status update on ResQ AI is real data — there is no simulated or demo content
          in the production experience.
        </p>

        <p>
          For an urgent, life-threatening emergency, always call a national emergency helpline first — see our{" "}
          <button onClick={() => onNavigate("helplines_public")} className="text-[#2563EB] font-medium hover:underline">
            Emergency Helplines
          </button>{" "}
          page for verified numbers across Pakistan.
        </p>
      </div>
    </PublicPageShell>
  );
}
