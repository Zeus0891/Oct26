/**
 * ConditionalGuard Component
 * Advanced guard with custom conditions and complex logic
 * Supports combining roles, permissions, and custom conditions
 */

"use client";

import React, { ReactNode, useEffect, useCallback } from "react";
import { RoleCode, Permission } from "../../types/rbac.generated";

// =============================================================================
// TYPES
// =============================================================================

interface ConditionalGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  condition?: () => boolean | Promise<boolean>; // Custom condition function
  roles?: RoleCode | RoleCode[];
  permissions?: Permission | Permission[];
  requireAllRoles?: boolean;
  requireAllPermissions?: boolean;
  mode?: "hide" | "disable" | "redirect";
  redirectTo?: string;
  className?: string;
  logic?: "AND" | "OR"; // How to combine roles, permissions, and conditions
  onAccessDenied?: () => void; // Callback when access is denied
  onAccessGranted?: () => void; // Callback when access is granted
}

interface GuardContext {
  userRoles: RoleCode[];
  userPermissions: Permission[];
  tenantId: string | null;
  userId: string | null;
  hasRole: (role: RoleCode | RoleCode[]) => boolean;
  hasPermission: (permission: Permission | Permission[]) => boolean;
}

// =============================================================================
// CONDITIONAL GUARD HOOK - USING RBAC CONTEXT
// =============================================================================

import { useRBACContext } from "../providers/RBACProvider";
import { useIdentity } from "../../../identity/hooks/useIdentity";

const useConditionalGuardCheck = (): GuardContext & { isLoading: boolean } => {
  const { roles, permissions, tenantId, hasRole, hasPermission, isLoading } =
    useRBACContext();
  const { user } = useIdentity();

  return {
    userRoles: roles,
    userPermissions: permissions,
    tenantId,
    userId: user?.id || null,
    hasRole,
    hasPermission,
    isLoading,
  };
};

// =============================================================================
// CONDITIONAL GUARD COMPONENT
// =============================================================================

export const ConditionalGuard: React.FC<ConditionalGuardProps> = ({
  children,
  fallback = null,
  condition,
  roles,
  permissions,
  requireAllRoles = false,
  requireAllPermissions = false,
  mode = "hide",
  redirectTo,
  className,
  logic = "AND",
  onAccessDenied,
  onAccessGranted,
}) => {
  const guardContext = useConditionalGuardCheck();
  const { hasRole, hasPermission, isLoading } = guardContext;

  // =============================================================================
  // ACCESS CHECKING LOGIC
  // =============================================================================

  const checkAccess = useCallback(async (): Promise<boolean> => {
    const checks: boolean[] = [];

    // Check roles if provided
    if (roles) {
      const roleArray = Array.isArray(roles) ? roles : [roles];
      if (requireAllRoles) {
        checks.push(roleArray.every((role) => hasRole(role)));
      } else {
        checks.push(roleArray.some((role) => hasRole(role)));
      }
    }

    // Check permissions if provided
    if (permissions) {
      const permissionArray = Array.isArray(permissions)
        ? permissions
        : [permissions];
      if (requireAllPermissions) {
        checks.push(
          permissionArray.every((permission) => hasPermission(permission))
        );
      } else {
        checks.push(
          permissionArray.some((permission) => hasPermission(permission))
        );
      }
    }

    // Check custom condition if provided
    if (condition) {
      try {
        const conditionResult = await condition();
        checks.push(conditionResult);
      } catch (error) {
        console.error("ConditionalGuard: Custom condition failed:", error);
        checks.push(false);
      }
    }

    // If no conditions provided, default to true
    if (checks.length === 0) {
      return true;
    }

    // Apply logic operator
    const hasAccess =
      logic === "AND"
        ? checks.every((check) => check)
        : checks.some((check) => check);

    // Call appropriate callback
    if (hasAccess && onAccessGranted) {
      onAccessGranted();
    } else if (!hasAccess && onAccessDenied) {
      onAccessDenied();
    }

    return hasAccess;
  }, [
    roles,
    permissions,
    requireAllRoles,
    requireAllPermissions,
    condition,
    hasRole,
    hasPermission,
    logic,
    onAccessGranted,
    onAccessDenied,
  ]);

  // =============================================================================
  // ASYNC CONDITION HANDLING
  // =============================================================================

  // Handle async condition check - always call useEffect (React Hooks rules)
  useEffect(() => {
    const runAsyncCheck = async () => {
      if (condition) {
        try {
          await checkAccess();
        } catch (error) {
          console.error("Async condition check failed:", error);
        }
      }
    };

    // Only run if we have a condition to check
    if (condition) {
      runAsyncCheck();
    }
  }, [condition, checkAccess]);

  // =============================================================================
  // SYNC ACCESS CHECK (for rendering)
  // =============================================================================

  const checkAccessSync = (): boolean => {
    const checks: boolean[] = [];

    // Check roles if provided
    if (roles) {
      const roleArray = Array.isArray(roles) ? roles : [roles];
      if (requireAllRoles) {
        checks.push(roleArray.every((role) => hasRole(role)));
      } else {
        checks.push(roleArray.some((role) => hasRole(role)));
      }
    }

    // Check permissions if provided
    if (permissions) {
      const permissionArray = Array.isArray(permissions)
        ? permissions
        : [permissions];
      if (requireAllPermissions) {
        checks.push(
          permissionArray.every((permission) => hasPermission(permission))
        );
      } else {
        checks.push(
          permissionArray.some((permission) => hasPermission(permission))
        );
      }
    }

    // For async conditions, we'll assume access is denied during sync check
    if (condition) {
      checks.push(false);
    }

    // If no conditions provided, default to true
    if (checks.length === 0) {
      return true;
    }

    // Apply logic operator
    return logic === "AND"
      ? checks.every((check) => check)
      : checks.some((check) => check);
  };

  // =============================================================================
  // RENDER LOGIC
  // =============================================================================

  // Show loader while checking
  if (isLoading) {
    return fallback ? <>{fallback}</> : null;
  }

  const hasAccess = checkAccessSync();

  switch (mode) {
    case "hide":
      return hasAccess ? <>{children}</> : fallback ? <>{fallback}</> : null;

    case "disable":
      if (hasAccess) {
        return <>{children}</>;
      }

      return (
        <div
          className={`opacity-50 pointer-events-none ${className || ""}`}
          title="Access restricted based on roles, permissions, or conditions"
        >
          {children}
        </div>
      );

    case "redirect":
      if (!hasAccess) {
        if (redirectTo && typeof window !== "undefined") {
          window.location.href = redirectTo;
        }
        return fallback ? <>{fallback}</> : null;
      }
      return <>{children}</>;

    default:
      return hasAccess ? <>{children}</> : fallback ? <>{fallback}</> : null;
  }
};

// =============================================================================
// CONVENIENCE COMPONENTS
// =============================================================================

/**
 * BusinessHoursGuard - Show content only during business hours
 */
export const BusinessHoursGuard: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
  startHour?: number;
  endHour?: number;
}> = ({ children, fallback, startHour = 9, endHour = 17 }) => (
  <ConditionalGuard
    condition={() => {
      const now = new Date();
      const hour = now.getHours();
      return hour >= startHour && hour < endHour;
    }}
    fallback={fallback}
  >
    {children}
  </ConditionalGuard>
);

/**
 * FeatureToggleGuard - Show content based on feature flags
 */
export const FeatureToggleGuard: React.FC<{
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ feature, children, fallback }) => (
  <ConditionalGuard
    condition={() => {
      // This would integrate with feature flag system
      // For now, return false as placeholder
      console.log(`Checking feature flag: ${feature}`);
      return false;
    }}
    fallback={fallback}
  >
    {children}
  </ConditionalGuard>
);

/**
 * OwnershipGuard - Show content only if user owns the resource
 */
export const OwnershipGuard: React.FC<{
  resourceUserId: string;
  children: ReactNode;
  fallback?: ReactNode;
  allowManagers?: boolean;
}> = ({ resourceUserId, children, fallback, allowManagers = true }) => {
  const { userId, hasRole } = useConditionalGuardCheck();

  return (
    <ConditionalGuard
      condition={() => {
        // User owns the resource
        if (userId === resourceUserId) return true;

        // Allow managers if specified
        if (allowManagers && (hasRole("ADMIN") || hasRole("PROJECT_MANAGER"))) {
          return true;
        }

        return false;
      }}
      fallback={fallback}
    >
      {children}
    </ConditionalGuard>
  );
};

/**
 * HOC for wrapping components with ConditionalGuard
 */
export const withConditionalGuard = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  guardProps: Omit<ConditionalGuardProps, "children">
) => {
  const GuardedComponent: React.FC<P> = (props) => (
    <ConditionalGuard {...guardProps}>
      <WrappedComponent {...props} />
    </ConditionalGuard>
  );

  GuardedComponent.displayName = `withConditionalGuard(${WrappedComponent.displayName || WrappedComponent.name})`;

  return GuardedComponent;
};

export default ConditionalGuard;
