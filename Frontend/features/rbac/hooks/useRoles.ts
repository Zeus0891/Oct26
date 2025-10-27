/**
 * useRoles Hook
 * Role management with available service methods
 * Provides basic role operations and data management
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { rolesService } from "../services/roles.service";
import { useCurrentTenant } from "./useTenantContext";
import type { RoleCode, Role } from "../types/rbac.generated";

// =============================================================================
// SIMPLIFIED HOOK INTERFACE
// =============================================================================

export interface UseRolesReturn {
  // Data
  roles: Role[];
  selectedRole: Role | null;

  // Loading states
  isLoading: boolean;
  isOperating: boolean;

  // Error handling
  error: string | null;

  // Available operations (matching actual service methods)
  getRoles: () => Promise<void>;
  getRole: (roleCode: RoleCode) => Promise<Role | null>;
  assignRoles: (
    userId: string,
    rolesCodes: RoleCode[],
    reason?: string
  ) => Promise<void>;
  unassignRoles: (
    userId: string,
    rolesCodes: RoleCode[],
    reason?: string
  ) => Promise<void>;
  getUserRoles: (userId: string) => Promise<Role[]>;

  // Utilities
  refreshRoles: () => Promise<void>;
  selectRole: (role: Role | null) => void;

  // Computed values
  rolesByCode: Record<string, Role>;
  roleOptions: Array<{ value: RoleCode; label: string; description: string }>;
}

// =============================================================================
// CUSTOM HOOK IMPLEMENTATION
// =============================================================================

export const useRoles = (): UseRolesReturn => {
  const currentTenant = useCurrentTenant();

  // State management
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOperating, setIsOperating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const rolesByCode = useMemo(() => {
    return roles.reduce(
      (acc, role) => {
        acc[role.code] = role;
        return acc;
      },
      {} as Record<string, Role>
    );
  }, [roles]);

  const roleOptions = useMemo(() => {
    return roles.map((role) => ({
      value: role.code,
      label: role.name,
      description: role.description,
    }));
  }, [roles]);

  // =============================================================================
  // CORE OPERATIONS
  // =============================================================================

  const getRoles = useCallback(async () => {
    if (!currentTenant?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await rolesService.getRoles(currentTenant.id);

      if (result.success) {
        setRoles(result.data || []);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load roles";
      setError(errorMessage);
      console.error("Roles loading error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant?.id]);

  const getRole = useCallback(
    async (roleCode: RoleCode): Promise<Role | null> => {
      if (!currentTenant?.id) return null;

      setIsOperating(true);
      setError(null);

      try {
        const result = await rolesService.getRole(roleCode, currentTenant.id);
        return result.success ? result.data : null;
      } catch (err) {
        console.error("Failed to get role:", err);
        return null;
      } finally {
        setIsOperating(false);
      }
    },
    [currentTenant?.id]
  );

  const assignRoles = useCallback(
    async (userId: string, roleCodes: RoleCode[], reason?: string) => {
      if (!currentTenant?.id) throw new Error("No tenant selected");

      setIsOperating(true);
      setError(null);

      try {
        const request = {
          userId,
          roles: roleCodes,
          reason,
        };

        const result = await rolesService.assignRoles(
          request,
          currentTenant.id
        );

        if (result.success) {
          // Optionally refresh roles to get updated data
          await getRoles();
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to assign roles";
        setError(errorMessage);
        throw err;
      } finally {
        setIsOperating(false);
      }
    },
    [currentTenant?.id, getRoles]
  );

  const unassignRoles = useCallback(
    async (userId: string, roleCodes: RoleCode[], reason?: string) => {
      if (!currentTenant?.id) throw new Error("No tenant selected");

      setIsOperating(true);
      setError(null);

      try {
        const result = await rolesService.unassignRoles(
          userId,
          roleCodes,
          currentTenant.id,
          reason
        );

        if (result.success) {
          // Optionally refresh roles to get updated data
          await getRoles();
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to unassign roles";
        setError(errorMessage);
        throw err;
      } finally {
        setIsOperating(false);
      }
    },
    [currentTenant?.id, getRoles]
  );

  const getUserRoles = useCallback(
    async (userId: string): Promise<Role[]> => {
      if (!currentTenant?.id) return [];

      try {
        const result = await rolesService.getUserRoles(
          userId,
          currentTenant.id
        );
        if (result.success) {
          // Convert role codes to role objects
          const userRoleCodes: RoleCode[] = result.data.roles;
          return roles.filter((role) => userRoleCodes.includes(role.code));
        }
        return [];
      } catch (err) {
        console.error("Failed to get user roles:", err);
        return [];
      }
    },
    [currentTenant?.id, roles]
  );

  const refreshRoles = useCallback(async () => {
    await getRoles();
  }, [getRoles]);

  const selectRole = useCallback((role: Role | null) => {
    setSelectedRole(role);
  }, []);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Load roles when tenant changes
  useEffect(() => {
    if (currentTenant?.id) {
      getRoles();
    }
  }, [currentTenant?.id, getRoles]);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // Data
    roles,
    selectedRole,

    // Loading states
    isLoading,
    isOperating,

    // Error handling
    error,

    // Available operations
    getRoles,
    getRole,
    assignRoles,
    unassignRoles,
    getUserRoles,

    // Utilities
    refreshRoles,
    selectRole,

    // Computed values
    rolesByCode,
    roleOptions,
  };
};

export default useRoles;
