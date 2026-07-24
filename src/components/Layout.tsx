import React, { useState } from "react";
import {
  LayoutDashboard, AlertTriangle, MapPin, MessageSquare, Phone, User, Settings,
  ChevronRight, Bell, Search, Menu, X, LogOut, Shield, Users, BarChart3,
  CheckSquare, Building2, HardHat, FileText, Home, ChevronDown, Zap,
  Activity, HeartHandshake
} from "lucide-react";
import { Avatar, Badge } from "./ui";

export type UserRole = "user" | "camp_manager" | "camp_team_member" | "admin";
export type PageId = string;

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  section?: string;
}

function getUserNav(): NavItem[] {
  return [
    { id: "user_dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} />, section: "Overview" },
    { id: "create_emergency", label: "Create Emergency", icon: <AlertTriangle size={16} />, section: "Emergency" },
    { id: "my_emergencies", label: "My Emergencies", icon: <FileText size={16} />, badge: 2, section: "Emergency" },
    { id: "ai_chat", label: "AI Assistant", icon: <MessageSquare size={16} />, section: "Tools" },
    { id: "nearby_camps", label: "Nearby Camps", icon: <MapPin size={16} />, section: "Tools" },
    { id: "helplines", label: "Emergency Helplines", icon: <Phone size={16} />, section: "Tools" },
    { id: "profile", label: "Profile", icon: <User size={16} />, section: "Account" },
    { id: "user_settings", label: "Settings", icon: <Settings size={16} />, section: "Account" },
  ];
}

function getCampNav(): NavItem[] {
  return [
    { id: "camp_dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} />, section: "Overview" },
    { id: "camp_emergency_requests", label: "Emergency Requests", icon: <AlertTriangle size={16} />, badge: 5, section: "Operations" },
    { id: "camp_team", label: "Team Members", icon: <Users size={16} />, section: "Operations" },
    { id: "camp_details_mgmt", label: "Camp Details", icon: <Building2 size={16} />, section: "Management" },
    { id: "camp_departments", label: "Departments", icon: <HardHat size={16} />, section: "Management" },
    { id: "camp_profile", label: "Profile", icon: <User size={16} />, section: "Account" },
    { id: "camp_settings", label: "Settings", icon: <Settings size={16} />, section: "Account" },
  ];
}

function getAdminNav(): NavItem[] {
  return [
    { id: "admin_dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} />, section: "Overview" },
    { id: "admin_approvals", label: "Camp Approvals", icon: <CheckSquare size={16} />, badge: 3, section: "Management" },
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

interface LayoutProps {
  role: UserRole;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
  children: React.ReactNode;
  notifications?: number;
  onRoleSwitch?: (role: UserRole) => void;
}

export function Layout({
  role,
  currentPage,
  onNavigate,
  onLogout,
  userName = "Sarah Johnson",
  userEmail = "sarah@resqai.com",
  children,
  notifications = 3,
  onRoleSwitch,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const config = roleConfig[role];
  const navItems = config.nav();

  const sectionGroups = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const sampleNotifs = [
    { id: 1, text: "Emergency #EM-2891 has been assigned to Camp Delta", time: "2 min ago", unread: true, type: "info" },
    { id: 2, text: "Your rescue request is En Route — ETA 12 minutes", time: "15 min ago", unread: true, type: "success" },
    { id: 3, text: "Camp Alpha has capacity for 40 more people", time: "1 hr ago", unread: true, type: "info" },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-white border-r border-[#E2E8F0] flex flex-col h-screen transition-transform duration-250 ease-in-out
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

        {/* Role switcher */}
        {onRoleSwitch && (
          <div className="px-3 pt-3">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F8FAFC] transition-colors"
            >
              <div className={`w-6 h-6 rounded-md ${config.bg} flex items-center justify-center`}>
                <Shield size={12} className={config.color} />
              </div>
              <span className={`text-xs font-semibold ${config.color} flex-1 text-left`}>{config.label}</span>
              <ChevronDown size={12} className={`text-[#94A3B8] transition-transform ${roleMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {roleMenuOpen && (
              <div className="mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden slide-down">
                {(["user", "camp_manager", "camp_team_member", "admin"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => { onRoleSwitch(r); setRoleMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F8FAFC] transition-colors ${r === role ? "bg-[#F8FAFC]" : ""}`}
                  >
                    <Shield size={12} className={roleConfig[r].color} />
                    <span className="text-[#334155]">{roleConfig[r].label}</span>
                    {r === role && <Check size={12} className="ml-auto text-[#2563EB]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer group" onClick={() => onNavigate(role === "admin" ? "admin_settings" : role === "camp_manager" ? "camp_profile" : "profile")}>
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

          {/* Search */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#94A3B8] cursor-pointer hover:border-[#CBD5E1] transition-all w-52">
            <Search size={13} />
            <span>Search...</span>
            <kbd className="ml-auto text-[10px] px-1 py-0.5 bg-white border border-[#E2E8F0] rounded font-mono">⌘K</kbd>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-8 h-8 flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-all"
            >
              <Bell size={16} />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-10 w-80 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 slide-down overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9]">
                  <span className="text-sm font-semibold text-[#0F172A]">Notifications</span>
                  <Badge variant="blue">{notifications} new</Badge>
                </div>
                <div className="divide-y divide-[#F1F5F9]">
                  {sampleNotifs.map((n) => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-[#F8FAFC] cursor-pointer transition-colors ${n.unread ? "bg-[#FAFBFF]" : ""}`}>
                      <div className="flex items-start gap-2.5">
                        {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0 mt-1.5" />}
                        <div className={n.unread ? "" : "ml-4"}>
                          <p className="text-xs text-[#334155] leading-snug">{n.text}</p>
                          <p className="text-[11px] text-[#94A3B8] mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-[#F1F5F9] text-center">
                  <button className="text-xs text-[#2563EB] font-medium hover:underline">View all notifications</button>
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

// Helper icons for Check
function Check({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
