"use client";
import React, { useState } from "react";
import { Building2, Locate, LogOut, Clock, XCircle, Users } from "lucide-react";
import { z } from "zod";
import { Button, Input, Textarea, Select, Card, Alert, Badge } from "../../components/ui";
import { useAuth } from "../../providers/AuthProvider";
import { useGeolocation } from "@/hooks/useGeolocation";
import { createCampApplication } from "@/lib/services/camps";
import { PAKISTAN_PROVINCES, DISASTER_TYPES } from "@/lib/constants/pakistan";
import type { DisasterType, CampStatus } from "@/types/domain";
import type { ReliefCampRecord } from "@/lib/services/camps";

const disasterLabels: Record<DisasterType, string> = {
  flood: "Flood",
  earthquake: "Earthquake",
  wildfire: "Wildfire",
  landslide: "Landslide",
  storm: "Storm / Cyclone",
  medical: "Medical",
  other: "Other",
};

const campSchema = z.object({
  name: z.string().trim().min(3, "Camp name is required"),
  province: z.string().min(1, "Province is required"),
  district: z.string().trim().min(1, "District is required"),
  address: z.string().trim().min(5, "Address is required"),
  capacityTotal: z.coerce.number({ message: "Enter a valid number" }).int().min(1, "Capacity must be at least 1"),
});

interface Props {
  role: "camp_manager" | "camp_team_member";
  camp: ReliefCampRecord | null;
  onCampCreated: () => void;
  onLogout: () => void;
}

const statusCopy: Record<CampStatus, { title: string; body: string; icon: React.ReactNode; badge: "yellow" | "red" | "gray" }> = {
  pending: {
    title: "Your camp is awaiting approval",
    body: "An admin needs to review and approve your relief camp before you can start managing emergencies and your team. This usually doesn't take long — check back soon.",
    icon: <Clock size={20} className="text-[#D97706]" />,
    badge: "yellow",
  },
  rejected: {
    title: "Your camp application was rejected",
    body: "An admin reviewed your relief camp application and it was not approved. Please contact ResQ AI support for details.",
    icon: <XCircle size={20} className="text-[#DC2626]" />,
    badge: "red",
  },
  suspended: {
    title: "Your camp has been suspended",
    body: "Your relief camp's access has been suspended by an admin. Please contact ResQ AI support for details.",
    icon: <XCircle size={20} className="text-[#DC2626]" />,
    badge: "gray",
  },
  approved: {
    title: "",
    body: "",
    icon: null,
    badge: "gray",
  },
};

export default function CampOnboarding({ role, camp, onCampCreated, onLogout }: Props) {
  const { user } = useAuth();
  const { coords, loading: geoLoading, error: geoError, locate } = useGeolocation();
  const [form, setForm] = useState({
    name: "",
    description: "",
    province: "",
    district: "",
    address: "",
    capacityTotal: "",
    contactPhone: "",
    contactEmail: "",
  });
  const [disasters, setDisasters] = useState<DisasterType[]>([]);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const toggleDisaster = (d: DisasterType) =>
    setDisasters((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  if (camp && camp.status !== "approved") {
    const copy = statusCopy[camp.status];
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <Card className="max-w-md w-full text-center py-10 px-6">
          <div className="w-14 h-14 rounded-full bg-[#FFFBEB] mx-auto mb-4 flex items-center justify-center">
            {copy.icon}
          </div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">{copy.title}</h2>
          <p className="text-sm text-[#64748B] mb-4">{copy.body}</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge variant={copy.badge}>{camp.name}</Badge>
          </div>
          <Button fullWidth variant="outline" icon={<LogOut size={13} />} onClick={onLogout}>
            Sign Out
          </Button>
        </Card>
      </div>
    );
  }

  if (role === "camp_team_member") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <Card className="max-w-md w-full text-center py-10 px-6">
          <div className="w-14 h-14 rounded-full bg-[#EFF6FF] mx-auto mb-4 flex items-center justify-center">
            <Users size={20} className="text-[#2563EB]" />
          </div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">You haven't been added to a camp yet</h2>
          <p className="text-sm text-[#64748B] mb-6">
            Camp Helper accounts are added by a Camp Manager, not self-registered. Ask your camp manager to add you
            as a team member using the email address on this account.
          </p>
          <Button fullWidth variant="outline" icon={<LogOut size={13} />} onClick={onLogout}>
            Sign Out
          </Button>
        </Card>
      </div>
    );
  }

  const validate = () => {
    const result = campSchema.safeParse(form);
    const errs: Partial<Record<string, string>> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        errs[issue.path[0] as string] = issue.message;
      }
    }
    if (!coords) {
      errs.location = "Please capture your camp's location so residents can find you.";
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !user?.id || !coords) return;

    setSubmitting(true);
    setSubmitError("");
    const { error } = await createCampApplication({
      managerId: user.id,
      name: form.name,
      description: form.description || undefined,
      province: form.province,
      district: form.district,
      address: form.address,
      latitude: coords.latitude,
      longitude: coords.longitude,
      capacityTotal: parseInt(form.capacityTotal, 10) || 0,
      contactPhone: form.contactPhone || undefined,
      contactEmail: form.contactEmail || undefined,
      supportedDisasters: disasters,
    });
    setSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    onCampCreated();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <Card className="max-w-xl w-full p-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
            <Building2 size={16} className="text-[#2563EB]" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#0F172A]">Register Your Relief Camp</h1>
            <p className="text-xs text-[#64748B]">This will be reviewed by an admin before it goes live.</p>
          </div>
        </div>

        <div className="space-y-3 mt-5">
          {submitError && <Alert type="error">{submitError}</Alert>}

          <Input
            label="Camp Name"
            placeholder="e.g., Lahore Expo Relief Camp"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            error={errors.name}
            fullWidth
          />
          <Textarea
            label="Description (optional)"
            placeholder="Brief description of your camp and the services it offers"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={2}
            fullWidth
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Province"
              options={[{ value: "", label: "Select province..." }, ...PAKISTAN_PROVINCES.map((p) => ({ value: p, label: p }))]}
              value={form.province}
              onChange={(e) => update("province", e.target.value)}
              error={errors.province}
              fullWidth
            />
            <Input
              label="District"
              placeholder="e.g., Lahore"
              value={form.district}
              onChange={(e) => update("district", e.target.value)}
              error={errors.district}
              fullWidth
            />
          </div>

          <div className="relative">
            <Input
              label="Camp Address"
              placeholder="Street, area, landmark"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              error={errors.address}
              fullWidth
            />
            <button
              type="button"
              onClick={() => locate()}
              disabled={geoLoading}
              className="absolute right-2.5 bottom-1.5 flex items-center gap-1 text-[11px] text-[#2563EB] font-medium hover:underline px-2 py-1 bg-[#EFF6FF] rounded-md disabled:opacity-60"
            >
              <Locate size={10} /> {geoLoading ? "Detecting..." : coords ? "Location captured" : "Capture Location"}
            </button>
          </div>
          {(geoError || errors.location) && (
            <p className="text-xs text-[#DC2626]">{geoError || errors.location}</p>
          )}

          <Input
            label="Total Capacity (beds)"
            type="number"
            min="1"
            placeholder="200"
            value={form.capacityTotal}
            onChange={(e) => update("capacityTotal", e.target.value)}
            error={errors.capacityTotal}
            fullWidth
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Phone (optional)"
              type="tel"
              placeholder="+92 300 1234567"
              value={form.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              fullWidth
            />
            <Input
              label="Contact Email (optional)"
              type="email"
              placeholder="camp@example.com"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              fullWidth
            />
          </div>

          <div>
            <p className="text-sm font-medium text-[#334155] mb-2">Disasters this camp can respond to</p>
            <div className="flex flex-wrap gap-2">
              {DISASTER_TYPES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDisaster(d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                    ${disasters.includes(d)
                      ? "bg-[#2563EB] border-[#2563EB] text-white"
                      : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                    }`}
                >
                  {disasterLabels[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" icon={<LogOut size={13} />} onClick={onLogout}>
              Sign Out
            </Button>
            <Button fullWidth loading={submitting} disabled={submitting} onClick={handleSubmit}>
              Submit Camp for Approval
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
