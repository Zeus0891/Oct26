"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  ProfileUpdateForm,
  PasswordChangeForm,
} from "@/features/identity/components/forms";
import {
  User,
  ArrowLeft,
  CheckCircle2,
  Settings,
  Shield,
  Key,
  Smartphone,
  Bell,
  Eye,
  EyeOff,
} from "lucide-react";

type ActiveTab = "profile" | "password" | "security" | "notifications";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleProfileSuccess = () => {
    setShowSuccessMessage(true);

    toast.success("Profile updated successfully! ✨", {
      style: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        borderRadius: "12px",
        padding: "16px",
      },
      duration: 4000,
    });

    // Hide success message after delay
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  const handlePasswordSuccess = () => {
    toast.success("Password updated successfully! 🔒", {
      style: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        borderRadius: "12px",
        padding: "16px",
      },
      duration: 4000,
    });

    // Optionally redirect to login to re-authenticate
    setTimeout(() => {
      if (
        confirm(
          "Password changed successfully. Would you like to sign in again with your new password?"
        )
      ) {
        router.push("/login");
      }
    }, 2000);
  };

  const handleCancel = () => {
    router.back();
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Key },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleCancel}
          className="inline-flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-105 border border-white/40 dark:border-slate-700/40"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="inline-flex items-center px-4 py-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-full border border-blue-200/30 dark:border-blue-800/30">
          <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Account Settings
          </span>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50/50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200/30 dark:border-green-800/30 animate-fade-in">
          <div className="flex items-start space-x-4">
            <CheckCircle2 className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-1">
                Changes Saved Successfully
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Your profile information has been updated and is now active
                across all services.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-2 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] transform scale-105"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-700/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                Profile Information
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your personal information and preferences
              </p>
            </div>

            <ProfileUpdateForm
              onSuccess={handleProfileSuccess}
              onCancel={handleCancel}
              className="w-full"
            />
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                Change Password
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Update your account password for enhanced security
              </p>
            </div>

            <PasswordChangeForm
              onSuccess={handlePasswordSuccess}
              onCancel={handleCancel}
              className="w-full max-w-md mx-auto"
            />
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                Security Settings
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your account security and authentication methods
              </p>
            </div>

            <div className="grid gap-6">
              {/* MFA Section */}
              <div className="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Enabled
                    </span>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Link
                    href="/mfa-setup"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Reconfigure
                  </Link>
                  <button className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors">
                    Disable
                  </button>
                </div>
              </div>

              {/* Trusted Devices */}
              <div className="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                        Trusted Devices
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Manage devices that can skip MFA verification
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    3 devices
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      name: "Chrome on macOS",
                      location: "New York, US",
                      current: true,
                    },
                    {
                      name: "Safari on iPhone",
                      location: "New York, US",
                      current: false,
                    },
                    {
                      name: "Firefox on Windows",
                      location: "Los Angeles, US",
                      current: false,
                    },
                  ].map((device, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl"
                    >
                      <div>
                        <div className="font-medium text-sm text-slate-700 dark:text-slate-300">
                          {device.name}{" "}
                          {device.current && (
                            <span className="text-green-500">(Current)</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {device.location}
                        </div>
                      </div>
                      <button className="text-xs text-red-500 hover:text-red-600 font-medium">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <Link
                  href="/device-setup"
                  className="inline-block mt-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  Add Device
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                Notification Preferences
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Control how and when you receive notifications
              </p>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40">
              <div className="space-y-6">
                {[
                  {
                    title: "Security Alerts",
                    description:
                      "Get notified of suspicious login attempts and security events",
                    enabled: true,
                  },
                  {
                    title: "Account Updates",
                    description:
                      "Receive notifications when your account information changes",
                    enabled: true,
                  },
                  {
                    title: "Product Updates",
                    description:
                      "Stay informed about new features and improvements",
                    enabled: false,
                  },
                  {
                    title: "Marketing Communications",
                    description: "Receive newsletters and promotional content",
                    enabled: false,
                  },
                ].map((notification, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl"
                  >
                    <div>
                      <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {notification.description}
                      </p>
                    </div>
                    <button className="relative">
                      {notification.enabled ? (
                        <Eye className="w-5 h-5 text-green-500" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-white/40 dark:bg-slate-800/40 rounded-xl shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#0f172a,-2px_-2px_4px_#334155] border border-white/30 dark:border-slate-700/30">
          <Shield className="w-3 h-3 text-blue-500 mr-2" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            All changes are saved automatically and encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
