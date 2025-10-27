/**
 * usePermissions Hook
 * Comprehensive permission management with granular access control
 * Provides permission operations, analytics, and validation
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { permissionsService } from "../services/permissions.service";
import { useCurrentTenant } from "./useTenantContext";
import type { Permission } from "../types/rbac.generated";

// =============================================================================
// PERMISSION TYPES (Using service types)
// =============================================================================

export interface PermissionGroup {
  domain: string;
  permissions: Permission[];
  description?: string;
  count: number;
}

export interface UserPermissions {
  userId: string;
  permissions: Permission[];
  grantedBy: Array<{
    permission: Permission;
    grantedBy: string;
    grantedAt: string;
    source: "DIRECT" | "ROLE" | "INHERITED";
  }>;
}

export interface PermissionMatrix {
  permissions: Permission[];
  roles: Array<{
    roleCode: string;
    permissions: Permission[];
  }>;
  users: Array<{
    userId: string;
    permissions: Permission[];
  }>;
}

export interface UsePermissionsReturn {
  // Data
  availablePermissions: Permission[];
  permissionsByDomain: Record<string, PermissionGroup>;
  permissionMatrix: PermissionMatrix | null;
  userPermissions: UserPermissions | null;

  // Loading states
  isLoading: boolean;
  isOperating: boolean;

  // Error handling
  error: string | null;

  // Core permission operations
  getAvailablePermissions: () => Promise<void>;
  getPermissionsByDomain: () => Promise<void>;
  getPermissionMatrix: () => Promise<void>;
  getUserPermissions: (userId: string) => Promise<UserPermissions | null>;

  // Permission management
  grantPermissions: (
    userId: string,
    permissions: Permission[],
    reason?: string
  ) => Promise<void>;
  revokePermissions: (
    userId: string,
    permissions: Permission[],
    reason?: string
  ) => Promise<void>;
  replaceUserPermissions: (
    userId: string,
    permissions: Permission[],
    reason?: string
  ) => Promise<void>;

  // Bulk operations
  bulkGrantPermissions: (
    grants: Array<{ userId: string; permissions: Permission[] }>
  ) => Promise<void>;

  // Analytics and utilities
  getPermissionStats: () => Promise<void>;
  analyzePermissions: (userId?: string) => Promise<void>;
  compareUserPermissions: (userIds: string[]) => Promise<void>;

  // Validation
  validatePermissionGrant: (
    userId: string,
    permissions: Permission[]
  ) => Promise<boolean>;
  canGrantPermissions: (
    granterUserId: string,
    targetPermissions: Permission[]
  ) => Promise<boolean>;

  // Search and suggestions
  searchPermissions: (
    query: string,
    filters?: Record<string, unknown>
  ) => Promise<Permission[]>;
  getPermissionSuggestions: (
    userId: string,
    context?: string
  ) => Promise<Permission[]>;

  // Utilities
  refreshPermissions: () => Promise<void>;

  // Computed values
  permissionOptions: Array<{
    value: Permission;
    label: string;
    domain: string;
  }>;
  domainList: string[];
  canManagePermissions: boolean;
}

// =============================================================================
// CUSTOM HOOK IMPLEMENTATION
// =============================================================================

export const usePermissions = (): UsePermissionsReturn => {
  const currentTenant = useCurrentTenant();

  // State management
  const [availablePermissions, setAvailablePermissions] = useState<
    Permission[]
  >([]);
  const [permissionsByDomain, setPermissionsByDomain] = useState<
    Record<string, PermissionGroup>
  >({});
  const [permissionMatrix, setPermissionMatrix] =
    useState<PermissionMatrix | null>(null);
  const [userPermissions] = useState<UserPermissions | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isOperating, setIsOperating] = useState(false);

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const permissionOptions = useMemo(() => {
    return availablePermissions.map((permission) => ({
      value: permission,
      label: permission
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      domain: permission.split("_")[0] || "General",
    }));
  }, [availablePermissions]);

  const domainList = useMemo(() => {
    return Object.keys(permissionsByDomain).sort();
  }, [permissionsByDomain]);

  const canManagePermissions = useMemo(() => {
    // TODO: Implement proper permission checking from current user context
    return true;
  }, []);

  // =============================================================================
  // CORE PERMISSION OPERATIONS
  // =============================================================================

  const getAvailablePermissions = useCallback(async () => {
    if (!currentTenant?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await permissionsService.getAvailablePermissions(
        currentTenant.id
      );

      if (result.success) {
        setAvailablePermissions(result.data || []);
      } else {
        throw new Error("Failed to load available permissions");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load permissions";
      setError(errorMessage);
      console.error("Permissions loading error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant?.id]);

  const getPermissionsByDomain = useCallback(async () => {
    if (!currentTenant?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await permissionsService.getPermissionsByDomain(
        currentTenant.id
      );

      if (result.success) {
        // Transform the result to match our interface
        const domainMap: Record<string, PermissionGroup> = {};

        if (result.data && Array.isArray(result.data)) {
          result.data.forEach((item) => {
            domainMap[item.domain] = {
              domain: item.domain,
              permissions: item.permissions || [],
              description: item.description,
              count: item.permissions?.length || 0,
            };
          });
        }

        setPermissionsByDomain(domainMap);
      } else {
        throw new Error("Failed to load permissions by domain");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load permissions by domain";
      setError(errorMessage);
      console.error("Permissions by domain loading error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant?.id]);

  const getPermissionMatrix = useCallback(async () => {
    if (!currentTenant?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await permissionsService.getPermissionMatrix(
        currentTenant.id
      );

      if (result.success) {
        // Transform the data to match our interface
        const transformedMatrix: PermissionMatrix = {
          permissions: Object.keys(result.data || {}) as Permission[],
          roles: Object.entries(result.data || {}).map(
            ([roleCode, permissions]) => ({
              roleCode,
              permissions: permissions as Permission[],
            })
          ),
          users: [], // This would need to be populated from a different endpoint
        };
        setPermissionMatrix(transformedMatrix);
      } else {
        throw new Error("Failed to load permission matrix");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load permission matrix";
      setError(errorMessage);
      console.error("Permission matrix loading error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant?.id]);

  const getUserPermissions = useCallback(
    async (userId: string): Promise<UserPermissions | null> => {
      if (!currentTenant?.id) return null;

      try {
        const result = await permissionsService.getUserPermissions(
          userId,
          currentTenant.id
        );
        if (result.success && result.data) {
          // Transform the service response to match our interface
          const transformed: UserPermissions = {
            userId: result.data.userId,
            permissions: result.data.allPermissions || [],
            grantedBy:
              result.data.effectivePermissions?.map((p) => ({
                permission: p.permission,
                grantedBy: p.grantedBy || "system",
                grantedAt: p.grantedAt || new Date().toISOString(),
                source:
                  p.source === "direct"
                    ? ("DIRECT" as const)
                    : p.source === "role"
                      ? ("ROLE" as const)
                      : ("INHERITED" as const),
              })) || [],
          };
          return transformed;
        }
        return null;
      } catch (err) {
        console.error("Failed to get user permissions:", err);
        return null;
      }
    },
    [currentTenant?.id]
  );

  // =============================================================================
  // PERMISSION MANAGEMENT
  // =============================================================================

  const grantPermissions = useCallback(
    async (userId: string, permissions: Permission[], reason?: string) => {
      if (!currentTenant?.id) throw new Error("No tenant selected");

      setIsOperating(true);
      setError(null);

      try {
        const request = {
          userId,
          permissions,
          grantedBy: "current-user", // TODO: Get from auth context
          reason,
          tenantId: currentTenant.id,
        };

        const result = await permissionsService.grantPermissions(
          request,
          currentTenant.id
        );

        if (result.success) {
          // Refresh relevant data
          await getPermissionMatrix();
        } else {
          throw new Error("Failed to grant permissions");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to grant permissions";
        setError(errorMessage);
        throw err;
      } finally {
        setIsOperating(false);
      }
    },
    [currentTenant?.id, getPermissionMatrix]
  );

  const revokePermissions = useCallback(
    async (userId: string, permissions: Permission[], reason?: string) => {
      if (!currentTenant?.id) throw new Error("No tenant selected");

      setIsOperating(true);
      setError(null);

      try {
        const result = await permissionsService.revokePermissions(
          userId,
          permissions,
          currentTenant.id,
          reason
        );

        if (result.success) {
          // Refresh relevant data
          await getPermissionMatrix();
        } else {
          throw new Error("Failed to revoke permissions");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to revoke permissions";
        setError(errorMessage);
        throw err;
      } finally {
        setIsOperating(false);
      }
    },
    [currentTenant?.id, getPermissionMatrix]
  );

  const replaceUserPermissions = useCallback(
    async (userId: string, permissions: Permission[], reason?: string) => {
      if (!currentTenant?.id) throw new Error("No tenant selected");

      setIsOperating(true);
      setError(null);

      try {
        const result = await permissionsService.replaceUserPermissions(
          userId,
          permissions,
          currentTenant.id,
          reason
        );

        if (result.success) {
          // Refresh relevant data
          await getPermissionMatrix();
        } else {
          throw new Error("Failed to replace user permissions");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to replace user permissions";
        setError(errorMessage);
        throw err;
      } finally {
        setIsOperating(false);
      }
    },
    [currentTenant?.id, getPermissionMatrix]
  );

  // =============================================================================
  // BULK OPERATIONS
  // =============================================================================

  const bulkGrantPermissions = useCallback(
    async (grants: Array<{ userId: string; permissions: Permission[] }>) => {
      if (!currentTenant?.id) throw new Error("No tenant selected");

      setIsOperating(true);
      setError(null);

      try {
        const request = {
          grants: grants,
          grantedBy: "current-user", // TODO: Get from auth context
          tenantId: currentTenant.id,
        };

        const result = await permissionsService.bulkGrantPermissions(
          request,
          currentTenant.id
        );

        if (result.success) {
          // Refresh relevant data
          await getPermissionMatrix();
        } else {
          throw new Error("Failed to bulk grant permissions");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to bulk grant permissions";
        setError(errorMessage);
        throw err;
      } finally {
        setIsOperating(false);
      }
    },
    [currentTenant?.id, getPermissionMatrix]
  );

  // =============================================================================
  // ANALYTICS AND UTILITIES
  // =============================================================================

  const getPermissionStats = useCallback(async () => {
    if (!currentTenant?.id) return;

    try {
      const result = await permissionsService.getPermissionStats(
        currentTenant.id
      );

      if (result.success) {
        console.log("Permission stats:", result.data);
      }
    } catch (err) {
      console.error("Failed to get permission stats:", err);
    }
  }, [currentTenant?.id]);

  const analyzePermissions = useCallback(
    async (userId?: string) => {
      if (!currentTenant?.id) return;

      try {
        const result = await permissionsService.analyzePermissions(
          currentTenant.id,
          userId
        );

        if (result.success) {
          console.log("Permission analysis:", result.data);
        }
      } catch (err) {
        console.error("Failed to analyze permissions:", err);
      }
    },
    [currentTenant?.id]
  );

  const compareUserPermissions = useCallback(
    async (userIds: string[]) => {
      if (!currentTenant?.id || userIds.length < 2) return;

      try {
        const result = await permissionsService.compareUserPermissions(
          userIds[0],
          userIds[1],
          currentTenant.id
        );

        if (result.success) {
          console.log("Permission comparison:", result.data);
        }
      } catch (err) {
        console.error("Failed to compare user permissions:", err);
      }
    },
    [currentTenant?.id]
  );

  // =============================================================================
  // VALIDATION
  // =============================================================================

  const validatePermissionGrant = useCallback(
    async (userId: string, permissions: Permission[]): Promise<boolean> => {
      if (!currentTenant?.id) return false;

      try {
        const result = await permissionsService.validatePermissionGrant(
          userId,
          permissions,
          currentTenant.id
        );
        return (result.success && result.data?.isValid) || false;
      } catch (err) {
        console.error("Failed to validate permission grant:", err);
        return false;
      }
    },
    [currentTenant?.id]
  );

  const canGrantPermissions = useCallback(
    async (
      granterUserId: string,
      targetPermissions: Permission[]
    ): Promise<boolean> => {
      if (!currentTenant?.id) return false;

      try {
        const result = await permissionsService.canGrantPermissions(
          granterUserId,
          targetPermissions,
          currentTenant.id
        );
        return (result.success && result.data?.canGrant) || false;
      } catch (err) {
        console.error("Failed to check grant permissions capability:", err);
        return false;
      }
    },
    [currentTenant?.id]
  );

  // =============================================================================
  // SEARCH AND SUGGESTIONS
  // =============================================================================

  const searchPermissions = useCallback(
    async (
      query: string,
      filters?: Record<string, unknown>
    ): Promise<Permission[]> => {
      if (!currentTenant?.id) return [];

      try {
        const searchOptions = {
          query: query,
          ...filters,
        };
        const result = await permissionsService.searchPermissions(
          currentTenant.id,
          searchOptions
        );
        return result.success ? result.data || [] : [];
      } catch (err) {
        console.error("Failed to search permissions:", err);
        return [];
      }
    },
    [currentTenant?.id]
  );

  const getPermissionSuggestions = useCallback(
    async (userId: string, context?: string): Promise<Permission[]> => {
      if (!currentTenant?.id) return [];

      try {
        const contextObj = context ? { taskContext: context } : undefined;
        const result = await permissionsService.getPermissionSuggestions(
          userId,
          currentTenant.id,
          contextObj
        );
        return result.success ? result.data || [] : [];
      } catch (err) {
        console.error("Failed to get permission suggestions:", err);
        return [];
      }
    },
    [currentTenant?.id]
  );

  // =============================================================================
  // UTILITIES
  // =============================================================================

  const refreshPermissions = useCallback(async () => {
    await Promise.all([
      getAvailablePermissions(),
      getPermissionsByDomain(),
      getPermissionMatrix(),
      getPermissionStats(),
    ]);
  }, [
    getAvailablePermissions,
    getPermissionsByDomain,
    getPermissionMatrix,
    getPermissionStats,
  ]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Load permissions when tenant changes
  useEffect(() => {
    if (currentTenant?.id) {
      refreshPermissions();
    }
  }, [currentTenant?.id, refreshPermissions]);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // Data
    availablePermissions,
    permissionsByDomain,
    permissionMatrix,
    userPermissions,

    // Loading states
    isLoading,
    isOperating,

    // Error handling
    error,

    // Core permission operations
    getAvailablePermissions,
    getPermissionsByDomain,
    getPermissionMatrix,
    getUserPermissions,

    // Permission management
    grantPermissions,
    revokePermissions,
    replaceUserPermissions,

    // Bulk operations
    bulkGrantPermissions,

    // Analytics and utilities
    getPermissionStats,
    analyzePermissions,
    compareUserPermissions,

    // Validation
    validatePermissionGrant,
    canGrantPermissions,

    // Search and suggestions
    searchPermissions,
    getPermissionSuggestions,

    // Utilities
    refreshPermissions,

    // Computed values
    permissionOptions,
    domainList,
    canManagePermissions,
  };
};

export default usePermissions;
