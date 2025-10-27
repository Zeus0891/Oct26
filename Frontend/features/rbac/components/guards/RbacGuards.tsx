// ============================================================================
// RBAC PERMISSION GUARD SYSTEM
// ============================================================================
// Simplified permission guards using existing hooks and types
// ============================================================================

"use client";

import React from "react";
import { useRbac } from "../../hooks/useRbac";
import { useIdentity } from "../../../identity/hooks/useIdentity";
import { RoleCode, Permission } from "../../types/rbac.generated";
import { Lock, Shield } from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PermissionGuardProps {
  permission: Permission;
  fallback?: React.ReactNode;
  onUnauthorized?: (permission: Permission, userId?: string) => void;
  children: React.ReactNode;
  mode?: "strict" | "lenient";
}

export interface RoleGuardProps {
  roles: RoleCode | RoleCode[];
  operator?: "AND" | "OR";
  fallback?: React.ReactNode;
  onUnauthorized?: (roles: RoleCode[], userId?: string) => void;
  children: React.ReactNode;
}

export interface ConditionalGuardProps {
  condition: (user: unknown) => boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// ============================================================================
// PERMISSION GUARD COMPONENT
// ============================================================================

export function PermissionGuard({
  permission,
  fallback,
  onUnauthorized,
  children,
  mode = "strict",
}: PermissionGuardProps) {
  const { hasPermission } = useRbac();
  const { user } = useIdentity();

  const hasAccess = React.useMemo(() => {
    if (!user) return false;
    return hasPermission(permission);
  }, [user, permission, hasPermission]);

  // Handle unauthorized access
  React.useEffect(() => {
    if (!hasAccess && onUnauthorized && user) {
      onUnauthorized(permission, user.id);
    }
  }, [hasAccess, onUnauthorized, permission, user]);

  // Render logic based on mode
  if (!hasAccess) {
    if (mode === "lenient") {
      return <div className="opacity-50 pointer-events-none">{children}</div>;
    }

    // Strict mode - show fallback
    return <>{fallback || <UnauthorizedFallback permission={permission} />}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// ROLE GUARD COMPONENT
// ============================================================================

export function RoleGuard({
  roles,
  operator = "OR",
  fallback,
  onUnauthorized,
  children,
}: RoleGuardProps) {
  const { hasRole, hasAllRoles } = useRbac();
  const { user } = useIdentity();

  const roleArray = React.useMemo(() => {
    return Array.isArray(roles) ? roles : [roles];
  }, [roles]);

  // Check roles based on operator
  const hasAccess = React.useMemo(() => {
    if (!user) return false;

    if (operator === "AND") {
      return hasAllRoles(roleArray);
    }

    return hasRole(roleArray);
  }, [user, roleArray, operator, hasRole, hasAllRoles]);

  // Handle unauthorized access
  React.useEffect(() => {
    if (!hasAccess && onUnauthorized && user) {
      onUnauthorized(roleArray, user.id);
    }
  }, [hasAccess, onUnauthorized, roleArray, user]);

  if (!hasAccess) {
    return <>{fallback || <UnauthorizedFallback roles={roleArray} />}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// CONDITIONAL GUARD COMPONENT
// ============================================================================

export function ConditionalGuard({
  condition,
  fallback,
  children,
}: ConditionalGuardProps) {
  const { user } = useIdentity();

  const hasAccess = React.useMemo(() => {
    if (!user) return false;

    try {
      return condition(user as unknown);
    } catch (error) {
      console.error("ConditionalGuard condition error:", error);
      return false;
    }
  }, [user, condition]);

  if (!hasAccess) {
    return <>{fallback || <UnauthorizedFallback type="condition" />}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// COMPOSITE GUARDS
// ============================================================================

/**
 * Guard that requires multiple permissions (AND logic)
 */
export function MultiPermissionGuard({
  permissions,
  fallback,
  children,
}: {
  permissions: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { hasAllPermissions } = useRbac();
  const { user } = useIdentity();

  const hasAccess = React.useMemo(() => {
    if (!user) return false;

    return hasAllPermissions(permissions);
  }, [user, permissions, hasAllPermissions]);

  if (!hasAccess) {
    return (
      <>{fallback || <UnauthorizedFallback permissions={permissions} />}</>
    );
  }

  return <>{children}</>;
}

/**
 * Guard that requires any of multiple permissions (OR logic)
 */
export function AnyPermissionGuard({
  permissions,
  fallback,
  children,
}: {
  permissions: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { hasAnyPermission } = useRbac();
  const { user } = useIdentity();

  const hasAccess = React.useMemo(() => {
    if (!user) return false;

    return hasAnyPermission(permissions);
  }, [user, permissions, hasAnyPermission]);

  if (!hasAccess) {
    return (
      <>{fallback || <UnauthorizedFallback permissions={permissions} />}</>
    );
  }

  return <>{children}</>;
}

// ============================================================================
// OWNER GUARD - For resource ownership checks
// ============================================================================

export function OwnerGuard({
  resourceOwnerId,
  fallback,
  children,
}: {
  resourceOwnerId: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user } = useIdentity();

  const isOwner = React.useMemo(() => {
    if (!user) return false;
    return user.id === resourceOwnerId;
  }, [user, resourceOwnerId]);

  if (!isOwner) {
    return <>{fallback || <UnauthorizedFallback type="ownership" />}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// TENANT GUARD - For tenant-specific access
// ============================================================================

export function TenantGuard({
  tenantId,
  fallback,
  children,
}: {
  tenantId: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { tenantId: currentTenantId } = useRbac();

  const hasAccess = React.useMemo(() => {
    return currentTenantId === tenantId;
  }, [currentTenantId, tenantId]);

  if (!hasAccess) {
    return <>{fallback || <UnauthorizedFallback type="tenant" />}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// FALLBACK COMPONENTS
// ============================================================================

function UnauthorizedFallback({
  permission,
  roles,
  permissions,
  type = "permission",
}: {
  permission?: string;
  roles?: string[];
  permissions?: string[];
  type?: "permission" | "role" | "condition" | "ownership" | "tenant";
}) {
  const getContent = () => {
    switch (type) {
      case "permission":
        return {
          title: "Permission Required",
          description: permission
            ? `You need the "${permission}" permission to access this resource.`
            : "You don't have permission to access this resource.",
        };
      case "role":
        return {
          title: "Role Required",
          description:
            roles && roles.length > 0
              ? `You need one of the following roles: ${roles.join(", ")}`
              : "You don't have the required role to access this resource.",
        };
      case "condition":
        return {
          title: "Access Denied",
          description:
            "You don't meet the required conditions to access this resource.",
        };
      case "ownership":
        return {
          title: "Owner Access Only",
          description: "Only the resource owner can access this content.",
        };
      case "tenant":
        return {
          title: "Tenant Access Restricted",
          description: "This resource is not available for your organization.",
        };
      default:
        return {
          title: "Access Denied",
          description: "You don't have access to this resource.",
        };
    }
  };

  const content = getContent();

  return (
    <div className="neomorphic-inset p-6 rounded-lg bg-red-50 border border-red-200">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 neomorphic-button rounded-full flex items-center justify-center mx-auto bg-red-100">
          <Lock className="w-6 h-6 text-red-600" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-red-800">
            {content.title}
          </h3>

          <p className="text-sm text-red-700">{content.description}</p>

          {permissions && permissions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-red-600 mb-1">Required permissions:</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {permissions.map((perm) => (
                  <code
                    key={perm}
                    className="bg-red-100 px-2 py-1 rounded text-xs font-mono"
                  >
                    {perm}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-red-600">
          <Shield className="w-3 h-3" />
          <span>Contact your administrator to request access</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HOOKS FOR CONDITIONAL RENDERING
// ============================================================================

/**
 * Hook to check if user has specific permission
 */
export function usePermissionCheck(permission: Permission) {
  const { hasPermission } = useRbac();
  const { user } = useIdentity();

  return React.useMemo(() => {
    if (!user) return false;
    return hasPermission(permission);
  }, [user, permission, hasPermission]);
}

/**
 * Hook to check if user has specific role
 */
export function useRoleCheck(role: RoleCode) {
  const { hasRole } = useRbac();
  const { user } = useIdentity();

  return React.useMemo(() => {
    if (!user) return false;
    return hasRole(role);
  }, [user, role, hasRole]);
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useAnyRoleCheck(roles: RoleCode[]) {
  const { hasRole } = useRbac();
  const { user } = useIdentity();

  return React.useMemo(() => {
    if (!user) return false;
    return hasRole(roles);
  }, [user, roles, hasRole]);
}

// ============================================================================
// EXPORTS
// ============================================================================

export { PermissionGuard as default };
