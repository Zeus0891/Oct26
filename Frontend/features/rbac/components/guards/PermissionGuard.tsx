/**
 * PermissionGuard Component
 * Shows/hides UI elements based on specific permissions
 * Uses auto-generated permissions from RBAC.schema.v7.yml for type safety
 */

"use client";

import React, { ReactNode } from "react";
import { Permission } from "../../types/rbac.generated";

// =============================================================================
// TYPES
// =============================================================================

interface PermissionGuardProps {
  permissions: Permission | Permission[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have ALL permissions; if false, ANY permission
  mode?: "hide" | "disable" | "redirect"; // How to handle unauthorized access
  redirectTo?: string;
  className?: string; // For styling disabled state
}

// =============================================================================
// PERMISSION GUARD HOOK - USING RBAC CONTEXT
// =============================================================================

import {
  useRBACCheck,
  useRbacStatus,
  useCurrentPermissions,
} from "../providers/RBACProvider";

const usePermissionGuardCheck = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useRBACCheck();
  const { isLoading } = useRbacStatus();
  const userPermissions = useCurrentPermissions();

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
  };
};

// =============================================================================
// PERMISSION GUARD COMPONENT
// =============================================================================

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions,
  children,
  fallback = null,
  requireAll = false,
  mode = "hide",
  redirectTo,
  className,
}) => {
  const { hasAnyPermission, hasAllPermissions, isLoading } =
    usePermissionGuardCheck();

  // =============================================================================
  // PERMISSION CHECKING LOGIC
  // =============================================================================

  const checkPermissionAccess = (): boolean => {
    const permissionArray = Array.isArray(permissions)
      ? permissions
      : [permissions];

    if (requireAll) {
      return hasAllPermissions(permissionArray);
    } else {
      return hasAnyPermission(permissionArray);
    }
  };

  const hasAccess = checkPermissionAccess();

  // =============================================================================
  // LOADING STATE
  // =============================================================================

  if (isLoading) {
    return fallback ? <>{fallback}</> : null;
  }

  // =============================================================================
  // ACCESS CONTROL RENDERING
  // =============================================================================

  switch (mode) {
    case "hide":
      // Completely hide the element if no access
      return hasAccess ? <>{children}</> : fallback ? <>{fallback}</> : null;

    case "disable":
      // Show the element but disable it (useful for buttons, inputs, etc.)
      if (hasAccess) {
        return <>{children}</>;
      }

      // Wrap children in disabled container
      return (
        <div
          className={`opacity-50 pointer-events-none ${className || ""}`}
          title="Access restricted - insufficient permissions"
        >
          {children}
        </div>
      );

    case "redirect":
      // Redirect to specified page (useful for route guards)
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
// CONVENIENCE COMPONENTS FOR COMMON PERMISSIONS
// =============================================================================

/**
 * ProjectAccess - Common project permissions
 */
export const ProjectAccess: React.FC<{
  action: "create" | "read" | "update" | "delete";
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ action, children, fallback }) => (
  <PermissionGuard
    permissions={`Project.${action}` as Permission}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

/**
 * InvoiceAccess - Common invoice permissions
 */
export const InvoiceAccess: React.FC<{
  action: "create" | "read" | "update" | "delete" | "approve";
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ action, children, fallback }) => (
  <PermissionGuard
    permissions={`Invoice.${action}` as Permission}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

/**
 * TaskAccess - Common task permissions
 */
export const TaskAccess: React.FC<{
  action: "create" | "read" | "update" | "assign" | "complete";
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ action, children, fallback }) => (
  <PermissionGuard
    permissions={`Task.${action}` as Permission}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

/**
 * UserAccess - Common user management permissions
 */
export const UserAccess: React.FC<{
  action: "create" | "read" | "update" | "delete" | "activate" | "deactivate";
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ action, children, fallback }) => (
  <PermissionGuard
    permissions={`User.${action}` as Permission}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

/**
 * MemberAccess - Common member management permissions
 */
export const MemberAccess: React.FC<{
  action: "create" | "read" | "update" | "assign" | "unassign";
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ action, children, fallback }) => (
  <PermissionGuard
    permissions={`Member.${action}` as Permission}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook to check specific permission access
 */
export const usePermissionAccess = () => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions,
  } = usePermissionGuardCheck();

  return {
    // Common permission checks
    canCreateProjects: hasPermission("Project.create" as Permission),
    canManageUsers: hasPermission("User.create" as Permission),
    canManageMembers: hasPermission("Member.create" as Permission),
    canViewFinancials: hasAnyPermission([
      "Invoice.read",
      "Payment.read",
    ] as Permission[]),
    canManageInventory: hasAnyPermission([
      "InventoryItem.create",
      "InventoryItem.update",
    ] as Permission[]),

    // Raw access functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions,
  };
};

/**
 * Hook for dynamic permission checking
 */
export const usePermissionCheck = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissionGuardCheck();

  return {
    checkModelAction: (model: string, action: string): boolean => {
      return hasPermission(`${model}.${action}` as Permission);
    },
    checkMultipleModelActions: (
      checks: Array<{ model: string; action: string }>
    ): boolean => {
      const permissions = checks.map(
        (c) => `${c.model}.${c.action}` as Permission
      );
      return hasAnyPermission(permissions);
    },
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

/**
 * HOC for wrapping components with PermissionGuard
 */
export const withPermissionGuard = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permissions: Permission | Permission[],
  guardProps?: Omit<PermissionGuardProps, "children" | "permissions">
) => {
  const GuardedComponent: React.FC<P> = (props) => (
    <PermissionGuard permissions={permissions} {...guardProps}>
      <WrappedComponent {...props} />
    </PermissionGuard>
  );

  GuardedComponent.displayName = `withPermissionGuard(${WrappedComponent.displayName || WrappedComponent.name})`;

  return GuardedComponent;
};

export default PermissionGuard;
