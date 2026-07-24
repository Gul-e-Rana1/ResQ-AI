"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  fetchReliefCamps,
  subscribeToCamps,
  type ReliefCampRecord,
} from "@/lib/services/camps";
import type { CampStatus } from "@/types/domain";

export function useRealtimeCamps(params?: {
  status?: CampStatus;
  province?: string;
  district?: string;
  acceptingOnly?: boolean;
}) {
  const queryClient = useQueryClient();
  const queryKey = [
    "relief_camps",
    params?.status,
    params?.province,
    params?.district,
    params?.acceptingOnly,
  ];

  const query = useQuery<ReliefCampRecord[]>({
    queryKey,
    queryFn: () => fetchReliefCamps(params),
    staleTime: 30_000,
  });

  useEffect(() => {
    const unsubscribe = subscribeToCamps(() => {
      queryClient.invalidateQueries({ queryKey: ["relief_camps"] });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return query;
}
