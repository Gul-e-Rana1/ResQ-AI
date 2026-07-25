import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Users, Building2, AlertTriangle, CheckCircle, BarChart3, ArrowUpRight
} from "lucide-react";
import { Card, StatCard, Badge, Button } from "../../components/ui";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  fetchAdminOverviewStats,
  fetchEmergencyMonthlyTrend,
  fetchDisasterTypeBreakdown,
  fetchRecentActivity,
  fetchAverageResponseTimeMinutes,
} from "../../lib/services/adminStats";
import { updateCampStatus } from "../../lib/services/camps";
import { useRealtimeCamps } from "../../hooks/useRealtimeCamps";

const DISASTER_TYPE_COLORS: Record<string, string> = {
  flood: "#2563EB",
  earthquake: "#DC2626",
  wildfire: "#EA580C",
  landslide: "#7C3AED",
  storm: "#0EA5E9",
  medical: "#059669",
  other: "#94A3B8",
};

const ACTIVITY_STATUS_COLORS: Record<string, string> = {
  Submitted: "#2563EB",
  Assigned: "#7C3AED",
  Accepted: "#D97706",
  "En Route": "#EA580C",
  Arrived: "#2563EB",
  Resolved: "#059669",
  Cancelled: "#94A3B8",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface Props {
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: Props) {
  const queryClient = useQueryClient();
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const overviewQuery = useQuery({
    queryKey: ["admin-overview-stats"],
    queryFn: fetchAdminOverviewStats,
    staleTime: 30_000,
  });

  const monthlyTrendQuery = useQuery({
    queryKey: ["admin-monthly-trend", 7],
    queryFn: () => fetchEmergencyMonthlyTrend(7),
    staleTime: 30_000,
  });

  const typeBreakdownQuery = useQuery({
    queryKey: ["admin-disaster-breakdown"],
    queryFn: fetchDisasterTypeBreakdown,
    staleTime: 30_000,
  });

  const recentActivityQuery = useQuery({
    queryKey: ["admin-recent-activity", 5],
    queryFn: () => fetchRecentActivity(5),
    staleTime: 30_000,
  });

  const avgResponseQuery = useQuery({
    queryKey: ["admin-avg-response-time"],
    queryFn: fetchAverageResponseTimeMinutes,
    staleTime: 30_000,
  });

  const pendingCampsQuery = useRealtimeCamps({ status: "pending" });

  const stats = overviewQuery.data;
  const pendingApprovals = pendingCampsQuery.data ?? [];

  const handleApprove = async (campId: string) => {
    setApprovingId(campId);
    const ok = await updateCampStatus(campId, "approved");
    setApprovingId(null);
    if (ok) {
      queryClient.invalidateQueries({ queryKey: ["admin-overview-stats"] });
    }
  };

  return (
    <div className="p-5 md:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
            Admin Dashboard
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            System-wide overview · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onNavigate("admin_analytics")} icon={<BarChart3 size={13} />}>
            Analytics
          </Button>
          <Button size="sm" onClick={() => onNavigate("admin_approvals")} icon={<CheckCircle size={13} />}>
            Approvals
            {!!stats?.pendingApprovals && (
              <Badge variant="red" className="ml-1">{stats.pendingApprovals}</Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats ? stats.totalUsers.toLocaleString() : "—"}
          icon={<Users size={16} />}
          color="blue"
        />
        <StatCard
          label="Approved Camps"
          value={stats ? stats.approvedCamps.toLocaleString() : "—"}
          change={stats ? `${stats.pendingApprovals} pending review` : undefined}
          changeType="neutral"
          icon={<Building2 size={16} />}
          color="green"
        />
        <StatCard
          label="Open Emergencies"
          value={stats ? stats.openEmergencies.toLocaleString() : "—"}
          change={stats ? `${stats.totalEmergencies} total` : undefined}
          changeType="neutral"
          icon={<AlertTriangle size={16} />}
          color="orange"
        />
        <StatCard
          label="Resolution Rate"
          value={stats ? `${stats.resolutionRate}%` : "—"}
          change={stats ? `${stats.resolvedEmergencies} of ${stats.totalEmergencies} resolved` : undefined}
          changeType="neutral"
          icon={<CheckCircle size={16} />}
          color="purple"
        />
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
              <AreaChart data={monthlyTrendQuery.data || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                <Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2} fill="url(#emerGrad)" name="Emergencies" />
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
                data={typeBreakdownQuery.data || []}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
                nameKey="type"
              >
                {(typeBreakdownQuery.data || []).map((entry, index) => (
                  <Cell key={index} fill={DISASTER_TYPE_COLORS[entry.type] || "#94A3B8"} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {(typeBreakdownQuery.data || []).map((t) => (
              <div key={t.type} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: DISASTER_TYPE_COLORS[t.type] || "#94A3B8" }} />
                <span className="text-[11px] text-[#64748B]">{capitalize(t.type)} {t.percentage}%</span>
              </div>
            ))}
            {typeBreakdownQuery.data?.length === 0 && (
              <p className="text-[11px] text-[#94A3B8]">No emergency data yet</p>
            )}
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
                View all
              </button>
            </div>
            <div className="divide-y divide-[#F8FAFC]">
              {pendingApprovals.length === 0 && (
                <p className="px-5 py-6 text-sm text-[#94A3B8] text-center">No camps awaiting approval</p>
              )}
              {pendingApprovals.slice(0, 4).map((camp) => (
                <div key={camp.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-[#64748B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A]">{camp.name}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{camp.address}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      Submitted {formatDistanceToNow(new Date(camp.created_at), { addSuffix: true })} · Cap. {camp.capacity_total}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="success"
                      loading={approvingId === camp.id}
                      onClick={() => handleApprove(camp.id)}
                    >
                      Approve
                    </Button>
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
            {(recentActivityQuery.data || []).length === 0 && (
              <p className="text-xs text-[#94A3B8]">No recent activity</p>
            )}
            {(recentActivityQuery.data || []).map((a) => (
              <div key={a.id} className="flex items-start gap-2.5">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: ACTIVITY_STATUS_COLORS[a.status] || "#2563EB" }}
                />
                <div>
                  <p className="text-xs text-[#334155] leading-snug">{a.text}</p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    {formatDistanceToNow(new Date(a.time), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card padding="sm">
          <p className="text-xs text-[#94A3B8] uppercase font-semibold tracking-wide mb-1.5">Avg Response Time</p>
          <p className="text-2xl font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
            {avgResponseQuery.data != null ? `${avgResponseQuery.data} min` : "—"}
          </p>
          <p className="text-xs text-[#64748B] mt-0.5">System-wide, submitted to accepted</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-[#94A3B8] uppercase font-semibold tracking-wide mb-1.5">Pending Approvals</p>
          <p className="text-2xl font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
            {stats ? stats.pendingApprovals : "—"}
          </p>
          <p className="text-xs text-[#64748B] mt-0.5">Camp applications</p>
        </Card>
      </div>
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
