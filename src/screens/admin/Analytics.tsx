import React, { useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, Download } from "lucide-react";
import { Card, Badge, Button, Select } from "../../components/ui";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

const monthlyData = [
  { month: "Jan", emergencies: 142, resolved: 138, users: 980, camps: 45 },
  { month: "Feb", emergencies: 168, resolved: 162, users: 1240, camps: 48 },
  { month: "Mar", emergencies: 195, resolved: 188, users: 1580, camps: 52 },
  { month: "Apr", emergencies: 223, resolved: 215, users: 1920, camps: 55 },
  { month: "May", emergencies: 189, resolved: 183, users: 2100, camps: 57 },
  { month: "Jun", emergencies: 256, resolved: 248, users: 2450, camps: 61 },
  { month: "Jul", emergencies: 312, resolved: 295, users: 2840, camps: 65 },
];

const regionData = [
  { region: "North India", emergencies: 428, resolved: 415, camps: 18 },
  { region: "South India", emergencies: 312, resolved: 298, camps: 15 },
  { region: "West India", emergencies: 256, resolved: 248, camps: 14 },
  { region: "East India", emergencies: 189, resolved: 179, camps: 11 },
  { region: "Central", emergencies: 142, resolved: 138, camps: 7 },
];

const typeBreakdown = [
  { name: "Flood", value: 38, color: "#2563EB" },
  { name: "Medical", value: 24, color: "#DC2626" },
  { name: "Shelter", value: 18, color: "#059669" },
  { name: "Fire", value: 12, color: "#EA580C" },
  { name: "Storm", value: 5, color: "#7C3AED" },
  { name: "Other", value: 3, color: "#94A3B8" },
];

const responseTimeData = [
  { month: "Jan", avg: 9.2 }, { month: "Feb", avg: 8.7 }, { month: "Mar", avg: 8.1 },
  { month: "Apr", avg: 7.9 }, { month: "May", avg: 8.3 }, { month: "Jun", avg: 7.6 }, { month: "Jul", avg: 7.4 },
];

const radarData = [
  { subject: "Response Time", score: 88 },
  { subject: "Resolution Rate", score: 95 },
  { subject: "Camp Coverage", score: 76 },
  { subject: "User Satisfaction", score: 92 },
  { subject: "Staff Efficiency", score: 84 },
  { subject: "System Uptime", score: 99 },
];

const kpis = [
  { label: "Total Emergencies", value: "1,327", change: "+18.2%", up: true },
  { label: "Resolution Rate", value: "94.6%", change: "+2.1%", up: true },
  { label: "Avg Response Time", value: "7.4 min", change: "-19.6%", up: true },
  { label: "Active Camps", value: "62", change: "+12.7%", up: true },
  { label: "Registered Users", value: "12,847", change: "+24.8%", up: true },
  { label: "Satisfaction Score", value: "4.7/5", change: "+0.2", up: true },
];

export default function Analytics() {
  const [period, setPeriod] = useState("7months");

  return (
    <div className="p-5 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">Analytics</h1>
          <p className="text-sm text-[#64748B] mt-0.5">System-wide performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select
            options={[
              { value: "7months", label: "Last 7 months" },
              { value: "30d", label: "Last 30 days" },
              { value: "90d", label: "Last 90 days" },
              { value: "year", label: "This year" },
            ]}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" size="sm" icon={<Download size={13} />}>Export</Button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <Card key={i} padding="sm">
            <p className="text-[10px] text-[#94A3B8] uppercase font-semibold tracking-wide mb-1">{kpi.label}</p>
            <p className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {kpi.up ? <TrendingUp size={10} className="text-[#059669]" /> : <TrendingDown size={10} className="text-[#DC2626]" />}
              <span className={`text-[11px] font-medium ${kpi.up ? "text-[#059669]" : "text-[#DC2626]"}`}>{kpi.change}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0F172A]">Emergency Volume & Resolution</h2>
              <Badge variant="gray">Monthly</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="emergencies" stroke="#2563EB" strokeWidth={2} fill="url(#aE)" name="Submitted" />
                <Area type="monotone" dataKey="resolved" stroke="#059669" strokeWidth={2} fill="url(#aR)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Emergency Types</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={typeBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {typeBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1">
            {typeBreakdown.map((t) => (
              <div key={t.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-[#64748B]">{t.name}</span>
                </div>
                <span className="font-medium text-[#334155]">{t.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Avg Response Time</h2>
            <Badge variant="green">↓ Improving</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={responseTimeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[5, 12]} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} formatter={(value) => [`${value ?? 0} min`, "Avg Time"]} />
              <Line type="monotone" dataKey="avg" stroke="#059669" strokeWidth={2} dot={{ fill: "#059669", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Region breakdown */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">By Region</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={regionData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="emergencies" fill="#DBEAFE" radius={[0, 3, 3, 0]} name="Emergencies" />
              <Bar dataKey="resolved" fill="#2563EB" radius={[0, 3, 3, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Radar */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Performance Score</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#F1F5F9" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "#94A3B8" }} />
              <Radar dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* User growth */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#0F172A]">User & Camp Growth</h2>
          <Badge variant="blue">Cumulative</Badge>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="users" fill="#EFF6FF" stroke="#2563EB" strokeWidth={1} radius={[3, 3, 0, 0]} name="New Users" />
            <Bar dataKey="camps" fill="#2563EB" radius={[3, 3, 0, 0]} name="Camps" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
