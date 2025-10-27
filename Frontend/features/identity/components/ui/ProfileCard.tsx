// ============================================================================
// PROFILE CARD COMPONENT
// ============================================================================
// User profile display card with avatar, info, and quick actions
// ============================================================================

"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  User,
  Mail,
  Shield,
  Settings,
  Edit,
  Calendar,
  Phone,
} from "lucide-react";
import Image from "next/image";
import { useIdentity } from "../../hooks";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ProfileCardProps {
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
  onEditClick?: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProfileCard({
  variant = "default",
  showActions = true,
  onEditClick,
  onSettingsClick,
  className = "",
}: ProfileCardProps) {
  const { user, isAuthenticated } = useIdentity();

  if (!isAuthenticated || !user) {
    return (
      <div className={`neomorphic-card p-6 ${className}`}>
        <div className="flex items-center justify-center text-muted-foreground">
          <User className="w-8 h-8 mr-3" />
          <span>Not authenticated</span>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderAvatar = () => (
    <div className="relative">
      <div className="w-16 h-16 neomorphic-button rounded-full flex items-center justify-center">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.displayName || user.email}
            width={56}
            height={56}
            className="rounded-full object-cover"
          />
        ) : (
          <User className="w-8 h-8 text-primary" />
        )}
      </div>
      {user.emailVerified && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <Shield className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );

  const renderCompact = () => (
    <div
      className={`neomorphic-card p-4 flex items-center space-x-4 ${className}`}
    >
      <div className="w-12 h-12 neomorphic-button rounded-full flex items-center justify-center">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.displayName || user.email}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <User className="w-6 h-6 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground truncate">
          {user.displayName || user.firstName + " " + user.lastName || "User"}
        </h3>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
      {showActions && (
        <Button
          onClick={onSettingsClick}
          className="neomorphic-button w-8 h-8 p-0"
          size="sm"
        >
          <Settings className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  const renderDefault = () => (
    <div className={`neomorphic-card p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        {renderAvatar()}

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground">
            {user.displayName || `${user.firstName} ${user.lastName}` || "User"}
          </h3>

          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Mail className="w-4 h-4 mr-2" />
            {user.email}
          </div>

          {user.timezone && (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Phone className="w-4 h-4 mr-2" />
              {user.timezone}
            </div>
          )}

          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Calendar className="w-4 h-4 mr-2" />
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex space-x-3 mt-6">
          <Button
            onClick={onEditClick}
            className="neomorphic-primary flex-1"
            size="sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button
            onClick={onSettingsClick}
            className="neomorphic-button"
            size="sm"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderDetailed = () => (
    <div className={`neomorphic-card p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="w-20 h-20 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-4">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.displayName || user.email}
              width={72}
              height={72}
              className="rounded-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-primary" />
          )}
        </div>

        <h2 className="text-xl font-bold text-foreground">
          {user.displayName || `${user.firstName} ${user.lastName}` || "User"}
        </h2>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <div className="space-y-4">
        <div className="neomorphic-inset p-4 rounded-lg">
          <h4 className="font-medium text-foreground mb-3">
            Contact Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-3 text-primary" />
              <span>{user.email}</span>
            </div>
            {user.timezone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-primary" />
                <span>{user.timezone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="neomorphic-inset p-4 rounded-lg">
          <h4 className="font-medium text-foreground mb-3">Account Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span
                className={
                  user.emailVerified ? "text-green-600" : "text-orange-600"
                }
              >
                {user.emailVerified ? "Verified" : "Unverified"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Joined:</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Login:</span>
              <span>
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleDateString()
                  : "Never"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex space-x-3 mt-6">
          <Button onClick={onEditClick} className="neomorphic-primary flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button onClick={onSettingsClick} className="neomorphic-button">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  switch (variant) {
    case "compact":
      return renderCompact();
    case "detailed":
      return renderDetailed();
    default:
      return renderDefault();
  }
}

export default ProfileCard;
