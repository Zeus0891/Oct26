/**
 * RBAC Types (Manual)
 * Manual type definitions for RBAC system
 * Works in conjunction with rbac.generated.ts
 */

// Re-export from generated types
export type { RoleCode, Permission, Role } from "./rbac.generated";
export { ROLES, ROLE_PERMISSIONS } from "./rbac.generated";

// Import types for use in this file
import type { RoleCode, Permission } from "./rbac.generated";

// =============================================================================
// PERMISSION TYPES
// =============================================================================

export interface PermissionCondition {
  field: string;
  operator: "equals" | "not_equals" | "in" | "not_in";
  value: string | number | boolean | string[];
}

// Core permission entity structure aligned with backend
export interface PermissionEntity {
  id: string;
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  scope: PermissionScope;
  conditions?: PermissionCondition[];
}

export type PermissionScope =
  | "GLOBAL"
  | "TENANT"
  | "PROJECT"
  | "ESTIMATE"
  | "INVOICE"
  | "TASK"
  | "INVENTORY";

export interface RoleDefinition {
  code: RoleCode;
  name: string;
  description: string;
  scope: "TENANT";
}

// ROLE_DEFINITIONS is available as ROLES from rbac.generated.ts
// Use ROLES export instead of duplicating definitions here

// =============================================================================
// DOMAINS (from schema v7)
// =============================================================================
export enum Domain {
  TENANT_MANAGEMENT = "tenant_management",
  IDENTITY_ACCESS = "identity_access",
  RBAC_SECURITY = "rbac_security",
  CRM_SALES = "crm_sales",
  PROJECT_MANAGEMENT = "project_management",
  TASK_EXECUTION = "task_execution",
  FINANCIAL_OPERATIONS = "financial_operations",
  TIME_SCHEDULING = "time_scheduling",
  INVENTORY_ASSETS = "inventory_assets",
  COMMUNICATION = "communication",
  DOCUMENT_MANAGEMENT = "document_management",
  HR_EMPLOYMENT = "hr_employment",
  AI_AUTOMATION = "ai_automation",
  VENDOR_CONTRACT = "vendor_contract",
  INTEGRATIONS_WEBHOOKS = "integrations_webhooks",
  SYSTEM_CONFIG = "system_config",
  AUDIT_COMPLIANCE = "audit_compliance",
  DATA_EXPORT_REPORTING = "data_export_reporting",
  APPROVAL_WORKFLOWS = "approval_workflows",
}

// =============================================================================
// ACTIONS (from schema v7)
// =============================================================================
export enum Action {
  // Read Operations
  READ = "read",
  LIST = "list",
  EXPORT = "export",

  // Write Operations
  CREATE = "create",
  UPDATE = "update",
  DUPLICATE = "duplicate",

  // Lifecycle Management
  SOFT_DELETE = "soft_delete",
  RESTORE = "restore",
  HARD_DELETE = "hard_delete",
  ARCHIVE = "archive",
  ACTIVATE = "activate",
  DEACTIVATE = "deactivate",

  // Assignment & Relationships
  ASSIGN = "assign",
  UNASSIGN = "unassign",
  TRANSFER = "transfer",

  // Approval & Status
  SUBMIT = "submit",
  APPROVE = "approve",
  REJECT = "reject",
  REVIEW = "review",

  // Specialized Actions
  SEND = "send",
  PUBLISH = "publish",
  LOCK = "lock",
  UNLOCK = "unlock",
  SYNC = "sync",
}

// =============================================================================
// PERMISSION STRUCTURE
// =============================================================================
export interface UserRoles {
  roles: RoleCode[];
  permissions: Permission[];
  tenantId: string;
  isSandbox?: boolean;
}

// =============================================================================
// GUARD TYPES
// =============================================================================
export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export interface RoleGuardProps extends AuthGuardProps {
  roles: RoleCode | RoleCode[];
  requireAll?: boolean; // true = must have ALL roles, false = must have ANY role
}

export interface PermissionGuardProps extends AuthGuardProps {
  permission: Permission | Permission[];
  requireAll?: boolean; // true = must have ALL permissions, false = must have ANY permission
}

export interface ConditionalGuardProps extends AuthGuardProps {
  condition: (user: UserRoles) => boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
export const createPermission = (model: string, action: Action): Permission => {
  return `${model}.${action}` as Permission;
};

export const parsePermission = (
  permission: Permission
): { model: string; action: Action } => {
  const [model, action] = permission.split(".");
  return { model, action: action as Action };
};

// =============================================================================
// ROLE PERMISSION MAPPINGS (Key Examples from Schema)
// =============================================================================
// ROLE_PERMISSIONS is available from rbac.generated.ts
// Use ROLE_PERMISSIONS export from generated file
