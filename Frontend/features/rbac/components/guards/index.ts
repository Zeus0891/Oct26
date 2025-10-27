/**
 * RBAC Guards Index
 * Centralized exports for all RBAC guard components
 */

// Main Guards
export {
  default as TenantGuard,
  useTenantGuard,
  useCurrentTenant,
  withTenantGuard,
} from "./TenantGuard";
// Note: RoleGuard components are implemented as utility functions in hooks
// They will be available through useRbac hook
export {
  default as PermissionGuard,
  ProjectAccess,
  InvoiceAccess,
  TaskAccess,
  UserAccess,
  MemberAccess,
  usePermissionAccess,
  usePermissionCheck,
  withPermissionGuard,
} from "./PermissionGuard";
export {
  default as ConditionalGuard,
  BusinessHoursGuard,
  FeatureToggleGuard,
  OwnershipGuard,
  withConditionalGuard,
} from "./ConditionalGuard";
export { RoleGuard } from "./RoleGuard";
