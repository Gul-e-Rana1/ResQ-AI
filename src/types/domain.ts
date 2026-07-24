export type UserRole = "guest" | "registered_user" | "camp_manager" | "camp_team_member" | "admin";

export type CampStatus = "pending" | "approved" | "rejected" | "suspended";

export type DisasterType =
  | "flood"
  | "earthquake"
  | "wildfire"
  | "landslide"
  | "storm"
  | "medical"
  | "other";

export type EmergencyUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type EmergencyStatus =
  | "Submitted"
  | "Assigned"
  | "Accepted"
  | "En Route"
  | "Arrived"
  | "Resolved"
  | "Cancelled";

export type PakistanProvince =
  | "Punjab"
  | "Sindh"
  | "Khyber Pakhtunkhwa"
  | "Balochistan"
  | "Islamabad Capital Territory"
  | "Gilgit-Baltistan"
  | "Azad Jammu and Kashmir";

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface CampRecommendationInput {
  disasterType: DisasterType;
  urgency: EmergencyUrgency;
  requiredSupplies: string[];
  location: GeoPoint;
}
