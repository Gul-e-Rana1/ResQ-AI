import React, { useState } from "react";
import {
  Users, Building2, AlertTriangle, CheckCircle, TrendingUp, Activity,
  ChevronRight, Shield, Clock, Globe, BarChart3, ArrowUpRight
} from "lucide-react";
import { Card, StatCard, Badge, StatusChip, Button, Avatar } from "../../components/ui";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const monthlyData = [
  { month: "Jan", emergencies: 142, resolved: 138, camps: 45 },
  { month: "Feb", emergencies: 168, resolved: 162, camps: 48 },
  { month: "Mar", emergencies: 195, resolved: 188, camps: 52 },
  { month: "Apr", emergencies: 223, resolved: 215, camps: 55 },
  { month: "May", emergencies: 189, resolved: 183, camps: 57 },
  { month: "Jun", emergencies: 256, resolved: 248, camps: 61 },
  { month: "Jul", emergencies: 312, resolved: 295, camps: 65 },
];

const typeData = [
  { name: "Flood", value: 38, color: "#2563EB" },
  { name: "Medical", value: 24, color: "#DC2626" },
  { name: "Shelter", value: 18, color: "#059669" },
  { name: "Fire", value: 12, color: "#EA580C" },
  { name: "Other", value: 8, color: "#94A3B8" },
];

const pendingApprovals = [
  { name: "Camp Phoenix", location: "Mumbai, Maharashtra", manager: "Ajay Mehta", submitted: "Jul 21, 2026", capacity: 350 },
  { name: "Camp Horizon", location: "Chennai, Tamil Nadu", manager: "Lakshmi Nair", submitted: "Jul 20, 2026", capacity: 200 },
  { name: "Camp Unity", location: "Hyderabad, Telangana", manager: "Ravi Reddy", submitted: "Jul 19, 2026", capacity: 500 },
];

const recentActivity = [
  { text: "Camp Beta approved by admin", time: "5 min ago", type: "success" },
  { text: "Emergency #EM-2893 critical — Camp Alpha assigned", time: "12 min ago", type: "warning" },
  { text: "New user registration: Priya Kumari", time: "28 min ago", type: "info" },
  { text: "Camp Sigma reported capacity issue", time: "45 min ago", type: "warning" },
  { text: "System backup completed", time: "1 hr ago", type: "success" },
];

const activityColors = {
  success: "bg-[#ECFDF5] text-[#059669]",
  warning: "bg-[#FFFBEB] text-[#D97706]",
  info: "bg-[#EFF6FF] text-[#2563EB]",
  error: "bg-[#FEF2F2] text-[#DC2626]",
};

interface Props {
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: Props) {
  return (
    <div className="p-5 md:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
            Admin Dashboard
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            System-wide overview · Jul 22, 2026
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onNavigate("admin_analytics")} icon={<BarChart3 size={13} />}>
            Analytics
          </Button>
          <Button size="sm" onClick={() => onNavigate("admin_approvals")} icon={<CheckCircle size={13} />}>
            Approvals <Badge variant="red" className="ml-1">3</Badge>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value="12,847" change="↑ 8.2% this month" changeType="up" icon={<Users size={16} />} color="blue" />
        <StatCard label="Active Camps" value="62" change="↑ 3 new this week" changeType="up" icon={<Building2 size={16} />} color="green" />
        <StatCard label="Emergencies" value="312" change="This month" changeType="neutral" icon={<AlertTriangle size={16} />} color="orange" />
        <StatCard label="Resolution Rate" value="94.6%" change="↑ 2.1% vs last month" changeType="up" icon={<CheckCircle size={16} />} color="purple" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Monthly trend */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0F172A]">Monthly Emergency Trend</h2>
              <Button variant="ghost" size="xs" iconRight={<ArrowUpRight size={11} />} onClick={() => onNavigate("admin_analytics")}>
                Full Report
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="emergencies" stroke="#2563EB" strokeWidth={2} fill="url(#emerGrad)" name="Emergencies" />
                <Area type="monotone" dataKey="resolved" stroke="#059669" strokeWidth={2} fill="url(#resGrad)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Type distribution */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Emergency Types</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {typeData.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
                <span className="text-[11px] text-[#64748B]">{t.name} {t.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Lower grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Pending approvals */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#0F172A]">Pending Camp Approvals</h2>
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#D97706] text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingApprovals.length}
                </span>
              </div>
              <button
                onClick={() => onNavigate("admin_approvals")}
                className="text-xs text-[#2563EB] hover:underline font-medium flex items-center gap-1"
              >
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-[#F8FAFC]">
              {pendingApprovals.map((camp, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-[#64748B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A]">{camp.name}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{camp.location} · Manager: {camp.manager}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">Submitted {camp.submitted} · Cap. {camp.capacity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="xs" variant="success" onClick={() => {}}>Approve</Button>
                    <Button size="xs" variant="outline" onClick={() => onNavigate("admin_approvals")}>Review</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Activity feed */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {recentActivity.map((a, i) => {
              const colors = activityColors[a.type as keyof typeof activityColors];
              return (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${colors.replace("bg-", "").includes("[") ? "" : ""}`}
                    style={{ background: a.type === "success" ? "#059669" : a.type === "warning" ? "#D97706" : a.type === "error" ? "#DC2626" : "#2563EB" }}
                  />
                  <div>
                    <p className="text-xs text-[#334155] leading-snug">{a.text}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Avg Response Time", value: "7.4 min", sub: "System-wide", trend: "↓ 12% vs last month", up: true },
          { label: "Camp Utilization", value: "76%", sub: "Across all camps", trend: "↑ 4% capacity used", up: false },
          { label: "Pending Approvals", value: "3", sub: "Camp applications", trend: "Review needed", up: false },
        ].map((s, i) => (
          <Card key={i} padding="sm">
            <p className="text-xs text-[#94A3B8] uppercase font-semibold tracking-wide mb-1.5">{s.label}</p>
            <p className="text-2xl font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">{s.value}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{s.sub}</p>
            <p className="text-xs text-[#059669] mt-1 font-medium">{s.trend}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
