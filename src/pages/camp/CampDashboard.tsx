import React, { useState } from "react";
import {
  AlertTriangle, Users, CheckCircle, Clock, Activity, ChevronRight,
  TrendingUp, ArrowRight, BarChart3, MapPin, Phone
} from "lucide-react";
import { Card, StatCard, Badge, StatusChip, Button, Avatar } from "../../components/ui";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import { useRealtimeEmergencies } from "@/hooks/useRealtimeEmergencies";

const weeklyData = [
  { day: "Mon", received: 8, resolved: 6 },
  { day: "Tue", received: 12, resolved: 10 },
  { day: "Wed", received: 7, resolved: 7 },
  { day: "Thu", received: 15, resolved: 11 },
  { day: "Fri", received: 9, resolved: 9 },
  { day: "Sat", received: 11, resolved: 8 },
  { day: "Sun", received: 6, resolved: 5 },
];

const mockPendingRequests = [
  { id: "EM-2891", type: "Flood Evacuation", user: "Sarah Johnson", location: "Sector 14", priority: "high", time: "2 min ago", people: 4 },
  { id: "EM-2893", type: "Medical Emergency", user: "Vikram Patel", location: "Rohini Block B", priority: "critical", time: "5 min ago", people: 2 },
  { id: "EM-2894", type: "Food & Shelter", user: "Meera Sharma", location: "Dwarka Sec 6", priority: "medium", time: "12 min ago", people: 6 },
  { id: "EM-2895", type: "Structural Damage", user: "Arjun Singh", location: "Janakpuri C", priority: "high", time: "18 min ago", people: 3 },
];

const teamMembers = [
  { name: "Ravi Kumar", role: "Team Lead", status: "on_duty", dept: "Rescue" },
  { name: "Priya Singh", role: "Medical Officer", status: "on_duty", dept: "Medical" },
  { name: "Arjun Patel", role: "Driver", status: "en_route", dept: "Logistics" },
  { name: "Sunita Roy", role: "Coordinator", status: "available", dept: "Operations" },
];

const priorityColors = {
  critical: "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]",
  high: "text-[#EA580C] bg-[#FFF7ED] border-[#FED7AA]",
  medium: "text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]",
  low: "text-[#64748B] bg-[#F8FAFC] border-[#E2E8F0]",
};

interface Props {
  onNavigate: (page: string) => void;
}

export default function CampDashboard({ onNavigate }: Props) {
  const { data: dbEmergencies = [] } = useRealtimeEmergencies();

  const formattedDbPending = dbEmergencies.map((em) => ({
    id: em.id.slice(0, 8),
    type: em.disaster_type.toUpperCase(),
    user: "Requester",
    location: em.address || `${em.district}, ${em.province}`,
    priority: em.urgency.toLowerCase(),
    time: "Just now",
    people: em.people_count,
  }));

  const pendingRequests = formattedDbPending.length > 0 ? formattedDbPending : mockPendingRequests;
  return (
    <div className="p-5 md:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
            Camp Alpha — Operations
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#059669] blink inline-block" />
            Active · 123 Relief Road, Sector 4 · 380/500 occupied
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
        <StatCard label="Total Capacity" value="500" change="380 occupied" changeType="neutral" icon={<Users size={16} />} color="blue" />
        <StatCard label="Available Spots" value="120" change="↓ 24% from yesterday" changeType="down" icon={<CheckCircle size={16} />} color="green" />
        <StatCard label="Active Requests" value="5" change="2 critical" changeType="neutral" icon={<AlertTriangle size={16} />} color="orange" />
        <StatCard label="Resolved Today" value="23" change="↑ 15% efficiency" changeType="up" icon={<Activity size={16} />} color="purple" />
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

            <div className="divide-y divide-[#F8FAFC]">
              {pendingRequests.map((req) => {
                const pColors = priorityColors[req.priority as keyof typeof priorityColors];
                return (
                  <div
                    key={req.id}
                    className="flex items-start gap-3 px-5 py-4 hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                    onClick={() => onNavigate("camp_emergency_details")}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border text-sm ${pColors}`}>
                      <AlertTriangle size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#94A3B8] font-[family-name:var(--font-mono)]">#{req.id}</span>
                            <span className="text-sm font-semibold text-[#0F172A]">{req.type}</span>
                          </div>
                          <p className="text-xs text-[#64748B] mt-0.5">{req.user} · {req.location} · {req.people} people</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] text-[#94A3B8]">{req.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button size="xs" variant="success" onClick={(e) => { e.stopPropagation(); }}>Accept</Button>
                        <Button size="xs" variant="outline" onClick={(e) => { e.stopPropagation(); }}>View Details</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Team status */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0F172A]">Team on Duty</h2>
              <button
                onClick={() => onNavigate("camp_team")}
                className="text-xs text-[#2563EB] font-medium hover:underline"
              >
                Manage
              </button>
            </div>
            <div className="space-y-3">
              {teamMembers.map((m, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Avatar name={m.name} size="sm" online={m.status !== "off_duty"} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0F172A] truncate">{m.name}</p>
                    <p className="text-[11px] text-[#94A3B8]">{m.role}</p>
                  </div>
                  <Badge
                    variant={m.status === "on_duty" ? "green" : m.status === "en_route" ? "orange" : "blue"}
                    dot
                  >
                    {m.status === "on_duty" ? "On Duty" : m.status === "en_route" ? "En Route" : "Available"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Occupancy */}
          <Card>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Camp Occupancy</h2>
            <div className="space-y-3">
              {[
                { label: "General Shelter", current: 180, max: 200, color: "#2563EB" },
                { label: "Medical Ward", current: 45, max: 60, color: "#DC2626" },
                { label: "Women's Block", current: 95, max: 120, color: "#7C3AED" },
                { label: "Children's Area", current: 60, max: 120, color: "#059669" },
              ].map((section, i) => {
                const p = Math.round((section.current / section.max) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#334155]">{section.label}</span>
                      <span className="text-xs text-[#64748B]">{section.current}/{section.max}</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${p}%`, background: section.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Weekly Emergency Requests</h2>
            <Badge variant="gray">This week</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="received" fill="#DBEAFE" radius={[3, 3, 0, 0]} name="Received" />
              <Bar dataKey="resolved" fill="#2563EB" radius={[3, 3, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Response Time Trend</h2>
            <Badge variant="green">Avg: 7.4 min</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyData.map((d, i) => ({ ...d, time: [8.2, 7.8, 7.1, 9.3, 6.8, 7.5, 7.2][i] }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[5, 12]} />
              <Tooltip
                contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }}
                formatter={(value) => [`${value ?? 0} min`, "Response Time"]}
              />
              <Line type="monotone" dataKey="time" stroke="#059669" strokeWidth={2} dot={{ fill: "#059669", r: 3 }} name="Response Time" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
