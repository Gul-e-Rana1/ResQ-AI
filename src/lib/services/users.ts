import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { UserRole } from "@/types/domain";

export interface AdminUserRecord {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  province: string | null;
  district: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string;
}

function sanitizeSearchTerm(term: string) {
  return term.replace(/[%,]/g, "").trim();
}

export async function fetchUsers(params?: {
  search?: string;
  role?: UserRole;
  province?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{ users: AdminUserRecord[]; total: number }> {
  const supabase = createSupabaseBrowserClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (params?.role) {
    query = query.eq("role", params.role);
  }

  if (params?.province) {
    query = query.eq("province", params.province);
  }

  if (params?.isActive !== undefined) {
    query = query.eq("is_active", params.isActive);
  }

  const search = params?.search ? sanitizeSearchTerm(params.search) : "";
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.warn("Failed to fetch users:", error.message);
    return { users: [], total: 0 };
  }

  return { users: (data as AdminUserRecord[]) || [], total: count || 0 };
}

export async function setUserActive(userId: string, isActive: boolean): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", userId);

  if (error) {
    console.error("Failed to update user status:", error.message);
    return false;
  }

  return true;
}

export interface UserRoleCounts {
  residents: number;
  campManagers: number;
  suspended: number;
}

export async function fetchUserRoleCounts(): Promise<UserRoleCounts> {
  const supabase = createSupabaseBrowserClient();
  const [residents, campManagers, suspended] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "registered_user"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "camp_manager"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", false),
  ]);

  return {
    residents: residents.count || 0,
    campManagers: campManagers.count || 0,
    suspended: suspended.count || 0,
  };
}

export async function fetchUserEmergencyCount(userId: string): Promise<number> {
  const supabase = createSupabaseBrowserClient();
  const { count, error } = await supabase
    .from("emergencies")
    .select("id", { count: "exact", head: true })
    .eq("requester_id", userId);

  if (error) return 0;
  return count || 0;
}
