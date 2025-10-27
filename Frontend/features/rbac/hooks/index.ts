/**
 * RBAC Hooks Index
 * Centralized exports for all RBAC hooks
 */

// Core RBAC hooks
export { useRbac, useRoleCheck, usePermissionCheck } from "./useRbac";

// Management hooks
export { default as useRoles } from "./useRoles";
export { default as useMembers } from "./useMembers";
export { default as usePermissions } from "./usePermissions";
export { useMemberSettings } from "./useMemberSettings";

// Context hooks
export {
  default as useTenantContext,
  useCurrentTenant,
  useAvailableTenants,
  useTenantSwitcher,
  useTenantPermissions,
} from "./useTenantContext";
