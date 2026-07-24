import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { CampStatus, DisasterType } from "@/types/domain";

export interface ReliefCampRecord {
  id: string;
  manager_id?: string | null;
  name: string;
  description?: string | null;
  province: string;
  district: string;
  tehsil?: string | null;
  address: string;
  latitude: number;
  longitude: number;
  capacity_total: number;
  capacity_available: number;
  status: CampStatus;
  contact_phone?: string | null;
  contact_email?: string | null;
  supported_disasters: DisasterType[];
  services: string[];
  is_accepting_emergencies: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampSupplyRecord {
  id: string;
  camp_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  updated_at: string;
}

export async function fetchReliefCamps(params?: {
  status?: CampStatus;
  province?: string;
  district?: string;
  acceptingOnly?: boolean;
}): Promise<ReliefCampRecord[]> {
  const supabase = createSupabaseBrowserClient();
  let query = supabase.from("relief_camps").select("*").order("name", { ascending: true });

  if (params?.status) {
    query = query.eq("status", params.status);
  }
  if (params?.province) {
    query = query.eq("province", params.province);
  }
  if (params?.district) {
    query = query.eq("district", params.district);
  }
  if (params?.acceptingOnly) {
    query = query.eq("is_accepting_emergencies", true);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("Failed to fetch relief camps:", error.message);
    return [];
  }

  return (data as ReliefCampRecord[]) || [];
}

export async function fetchCampById(id: string): Promise<ReliefCampRecord | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("relief_camps")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.warn("Failed to fetch camp:", error.message);
    return null;
  }

  return data as ReliefCampRecord;
}

export async function fetchCampSupplies(campId: string): Promise<CampSupplyRecord[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("camp_supplies")
    .select("*")
    .eq("camp_id", campId)
    .order("name", { ascending: true });

  if (error) {
    console.warn("Failed to fetch camp supplies:", error.message);
    return [];
  }

  return (data as CampSupplyRecord[]) || [];
}

export async function updateCampCapacity(
  campId: string,
  capacityAvailable: number,
): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("relief_camps")
    .update({
      capacity_available: capacityAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campId);

  if (error) {
    console.error("Failed to update camp capacity:", error.message);
    return false;
  }

  return true;
}

export async function updateCampSupplyQuantity(
  supplyId: string,
  quantity: number,
): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("camp_supplies")
    .update({
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", supplyId);

  if (error) {
    console.error("Failed to update supply quantity:", error.message);
    return false;
  }

  return true;
}

export async function updateCampStatus(
  campId: string,
  status: CampStatus,
): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("relief_camps")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campId);

  if (error) {
    console.error("Failed to update camp status:", error.message);
    return false;
  }

  return true;
}

export function subscribeToCamps(onChange: (payload: unknown) => void) {
  const supabase = createSupabaseBrowserClient();
  const channel = supabase
    .channel("realtime-camps")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "relief_camps" },
      (payload) => onChange(payload),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
