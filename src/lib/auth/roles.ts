import type { UserRole } from "@/types/domain";

export type AppShellRole = "user" | "camp_manager" | "camp_team_member" | "admin";

export function toShellRole(role?: UserRole | null): AppShellRole {
  if (role === "admin") return "admin";
  if (role === "camp_manager") return "camp_manager";
  if (role === "camp_team_member") return "camp_team_member";
  return "user";
}

export function getDashboardForRole(role?: UserRole | null): string {
  if (role === "admin") return "admin_dashboard";
  if (role === "camp_manager" || role === "camp_team_member") return "camp_dashboard";
  return "user_dashboard";
}

export function canAccessPage(role: UserRole | null | undefined, page: string): boolean {
  if (!role || role === "guest") return false;
  if (role === "admin") return true;

  if (page.startsWith("admin_")) return false;

  if (role === "camp_manager" || role === "camp_team_member") {
    return page.startsWith("camp_") || page === "camp_dashboard" || page === "ai_chat" || page === "helplines";
  }

  return !page.startsWith("camp_");
}

export const DEMO_ACCOUNTS = {
  admin: {
    email: "admin.resqai@gmail.com",
    password: "ResQ@123",
  },
  camp_manager: {
    email: "campmanager.resqai@gmail.com",
    password: "ResQ@123",
  },
  camp_team_member: {
    email: "helper.resqai@gmail.com",
    password: "ResQ@123",
  },
  registered_user: {
    email: "user.resqai@gmail.com",
    password: "ResQ@123",
  },
} as const;
