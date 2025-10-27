/**
 * RBAC Types Index
 * Centralized exports for all RBAC type definitions
 */

// Auto-generated types from RBAC.schema.v7.yml
export * from "./rbac.generated";

// Manual type extensions and additional interfaces (no conflicts)
export type {
  PermissionCondition,
  PermissionEntity,
  PermissionScope,
  RoleDefinition,
  UserRoles,
  AuthGuardProps,
  ConditionalGuardProps,
} from "./rbac.types";

// Export enums and functions separately to avoid conflicts
export {
  Domain,
  Action,
  createPermission,
  parsePermission,
} from "./rbac.types";

// Member settings types
export * from "./member-settings.types";
