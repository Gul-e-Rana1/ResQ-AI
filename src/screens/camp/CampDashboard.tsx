"use client";
import React from "react";
import {
  AlertTriangle, Users, CheckCircle, Activity, ChevronRight, Phone
} from "lucide-react";
import { Card, StatCard, Badge, Button, Avatar } from "../../components/ui";
import { useQuery } from "@tanstack/react-query";
import { useMyCamp } from "@/hooks/useMyCamp";
import { useRealtimeEmergencies } from "@/hooks/useRealtimeEmergencies";
import { useAuth } from "@/providers/AuthProvider";
import { fetchCampTeamMembers } from "@/lib/services/campTeam";
import { updateEmergencyStatus, type EmergencyRecord } from "@/lib/services/emergencies";

const priorityColors: Record<string, string> = {
  critical: "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]",
  high: "text-[#EA580C] bg-[#FFF7ED] border-[#FED7AA]",
  medium: "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]",
  low: "text-[#64748B] bg-[#F8FAFC] border-[#E2E8F0]",
};

const PENDING_STATUSES = new Set(["Submitted", "Assigned"]);

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
}

export default function CampDashboard({ onNavigate }: Props) {
  const { user } = useAuth();
  const { data: myCamp } = useMyCamp();

  const { data: dbEmergencies = [] } = useRealtimeEmergencies({
    assignedCampId: myCamp?.id,
    enabled: !!myCamp?.id,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["camp-team", myCamp?.id],
    queryFn: () => fetchCampTeamMembers(myCamp!.id),
    enabled: !!myCamp?.id,
  });

  const pendingRequests = dbEmergencies
    .filter((em) => PENDING_STATUSES.has(em.status))
    .slice(0, 5);

  const activeRequestsCount = dbEmergencies.filter((em) =>
    ["Submitted", "Assigned", "Accepted", "En Route", "Arrived"].includes(em.status),
  ).length;

  const occupied = myCamp ? myCamp.capacity_total - myCamp.capacity_available : 0;

  const handleAccept = async (emergencyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateEmergencyStatus({ emergencyId, status: "Accepted", performedBy: user?.id });
  };

  return (
    <div className="p-5 md:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
            {myCamp?.name || "Camp Operations"}
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#059669] blink inline-block" />
            {myCamp?.status === "approved" ? "Active" : myCamp?.status || "—"} · {myCamp?.address || "No address on file"} ·{" "}
            {myCamp ? `${occupied}/${myCamp.capacity_total} occupied` : "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Phone size={13} />}>Camp Line</Button>
          <Button size="sm" onClick={() => onNavigate("camp_emergency_requests")} icon={<AlertTriangle size={13} />}>
            View Requests
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Capacity" value={myCamp?.capacity_total ?? "—"} change={myCamp ? `${occupied} occupied` : undefined} changeType="neutral" icon={<Users size={16} />} color="blue" />
        <StatCard label="Available Spots" value={myCamp?.capacity_available ?? "—"} changeType="neutral" icon={<CheckCircle size={16} />} color="green" />
        <StatCard label="Active Requests" value={activeRequestsCount} change={`${pendingRequests.length} pending`} changeType="neutral" icon={<AlertTriangle size={16} />} color="orange" />
        <StatCard label="Team Members" value={teamMembers.length} changeType="neutral" icon={<Activity size={16} />} color="purple" />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Pending requests */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#0F172A]">Pending Requests</h2>
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              </div>
              <button
                onClick={() => onNavigate("camp_emergency_requests")}
                className="text-xs text-[#2563EB] hover:underline font-medium flex items-center gap-1"
              >
                View all <ChevronRight size={12} />
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[#94A3B8]">No pending requests right now.</p>
            ) : (
              <div className="divide-y divide-[#F8FAFC]">
                {pendingRequests.map((em) => {
                  const priority = em.urgency.toLowerCase();
                  const pColors = priorityColors[priority] || priorityColors.low;
                  return (
                    <div
                      key={em.id}
                      className="flex items-start gap-3 px-5 py-4 hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                      onClick={() => onNavigate("camp_emergency_details", em.id)}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border text-sm ${pColors}`}>
                        <AlertTriangle size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-[#94A3B8] font-[family-name:var(--font-mono)]">#{em.id.slice(0, 8)}</span>
                              <span className="text-sm font-semibold text-[#0F172A]">{em.disaster_type.toUpperCase()}</span>
                            </div>
                            <p className="text-xs text-[#64748B] mt-0.5">
                              {requesterLabel(em)} · {em.address || `${em.district}, ${em.province}`} · {em.people_count} people
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[11px] text-[#94A3B8]">{timeAgo(em.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="xs" variant="success" onClick={(e) => handleAccept(em.id, e)}>Accept</Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); onNavigate("camp_emergency_details", em.id); }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Team status */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0F172A]">Team</h2>
              <button
                onClick={() => onNavigate("camp_team")}
                className="text-xs text-[#2563EB] font-medium hover:underline"
              >
                Manage
              </button>
            </div>
            {teamMembers.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No team members added yet.</p>
            ) : (
              <div className="space-y-3">
                {teamMembers.slice(0, 6).map((m) => {
                  const name = m.profiles?.full_name || m.profiles?.email || "Team member";
                  return (
                    <div key={m.id} className="flex items-center gap-2.5">
                      <Avatar name={name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0F172A] truncate">{name}</p>
                        <p className="text-[11px] text-[#94A3B8]">{m.title}</p>
                      </div>
                      {m.can_respond_emergencies && (
                        <Badge variant="green" dot>Responder</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
