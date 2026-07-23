import React, { useState } from "react";
import { Layout, type UserRole, type PageId } from "./components/Layout";
import { ToastContainer, useToast } from "./components/ui";

// Pages
import Landing from "./pages/Landing";
import AuthPage from "./pages/Auth";
import UserDashboard from "./pages/user/Dashboard";
import MyEmergencies from "./pages/user/MyEmergencies";
import EmergencyDetails from "./pages/user/EmergencyDetails";
import CreateEmergency from "./pages/user/CreateEmergency";
import AIChat from "./pages/user/AIChat";
import NearbyCamps from "./pages/user/NearbyCamps";
import ProfileSettings from "./pages/user/ProfileSettings";
import Helplines from "./pages/user/Helplines";
import CampDashboard from "./pages/camp/CampDashboard";
import EmergencyRequests from "./pages/camp/EmergencyRequests";
import TeamMembers from "./pages/camp/TeamMembers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingApprovals from "./pages/admin/PendingApprovals";
import UsersPage from "./pages/admin/UsersPage";
import Analytics from "./pages/admin/Analytics";

// Public pages that don't need layout
const PUBLIC_PAGES = new Set([
  "landing", "login", "register", "forgot_password", "reset_password",
  "about", "contact", "helplines_public",
]);

// Pages available without layout (auth pages)
const AUTH_PAGES = new Set(["login", "register", "forgot_password", "reset_password"]);

type AuthPageType = "login" | "register" | "forgot_password" | "reset_password";

const userInfo = {
  user: { name: "Sarah Johnson", email: "sarah@resqai.com" },
  camp_manager: { name: "Rajesh Kumar", email: "rajesh@campalpha.org" },
  admin: { name: "Admin User", email: "admin@resqai.com" },
};

export default function App() {
  const [page, setPage] = useState<PageId>("landing");
  const [role, setRole] = useState<UserRole>("user");
  const { toasts, addToast, removeToast } = useToast();

  const navigate = (target: PageId) => {
    // Default landing for role dashboards
    if (target === "user_dashboard" || target === "camp_dashboard" || target === "admin_dashboard") {
      // Already handled
    }
    setPage(target);
  };

  const handleLogout = () => {
    addToast("success", "Signed out successfully");
    setPage("landing");
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === "user") navigate("user_dashboard");
    else if (newRole === "camp_manager") navigate("camp_dashboard");
    else if (newRole === "admin") navigate("admin_dashboard");
    addToast("info", `Switched to ${newRole === "user" ? "Resident" : newRole === "camp_manager" ? "Camp Manager" : "Admin"} view`);
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
  const info = userInfo[role];

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
          userName={info.name}
          userEmail={info.email}
          notifications={3}
          onRoleSwitch={handleRoleSwitch}
        >
          {renderPage()}
        </Layout>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
