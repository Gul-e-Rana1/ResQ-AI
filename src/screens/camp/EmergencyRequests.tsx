import React, { useState } from "react";
import {
  AlertTriangle, Filter, ChevronRight, MapPin, Clock, Users, Check, X,
  Eye, MessageSquare
} from "lucide-react";
import {
  Card, Badge, StatusChip, Button, SearchInput, Select, Tabs, Pagination,
  Modal, Textarea, EmptyState
} from "../../components/ui";
import { EmergencyTimeline } from "../../components/EmergencyTimeline";

const requests = [
  { id: "EM-2891", type: "Flood Evacuation", user: "Sarah Johnson", phone: "+91 98765 43210", location: "Sector 14, New Delhi", priority: "high", status: "submitted" as const, time: "2 min ago", people: 4, desc: "Flash flooding, water rising, 4 adults including 1 elderly." },
  { id: "EM-2893", type: "Medical Emergency", user: "Vikram Patel", phone: "+91 87654 32109", location: "Rohini Block B", priority: "critical", status: "assigned" as const, time: "5 min ago", people: 2, desc: "Elderly person with chest pain, cannot move. Need medical team urgently." },
  { id: "EM-2894", type: "Food & Shelter", user: "Meera Sharma", phone: "+91 76543 21098", location: "Dwarka Sector 6", priority: "medium", status: "accepted" as const, time: "12 min ago", people: 6, desc: "Family of 6 displaced by floods. Need shelter and food for tonight." },
  { id: "EM-2895", type: "Structural Damage", user: "Arjun Singh", phone: "+91 65432 10987", location: "Janakpuri, Block C", priority: "high", status: "en_route" as const, time: "18 min ago", people: 3, desc: "Roof partially collapsed. 3 persons inside, all safe but cannot exit." },
  { id: "EM-2887", type: "Flood Evacuation", user: "Ritu Gupta", phone: "+91 54321 09876", location: "Mayur Vihar Phase 2", priority: "medium", status: "arrived" as const, time: "32 min ago", people: 5, desc: "Ground floor submerged. 5 family members on first floor." },
  { id: "EM-2881", type: "Medical Emergency", user: "Suresh Kumar", phone: "+91 43210 98765", location: "Laxmi Nagar", priority: "high", status: "resolved" as const, time: "1 hr ago", people: 1, desc: "Elderly diabetic patient needing insulin and medical care." },
];

const priorityConfig = {
  critical: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
  high: "bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]",
  medium: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
  low: "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]",
};

interface Props {
  onNavigate: (page: string) => void;
}

export default function EmergencyRequests({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState("pending");
  const [selected, setSelected] = useState<typeof requests[0] | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const tabs = [
    { id: "pending", label: "Pending", count: requests.filter(r => ["submitted", "assigned"].includes(r.status)).length },
    { id: "active", label: "Active", count: requests.filter(r => ["accepted", "en_route", "arrived"].includes(r.status)).length },
    { id: "resolved", label: "Resolved", count: requests.filter(r => r.status === "resolved").length },
    { id: "all", label: "All", count: requests.length },
  ];

  const filtered = requests.filter((r) => {
    if (activeTab === "pending") return ["submitted", "assigned"].includes(r.status);
    if (activeTab === "active") return ["accepted", "en_route", "arrived"].includes(r.status);
    if (activeTab === "resolved") return r.status === "resolved";
    return true;
  });

  return (
    <div className="p-5 md:p-6 space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">Emergency Requests</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Camp Alpha · Manage incoming requests</p>
        </div>
        <Badge variant="red" dot>{requests.filter(r => r.status === "submitted").length} new</Badge>
      </div>

      <Card padding="none">
        <div className="px-5 pt-4 pb-3 flex flex-wrap gap-2">
          <SearchInput placeholder="Search requests..." className="w-56" />
          <Select
            options={[{ value: "all", label: "All Priorities" }, { value: "critical", label: "Critical" }, { value: "high", label: "High" }]}
            className="w-36"
          />
          <Select
            options={[{ value: "all", label: "All Types" }, { value: "flood", label: "Flood" }, { value: "medical", label: "Medical" }]}
            className="w-36"
          />
        </div>

        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="px-5" />

        {filtered.length === 0 ? (
          <EmptyState icon={<AlertTriangle size={20} />} title="No requests" description="No emergency requests in this category." />
        ) : (
          <div className="divide-y divide-[#F8FAFC]">
            {filtered.map((req) => {
              const pColor = priorityConfig[req.priority as keyof typeof priorityConfig];
              return (
                <div key={req.id} className="px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${pColor}`}>
                      <AlertTriangle size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-[#94A3B8] font-[family-name:var(--font-mono)]">#{req.id}</span>
                            <span className="text-sm font-semibold text-[#0F172A]">{req.type}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${pColor}`}>{req.priority}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-[#64748B]">{req.user}</span>
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1"><MapPin size={10} />{req.location}</span>
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1"><Users size={10} />{req.people} people</span>
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1"><Clock size={10} />{req.time}</span>
                          </div>
                          <p className="text-xs text-[#64748B] mt-1 line-clamp-1">{req.desc}</p>
                        </div>
                        <StatusChip status={req.status} />
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {req.status === "submitted" && (
                          <>
                            <Button size="xs" variant="success" icon={<Check size={10} />}>Accept</Button>
                            <Button size="xs" variant="danger" icon={<X size={10} />}>Decline</Button>
                          </>
                        )}
                        {req.status === "accepted" && (
                          <Button size="xs" variant="primary" icon={<MapPin size={10} />}>Mark En Route</Button>
                        )}
                        {req.status === "arrived" && (
                          <Button size="xs" variant="success" icon={<Check size={10} />}>Mark Resolved</Button>
                        )}
                        <Button
                          size="xs"
                          variant="outline"
                          icon={<Eye size={10} />}
                          onClick={() => { setSelected(req); setDetailOpen(true); }}
                        >
                          Details
                        </Button>
                        <Button size="xs" variant="ghost" icon={<MessageSquare size={10} />}>Message</Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Detail modal */}
      {selected && (
        <Modal
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          title={`Emergency #${selected.id}`}
          size="lg"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setDetailOpen(false)}>Close</Button>
              {selected.status === "submitted" && (
                <Button variant="success" size="sm" onClick={() => setDetailOpen(false)} icon={<Check size={13} />}>
                  Accept Request
                </Button>
              )}
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Requester", value: selected.user },
                { label: "Phone", value: selected.phone },
                { label: "Location", value: selected.location },
                { label: "People", value: `${selected.people} persons` },
                { label: "Type", value: selected.type },
                { label: "Priority", value: selected.priority.charAt(0).toUpperCase() + selected.priority.slice(1) },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide">{item.label}</p>
                  <p className="text-sm font-medium text-[#334155] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide mb-1.5">Description</p>
              <p className="text-sm text-[#334155] leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-[#F1F5F9]">{selected.desc}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide mb-3">Response Timeline</p>
              <EmergencyTimeline currentStatus={selected.status} compact />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
