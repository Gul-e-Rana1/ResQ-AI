import React, { useState } from "react";
import {
  LayoutDashboard, AlertTriangle, MapPin, MessageSquare, Phone, User, Settings,
  ChevronRight, Bell, Menu, X, LogOut, Shield, Users, BarChart3,
  CheckSquare, Building2, FileText, HeartHandshake
} from "lucide-react";
import { Avatar, Badge } from "./ui";
import type { NotificationRecord } from "@/lib/services/notifications";

export type UserRole = "user" | "camp_manager" | "camp_team_member" | "admin";
export type PageId = string;

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  section?: string;
}

function getUserNav(badges: Record<string, number>): NavItem[] {
  return [
    { id: "user_dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} />, section: "Overview" },
    { id: "create_emergency", label: "Create Emergency", icon: <AlertTriangle size={16} />, section: "Emergency" },
    { id: "my_emergencies", label: "My Emergencies", icon: <FileText size={16} />, badge: badges.my_emergencies, section: "Emergency" },
    { id: "ai_chat", label: "AI Assistant", icon: <MessageSquare size={16} />, section: "Tools" },
    { id: "nearby_camps", label: "Nearby Camps", icon: <MapPin size={16} />, section: "Tools" },
    { id: "helplines", label: "Emergency Helplines", icon: <Phone size={16} />, section: "Tools" },
    { id: "profile", label: "Profile", icon: <User size={16} />, section: "Account" },
    { id: "user_settings", label: "Settings", icon: <Settings size={16} />, section: "Account" },
  ];
}

function getCampNav(badges: Record<string, number>): NavItem[] {
  return [
    { id: "camp_dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} />, section: "Overview" },
    { id: "camp_emergency_requests", label: "Emergency Requests", icon: <AlertTriangle size={16} />, badge: badges.camp_emergency_requests, section: "Operations" },
    { id: "camp_team", label: "Team Members", icon: <Users size={16} />, section: "Operations" },
    { id: "camp_details_mgmt", label: "Camp Details", icon: <Building2 size={16} />, section: "Management" },
    { id: "camp_profile", label: "Profile", icon: <User size={16} />, section: "Account" },
    { id: "camp_settings", label: "Settings", icon: <Settings size={16} />, section: "Account" },
  ];
}

function getAdminNav(badges: Record<string, number>): NavItem[] {
  return [
    { id: "admin_dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} />, section: "Overview" },
    { id: "admin_approvals", label: "Camp Approvals", icon: <CheckSquare size={16} />, badge: badges.admin_approvals, section: "Management" },
    { id: "admin_users", label: "Users", icon: <Users size={16} />, section: "Management" },
    { id: "admin_camps", label: "Camp Managers", icon: <Building2 size={16} />, section: "Management" },
    { id: "admin_analytics", label: "Analytics", icon: <BarChart3 size={16} />, section: "Insights" },
    { id: "admin_settings", label: "Settings", icon: <Settings size={16} />, section: "System" },
  ];
}

const roleConfig = {
  user: {
    label: "Resident",
    color: "text-[#2563EB]",
    bg: "bg-[#EFF6FF]",
    nav: getUserNav,
  },
  camp_manager: {
    label: "Camp Manager",
    color: "text-[#059669]",
    bg: "bg-[#ECFDF5]",
    nav: getCampNav,
  },
  camp_team_member: {
    label: "Camp Team",
    color: "text-[#059669]",
    bg: "bg-[#ECFDF5]",
    nav: getCampNav,
  },
  admin: {
    label: "Admin",
    color: "text-[#7C3AED]",
    bg: "bg-[#F5F3FF]",
    nav: getAdminNav,
  },
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface LayoutProps {
  role: UserRole;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
  children: React.ReactNode;
  notifications?: NotificationRecord[];
  onNotificationClick?: (notificationId: string, read: boolean) => void;
  badges?: Record<string, number>;
}

export function Layout({
  role,
  currentPage,
  onNavigate,
  onLogout,
  userName = "ResQ AI User",
  userEmail = "user@resqai.pk",
  children,
  notifications = [],
  onNotificationClick,
  badges = {},
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const config = roleConfig[role];
  const navItems = config.nav(badges);

  const sectionGroups = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const visibleNotifications = notifications.slice(0, 6);

  return (
    <div className="flex h-dvh bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-white border-r border-[#E2E8F0] flex flex-col h-dvh transition-transform duration-250 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center flex-shrink-0">
              <HeartHandshake size={14} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#0F172A] font-[family-name:var(--font-display)] tracking-tight">ResQ</span>
              <span className="text-sm font-bold text-[#2563EB] font-[family-name:var(--font-display)] tracking-tight"> AI</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-6 h-6 flex items-center justify-center text-[#94A3B8] hover:text-[#334155]"
          >
            <X size={14} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {Object.entries(sectionGroups).map(([section, items]) => (
            <div key={section}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">
                {section}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group
                        ${isActive
                          ? "bg-[#EFF6FF] text-[#2563EB]"
                          : "text-[#64748B] hover:text-[#334155] hover:bg-[#F8FAFC]"
                        }`}
                    >
                      <span className={`flex-shrink-0 ${isActive ? "text-[#2563EB]" : "text-[#94A3B8] group-hover:text-[#64748B]"}`}>
                        {item.icon}
                      </span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className="px-3 py-3 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer group" onClick={() => onNavigate(role === "admin" ? "admin_settings" : role === "camp_manager" || role === "camp_team_member" ? "camp_profile" : "profile")}>
            <Avatar name={userName} size="sm" online={true} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#0F172A] truncate">{userName}</p>
              <p className="text-[11px] text-[#94A3B8] truncate">{userEmail}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onLogout(); }}
              className="text-[#94A3B8] hover:text-[#DC2626] transition-colors p-1 rounded"
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 md:px-6 h-14 bg-white border-b border-[#E2E8F0] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] rounded-lg"
          >
            <Menu size={16} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-[#64748B] hidden md:flex">
            <span className="text-[#94A3B8]">ResQ AI</span>
            <ChevronRight size={12} className="text-[#CBD5E1]" />
            <span className="text-[#334155] font-medium capitalize">
              {navItems.find((n) => n.id === currentPage)?.label || "Dashboard"}
            </span>
          </div>

          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-8 h-8 flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-all"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-10 w-80 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 slide-down overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9]">
                  <span className="text-sm font-semibold text-[#0F172A]">Notifications</span>
                  {unreadCount > 0 && <Badge variant="blue">{unreadCount} new</Badge>}
                </div>
                <div className="divide-y divide-[#F1F5F9] max-h-80 overflow-y-auto">
                  {visibleNotifications.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-[#94A3B8]">No notifications yet</div>
                  )}
                  {visibleNotifications.map((n) => {
                    const unread = !n.read_at;
                    return (
                      <div
                        key={n.id}
                        onClick={() => onNotificationClick?.(n.id, !unread)}
                        className={`px-4 py-3 hover:bg-[#F8FAFC] cursor-pointer transition-colors ${unread ? "bg-[#FAFBFF]" : ""}`}
                      >
                        <div className="flex items-start gap-2.5">
                          {unread && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0 mt-1.5" />}
                          <div className={unread ? "" : "ml-4"}>
                            <p className="text-xs font-medium text-[#334155] leading-snug">{n.title}</p>
                            <p className="text-xs text-[#64748B] leading-snug mt-0.5">{n.body}</p>
                            <p className="text-[11px] text-[#94A3B8] mt-1">{formatRelativeTime(n.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Role indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bg}`}>
            <Shield size={11} className={config.color} />
            <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
