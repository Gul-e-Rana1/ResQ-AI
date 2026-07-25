"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCampByManagerId, fetchCampById, type ReliefCampRecord } from "@/lib/services/camps";
import { fetchMyCampMembership } from "@/lib/services/campTeam";
import { useAuth } from "@/providers/AuthProvider";

export function useMyCamp() {
  const { user, profile } = useAuth();
  const role = profile?.role;

  return useQuery<ReliefCampRecord | null>({
    queryKey: ["my-camp", user?.id, role],
    queryFn: async () => {
      if (!user) return null;
      if (role === "camp_manager") {
        return fetchCampByManagerId(user.id);
      }
      if (role === "camp_team_member") {
        const membership = await fetchMyCampMembership(user.id);
        if (!membership) return null;
        return fetchCampById(membership.camp_id);
      }
      return null;
    },
    enabled: !!user && (role === "camp_manager" || role === "camp_team_member"),
    staleTime: 30_000,
  });
}
