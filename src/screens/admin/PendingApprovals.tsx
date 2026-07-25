import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Building2, CheckCircle, XCircle, Eye, MapPin, Users, Calendar
} from "lucide-react";
import {
  Card, Badge, Button, Tabs, Modal, Alert, useToast, ToastContainer
} from "../../components/ui";
import { MapView } from "../../components/MapView";
import { useRealtimeCamps } from "../../hooks/useRealtimeCamps";
import { updateCampStatus, type ReliefCampRecord } from "../../lib/services/camps";

type TabId = "pending" | "approved" | "rejected";
type ActionType = "approved" | "rejected";

export default function PendingApprovals() {
  const [activeTab, setActiveTab] = useState<TabId>("pending");
  const [selectedCamp, setSelectedCamp] = useState<ReliefCampRecord | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { toasts, addToast, removeToast } = useToast();

  const pendingQuery = useRealtimeCamps({ status: "pending" });
  const approvedQuery = useRealtimeCamps({ status: "approved" });
  const rejectedQuery = useRealtimeCamps({ status: "rejected" });

  const pending = pendingQuery.data || [];
  const approved = approvedQuery.data || [];
  const rejected = rejectedQuery.data || [];

  const tabs = [
    { id: "pending", label: "Pending Review", count: pending.length },
    { id: "approved", label: "Approved", count: approved.length },
    { id: "rejected", label: "Rejected", count: rejected.length },
  ];

  const openReview = (camp: ReliefCampRecord) => {
    setSelectedCamp(camp);
    setReviewOpen(true);
  };

  const openAction = (camp: ReliefCampRecord, type: ActionType) => {
    setSelectedCamp(camp);
    setActionType(type);
    setActionError(null);
  };

  const closeAction = () => {
    setActionType(null);
    setActionError(null);
    setActionLoading(false);
  };

  const confirmAction = async () => {
    if (!selectedCamp || !actionType) return;
    setActionLoading(true);
    setActionError(null);
    const ok = await updateCampStatus(selectedCamp.id, actionType);
    setActionLoading(false);
    if (ok) {
      addToast("success", `${selectedCamp.name} ${actionType === "approved" ? "approved" : "rejected"}`);
      setActionType(null);
      setReviewOpen(false);
      setSelectedCamp(null);
    } else {
      setActionError(`Failed to ${actionType === "approved" ? "approve" : "reject"} this application. Please try again.`);
    }
  };

  const activeList = activeTab === "pending" ? pending : activeTab === "approved" ? approved : rejected;
  const activeLoading =
    activeTab === "pending" ? pendingQuery.isLoading : activeTab === "approved" ? approvedQuery.isLoading : rejectedQuery.isLoading;

  return (
    <div className="p-5 md:p-6 space-y-5 max-w-5xl">
      <div>
        <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">Camp Approvals</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Review and approve relief camp applications</p>
      </div>

      {pending.length > 0 && (
        <Alert type="warning" title={`${pending.length} application${pending.length === 1 ? "" : "s"} awaiting review`}>
          Please review these camp applications promptly.
        </Alert>
      )}

      <Tabs tabs={tabs} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />

      {activeLoading && (
        <Card className="py-10 text-center">
          <p className="text-sm text-[#94A3B8]">Loading camps…</p>
        </Card>
      )}

      {!activeLoading && activeList.length === 0 && (
        <Card className="py-12 text-center">
          <Building2 size={24} className="text-[#94A3B8] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#0F172A]">
            No {activeTab === "pending" ? "pending" : activeTab} camps
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            {activeTab === "pending"
              ? "New camp applications will appear here."
              : `Camps you have ${activeTab} will appear here.`}
          </p>
        </Card>
      )}

      {!activeLoading && activeList.length > 0 && (
        <div className="space-y-4">
          {activeList.map((camp) => (
            <Card key={camp.id}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-[#64748B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="text-sm font-semibold text-[#0F172A]">{camp.name}</h3>
                      <p className="text-xs text-[#64748B] mt-0.5">{camp.district}, {camp.province}</p>
                    </div>
                    <Badge
                      variant={camp.status === "approved" ? "green" : camp.status === "rejected" ? "red" : "yellow"}
                      dot={camp.status === "pending"}
                    >
                      {camp.status === "pending" ? "Pending Review" : camp.status === "approved" ? "Approved" : "Rejected"}
                    </Badge>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <MapPin size={12} className="text-[#94A3B8]" /> {camp.address}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Users size={12} className="text-[#94A3B8]" /> Capacity: {camp.capacity_total}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Calendar size={12} className="text-[#94A3B8]" /> Submitted {formatDistanceToNow(new Date(camp.created_at), { addSuffix: true })}
                    </div>
                  </div>

                  {camp.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {camp.services.map((f) => (
                        <span key={f} className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-[11px] rounded-full">{f}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <Button size="xs" variant="outline" icon={<Eye size={10} />} onClick={() => openReview(camp)}>
                      Review
                    </Button>
                    {camp.status === "pending" && (
                      <>
                        <Button size="xs" variant="success" icon={<CheckCircle size={10} />} onClick={() => openAction(camp, "approved")}>
                          Approve
                        </Button>
                        <Button size="xs" variant="danger" icon={<XCircle size={10} />} onClick={() => openAction(camp, "rejected")}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review modal */}
      {selectedCamp && (
        <Modal
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          title={`Review: ${selectedCamp.name}`}
          size="xl"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setReviewOpen(false)}>Close</Button>
              {selectedCamp.status === "pending" && (
                <>
                  <Button variant="danger" size="sm" icon={<XCircle size={13} />} onClick={() => openAction(selectedCamp, "rejected")}>Reject</Button>
                  <Button variant="success" size="sm" icon={<CheckCircle size={13} />} onClick={() => openAction(selectedCamp, "approved")}>Approve</Button>
                </>
              )}
            </>
          }
        >
          <div className="space-y-4">
            <MapView
              height="180px"
              camps={[{
                id: selectedCamp.id,
                name: selectedCamp.name,
                latitude: selectedCamp.latitude,
                longitude: selectedCamp.longitude,
                capacity: selectedCamp.capacity_total,
                occupied: selectedCamp.capacity_total - selectedCamp.capacity_available,
                status: "active",
                address: selectedCamp.address,
                type: "primary",
              }]}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Camp Name", value: selectedCamp.name },
                { label: "Province", value: selectedCamp.province },
                { label: "District", value: selectedCamp.district },
                { label: "Capacity", value: `${selectedCamp.capacity_total} persons (${selectedCamp.capacity_available} available)` },
                { label: "Contact Phone", value: selectedCamp.contact_phone || "—" },
                { label: "Contact Email", value: selectedCamp.contact_email || "—" },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide">{item.label}</p>
                  <p className="text-sm font-medium text-[#334155] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide mb-1.5">Description</p>
              <p className="text-sm text-[#334155] leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-[#F1F5F9]">
                {selectedCamp.description || "No description provided."}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Approve / Reject confirmation */}
      <Modal
        open={actionType !== null}
        onClose={closeAction}
        title={actionType === "approved" ? "Approve Camp Application" : "Reject Camp Application"}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={closeAction} disabled={actionLoading}>Cancel</Button>
            <Button
              variant={actionType === "approved" ? "success" : "danger"}
              size="sm"
              loading={actionLoading}
              onClick={confirmAction}
            >
              {actionType === "approved" ? "Approve Camp" : "Reject Camp"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[#64748B]">
            {actionType === "approved"
              ? `Approve ${selectedCamp?.name}? They will be listed on the platform and able to receive emergency requests.`
              : `Reject ${selectedCamp?.name}? This application will be marked as rejected.`}
          </p>
          {actionError && (
            <Alert type="error" title="Action failed">
              {actionError}
            </Alert>
          )}
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
