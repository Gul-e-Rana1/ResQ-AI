"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  fetchEmergencies,
  subscribeToEmergencies,
  type EmergencyRecord,
} from "@/lib/services/emergencies";
import type { EmergencyStatus } from "@/types/domain";

export function useRealtimeEmergencies(params?: {
  requesterId?: string;
  assignedCampId?: string;
  status?: EmergencyStatus;
  limit?: number;
  enabled?: boolean;
}) {
  const queryClient = useQueryClient();
  const enabled = params?.enabled ?? true;
  const queryKey = [
    "emergencies",
    params?.requesterId,
    params?.assignedCampId,
    params?.status,
    params?.limit,
  ];

  const query = useQuery<EmergencyRecord[]>({
    queryKey,
    queryFn: () => fetchEmergencies(params),
    staleTime: 10_000,
    enabled,
  });

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribeToEmergencies(() => {
      queryClient.invalidateQueries({ queryKey: ["emergencies"] });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, enabled]);

  return query;
}
