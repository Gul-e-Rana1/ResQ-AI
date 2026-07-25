import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { UserProfile } from "@/types/auth";

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string | null;
  province?: string | null;
  district?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<{ profile: UserProfile | null; error?: string }> {
  const supabase = createSupabaseBrowserClient();

  const updates: Record<string, unknown> = {};
  if (input.fullName !== undefined) updates.full_name = input.fullName;
  if (input.phone !== undefined) updates.phone = input.phone;
  if (input.province !== undefined) updates.province = input.province;
  if (input.district !== undefined) updates.district = input.district;
  if (input.city !== undefined) updates.city = input.city;
  if (input.avatarUrl !== undefined) updates.avatar_url = input.avatarUrl;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: data as UserProfile };
}
