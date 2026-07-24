"use client";
import React, { useState } from "react";
import {
  AlertTriangle, Filter, ChevronRight, Search, MapPin, Clock, Building2
} from "lucide-react";
import { Card, Badge, StatusChip, Button, SearchInput, Select, Tabs, Pagination, EmptyState } from "../../components/ui";

import { useAuth } from "../../providers/AuthProvider";
import { useRealtimeEmergencies } from "@/hooks/useRealtimeEmergencies";

const mockEmergencies = [
  { id: "EM-2891", type: "Flood Evacuation", status: "en_route" as const, camp: "Camp Alpha", priority: "high", time: "Jul 22, 2026 · 09:14 AM", location: "Sector 14, New Delhi", people: 4 },
  { id: "EM-2845", type: "Medical Assistance", status: "resolved" as const, camp: "Camp Beta", priority: "critical", time: "Jul 21, 2026 · 3:22 PM", location: "Block B, Rohini", people: 2 },
  { id: "EM-2812", type: "Food & Shelter", status: "resolved" as const, camp: "Camp Delta", priority: "medium", time: "Jul 18, 2026 · 11:05 AM", location: "Dwarka Sector 6", people: 6 },
  { id: "EM-2798", type: "Structural Damage", status: "resolved" as const, camp: "Camp Sigma", priority: "high", time: "Jul 15, 2026 · 7:48 AM", location: "Janakpuri, Block C", people: 3 },
  { id: "EM-2751", type: "Flood Evacuation", status: "cancelled" as const, camp: "N/A", priority: "medium", time: "Jul 10, 2026 · 2:30 PM", location: "Mayur Vihar, Phase 2", people: 1 },
  { id: "EM-2709", type: "Medical Emergency", status: "resolved" as const, camp: "Camp Alpha", priority: "critical", time: "Jul 5, 2026 · 10:15 AM", location: "Laxmi Nagar, East Delhi", people: 2 },
];

const priorityConfig = {
  critical: { color: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]", label: "Critical" },
  high: { color: "bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]", label: "High" },
  medium: { color: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]", label: "Medium" },
  low: { color: "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]", label: "Low" },
};

interface Props {
  onNavigate: (page: string) => void;
}

export default function MyEmergencies({ onNavigate }: Props) {
  const { user } = useAuth();
  const { data: dbEmergencies = [] } = useRealtimeEmergencies({
    requesterId: user?.id,
  });

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const formattedDbEmergencies = dbEmergencies.map((em) => ({
    id: em.id.slice(0, 8),
    type: em.disaster_type.toUpperCase(),
    status: (em.status.toLowerCase().replace(" ", "_") || "submitted") as (typeof mockEmergencies)[0]["status"],
    camp: em.relief_camps?.name || "Pending Assignment",
    priority: em.urgency.toLowerCase(),
    time: new Date(em.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    location: em.address || `${em.district}, ${em.province}`,
    people: em.people_count,
  }));

  const emergencies = formattedDbEmergencies.length > 0 ? formattedDbEmergencies : mockEmergencies;

  const tabs = [
    { id: "all", label: "All", count: emergencies.length },
    { id: "active", label: "Active", count: emergencies.filter(e => ["submitted","assigned","accepted","en_route","arrived"].includes(e.status)).length },
    { id: "resolved", label: "Resolved", count: emergencies.filter(e => e.status === "resolved").length },
    { id: "cancelled", label: "Cancelled", count: emergencies.filter(e => e.status === "cancelled").length },
  ];

  const filtered = emergencies.filter((e) => {
    const matchTab = activeTab === "all" || (activeTab === "active" && ["submitted","assigned","accepted","en_route","arrived"].includes(e.status)) || e.status === activeTab;
    const matchSearch = search === "" || e.type.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="p-5 md:p-6 space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">My Emergencies</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{emergencies.length} total requests submitted</p>
        </div>
        <Button size="sm" onClick={() => onNavigate("create_emergency")} icon={<AlertTriangle size={14} />}>
          New Request
        </Button>
      </div>

      <Card padding="none">
        {/* Filters */}
        <div className="px-5 pt-4 pb-3 flex flex-col sm:flex-row gap-3">
          <SearchInput
            placeholder="Search by type or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <Select
            options={[
              { value: "all", label: "All Types" },
              { value: "flood", label: "Flood Evacuation" },
              { value: "medical", label: "Medical" },
              { value: "shelter", label: "Food & Shelter" },
            ]}
            className="sm:w-40"
          />
          <Button variant="outline" size="md" icon={<Filter size={14} />} className="sm:ml-auto">
            Filters
          </Button>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="px-5" />

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle size={20} />}
            title="No emergencies found"
            description="No requests match your current filters."
          />
        ) : (
          <div className="divide-y divide-[#F8FAFC]">
            {filtered.map((em) => {
              const priority = priorityConfig[em.priority as keyof typeof priorityConfig];
              return (
                <div
                  key={em.id}
                  className="px-5 py-4 hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                  onClick={() => onNavigate("emergency_details")}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${priority.color}`}>
                      <AlertTriangle size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-[#94A3B8] font-[family-name:var(--font-mono)]">
                              #{em.id}
                            </span>
                            <span className="text-sm font-semibold text-[#0F172A]">{em.type}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${priority.color}`}>
                              {priority.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                              <Clock size={10} /> {em.time}
                            </span>
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                              <MapPin size={10} /> {em.location}
                            </span>
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                              <Building2 size={10} /> {em.camp}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusChip status={em.status} />
                          <ChevronRight size={13} className="text-[#CBD5E1] group-hover:text-[#94A3B8] transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination page={page} total={filtered.length} perPage={10} onChange={setPage} />
      </Card>
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
