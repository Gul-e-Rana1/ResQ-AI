import React from "react";
import { PublicPageShell } from "../components/PublicPageShell";

interface Props {
  onNavigate: (page: string) => void;
}

const sections = [
  {
    title: "What we collect",
    body: [
      "Account details you provide at signup: full name, email, phone number, and general location (province/district/city).",
      "Emergency requests you submit: disaster type, urgency, description, address, and — only if you grant permission — your device's GPS coordinates.",
      "Relief camp information submitted by camp managers: camp name, address, coordinates, capacity, supplies, and contact details.",
      "Messages you send to the ResQ AI assistant, used to detect disaster type, urgency, and language so we can route your request and provide guidance.",
    ],
  },
  {
    title: "How we use it",
    body: [
      "To match your emergency request with the nearest suitable relief camp based on disaster type, capacity, and distance.",
      "To notify camp managers and administrators of new or updated emergencies so they can respond.",
      "To show you the real-time status of your emergency and the camps near you.",
      "We do not sell your data, and we do not use it for advertising.",
    ],
  },
  {
    title: "Who can see your information",
    body: [
      "Your emergency details are visible to your assigned relief camp's team and to ResQ AI administrators.",
      "Other residents cannot see your personal information or the emergencies you've submitted.",
      "Camp managers can see the team members and supplies for their own camp only.",
    ],
  },
  {
    title: "Location data",
    body: [
      "Location is only captured when you explicitly use a \"detect location\" action in the app — we never track your location in the background.",
      "Location you share is used solely to match you to nearby relief camps and to help responders find you during an active emergency.",
    ],
  },
  {
    title: "Data retention & your rights",
    body: [
      "You can update your profile information at any time from your account settings.",
      "You can request account deletion by contacting us — see the Contact page.",
      "Emergency and camp records may be retained for coordination and safety-audit purposes even after an emergency is resolved.",
    ],
  },
];

export default function Privacy({ onNavigate }: Props) {
  return (
    <PublicPageShell
      onNavigate={onNavigate}
      title="Privacy Policy"
      subtitle="Last updated July 2026. This describes what ResQ AI collects and how it's used."
    >
      <div className="space-y-6">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-2">{s.title}</h2>
            <ul className="space-y-1.5">
              {s.body.map((line, i) => (
                <li key={i} className="text-sm text-[#64748B] leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#CBD5E1]">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="text-xs text-[#94A3B8] pt-2 border-t border-[#F1F5F9]">
          Questions about this policy or your data? Reach us from the{" "}
          <button onClick={() => onNavigate("contact")} className="text-[#2563EB] hover:underline">
            Contact page
          </button>
          .
        </p>
      </div>
    </PublicPageShell>
  );
}
