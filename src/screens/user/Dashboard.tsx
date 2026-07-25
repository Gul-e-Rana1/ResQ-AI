import React, { useMemo, useState } from "react";
import {
  AlertTriangle, MapPin, MessageSquare, CheckCircle, Activity,
  ArrowRight, Phone, ChevronRight, Shield
} from "lucide-react";
import { Card, StatCard, Badge, StatusChip, Button, Alert } from "../../components/ui";
import { MapView, type MapCamp } from "../../components/MapView";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useAuth } from "@/providers/AuthProvider";
import { useRealtimeEmergencies } from "@/hooks/useRealtimeEmergencies";
import { useRealtimeCamps } from "@/hooks/useRealtimeCamps";
import type { EmergencyRecord } from "@/lib/services/emergencies";
import type { EmergencyStatus } from "@/types/domain";

const quickActions = [
  { label: "Create Emergency", icon: <AlertTriangle size={16} />, page: "create_emergency", color: "bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FECACA]" },
  { label: "AI Assistant", icon: <MessageSquare size={16} />, page: "ai_chat", color: "bg-[#F5F3FF] text-[#7C3AED] hover:bg-[#DDD6FE]" },
  { label: "Find Camps", icon: <MapPin size={16} />, page: "nearby_camps", color: "bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]" },
  { label: "Helplines", icon: <Phone size={16} />, page: "helplines", color: "bg-[#FFF7ED] text-[#EA580C] hover:bg-[#FED7AA]" },
];

const ACTIVE_ALERT_STATUSES: EmergencyStatus[] = ["Assigned", "Accepted", "En Route", "Arrived"];

function toStatusChipValue(status: EmergencyStatus) {
  switch (status) {
    case "Submitted": return "submitted" as const;
    case "Assigned": return "assigned" as const;
    case "Accepted": return "accepted" as const;
    case "En Route": return "en_route" as const;
    case "Arrived": return "arrived" as const;
    case "Resolved": return "resolved" as const;
    case "Cancelled": return "cancelled" as const;
    default: return "submitted" as const;
  }
}

function priorityFromUrgency(urgency: string): "low" | "medium" | "high" | "critical" {
  const lower = urgency.toLowerCase();
  if (lower === "critical" || lower === "high" || lower === "low") return lower;
  return "medium";
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === today.toDateString()) return `Today, ${timeStr}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${timeStr}`;
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeStr}`;
}

function buildActivityData(emergencies: EmergencyRecord[]) {
  const days: { day: string; date: string; emergencies: number; resolved: number }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.toISOString().slice(0, 10),
      emergencies: 0,
      resolved: 0,
    });
  }
  emergencies.forEach((em) => {
    const created = em.created_at?.slice(0, 10);
    const bucket = days.find((d) => d.date === created);
    if (!bucket) return;
    bucket.emergencies += 1;
    if (em.status === "Resolved") bucket.resolved += 1;
  });
  return days;
}

interface Props {
  onNavigate: (page: string, id?: string) => void;
}

export default function UserDashboard({ onNavigate }: Props) {
  const [showAlert, setShowAlert] = useState(true);
  const { user, profile } = useAuth();

  const { data: emergencies = [] } = useRealtimeEmergencies({
    requesterId: user?.id,
    enabled: !!user?.id,
  });
  const { data: camps = [] } = useRealtimeCamps({ status: "approved", acceptingOnly: true });

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "there";
  const locationLabel =
    [profile?.city, profile?.district].filter(Boolean).join(", ") || profile?.province || "Your area";

  const totalRequests = emergencies.length;
  const resolvedCount = emergencies.filter((em) => em.status === "Resolved").length;
  const activeCount = emergencies.filter((em) => em.status !== "Resolved" && em.status !== "Cancelled").length;
  const resolveRate = totalRequests > 0 ? Math.round((resolvedCount / totalRequests) * 100) : 0;
  const thisMonthCount = emergencies.filter((em) => {
    const d = new Date(em.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const activeAlertEmergency = emergencies.find((em) => ACTIVE_ALERT_STATUSES.includes(em.status));
  const recentEmergencies = emergencies.slice(0, 5);
  const nearbyCamps = camps.slice(0, 3);
  const activityData = useMemo(() => buildActivityData(emergencies), [emergencies]);

  const mapCamps: MapCamp[] = nearbyCamps.map((camp) => ({
    id: camp.id,
    name: camp.name,
    latitude: camp.latitude,
    longitude: camp.longitude,
    capacity: camp.capacity_total,
    occupied: Math.max(0, camp.capacity_total - camp.capacity_available),
    status: camp.capacity_available === 0 ? "full" : "active",
    address: camp.address,
    type: "primary",
  }));

  return (
    <div className="p-5 md:p-6 space-y-6 max-w-7xl">
      {/* Active emergency alert */}
      {showAlert && activeAlertEmergency && (
        <Alert
          type="warning"
          title="Active Emergency Update"
          onClose={() => setShowAlert(false)}
        >
          Emergency #{activeAlertEmergency.id.slice(0, 8).toUpperCase()}
          {activeAlertEmergency.relief_camps?.name
            ? ` — ${activeAlertEmergency.relief_camps.name} is responding.`
            : " is being processed."}{" "}
          <button
            onClick={() => onNavigate("emergency_details", activeAlertEmergency.id)}
            className="text-[#92400E] underline font-semibold"
          >
            Track now
          </button>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
            Good morning, {displayName} 👋
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            {locationLabel} · <span className="text-[#059669] font-medium">{camps.length} camps nearby</span>
          </p>
        </div>
        <Button size="sm" onClick={() => onNavigate("create_emergency")} icon={<AlertTriangle size={14} />}>
          Emergency
        </Button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.page}
            onClick={() => onNavigate(action.page)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:shadow-sm transition-all group text-center`}
          >
            <div className={`w-9 h-9 rounded-xl ${action.color} flex items-center justify-center transition-colors`}>
              {action.icon}
            </div>
            <span className="text-xs font-medium text-[#334155]">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Requests"
          value={totalRequests}
          change={`${thisMonthCount} this month`}
          changeType="neutral"
          icon={<AlertTriangle size={16} />}
          color="blue"
        />
        <StatCard
          label="Resolved"
          value={resolvedCount}
          change={totalRequests > 0 ? `${resolveRate}% resolve rate` : "No requests yet"}
          changeType="up"
          icon={<CheckCircle size={16} />}
          color="green"
        />
        <StatCard
          label="Active"
          value={activeCount}
          change={activeCount > 0 ? "In progress" : "None active"}
          changeType="neutral"
          icon={<Activity size={16} />}
          color="orange"
        />
        <StatCard
          label="Nearby Camps"
          value={camps.length}
          change="Accepting requests"
          changeType="neutral"
          icon={<Shield size={16} />}
          color="purple"
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0F172A]">Nearby Relief Camps</h2>
            <button
              onClick={() => onNavigate("nearby_camps")}
              className="flex items-center gap-1 text-xs text-[#2563EB] hover:underline font-medium"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>
          <MapView height="280px" camps={mapCamps} />
        </div>

        {/* Nearby camps list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#0F172A]">Camp Status</h2>
          {nearbyCamps.length === 0 ? (
            <Card padding="sm">
              <p className="text-xs text-[#94A3B8] text-center py-4">No approved camps nearby yet.</p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {nearbyCamps.map((camp) => {
                const occupied = Math.max(0, camp.capacity_total - camp.capacity_available);
                const pct = camp.capacity_total > 0 ? Math.round((occupied / camp.capacity_total) * 100) : 0;
                return (
                  <Card
                    key={camp.id}
                    padding="sm"
                    hover
                    onClick={() => onNavigate("camp_details", camp.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">{camp.name}</p>
                        <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {camp.district}, {camp.province}
                        </p>
                      </div>
                      <Badge variant={camp.capacity_available === 0 ? "red" : "green"} dot>
                        {camp.capacity_available === 0 ? "Full" : "Active"}
                      </Badge>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 mb-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: pct > 90 ? "#DC2626" : pct > 70 ? "#EA580C" : "#059669",
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                      <span>{occupied}/{camp.capacity_total} occupied</span>
                      <span className={pct > 90 ? "text-[#DC2626]" : pct > 70 ? "text-[#EA580C]" : "text-[#059669]"}>{pct}%</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          <Button variant="outline" size="sm" fullWidth onClick={() => onNavigate("nearby_camps")} iconRight={<ArrowRight size={12} />}>
            Show All Camps
          </Button>
        </div>
      </div>

      {/* Recent Emergencies + AI Panel */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent emergencies */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
              <h2 className="text-sm font-semibold text-[#0F172A]">Recent Emergencies</h2>
              <button
                onClick={() => onNavigate("my_emergencies")}
                className="text-xs text-[#2563EB] hover:underline font-medium flex items-center gap-1"
              >
                View all <ChevronRight size={12} />
              </button>
            </div>
            {recentEmergencies.length === 0 ? (
              <p className="text-xs text-[#94A3B8] text-center py-10">No emergency requests yet.</p>
            ) : (
              <div className="divide-y divide-[#F8FAFC]">
                {recentEmergencies.map((em) => {
                  const priority = priorityFromUrgency(em.urgency);
                  return (
                    <div
                      key={em.id}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                      onClick={() => onNavigate("emergency_details", em.id)}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                        ${priority === "critical" ? "bg-[#FEF2F2] text-[#DC2626]" :
                          priority === "high" ? "bg-[#FFF7ED] text-[#EA580C]" :
                          "bg-[#FFFBEB] text-[#D97706]"}`}>
                        <AlertTriangle size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#94A3B8] font-[family-name:var(--font-mono)]">
                            #{em.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-[#0F172A] truncate">{em.title}</span>
                        </div>
                        <p className="text-xs text-[#94A3B8] mt-0.5">
                          {em.relief_camps?.name || "Unassigned"} · {formatTime(em.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusChip status={toStatusChipValue(em.status)} />
                        <ChevronRight size={12} className="text-[#CBD5E1] group-hover:text-[#94A3B8] transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* AI Assistant quick panel */}
        <div>
          <Card className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
                <MessageSquare size={15} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">AI Assistant</p>
                <p className="text-xs text-[#94A3B8]">Online</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-[#059669] blink" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-4">
              <MessageSquare size={22} className="text-[#CBD5E1]" />
              <p className="text-xs text-[#64748B] leading-relaxed max-w-[200px]">
                Ask ResQ AI for emergency guidance, camp recommendations, and risk assessments — anytime.
              </p>
            </div>

            <Button fullWidth variant="secondary" size="sm" onClick={() => onNavigate("ai_chat")}>
              Open AI Chat
            </Button>
          </Card>
        </div>
      </div>

      {/* Activity chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#0F172A]">Emergency Activity</h2>
          <Badge variant="gray">Last 7 days</Badge>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={activityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="emerFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ fontWeight: 600, color: "#0F172A" }}
            />
            <Area type="monotone" dataKey="emergencies" stroke="#2563EB" strokeWidth={1.5} fill="url(#emerFill)" dot={false} name="Submitted" />
            <Area type="monotone" dataKey="resolved" stroke="#059669" strokeWidth={1.5} fill="url(#resFill)" dot={false} name="Resolved" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
