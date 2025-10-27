// ============================================================================
// USER AVATAR COMPONENT
// ============================================================================
// Avatar del usuario con diferentes tamaños y estados
// ============================================================================

"use client";

import React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { useIdentity } from "../../hooks";

// ============================================================================
// TYPES
// ============================================================================

interface UserAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  showStatus?: boolean;
  showName?: boolean;
  fallbackText?: string;
  className?: string;
  onClick?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function UserAvatar({
  size = "md",
  showStatus = false,
  showName = false,
  fallbackText,
  className = "",
  onClick,
}: UserAvatarProps) {
  const { user, isAuthenticated } = useIdentity();

  // ============================================================================
  // SIZE CONFIGURATIONS
  // ============================================================================

  const sizeConfig = {
    xs: {
      avatar: "w-6 h-6",
      text: "text-xs",
      name: "text-xs",
      status: "w-2 h-2",
    },
    sm: {
      avatar: "w-8 h-8",
      text: "text-sm",
      name: "text-sm",
      status: "w-2 h-2",
    },
    md: {
      avatar: "w-10 h-10",
      text: "text-base",
      name: "text-sm",
      status: "w-3 h-3",
    },
    lg: {
      avatar: "w-12 h-12",
      text: "text-lg",
      name: "text-base",
      status: "w-3 h-3",
    },
    xl: {
      avatar: "w-16 h-16",
      text: "text-xl",
      name: "text-lg",
      status: "w-4 h-4",
    },
    "2xl": {
      avatar: "w-20 h-20",
      text: "text-2xl",
      name: "text-xl",
      status: "w-4 h-4",
    },
  };

  const config = sizeConfig[size];

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getInitials = () => {
    if (fallbackText) return fallbackText;
    if (!user?.email) return "U";

    // Extract initials from email or name
    const name = user.displayName || user.email;
    const parts = name.split(/[\s@.]+/);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  const getDisplayName = () => {
    if (!user) return "Guest";
    return user.displayName || user.email || "User";
  };

  const renderAvatar = () => (
    <div
      className={`
        relative neomorphic-button ${config.avatar} 
        flex items-center justify-center overflow-hidden
        ${onClick ? "cursor-pointer hover:scale-105" : ""}
        transition-all duration-200
      `}
      onClick={onClick}
    >
      {user?.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt={getDisplayName()}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
          {getInitials() ? (
            <span className={`font-medium text-primary ${config.text}`}>
              {getInitials()}
            </span>
          ) : (
            <User
              className={`text-primary ${config.avatar.includes("w-6") ? "w-3 h-3" : "w-4 h-4"}`}
            />
          )}
        </div>
      )}

      {/* Status indicator */}
      {showStatus && (
        <div className="absolute -bottom-0 -right-0">
          <div
            className={`
              ${config.status} rounded-full border-2 border-background
              ${isAuthenticated ? "bg-green-500" : "bg-gray-400"}
            `}
          />
        </div>
      )}
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!showName) {
    return <div className={className}>{renderAvatar()}</div>;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {renderAvatar()}

      <div className="min-w-0 flex-1">
        <div className={`font-medium text-foreground truncate ${config.name}`}>
          {getDisplayName()}
        </div>

        {user?.email && user.displayName && (
          <div className="text-xs text-muted-foreground truncate">
            {user.email}
          </div>
        )}

        {showStatus && (
          <div className="flex items-center space-x-1 mt-1">
            <div
              className={`
                w-2 h-2 rounded-full
                ${isAuthenticated ? "bg-green-500" : "bg-gray-400"}
              `}
            />
            <span className="text-xs text-muted-foreground">
              {isAuthenticated ? "Online" : "Offline"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
