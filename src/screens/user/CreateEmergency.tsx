"use client";
import React, { useState } from "react";
import {
  ArrowLeft, MapPin, AlertTriangle, Users, CheckCircle,
  Zap, Locate
} from "lucide-react";
import { z } from "zod";
import { Button, Input, Textarea, Select, Card, Alert, RiskLevel } from "../../components/ui";
import { useAuth } from "../../providers/AuthProvider";
import { useGeolocation } from "@/hooks/useGeolocation";
import { createEmergencyRequest } from "@/lib/services/emergencies";
import { recommendCamps } from "@/lib/services/camps";
import { assessEmergency } from "@/lib/services/ai";
import { PAKISTAN_PROVINCES } from "@/lib/constants/pakistan";
import type { DisasterType, EmergencyUrgency } from "@/types/domain";

interface Props {
  onNavigate: (page: string, id?: string) => void;
}

// The select's `value` must stay unique per option (the shared Select component keys
// options by value), so UI-level ids are kept distinct here and mapped to the
// canonical DB `disasterType` separately — several options legitimately collapse to "other".
const emergencyTypes: { value: string; label: string; disasterType: DisasterType | "" }[] = [
  { value: "", label: "Select emergency type...", disasterType: "" },
  { value: "flood", label: "🌊 Flood / Flash Flood", disasterType: "flood" },
  { value: "earthquake", label: "🏚️ Earthquake Damage", disasterType: "earthquake" },
  { value: "fire", label: "🔥 Fire / Wildfire", disasterType: "wildfire" },
  { value: "medical", label: "🏥 Medical Emergency", disasterType: "medical" },
  { value: "cyclone", label: "🌀 Cyclone / Storm", disasterType: "storm" },
  { value: "landslide", label: "⛰️ Landslide", disasterType: "landslide" },
  { value: "shelter", label: "🏕️ Food & Shelter", disasterType: "other" },
  { value: "missing", label: "🔍 Missing Person", disasterType: "other" },
  { value: "other", label: "🆘 Other Emergency", disasterType: "other" },
];

const priorities = [
  { value: "", label: "Select priority..." },
  { value: "low", label: "Low — Non-urgent, stable situation" },
  { value: "medium", label: "Medium — Needs help soon" },
  { value: "high", label: "High — Urgent, needs fast response" },
  { value: "critical", label: "Critical — Life-threatening" },
];

const emergencySchema = z.object({
  type: z.string().min(1, "Please select an emergency type"),
  priority: z.string().min(1, "Please select a priority level"),
  address: z.string().trim().min(1, "Address is required"),
  province: z.string().min(1, "Province is required"),
  district: z.string().trim().min(1, "District is required"),
  people: z.coerce
    .number({ message: "Enter a valid number" })
    .int("Enter a whole number")
    .min(1, "At least 1 person must be affected"),
  description: z.string().trim().min(20, "Please describe the situation in at least 20 characters"),
});

type EmergencyFormValues = z.infer<typeof emergencySchema>;
type FormErrors = Partial<Record<keyof EmergencyFormValues, string>>;

export default function CreateEmergency({ onNavigate }: Props) {
  const { user } = useAuth();
  const { coords, loading: geoLoading, error: geoError, locate } = useGeolocation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [createdEmergencyId, setCreatedEmergencyId] = useState("");
  const [nearestCamp, setNearestCamp] = useState<string | null>(null);
  const [campLookupDone, setCampLookupDone] = useState(false);
  const [form, setForm] = useState({
    type: "",
    typeLabel: "",
    priority: "",
    address: "",
    province: "",
    district: "",
    people: "",
    elderly: false,
    children: false,
    injured: false,
    description: "",
  });

  const update = (key: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [key]: value }));

  const validate = (): FormErrors => {
    const result = emergencySchema.safeParse(form);
    if (result.success) return {};
    const errs: FormErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof EmergencyFormValues;
      if (!errs[key]) errs[key] = issue.message;
    }
    return errs;
  };

  const handleAutoDetect = async () => {
    const result = await locate();
    if (result) {
      update(
        "address",
        `Lat ${result.latitude.toFixed(4)}, Lng ${result.longitude.toFixed(4)} (auto-detected — edit if needed)`
      );
    }
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setErrorMessage("");
    try {
      if (!user?.id) {
        setErrorMessage("You must be signed in to submit an emergency request.");
        return;
      }

      const title = `${form.typeLabel || form.type || "Emergency"} Request - ${form.address || "Location"}`;
      const description = form.description;
      const peopleCount = parseInt(form.people, 10) || 1;
      const disasterType = (emergencyTypes.find((t) => t.value === form.type)?.disasterType || "other") as DisasterType;

      const requiredSupplies = [
        ...(form.elderly ? ["Elderly Care"] : []),
        ...(form.children ? ["Child Food / Supplies"] : []),
        ...(form.injured ? ["First Aid / Medical Kit"] : []),
      ];

      const [assessment, campMatches] = await Promise.all([
        assessEmergency({ title, description, peopleCount }),
        recommendCamps({
          disasterType,
          requiredSupplies,
          userLocation: coords ? { latitude: coords.latitude, longitude: coords.longitude } : undefined,
          limit: 1,
        }).catch(() => []),
      ]);

      const matchedCamp = campMatches[0]?.camp ?? null;

      const result = await createEmergencyRequest({
        requesterId: user.id,
        disasterType,
        urgency: (form.priority ? form.priority.toUpperCase() : "MEDIUM") as EmergencyUrgency,
        title,
        description,
        province: form.province,
        district: form.district,
        address: form.address,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        peopleCount,
        requiredSupplies,
        assignedCampId: matchedCamp?.id,
        ...(assessment ? { aiSummary: assessment as unknown as Record<string, unknown> } : {}),
      });

      if (result) {
        setCreatedEmergencyId(result.id);
      }
      setNearestCamp(matchedCamp?.name ?? null);
      setCampLookupDone(true);
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Error submitting emergency request:", message);
      setErrorMessage("Failed to submit your emergency request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-5 md:p-6 max-w-2xl mx-auto">
        <Card className="text-center py-10 px-6">
          <div className="w-16 h-16 rounded-full bg-[#ECFDF5] border-2 border-[#D1FAE5] mx-auto mb-4 flex items-center justify-center">
            <CheckCircle size={28} className="text-[#059669]" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2 font-[family-name:var(--font-display)]">
            Emergency Submitted!
          </h2>
          <p className="text-sm text-[#64748B] mb-2">
            Your request has been received and is being processed by ResQ AI.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-full mb-6">
            <span className="text-xs font-bold text-[#2563EB] font-[family-name:var(--font-mono)]">
              #{createdEmergencyId ? createdEmergencyId.slice(0, 8) : "Pending"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
              <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Status</p>
              <p className="text-xs font-semibold text-[#2563EB] mt-1">{nearestCamp ? "Assigned" : "Submitted"}</p>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
              <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Est. Response</p>
              <p className="text-xs font-semibold text-[#059669] mt-1">&lt; 10 min</p>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
              <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Nearest Camp</p>
              <p className="text-xs font-semibold text-[#0F172A] mt-1">
                {campLookupDone ? nearestCamp || "No camp matched yet" : "Matching in progress..."}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button fullWidth variant="outline" onClick={() => onNavigate("my_emergencies")}>
              View My Requests
            </Button>
            <Button fullWidth onClick={() => onNavigate("emergency_details", createdEmergencyId || undefined)}>
              Track Emergency
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("user_dashboard")}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-all"
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
            Submit Emergency Request
          </h1>
          <p className="text-sm text-[#64748B]">Fill in the details below to request help</p>
        </div>
      </div>

      {/* AI tip */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl">
        <Zap size={14} className="text-[#7C3AED] flex-shrink-0" />
        <p className="text-xs text-[#6D28D9]">
          <strong>AI Tip:</strong> Providing accurate location and description helps our AI match you to the nearest and most suitable camp faster.
        </p>
      </div>

      {errorMessage && <Alert type="error">{errorMessage}</Alert>}

      <Card>
        <div className="space-y-4">
          <Select
            label="Emergency Type"
            options={emergencyTypes}
            value={form.type}
            onChange={(e) => {
              const opt = emergencyTypes.find((t) => t.value === e.target.value);
              update("type", e.target.value);
              update("typeLabel", opt?.label || "");
            }}
            error={errors.type}
            fullWidth
          />
          <Select
            label="Priority Level"
            options={priorities}
            value={form.priority}
            onChange={(e) => update("priority", e.target.value)}
            error={errors.priority}
            fullWidth
          />
          {form.priority && form.priority !== "" && (
            <div className="p-3 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl">
              <p className="text-xs font-semibold text-[#334155] mb-2">AI Risk Estimate</p>
              <RiskLevel level={form.priority as "low" | "medium" | "high" | "critical"} />
            </div>
          )}

          <div className="relative">
            <Input
              label="Current Address / Location"
              placeholder="House No., Street, Area, City"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              prefixIcon={<MapPin size={14} />}
              error={errors.address}
              fullWidth
            />
            <button
              type="button"
              onClick={handleAutoDetect}
              disabled={geoLoading}
              className="absolute right-2.5 bottom-1.5 flex items-center gap-1 text-[11px] text-[#2563EB] font-medium hover:underline px-2 py-1 bg-[#EFF6FF] rounded-md disabled:opacity-60"
            >
              <Locate size={10} /> {geoLoading ? "Detecting..." : coords ? "Location captured" : "Auto-detect"}
            </button>
          </div>
          {geoError && <p className="text-xs text-[#DC2626]">{geoError}</p>}

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Province"
              options={[
                { value: "", label: "Select province..." },
                ...PAKISTAN_PROVINCES.map((p) => ({ value: p, label: p })),
              ]}
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

          <Input
            label="Number of People Affected"
            type="number"
            min="1"
            placeholder="4"
            value={form.people}
            onChange={(e) => update("people", e.target.value)}
            prefixIcon={<Users size={14} />}
            error={errors.people}
            fullWidth
          />

          <div>
            <p className="text-sm font-medium text-[#334155] mb-2">Vulnerable persons present?</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "elderly", label: "Elderly" },
                { key: "children", label: "Children" },
                { key: "injured", label: "Injured" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => update(key, !form[key as keyof typeof form])}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                    ${form[key as keyof typeof form]
                      ? "bg-[#2563EB] border-[#2563EB] text-white"
                      : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Emergency Description"
            placeholder="Describe your situation in detail. Include current conditions, immediate dangers, and any other relevant information that can help responders."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            fullWidth
            rows={5}
            error={errors.description}
            hint={errors.description ? undefined : "Be as detailed as possible — this helps AI assess your risk level accurately."}
          />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button className="ml-auto" loading={loading} disabled={loading} onClick={handleSubmit} icon={<AlertTriangle size={14} />}>
          Submit Emergency
        </Button>
      </div>
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
