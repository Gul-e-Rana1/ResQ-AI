import React, { useState } from "react";
import {
  MapPin, Filter, ChevronRight, Search, Star, Users, Clock,
  Phone, Shield, Building2, Zap
} from "lucide-react";
import { Card, Badge, Button, SearchInput, Select, Tabs } from "../../components/ui";
import { MapView } from "../../components/MapView";
import { useRealtimeCamps } from "@/hooks/useRealtimeCamps";

const mockCamps = [
  {
    id: "c1", name: "Camp Alpha", type: "Primary Relief Center", distance: "1.2 km",
    address: "123 Relief Road, Sector 4, New Delhi", capacity: 500, occupied: 380,
    status: "active" as const, rating: 4.8, reviews: 241,
    facilities: ["Medical", "Food", "Shelter", "Water", "Children Area"],
    contact: "+91 98765 43210", coordinator: "Rajesh Kumar",
    departments: ["Medical", "Rescue", "Food Distribution", "Counseling"],
    verified: true
  },
  {
    id: "c2", name: "Camp Beta", type: "Secondary Relief Camp", distance: "2.8 km",
    address: "45 Emergency Avenue, Block B, Rohini", capacity: 300, occupied: 290,
    status: "active" as const, rating: 4.5, reviews: 158,
    facilities: ["Medical", "Food", "Shelter", "Water"],
    contact: "+91 87654 32100", coordinator: "Sunita Sharma",
    departments: ["Medical", "Food Distribution", "Logistics"],
    verified: true
  },
  {
    id: "c3", name: "Camp Delta", type: "Emergency Triage Center", distance: "3.5 km",
    address: "78 Crisis Blvd, Zone 2, Dwarka", capacity: 200, occupied: 65,
    status: "active" as const, rating: 4.6, reviews: 89,
    facilities: ["Medical", "Food", "Shelter", "Water", "Trauma Support"],
    contact: "+91 76543 21000", coordinator: "Dr. Anita Patel",
    departments: ["Medical", "Trauma", "Food Distribution"],
    verified: true
  },
  {
    id: "c4", name: "Camp Sigma", type: "Primary Relief Center", distance: "4.1 km",
    address: "200 North Relief St, Area 6, Gurgaon", capacity: 400, occupied: 400,
    status: "active" as const, rating: 4.3, reviews: 312,
    facilities: ["Medical", "Food", "Shelter", "Water"],
    contact: "+91 65432 10987", coordinator: "Vikram Singh",
    departments: ["Medical", "Rescue", "Food Distribution"],
    verified: true
  },
  {
    id: "c5", name: "Camp Omega", type: "Secondary Relief Camp", distance: "5.6 km",
    address: "9 Westside Camp, District 3, Noida", capacity: 350, occupied: 120,
    status: "active" as const, rating: 4.7, reviews: 76,
    facilities: ["Medical", "Food", "Shelter", "Water", "Children Area", "Women's Cell"],
    contact: "+91 54321 09876", coordinator: "Meera Joshi",
    departments: ["Medical", "Rescue", "Women Safety", "Children Care"],
    verified: true
  },
];

interface Props {
  onNavigate: (page: string) => void;
}

export default function NearbyCamps({ onNavigate }: Props) {
  const { data: dbCamps = [] } = useRealtimeCamps();
  const [view, setView] = useState<"list" | "map">("list");
  const [search, setSearch] = useState("");

  const formattedDbCamps = dbCamps.map((camp) => ({
    id: camp.id,
    name: camp.name,
    type: "Relief Camp",
    distance: "Near you",
    address: `${camp.address}, ${camp.district}, ${camp.province}`,
    capacity: camp.capacity_total,
    occupied: Math.max(0, camp.capacity_total - camp.capacity_available),
    status: (camp.status === "approved" ? "active" : camp.status) as (typeof mockCamps)[0]["status"],
    rating: 4.8,
    reviews: 120,
    facilities: camp.services || ["Medical", "Food", "Shelter"],
    contact: camp.contact_phone || "Emergency Contact",
    coordinator: "Camp Manager",
    departments: camp.services || ["Medical", "Relief"],
    verified: true,
  }));

  const camps = formattedDbCamps.length > 0 ? formattedDbCamps : mockCamps;
  const [selectedCamp, setSelectedCamp] = useState(camps[0]);

  const activeSelectedCamp = camps.find((c) => c.id === selectedCamp?.id) || camps[0];

  const filtered = camps.filter((c) =>
    search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase())
  );

  const pct = (c: (typeof mockCamps)[0]) => Math.round((c.occupied / c.capacity) * 100);

  return (
    <div className="p-5 md:p-6 space-y-5 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">Nearby Relief Camps</h1>
          <p className="text-sm text-[#64748B] mt-0.5 flex items-center gap-1">
            <MapPin size={13} className="text-[#2563EB]" />
            Sector 14, New Delhi · {camps.length} camps found
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            { value: "rating", label: "Sort: Rating" },
          ]}
          className="w-44"
        />
        <Select
          options={[
            { value: "all", label: "All Types" },
            { value: "primary", label: "Primary Center" },
            { value: "secondary", label: "Secondary Camp" },
            { value: "triage", label: "Triage Center" },
          ]}
          className="w-44"
        />
      </div>

      {view === "map" ? (
        <MapView height="500px" onCampClick={() => onNavigate("camp_details")} />
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Camp list */}
          <div className="lg:col-span-1 space-y-3">
            {filtered.map((camp: (typeof mockCamps)[0]) => {
              const p = pct(camp);
              const isSelected = activeSelectedCamp.id === camp.id;
              return (
                <div
                  key={camp.id}
                  className={`p-4 bg-white border rounded-xl cursor-pointer transition-all
                    ${isSelected ? "border-[#2563EB] shadow-sm shadow-[#DBEAFE]" : "border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm"}`}
                  onClick={() => setSelectedCamp(camp)}
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
                      <div className="flex items-center gap-1 justify-end">
                        <Star size={10} className="text-[#D97706] fill-[#D97706]" />
                        <span className="text-xs font-semibold text-[#334155]">{camp.rating}</span>
                      </div>
                      <p className="text-xs text-[#94A3B8] flex items-center gap-0.5 justify-end mt-0.5">
                        <MapPin size={9} /> {camp.distance}
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
                <MapView height="200px" className="rounded-t-xl rounded-b-none border-0" />

                <div className="p-5 space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
                          {selectedCamp.name}
                        </h2>
                        {activeSelectedCamp.verified && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-full">
                            <Shield size={10} className="text-[#2563EB]" />
                            <span className="text-[10px] font-semibold text-[#2563EB]">Verified</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[#64748B] mt-0.5">{activeSelectedCamp.type}</p>
                      <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-1">
                        <MapPin size={10} /> {activeSelectedCamp.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-[#D97706] fill-[#D97706]" />
                      <span className="text-sm font-semibold text-[#334155]">{activeSelectedCamp.rating}</span>
                      <span className="text-xs text-[#94A3B8]">({activeSelectedCamp.reviews})</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#F8FAFC] rounded-xl p-3">
                      <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Capacity</p>
                      <p className="text-base font-semibold text-[#0F172A] mt-0.5">{activeSelectedCamp.capacity}</p>
                    </div>
                    <div className="bg-[#ECFDF5] rounded-xl p-3">
                      <p className="text-[10px] text-[#059669] uppercase font-semibold">Available</p>
                      <p className="text-base font-semibold text-[#059669] mt-0.5">{activeSelectedCamp.capacity - activeSelectedCamp.occupied}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3">
                      <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Distance</p>
                      <p className="text-base font-semibold text-[#0F172A] mt-0.5">{activeSelectedCamp.distance}</p>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div>
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-2">Facilities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeSelectedCamp.facilities.map((f: string) => (
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
                      {activeSelectedCamp.departments.map((d: string) => (
                        <Badge key={d} variant="blue">{d}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Coordinator */}
                  <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
                    <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#2563EB] text-sm font-bold flex items-center justify-center">
                      {activeSelectedCamp.coordinator.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{activeSelectedCamp.coordinator}</p>
                      <p className="text-xs text-[#64748B]">Camp Coordinator</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] transition-colors">
                        <Phone size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button variant="outline" fullWidth icon={<Phone size={13} />}>
                      Contact Camp
                    </Button>
                    <Button fullWidth onClick={() => onNavigate("camp_details")} iconRight={<ChevronRight size={13} />}>
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
