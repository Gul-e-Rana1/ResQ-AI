import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { uniqueChannelName } from "@/lib/supabase/channel";
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

export interface CreateCampApplicationInput {
  managerId: string;
  name: string;
  description?: string;
  province: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  capacityTotal: number;
  contactPhone?: string;
  contactEmail?: string;
  supportedDisasters: DisasterType[];
}

export async function createCampApplication(
  input: CreateCampApplicationInput,
): Promise<{ camp: ReliefCampRecord | null; error?: string }> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("relief_camps")
    .insert([
      {
        manager_id: input.managerId,
        name: input.name,
        description: input.description || null,
        province: input.province,
        district: input.district,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        capacity_total: input.capacityTotal,
        capacity_available: input.capacityTotal,
        contact_phone: input.contactPhone || null,
        contact_email: input.contactEmail || null,
        supported_disasters: input.supportedDisasters,
      },
    ])
    .select()
    .single();

  if (error) {
    return { camp: null, error: error.message };
  }

  return { camp: data as ReliefCampRecord };
}

export async function fetchCampByManagerId(managerId: string): Promise<ReliefCampRecord | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("relief_camps")
    .select("*")
    .eq("manager_id", managerId)
    .maybeSingle();

  if (error) {
    console.warn("Failed to fetch camp by manager:", error.message);
    return null;
  }

  return data as ReliefCampRecord | null;
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

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export interface CampRecommendation {
  camp: ReliefCampRecord;
  score: number;
  distanceKm: number | null;
}

export async function recommendCamps(input: {
  disasterType: DisasterType;
  requiredSupplies?: string[];
  userLocation?: { latitude: number; longitude: number };
  limit?: number;
}): Promise<CampRecommendation[]> {
  const supabase = createSupabaseBrowserClient();
  const camps = await fetchReliefCamps({ status: "approved", acceptingOnly: true });
  const candidates = camps.filter((c) => c.capacity_available > 0);

  let suppliesByCamp = new Map<string, Set<string>>();
  if (input.requiredSupplies && input.requiredSupplies.length > 0 && candidates.length > 0) {
    const { data: supplies } = await supabase
      .from("camp_supplies")
      .select("camp_id, category, name, quantity")
      .in(
        "camp_id",
        candidates.map((c) => c.id),
      )
      .gt("quantity", 0);

    suppliesByCamp = (supplies || []).reduce((map, row) => {
      const set = map.get(row.camp_id) || new Set<string>();
      set.add(String(row.category).toLowerCase());
      set.add(String(row.name).toLowerCase());
      map.set(row.camp_id, set);
      return map;
    }, new Map<string, Set<string>>());
  }

  const scored: CampRecommendation[] = candidates.map((camp) => {
    const distanceKm = input.userLocation
      ? haversineKm(
          input.userLocation.latitude,
          input.userLocation.longitude,
          camp.latitude,
          camp.longitude,
        )
      : null;

    const supportsDisaster = camp.supported_disasters.includes(input.disasterType);
    const capacityRatio = camp.capacity_total > 0 ? camp.capacity_available / camp.capacity_total : 0;

    let supplyMatchRatio = 0;
    if (input.requiredSupplies && input.requiredSupplies.length > 0) {
      const campSupplies = suppliesByCamp.get(camp.id) || new Set<string>();
      const matches = input.requiredSupplies.filter((s) => campSupplies.has(s.toLowerCase()));
      supplyMatchRatio = matches.length / input.requiredSupplies.length;
    }

    let score = 0;
    if (supportsDisaster) score += 40;
    score += capacityRatio * 25;
    score += supplyMatchRatio * 20;
    score += distanceKm !== null ? Math.max(0, 15 - distanceKm / 2) : 7;

    return { camp, score, distanceKm };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, input.limit ?? 5);
}

export function subscribeToCamps(onChange: (payload: unknown) => void) {
  const supabase = createSupabaseBrowserClient();
  const channel = supabase
    .channel(uniqueChannelName("realtime-camps"))
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
