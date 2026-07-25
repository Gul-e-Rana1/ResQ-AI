import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { EmergencyStatus } from "@/types/domain";

export interface AdminOverviewStats {
  totalUsers: number;
  totalCamps: number;
  approvedCamps: number;
  pendingApprovals: number;
  totalEmergencies: number;
  openEmergencies: number;
  resolvedEmergencies: number;
  resolutionRate: number;
}

export async function fetchAdminOverviewStats(): Promise<AdminOverviewStats> {
  const supabase = createSupabaseBrowserClient();

  const [usersCount, campsCount, approvedCampsCount, pendingCampsCount, emergenciesCount, resolvedCount] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("relief_camps").select("id", { count: "exact", head: true }),
      supabase.from("relief_camps").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("relief_camps").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("emergencies").select("id", { count: "exact", head: true }),
      supabase.from("emergencies").select("id", { count: "exact", head: true }).eq("status", "Resolved"),
    ]);

  const totalEmergencies = emergenciesCount.count || 0;
  const resolvedEmergencies = resolvedCount.count || 0;
  const openEmergencies = totalEmergencies - resolvedEmergencies;
  const resolutionRate = totalEmergencies > 0 ? Math.round((resolvedEmergencies / totalEmergencies) * 1000) / 10 : 0;

  return {
    totalUsers: usersCount.count || 0,
    totalCamps: campsCount.count || 0,
    approvedCamps: approvedCampsCount.count || 0,
    pendingApprovals: pendingCampsCount.count || 0,
    totalEmergencies,
    openEmergencies,
    resolvedEmergencies,
    resolutionRate,
  };
}

export interface EmergencyMonthlyPoint {
  month: string;
  total: number;
  resolved: number;
}

export async function fetchEmergencyMonthlyTrend(monthsBack = 6): Promise<EmergencyMonthlyPoint[]> {
  const supabase = createSupabaseBrowserClient();
  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);
  since.setMonth(since.getMonth() - (monthsBack - 1));

  const { data, error } = await supabase
    .from("emergencies")
    .select("created_at, status")
    .gte("created_at", since.toISOString());

  if (error || !data) return [];

  const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  const buckets = new Map<string, { total: number; resolved: number }>();
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(since);
    d.setMonth(d.getMonth() + i);
    buckets.set(formatter.format(d), { total: 0, resolved: 0 });
  }

  for (const row of data as { created_at: string; status: EmergencyStatus }[]) {
    const key = formatter.format(new Date(row.created_at));
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.total += 1;
    if (row.status === "Resolved") bucket.resolved += 1;
  }

  return Array.from(buckets.entries()).map(([month, v]) => ({ month, total: v.total, resolved: v.resolved }));
}

export interface UserGrowthPoint {
  month: string;
  count: number;
}

export async function fetchUserGrowthTrend(monthsBack = 6): Promise<UserGrowthPoint[]> {
  const supabase = createSupabaseBrowserClient();
  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);
  since.setMonth(since.getMonth() - (monthsBack - 1));

  const { data, error } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", since.toISOString());

  if (error || !data) return [];

  const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  const buckets = new Map<string, number>();
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(since);
    d.setMonth(d.getMonth() + i);
    buckets.set(formatter.format(d), 0);
  }

  for (const row of data as { created_at: string }[]) {
    const key = formatter.format(new Date(row.created_at));
    if (!buckets.has(key)) continue;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  return Array.from(buckets.entries()).map(([month, count]) => ({ month, count }));
}

export interface DisasterTypeBreakdown {
  type: string;
  count: number;
  percentage: number;
}

export async function fetchDisasterTypeBreakdown(): Promise<DisasterTypeBreakdown[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from("emergencies").select("disaster_type");
  if (error || !data || data.length === 0) return [];

  const counts = new Map<string, number>();
  for (const row of data as { disaster_type: string }[]) {
    counts.set(row.disaster_type, (counts.get(row.disaster_type) || 0) + 1);
  }
  const total = data.length;
  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count, percentage: Math.round((count / total) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count);
}

export interface RegionBreakdown {
  province: string;
  count: number;
}

export async function fetchEmergenciesByProvince(): Promise<RegionBreakdown[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from("emergencies").select("province");
  if (error || !data) return [];

  const counts = new Map<string, number>();
  for (const row of data as { province: string }[]) {
    counts.set(row.province, (counts.get(row.province) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([province, count]) => ({ province, count }))
    .sort((a, b) => b.count - a.count);
}

export interface RecentActivityItem {
  id: string;
  text: string;
  time: string;
  status: EmergencyStatus;
}

export async function fetchRecentActivity(limit = 8): Promise<RecentActivityItem[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("emergency_timeline")
    .select("id, status, note, created_at, emergencies(title), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (
    data as unknown as {
      id: string;
      status: EmergencyStatus;
      note: string | null;
      created_at: string;
      emergencies: { title: string } | null;
      profiles: { full_name: string | null } | null;
    }[]
  ).map((row) => ({
    id: row.id,
    text: `${row.emergencies?.title || "Emergency"} — ${row.note || `status updated to ${row.status}`}${
      row.profiles?.full_name ? ` by ${row.profiles.full_name}` : ""
    }`,
    time: row.created_at,
    status: row.status,
  }));
}

export async function fetchAverageResponseTimeMinutes(): Promise<number | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("emergency_timeline")
    .select("emergency_id, status, created_at")
    .in("status", ["Submitted", "Accepted"])
    .order("created_at", { ascending: true });

  if (error || !data) return null;

  const submittedAt = new Map<string, string>();
  const diffsMinutes: number[] = [];

  for (const row of data as { emergency_id: string; status: string; created_at: string }[]) {
    if (row.status === "Submitted" && !submittedAt.has(row.emergency_id)) {
      submittedAt.set(row.emergency_id, row.created_at);
    } else if (row.status === "Accepted" && submittedAt.has(row.emergency_id)) {
      const start = new Date(submittedAt.get(row.emergency_id) as string).getTime();
      const end = new Date(row.created_at).getTime();
      diffsMinutes.push((end - start) / 60000);
      submittedAt.delete(row.emergency_id);
    }
  }

  if (diffsMinutes.length === 0) return null;
  return Math.round((diffsMinutes.reduce((a, b) => a + b, 0) / diffsMinutes.length) * 10) / 10;
}
