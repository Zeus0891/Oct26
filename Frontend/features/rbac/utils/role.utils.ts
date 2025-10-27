/**
 * Role Utils
 * Utility functions for role management and operations
 * Aligned with backend role architecture
 */

import { RoleCode } from "../types/rbac.generated";

// =============================================================================
// ROLE INFORMATION UTILS
// =============================================================================

/**
 * Get role display information
 */
export const getRoleDisplayInfo = (roleCode: RoleCode) => {
  const roleInfo: Record<
    RoleCode,
    {
      name: string;
      description: string;
      color: string;
      icon: string;
      level: number;
    }
  > = {
    ADMIN: {
      name: "Administrator",
      description: "Full system access and management capabilities",
      color: "red",
      icon: "crown",
      level: 100,
    },
    PROJECT_MANAGER: {
      name: "Project Manager",
      description: "Project oversight and team management",
      color: "blue",
      icon: "briefcase",
      level: 75,
    },
    WORKER: {
      name: "Worker",
      description: "Field operations and task execution",
      color: "green",
      icon: "hard-hat",
      level: 50,
    },
    VIEWER: {
      name: "Viewer",
      description: "Read-only access for observers",
      color: "gray",
      icon: "eye",
      level: 25,
    },
    DRIVER: {
      name: "Driver",
      description: "Transportation and delivery operations",
      color: "orange",
      icon: "truck",
      level: 25,
    },
  };

  return (
    roleInfo[roleCode] || {
      name: roleCode,
      description: "Unknown role",
      color: "gray",
      icon: "user",
      level: 0,
    }
  );
};

/**
 * Get role hierarchy level
 */
export const getRoleLevel = (roleCode: RoleCode): number => {
  return getRoleDisplayInfo(roleCode).level;
};

/**
 * Get role color for UI theming
 */
export const getRoleColor = (roleCode: RoleCode): string => {
  return getRoleDisplayInfo(roleCode).color;
};

/**
 * Get role icon for UI display
 */
export const getRoleIcon = (roleCode: RoleCode): string => {
  return getRoleDisplayInfo(roleCode).icon;
};

/**
 * Check if role is administrative
 */
export const isAdministrativeRole = (roleCode: RoleCode): boolean => {
  return ["ADMIN", "PROJECT_MANAGER"].includes(roleCode);
};

/**
 * Check if role is operational
 */
export const isOperationalRole = (roleCode: RoleCode): boolean => {
  return ["WORKER", "DRIVER"].includes(roleCode);
};

/**
 * Check if role is observer-only
 */
export const isObserverRole = (roleCode: RoleCode): boolean => {
  return roleCode === "VIEWER";
};

// =============================================================================
// ROLE HIERARCHY UTILS
// =============================================================================

/**
 * Sort roles by hierarchy level (highest first)
 */
export const sortRolesByLevel = (roles: RoleCode[]): RoleCode[] => {
  return [...roles].sort((a, b) => getRoleLevel(b) - getRoleLevel(a));
};

/**
 * Get highest role from array
 */
export const getHighestRole = (roles: RoleCode[]): RoleCode | null => {
  if (roles.length === 0) return null;
  return sortRolesByLevel(roles)[0];
};

/**
 * Get lowest role from array
 */
export const getLowestRole = (roles: RoleCode[]): RoleCode | null => {
  if (roles.length === 0) return null;
  const sorted = sortRolesByLevel(roles);
  return sorted[sorted.length - 1];
};

/**
 * Check if first role is higher than second role
 */
export const isHigherRole = (role1: RoleCode, role2: RoleCode): boolean => {
  return getRoleLevel(role1) > getRoleLevel(role2);
};

/**
 * Check if first role is lower than second role
 */
export const isLowerRole = (role1: RoleCode, role2: RoleCode): boolean => {
  return getRoleLevel(role1) < getRoleLevel(role2);
};

/**
 * Check if roles are at same level
 */
export const isSameLevel = (role1: RoleCode, role2: RoleCode): boolean => {
  return getRoleLevel(role1) === getRoleLevel(role2);
};

/**
 * Get roles that are lower than given role
 */
export const getLowerRoles = (
  roleCode: RoleCode,
  allRoles: RoleCode[]
): RoleCode[] => {
  const roleLevel = getRoleLevel(roleCode);
  return allRoles.filter((role) => getRoleLevel(role) < roleLevel);
};

/**
 * Get roles that are higher than given role
 */
export const getHigherRoles = (
  roleCode: RoleCode,
  allRoles: RoleCode[]
): RoleCode[] => {
  const roleLevel = getRoleLevel(roleCode);
  return allRoles.filter((role) => getRoleLevel(role) > roleLevel);
};

/**
 * Get roles at same level as given role
 */
export const getSameLevelRoles = (
  roleCode: RoleCode,
  allRoles: RoleCode[]
): RoleCode[] => {
  const roleLevel = getRoleLevel(roleCode);
  return allRoles.filter(
    (role) => getRoleLevel(role) === roleLevel && role !== roleCode
  );
};

// =============================================================================
// ROLE CAPABILITY UTILS
// =============================================================================

/**
 * Check if role can manage users
 */
export const canManageUsers = (roleCode: RoleCode): boolean => {
  return ["ADMIN", "PROJECT_MANAGER"].includes(roleCode);
};

/**
 * Check if role can assign other roles
 */
export const canAssignRoles = (roleCode: RoleCode): boolean => {
  return roleCode === "ADMIN";
};

/**
 * Check if role can manage projects
 */
export const canManageProjects = (roleCode: RoleCode): boolean => {
  return ["ADMIN", "PROJECT_MANAGER"].includes(roleCode);
};

/**
 * Check if role can execute tasks
 */
export const canExecuteTasks = (roleCode: RoleCode): boolean => {
  return ["ADMIN", "PROJECT_MANAGER", "WORKER"].includes(roleCode);
};

/**
 * Check if role can view reports
 */
export const canViewReports = (roleCode: RoleCode): boolean => {
  return ["ADMIN", "PROJECT_MANAGER", "VIEWER"].includes(roleCode);
};

/**
 * Check if role has financial access
 */
export const hasFinancialAccess = (roleCode: RoleCode): boolean => {
  return ["ADMIN"].includes(roleCode);
};

/**
 * Get role capabilities summary
 */
export const getRoleCapabilities = (roleCode: RoleCode) => {
  return {
    manageUsers: canManageUsers(roleCode),
    assignRoles: canAssignRoles(roleCode),
    manageProjects: canManageProjects(roleCode),
    executeTasks: canExecuteTasks(roleCode),
    viewReports: canViewReports(roleCode),
    financialAccess: hasFinancialAccess(roleCode),
    level: getRoleLevel(roleCode),
    isAdmin: roleCode === "ADMIN",
    isManager: isAdministrativeRole(roleCode),
    isWorker: isOperationalRole(roleCode),
    isViewer: isObserverRole(roleCode),
  };
};

// =============================================================================
// ROLE VALIDATION UTILS
// =============================================================================

/**
 * Validate role assignment permissions
 */
export const validateRoleAssignment = (
  assignerRole: RoleCode,
  targetRole: RoleCode
): {
  canAssign: boolean;
  reason?: string;
} => {
  // Admin can assign any role
  if (assignerRole === "ADMIN") {
    return { canAssign: true };
  }

  // Project managers can assign worker and viewer roles
  if (assignerRole === "PROJECT_MANAGER") {
    if (["WORKER", "VIEWER", "DRIVER"].includes(targetRole)) {
      return { canAssign: true };
    }
    return {
      canAssign: false,
      reason:
        "Project managers can only assign WORKER, VIEWER, or DRIVER roles",
    };
  }

  // Other roles cannot assign roles
  return {
    canAssign: false,
    reason: "Only ADMIN and PROJECT_MANAGER roles can assign roles to others",
  };
};

/**
 * Check if role combination is valid
 */
export const isValidRoleCombination = (
  roles: RoleCode[]
): {
  isValid: boolean;
  conflicts: string[];
  warnings: string[];
} => {
  const conflicts: string[] = [];
  const warnings: string[] = [];

  // Check for conflicting roles
  if (roles.includes("ADMIN") && roles.includes("VIEWER")) {
    conflicts.push(
      "ADMIN and VIEWER roles conflict - ADMIN has full access while VIEWER is read-only"
    );
  }

  if (roles.includes("PROJECT_MANAGER") && roles.includes("WORKER")) {
    warnings.push(
      "PROJECT_MANAGER and WORKER combination may have overlapping permissions"
    );
  }

  // Check for redundant roles
  if (roles.includes("ADMIN") && roles.includes("PROJECT_MANAGER")) {
    warnings.push(
      "PROJECT_MANAGER role is redundant when ADMIN role is present"
    );
  }

  // Check for multiple viewer-level roles
  const viewerLevelRoles = roles.filter((role) => getRoleLevel(role) === 25);
  if (viewerLevelRoles.length > 1) {
    warnings.push(
      `Multiple viewer-level roles assigned: ${viewerLevelRoles.join(", ")}`
    );
  }

  return {
    isValid: conflicts.length === 0,
    conflicts,
    warnings,
  };
};

/**
 * Optimize role assignment by removing redundant roles
 */
export const optimizeRoles = (
  roles: RoleCode[]
): {
  optimized: RoleCode[];
  removed: RoleCode[];
  reason: string[];
} => {
  const removed: RoleCode[] = [];
  const reason: string[] = [];
  let optimized = [...roles];

  // Remove redundant lower roles if admin is present
  if (roles.includes("ADMIN")) {
    const toRemove = roles.filter((role) => role !== "ADMIN");
    removed.push(...toRemove);
    reason.push("Removed all other roles as ADMIN provides full access");
    optimized = ["ADMIN"];
  }
  // Remove redundant worker roles if project manager is present
  else if (roles.includes("PROJECT_MANAGER")) {
    const redundantRoles = ["WORKER", "VIEWER", "DRIVER"];
    const toRemove = roles.filter((role) => redundantRoles.includes(role));
    if (toRemove.length > 0) {
      removed.push(...toRemove);
      reason.push(
        "Removed worker-level roles as PROJECT_MANAGER provides broader access"
      );
      optimized = optimized.filter((role) => !redundantRoles.includes(role));
    }
  }

  return { optimized, removed, reason };
};

// =============================================================================
// ROLE COMPARISON UTILS
// =============================================================================

/**
 * Compare role privileges
 */
export const compareRoles = (role1: RoleCode, role2: RoleCode) => {
  const level1 = getRoleLevel(role1);
  const level2 = getRoleLevel(role2);

  return {
    role1: {
      code: role1,
      ...getRoleDisplayInfo(role1),
      level: level1,
    },
    role2: {
      code: role2,
      ...getRoleDisplayInfo(role2),
      level: level2,
    },
    comparison: {
      higher: level1 > level2 ? role1 : level2 > level1 ? role2 : null,
      difference: Math.abs(level1 - level2),
      relationship:
        level1 > level2
          ? `${role1} is higher than ${role2}`
          : level2 > level1
            ? `${role2} is higher than ${role1}`
            : `${role1} and ${role2} are at the same level`,
    },
  };
};

/**
 * Get role transition impact
 */
export const getRoleTransitionImpact = (
  fromRole: RoleCode,
  toRole: RoleCode
): {
  type: "promotion" | "demotion" | "lateral" | "none";
  impact: "high" | "medium" | "low" | "none";
  description: string;
  levelChange: number;
} => {
  if (fromRole === toRole) {
    return {
      type: "none",
      impact: "none",
      description: "No role change",
      levelChange: 0,
    };
  }

  const fromLevel = getRoleLevel(fromRole);
  const toLevel = getRoleLevel(toRole);
  const levelChange = toLevel - fromLevel;

  let type: "promotion" | "demotion" | "lateral";
  let impact: "high" | "medium" | "low";
  let description: string;

  if (levelChange > 0) {
    type = "promotion";
    impact = levelChange >= 50 ? "high" : levelChange >= 25 ? "medium" : "low";
    description = `Promotion from ${fromRole} to ${toRole} (+${levelChange} levels)`;
  } else if (levelChange < 0) {
    type = "demotion";
    impact =
      Math.abs(levelChange) >= 50
        ? "high"
        : Math.abs(levelChange) >= 25
          ? "medium"
          : "low";
    description = `Demotion from ${fromRole} to ${toRole} (${levelChange} levels)`;
  } else {
    type = "lateral";
    impact = "low";
    description = `Lateral move from ${fromRole} to ${toRole} (same level)`;
  }

  return { type, impact, description, levelChange };
};

// =============================================================================
// ROLE DISPLAY UTILS
// =============================================================================

/**
 * Format roles for display
 */
export const formatRolesForDisplay = (roles: RoleCode[]) => {
  if (roles.length === 0) return "No roles assigned";
  if (roles.length === 1) return getRoleDisplayInfo(roles[0]).name;

  const sorted = sortRolesByLevel(roles);
  const primary = sorted[0];
  const others = sorted.length - 1;

  return `${getRoleDisplayInfo(primary).name} +${others}`;
};

/**
 * Create role badge data for UI
 */
export const createRoleBadge = (roleCode: RoleCode) => {
  const info = getRoleDisplayInfo(roleCode);

  return {
    code: roleCode,
    name: info.name,
    color: info.color,
    icon: info.icon,
    level: info.level,
    className: `role-badge role-${roleCode.toLowerCase()}`,
    style: {
      backgroundColor: `var(--${info.color}-100)`,
      color: `var(--${info.color}-800)`,
      border: `1px solid var(--${info.color}-300)`,
    },
  };
};

/**
 * Group roles by category
 */
export const groupRolesByCategory = (roles: RoleCode[]) => {
  return {
    administrative: roles.filter(isAdministrativeRole),
    operational: roles.filter(isOperationalRole),
    observer: roles.filter(isObserverRole),
  };
};

/**
 * Get role summary statistics
 */
export const getRoleSummaryStats = (roles: RoleCode[]) => {
  const categories = groupRolesByCategory(roles);
  const levels = roles.map(getRoleLevel);
  const maxLevel = Math.max(...levels, 0);
  const avgLevel =
    levels.length > 0
      ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length)
      : 0;

  return {
    total: roles.length,
    categories: {
      administrative: categories.administrative.length,
      operational: categories.operational.length,
      observer: categories.observer.length,
    },
    levels: {
      highest: maxLevel,
      average: avgLevel,
      distribution: roles.map((role) => ({ role, level: getRoleLevel(role) })),
    },
    primaryRole: getHighestRole(roles),
    hasAdmin: roles.includes("ADMIN"),
    hasManager: roles.includes("PROJECT_MANAGER"),
    isMultiRole: roles.length > 1,
  };
};
