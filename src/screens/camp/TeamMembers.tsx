"use client";
import React, { useEffect, useState } from "react";
import { Users, Plus, Phone, Mail, Trash2, ShieldCheck, HeartHandshake } from "lucide-react";
import { Card, Badge, Button, SearchInput, Avatar, Modal, Input, ConfirmDialog, Toggle } from "../../components/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMyCamp } from "@/hooks/useMyCamp";
import {
  fetchCampTeamMembers,
  addTeamMemberByEmail,
  removeTeamMember,
  subscribeToCampTeam,
  type CampTeamMemberRecord,
} from "@/lib/services/campTeam";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function memberName(m: CampTeamMemberRecord) {
  return m.profiles?.full_name || m.profiles?.email || "Unnamed member";
}

export default function TeamMembers() {
  const { data: myCamp } = useMyCamp();
  const queryClient = useQueryClient();

  const teamQuery = useQuery({
    queryKey: ["camp-team", myCamp?.id],
    queryFn: () => fetchCampTeamMembers(myCamp!.id),
    enabled: !!myCamp?.id,
  });
  const members = teamQuery.data ?? [];

  useEffect(() => {
    if (!myCamp?.id) return;
    const unsubscribe = subscribeToCampTeam(myCamp.id, () => {
      queryClient.invalidateQueries({ queryKey: ["camp-team", myCamp.id] });
    });
    return unsubscribe;
  }, [myCamp?.id, queryClient]);

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [formEmail, setFormEmail] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formCanUpdateCamp, setFormCanUpdateCamp] = useState(true);
  const [formCanRespond, setFormCanRespond] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return memberName(m).toLowerCase().includes(q) || m.title.toLowerCase().includes(q);
  });

  const resetForm = () => {
    setFormEmail("");
    setFormTitle("");
    setFormCanUpdateCamp(true);
    setFormCanRespond(true);
    setFormError(null);
  };

  const handleAddMember = async () => {
    setFormError(null);

    if (!formEmail.trim() || !EMAIL_RE.test(formEmail.trim())) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (!formTitle.trim()) {
      setFormError("Role / title is required.");
      return;
    }
    if (!myCamp?.id) {
      setFormError("No camp found for your account.");
      return;
    }

    setSubmitting(true);
    const result = await addTeamMemberByEmail({
      campId: myCamp.id,
      email: formEmail.trim(),
      title: formTitle.trim(),
      canUpdateCamp: formCanUpdateCamp,
      canRespondEmergencies: formCanRespond,
    });
    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error || "Failed to add team member.");
      return;
    }

    resetForm();
    setAddOpen(false);
    queryClient.invalidateQueries({ queryKey: ["camp-team", myCamp.id] });
  };

  const handleRemove = async () => {
    if (!deleteTarget) return;
    const ok = await removeTeamMember(deleteTarget.id);
    setDeleteOpen(false);
    setDeleteTarget(null);
    if (ok && myCamp?.id) {
      queryClient.invalidateQueries({ queryKey: ["camp-team", myCamp.id] });
    }
  };

  const respondersCount = members.filter((m) => m.can_respond_emergencies).length;
  const editorsCount = members.filter((m) => m.can_update_camp).length;

  return (
    <div className="p-5 md:p-6 space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">Team Members</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{myCamp?.name || "My Camp"} · {members.length} members</p>
        </div>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setAddOpen(true)} disabled={!myCamp?.id}>
          Add Member
        </Button>
      </div>

      <SearchInput
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-56"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Staff", value: members.length, color: "text-[#0F172A]" },
          { label: "Can Respond to Emergencies", value: respondersCount, color: "text-[#059669]" },
          { label: "Can Update Camp", value: editorsCount, color: "text-[#2563EB]" },
        ].map((s, i) => (
          <Card key={i} padding="sm">
            <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide">{s.label}</p>
            <p className={`text-2xl font-semibold mt-1 font-[family-name:var(--font-display)] ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card padding="none">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center mb-4">
              <Users size={20} />
            </div>
            <h3 className="text-sm font-semibold text-[#334155] mb-1">No team members</h3>
            <p className="text-sm text-[#64748B] max-w-sm">
              {myCamp?.id ? "Add a registered user by email to get started." : "No camp found for your account."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F8FAFC]">
            {filtered.map((m) => {
              const name = memberName(m);
              return (
                <div key={m.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors group">
                  <Avatar name={name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A]">{name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-[#64748B]">{m.title}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-[#94A3B8]">
                    {m.profiles?.phone && (
                      <span className="flex items-center gap-1"><Phone size={10} /> {m.profiles.phone}</span>
                    )}
                    {m.profiles?.email && (
                      <span className="flex items-center gap-1"><Mail size={10} /> {m.profiles.email}</span>
                    )}
                  </div>
                  <div className="hidden md:flex items-center gap-1.5">
                    {m.can_update_camp && (
                      <Badge variant="blue"><ShieldCheck size={10} /> Editor</Badge>
                    )}
                    {m.can_respond_emergencies && (
                      <Badge variant="green"><HeartHandshake size={10} /> Responder</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-all"
                      onClick={() => { setDeleteTarget({ id: m.id, name }); setDeleteOpen(true); }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add member modal */}
      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); resetForm(); }}
        title="Add Team Member"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => { setAddOpen(false); resetForm(); }}>Cancel</Button>
            <Button size="sm" onClick={handleAddMember} loading={submitting}>Add Member</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Email"
            type="email"
            placeholder="member@camp.org"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            fullWidth
          />
          <p className="text-xs text-[#94A3B8] -mt-1.5">Must belong to an already-registered ResQ AI user.</p>
          <Input
            label="Role / Title"
            placeholder="Team Lead"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            fullWidth
          />
          <div className="flex flex-col gap-3 pt-1">
            <Toggle checked={formCanUpdateCamp} onChange={setFormCanUpdateCamp} label="Can update camp details" />
            <Toggle checked={formCanRespond} onChange={setFormCanRespond} label="Can respond to emergencies" />
          </div>
          {formError && <p className="text-xs text-[#DC2626]">{formError}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${deleteTarget?.name ?? "this member"} from the team? This action cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onCancel={() => { setDeleteOpen(false); setDeleteTarget(null); }}
      />
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
