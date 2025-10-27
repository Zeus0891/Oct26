/**
 * RBAC Utils Index
 * Centralized exports for all RBAC utility functions
 */

// General RBAC utilities (with rbac prefix for main functions)
export {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  isManagerOrHigher,
  canRead,
  canWrite,
  canDelete,
  getRoleLevel as rbacGetRoleLevel,
  getHighestRoleLevel,
  canAssignRole,
  getAssignableRoles,
  hasHigherOrEqualRole,
  belongsToTenant,
  isSandboxMode,
  validateRbacContext,
  filterByPermission,
  filterByRole,
  getAccessibleMenuItems,
  getUserRoleDisplay,
  getRbacStatusSummary,
  calculateSecurityScore,
  getRbacDebugInfo,
  groupPermissionsByDomain,
  checkRbacHealth,
} from "./rbac.utils";

// Permission-specific utilities
export * from "./permission.utils";

// Role-specific utilities (with role prefix for conflicting names)
export {
  getRoleDisplayInfo,
  getRoleLevel,
  getRoleColor,
  getRoleIcon,
  isAdministrativeRole,
  isOperationalRole,
  isObserverRole,
  sortRolesByLevel,
  getHighestRole,
  getLowestRole,
  isHigherRole,
  isLowerRole,
  isSameLevel,
  getLowerRoles,
  getHigherRoles,
  getSameLevelRoles,
  canManageUsers,
  canAssignRoles,
  canManageProjects,
  canExecuteTasks,
  canViewReports,
  hasFinancialAccess,
  getRoleCapabilities,
  validateRoleAssignment,
  isValidRoleCombination,
  optimizeRoles,
  compareRoles,
  getRoleTransitionImpact,
  formatRolesForDisplay,
  createRoleBadge,
  groupRolesByCategory,
  getRoleSummaryStats,
} from "./role.utils";
