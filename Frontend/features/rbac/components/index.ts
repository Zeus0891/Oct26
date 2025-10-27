/**
 * RBAC Components Index
 * Centralized exports for all RBAC components
 */

// Guards
export * from "./guards";

// Providers
export * from "./providers";

// Forms
export * from "./forms";

// UI Components
export * from "./ui";

// Re-export main components for convenience
export {
  TenantGuard,
  PermissionGuard,
  ConditionalGuard,
  RoleGuard,
} from "./guards";
export { RBACProvider } from "./providers";
export { UserManagementPanel, RoleManagementPanel } from "./ui";

// Modals
export { MemberSettingsModal } from "./modals/MemberSettingsModal";

// Forms
export { MemberRoleForm, QuickRoleAssign } from "./forms/MemberRoleForm";
export { PermissionForm } from "./forms/PermissionForm";
export {
  RoleAssignmentForm,
  SingleRoleAssignment,
  AdminRoleAssignment,
} from "./forms/RoleAssignmentForm";

// UI Components (specific exports)
export {
  RoleBadge,
  AdminBadge,
  RoleBadgeGroup,
  InteractiveRoleBadge,
  RoleBadgeWithTooltip,
} from "./ui/RoleBadge";
export {
  RoleSelector,
  SingleRoleSelector,
  MultipleRoleSelector,
  AdminRoleSelector,
} from "./ui/RoleSelector";
export {
  PermissionList,
  ReadOnlyPermissionList,
  PermissionPicker,
} from "./ui/PermissionList";
export {
  PermissionMatrix,
  RolePermissionMatrix,
  EditablePermissionMatrix,
} from "./ui/PermissionMatrix";
