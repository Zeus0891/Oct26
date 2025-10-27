/**
 * RBAC Utils
 * General RBAC utility functions and helpers
 * Aligned with backend RBAC architecture
 */

import { RoleCode, Permission } from "../types/rbac.generated";
import type { UserRoles } from "../types/rbac.types";

// =============================================================================
// RBAC VALIDATION UTILS
// =============================================================================

/**
 * Check if user has specific role
 */
export const hasRole = (userRoles: UserRoles, role: RoleCode): boolean => {
  return userRoles.roles.includes(role);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (
  userRoles: UserRoles,
  roles: RoleCode[]
): boolean => {
  return roles.some((role) => userRoles.roles.includes(role));
};

/**
 * Check if user has all specified roles
 */
export const hasAllRoles = (
  userRoles: UserRoles,
  roles: RoleCode[]
): boolean => {
  return roles.every((role) => userRoles.roles.includes(role));
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (
  userRoles: UserRoles,
  permission: Permission
): boolean => {
  return userRoles.permissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (
  userRoles: UserRoles,
  permissions: Permission[]
): boolean => {
  return permissions.some((permission) =>
    userRoles.permissions.includes(permission)
  );
};

/**
 * Check if user has all specified permissions
 */
export const hasAllPermissions = (
  userRoles: UserRoles,
  permissions: Permission[]
): boolean => {
  return permissions.every((permission) =>
    userRoles.permissions.includes(permission)
  );
};

/**
 * Check if user is admin
 */
export const isAdmin = (userRoles: UserRoles): boolean => {
  return hasRole(userRoles, "ADMIN");
};

/**
 * Check if user is project manager or higher
 */
export const isManagerOrHigher = (userRoles: UserRoles): boolean => {
  return hasAnyRole(userRoles, ["ADMIN", "PROJECT_MANAGER"]);
};

/**
 * Check if user has read access to resource
 */
export const canRead = (userRoles: UserRoles, resource: string): boolean => {
  const readPermission = `${resource}.read` as Permission;
  return hasPermission(userRoles, readPermission);
};

/**
 * Check if user has write access to resource
 */
export const canWrite = (userRoles: UserRoles, resource: string): boolean => {
  const writePermissions = [
    `${resource}.create`,
    `${resource}.update`,
    `${resource}.duplicate`,
  ] as Permission[];
  return hasAnyPermission(userRoles, writePermissions);
};

/**
 * Check if user has delete access to resource
 */
export const canDelete = (userRoles: UserRoles, resource: string): boolean => {
  const deletePermissions = [
    `${resource}.soft_delete`,
    `${resource}.hard_delete`,
  ] as Permission[];
  return hasAnyPermission(userRoles, deletePermissions);
};

// =============================================================================
// RBAC HIERARCHY UTILS
// =============================================================================

/**
 * Role hierarchy levels (higher number = more privileges)
 */
const ROLE_HIERARCHY: Record<RoleCode, number> = {
  ADMIN: 100,
  PROJECT_MANAGER: 75,
  WORKER: 50,
  VIEWER: 25,
  DRIVER: 25,
};

/**
 * Get role hierarchy level
 */
export const getRoleLevel = (role: RoleCode): number => {
  return ROLE_HIERARCHY[role] || 0;
};

/**
 * Get user's highest role level
 */
export const getHighestRoleLevel = (userRoles: UserRoles): number => {
  return Math.max(...userRoles.roles.map((role) => getRoleLevel(role)));
};

/**
 * Check if user can assign role to others
 */
export const canAssignRole = (
  userRoles: UserRoles,
  targetRole: RoleCode
): boolean => {
  // Admins can assign any role
  if (isAdmin(userRoles)) return true;

  // Users can only assign roles lower than their highest role
  const userLevel = getHighestRoleLevel(userRoles);
  const targetLevel = getRoleLevel(targetRole);

  return targetLevel < userLevel;
};

/**
 * Get roles that user can assign to others
 */
export const getAssignableRoles = (userRoles: UserRoles): RoleCode[] => {
  const userLevel = getHighestRoleLevel(userRoles);

  return (Object.keys(ROLE_HIERARCHY) as RoleCode[]).filter((role) => {
    return getRoleLevel(role) < userLevel;
  });
};

/**
 * Check if user has higher or equal role level than target
 */
export const hasHigherOrEqualRole = (
  userRoles: UserRoles,
  targetRoles: RoleCode[]
): boolean => {
  const userLevel = getHighestRoleLevel(userRoles);
  const targetLevel = Math.max(
    ...targetRoles.map((role) => getRoleLevel(role))
  );

  return userLevel >= targetLevel;
};

// =============================================================================
// RBAC CONTEXT UTILS
// =============================================================================

/**
 * Check if user belongs to tenant
 */
export const belongsToTenant = (
  userRoles: UserRoles,
  tenantId: string
): boolean => {
  return userRoles.tenantId === tenantId;
};

/**
 * Check if user is in sandbox mode
 */
export const isSandboxMode = (userRoles: UserRoles): boolean => {
  return userRoles.isSandbox === true;
};

/**
 * Validate RBAC context for operation
 */
export const validateRbacContext = (
  userRoles: UserRoles,
  requiredTenantId: string,
  requiredRoles?: RoleCode[],
  requiredPermissions?: Permission[]
): {
  isValid: boolean;
  reason?: string;
} => {
  // Check tenant context
  if (!belongsToTenant(userRoles, requiredTenantId)) {
    return {
      isValid: false,
      reason: "User does not belong to the required tenant",
    };
  }

  // Check roles if required
  if (requiredRoles && requiredRoles.length > 0) {
    if (!hasAnyRole(userRoles, requiredRoles)) {
      return {
        isValid: false,
        reason: `User must have one of these roles: ${requiredRoles.join(", ")}`,
      };
    }
  }

  // Check permissions if required
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!hasAnyPermission(userRoles, requiredPermissions)) {
      return {
        isValid: false,
        reason: `User must have one of these permissions: ${requiredPermissions.join(", ")}`,
      };
    }
  }

  return { isValid: true };
};

// =============================================================================
// RBAC FILTERING UTILS
// =============================================================================

/**
 * Filter array based on user permissions
 */
export const filterByPermission = <
  T extends { id: string; [key: string]: unknown },
>(
  items: T[],
  userRoles: UserRoles,
  getRequiredPermission: (item: T) => Permission
): T[] => {
  return items.filter((item) => {
    const requiredPermission = getRequiredPermission(item);
    return hasPermission(userRoles, requiredPermission);
  });
};

/**
 * Filter array based on user roles
 */
export const filterByRole = <T extends { allowedRoles?: RoleCode[] }>(
  items: T[],
  userRoles: UserRoles
): T[] => {
  return items.filter((item) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true; // No role restriction
    }
    return hasAnyRole(userRoles, item.allowedRoles);
  });
};

/**
 * Get accessible menu items based on user roles
 */
export const getAccessibleMenuItems = (
  menuItems: Array<{
    id: string;
    label: string;
    requiredRoles?: RoleCode[];
    requiredPermissions?: Permission[];
  }>,
  userRoles: UserRoles
) => {
  return menuItems.filter((item) => {
    // Check roles
    if (item.requiredRoles && item.requiredRoles.length > 0) {
      if (!hasAnyRole(userRoles, item.requiredRoles)) {
        return false;
      }
    }

    // Check permissions
    if (item.requiredPermissions && item.requiredPermissions.length > 0) {
      if (!hasAnyPermission(userRoles, item.requiredPermissions)) {
        return false;
      }
    }

    return true;
  });
};

// =============================================================================
// RBAC DISPLAY UTILS
// =============================================================================

/**
 * Get user role display information
 */
export const getUserRoleDisplay = (userRoles: UserRoles) => {
  const primaryRole = userRoles.roles[0]; // First role is considered primary
  const roleCount = userRoles.roles.length;

  return {
    primaryRole,
    roleCount,
    isMultiRole: roleCount > 1,
    displayText:
      roleCount > 1 ? `${primaryRole} +${roleCount - 1}` : primaryRole,
    allRoles: userRoles.roles,
    permissionCount: userRoles.permissions.length,
    tenantId: userRoles.tenantId,
    isSandbox: userRoles.isSandbox,
  };
};

/**
 * Get RBAC status summary
 */
export const getRbacStatusSummary = (userRoles: UserRoles) => {
  const roleLevel = getHighestRoleLevel(userRoles);
  const isHighPrivilege = roleLevel >= 75; // PROJECT_MANAGER or above
  const canManageUsers = hasAnyPermission(userRoles, [
    "User.create",
    "Member.assign",
  ] as Permission[]);
  const canManageRoles = hasAnyPermission(userRoles, [
    "Role.create",
    "Role.update",
  ] as Permission[]);

  return {
    level: roleLevel,
    isHighPrivilege,
    canManageUsers,
    canManageRoles,
    isAdmin: isAdmin(userRoles),
    effectivePermissions: userRoles.permissions.length,
    securityScore: calculateSecurityScore(userRoles),
  };
};

/**
 * Calculate security score based on roles and permissions
 */
export const calculateSecurityScore = (userRoles: UserRoles): number => {
  let score = 0;

  // Base score from role level
  const roleLevel = getHighestRoleLevel(userRoles);
  score += Math.min(50, roleLevel / 2);

  // Score from permission count (more specific permissions = higher score)
  const permissionScore = Math.min(30, userRoles.permissions.length / 10);
  score += permissionScore;

  // Bonus for proper tenant context
  if (userRoles.tenantId) {
    score += 10;
  }

  // Penalty for sandbox mode
  if (userRoles.isSandbox) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
};

// =============================================================================
// RBAC DEBUGGING UTILS
// =============================================================================

/**
 * Get debug information for RBAC troubleshooting
 */
export const getRbacDebugInfo = (userRoles: UserRoles) => {
  return {
    user: {
      tenantId: userRoles.tenantId,
      isSandbox: userRoles.isSandbox,
    },
    roles: {
      count: userRoles.roles.length,
      list: userRoles.roles,
      levels: userRoles.roles.map((role) => ({
        role,
        level: getRoleLevel(role),
      })),
      highest: getHighestRoleLevel(userRoles),
    },
    permissions: {
      count: userRoles.permissions.length,
      sample: userRoles.permissions.slice(0, 10), // First 10 for debugging
      byDomain: groupPermissionsByDomain(userRoles.permissions),
    },
    capabilities: {
      isAdmin: isAdmin(userRoles),
      isManager: isManagerOrHigher(userRoles),
      canAssignRoles: getAssignableRoles(userRoles),
      securityScore: calculateSecurityScore(userRoles),
    },
  };
};

/**
 * Group permissions by domain for debugging
 */
export const groupPermissionsByDomain = (permissions: Permission[]) => {
  const grouped: Record<string, Permission[]> = {};

  permissions.forEach((permission) => {
    const [domain] = permission.split(".");
    if (!grouped[domain]) {
      grouped[domain] = [];
    }
    grouped[domain].push(permission);
  });

  return grouped;
};

/**
 * Check RBAC configuration health
 */
export const checkRbacHealth = (userRoles: UserRoles) => {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check for no roles
  if (userRoles.roles.length === 0) {
    issues.push("User has no assigned roles");
  }

  // Check for no permissions
  if (userRoles.permissions.length === 0) {
    issues.push("User has no permissions");
  }

  // Check for missing tenant context
  if (!userRoles.tenantId) {
    warnings.push("User has no tenant context");
  }

  // Check for excessive permissions
  if (userRoles.permissions.length > 500) {
    warnings.push("User has excessive permissions (>500)");
  }

  // Check for conflicting roles
  const hasViewerAndAdmin =
    userRoles.roles.includes("VIEWER") && userRoles.roles.includes("ADMIN");
  if (hasViewerAndAdmin) {
    warnings.push("User has conflicting roles (VIEWER and ADMIN)");
  }

  return {
    isHealthy: issues.length === 0,
    issues,
    warnings,
    score: calculateSecurityScore(userRoles),
  };
};
