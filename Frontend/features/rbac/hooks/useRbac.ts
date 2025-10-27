/**
 * useRbac Hook
 * Core RBAC hook for role and permission management
 * Integrates with Identity module and backend RBAC system
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RoleCode,
  Permission,
  RbacContext,
  RbacCheck,
  MemberProfile,
} from "../types/rbac.generated";
import { useIdentity } from "../../identity/hooks/useIdentity";
import { useSession } from "../../identity/hooks/useSession";

// =============================================================================
// TYPES
// =============================================================================

interface UseRbacReturn extends RbacCheck {
  // State
  roles: RoleCode[];
  permissions: Permission[];
  memberProfile: MemberProfile | null;
  tenantId: string | null;
  isLoading: boolean;
  error: string | null;

  // Context info
  context: RbacContext | null;

  // Actions
  refreshRbacData: () => Promise<void>;
  clearError: () => void;

  // Utility functions
  getRoleNames: () => string[];
  getEffectivePermissions: () => Permission[];
  isAdmin: () => boolean;
  isProjectManager: () => boolean;
  canManageUsers: () => boolean;
  canManageProjects: () => boolean;
}

// =============================================================================
// RBAC DATA EXTRACTION
// =============================================================================

/**
 * Extract RBAC data from JWT token payload
 */
const extractRbacFromToken = (
  tokenPayload: Record<string, unknown>
): {
  roles: RoleCode[];
  permissions: Permission[];
  tenantId: string | null;
  memberId: string | null;
} => {
  const roles = Array.isArray(tokenPayload?.roles)
    ? (tokenPayload.roles as RoleCode[])
    : [];
  const permissions = Array.isArray(tokenPayload?.permissions)
    ? (tokenPayload.permissions as Permission[])
    : [];
  const tenantId =
    typeof tokenPayload?.tenantId === "string" ? tokenPayload.tenantId : null;
  const memberId =
    typeof tokenPayload?.memberId === "string" ? tokenPayload.memberId : null;

  return { roles, permissions, tenantId, memberId };
};

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export const useRbac = (): UseRbacReturn => {
  const { user, tokenPayload, isAuthenticated } = useIdentity();
  const { session } = useSession();

  // Local state
  const [roles, setRoles] = useState<RoleCode[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =============================================================================
  // DERIVED STATE
  // =============================================================================

  const tenantId = session?.tenantId || null;
  const userId = user?.id || null;

  const context: RbacContext | null =
    userId && tenantId
      ? {
          roles,
          permissions,
          tenantId,
          userId,
        }
      : null;

  // =============================================================================
  // RBAC CHECK FUNCTIONS
  // =============================================================================

  const hasRole = useCallback(
    (role: RoleCode | RoleCode[]): boolean => {
      if (!isAuthenticated || roles.length === 0) return false;

      const targetRoles = Array.isArray(role) ? role : [role];
      return targetRoles.some((r) => roles.includes(r));
    },
    [roles, isAuthenticated]
  );

  const hasPermission = useCallback(
    (permission: Permission | Permission[]): boolean => {
      if (!isAuthenticated || permissions.length === 0) return false;

      const targetPermissions = Array.isArray(permission)
        ? permission
        : [permission];
      return targetPermissions.some((p) => permissions.includes(p));
    },
    [permissions, isAuthenticated]
  );

  const hasAnyRole = useCallback(
    (targetRoles: RoleCode[]): boolean => {
      if (!isAuthenticated || roles.length === 0) return false;
      return targetRoles.some((role) => roles.includes(role));
    },
    [roles, isAuthenticated]
  );

  const hasAnyPermission = useCallback(
    (targetPermissions: Permission[]): boolean => {
      if (!isAuthenticated || permissions.length === 0) return false;
      return targetPermissions.some((permission) =>
        permissions.includes(permission)
      );
    },
    [permissions, isAuthenticated]
  );

  const hasAllRoles = useCallback(
    (targetRoles: RoleCode[]): boolean => {
      if (!isAuthenticated || roles.length === 0) return false;
      return targetRoles.every((role) => roles.includes(role));
    },
    [roles, isAuthenticated]
  );

  const hasAllPermissions = useCallback(
    (targetPermissions: Permission[]): boolean => {
      if (!isAuthenticated || permissions.length === 0) return false;
      return targetPermissions.every((permission) =>
        permissions.includes(permission)
      );
    },
    [permissions, isAuthenticated]
  );

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const getRoleNames = useCallback((): string[] => {
    // This would map to human-readable names from ROLES constant
    // For now, return the role codes
    return roles;
  }, [roles]);

  const getEffectivePermissions = useCallback((): Permission[] => {
    // Return unique permissions (in case of duplicates)
    return Array.from(new Set(permissions));
  }, [permissions]);

  const isAdmin = useCallback((): boolean => {
    return hasRole("ADMIN");
  }, [hasRole]);

  const isProjectManager = useCallback((): boolean => {
    return hasRole("PROJECT_MANAGER");
  }, [hasRole]);

  const canManageUsers = useCallback((): boolean => {
    return hasAnyPermission([
      "User.create",
      "User.update",
      "Member.create",
    ] as Permission[]);
  }, [hasAnyPermission]);

  const canManageProjects = useCallback((): boolean => {
    return hasAnyPermission([
      "Project.create",
      "Project.update",
      "Project.delete",
    ] as Permission[]);
  }, [hasAnyPermission]);

  // =============================================================================
  // REFRESH RBAC DATA
  // =============================================================================

  const refreshRbacData = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !tokenPayload) {
      setRoles([]);
      setPermissions([]);
      setMemberProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Extract from JWT token
      const {
        roles: tokenRoles,
        permissions: tokenPermissions,
        memberId,
      } = extractRbacFromToken(
        tokenPayload as unknown as Record<string, unknown>
      );

      setRoles(tokenRoles);
      setPermissions(tokenPermissions);

      // Create member profile from available data
      if (userId && tenantId && memberId) {
        const profile: MemberProfile = {
          id: memberId,
          userId,
          tenantId,
          roles: tokenRoles,
          permissions: tokenPermissions,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setMemberProfile(profile);
      }

      // TODO: Optionally call backend to get fresh RBAC data
      // This would be useful for real-time permission updates
      // await rbacService.getCurrentUserRbacData();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh RBAC data";
      setError(errorMessage);
      console.error("RBAC data refresh failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, tokenPayload, userId, tenantId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // =============================================================================
  // INITIALIZATION EFFECT
  // =============================================================================

  useEffect(() => {
    if (isAuthenticated && tokenPayload) {
      refreshRbacData();
    } else {
      // Clear RBAC data when not authenticated
      setRoles([]);
      setPermissions([]);
      setMemberProfile(null);
      setError(null);
    }
  }, [isAuthenticated, tokenPayload, refreshRbacData]);

  // =============================================================================
  // TENANT CHANGE EFFECT
  // =============================================================================

  useEffect(() => {
    // When tenant changes, refresh RBAC data
    if (tenantId && isAuthenticated) {
      refreshRbacData();
    }
  }, [tenantId, refreshRbacData, isAuthenticated]);

  // =============================================================================
  // RETURN INTERFACE
  // =============================================================================

  return {
    // State
    roles,
    permissions,
    memberProfile,
    tenantId,
    isLoading,
    error,
    context,

    // RbacCheck interface
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
};

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Hook for checking specific roles
 */
export const useRoleCheck = () => {
  const { hasRole, hasAnyRole, hasAllRoles, roles } = useRbac();

  return {
    roles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin: hasRole("ADMIN"),
    isProjectManager: hasRole("PROJECT_MANAGER"),
    isWorker: hasRole("WORKER"),
    isViewer: hasRole("VIEWER"),
    isManager: hasAnyRole(["ADMIN", "PROJECT_MANAGER"]),
  };
};

/**
 * Hook for checking specific permissions
 */
export const usePermissionCheck = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, permissions } =
    useRbac();

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canCreateProjects: hasPermission("Project.create" as Permission),
    canManageUsers: hasPermission("User.create" as Permission),
    canViewFinancials: hasAnyPermission([
      "Invoice.read",
      "Payment.read",
    ] as Permission[]),
  };
};

export default useRbac;
