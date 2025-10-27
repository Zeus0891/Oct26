// ============================================================================
// MEMBER SETTINGS MODAL
// ============================================================================
// Comprehensive member settings management modal
// ============================================================================

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  X,
  Settings,
  Palette,
  Bell,
  Shield,
  RotateCcw,
  Save,
  Globe,
  Monitor,
} from "lucide-react";
import { useMemberSettings } from "../../hooks/useMemberSettings";
import { MemberSettingsUpdateDTO } from "../../types/member-settings.types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MemberSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId?: string; // If provided, admin is editing another member's settings
  title?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MemberSettingsModal({
  isOpen,
  onClose,
  memberId,
  title = "Member Settings",
}: MemberSettingsModalProps) {
  const {
    settings,
    isLoading,
    isUpdating,
    error,
    updateSettings,
    resetSettings,
  } = useMemberSettings(memberId);

  const [activeTab, setActiveTab] = useState<
    "general" | "notifications" | "privacy" | "advanced"
  >("general");
  const [localSettings, setLocalSettings] = useState<MemberSettingsUpdateDTO>(
    {}
  );
  const [hasChanges, setHasChanges] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSettingChange = (
    key: keyof MemberSettingsUpdateDTO,
    value: string | boolean | string[]
  ) => {
    setLocalSettings((prev: MemberSettingsUpdateDTO) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      setLocalSettings({});
      setHasChanges(false);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleReset = async () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      try {
        await resetSettings();
        setLocalSettings({});
        setHasChanges(false);
      } catch {
        // Error is handled by the hook
      }
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (
        confirm("You have unsaved changes. Are you sure you want to close?")
      ) {
        setLocalSettings({});
        setHasChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderTabButton = (
    tabId: typeof activeTab,
    label: string,
    icon: React.ReactNode
  ) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
        ${
          activeTab === tabId
            ? "neomorphic-inset bg-primary/10 text-primary"
            : "neomorphic-button hover:scale-105"
        }
      `}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div className="neomorphic-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Palette className="w-5 h-5 mr-2 text-primary" />
          Theme & Appearance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Theme
            </label>
            <select
              value={localSettings.theme || settings?.theme || "SYSTEM"}
              onChange={(e) => handleSettingChange("theme", e.target.value)}
              className="neomorphic-input w-full"
            >
              <option value="SYSTEM">System</option>
              <option value="LIGHT">Light</option>
              <option value="DARK">Dark</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Font Size
            </label>
            <select
              value={localSettings.fontSize || settings?.fontSize || "medium"}
              onChange={(e) => handleSettingChange("fontSize", e.target.value)}
              className="neomorphic-input w-full"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Density
            </label>
            <select
              value={
                localSettings.density || settings?.density || "comfortable"
              }
              onChange={(e) => handleSettingChange("density", e.target.value)}
              className="neomorphic-input w-full"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Primary Color
            </label>
            <Input
              type="color"
              value={
                localSettings.primaryColor ||
                settings?.primaryColor ||
                "#3b82f6"
              }
              onChange={(e) =>
                handleSettingChange("primaryColor", e.target.value)
              }
              className="neomorphic-input w-full h-10"
            />
          </div>
        </div>
      </div>

      {/* Localization */}
      <div className="neomorphic-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-primary" />
          Localization
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Language
            </label>
            <select
              value={localSettings.language || settings?.language || "en"}
              onChange={(e) => handleSettingChange("language", e.target.value)}
              className="neomorphic-input w-full"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Timezone
            </label>
            <select
              value={localSettings.timezone || settings?.timezone || "UTC"}
              onChange={(e) => handleSettingChange("timezone", e.target.value)}
              className="neomorphic-input w-full"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date Format
            </label>
            <select
              value={
                localSettings.dateFormat || settings?.dateFormat || "MM/dd/yyyy"
              }
              onChange={(e) =>
                handleSettingChange("dateFormat", e.target.value)
              }
              className="neomorphic-input w-full"
            >
              <option value="MM/dd/yyyy">MM/dd/yyyy</option>
              <option value="dd/MM/yyyy">dd/MM/yyyy</option>
              <option value="yyyy-MM-dd">yyyy-MM-dd</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Time Format
            </label>
            <select
              value={localSettings.timeFormat || settings?.timeFormat || "12h"}
              onChange={(e) =>
                handleSettingChange("timeFormat", e.target.value)
              }
              className="neomorphic-input w-full"
            >
              <option value="12h">12 Hour</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="neomorphic-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-primary" />
          Notification Channels
        </h3>

        <div className="space-y-4">
          {[
            {
              key: "emailNotifications",
              label: "Email Notifications",
              desc: "Receive notifications via email",
            },
            {
              key: "pushNotifications",
              label: "Push Notifications",
              desc: "Browser and mobile push notifications",
            },
            {
              key: "smsNotifications",
              label: "SMS Notifications",
              desc: "Text message notifications",
            },
            {
              key: "inAppNotifications",
              label: "In-App Notifications",
              desc: "Notifications within the application",
            },
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 neomorphic-inset rounded-lg"
            >
              <div>
                <div className="font-medium text-foreground">{label}</div>
                <div className="text-sm text-muted-foreground">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    (localSettings[
                      key as keyof MemberSettingsUpdateDTO
                    ] as boolean) ??
                    (settings?.[key as keyof typeof settings] as boolean) ??
                    false
                  }
                  onChange={(e) =>
                    handleSettingChange(
                      key as keyof MemberSettingsUpdateDTO,
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div
                  className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                              peer-checked:bg-primary"
                ></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="neomorphic-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Notification Types
        </h3>

        <div className="space-y-4">
          {[
            {
              key: "notifyOnAssignment",
              label: "Task Assignments",
              desc: "When you are assigned to a task",
            },
            {
              key: "notifyOnMention",
              label: "Mentions",
              desc: "When someone mentions you",
            },
            {
              key: "notifyOnDeadline",
              label: "Deadlines",
              desc: "Upcoming deadlines and due dates",
            },
            {
              key: "notifyOnApproval",
              label: "Approvals",
              desc: "Approval requests and decisions",
            },
            {
              key: "notifyOnComment",
              label: "Comments",
              desc: "New comments on your items",
            },
            {
              key: "notifyOnStatusChange",
              label: "Status Changes",
              desc: "When item status changes",
            },
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 neomorphic-inset rounded-lg"
            >
              <div>
                <div className="font-medium text-foreground">{label}</div>
                <div className="text-sm text-muted-foreground">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    (localSettings[
                      key as keyof MemberSettingsUpdateDTO
                    ] as boolean) ??
                    (settings?.[key as keyof typeof settings] as boolean) ??
                    false
                  }
                  onChange={(e) =>
                    handleSettingChange(
                      key as keyof MemberSettingsUpdateDTO,
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div
                  className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                              peer-checked:bg-primary"
                ></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-[80vh] bg-background neomorphic-card m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 neomorphic-button flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">
                Customize your preferences and settings
              </p>
            </div>
          </div>

          <Button
            onClick={handleCancel}
            className="neomorphic-button w-10 h-10 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 p-6 border-r border-border/50 space-y-2">
            {renderTabButton(
              "general",
              "General",
              <Monitor className="w-4 h-4" />
            )}
            {renderTabButton(
              "notifications",
              "Notifications",
              <Bell className="w-4 h-4" />
            )}
            {renderTabButton(
              "privacy",
              "Privacy",
              <Shield className="w-4 h-4" />
            )}
            {renderTabButton(
              "advanced",
              "Advanced",
              <Settings className="w-4 h-4" />
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading settings...</div>
              </div>
            ) : (
              <>
                {activeTab === "general" && renderGeneralTab()}
                {activeTab === "notifications" && renderNotificationsTab()}
                {activeTab === "privacy" && (
                  <div className="text-center text-muted-foreground">
                    Privacy settings coming soon...
                  </div>
                )}
                {activeTab === "advanced" && (
                  <div className="text-center text-muted-foreground">
                    Advanced settings coming soon...
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border/50">
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleReset}
              disabled={isUpdating}
              className="neomorphic-button text-red-600"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>

            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={handleCancel}
              disabled={isUpdating}
              className="neomorphic-button"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={!hasChanges || isUpdating}
              className="neomorphic-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
