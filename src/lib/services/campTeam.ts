import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { uniqueChannelName } from "@/lib/supabase/channel";

export interface CampTeamMemberRecord {
  id: string;
  camp_id: string;
  user_id: string;
  title: string;
  can_update_camp: boolean;
  can_respond_emergencies: boolean;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  } | null;
}

export async function fetchCampTeamMembers(campId: string): Promise<CampTeamMemberRecord[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("camp_team_members")
    .select("*, profiles(full_name, email, phone, avatar_url)")
    .eq("camp_id", campId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Failed to fetch camp team members:", error.message);
    return [];
  }

  return (data as CampTeamMemberRecord[]) || [];
}

export async function fetchMyCampMembership(userId: string): Promise<CampTeamMemberRecord | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("camp_team_members")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Failed to fetch camp membership:", error.message);
    return null;
  }

  return data as CampTeamMemberRecord | null;
}

export async function addTeamMemberByEmail(input: {
  campId: string;
  email: string;
  title: string;
  canUpdateCamp?: boolean;
  canRespondEmergencies?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseBrowserClient();

  const { data: profileId, error: profileError } = await supabase.rpc("find_profile_id_by_email", {
    p_email: input.email.trim().toLowerCase(),
  });

  if (profileError || !profileId) {
    return { ok: false, error: "No registered user found with that email address." };
  }

  const { error } = await supabase.from("camp_team_members").insert([
    {
      camp_id: input.campId,
      user_id: profileId,
      title: input.title,
      can_update_camp: input.canUpdateCamp ?? true,
      can_respond_emergencies: input.canRespondEmergencies ?? true,
    },
  ]);

  if (error) {
    return { ok: false, error: error.message };
  }

  await supabase.rpc("sync_team_member_role", { p_user_id: profileId });

  return { ok: true };
}

export async function removeTeamMember(memberId: string): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("camp_team_members").delete().eq("id", memberId);

  if (error) {
    console.error("Failed to remove team member:", error.message);
    return false;
  }

  return true;
}

export function subscribeToCampTeam(campId: string, onChange: (payload: unknown) => void) {
  const supabase = createSupabaseBrowserClient();
  const channel = supabase
    .channel(uniqueChannelName(`camp-team-${campId}`))
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "camp_team_members", filter: `camp_id=eq.${campId}` },
      (payload) => onChange(payload),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
