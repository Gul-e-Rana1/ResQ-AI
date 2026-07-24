import React, { useState } from "react";
import {
  ArrowLeft, MapPin, Clock, Phone, MessageSquare, AlertTriangle,
  User, Building2, ChevronRight, Shield, Edit, XCircle
} from "lucide-react";
import { Card, Badge, StatusChip, Button, RiskLevel, Modal, Alert, Textarea } from "../../components/ui";
import { EmergencyTimeline } from "../../components/EmergencyTimeline";
import { MapView } from "../../components/MapView";

interface Props {
  onNavigate: (page: string) => void;
}

export default function EmergencyDetails({ onNavigate }: Props) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState("");

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
            <span className="text-xs font-semibold text-[#94A3B8] font-[family-name:var(--font-mono)]">#EM-2891</span>
            <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
              Flood Evacuation
            </h1>
            <StatusChip status="en_route" />
          </div>
          <p className="text-sm text-[#64748B] mt-0.5 flex items-center gap-1">
            <Clock size={12} /> Submitted Today, Jul 22 2026 at 09:14 AM
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMessageOpen(true)} icon={<MessageSquare size={13} />}>
            Message
          </Button>
          <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)} icon={<XCircle size={13} />}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Active status alert */}
      <Alert type="info" title="Team En Route">
        Camp Alpha has dispatched a team of 4 responders. Estimated arrival: <strong>8 minutes</strong>. Please stay at your registered location.
      </Alert>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: details + timeline */}
        <div className="lg:col-span-2 space-y-5">
          {/* Emergency info */}
          <Card>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Emergency Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Emergency Type", value: "Flood Evacuation", icon: <AlertTriangle size={14} className="text-[#EA580C]" /> },
                { label: "Priority Level", value: "High Priority", icon: <Shield size={14} className="text-[#DC2626]" /> },
                { label: "Location", value: "Sector 14, New Delhi", icon: <MapPin size={14} className="text-[#2563EB]" /> },
                { label: "People Affected", value: "4 adults", icon: <User size={14} className="text-[#64748B]" /> },
                { label: "Assigned Camp", value: "Camp Alpha", icon: <Building2 size={14} className="text-[#059669]" /> },
                { label: "Camp Contact", value: "+91 98765 43210", icon: <Phone size={14} className="text-[#64748B]" /> },
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
              <p className="text-sm text-[#334155] leading-relaxed">
                Flash flooding in our neighborhood. Water level is approximately 2 feet high on the street and rising. We have 4 adults, 2 elderly. No injuries currently. We are on the first floor of a 3-story building.
              </p>
            </div>

            {/* Risk assessment */}
            <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
              <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide mb-2">AI Risk Assessment</p>
              <RiskLevel level="high" />
              <p className="text-xs text-[#64748B] mt-2">
                Risk level assessed based on flood severity, number of affected persons, elderly presence, and proximity to flood zones.
              </p>
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
            <div className="space-y-2.5">
              {[
                { icon: "🏠", text: "Stay on the highest floor possible, do not attempt to wade through flood water." },
                { icon: "📱", text: "Keep your phone charged. Enable location sharing so responders can find you." },
                { icon: "🧳", text: "Prepare an emergency bag: documents, medication, water, and warm clothes." },
                { icon: "🚫", text: "Do not touch electrical outlets, appliances or wiring if water is nearby." },
                { icon: "🆘", text: "If in immediate danger, signal from your window with a bright cloth or flashlight." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <p className="text-xs text-[#334155] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Map */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F1F5F9]">
              <h2 className="text-sm font-semibold text-[#0F172A]">Emergency Location</h2>
            </div>
            <MapView height="220px" className="rounded-none border-0" />
          </Card>
        </div>

        {/* Right: timeline + camp info */}
        <div className="space-y-5">
          {/* Timeline */}
          <Card>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Response Timeline</h2>
            <EmergencyTimeline currentStatus="en_route" />
          </Card>

          {/* Assigned camp */}
          <Card>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Assigned Camp</h2>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                <Building2 size={18} className="text-[#2563EB]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Camp Alpha</p>
                <p className="text-xs text-[#64748B]">Primary Relief Camp · Sector 4</p>
                <Badge variant="green" dot className="mt-1.5">Active</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                <p className="text-[10px] text-[#94A3B8] font-semibold uppercase">Capacity</p>
                <p className="text-sm font-semibold text-[#0F172A]">500</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                <p className="text-[10px] text-[#94A3B8] font-semibold uppercase">Available</p>
                <p className="text-sm font-semibold text-[#059669]">120</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" fullWidth icon={<Phone size={12} />}>
                Call Camp
              </Button>
              <Button variant="secondary" size="sm" fullWidth onClick={() => onNavigate("camp_details")} icon={<ChevronRight size={12} />}>
                View Camp
              </Button>
            </div>
          </Card>

          {/* Responder info */}
          <Card>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Response Team</h2>
            <div className="space-y-2">
              {[
                { name: "Ravi Kumar", role: "Team Lead", online: true },
                { name: "Priya Singh", role: "Medical Officer", online: true },
                { name: "Arjun Patel", role: "Rescue Specialist", online: true },
                { name: "Meera Iyer", role: "Logistics Support", online: false },
              ].map((member, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold flex items-center justify-center">
                      {member.name.charAt(0)}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${member.online ? "bg-[#059669]" : "bg-[#94A3B8]"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#0F172A]">{member.name}</p>
                    <p className="text-[11px] text-[#94A3B8]">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel modal */}
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel Emergency"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCancelOpen(false)}>Keep Active</Button>
            <Button variant="danger" size="sm" onClick={() => { setCancelOpen(false); onNavigate("my_emergencies"); }}>
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
        <Textarea
          label="Reason for cancellation (optional)"
          placeholder="e.g., Situation resolved, no longer need assistance..."
          fullWidth
          rows={3}
        />
      </Modal>

      {/* Message modal */}
      <Modal
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        title="Message Camp Alpha"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setMessageOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => setMessageOpen(false)}>Send Message</Button>
          </>
        }
      >
        <Textarea
          label="Your message"
          placeholder="Type your message to the camp coordinator..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          rows={4}
        />
      </Modal>
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
