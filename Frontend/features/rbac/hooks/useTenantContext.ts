/**
 * useTenantContext Hook
 * Manages tenant context switching and tenant-related operations
 * Provides seamless tenant switching with automatic RBAC updates
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { rbacService } from "../services/rbac.service";
// Session service not needed for now, using localStorage for tenant switching
import type { RoleCode, Permission } from "../types/rbac.generated";

// =============================================================================
// TENANT CONTEXT TYPES
// =============================================================================

export interface TenantInfo {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  logoUrl?: string;
  domain?: string;
  settings: {
    timezone: string;
    locale: string;
    currency: string;
    dateFormat: string;
  };
  subscription: {
    plan: "free" | "pro" | "enterprise";
    status: "active" | "suspended" | "cancelled";
    expiresAt?: string;
  };
  features: string[];
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserTenantRole {
  tenantId: string;
  roles: RoleCode[];
  permissions: Permission[];
  joinedAt: string;
  isOwner: boolean;
  isActive: boolean;
}

export interface TenantSwitchContext {
  currentTenant: TenantInfo | null;
  availableTenants: TenantInfo[];
  userRoleInTenant: UserTenantRole | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenantContext: () => Promise<void>;
  getTenantBySlug: (slug: string) => TenantInfo | undefined;
  canSwitchToTenant: (tenantId: string) => boolean;

  // Convenience getters
  isOwner: boolean;
  hasActiveSubscription: boolean;
  canInviteMembers: boolean;
  canManageSettings: boolean;
  membershipStatus: "owner" | "admin" | "member" | "viewer" | null;
}

// =============================================================================
// CUSTOM HOOK IMPLEMENTATION
// =============================================================================

export const useTenantContext = (): TenantSwitchContext => {
  const router = useRouter();

  const [currentTenant, setCurrentTenant] = useState<TenantInfo | null>(null);
  const [availableTenants, setAvailableTenants] = useState<TenantInfo[]>([]);
  const [userRoleInTenant, setUserRoleInTenant] =
    useState<UserTenantRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const getTenantBySlug = useCallback(
    (slug: string): TenantInfo | undefined => {
      return availableTenants.find((tenant) => tenant.slug === slug);
    },
    [availableTenants]
  );

  const canSwitchToTenant = useCallback(
    (tenantId: string): boolean => {
      return availableTenants.some(
        (tenant) =>
          tenant.id === tenantId && tenant.subscription.status === "active"
      );
    },
    [availableTenants]
  );

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const refreshTenantContext = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current user RBAC context (we'll need tenant ID from session)
      const currentTenantId = localStorage.getItem("current_tenant_id");

      if (currentTenantId) {
        const rbacResult =
          await rbacService.getCurrentUserRbac(currentTenantId);

        if (rbacResult.success && rbacResult.data) {
          // For now, we'll create mock tenant info from the RBAC data
          const mockTenant: TenantInfo = {
            id: currentTenantId,
            name: `Tenant ${currentTenantId}`,
            displayName: `Tenant ${currentTenantId}`,
            slug: currentTenantId.toLowerCase(),
            settings: {
              timezone: "UTC",
              locale: "en-US",
              currency: "USD",
              dateFormat: "MM/dd/yyyy",
            },
            subscription: {
              plan: "pro",
              status: "active",
            },
            features: [],
            memberCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const userRole: UserTenantRole = {
            tenantId: currentTenantId,
            roles: rbacResult.data.roles || [],
            permissions: rbacResult.data.permissions || [],
            joinedAt: new Date().toISOString(),
            isOwner: rbacResult.data.roles?.includes("ADMIN") || false,
            isActive: true,
          };

          setCurrentTenant(mockTenant);
          setUserRoleInTenant(userRole);
          setAvailableTenants([mockTenant]); // For now, just current tenant
        } else {
          throw new Error(rbacResult.message);
        }
      } else {
        // No tenant selected
        setCurrentTenant(null);
        setUserRoleInTenant(null);
        setAvailableTenants([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load tenant context";
      setError(errorMessage);
      console.error("Tenant context error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchTenant = useCallback(
    async (tenantId: string) => {
      if (!canSwitchToTenant(tenantId)) {
        throw new Error("Cannot switch to this tenant");
      }

      setIsLoading(true);
      setError(null);

      try {
        // Switch tenant by updating localStorage and refreshing context
        localStorage.setItem("current_tenant_id", tenantId);

        // Refresh the context after successful switch
        await refreshTenantContext();

        // Update URL if needed (remove current tenant slug, navigate to new one)
        const targetTenant = availableTenants.find((t) => t.id === tenantId);
        if (targetTenant) {
          router.push(`/${targetTenant.slug}/dashboard`);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to switch tenant";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [availableTenants, router, refreshTenantContext, canSwitchToTenant]
  );

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const isOwner = useMemo(() => {
    return userRoleInTenant?.isOwner || false;
  }, [userRoleInTenant]);

  const hasActiveSubscription = useMemo(() => {
    return currentTenant?.subscription.status === "active";
  }, [currentTenant]);

  const canInviteMembers = useMemo(() => {
    return (
      userRoleInTenant?.roles.some((role) =>
        ["ADMIN", "PROJECT_MANAGER"].includes(role)
      ) || false
    );
  }, [userRoleInTenant]);

  const canManageSettings = useMemo(() => {
    return (
      userRoleInTenant?.roles.some((role) => ["ADMIN"].includes(role)) ||
      isOwner
    );
  }, [userRoleInTenant, isOwner]);

  const membershipStatus = useMemo(():
    | "owner"
    | "admin"
    | "member"
    | "viewer"
    | null => {
    if (!userRoleInTenant) return null;

    if (userRoleInTenant.isOwner) return "owner";

    if (userRoleInTenant.roles.includes("ADMIN")) return "admin";
    if (userRoleInTenant.roles.includes("PROJECT_MANAGER")) return "member";
    if (userRoleInTenant.roles.includes("VIEWER")) return "viewer";

    return "member";
  }, [userRoleInTenant]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Load initial tenant context on mount
  useEffect(() => {
    refreshTenantContext();
  }, [refreshTenantContext]);

  // Listen for tenant context changes (from other tabs, etc.)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === "current_tenant_id" &&
        event.newValue !== event.oldValue
      ) {
        refreshTenantContext();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshTenantContext]);

  // =============================================================================
  // RETURN CONTEXT
  // =============================================================================

  return {
    currentTenant,
    availableTenants,
    userRoleInTenant,
    isLoading,
    error,

    // Actions
    switchTenant,
    refreshTenantContext,
    getTenantBySlug,
    canSwitchToTenant,

    // Convenience getters
    isOwner,
    hasActiveSubscription,
    canInviteMembers,
    canManageSettings,
    membershipStatus,
  };
};

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Hook to get just the current tenant info
 */
export const useCurrentTenant = (): TenantInfo | null => {
  const { currentTenant } = useTenantContext();
  return currentTenant;
};

/**
 * Hook to get available tenants for switching
 */
export const useAvailableTenants = (): TenantInfo[] => {
  const { availableTenants } = useTenantContext();
  return availableTenants;
};

/**
 * Hook to get tenant switching functionality only
 */
export const useTenantSwitcher = () => {
  const {
    switchTenant,
    availableTenants,
    currentTenant,
    isLoading,
    canSwitchToTenant,
  } = useTenantContext();

  return {
    switchTenant,
    availableTenants,
    currentTenant,
    isLoading,
    canSwitchToTenant,
  };
};

/**
 * Hook to check tenant-level permissions
 */
export const useTenantPermissions = () => {
  const {
    isOwner,
    canInviteMembers,
    canManageSettings,
    hasActiveSubscription,
    membershipStatus,
    userRoleInTenant,
  } = useTenantContext();

  return {
    isOwner,
    canInviteMembers,
    canManageSettings,
    hasActiveSubscription,
    membershipStatus,
    roles: userRoleInTenant?.roles || [],
    permissions: userRoleInTenant?.permissions || [],
  };
};

export default useTenantContext;
