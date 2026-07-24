import React, { useState } from "react";
import {
  Building2, CheckCircle, XCircle, Eye, MapPin, Users, Calendar, Phone,
  ChevronRight, Shield, AlertTriangle, FileText
} from "lucide-react";
import {
  Card, Badge, Button, Tabs, Modal, Input, Textarea, Select,
  ConfirmDialog, Alert
} from "../../components/ui";
import { MapView } from "../../components/MapView";

const applications = [
  {
    id: "app-1", campName: "Camp Phoenix", type: "Primary Relief Center",
    location: "Andheri West, Mumbai, Maharashtra",
    manager: "Ajay Mehta", managerEmail: "ajay@campphoenix.org", phone: "+91 98765 11111",
    capacity: 350, submitted: "Jul 21, 2026", status: "pending",
    facilities: ["Medical", "Food", "Shelter", "Water"],
    description: "A full-service relief camp with medical wing, food distribution center, and dedicated women's block. We have 35 trained staff members.",
    documents: ["Registration Certificate", "NOC", "Floor Plan", "Staff List"],
  },
  {
    id: "app-2", campName: "Camp Horizon", type: "Secondary Relief Camp",
    location: "Mylapore, Chennai, Tamil Nadu",
    manager: "Lakshmi Nair", managerEmail: "lakshmi@camphorizon.org", phone: "+91 87654 22222",
    capacity: 200, submitted: "Jul 20, 2026", status: "pending",
    facilities: ["Food", "Shelter", "Water"],
    description: "Community-run shelter with focus on coastal disaster response. 20 staff, backup generators, water purification.",
    documents: ["Registration Certificate", "NOC"],
  },
  {
    id: "app-3", campName: "Camp Unity", type: "Primary Relief Center",
    location: "Secunderabad, Hyderabad, Telangana",
    manager: "Ravi Reddy", managerEmail: "ravi@campunity.org", phone: "+91 76543 33333",
    capacity: 500, submitted: "Jul 19, 2026", status: "pending",
    facilities: ["Medical", "Food", "Shelter", "Water", "Trauma Support"],
    description: "Large-scale camp with trauma support team. Government-backed with 60 staff. ISO certified facility.",
    documents: ["Registration Certificate", "NOC", "Floor Plan", "Staff List", "ISO Certificate"],
  },
];

export default function PendingApprovals() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedApp, setSelectedApp] = useState<typeof applications[0] | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const tabs = [
    { id: "pending", label: "Pending Review", count: applications.length },
    { id: "approved", label: "Approved", count: 59 },
    { id: "rejected", label: "Rejected", count: 4 },
  ];

  return (
    <div className="p-5 md:p-6 space-y-5 max-w-5xl">
      <div>
        <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">Camp Approvals</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Review and approve relief camp applications</p>
      </div>

      <Alert type="warning" title="3 applications awaiting review">
        These camp applications have been waiting for more than 24 hours. Please review them promptly.
      </Alert>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "pending" && (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-[#64748B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="text-sm font-semibold text-[#0F172A]">{app.campName}</h3>
                      <p className="text-xs text-[#64748B] mt-0.5">{app.type}</p>
                    </div>
                    <Badge variant="yellow" dot>Pending Review</Badge>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <MapPin size={12} className="text-[#94A3B8]" /> {app.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Users size={12} className="text-[#94A3B8]" /> Capacity: {app.capacity}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Calendar size={12} className="text-[#94A3B8]" /> Submitted {app.submitted}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {app.facilities.map((f) => (
                      <span key={f} className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-[11px] rounded-full">{f}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-2 text-xs text-[#64748B] mr-2">
                      <div className="w-5 h-5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold flex items-center justify-center">
                        {app.manager.charAt(0)}
                      </div>
                      {app.manager}
                    </div>
                    <Button
                      size="xs"
                      variant="outline"
                      icon={<Eye size={10} />}
                      onClick={() => { setSelectedApp(app); setReviewOpen(true); }}
                    >
                      Review
                    </Button>
                    <Button
                      size="xs"
                      variant="success"
                      icon={<CheckCircle size={10} />}
                      onClick={() => { setSelectedApp(app); setApproveOpen(true); }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="xs"
                      variant="danger"
                      icon={<XCircle size={10} />}
                      onClick={() => { setSelectedApp(app); setRejectOpen(true); }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "approved" && (
        <Card className="py-12 text-center">
          <CheckCircle size={24} className="text-[#059669] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#0F172A]">59 Approved Camps</p>
          <p className="text-xs text-[#64748B] mt-1">All previously approved camp applications</p>
        </Card>
      )}

      {/* Review modal */}
      {selectedApp && (
        <Modal
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          title={`Review: ${selectedApp.campName}`}
          size="xl"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setReviewOpen(false)}>Close</Button>
              <Button variant="danger" size="sm" icon={<XCircle size={13} />} onClick={() => { setReviewOpen(false); setRejectOpen(true); }}>Reject</Button>
              <Button variant="success" size="sm" icon={<CheckCircle size={13} />} onClick={() => { setReviewOpen(false); setApproveOpen(true); }}>Approve</Button>
            </>
          }
        >
          <div className="space-y-4">
            <MapView height="180px" />

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Camp Name", value: selectedApp.campName },
                { label: "Type", value: selectedApp.type },
                { label: "Location", value: selectedApp.location },
                { label: "Capacity", value: `${selectedApp.capacity} persons` },
                { label: "Manager", value: selectedApp.manager },
                { label: "Contact", value: selectedApp.phone },
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
                {selectedApp.description}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-[#94A3B8] uppercase font-semibold tracking-wide mb-2">Submitted Documents</p>
              <div className="space-y-1.5">
                {selectedApp.documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg">
                    <FileText size={13} className="text-[#64748B]" />
                    <span className="text-xs font-medium text-[#334155]">{doc}</span>
                    <CheckCircle size={12} className="text-[#059669] ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Approve confirm */}
      <ConfirmDialog
        open={approveOpen}
        title="Approve Camp Application"
        description={`Approve ${selectedApp?.campName}? They will be listed on the platform and able to receive emergency requests.`}
        confirmLabel="Approve Camp"
        variant="primary"
        onConfirm={() => setApproveOpen(false)}
        onCancel={() => setApproveOpen(false)}
      />

      {/* Reject modal */}
      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject Application"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => setRejectOpen(false)}>Reject</Button>
          </>
        }
      >
        <Textarea
          label="Reason for rejection"
          placeholder="Explain why this application is being rejected..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          fullWidth
          rows={4}
          hint="This message will be sent to the camp manager."
        />
      </Modal>
    </div>
  );
}
