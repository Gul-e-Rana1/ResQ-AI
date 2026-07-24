import React, { useState } from "react";
import {
  Users, Shield, Building2, AlertTriangle, Search, Filter,
  MoreHorizontal, Ban, Eye, Download
} from "lucide-react";
import { Card, Badge, Button, SearchInput, Select, Tabs, Table, Pagination, Avatar, StatCard } from "../../components/ui";

const users = [
  { id: "u1", name: "Sarah Johnson", email: "sarah@example.com", role: "User", location: "New Delhi", emergencies: 12, joined: "Jan 15, 2026", status: "active" },
  { id: "u2", name: "Vikram Patel", email: "vikram@example.com", role: "User", location: "Mumbai", emergencies: 3, joined: "Feb 8, 2026", status: "active" },
  { id: "u3", name: "Meera Sharma", email: "meera@example.com", role: "User", location: "Chennai", emergencies: 7, joined: "Jan 22, 2026", status: "active" },
  { id: "u4", name: "Arjun Singh", email: "arjun@example.com", role: "User", location: "Hyderabad", emergencies: 1, joined: "Mar 5, 2026", status: "suspended" },
  { id: "u5", name: "Priya Kumari", email: "priya@example.com", role: "User", location: "Bangalore", emergencies: 5, joined: "Apr 12, 2026", status: "active" },
  { id: "u6", name: "Rajesh Kumar", email: "rajesh@example.com", role: "Camp Manager", location: "New Delhi", emergencies: 0, joined: "Jan 5, 2026", status: "active" },
  { id: "u7", name: "Sunita Roy", email: "sunita@example.com", role: "Camp Manager", location: "Kolkata", emergencies: 0, joined: "Feb 20, 2026", status: "active" },
  { id: "u8", name: "Lakshmi Nair", email: "lakshmi@example.com", role: "Camp Manager", location: "Chennai", emergencies: 0, joined: "Jul 20, 2026", status: "pending" },
];

type UserRow = typeof users[0];

interface Props {
  onNavigate: (page: string) => void;
}

export default function UsersPage({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const tabs = [
    { id: "all", label: "All Users", count: users.length },
    { id: "users", label: "Residents", count: users.filter(u => u.role === "User").length },
    { id: "managers", label: "Camp Managers", count: users.filter(u => u.role === "Camp Manager").length },
    { id: "suspended", label: "Suspended", count: users.filter(u => u.status === "suspended").length },
  ];

  const filtered = users.filter((u) => {
    const matchTab =
      activeTab === "all" ||
      (activeTab === "users" && u.role === "User") ||
      (activeTab === "managers" && u.role === "Camp Manager") ||
      (activeTab === "suspended" && u.status === "suspended");
    const matchSearch = search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const columns = [
    {
      key: "name",
      label: "User",
      render: (row: UserRow) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} size="sm" />
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">{row.name}</p>
            <p className="text-xs text-[#94A3B8]">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row: UserRow) => (
        <Badge variant={row.role === "Camp Manager" ? "green" : "blue"}>
          {row.role}
        </Badge>
      ),
    },
    { key: "location", label: "Location" },
    {
      key: "emergencies",
      label: "Requests",
      render: (row: UserRow) => (
        <span className="font-[family-name:var(--font-mono)] text-sm text-[#334155]">{row.emergencies}</span>
      ),
    },
    { key: "joined", label: "Joined" },
    {
      key: "status",
      label: "Status",
      render: (row: UserRow) => (
        <Badge variant={row.status === "active" ? "green" : row.status === "suspended" ? "red" : "yellow"} dot>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      render: () => (
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#334155] transition-all">
            <Eye size={13} />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-all">
            <Ban size={13} />
          </button>
        </div>
      ),
    },
  ] as { key: string; label: string; render?: (row: UserRow) => React.ReactNode }[];

  return (
    <div className="p-5 md:p-6 space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">Users</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{users.length} registered accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Download size={13} />}>Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Users" value="12,847" icon={<Users size={16} />} color="blue" />
        <StatCard label="Residents" value="12,189" icon={<Shield size={16} />} color="green" />
        <StatCard label="Camp Managers" value="658" icon={<Building2 size={16} />} color="orange" />
        <StatCard label="Suspended" value="24" icon={<Ban size={16} />} color="red" />
      </div>

      <Card padding="none">
        <div className="px-5 pt-4 pb-3 flex flex-wrap gap-2">
          <SearchInput
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select
            options={[
              { value: "all", label: "All Locations" },
              { value: "delhi", label: "New Delhi" },
              { value: "mumbai", label: "Mumbai" },
              { value: "chennai", label: "Chennai" },
            ]}
            className="w-40"
          />
          <Button variant="outline" size="md" icon={<Filter size={13} />} className="ml-auto">
            Filters
          </Button>
        </div>

        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="px-5" />

        <Table
          columns={columns}
          data={filtered}
        />

        <Pagination page={page} total={filtered.length} perPage={10} onChange={setPage} />
      </Card>
    </div>
  );
}
