import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { uniqueChannelName } from "@/lib/supabase/channel";
import type { DisasterType, EmergencyStatus, EmergencyUrgency } from "@/types/domain";

export interface EmergencyRecord {
  id: string;
  requester_id: string;
  assigned_camp_id?: string | null;
  disaster_type: DisasterType;
  urgency: EmergencyUrgency;
  status: EmergencyStatus;
  title: string;
  description: string;
  province: string;
  district: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  people_count: number;
  required_supplies: string[];
  ai_summary: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  relief_camps?: {
    name: string;
  } | null;
  profiles?: {
    full_name: string | null;
  } | null;
}

export interface EmergencyTimelineRecord {
  id: string;
  emergency_id: string;
  performed_by?: string | null;
  status: EmergencyStatus;
  note?: string | null;
  created_at: string;
  profiles?: {
    full_name?: string | null;
  } | null;
}

export interface CreateEmergencyInput {
  requesterId: string;
  disasterType: DisasterType;
  urgency: EmergencyUrgency;
  title: string;
  description: string;
  province: string;
  district: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  peopleCount: number;
  requiredSupplies: string[];
  assignedCampId?: string;
  aiSummary?: Record<string, unknown>;
}

export async function fetchEmergencies(params?: {
  requesterId?: string;
  assignedCampId?: string;
  status?: EmergencyStatus;
  limit?: number;
}): Promise<EmergencyRecord[]> {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from("emergencies")
    .select("*, relief_camps(name), profiles(full_name)")
    .order("created_at", { ascending: false });

  if (params?.requesterId) {
    query = query.eq("requester_id", params.requesterId);
  }
  if (params?.assignedCampId) {
    query = query.eq("assigned_camp_id", params.assignedCampId);
  }
  if (params?.status) {
    query = query.eq("status", params.status);
  }
  if (params?.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("Failed to fetch emergencies from Supabase:", error.message);
    return [];
  }
  return (data as EmergencyRecord[]) || [];
}

export async function fetchEmergencyById(id: string): Promise<{
  emergency: EmergencyRecord | null;
  timeline: EmergencyTimelineRecord[];
}> {
  const supabase = createSupabaseBrowserClient();

  const [emRes, timelineRes] = await Promise.all([
    supabase
      .from("emergencies")
      .select("*, relief_camps(name)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("emergency_timeline")
      .select("*, profiles(full_name)")
      .eq("emergency_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (emRes.error) {
    console.warn("Failed to fetch emergency details:", emRes.error.message);
  }

  return {
    emergency: (emRes.data as EmergencyRecord) || null,
    timeline: (timelineRes.data as EmergencyTimelineRecord[]) || [],
  };
}

export async function createEmergencyRequest(
  input: CreateEmergencyInput,
): Promise<EmergencyRecord | null> {
  const supabase = createSupabaseBrowserClient();

  const payload = {
    requester_id: input.requesterId,
    disaster_type: input.disasterType,
    urgency: input.urgency,
    status: (input.assignedCampId ? "Assigned" : "Submitted") as EmergencyStatus,
    title: input.title,
    description: input.description,
    province: input.province,
    district: input.district,
    address: input.address || null,
    latitude: input.latitude || null,
    longitude: input.longitude || null,
    people_count: input.peopleCount,
    required_supplies: input.requiredSupplies,
    assigned_camp_id: input.assignedCampId || null,
    ai_summary: input.aiSummary || {},
  };

  const { data, error } = await supabase
    .from("emergencies")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error creating emergency request:", error.message);
    throw new Error(error.message);
  }

  const timelineEntries = [
    {
      emergency_id: data.id,
      performed_by: input.requesterId,
      status: "Submitted",
      note: "Emergency request created",
    },
  ];

  if (input.assignedCampId) {
    timelineEntries.push({
      emergency_id: data.id,
      performed_by: input.requesterId,
      status: "Assigned",
      note: "Matched to nearest relief camp based on disaster type, capacity, and distance",
    });
  }

  await supabase.from("emergency_timeline").insert(timelineEntries);

  return data as EmergencyRecord;
}

export async function updateEmergencyStatus(input: {
  emergencyId: string;
  status: EmergencyStatus;
  assignedCampId?: string;
  note?: string;
  performedBy?: string;
}): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();

  const updates: Record<string, unknown> = {
    status: input.status,
    updated_at: new Date().toISOString(),
  };

  if (input.assignedCampId !== undefined) {
    updates.assigned_camp_id = input.assignedCampId;
  }

  const { error } = await supabase
    .from("emergencies")
    .update(updates)
    .eq("id", input.emergencyId);

  if (error) {
    console.error("Failed to update emergency status:", error.message);
    return false;
  }

  // Record status change timeline entry
  await supabase.from("emergency_timeline").insert([
    {
      emergency_id: input.emergencyId,
      performed_by: input.performedBy || null,
      status: input.status,
      note: input.note || `Status updated to ${input.status}`,
    },
  ]);

  return true;
}

export function subscribeToEmergencies(
  onChange: (payload: unknown) => void,
) {
  const supabase = createSupabaseBrowserClient();
  const channel = supabase
    .channel(uniqueChannelName("realtime-emergencies"))
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "emergencies" },
      (payload) => onChange(payload),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToEmergencyTimeline(
  emergencyId: string,
  onChange: (payload: unknown) => void,
) {
  const supabase = createSupabaseBrowserClient();
  const channel = supabase
    .channel(uniqueChannelName(`realtime-timeline-${emergencyId}`))
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "emergency_timeline",
        filter: `emergency_id=eq.${emergencyId}`,
      },
      (payload) => onChange(payload),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
