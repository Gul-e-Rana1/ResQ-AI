import React, { useMemo, useState } from "react";
import { MapPin, Navigation, Shield, Home, AlertTriangle, X, ExternalLink } from "lucide-react";
import { Badge } from "./ui";

export interface MapCamp {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  occupied: number;
  status: "active" | "inactive" | "full";
  address: string;
  type: "primary" | "secondary" | "emergency";
}

export interface MapEmergency {
  id: string;
  latitude: number;
  longitude: number;
  status?: string;
}

interface MapViewProps {
  camps?: MapCamp[];
  emergencies?: MapEmergency[];
  userLocation?: { latitude: number; longitude: number } | null;
  height?: string;
  onCampClick?: (camp: MapCamp) => void;
  className?: string;
}

const campColors = {
  active: { marker: "#059669", label: "Active" },
  full: { marker: "#DC2626", label: "Full" },
  inactive: { marker: "#94A3B8", label: "Inactive" },
};

const campTypeIcons = {
  primary: <Shield size={10} className="text-white" />,
  secondary: <Home size={10} className="text-white" />,
  emergency: <AlertTriangle size={10} className="text-white" />,
};

const campTypeColors = {
  primary: "bg-[#2563EB]",
  secondary: "bg-[#059669]",
  emergency: "bg-[#EA580C]",
};

// Decorative background art (roads/blocks) — purely visual, not derived from data.
const decorativeRoads = [
  "M 0 45 Q 25 40 50 50 Q 75 60 100 45",
  "M 20 0 Q 25 25 30 50 Q 35 75 20 100",
  "M 0 70 Q 40 65 80 75 Q 90 78 100 70",
  "M 60 0 Q 65 30 70 60 Q 72 80 65 100",
  "M 0 20 Q 50 15 100 25",
  "M 30 0 Q 35 20 50 40 Q 65 60 60 100",
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Pakistan bounding box, used as a fallback so the map has a sensible default extent
// when there isn't enough real data yet to derive one.
const FALLBACK_BOUNDS = { minLat: 28.5, maxLat: 34.5, minLng: 69.5, maxLng: 75.5 };

function project(lat: number, lng: number, bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) {
  const latSpan = bounds.maxLat - bounds.minLat || 1;
  const lngSpan = bounds.maxLng - bounds.minLng || 1;
  const x = 10 + ((lng - bounds.minLng) / lngSpan) * 80;
  const y = 10 + ((bounds.maxLat - lat) / latSpan) * 80;
  return { x: Math.min(95, Math.max(5, x)), y: Math.min(95, Math.max(5, y)) };
}

export function MapView({
  camps = [],
  emergencies = [],
  userLocation = null,
  height = "400px",
  onCampClick,
  className = "",
}: MapViewProps) {
  const [selectedCamp, setSelectedCamp] = useState<MapCamp | null>(null);
  const [hoveredCamp, setHoveredCamp] = useState<string | null>(null);

  const bounds = useMemo(() => {
    const points: { lat: number; lng: number }[] = [
      ...camps.map((c) => ({ lat: c.latitude, lng: c.longitude })),
      ...emergencies.map((e) => ({ lat: e.latitude, lng: e.longitude })),
      ...(userLocation ? [{ lat: userLocation.latitude, lng: userLocation.longitude }] : []),
    ].filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));

    if (points.length === 0) return FALLBACK_BOUNDS;

    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const pad = 0.05;
    const minLat = Math.min(...lats) - pad;
    const maxLat = Math.max(...lats) + pad;
    const minLng = Math.min(...lngs) - pad;
    const maxLng = Math.max(...lngs) + pad;

    return {
      minLat,
      maxLat: maxLat > minLat ? maxLat : minLat + 0.1,
      minLng,
      maxLng: maxLng > minLng ? maxLng : minLng + 0.1,
    };
  }, [camps, emergencies, userLocation]);

  const handleCampClick = (camp: MapCamp) => {
    setSelectedCamp(camp);
    onCampClick?.(camp);
  };

  const occupancyPct = (camp: MapCamp) =>
    camp.capacity > 0 ? Math.round((camp.occupied / camp.capacity) * 100) : 0;

  const distanceToCamp = (camp: MapCamp) =>
    userLocation ? haversineKm(userLocation.latitude, userLocation.longitude, camp.latitude, camp.longitude) : null;

  return (
    <div
      className={`relative bg-[#EDF4ED] overflow-hidden rounded-xl border border-[#E2E8F0] ${className}`}
      style={{ height }}
    >
      {/* Map background layers */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect width="100" height="100" fill="#EDF4ED" />
        <rect x="5" y="5" width="18" height="12" rx="2" fill="#C8E6C9" />
        <rect x="40" y="60" width="14" height="10" rx="2" fill="#C8E6C9" />
        {[
          [10, 25, 12, 10], [25, 25, 10, 10], [38, 25, 12, 10],
          [55, 25, 10, 10], [68, 25, 12, 10],
          [10, 42, 10, 10], [25, 42, 14, 10], [42, 42, 10, 10],
          [55, 42, 12, 10], [70, 42, 10, 10],
          [10, 60, 12, 8], [25, 60, 8, 8], [58, 60, 10, 8],
          [72, 60, 10, 8], [10, 75, 8, 10], [22, 75, 12, 10], [38, 75, 8, 10],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="0.5" fill="#E8EDF0" stroke="#D4DAE0" strokeWidth="0.2" />
        ))}
        {decorativeRoads.map((d, i) => (
          <path key={i} d={d} stroke="#FFFFFF" strokeWidth={i % 2 === 0 ? "1.2" : "0.8"} fill="none" strokeLinecap="round" />
        ))}
        <path d="M 0 50 Q 50 48 100 52" stroke="#F5E6A3" strokeWidth="2" fill="none" />
        <path d="M 0 50 Q 50 48 100 52" stroke="#E6C800" strokeWidth="0.3" fill="none" strokeDasharray="3,2" />
      </svg>

      {/* Compass */}
      <div className="absolute top-3 right-3 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full border border-[#E2E8F0] shadow-sm flex items-center justify-center">
        <Navigation size={12} className="text-[#334155] -rotate-12" />
      </div>

      {/* Zoom controls */}
      <div className="absolute top-3 left-3 flex flex-col gap-0.5">
        <button className="w-7 h-7 bg-white/90 backdrop-blur-sm border border-[#E2E8F0] rounded-t-lg text-[#334155] hover:bg-white font-bold text-base flex items-center justify-center shadow-sm transition-all">+</button>
        <button className="w-7 h-7 bg-white/90 backdrop-blur-sm border border-[#E2E8F0] rounded-b-lg text-[#334155] hover:bg-white font-bold text-base flex items-center justify-center shadow-sm transition-all">−</button>
      </div>

      {/* Emergency markers */}
      {emergencies.map((em) => {
        const pos = project(em.latitude, em.longitude, bounds);
        return (
          <div
            key={em.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-[#DC2626]/20 rounded-full animate-ping" />
              <div className="w-6 h-6 bg-[#DC2626] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <AlertTriangle size={10} className="text-white" />
              </div>
            </div>
          </div>
        );
      })}

      {/* User location */}
      {userLocation && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: `${project(userLocation.latitude, userLocation.longitude, bounds).x}%`,
            top: `${project(userLocation.latitude, userLocation.longitude, bounds).y}%`,
          }}
        >
          <div className="relative">
            <div className="absolute -inset-3 bg-[#2563EB]/15 rounded-full" />
            <div className="absolute -inset-1 bg-[#2563EB]/25 rounded-full" />
            <div className="relative w-4 h-4 bg-[#2563EB] rounded-full border-2 border-white shadow-lg z-10">
              <div className="absolute inset-0 bg-[#2563EB]/50 rounded-full animate-ping" />
            </div>
          </div>
          <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap shadow">
            You
          </div>
        </div>
      )}

      {/* Camp markers */}
      {camps.map((camp) => {
        const pos = project(camp.latitude, camp.longitude, bounds);
        const colors = campColors[camp.status];
        const typeColor = campTypeColors[camp.type];
        const isSelected = selectedCamp?.id === camp.id;
        const isHovered = hoveredCamp === camp.id;
        const distanceKm = distanceToCamp(camp);
        return (
          <div
            key={camp.id}
            className="absolute transform -translate-x-1/2 -translate-y-full z-10 cursor-pointer"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={() => handleCampClick(camp)}
            onMouseEnter={() => setHoveredCamp(camp.id)}
            onMouseLeave={() => setHoveredCamp(null)}
          >
            <div className={`relative transition-transform duration-150 ${isSelected || isHovered ? "scale-125" : ""}`}>
              <div
                className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${typeColor}`}
                style={{ boxShadow: isSelected ? `0 0 0 3px ${colors.marker}40` : undefined }}
              >
                {campTypeIcons[camp.type]}
              </div>
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: `6px solid ${typeColor.includes("blue") ? "#2563EB" : typeColor.includes("green") ? "#059669" : "#EA580C"}`,
                }}
              />
            </div>

            {(isHovered || isSelected) && (
              <div className="absolute bottom-11 left-1/2 -translate-x-1/2 bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-2 shadow-lg text-center whitespace-nowrap min-w-32 slide-down z-30">
                <p className="text-xs font-semibold text-[#0F172A]">{camp.name}</p>
                {distanceKm !== null && (
                  <p className="text-[10px] text-[#64748B] mt-0.5">{distanceKm.toFixed(1)} km away</p>
                )}
                <div className="mt-1.5 w-full bg-[#F1F5F9] rounded-full h-1">
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{ width: `${occupancyPct(camp)}%`, background: occupancyPct(camp) > 90 ? "#DC2626" : occupancyPct(camp) > 70 ? "#EA580C" : "#059669" }}
                  />
                </div>
                <p className="text-[10px] text-[#64748B] mt-0.5">{occupancyPct(camp)}% full</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Selected camp panel */}
      {selectedCamp && (
        <div className="absolute bottom-3 right-3 w-64 bg-white rounded-xl border border-[#E2E8F0] shadow-xl p-4 scale-in z-30">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">{selectedCamp.name}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{selectedCamp.address}</p>
            </div>
            <button
              onClick={() => setSelectedCamp(null)}
              className="w-5 h-5 flex items-center justify-center text-[#94A3B8] hover:text-[#334155] hover:bg-[#F1F5F9] rounded transition-all"
            >
              <X size={12} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-[#F8FAFC] rounded-lg p-2">
              <p className="text-[10px] text-[#94A3B8] uppercase font-semibold tracking-wide">Capacity</p>
              <p className="text-sm font-semibold text-[#0F172A]">{selectedCamp.capacity}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-2">
              <p className="text-[10px] text-[#94A3B8] uppercase font-semibold tracking-wide">Available</p>
              <p className="text-sm font-semibold text-[#059669]">{selectedCamp.capacity - selectedCamp.occupied}</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#64748B]">Occupancy</span>
              <span className="text-xs font-semibold text-[#334155]">{occupancyPct(selectedCamp)}%</span>
            </div>
            <div className="w-full bg-[#F1F5F9] rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${occupancyPct(selectedCamp)}%`,
                  background: occupancyPct(selectedCamp) > 90 ? "#DC2626" : occupancyPct(selectedCamp) > 70 ? "#EA580C" : "#059669",
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <Badge variant={selectedCamp.status === "active" ? "green" : selectedCamp.status === "full" ? "red" : "gray"} dot>
              {campColors[selectedCamp.status].label}
            </Badge>
            {distanceToCamp(selectedCamp) !== null && (
              <span className="text-xs text-[#64748B] flex items-center gap-1">
                <MapPin size={10} />
                {distanceToCamp(selectedCamp)!.toFixed(1)} km
              </span>
            )}
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCamp.latitude},${selectedCamp.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg py-2 transition-colors"
          >
            Navigate <ExternalLink size={11} />
          </a>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/85 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#059669]" /> Active
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> Full
        </div>
        {userLocation && (
          <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" /> You
          </div>
        )}
      </div>
    </div>
  );
}
