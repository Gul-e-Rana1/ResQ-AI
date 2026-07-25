import type { UserRole } from "@/types/domain";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  province: string | null;
  district: string | null;
  city: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  password: string;
  role?: "registered_user" | "camp_manager";
}

export interface SignInInput {
  email: string;
  password: string;
}
