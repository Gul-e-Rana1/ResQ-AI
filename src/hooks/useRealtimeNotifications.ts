"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  fetchUserNotifications,
  subscribeToUserNotifications,
  type NotificationRecord,
} from "@/lib/services/notifications";

export function useRealtimeNotifications(userId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["notifications", userId];

  const query = useQuery<NotificationRecord[]>({
    queryKey,
    queryFn: () => (userId ? fetchUserNotifications(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserNotifications(userId, () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    });

    return () => {
      unsubscribe();
    };
  }, [userId, queryClient]);

  return query;
}
