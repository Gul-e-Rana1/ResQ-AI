"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Layout, type UserRole, type PageId } from "./components/Layout";
import { ToastContainer, useToast } from "./components/ui";
import { canAccessPage, getDashboardForRole, toShellRole } from "./lib/auth/roles";
import { useAuth } from "./providers/AuthProvider";
import { useRealtimeNotifications } from "./hooks/useRealtimeNotifications";
import { useRealtimeEmergencies } from "./hooks/useRealtimeEmergencies";
import { useRealtimeCamps } from "./hooks/useRealtimeCamps";
import { useMyCamp } from "./hooks/useMyCamp";
import { markNotificationAsRead } from "./lib/services/notifications";
import type { UserProfile } from "./types/auth";

// Pages 
import Landing from "./screens/Landing";
import AuthPage from "./screens/Auth";
import UserDashboard from "./screens/user/Dashboard";
import MyEmergencies from "./screens/user/MyEmergencies";
import EmergencyDetails from "./screens/user/EmergencyDetails";
import CreateEmergency from "./screens/user/CreateEmergency";
import AIChat from "./screens/user/AIChat";
import NearbyCamps from "./screens/user/NearbyCamps";
import ProfileSettings from "./screens/user/ProfileSettings";
import Helplines from "./screens/user/Helplines";
import CampDashboard from "./screens/camp/CampDashboard";
import EmergencyRequests from "./screens/camp/EmergencyRequests";
import TeamMembers from "./screens/camp/TeamMembers";
import AdminDashboard from "./screens/admin/AdminDashboard";
import PendingApprovals from "./screens/admin/PendingApprovals";
import UsersPage from "./screens/admin/UsersPage";
import Analytics from "./screens/admin/Analytics";

// Public pages that don't need layout
const PUBLIC_PAGES = new Set([
  "landing", "login", "register", "forgot_password", "reset_password",
  "about", "contact", "helplines_public",
]);

// Pages available without layout (auth pages)
const AUTH_PAGES = new Set(["login", "register", "forgot_password", "reset_password"]);

function getProfileName(profile: UserProfile | null) {
  return profile?.full_name || profile?.email?.split("@")[0] || "ResQ AI User";
}

export default function App() {
  const [page, setPage] = useState<PageId>("landing");
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const { profile, user, loading: authLoading, signOut } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const role = toShellRole(profile?.role) as UserRole;

  const notificationsQuery = useRealtimeNotifications(user?.id);
  const { data: myCamp } = useMyCamp();

  const myEmergenciesQuery = useRealtimeEmergencies({
    requesterId: user?.id,
    enabled: !!user?.id && role === "user",
  });
  const campEmergenciesQuery = useRealtimeEmergencies({
    assignedCampId: myCamp?.id,
    enabled: !!myCamp?.id && (role === "camp_manager" || role === "camp_team_member"),
  });
  const pendingCampsQuery = useRealtimeCamps({
    status: "pending",
    enabled: role === "admin",
  });

  const badges = useMemo(() => {
    const ACTIVE_STATUSES = new Set(["Submitted", "Assigned", "Accepted", "En Route", "Arrived"]);
    const result: Record<string, number> = {};

    const myActive = (myEmergenciesQuery.data || []).filter((e) => ACTIVE_STATUSES.has(e.status)).length;
    if (myActive > 0) result.my_emergencies = myActive;

    const campPending = (campEmergenciesQuery.data || []).filter((e) => ACTIVE_STATUSES.has(e.status)).length;
    if (campPending > 0) result.camp_emergency_requests = campPending;

    const pendingCamps = (pendingCampsQuery.data || []).length;
    if (pendingCamps > 0) result.admin_approvals = pendingCamps;

    return result;
  }, [myEmergenciesQuery.data, campEmergenciesQuery.data, pendingCampsQuery.data]);

  const changePage = (target: PageId, updateHistory = true) => {
    setPage(target);
    if (updateHistory && typeof window !== "undefined") {
      const currentParam = new URLSearchParams(window.location.search).get("page") || "landing";
      if (currentParam !== target) {
        const url = target === "landing" ? "/" : `/?page=${encodeURIComponent(target)}`;
        window.history.pushState({ page: target }, "", url);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const requestedPage = (params.get("page") as PageId) || "landing";
      setPage(requestedPage);
    };

    const params = new URLSearchParams(window.location.search);
    const requestedPage = params.get("page") as PageId | null;
    if (requestedPage) {
      setPage(requestedPage);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (target: PageId, id?: string) => {
    if (!PUBLIC_PAGES.has(target) && !user) {
      addToast("info", "Please sign in to continue");
      changePage("login");
      return;
    }

    if (user && !canAccessPage(profile?.role, target)) {
      addToast("warning", "You do not have access to that area");
      changePage(getDashboardForRole(profile?.role) as PageId);
      return;
    }

    if (target === "emergency_details" || target === "camp_emergency_details") {
      setSelectedEmergencyId(id ?? null);
    }

    changePage(target);
  };

  const handleNotificationClick = async (notificationId: string, read: boolean) => {
    if (read) return;
    await markNotificationAsRead(notificationId);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      addToast("success", "Signed out successfully");
      changePage("landing");
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Unable to sign out");
    }
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    if (profile?.role !== "admin") {
      addToast("info", "Role switching is available to administrators only");
      return;
    }

    if (newRole === "user") changePage("user_dashboard");
    else if (newRole === "camp_manager" || newRole === "camp_team_member") changePage("camp_dashboard");
    else if (newRole === "admin") changePage("admin_dashboard");
  };

  // Render page content
  const renderPage = () => {
    switch (page) {
      // Landing
      case "landing":
      case "about":
      case "contact":
        return <Landing onNavigate={navigate} />;

      // Auth
      case "login":
        return <AuthPage page="login" onNavigate={navigate} />;
      case "register":
        return <AuthPage page="register" onNavigate={navigate} />;
      case "forgot_password":
        return <AuthPage page="forgot_password" onNavigate={navigate} />;
      case "reset_password":
        return <AuthPage page="reset_password" onNavigate={navigate} />;

      // User pages
      case "user_dashboard":
        return <UserDashboard onNavigate={navigate} />;
      case "my_emergencies":
        return <MyEmergencies onNavigate={navigate} />;
      case "emergency_details":
        return <EmergencyDetails onNavigate={navigate} emergencyId={selectedEmergencyId} />;
      case "create_emergency":
        return <CreateEmergency onNavigate={navigate} />;
      case "ai_chat":
        return <AIChat onNavigate={navigate} />;
      case "nearby_camps":
        return <NearbyCamps onNavigate={navigate} />;
      case "camp_details":
        return <NearbyCamps onNavigate={navigate} />;
      case "profile":
        return <ProfileSettings onNavigate={navigate} page="profile" />;
      case "user_settings":
        return <ProfileSettings onNavigate={navigate} page="user_settings" />;
      case "helplines":
        return <Helplines />;

      // Camp manager pages
      case "camp_dashboard":
        return <CampDashboard onNavigate={navigate} />;
      case "camp_emergency_requests":
        return <EmergencyRequests onNavigate={navigate} />;
      case "camp_emergency_details":
        return <EmergencyRequests onNavigate={navigate} initialEmergencyId={selectedEmergencyId ?? undefined} />;
      case "camp_team":
        return <TeamMembers />;
      case "camp_details_mgmt":
      case "camp_departments":
      case "camp_profile":
      case "camp_settings":
        return <CampDashboard onNavigate={navigate} />;

      // Admin pages
      case "admin_dashboard":
        return <AdminDashboard onNavigate={navigate} />;
      case "admin_approvals":
        return <PendingApprovals />;
      case "admin_users":
      case "admin_camps":
        return <UsersPage onNavigate={navigate} />;
      case "admin_analytics":
        return <Analytics />;
      case "admin_settings":
        return <Analytics />;

      default:
        return <Landing onNavigate={navigate} />;
    }
  };

  const isPublicPage = PUBLIC_PAGES.has(page) || AUTH_PAGES.has(page);
  const displayName = getProfileName(profile);
  const displayEmail = profile?.email || user?.email || "user@resqai.pk";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-sm font-medium text-[#64748B]">Loading ResQ AI...</div>
      </div>
    );
  }

  return (
    <>
      {isPublicPage ? (
        renderPage()
      ) : (
        <Layout
          role={role}
          currentPage={page}
          onNavigate={navigate}
          onLogout={handleLogout}
          userName={displayName}
          userEmail={displayEmail}
          notifications={notificationsQuery.data || []}
          onNotificationClick={handleNotificationClick}
          badges={badges}
          onRoleSwitch={profile?.role === "admin" ? handleRoleSwitch : undefined}
        >
          {renderPage()}
        </Layout>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
