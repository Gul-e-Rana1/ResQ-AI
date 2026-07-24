"use client";

import React, { useEffect, useState } from "react";
import { Layout, type UserRole, type PageId } from "./components/Layout";
import { ToastContainer, useToast } from "./components/ui";
import { canAccessPage, getDashboardForRole, toShellRole } from "./lib/auth/roles";
import { useAuth } from "./providers/AuthProvider";
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
  const { profile, user, loading: authLoading, signOut } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const role = toShellRole(profile?.role) as UserRole;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPage = params.get("page");
    if (requestedPage) {
      setPage(requestedPage);
    }
  }, []);

  const navigate = (target: PageId) => {
    if (!PUBLIC_PAGES.has(target) && !user) {
      addToast("info", "Please sign in to continue");
      setPage("login");
      return;
    }

    if (user && !canAccessPage(profile?.role, target)) {
      addToast("warning", "You do not have access to that area");
      setPage(getDashboardForRole(profile?.role));
      return;
    }

    setPage(target);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      addToast("success", "Signed out successfully");
      setPage("landing");
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Unable to sign out");
    }
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    if (profile?.role !== "admin") {
      addToast("info", "Role switching is available to administrators only");
      return;
    }

    if (newRole === "user") setPage("user_dashboard");
    else if (newRole === "camp_manager" || newRole === "camp_team_member") setPage("camp_dashboard");
    else if (newRole === "admin") setPage("admin_dashboard");
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
        return <EmergencyDetails onNavigate={navigate} />;
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
      case "camp_emergency_details":
        return <EmergencyRequests onNavigate={navigate} />;
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
          notifications={3}
          onRoleSwitch={profile?.role === "admin" ? handleRoleSwitch : undefined}
        >
          {renderPage()}
        </Layout>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
