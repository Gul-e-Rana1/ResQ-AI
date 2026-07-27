import React from "react";
import { CheckCircle, Circle, Clock, Loader2, XCircle, AlertTriangle, Navigation, MapPin, UserCheck, Shield } from "lucide-react";

type EmergencyStatus = "submitted" | "assigned" | "accepted" | "en_route" | "arrived" | "resolved" | "cancelled";

interface TimelineStep {
  status: EmergencyStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const steps: TimelineStep[] = [
  {
    status: "submitted",
    label: "Request Submitted",
    description: "Your emergency request has been received and is being processed.",
    icon: <AlertTriangle size={14} />,
  },
  {
    status: "assigned",
    label: "Camp Assigned",
    description: "A relief camp has been matched and assigned to your emergency.",
    icon: <Shield size={14} />,
  },
  {
    status: "accepted",
    label: "Request Accepted",
    description: "The relief camp has confirmed and accepted your emergency request.",
    icon: <UserCheck size={14} />,
  },
  {
    status: "en_route",
    label: "Team En Route",
    description: "Relief team is on their way to your location.",
    icon: <Navigation size={14} />,
  },
  {
    status: "arrived",
    label: "Team Arrived",
    description: "The relief team has arrived at your emergency location.",
    icon: <MapPin size={14} />,
  },
  {
    status: "resolved",
    label: "Emergency Resolved",
    description: "Your emergency has been successfully resolved.",
    icon: <CheckCircle size={14} />,
  },
];

const statusOrder: Record<EmergencyStatus, number> = {
  submitted: 0,
  assigned: 1,
  accepted: 2,
  en_route: 3,
  arrived: 4,
  resolved: 5,
  cancelled: -1,
};

interface TimelineEvent {
  status: EmergencyStatus;
  timestamp: string;
  note?: string;
  actor?: string;
}

interface EmergencyTimelineProps {
  currentStatus: EmergencyStatus;
  events?: TimelineEvent[];
  compact?: boolean;
}

export function EmergencyTimeline({ currentStatus, events = [], compact = false }: EmergencyTimelineProps) {
  if (currentStatus === "cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
        <div className="w-8 h-8 rounded-full bg-[#DC2626] flex items-center justify-center flex-shrink-0">
          <XCircle size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#B91C1C]">Emergency Cancelled</p>
          <p className="text-xs text-[#DC2626]/70 mt-0.5">This emergency request has been cancelled.</p>
        </div>
      </div>
    );
  }

  const currentStep = statusOrder[currentStatus];

  return (
    <div className={`space-y-0 ${compact ? "" : ""}`}>
      {steps.map((step, idx) => {
        const stepOrder = statusOrder[step.status];
        const isCompleted = stepOrder < currentStep || (currentStatus === "resolved" && stepOrder === currentStep);
        const isCurrent = stepOrder === currentStep && currentStatus !== "resolved";
        const isPending = stepOrder > currentStep;

        const event = events.find((e) => e.status === step.status);

        return (
          <div key={step.status} className="flex gap-4">
            {/* Line + dot column */}
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
              {/* Connector line above */}
              <div
                className={`w-px flex-none transition-colors duration-300 ${idx === 0 ? "invisible" : isCompleted || isCurrent ? "bg-[#2563EB]" : "bg-[#E2E8F0]"}`}
                style={{ height: compact ? 12 : 16 }}
              />

              {/* Status dot */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 border-2
                  ${isCompleted
                    ? "bg-[#2563EB] border-[#2563EB] text-white"
                    : isCurrent
                    ? "bg-white border-[#2563EB] text-[#2563EB] shadow-sm shadow-[#DBEAFE]"
                    : "bg-white border-[#E2E8F0] text-[#CBD5E1]"
                  }`}
              >
                {isCompleted ? (
                  <CheckCircle size={14} className="text-white" />
                ) : isCurrent ? (
                  <Loader2 size={14} className="spin" />
                ) : (
                  <Circle size={10} />
                )}
              </div>

              {/* Connector line below */}
              {idx < steps.length - 1 && (
                <div
                  className={`w-px flex-1 min-h-4 transition-colors duration-300 ${isCompleted ? "bg-[#2563EB]" : "bg-[#E2E8F0]"}`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-${compact ? "4" : "6"} min-w-0 flex-1 ${idx === steps.length - 1 ? "" : compact ? "pb-4" : "pb-5"}`}>
              <div className="flex items-start justify-between gap-2 pt-0.5">
                <div>
                  <p className={`text-sm font-semibold transition-colors
                    ${isCompleted ? "text-[#0F172A]" : isCurrent ? "text-[#2563EB]" : "text-[#94A3B8]"}`}>
                    {step.label}
                  </p>
                  {!compact && (
                    <p className={`text-xs mt-0.5 transition-colors
                      ${isCompleted || isCurrent ? "text-[#64748B]" : "text-[#CBD5E1]"}`}>
                      {event?.note || step.description}
                    </p>
                  )}
                </div>
                {event?.timestamp && !compact && (
                  <div className="flex items-center gap-1 text-[11px] text-[#94A3B8] flex-shrink-0">
                    <Clock size={10} />
                    {event.timestamp}
                  </div>
                )}
              </div>

              {!compact && event?.actor && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                    <Shield size={8} className="text-[#2563EB]" />
                  </div>
                  <span className="text-[11px] text-[#64748B]">{event.actor}</span>
                </div>
              )}

              {isCurrent && !compact && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-[#EFF6FF] rounded-lg border border-[#DBEAFE]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] blink flex-shrink-0" />
                  <p className="text-xs text-[#2563EB] font-medium">In progress…</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
