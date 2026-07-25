import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Card, Badge, Button, Select } from "../../components/ui";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  fetchAdminOverviewStats,
  fetchEmergencyMonthlyTrend,
  fetchDisasterTypeBreakdown,
  fetchEmergenciesByProvince,
  fetchAverageResponseTimeMinutes,
  fetchUserGrowthTrend,
} from "../../lib/services/adminStats";

const DISASTER_TYPE_COLORS: Record<string, string> = {
  flood: "#2563EB",
  earthquake: "#DC2626",
  wildfire: "#EA580C",
  landslide: "#7C3AED",
  storm: "#0EA5E9",
  medical: "#059669",
  other: "#94A3B8",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const PERIOD_OPTIONS = [
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
];

export default function Analytics() {
  const [period, setPeriod] = useState("6");
  const monthsBack = Number(period);

  const overviewQuery = useQuery({
    queryKey: ["admin-overview-stats"],
    queryFn: fetchAdminOverviewStats,
    staleTime: 30_000,
  });

  const avgResponseQuery = useQuery({
    queryKey: ["admin-avg-response-time"],
    queryFn: fetchAverageResponseTimeMinutes,
    staleTime: 30_000,
  });

  const monthlyTrendQuery = useQuery({
    queryKey: ["admin-monthly-trend", monthsBack],
    queryFn: () => fetchEmergencyMonthlyTrend(monthsBack),
    staleTime: 30_000,
  });

  const typeBreakdownQuery = useQuery({
    queryKey: ["admin-disaster-breakdown"],
    queryFn: fetchDisasterTypeBreakdown,
    staleTime: 30_000,
  });

  const regionQuery = useQuery({
    queryKey: ["admin-region-breakdown"],
    queryFn: fetchEmergenciesByProvince,
    staleTime: 30_000,
  });

  const userGrowthQuery = useQuery({
    queryKey: ["admin-user-growth", monthsBack],
    queryFn: () => fetchUserGrowthTrend(monthsBack),
    staleTime: 30_000,
  });

  const stats = overviewQuery.data;

  const kpis = [
    { label: "Total Emergencies", value: stats ? stats.totalEmergencies.toLocaleString() : "—" },
    { label: "Resolution Rate", value: stats ? `${stats.resolutionRate}%` : "—" },
    { label: "Avg Response Time", value: avgResponseQuery.data != null ? `${avgResponseQuery.data} min` : "—" },
    { label: "Approved Camps", value: stats ? stats.approvedCamps.toLocaleString() : "—" },
    { label: "Registered Users", value: stats ? stats.totalUsers.toLocaleString() : "—" },
    { label: "Open Emergencies", value: stats ? stats.openEmergencies.toLocaleString() : "—" },
  ];

  return (
    <div className="p-5 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">Analytics</h1>
          <p className="text-sm text-[#64748B] mt-0.5">System-wide performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select
            options={PERIOD_OPTIONS}
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
              <AreaChart data={monthlyTrendQuery.data || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                <Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2} fill="url(#aE)" name="Submitted" />
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
              <Pie data={typeBreakdownQuery.data || []} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="count" nameKey="type">
                {(typeBreakdownQuery.data || []).map((entry, i) => (
                  <Cell key={i} fill={DISASTER_TYPE_COLORS[entry.type] || "#94A3B8"} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1">
            {(typeBreakdownQuery.data || []).map((t) => (
              <div key={t.type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: DISASTER_TYPE_COLORS[t.type] || "#94A3B8" }} />
                  <span className="text-[#64748B]">{capitalize(t.type)}</span>
                </div>
                <span className="font-medium text-[#334155]">{t.percentage}%</span>
              </div>
            ))}
            {typeBreakdownQuery.data?.length === 0 && (
              <p className="text-xs text-[#94A3B8]">No emergency data yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Region breakdown */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">By Province</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={regionQuery.data || []} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="province" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="count" fill="#2563EB" radius={[0, 3, 3, 0]} name="Emergencies" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* User growth */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">User Growth</h2>
            <Badge variant="blue">New signups</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={userGrowthQuery.data || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#2563EB" radius={[3, 3, 0, 0]} name="New Users" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
