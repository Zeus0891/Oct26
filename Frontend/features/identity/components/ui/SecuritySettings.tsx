// ============================================================================
// SECURITY SETTINGS COMPONENT
// ============================================================================
// User security configuration panel with MFA, sessions, and device management
// ============================================================================

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Shield,
  Key,
  Smartphone,
  Clock,
  AlertCircle,
  CheckCircle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useIdentity } from "../../hooks";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SecuritySettingsProps {
  variant?: "default" | "compact";
  showSections?: Array<"mfa" | "sessions" | "devices" | "password">;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SecuritySettings({
  variant = "default",
  showSections = ["mfa", "sessions", "devices", "password"],
  className = "",
}: SecuritySettingsProps) {
  const { user } = useIdentity();
  // Simplified state for demo purposes
  const [mfaEnabled] = useState(false);
  const [activeSessions] = useState(1);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  if (!user) {
    return (
      <div className={`neomorphic-card p-6 ${className}`}>
        <div className="flex items-center justify-center text-muted-foreground">
          <Shield className="w-8 h-8 mr-3" />
          <span>Please log in to access security settings</span>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderMfaSection = () => {
    if (!showSections.includes("mfa")) return null;

    return (
      <div className="neomorphic-inset p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Smartphone className="w-5 h-5 mr-3 text-primary" />
            <div>
              <h4 className="font-medium text-foreground">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {mfaEnabled ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
            )}
            <span
              className={`text-sm font-medium ${
                mfaEnabled ? "text-green-600" : "text-orange-600"
              }`}
            >
              {mfaEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          {mfaEnabled ? (
            <Button
              onClick={() => console.log("Disable MFA")}
              className="neomorphic-button text-red-600"
              size="sm"
            >
              <Lock className="w-4 h-4 mr-2" />
              Disable MFA
            </Button>
          ) : (
            <Button
              onClick={() => console.log("Enable MFA")}
              className="neomorphic-primary"
              size="sm"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Enable MFA
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderSessionsSection = () => {
    if (!showSections.includes("sessions")) return null;

    return (
      <div className="neomorphic-inset p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-3 text-primary" />
            <div>
              <h4 className="font-medium text-foreground">Active Sessions</h4>
              <p className="text-sm text-muted-foreground">
                Manage your active login sessions
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-foreground">
            {activeSessions} active
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
            <div>
              <p className="text-sm font-medium">
                Current Session • macOS • Chrome
              </p>
              <p className="text-xs text-muted-foreground">
                Last active: {new Date().toLocaleDateString()}
              </p>
            </div>
            <Button
              className="neomorphic-button text-xs"
              size="sm"
              onClick={() => console.log("Revoke session")}
            >
              Current
            </Button>
          </div>
        </div>

        <Button
          className="neomorphic-button w-full mt-3"
          size="sm"
          onClick={() => console.log("View all sessions")}
        >
          View All Sessions
        </Button>
      </div>
    );
  };

  const renderPasswordSection = () => {
    if (!showSections.includes("password")) return null;

    return (
      <div className="neomorphic-inset p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Key className="w-5 h-5 mr-3 text-primary" />
            <div>
              <h4 className="font-medium text-foreground">Password</h4>
              <p className="text-sm text-muted-foreground">
                Keep your password secure and up to date
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="neomorphic-button"
            size="sm"
          >
            {showPasswordSection ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        </div>

        {showPasswordSection && (
          <div className="space-y-3">
            <Button className="neomorphic-primary w-full">
              Change Password
            </Button>
            <div className="text-xs text-muted-foreground">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
                <li>Contains at least one special character</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCompact = () => (
    <div className={`neomorphic-card p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="w-6 h-6 mr-3 text-primary" />
          <div>
            <h3 className="font-medium text-foreground">Security</h3>
            <p className="text-xs text-muted-foreground">
              {mfaEnabled ? "MFA Enabled" : "MFA Disabled"} • {activeSessions}{" "}
              sessions
            </p>
          </div>
        </div>
        <Button className="neomorphic-button" size="sm">
          Settings
        </Button>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (variant === "compact") {
    return renderCompact();
  }

  return (
    <div className={`neomorphic-card p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <Shield className="w-6 h-6 mr-3 text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Security Settings
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage your account security and privacy settings
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {renderMfaSection()}
        {renderSessionsSection()}
        {renderPasswordSection()}
      </div>
    </div>
  );
}

export default SecuritySettings;
