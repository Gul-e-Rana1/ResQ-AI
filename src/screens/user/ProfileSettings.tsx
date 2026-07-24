import React, { useState } from "react";
import {
  User, Mail, Phone, MapPin, Lock, Bell, Shield, Eye, EyeOff,
  Camera, Save, ChevronRight, Globe, Smartphone, AlertTriangle
} from "lucide-react";
import { Card, Button, Input, Toggle, Tabs, Select, Avatar } from "../../components/ui";

interface Props {
  onNavigate: (page: string) => void;
  page: "profile" | "user_settings";
}

export default function ProfileSettings({ onNavigate, page }: Props) {
  const [activeTab, setActiveTab] = useState(page === "user_settings" ? "notifications" : "personal");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+91 98765 43210",
    location: "Sector 14, New Delhi",
    bio: "Resident of Sector 14. Registered for emergency relief coordination.",
  });

  const [notifications, setNotifications] = useState({
    emergencyUpdates: true,
    campAlerts: true,
    smsAlerts: true,
    emailAlerts: false,
    marketingEmails: false,
    weeklyDigest: true,
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const tabs = [
    { id: "personal", label: "Personal Info" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
    { id: "emergency", label: "Emergency Profile" },
  ];

  return (
    <div className="p-5 md:p-6 max-w-3xl space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">
          {page === "profile" ? "My Profile" : "Settings"}
        </h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          {page === "profile" ? "Manage your personal information" : "Configure your account preferences"}
        </p>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "personal" && (
        <div className="space-y-5">
          {/* Avatar */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name={profile.name} size="xl" />
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2563EB] text-white rounded-full flex items-center justify-center hover:bg-[#1D4ED8] transition-colors shadow-sm">
                  <Camera size={11} />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{profile.name}</p>
                <p className="text-xs text-[#64748B]">{profile.email}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">Resident · Since Jan 2026</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Personal Information</h2>
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                  prefixIcon={<User size={13} />}
                  fullWidth
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                  prefixIcon={<Mail size={13} />}
                  fullWidth
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Phone Number"
                  value={profile.phone}
                  onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                  prefixIcon={<Phone size={13} />}
                  fullWidth
                />
                <Input
                  label="Location / City"
                  value={profile.location}
                  onChange={(e) => setProfile(p => ({ ...p, location: e.target.value }))}
                  prefixIcon={<MapPin size={13} />}
                  fullWidth
                />
              </div>
              <Button loading={saving} onClick={handleSave} icon={<Save size={13} />} size="sm">
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "security" && (
        <Card>
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Security Settings</h2>
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              prefixIcon={<Lock size={13} />}
              fullWidth
            />
            <div className="relative">
              <Input
                label="New Password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                prefixIcon={<Lock size={13} />}
                suffixIcon={
                  <button onClick={() => setShowPass(!showPass)} className="pointer-events-auto">
                    {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                }
                fullWidth
              />
            </div>
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              prefixIcon={<Lock size={13} />}
              fullWidth
            />
            <Button size="sm" icon={<Shield size={13} />}>Update Password</Button>

            <div className="pt-4 border-t border-[#F1F5F9]">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Smartphone size={16} className="text-[#64748B]" />
                  <div>
                    <p className="text-sm font-medium text-[#334155]">SMS Authentication</p>
                    <p className="text-xs text-[#94A3B8]">Receive a code via SMS when signing in</p>
                  </div>
                </div>
                <Toggle checked={false} onChange={() => {}} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Notification Preferences</h2>
          <div className="space-y-1">
            {[
              { key: "emergencyUpdates", label: "Emergency Updates", desc: "Status updates for your active emergencies" },
              { key: "campAlerts", label: "Camp Capacity Alerts", desc: "When nearby camps have available space" },
              { key: "smsAlerts", label: "SMS Alerts", desc: "Critical alerts via text message" },
              { key: "emailAlerts", label: "Email Alerts", desc: "Updates sent to your email" },
              { key: "weeklyDigest", label: "Weekly Summary", desc: "Weekly digest of your activity" },
              { key: "marketingEmails", label: "Product Updates", desc: "News and updates from ResQ AI" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-[#F8FAFC] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#334155]">{item.label}</p>
                  <p className="text-xs text-[#94A3B8]">{item.desc}</p>
                </div>
                <Toggle
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={(v) => setNotifications(p => ({ ...p, [item.key]: v }))}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "emergency" && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Emergency Profile</h2>
            <p className="text-xs text-[#64748B] mb-4">This information helps responders prepare before arriving at your location.</p>
            <div className="space-y-3">
              <Select
                label="Blood Type"
                options={[
                  { value: "", label: "Select blood type" },
                  { value: "a+", label: "A+" }, { value: "a-", label: "A-" },
                  { value: "b+", label: "B+" }, { value: "b-", label: "B-" },
                  { value: "o+", label: "O+" }, { value: "o-", label: "O-" },
                  { value: "ab+", label: "AB+" }, { value: "ab-", label: "AB-" },
                ]}
                fullWidth
              />
              <Input label="Medical Conditions (if any)" placeholder="e.g., Diabetes, Hypertension..." fullWidth />
              <Input label="Current Medications" placeholder="List any important medications..." fullWidth />
              <Input label="Emergency Contact Name" placeholder="Parent, sibling, friend..." prefixIcon={<User size={13} />} fullWidth />
              <Input label="Emergency Contact Phone" placeholder="+91 00000 00000" prefixIcon={<Phone size={13} />} fullWidth />
              <Input label="Home Address" placeholder="Full address for responders" prefixIcon={<MapPin size={13} />} fullWidth />
            </div>
            <Button className="mt-4" size="sm" icon={<Save size={13} />}>Save Emergency Profile</Button>
          </Card>

          <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl">
            <AlertTriangle size={14} className="text-[#2563EB] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#1D4ED8]">
              Your emergency profile is only shared with verified relief camp coordinators and responders during active emergencies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
