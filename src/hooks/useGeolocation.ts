"use client";

import { useCallback, useState } from "react";

export interface GeoCoords {
  latitude: number;
  longitude: number;
}

export function useGeolocation() {
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback(() => {
    return new Promise<GeoCoords | null>((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setError("Geolocation is not supported by this browser.");
        resolve(null);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCoords(next);
          setLoading(false);
          resolve(next);
        },
        (err) => {
          setError(err.message || "Unable to determine your location.");
          setLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
      );
    });
  }, []);

  return { coords, loading, error, locate };
}
