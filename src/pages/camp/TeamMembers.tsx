import React, { useState } from "react";
import { Users, Plus, Phone, Mail, Search, Edit, Trash2, Shield } from "lucide-react";
import { Card, Badge, Button, SearchInput, Avatar, Modal, Input, Select, ConfirmDialog } from "../../components/ui";

const members = [
  { id: "1", name: "Ravi Kumar", role: "Team Lead", dept: "Rescue", phone: "+91 98765 43210", email: "ravi@campalpha.org", status: "on_duty", joined: "Jan 2026" },
  { id: "2", name: "Priya Singh", role: "Medical Officer", dept: "Medical", phone: "+91 87654 32109", email: "priya@campalpha.org", status: "on_duty", joined: "Feb 2026" },
  { id: "3", name: "Arjun Patel", role: "Rescue Specialist", dept: "Rescue", phone: "+91 76543 21098", email: "arjun@campalpha.org", status: "en_route", joined: "Jan 2026" },
  { id: "4", name: "Sunita Roy", role: "Coordinator", dept: "Operations", phone: "+91 65432 10987", email: "sunita@campalpha.org", status: "available", joined: "Mar 2026" },
  { id: "5", name: "Meera Joshi", role: "Nurse", dept: "Medical", phone: "+91 54321 09876", email: "meera@campalpha.org", status: "off_duty", joined: "Apr 2026" },
  { id: "6", name: "Rahul Gupta", role: "Driver", dept: "Logistics", phone: "+91 43210 98765", email: "rahul@campalpha.org", status: "available", joined: "May 2026" },
];

const depts = ["All", "Rescue", "Medical", "Operations", "Logistics"];

const statusConfig = {
  on_duty: { label: "On Duty", variant: "green" as const },
  en_route: { label: "En Route", variant: "orange" as const },
  available: { label: "Available", variant: "blue" as const },
  off_duty: { label: "Off Duty", variant: "gray" as const },
};

export default function TeamMembers() {
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string>("");

  const filtered = members.filter((m) => {
    const matchDept = activeDept === "All" || m.dept === activeDept;
    const matchSearch = search === "" || m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  return (
    <div className="p-5 md:p-6 space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">Team Members</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Camp Alpha · {members.length} members</p>
        </div>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setAddOpen(true)}>Add Member</Button>
      </div>

      {/* Dept filter */}
      <div className="flex gap-2 flex-wrap">
        <SearchInput
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        {depts.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDept(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeDept === d ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"}`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Staff", value: members.length, color: "text-[#0F172A]" },
          { label: "On Duty", value: members.filter(m => m.status === "on_duty").length, color: "text-[#059669]" },
          { label: "En Route", value: members.filter(m => m.status === "en_route").length, color: "text-[#EA580C]" },
          { label: "Available", value: members.filter(m => m.status === "available").length, color: "text-[#2563EB]" },
        ].map((s, i) => (
          <Card key={i} padding="sm">
            <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide">{s.label}</p>
            <p className={`text-2xl font-semibold mt-1 font-[family-name:var(--font-display)] ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card padding="none">
        <div className="divide-y divide-[#F8FAFC]">
          {filtered.map((m) => {
            const sc = statusConfig[m.status as keyof typeof statusConfig];
            return (
              <div key={m.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors group">
                <Avatar name={m.name} size="md" online={m.status !== "off_duty"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A]">{m.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-[#64748B]">{m.role}</span>
                    <span className="text-[11px] text-[#CBD5E1]">·</span>
                    <Badge variant="gray">{m.dept}</Badge>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-[#94A3B8]">
                  <span className="flex items-center gap-1"><Phone size={10} /> {m.phone}</span>
                  <span className="flex items-center gap-1"><Mail size={10} /> {m.email}</span>
                </div>
                <Badge variant={sc.variant} dot>{sc.label}</Badge>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#334155] transition-all">
                    <Edit size={13} />
                  </button>
                  <button
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-all"
                    onClick={() => { setDeleteTarget(m.name); setDeleteOpen(true); }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Add member modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Team Member"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => setAddOpen(false)}>Add Member</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name" placeholder="John Doe" fullWidth />
            <Input label="Phone" placeholder="+91 00000 00000" fullWidth />
          </div>
          <Input label="Email" type="email" placeholder="member@camp.org" fullWidth />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Department"
              options={[
                { value: "", label: "Select dept..." },
                { value: "rescue", label: "Rescue" },
                { value: "medical", label: "Medical" },
                { value: "operations", label: "Operations" },
                { value: "logistics", label: "Logistics" },
              ]}
              fullWidth
            />
            <Input label="Role / Title" placeholder="Team Lead" fullWidth />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${deleteTarget} from the team? This action cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={() => setDeleteOpen(false)}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
