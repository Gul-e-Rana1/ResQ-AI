import React, { useState } from "react";
import { Phone, Shield, AlertTriangle, Heart, Flame, HeartHandshake, Baby, MapPin } from "lucide-react";
import { Card, SearchInput } from "../../components/ui";
import { PAKISTAN_EMERGENCY_HELPLINES } from "@/lib/constants/pakistan";

const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; color: string }> = {
  "Rescue & Disaster Response": { icon: <AlertTriangle size={16} />, color: "bg-[#FEF2F2] text-[#DC2626]" },
  "Medical Emergency": { icon: <Heart size={16} />, color: "bg-[#FFF7ED] text-[#EA580C]" },
  "Police & Safety": { icon: <Shield size={16} />, color: "bg-[#EFF6FF] text-[#2563EB]" },
  "Fire Brigade": { icon: <Flame size={16} />, color: "bg-[#FFF7ED] text-[#EA580C]" },
  "Women Helpline": { icon: <HeartHandshake size={16} />, color: "bg-[#F5F3FF] text-[#7C3AED]" },
  "Child Protection": { icon: <Baby size={16} />, color: "bg-[#ECFDF5] text-[#059669]" },
};

const categoryOrder = [
  "Rescue & Disaster Response",
  "Medical Emergency",
  "Police & Safety",
  "Fire Brigade",
  "Women Helpline",
  "Child Protection",
];

const helplines = categoryOrder
  .map((category) => ({
    category,
    icon: CATEGORY_STYLES[category].icon,
    color: CATEGORY_STYLES[category].color,
    numbers: PAKISTAN_EMERGENCY_HELPLINES.filter((h) => h.category === category),
  }))
  .filter((cat) => cat.numbers.length > 0);

export default function Helplines() {
  const [search, setSearch] = useState("");

  const filtered = helplines.map((cat) => ({
    ...cat,
    numbers: cat.numbers.filter(
      (n) =>
        search === "" ||
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        n.phone.includes(search)
    ),
  })).filter((cat) => cat.numbers.length > 0);

  return (
    <div className="p-5 md:p-6 max-w-3xl space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">Emergency Helplines</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Verified emergency contacts — always keep these accessible</p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl">
        <AlertTriangle size={14} className="text-[#EA580C] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#C2410C]">
          <strong>In immediate danger?</strong> Call 1122 (Rescue) or 115 (Edhi Ambulance) immediately. These are toll-free numbers available 24/7.
        </p>
      </div>

      <SearchInput
        placeholder="Search helplines..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="space-y-5">
        {filtered.map((cat) => (
          <Card padding="none" key={cat.category}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F5F9]">
              <div className={`w-7 h-7 rounded-lg ${cat.color} flex items-center justify-center`}>
                {cat.icon}
              </div>
              <h2 className="text-sm font-semibold text-[#0F172A]">{cat.category}</h2>
            </div>
            <div className="divide-y divide-[#F8FAFC]">
              {cat.numbers.map((n, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                    <Phone size={14} className="text-[#64748B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A]">{n.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-sm font-semibold text-[#2563EB] font-[family-name:var(--font-mono)]">{n.phone}</span>
                      <span className="text-[11px] text-[#94A3B8]">·</span>
                      <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                        <MapPin size={9} /> {n.scope}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${n.phone.replace(/\s/g, "")}`}
                      className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] flex items-center justify-center transition-colors"
                    >
                      <Phone size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
