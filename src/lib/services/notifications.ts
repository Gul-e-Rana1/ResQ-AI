import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export interface NotificationRecord {
  id: string;
  user_id?: string | null;
  emergency_id?: string | null;
  type: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at: string;
}

export async function fetchUserNotifications(
  userId: string,
): Promise<NotificationRecord[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Failed to fetch notifications:", error.message);
    return [];
  }

  return (data as NotificationRecord[]) || [];
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    console.error("Failed to mark notification as read:", error.message);
    return false;
  }

  return true;
}

export async function createNotification(input: {
  userId: string;
  emergencyId?: string;
  type: string;
  title: string;
  body: string;
}): Promise<NotificationRecord | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("notifications")
    .insert([
      {
        user_id: input.userId,
        emergency_id: input.emergencyId || null,
        type: input.type,
        title: input.title,
        body: input.body,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Failed to create notification:", error.message);
    return null;
  }

  return data as NotificationRecord;
}

export function subscribeToUserNotifications(
  userId: string,
  onChange: (payload: unknown) => void,
) {
  const supabase = createSupabaseBrowserClient();
  const channel = supabase
    .channel(`user-notifications-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onChange(payload),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
