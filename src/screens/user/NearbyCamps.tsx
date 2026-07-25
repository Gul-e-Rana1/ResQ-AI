"use client";
import React, { useMemo, useState } from "react";
import {
  MapPin, ChevronRight, Shield, Phone, Zap, LocateFixed
} from "lucide-react";
import { Card, Badge, Button, SearchInput, Select, EmptyState } from "../../components/ui";
import { MapView, type MapCamp } from "../../components/MapView";
import { useRealtimeCamps } from "@/hooks/useRealtimeCamps";
import { useGeolocation } from "@/hooks/useGeolocation";

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

interface DisplayCamp {
  id: string;
  name: string;
  type: string;
  address: string;
  province: string;
  district: string;
  latitude: number;
  longitude: number;
  capacity: number;
  occupied: number;
  status: "active" | "full";
  facilities: string[];
  contact: string;
  departments: string[];
  verified: boolean;
  distanceKm: number | null;
}

interface Props {
  onNavigate: (page: string, id?: string) => void;
}

export default function NearbyCamps({ onNavigate }: Props) {
  const { data: dbCamps = [] } = useRealtimeCamps({ status: "approved" });
  const { coords, loading: locating, locate } = useGeolocation();
  const [view, setView] = useState<"list" | "map">("list");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "capacity">("distance");
  const [selectedCampId, setSelectedCampId] = useState<string | null>(null);

  const camps: DisplayCamp[] = useMemo(() => {
    return dbCamps.map((camp) => {
      const occupied = Math.max(0, camp.capacity_total - camp.capacity_available);
      const distanceKm = coords
        ? haversineDistanceKm(coords.latitude, coords.longitude, camp.latitude, camp.longitude)
        : null;
      return {
        id: camp.id,
        name: camp.name,
        type: "Relief Camp",
        address: `${camp.address}, ${camp.district}, ${camp.province}`,
        province: camp.province,
        district: camp.district,
        latitude: camp.latitude,
        longitude: camp.longitude,
        capacity: camp.capacity_total,
        occupied,
        status: camp.capacity_available === 0 ? "full" : "active",
        facilities: camp.services && camp.services.length > 0 ? camp.services : ["Medical", "Food", "Shelter"],
        contact: camp.contact_phone || "Not provided",
        departments: camp.services && camp.services.length > 0 ? camp.services : ["Relief"],
        verified: true,
        distanceKm,
      };
    });
  }, [dbCamps, coords]);

  const filtered = useMemo(() => {
    const list = camps.filter(
      (c) =>
        search === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.address.toLowerCase().includes(search.toLowerCase()),
    );
    return [...list].sort((a, b) => {
      if (sortBy === "distance") {
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      }
      return (b.capacity - b.occupied) - (a.capacity - a.occupied);
    });
  }, [camps, search, sortBy]);

  const selectedCamp = filtered.find((c) => c.id === selectedCampId) || filtered[0] || null;

  const pct = (c: DisplayCamp) => (c.capacity > 0 ? Math.round((c.occupied / c.capacity) * 100) : 0);

  const mapCamps: MapCamp[] = filtered.map((c) => ({
    id: c.id,
    name: c.name,
    latitude: c.latitude,
    longitude: c.longitude,
    capacity: c.capacity,
    occupied: c.occupied,
    status: c.status,
    address: c.address,
    type: "primary",
  }));

  return (
    <div className="p-5 md:p-6 space-y-5 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">Nearby Relief Camps</h1>
          <p className="text-sm text-[#64748B] mt-0.5 flex items-center gap-1">
            <MapPin size={13} className="text-[#2563EB]" />
            {coords ? "Sorted by your location" : "Enable location for distances"} · {filtered.length} camps found
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<LocateFixed size={13} />}
            loading={locating}
            onClick={() => locate()}
          >
            {coords ? "Update Location" : "Use My Location"}
          </Button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "list" ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#64748B] hover:bg-[#F1F5F9]"}`}
          >
            List
          </button>
          <button
            onClick={() => setView("map")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "map" ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#64748B] hover:bg-[#F1F5F9]"}`}
          >
            Map
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <SearchInput
          placeholder="Search camps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Select
          options={[
            { value: "distance", label: "Sort: Distance" },
            { value: "capacity", label: "Sort: Available Space" },
          ]}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "distance" | "capacity")}
          className="w-44"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MapPin size={20} />}
          title="No relief camps found"
          description={search ? "Try a different search term." : "There are no approved relief camps available right now."}
        />
      ) : view === "map" ? (
        <MapView
          height="500px"
          camps={mapCamps}
          userLocation={coords}
          onCampClick={(camp) => setSelectedCampId(camp.id)}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Camp list */}
          <div className="lg:col-span-1 space-y-3">
            {filtered.map((camp) => {
              const p = pct(camp);
              const isSelected = selectedCamp?.id === camp.id;
              return (
                <div
                  key={camp.id}
                  className={`p-4 bg-white border rounded-xl cursor-pointer transition-all
                    ${isSelected ? "border-[#2563EB] shadow-sm shadow-[#DBEAFE]" : "border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm"}`}
                  onClick={() => setSelectedCampId(camp.id)}
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-[#0F172A]">{camp.name}</p>
                        {camp.verified && (
                          <Shield size={12} className="text-[#2563EB]" />
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">{camp.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#94A3B8] flex items-center gap-0.5 justify-end mt-0.5">
                        <MapPin size={9} /> {camp.distanceKm !== null ? `${camp.distanceKm.toFixed(1)} km` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 mb-1">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${p}%`, background: p > 95 ? "#DC2626" : p > 75 ? "#EA580C" : "#059669" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#94A3B8]">{camp.capacity - camp.occupied} available</span>
                    <span className={p > 95 ? "text-[#DC2626] font-semibold" : p > 75 ? "text-[#EA580C] font-semibold" : "text-[#059669]"}>{p}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Camp detail panel */}
          <div className="lg:col-span-2">
            {selectedCamp && (
              <Card padding="none" className="h-full">
                {/* Map */}
                <MapView
                  height="200px"
                  className="rounded-t-xl rounded-b-none border-0"
                  camps={mapCamps.filter((c) => c.id === selectedCamp.id)}
                  userLocation={coords}
                />

                <div className="p-5 space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
                          {selectedCamp.name}
                        </h2>
                        {selectedCamp.verified && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-full">
                            <Shield size={10} className="text-[#2563EB]" />
                            <span className="text-[10px] font-semibold text-[#2563EB]">Verified</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[#64748B] mt-0.5">{selectedCamp.type}</p>
                      <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-1">
                        <MapPin size={10} /> {selectedCamp.address}
                      </p>
                    </div>
                    {selectedCamp.distanceKm !== null && (
                      <div className="flex items-center gap-1">
                        <MapPin size={13} className="text-[#2563EB]" />
                        <span className="text-sm font-semibold text-[#334155]">{selectedCamp.distanceKm.toFixed(1)} km</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#F8FAFC] rounded-xl p-3">
                      <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Capacity</p>
                      <p className="text-base font-semibold text-[#0F172A] mt-0.5">{selectedCamp.capacity}</p>
                    </div>
                    <div className="bg-[#ECFDF5] rounded-xl p-3">
                      <p className="text-[10px] text-[#059669] uppercase font-semibold">Available</p>
                      <p className="text-base font-semibold text-[#059669] mt-0.5">{selectedCamp.capacity - selectedCamp.occupied}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3">
                      <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Distance</p>
                      <p className="text-base font-semibold text-[#0F172A] mt-0.5">
                        {selectedCamp.distanceKm !== null ? `${selectedCamp.distanceKm.toFixed(1)} km` : "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div>
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-2">Facilities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCamp.facilities.map((f) => (
                        <span key={f} className="px-2.5 py-1 bg-[#F1F5F9] text-[#334155] text-xs rounded-full border border-[#E2E8F0]">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Departments */}
                  <div>
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-2">Departments</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCamp.departments.map((d) => (
                        <Badge key={d} variant="blue">{d}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
                    <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                      <Phone size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{selectedCamp.contact}</p>
                      <p className="text-xs text-[#64748B]">Camp Contact</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      fullWidth
                      icon={<Phone size={13} />}
                      disabled={selectedCamp.contact === "Not provided"}
                      onClick={() => {
                        if (selectedCamp.contact !== "Not provided") {
                          window.location.href = `tel:${selectedCamp.contact}`;
                        }
                      }}
                    >
                      Contact Camp
                    </Button>
                    <Button fullWidth onClick={() => onNavigate("camp_details", selectedCamp.id)} iconRight={<ChevronRight size={13} />}>
                      View Full Details
                    </Button>
                  </div>

                  <Button
                    variant="success"
                    fullWidth
                    onClick={() => onNavigate("create_emergency")}
                    icon={<Zap size={13} />}
                  >
                    Request Assistance from {selectedCamp.name}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
