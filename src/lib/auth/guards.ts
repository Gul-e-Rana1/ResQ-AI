import { redirect } from "next/navigation";
import { getDashboardForRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

export async function getServerUserProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw error;

  return { user, profile };
}

export async function requireRole(allowedRoles: UserRole[]) {
  const { user, profile } = await getServerUserProfile();
  if (!user || !profile) {
    redirect("/?page=login");
  }

  const role = profile.role as UserRole;
  if (!allowedRoles.includes(role)) {
    redirect(`/?page=${getDashboardForRole(role)}`);
  }

  return { user, profile: { ...profile, role } };
}
