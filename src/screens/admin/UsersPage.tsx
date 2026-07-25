import React, { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Users, Shield, Building2, Ban, Eye, CheckCircle
} from "lucide-react";
import {
  Card, Badge, Button, SearchInput, Select, Tabs, Table, Pagination, Avatar, StatCard,
  Modal, Alert, useToast, ToastContainer
} from "../../components/ui";
import {
  fetchUsers, setUserActive, fetchUserEmergencyCount, fetchUserRoleCounts,
  type AdminUserRecord,
} from "../../lib/services/users";
import { fetchAdminOverviewStats } from "../../lib/services/adminStats";
import { PAKISTAN_PROVINCES } from "../../lib/constants/pakistan";
import type { UserRole } from "../../types/domain";

type TabId = "all" | "users" | "managers" | "suspended";

const ROLE_LABELS: Record<UserRole, string> = {
  guest: "Guest",
  registered_user: "Resident",
  camp_manager: "Camp Manager",
  camp_team_member: "Team Member",
  admin: "Admin",
};

function locationLabel(u: AdminUserRecord) {
  return [u.city, u.district, u.province].filter(Boolean).join(", ") || "—";
}

interface Props {
  onNavigate: (page: string) => void;
}

export default function UsersPage({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("all");
  const [page, setPage] = useState(1);

  const [viewUser, setViewUser] = useState<AdminUserRecord | null>(null);
  const [confirmUser, setConfirmUser] = useState<AdminUserRecord | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search, province]);

  const overviewQuery = useQuery({
    queryKey: ["admin-overview-stats"],
    queryFn: fetchAdminOverviewStats,
    staleTime: 30_000,
  });

  const roleCountsQuery = useQuery({
    queryKey: ["admin-user-role-counts"],
    queryFn: fetchUserRoleCounts,
    staleTime: 30_000,
  });

  const roleParam: UserRole | undefined =
    activeTab === "users" ? "registered_user" : activeTab === "managers" ? "camp_manager" : undefined;
  const isActiveParam = activeTab === "suspended" ? false : undefined;
  const provinceParam = province !== "all" ? province : undefined;

  const usersQuery = useQuery({
    queryKey: ["admin-users", activeTab, search, provinceParam, page],
    queryFn: () =>
      fetchUsers({
        search: search || undefined,
        role: roleParam,
        isActive: isActiveParam,
        province: provinceParam,
        page,
        pageSize: 10,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const emergencyCountQuery = useQuery({
    queryKey: ["admin-user-emergency-count", viewUser?.id],
    queryFn: () => fetchUserEmergencyCount(viewUser!.id),
    enabled: !!viewUser,
    staleTime: 30_000,
  });

  const users = usersQuery.data?.users || [];
  const total = usersQuery.data?.total || 0;

  const tabs = [
    { id: "all", label: "All Users", count: overviewQuery.data?.totalUsers ?? 0 },
    { id: "users", label: "Residents", count: roleCountsQuery.data?.residents ?? 0 },
    { id: "managers", label: "Camp Managers", count: roleCountsQuery.data?.campManagers ?? 0 },
    { id: "suspended", label: "Suspended", count: roleCountsQuery.data?.suspended ?? 0 },
  ];

  const openConfirm = (u: AdminUserRecord) => {
    setConfirmUser(u);
    setStatusError(null);
  };

  const closeConfirm = () => {
    setConfirmUser(null);
    setStatusError(null);
    setStatusLoading(false);
  };

  const confirmStatusChange = async () => {
    if (!confirmUser) return;
    setStatusLoading(true);
    setStatusError(null);
    const nextActive = !confirmUser.is_active;
    const ok = await setUserActive(confirmUser.id, nextActive);
    setStatusLoading(false);
    if (ok) {
      addToast("success", `${confirmUser.full_name || confirmUser.email} ${nextActive ? "activated" : "suspended"}`);
      usersQuery.refetch();
      roleCountsQuery.refetch();
      setConfirmUser(null);
    } else {
      setStatusError("Failed to update this user's status. Please try again.");
    }
  };

  const columns = [
    {
      key: "name",
      label: "User",
      render: (row: AdminUserRecord) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.full_name || row.email} size="sm" />
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">{row.full_name || "—"}</p>
            <p className="text-xs text-[#94A3B8]">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row: AdminUserRecord) => (
        <Badge variant={row.role === "camp_manager" ? "green" : row.role === "admin" ? "purple" : "blue"}>
          {ROLE_LABELS[row.role] || row.role}
        </Badge>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (row: AdminUserRecord) => <span>{locationLabel(row)}</span>,
    },
    {
      key: "phone",
      label: "Phone",
      render: (row: AdminUserRecord) => <span>{row.phone || "—"}</span>,
    },
    {
      key: "joined",
      label: "Joined",
      render: (row: AdminUserRecord) => <span>{new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row: AdminUserRecord) => (
        <Badge variant={row.is_active ? "green" : "red"} dot>
          {row.is_active ? "Active" : "Suspended"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row: AdminUserRecord) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewUser(row)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#334155] transition-all"
          >
            <Eye size={13} />
          </button>
          <button
            onClick={() => openConfirm(row)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
              row.is_active
                ? "text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                : "text-[#94A3B8] hover:bg-[#ECFDF5] hover:text-[#059669]"
            }`}
          >
            {row.is_active ? <Ban size={13} /> : <CheckCircle size={13} />}
          </button>
        </div>
      ),
    },
  ] as { key: string; label: string; render?: (row: AdminUserRecord) => React.ReactNode }[];

  return (
    <div className="p-5 md:p-6 space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">Users</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            {overviewQuery.data ? `${overviewQuery.data.totalUsers.toLocaleString()} registered accounts` : "Registered accounts"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={overviewQuery.data ? overviewQuery.data.totalUsers.toLocaleString() : "—"} icon={<Users size={16} />} color="blue" />
        <StatCard label="Residents" value={roleCountsQuery.data ? roleCountsQuery.data.residents.toLocaleString() : "—"} icon={<Shield size={16} />} color="green" />
        <StatCard label="Camp Managers" value={roleCountsQuery.data ? roleCountsQuery.data.campManagers.toLocaleString() : "—"} icon={<Building2 size={16} />} color="orange" />
        <StatCard label="Suspended" value={roleCountsQuery.data ? roleCountsQuery.data.suspended.toLocaleString() : "—"} icon={<Ban size={16} />} color="red" />
      </div>

      <Card padding="none">
        <div className="px-5 pt-4 pb-3 flex flex-wrap gap-2">
          <SearchInput
            placeholder="Search users..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-64"
          />
          <Select
            options={[
              { value: "all", label: "All Provinces" },
              ...PAKISTAN_PROVINCES.map((p) => ({ value: p, label: p })),
            ]}
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-56"
          />
        </div>

        <Tabs tabs={tabs} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} className="px-5" />

        <Table
          columns={columns}
          data={users}
          emptyMessage={usersQuery.isLoading ? "Loading users…" : "No users found"}
        />

        <Pagination page={page} total={total} perPage={10} onChange={setPage} />
      </Card>

      {/* View user modal */}
      {viewUser && (
        <Modal open={!!viewUser} onClose={() => setViewUser(null)} title={viewUser.full_name || viewUser.email} size="md">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Email", value: viewUser.email },
                { label: "Phone", value: viewUser.phone || "—" },
                { label: "Role", value: ROLE_LABELS[viewUser.role] || viewUser.role },
                { label: "Status", value: viewUser.is_active ? "Active" : "Suspended" },
                { label: "Location", value: locationLabel(viewUser) },
                { label: "Joined", value: new Date(viewUser.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide">{item.label}</p>
                  <p className="text-sm font-medium text-[#334155] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide">Emergency Requests Filed</p>
              <p className="text-sm font-medium text-[#334155] mt-0.5">
                {emergencyCountQuery.isLoading ? "…" : emergencyCountQuery.data ?? 0}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Suspend / activate confirmation */}
      <Modal
        open={!!confirmUser}
        onClose={closeConfirm}
        title={confirmUser?.is_active ? "Suspend User" : "Activate User"}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={closeConfirm} disabled={statusLoading}>Cancel</Button>
            <Button
              variant={confirmUser?.is_active ? "danger" : "success"}
              size="sm"
              loading={statusLoading}
              onClick={confirmStatusChange}
            >
              {confirmUser?.is_active ? "Suspend" : "Activate"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[#64748B]">
            {confirmUser?.is_active
              ? `Suspend ${confirmUser?.full_name || confirmUser?.email}? They will lose access to the platform until reactivated.`
              : `Activate ${confirmUser?.full_name || confirmUser?.email}? They will regain access to the platform.`}
          </p>
          {statusError && (
            <Alert type="error" title="Action failed">
              {statusError}
            </Alert>
          )}
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
