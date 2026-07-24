import React, { useState } from "react";
import {
  AlertTriangle, MapPin, MessageSquare, Clock, CheckCircle, Activity,
  TrendingUp, ArrowRight, Phone, ChevronRight, Zap, Shield, Users
} from "lucide-react";
import { Card, StatCard, Badge, StatusChip, Button, Alert } from "../../components/ui";
import { MapView } from "../../components/MapView";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const activityData = [
  { day: "Mon", emergencies: 2, resolved: 2 },
  { day: "Tue", emergencies: 1, resolved: 1 },
  { day: "Wed", emergencies: 3, resolved: 2 },
  { day: "Thu", emergencies: 1, resolved: 1 },
  { day: "Fri", emergencies: 2, resolved: 2 },
  { day: "Sat", emergencies: 0, resolved: 0 },
  { day: "Sun", emergencies: 1, resolved: 0 },
];

const recentEmergencies = [
  {
    id: "EM-2891",
    type: "Flood Evacuation",
    status: "en_route" as const,
    camp: "Camp Alpha",
    time: "Today, 09:14 AM",
    priority: "high",
  },
  {
    id: "EM-2845",
    type: "Medical Assistance",
    status: "resolved" as const,
    camp: "Camp Beta",
    time: "Yesterday, 3:22 PM",
    priority: "critical",
  },
  {
    id: "EM-2812",
    type: "Food & Shelter",
    status: "resolved" as const,
    camp: "Camp Delta",
    time: "Jul 18, 11:05 AM",
    priority: "medium",
  },
];

const nearbyCamps = [
  { name: "Camp Alpha", distance: "1.2 km", capacity: 500, occupied: 380, status: "active" as const },
  { name: "Camp Beta", distance: "2.8 km", capacity: 300, occupied: 290, status: "active" as const },
  { name: "Camp Delta", distance: "3.5 km", capacity: 200, occupied: 65, status: "active" as const },
];

const quickActions = [
  { label: "Create Emergency", icon: <AlertTriangle size={16} />, page: "create_emergency", color: "bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FECACA]" },
  { label: "AI Assistant", icon: <MessageSquare size={16} />, page: "ai_chat", color: "bg-[#F5F3FF] text-[#7C3AED] hover:bg-[#DDD6FE]" },
  { label: "Find Camps", icon: <MapPin size={16} />, page: "nearby_camps", color: "bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]" },
  { label: "Helplines", icon: <Phone size={16} />, page: "helplines", color: "bg-[#FFF7ED] text-[#EA580C] hover:bg-[#FED7AA]" },
];

interface Props {
  onNavigate: (page: string) => void;
}

export default function UserDashboard({ onNavigate }: Props) {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="p-5 md:p-6 space-y-6 max-w-7xl">
      {/* Active emergency alert */}
      {showAlert && (
        <Alert
          type="warning"
          title="Active Emergency En Route"
          onClose={() => setShowAlert(false)}
        >
          Emergency #EM-2891 — Camp Alpha team is on their way. ETA: <strong>8 minutes</strong>.{" "}
          <button
            onClick={() => onNavigate("emergency_details")}
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
            Good morning, Sarah 👋
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            New Delhi area · <span className="text-[#059669] font-medium">3 camps nearby</span>
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
          value="12"
          change="3 this month"
          changeType="neutral"
          icon={<AlertTriangle size={16} />}
          color="blue"
        />
        <StatCard
          label="Resolved"
          value="10"
          change="↑ 83% resolve rate"
          changeType="up"
          icon={<CheckCircle size={16} />}
          color="green"
        />
        <StatCard
          label="Active"
          value="1"
          change="En route"
          changeType="neutral"
          icon={<Activity size={16} />}
          color="orange"
        />
        <StatCard
          label="Avg Response"
          value="7.4m"
          change="↑ Faster than avg"
          changeType="up"
          icon={<Clock size={16} />}
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
          <MapView height="280px" />
        </div>

        {/* Nearby camps list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#0F172A]">Camp Status</h2>
          <div className="space-y-2.5">
            {nearbyCamps.map((camp, i) => {
              const pct = Math.round((camp.occupied / camp.capacity) * 100);
              return (
                <Card
                  key={i}
                  padding="sm"
                  hover
                  onClick={() => onNavigate("camp_details")}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{camp.name}</p>
                      <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {camp.distance}
                      </p>
                    </div>
                    <Badge variant="green" dot>Active</Badge>
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
                    <span>{camp.occupied}/{camp.capacity} occupied</span>
                    <span className={pct > 90 ? "text-[#DC2626]" : pct > 70 ? "text-[#EA580C]" : "text-[#059669]"}>{pct}%</span>
                  </div>
                </Card>
              );
            })}
          </div>
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
            <div className="divide-y divide-[#F8FAFC]">
              {recentEmergencies.map((em) => (
                <div
                  key={em.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                  onClick={() => onNavigate("emergency_details")}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${em.priority === "critical" ? "bg-[#FEF2F2] text-[#DC2626]" :
                      em.priority === "high" ? "bg-[#FFF7ED] text-[#EA580C]" :
                      "bg-[#FFFBEB] text-[#D97706]"}`}>
                    <AlertTriangle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#94A3B8] font-[family-name:var(--font-mono)]">
                        #{em.id}
                      </span>
                      <span className="text-sm font-medium text-[#0F172A] truncate">{em.type}</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{em.camp} · {em.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip status={em.status} />
                    <ChevronRight size={12} className="text-[#CBD5E1] group-hover:text-[#94A3B8] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
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

            <div className="flex-1 space-y-2.5 mb-4">
              <div className="p-3 bg-[#F8FAFC] rounded-xl rounded-tl-sm border border-[#F1F5F9]">
                <p className="text-xs text-[#334155] leading-relaxed">
                  Hello Sarah! I can help you find camps, assess risk levels, and guide you through emergencies. How can I help?
                </p>
              </div>
              <div className="p-3 bg-[#EFF6FF] rounded-xl rounded-tr-sm border border-[#DBEAFE] ml-4">
                <p className="text-xs text-[#1D4ED8] leading-relaxed">
                  What should I do in a flood?
                </p>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-xl rounded-tl-sm border border-[#F1F5F9]">
                <p className="text-xs text-[#334155] leading-relaxed">
                  Move to higher ground immediately. I've detected <strong>Camp Alpha</strong> at 1.2km with 120 available spots. Shall I send a request?
                </p>
              </div>
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
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
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
