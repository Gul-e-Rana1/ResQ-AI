"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft, MapPin, Clock, Phone, MessageSquare, AlertTriangle,
  User, Building2, ChevronRight, Shield, XCircle
} from "lucide-react";
import { Card, Badge, StatusChip, Button, RiskLevel, Modal, Alert, Textarea, EmptyState } from "../../components/ui";
import { EmergencyTimeline } from "../../components/EmergencyTimeline";
import { MapView, type MapCamp } from "../../components/MapView";
import { useAuth } from "../../providers/AuthProvider";
import {
  fetchEmergencyById,
  subscribeToEmergencyTimeline,
  updateEmergencyStatus,
  type EmergencyRecord,
  type EmergencyTimelineRecord,
} from "@/lib/services/emergencies";
import { fetchCampById, type ReliefCampRecord } from "@/lib/services/camps";
import type { AiEmergencyAssessment } from "@/lib/services/ai";

interface Props {
  onNavigate: (page: string, id?: string) => void;
  emergencyId?: string | null;
}

const statusToChip: Record<string, "submitted" | "assigned" | "accepted" | "en_route" | "arrived" | "resolved" | "cancelled"> = {
  Submitted: "submitted",
  Assigned: "assigned",
  Accepted: "accepted",
  "En Route": "en_route",
  Arrived: "arrived",
  Resolved: "resolved",
  Cancelled: "cancelled",
};

const priorityLabel: Record<string, string> = {
  LOW: "Low Priority",
  MEDIUM: "Medium Priority",
  HIGH: "High Priority",
  CRITICAL: "Critical Priority",
};

const riskFromUrgency: Record<string, "low" | "medium" | "high" | "critical"> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EmergencyDetails({ onNavigate, emergencyId }: Props) {
  const { user } = useAuth();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const [loading, setLoading] = useState(true);
  const [emergency, setEmergency] = useState<EmergencyRecord | null>(null);
  const [timeline, setTimeline] = useState<EmergencyTimelineRecord[]>([]);
  const [camp, setCamp] = useState<ReliefCampRecord | null>(null);

  const loadEmergency = useCallback(async () => {
    if (!emergencyId) {
      setEmergency(null);
      setTimeline([]);
      setCamp(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { emergency: em, timeline: tl } = await fetchEmergencyById(emergencyId);
    setEmergency(em);
    setTimeline(tl);
    if (em?.assigned_camp_id) {
      const campData = await fetchCampById(em.assigned_camp_id);
      setCamp(campData);
    } else {
      setCamp(null);
    }
    setLoading(false);
  }, [emergencyId]);

  useEffect(() => {
    loadEmergency();
  }, [loadEmergency]);

  useEffect(() => {
    if (!emergencyId) return;
    const unsubscribe = subscribeToEmergencyTimeline(emergencyId, () => {
      loadEmergency();
    });
    return unsubscribe;
  }, [emergencyId, loadEmergency]);

  const handleCancel = async () => {
    if (!emergency) return;
    setCancelling(true);
    setCancelError("");
    try {
      const ok = await updateEmergencyStatus({
        emergencyId: emergency.id,
        status: "Cancelled",
        note: cancelReason || undefined,
        performedBy: user?.id,
      });
      if (!ok) {
        setCancelError("Failed to cancel the request. Please try again.");
        return;
      }
      setCancelOpen(false);
      onNavigate("my_emergencies");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCancelError(msg || "Failed to cancel the request.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5 md:p-6 max-w-5xl mx-auto">
        <p className="text-sm text-[#64748B]">Loading emergency details…</p>
      </div>
    );
  }

  if (!emergencyId || !emergency) {
    return (
      <div className="p-5 md:p-6 max-w-2xl mx-auto">
        <Card>
          <EmptyState
            icon={<AlertTriangle size={20} />}
            title="No emergency selected"
            description="We couldn't find the emergency you're looking for. Go back to your emergencies list and pick one to view."
            action={
              <Button onClick={() => onNavigate("my_emergencies")} icon={<ArrowLeft size={14} />}>
                Back to My Emergencies
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const chipStatus = statusToChip[emergency.status] || "submitted";
  const aiSummary = (emergency.ai_summary || {}) as Partial<AiEmergencyAssessment>;
  const suggestedActions = Array.isArray(aiSummary.suggestedActions) ? aiSummary.suggestedActions : [];
  const riskLevel = aiSummary.riskLevel || riskFromUrgency[emergency.urgency] || "medium";

  const responders = Array.from(
    new Set(
      timeline
        .map((t) => t.profiles?.full_name)
        .filter((name): name is string => Boolean(name)),
    ),
  );

  const mapCamps: MapCamp[] = camp
    ? [
        {
          id: camp.id,
          name: camp.name,
          latitude: camp.latitude,
          longitude: camp.longitude,
          capacity: camp.capacity_total,
          occupied: camp.capacity_total - camp.capacity_available,
          status: camp.capacity_available <= 0 ? "full" : camp.status === "approved" ? "active" : "inactive",
          address: camp.address,
          type: "primary",
        },
      ]
    : [];

  const userLocation =
    emergency.latitude != null && emergency.longitude != null
      ? { latitude: emergency.latitude, longitude: emergency.longitude }
      : null;

  return (
    <div className="p-5 md:p-6 max-w-5xl space-y-5">
      {/* Back + header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => onNavigate("my_emergencies")}
          className="mt-0.5 w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#334155] transition-all flex-shrink-0"
        >
          <ArrowLeft size={15} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#94A3B8] font-[family-name:var(--font-mono)]">
              #{emergency.id.slice(0, 8)}
            </span>
            <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
              {emergency.title}
            </h1>
            <StatusChip status={chipStatus} />
          </div>
          <p className="text-sm text-[#64748B] mt-0.5 flex items-center gap-1">
            <Clock size={12} /> Submitted {formatDate(emergency.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMessageOpen(true)} icon={<MessageSquare size={13} />}>
            Message
          </Button>
          {emergency.status !== "Cancelled" && emergency.status !== "Resolved" && (
            <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)} icon={<XCircle size={13} />}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: details + timeline */}
        <div className="lg:col-span-2 space-y-5">
          {/* Emergency info */}
          <Card>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Emergency Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Emergency Type", value: emergency.disaster_type, icon: <AlertTriangle size={14} className="text-[#EA580C]" /> },
                { label: "Priority Level", value: priorityLabel[emergency.urgency] || emergency.urgency, icon: <Shield size={14} className="text-[#DC2626]" /> },
                { label: "Location", value: emergency.address || `${emergency.district}, ${emergency.province}`, icon: <MapPin size={14} className="text-[#2563EB]" /> },
                { label: "People Affected", value: `${emergency.people_count} ${emergency.people_count === 1 ? "person" : "people"}`, icon: <User size={14} className="text-[#64748B]" /> },
                { label: "Assigned Camp", value: camp?.name || "Not yet assigned", icon: <Building2 size={14} className="text-[#059669]" /> },
                { label: "Camp Contact", value: camp?.contact_phone || "—", icon: <Phone size={14} className="text-[#64748B]" /> },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide">{item.label}</p>
                    <p className="text-sm font-medium text-[#334155] mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
              <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide mb-1.5">Description</p>
              <p className="text-sm text-[#334155] leading-relaxed">{emergency.description}</p>
            </div>

            {/* Risk assessment */}
            <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
              <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide mb-2">AI Risk Assessment</p>
              <RiskLevel level={riskLevel} />
              {aiSummary.summary && (
                <p className="text-xs text-[#64748B] mt-2">{aiSummary.summary}</p>
              )}
            </div>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
                <MessageSquare size={13} />
              </div>
              <h2 className="text-sm font-semibold text-[#0F172A]">AI Suggested Actions</h2>
              <Badge variant="purple" className="ml-auto">AI Generated</Badge>
            </div>
            {suggestedActions.length > 0 ? (
              <div className="space-y-2.5">
                {suggestedActions.map((text, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                    <span className="text-base flex-shrink-0">🆘</span>
                    <p className="text-xs text-[#334155] leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8]">No AI recommendations available for this request yet.</p>
            )}
          </Card>

          {/* Map */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F1F5F9]">
              <h2 className="text-sm font-semibold text-[#0F172A]">Emergency Location</h2>
            </div>
            <MapView height="220px" className="rounded-none border-0" camps={mapCamps} userLocation={userLocation} />
          </Card>
        </div>

        {/* Right: timeline + camp info */}
        <div className="space-y-5">
          {/* Timeline */}
          <Card>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Response Timeline</h2>
            <EmergencyTimeline
              currentStatus={chipStatus}
              events={timeline.map((t) => ({
                status: statusToChip[t.status] || "submitted",
                timestamp: formatDate(t.created_at),
                note: t.note || undefined,
                actor: t.profiles?.full_name || undefined,
              }))}
            />
          </Card>

          {/* Assigned camp */}
          <Card>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Assigned Camp</h2>
            {camp ? (
              <>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{camp.name}</p>
                    <p className="text-xs text-[#64748B]">{camp.address}</p>
                    <Badge variant={camp.status === "approved" ? "green" : "gray"} dot className="mt-1.5">
                      {camp.status === "approved" ? "Active" : camp.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                    <p className="text-[10px] text-[#94A3B8] font-semibold uppercase">Capacity</p>
                    <p className="text-sm font-semibold text-[#0F172A]">{camp.capacity_total}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                    <p className="text-[10px] text-[#94A3B8] font-semibold uppercase">Available</p>
                    <p className="text-sm font-semibold text-[#059669]">{camp.capacity_available}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    icon={<Phone size={12} />}
                    disabled={!camp.contact_phone}
                    onClick={() => camp.contact_phone && window.open(`tel:${camp.contact_phone}`)}
                  >
                    Call Camp
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth onClick={() => onNavigate("camp_details", camp.id)} icon={<ChevronRight size={12} />}>
                    View Camp
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-xs text-[#94A3B8]">Not yet assigned. ResQ AI is matching your request to the nearest available camp.</p>
            )}
          </Card>

          {/* Responder info */}
          <Card>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Response Team</h2>
            {responders.length > 0 ? (
              <div className="space-y-2">
                {responders.map((name, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold flex items-center justify-center">
                        {name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#0F172A]">{name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8]">No responders assigned yet.</p>
            )}
          </Card>
        </div>
      </div>

      {/* Cancel modal */}
      <Modal
        open={cancelOpen}
        onClose={() => !cancelling && setCancelOpen(false)}
        title="Cancel Emergency"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCancelOpen(false)} disabled={cancelling}>
              Keep Active
            </Button>
            <Button variant="danger" size="sm" onClick={handleCancel} loading={cancelling} disabled={cancelling}>
              Cancel Request
            </Button>
          </>
        }
      >
        <div className="text-center mb-2">
          <div className="w-10 h-10 rounded-full bg-[#FEF2F2] mx-auto mb-3 flex items-center justify-center">
            <XCircle size={20} className="text-[#DC2626]" />
          </div>
          <p className="text-sm text-[#334155]">
            Are you sure you want to cancel this emergency request? The assigned team will be notified and the request will be closed.
          </p>
        </div>
        {cancelError && <Alert type="error" className="mb-3">{cancelError}</Alert>}
        <Textarea
          label="Reason for cancellation (optional)"
          placeholder="e.g., Situation resolved, no longer need assistance..."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          fullWidth
          rows={3}
        />
      </Modal>

      {/* Message modal */}
      <Modal
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        title={camp ? `Message ${camp.name}` : "Message Camp"}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setMessageOpen(false)}>Close</Button>
            <Button size="sm" disabled title="Direct messaging is coming soon">
              Send Message
            </Button>
          </>
        }
      >
        <Alert type="info" className="mb-3">
          Direct messaging isn't available yet. For urgent updates, please use the Call Camp button or your local emergency helpline.
        </Alert>
        <Textarea
          label="Your message"
          placeholder="Type your message to the camp coordinator..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          rows={4}
          disabled
        />
      </Modal>
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
