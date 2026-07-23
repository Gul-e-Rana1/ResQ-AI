import React, { useState } from "react";
import { MapPin, Navigation, Zap, Shield, Home, AlertTriangle, X, ExternalLink } from "lucide-react";
import { Badge, StatusChip } from "./ui";

interface Camp {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  occupied: number;
  status: "active" | "inactive" | "full";
  distance: string;
  address: string;
  type: "primary" | "secondary" | "emergency";
}

interface Emergency {
  id: string;
  lat: number;
  lng: number;
  status: string;
  type: string;
}

interface MapViewProps {
  camps?: Camp[];
  emergencies?: Emergency[];
  showUserLocation?: boolean;
  height?: string;
  onCampClick?: (camp: Camp) => void;
  className?: string;
}

const defaultCamps: Camp[] = [
  { id: "c1", name: "Camp Alpha", lat: 40, lng: 30, capacity: 500, occupied: 380, status: "active", distance: "1.2 km", address: "123 Relief Rd, Sector 4", type: "primary" },
  { id: "c2", name: "Camp Beta", lat: 65, lng: 55, capacity: 300, occupied: 290, status: "active", distance: "2.8 km", address: "45 Emergency Ave, Block B", type: "secondary" },
  { id: "c3", name: "Camp Delta", lat: 30, lng: 70, capacity: 200, occupied: 65, status: "active", distance: "3.5 km", address: "78 Crisis Blvd, Zone 2", type: "emergency" },
  { id: "c4", name: "Camp Sigma", lat: 75, lng: 20, capacity: 400, occupied: 400, status: "full", distance: "4.1 km", address: "200 North Relief St, Area 6", type: "primary" },
  { id: "c5", name: "Camp Omega", lat: 55, lng: 80, capacity: 350, occupied: 120, status: "active", distance: "5.6 km", address: "9 Westside Camp, District 3", type: "secondary" },
];

const campColors = {
  active: { marker: "#059669", ring: "#D1FAE5", label: "Active" },
  full: { marker: "#DC2626", ring: "#FECACA", label: "Full" },
  inactive: { marker: "#94A3B8", ring: "#E2E8F0", label: "Inactive" },
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

// Fake map roads SVG paths
const roads = [
  "M 0 45 Q 25 40 50 50 Q 75 60 100 45",
  "M 20 0 Q 25 25 30 50 Q 35 75 20 100",
  "M 0 70 Q 40 65 80 75 Q 90 78 100 70",
  "M 60 0 Q 65 30 70 60 Q 72 80 65 100",
  "M 0 20 Q 50 15 100 25",
  "M 30 0 Q 35 20 50 40 Q 65 60 60 100",
];

export function MapView({ camps = defaultCamps, emergencies = [], showUserLocation = true, height = "400px", onCampClick, className = "" }: MapViewProps) {
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [hoveredCamp, setHoveredCamp] = useState<string | null>(null);

  const handleCampClick = (camp: Camp) => {
    setSelectedCamp(camp);
    onCampClick?.(camp);
  };

  const occupancyPct = (camp: Camp) => Math.round((camp.occupied / camp.capacity) * 100);

  return (
    <div
      className={`relative bg-[#EDF4ED] overflow-hidden rounded-xl border border-[#E2E8F0] ${className}`}
      style={{ height }}
    >
      {/* Map background layers */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Background */}
        <rect width="100" height="100" fill="#EDF4ED" />

        {/* Water body */}
        <ellipse cx="85" cy="85" rx="18" ry="14" fill="#D4E8F4" />
        <text x="80" y="87" fontSize="3" fill="#94C8E4" textAnchor="middle" style={{ userSelect: "none" }}>Lake</text>

        {/* Parks */}
        <rect x="5" y="5" width="18" height="12" rx="2" fill="#C8E6C9" />
        <rect x="40" y="60" width="14" height="10" rx="2" fill="#C8E6C9" />

        {/* City blocks */}
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

        {/* Roads */}
        {roads.map((d, i) => (
          <path key={i} d={d} stroke="#FFFFFF" strokeWidth={i % 2 === 0 ? "1.2" : "0.8"} fill="none" strokeLinecap="round" />
        ))}

        {/* Highway */}
        <path d="M 0 50 Q 50 48 100 52" stroke="#F5E6A3" strokeWidth="2" fill="none" />
        <path d="M 0 50 Q 50 48 100 52" stroke="#E6C800" strokeWidth="0.3" fill="none" strokeDasharray="3,2" />
      </svg>

      {/* Scale bar */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[10px] text-[#64748B] border border-[#E2E8F0] shadow-sm">
        <div className="w-8 h-1 bg-[#334155] rounded-full relative">
          <div className="absolute -top-0.5 left-0 w-px h-2 bg-[#334155]" />
          <div className="absolute -top-0.5 right-0 w-px h-2 bg-[#334155]" />
        </div>
        <span>2 km</span>
      </div>

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
      {emergencies.map((em) => (
        <div
          key={em.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: `${em.lat}%`, top: `${em.lng}%` }}
        >
          <div className="relative">
            <div className="absolute -inset-2 bg-[#DC2626]/20 rounded-full animate-ping" />
            <div className="w-6 h-6 bg-[#DC2626] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <AlertTriangle size={10} className="text-white" />
            </div>
          </div>
        </div>
      ))}

      {/* User location */}
      {showUserLocation && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{ left: "50%", top: "55%" }}
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
        const colors = campColors[camp.status];
        const typeColor = campTypeColors[camp.type];
        const isSelected = selectedCamp?.id === camp.id;
        const isHovered = hoveredCamp === camp.id;
        return (
          <div
            key={camp.id}
            className="absolute transform -translate-x-1/2 -translate-y-full z-10 cursor-pointer"
            style={{ left: `${camp.lat}%`, top: `${camp.lng}%` }}
            onClick={() => handleCampClick(camp)}
            onMouseEnter={() => setHoveredCamp(camp.id)}
            onMouseLeave={() => setHoveredCamp(null)}
          >
            {/* Marker */}
            <div className={`relative transition-transform duration-150 ${isSelected || isHovered ? "scale-125" : ""}`}>
              <div
                className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${typeColor}`}
                style={{ boxShadow: isSelected ? `0 0 0 3px ${colors.marker}40` : undefined }}
              >
                {campTypeIcons[camp.type]}
              </div>
              {/* Pin point */}
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: `6px solid ${typeColor.includes("blue") ? "#2563EB" : typeColor.includes("green") ? "#059669" : "#EA580C"}`,
                }}
              />
            </div>

            {/* Label */}
            {(isHovered || isSelected) && (
              <div className="absolute bottom-11 left-1/2 -translate-x-1/2 bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-2 shadow-lg text-center whitespace-nowrap min-w-32 slide-down z-30">
                <p className="text-xs font-semibold text-[#0F172A]">{camp.name}</p>
                <p className="text-[10px] text-[#64748B] mt-0.5">{camp.distance} away</p>
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

          <div className="flex items-center justify-between">
            <Badge variant={selectedCamp.status === "active" ? "green" : selectedCamp.status === "full" ? "red" : "gray"} dot>
              {campColors[selectedCamp.status].label}
            </Badge>
            <span className="text-xs text-[#64748B] flex items-center gap-1">
              <MapPin size={10} />
              {selectedCamp.distance}
            </span>
          </div>
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
        <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" /> You
        </div>
      </div>
    </div>
  );
}
