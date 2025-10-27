/**
 * RBACProvider Component
 * Context provider for RBAC state management
 * Bridges JWT tokens with guards and provides role/permission context
 */

"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useRbac } from "../../hooks/useRbac";
import {
  RoleCode,
  Permission,
  RbacContext,
  RbacCheck,
  MemberProfile,
} from "../../types/rbac.generated";

// =============================================================================
// CONTEXT TYPES
// =============================================================================

interface RBACContextValue {
  // State from useRbac hook
  roles: RoleCode[];
  permissions: Permission[];
  memberProfile: MemberProfile | null;
  tenantId: string | null;
  isLoading: boolean;
  error: string | null;
  context: RbacContext | null;

  // Check functions
  hasRole: (role: RoleCode | RoleCode[]) => boolean;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasAnyRole: (roles: RoleCode[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllRoles: (roles: RoleCode[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;

  // Actions
  refreshRbacData: () => Promise<void>;
  clearError: () => void;

  // Utilities
  getRoleNames: () => string[];
  getEffectivePermissions: () => Permission[];
  isAdmin: () => boolean;
  isProjectManager: () => boolean;
  canManageUsers: () => boolean;
  canManageProjects: () => boolean;
}

interface RBACProviderProps {
  children: ReactNode;
  onRoleChange?: (roles: RoleCode[]) => void;
  onPermissionChange?: (permissions: Permission[]) => void;
  enableRefresh?: boolean;
  refreshInterval?: number; // Minutes
}

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const RBACContext = createContext<RBACContextValue | null>(null);

// =============================================================================
// RBAC PROVIDER COMPONENT
// =============================================================================

export const RBACProvider: React.FC<RBACProviderProps> = ({
  children,
  onRoleChange,
  onPermissionChange,
  enableRefresh = false,
  refreshInterval = 30,
}) => {
  const rbac = useRbac();

  const {
    roles,
    permissions,
    memberProfile,
    tenantId,
    isLoading,
    error,
    context,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    hasAllRoles,
    hasAllPermissions,
    refreshRbacData,
    clearError,
    getRoleNames,
    getEffectivePermissions,
    isAdmin,
    isProjectManager,
    canManageUsers,
    canManageProjects,
  } = rbac;

  // =============================================================================
  // ROLE CHANGE EFFECT
  // =============================================================================

  React.useEffect(() => {
    if (onRoleChange) {
      onRoleChange(roles);
    }
  }, [roles, onRoleChange]);

  // =============================================================================
  // PERMISSION CHANGE EFFECT
  // =============================================================================

  React.useEffect(() => {
    if (onPermissionChange) {
      onPermissionChange(permissions);
    }
  }, [permissions, onPermissionChange]);

  // =============================================================================
  // AUTO-REFRESH EFFECT
  // =============================================================================

  React.useEffect(() => {
    if (!enableRefresh || refreshInterval <= 0) return;

    const intervalMs = refreshInterval * 60 * 1000; // Convert to milliseconds

    const intervalId = setInterval(() => {
      refreshRbacData().catch((error) => {
        console.error("Auto-refresh RBAC data failed:", error);
      });
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [enableRefresh, refreshInterval, refreshRbacData]);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const contextValue: RBACContextValue = {
    // State
    roles,
    permissions,
    memberProfile,
    tenantId,
    isLoading,
    error,
    context,

    // Check functions
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    hasAllRoles,
    hasAllPermissions,

    // Actions
    refreshRbacData,
    clearError,

    // Utilities
    getRoleNames,
    getEffectivePermissions,
    isAdmin,
    isProjectManager,
    canManageUsers,
    canManageProjects,
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <RBACContext.Provider value={contextValue}>{children}</RBACContext.Provider>
  );
};

// =============================================================================
// CONTEXT HOOK
// =============================================================================

export const useRBACContext = (): RBACContextValue => {
  const context = useContext(RBACContext);

  if (!context) {
    throw new Error("useRBACContext must be used within an RBACProvider");
  }

  return context;
};

// =============================================================================
// CONVENIENCE SELECTORS
// =============================================================================

export const useCurrentRoles = (): RoleCode[] => {
  const { roles } = useRBACContext();
  return roles;
};

export const useCurrentPermissions = (): Permission[] => {
  const { permissions } = useRBACContext();
  return permissions;
};

export const useRbacStatus = (): {
  isLoading: boolean;
  error: string | null;
  hasRbacData: boolean;
} => {
  const { isLoading, error, roles, permissions } = useRBACContext();
  return {
    isLoading,
    error,
    hasRbacData: roles.length > 0 || permissions.length > 0,
  };
};

export const useMemberProfile = (): MemberProfile | null => {
  const { memberProfile } = useRBACContext();
  return memberProfile;
};

// =============================================================================
// RBAC CHECK HOOK (Updated to use context)
// =============================================================================

export const useRBACCheck = (): RbacCheck => {
  const {
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    hasAllRoles,
    hasAllPermissions,
  } = useRBACContext();

  return {
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    hasAllRoles,
    hasAllPermissions,
  };
};

// =============================================================================
// HIGHER-ORDER COMPONENT
// =============================================================================

export const withRBACProvider = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  providerProps?: Omit<RBACProviderProps, "children">
) => {
  const WithRBACProviderComponent: React.FC<P> = (props) => (
    <RBACProvider {...providerProps}>
      <WrappedComponent {...props} />
    </RBACProvider>
  );

  WithRBACProviderComponent.displayName = `withRBACProvider(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithRBACProviderComponent;
};

// =============================================================================
// RBAC DEBUG COMPONENT (Development only)
// =============================================================================

export const RBACDebugPanel: React.FC<{ show?: boolean }> = ({
  show = false,
}) => {
  const { roles, permissions, tenantId, memberProfile, isLoading, error } =
    useRBACContext();

  if (!show || process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs">
      <div className="font-bold mb-2">RBAC Debug Panel</div>

      <div className="mb-2">
        <div className="font-semibold">Status:</div>
        <div>Loading: {isLoading ? "Yes" : "No"}</div>
        <div>Error: {error || "None"}</div>
        <div>Tenant: {tenantId || "None"}</div>
      </div>

      <div className="mb-2">
        <div className="font-semibold">Roles ({roles.length}):</div>
        <div>{roles.join(", ") || "None"}</div>
      </div>

      <div className="mb-2">
        <div className="font-semibold">Permissions ({permissions.length}):</div>
        <div className="max-h-20 overflow-y-auto">
          {permissions.length > 0
            ? permissions.slice(0, 10).join(", ") +
              (permissions.length > 10 ? "..." : "")
            : "None"}
        </div>
      </div>

      {memberProfile && (
        <div>
          <div className="font-semibold">Member:</div>
          <div>ID: {memberProfile.id}</div>
          <div>Active: {memberProfile.isActive ? "Yes" : "No"}</div>
        </div>
      )}
    </div>
  );
};

export default RBACProvider;
