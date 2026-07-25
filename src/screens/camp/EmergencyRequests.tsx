"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle, MapPin, Clock, Users, Check, X, Eye
} from "lucide-react";
import {
  Card, Badge, StatusChip, Button, SearchInput, Select, Tabs,
  Modal, EmptyState
} from "../../components/ui";
import { EmergencyTimeline } from "../../components/EmergencyTimeline";
import { useMyCamp } from "@/hooks/useMyCamp";
import { useRealtimeEmergencies } from "@/hooks/useRealtimeEmergencies";
import { useAuth } from "@/providers/AuthProvider";
import { updateEmergencyStatus, type EmergencyRecord } from "@/lib/services/emergencies";
import type { EmergencyStatus } from "@/types/domain";

const priorityConfig: Record<string, string> = {
  critical: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
  high: "bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]",
  medium: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
  low: "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]",
};

const PENDING_STATUSES: EmergencyStatus[] = ["Submitted", "Assigned"];
const ACTIVE_STATUSES: EmergencyStatus[] = ["Accepted", "En Route", "Arrived"];

function toStatusSlug(status: EmergencyStatus) {
  return status.toLowerCase().replace(" ", "_") as
    | "submitted" | "assigned" | "accepted" | "en_route" | "arrived" | "resolved" | "cancelled";
}

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  return `${Math.floor(diffHr / 24)} day ago`;
}

function requesterLabel(em: EmergencyRecord) {
  return em.profiles?.full_name || `Requester #${em.requester_id.slice(0, 8)}`;
}

interface Props {
  onNavigate: (page: string, id?: string) => void;
  initialEmergencyId?: string;
}

export default function EmergencyRequests({ onNavigate, initialEmergencyId }: Props) {
  const { user } = useAuth();
  const { data: myCamp } = useMyCamp();
  const { data: emergencies = [] } = useRealtimeEmergencies({
    assignedCampId: myCamp?.id,
    enabled: !!myCamp?.id,
  });

  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<EmergencyRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const handledInitialId = useRef<string | null>(null);

  useEffect(() => {
    if (!initialEmergencyId || emergencies.length === 0) return;
    if (handledInitialId.current === initialEmergencyId) return;

    const match = emergencies.find((em) => em.id === initialEmergencyId);
    if (!match) return;

    handledInitialId.current = initialEmergencyId;
    setActiveTab("all");
    setSelected(match);
    setDetailOpen(true);

    requestAnimationFrame(() => {
      rowRefs.current[match.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [initialEmergencyId, emergencies]);

  const tabs = [
    { id: "pending", label: "Pending", count: emergencies.filter((r) => PENDING_STATUSES.includes(r.status)).length },
    { id: "active", label: "Active", count: emergencies.filter((r) => ACTIVE_STATUSES.includes(r.status)).length },
    { id: "resolved", label: "Resolved", count: emergencies.filter((r) => r.status === "Resolved").length },
    { id: "all", label: "All", count: emergencies.length },
  ];

  const filtered = emergencies.filter((r) => {
    if (activeTab === "pending" && !PENDING_STATUSES.includes(r.status)) return false;
    if (activeTab === "active" && !ACTIVE_STATUSES.includes(r.status)) return false;
    if (activeTab === "resolved" && r.status !== "Resolved") return false;

    if (priorityFilter !== "all" && r.urgency.toLowerCase() !== priorityFilter) return false;
    if (typeFilter !== "all" && r.disaster_type !== typeFilter) return false;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = `${r.title} ${r.description} ${r.address || ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const runStatusUpdate = async (emergencyId: string, status: EmergencyStatus, note?: string) => {
    setUpdatingId(emergencyId);
    try {
      await updateEmergencyStatus({ emergencyId, status, performedBy: user?.id, note });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-5 md:p-6 space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">Emergency Requests</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{myCamp?.name || "My Camp"} · Manage incoming requests</p>
        </div>
        <Badge variant="red" dot>{emergencies.filter((r) => r.status === "Submitted").length} new</Badge>
      </div>

      <Card padding="none">
        <div className="px-5 pt-4 pb-3 flex flex-wrap gap-2">
          <SearchInput
            placeholder="Search requests..."
            className="w-56"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            options={[
              { value: "all", label: "All Priorities" },
              { value: "critical", label: "Critical" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
            className="w-36"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          />
          <Select
            options={[
              { value: "all", label: "All Types" },
              { value: "flood", label: "Flood" },
              { value: "earthquake", label: "Earthquake" },
              { value: "wildfire", label: "Wildfire" },
              { value: "landslide", label: "Landslide" },
              { value: "storm", label: "Storm" },
              { value: "medical", label: "Medical" },
              { value: "other", label: "Other" },
            ]}
            className="w-36"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
        </div>

        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="px-5" />

        {filtered.length === 0 ? (
          <EmptyState icon={<AlertTriangle size={20} />} title="No requests" description="No emergency requests in this category." />
        ) : (
          <div className="divide-y divide-[#F8FAFC]">
            {filtered.map((req) => {
              const priority = req.urgency.toLowerCase();
              const pColor = priorityConfig[priority] || priorityConfig.low;
              const statusSlug = toStatusSlug(req.status);
              const isUpdating = updatingId === req.id;
              return (
                <div
                  key={req.id}
                  ref={(el) => { rowRefs.current[req.id] = el; }}
                  className="px-5 py-4 hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${pColor}`}>
                      <AlertTriangle size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-[#94A3B8] font-[family-name:var(--font-mono)]">#{req.id.slice(0, 8)}</span>
                            <span className="text-sm font-semibold text-[#0F172A]">{req.disaster_type.toUpperCase()}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${pColor}`}>{priority}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-[#64748B]">{requesterLabel(req)}</span>
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1"><MapPin size={10} />{req.address || `${req.district}, ${req.province}`}</span>
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1"><Users size={10} />{req.people_count} people</span>
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1"><Clock size={10} />{timeAgo(req.created_at)}</span>
                          </div>
                          <p className="text-xs text-[#64748B] mt-1 line-clamp-1">{req.description}</p>
                        </div>
                        <StatusChip status={statusSlug} />
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {PENDING_STATUSES.includes(req.status) && (
                          <>
                            <Button
                              size="xs"
                              variant="success"
                              icon={<Check size={10} />}
                              disabled={isUpdating}
                              onClick={() => runStatusUpdate(req.id, "Accepted")}
                            >
                              Accept
                            </Button>
                            <Button
                              size="xs"
                              variant="danger"
                              icon={<X size={10} />}
                              disabled={isUpdating}
                              onClick={() => runStatusUpdate(req.id, "Cancelled", "Declined by camp")}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {req.status === "Accepted" && (
                          <Button
                            size="xs"
                            variant="primary"
                            icon={<MapPin size={10} />}
                            disabled={isUpdating}
                            onClick={() => runStatusUpdate(req.id, "En Route")}
                          >
                            Mark En Route
                          </Button>
                        )}
                        {req.status === "Arrived" && (
                          <Button
                            size="xs"
                            variant="success"
                            icon={<Check size={10} />}
                            disabled={isUpdating}
                            onClick={() => runStatusUpdate(req.id, "Resolved")}
                          >
                            Mark Resolved
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="outline"
                          icon={<Eye size={10} />}
                          onClick={() => { setSelected(req); setDetailOpen(true); }}
                        >
                          Details
                        </Button>
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
          title={`Emergency #${selected.id.slice(0, 8)}`}
          size="lg"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setDetailOpen(false)}>Close</Button>
              {PENDING_STATUSES.includes(selected.status) && (
                <Button
                  variant="success"
                  size="sm"
                  icon={<Check size={13} />}
                  disabled={updatingId === selected.id}
                  onClick={async () => {
                    await runStatusUpdate(selected.id, "Accepted");
                    setDetailOpen(false);
                  }}
                >
                  Accept Request
                </Button>
              )}
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Requester", value: requesterLabel(selected) },
                { label: "Location", value: selected.address || `${selected.district}, ${selected.province}` },
                { label: "People", value: `${selected.people_count} persons` },
                { label: "Type", value: selected.disaster_type.toUpperCase() },
                { label: "Priority", value: selected.urgency.charAt(0) + selected.urgency.slice(1).toLowerCase() },
                { label: "Status", value: selected.status },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide">{item.label}</p>
                  <p className="text-sm font-medium text-[#334155] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide mb-1.5">Description</p>
              <p className="text-sm text-[#334155] leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-[#F1F5F9]">{selected.description}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide mb-3">Response Timeline</p>
              <EmergencyTimeline currentStatus={toStatusSlug(selected.status)} compact />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
