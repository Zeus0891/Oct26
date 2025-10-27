// ============================================================================
// AUTH STATUS COMPONENT
// ============================================================================
// Shows current authentication status with visual indicators
// ============================================================================

"use client";

import React from "react";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  User,
  LogOut,
} from "lucide-react";
import { useIdentity } from "../../hooks";
import { Button } from "@/components/ui/Button";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AuthStatusProps {
  variant?: "default" | "compact" | "indicator";
  showActions?: boolean;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AuthStatus({
  variant = "default",
  showActions = true,
  className = "",
}: AuthStatusProps) {
  const { user, isAuthenticated, isLoading, logout } = useIdentity();

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderIndicator = () => (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isLoading ? (
        <>
          <Clock className="w-4 h-4 text-orange-500 animate-spin" />
          <span className="text-sm text-muted-foreground">Checking...</span>
        </>
      ) : isAuthenticated ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600">Authenticated</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">Not authenticated</span>
        </>
      )}
    </div>
  );

  const renderCompact = () => (
    <div className={`neomorphic-card p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 neomorphic-button rounded-full flex items-center justify-center">
            {isAuthenticated ? (
              <Shield className="w-4 h-4 text-green-500" />
            ) : (
              <User className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isAuthenticated
                ? user?.displayName || user?.email
                : "Not signed in"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAuthenticated ? "Active session" : "Please sign in"}
            </p>
          </div>
        </div>
        {showActions && isAuthenticated && (
          <Button
            onClick={() => logout()}
            className="neomorphic-button"
            size="sm"
          >
            <LogOut className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );

  const renderDefault = () => (
    <div className={`neomorphic-card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground">Authentication Status</h3>
        {renderIndicator()}
      </div>

      {isAuthenticated ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 neomorphic-button rounded-full flex items-center justify-center">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName || user.email}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {user?.displayName ||
                  `${user?.firstName} ${user?.lastName}` ||
                  "User"}
              </p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="neomorphic-inset p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium text-green-600">Active</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium text-foreground">
                  {user?.emailVerified ? "Verified" : "Unverified"}
                </p>
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex space-x-2">
              <Button
                onClick={() => logout()}
                className="neomorphic-button text-red-600"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            You are not currently signed in
          </p>
          {showActions && (
            <Button className="neomorphic-primary mt-3" size="sm">
              Sign In
            </Button>
          )}
        </div>
      )}
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading && variant !== "indicator") {
    return (
      <div className={`neomorphic-card p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <Clock className="w-6 h-6 text-primary animate-spin mr-3" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  switch (variant) {
    case "indicator":
      return renderIndicator();
    case "compact":
      return renderCompact();
    default:
      return renderDefault();
  }
}

export default AuthStatus;
