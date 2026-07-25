import type { DisasterType, EmergencyStatus, PakistanProvince, UserRole } from "@/types/domain";

export const PAKISTAN_PROVINCES: PakistanProvince[] = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu and Kashmir",
];

export const DISASTER_TYPES: DisasterType[] = [
  "flood",
  "earthquake",
  "wildfire",
  "landslide",
  "storm",
  "medical",
  "other",
];

export const EMERGENCY_STATUSES: EmergencyStatus[] = [
  "Submitted",
  "Assigned",
  "Accepted",
  "En Route",
  "Arrived",
  "Resolved",
  "Cancelled",
];

export const USER_ROLES: UserRole[] = [
  "guest",
  "registered_user",
  "camp_manager",
  "camp_team_member",
  "admin",
];

export const PAKISTAN_EMERGENCY_HELPLINES = [
  {
    category: "Rescue & Disaster Response",
    name: "Rescue 1122",
    phone: "1122",
    scope: "Punjab, KP, Sindh, Balochistan, GB, AJK",
  },
  {
    category: "Rescue & Disaster Response",
    name: "NDMA Helpline",
    phone: "051-111-157-157",
    scope: "Nationwide",
  },
  {
    category: "Medical Emergency",
    name: "Edhi Ambulance",
    phone: "115",
    scope: "Nationwide",
  },
  {
    category: "Medical Emergency",
    name: "Aman Ambulance",
    phone: "1021",
    scope: "Karachi only",
  },
  {
    category: "Police & Safety",
    name: "Police Emergency",
    phone: "15",
    scope: "Nationwide",
  },
  {
    category: "Fire Brigade",
    name: "Fire Emergency",
    phone: "16",
    scope: "Nationwide",
  },
  {
    category: "Women Helpline",
    name: "National Helpline",
    phone: "1099",
    scope: "Nationwide",
  },
  {
    category: "Child Protection",
    name: "Child Helpline",
    phone: "1121",
    scope: "Availability varies by province",
  },
] as const;
