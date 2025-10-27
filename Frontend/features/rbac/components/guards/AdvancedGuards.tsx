/**
 * Advanced RBAC Guards
 * Enterprise-grade permission guards with conditional logic
 */

"use client";

import React from "react";
import { useRbac } from "../../hooks/useRbac";
import { RoleCode, Permission } from "../../types/rbac.generated";
import { AlertCircle, Lock } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export interface AdvancedPermissionGuardProps {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export interface AdvancedRoleGuardProps {
  roles: RoleCode | RoleCode[];
  operator?: "AND" | "OR";
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export interface FeatureGuardProps {
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Advanced Permission Guard
 */
export function AdvancedPermissionGuard({
  permission,
  fallback = null,
  children,
}: AdvancedPermissionGuardProps) {
  const { hasPermission, isLoading } = useRbac();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!hasPermission([permission])) {
    return (
      fallback || (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>Access denied</span>
        </div>
      )
    );
  }

  return <>{children}</>;
}

/**
 * Advanced Role Guard
 */
export function AdvancedRoleGuard({
  roles,
  operator = "OR",
  fallback = null,
  children,
}: AdvancedRoleGuardProps) {
  const { hasRole, hasAllRoles, isLoading } = useRbac();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const roleArray = Array.isArray(roles) ? roles : [roles];
  const hasAccess =
    operator === "AND" ? hasAllRoles(roleArray) : hasRole(roleArray);

  if (!hasAccess) {
    return (
      fallback || (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          <span>Insufficient permissions</span>
        </div>
      )
    );
  }

  return <>{children}</>;
}

/**
 * Feature Guard (for feature flags)
 */
export function FeatureGuard({
  feature,
  fallback = null,
  children,
}: FeatureGuardProps) {
  // Simple feature flag implementation
  // In real app, this would check feature flags from context/service
  const isFeatureEnabled = feature ? true : true; // Placeholder using feature param

  if (!isFeatureEnabled) {
    return fallback;
  }

  return <>{children}</>;
}
