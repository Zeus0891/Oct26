/**
 * Permission Types - Permission definition and management system
 *
 * Depends on Prisma Tables: Permission, RolePermission
 * Depends on Prisma Enums: PermissionScope, PermissionAction
 *
 * Purpose: Permission catalog metadata, integrates with auto-generated RBAC schema and business rules
 */

/**
 * Permission scope enumeration
 * Defines the scope level where permission applies
 */
export type PermissionScopeType =
  | "GLOBAL"
  | "TENANT"
  | "PROJECT"
  | "DEPARTMENT"
  | "TEAM"
  | "RESOURCE";

/**
 * Permission action enumeration
 * Defines the type of action the permission allows
 */
export type PermissionActionType =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "EXECUTE"
  | "APPROVE"
  | "ASSIGN"
  | "TRANSFER";

/**
 * Permission category enumeration
 * Groups permissions by functional area
 */
export type PermissionCategoryType =
  | "SYSTEM"
  | "TENANT"
  | "USER_MANAGEMENT"
  | "FINANCIAL"
  | "PROJECT"
  | "REPORTING"
  | "INTEGRATION"
  | "COMPLIANCE";

/**
 * Enhanced permission definition
 * Maps to Prisma Permission table with additional metadata
 */
export interface PermissionDefinition {
  /** Permission identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Permission name/key */
  name: string;
  /** Permission display name */
  displayName: string;
  /** Permission description */
  description?: string;
  /** Permission category */
  category: PermissionCategoryType;
  /** Permission scope */
  scope: PermissionScopeType;
  /** Permission action */
  action: PermissionActionType;
  /** Resource this permission applies to */
  resource: string;
  /** Sub-resource or specific entity */
  subResource?: string;
  /** Whether permission is active */
  isActive: boolean;
  /** Whether permission is system-defined */
  isSystem: boolean;
  /** Permission constraints/conditions */
  constraints?: PermissionConstraints;
  /** Permission metadata */
  metadata?: Record<string, unknown>;
  /** Permission tags for grouping */
  tags?: string[];
}

/**
 * Permission constraints
 * Defines conditions and limitations for permission usage
 */
export interface PermissionConstraints {
  /** Field-level access restrictions */
  fieldConstraints?: FieldConstraint[];
  /** Data filter conditions */
  dataFilters?: DataFilter[];
  /** Time-based restrictions */
  timeConstraints?: TimeConstraint[];
  /** IP-based restrictions */
  ipConstraints?: IPConstraint[];
  /** Device-based restrictions */
  deviceConstraints?: DeviceConstraint[];
  /** Custom constraint expressions */
  customConstraints?: Record<string, unknown>;
}

/**
 * Field-level access constraint
 * Defines which fields can be accessed with this permission
 */
export interface FieldConstraint {
  /** Entity/table name */
  entity: string;
  /** Allowed fields for read operations */
  readableFields?: string[];
  /** Allowed fields for write operations */
  writableFields?: string[];
  /** Explicitly denied fields */
  deniedFields?: string[];
  /** Field masking rules */
  maskingRules?: FieldMaskingRule[];
}

/**
 * Field masking rule
 * Defines how sensitive fields should be masked
 */
export interface FieldMaskingRule {
  /** Field name to mask */
  fieldName: string;
  /** Masking type */
  maskingType: "FULL" | "PARTIAL" | "HASH" | "REDACT";
  /** Characters to show (for partial masking) */
  visibleCharacters?: number;
  /** Replacement character */
  replacementChar?: string;
}

/**
 * Data filter constraint
 * Defines data filtering rules for permission scope
 */
export interface DataFilter {
  /** Entity/table to filter */
  entity: string;
  /** Filter field */
  field: string;
  /** Filter operator */
  operator:
    | "EQUALS"
    | "IN"
    | "NOT_IN"
    | "GREATER_THAN"
    | "LESS_THAN"
    | "CONTAINS"
    | "STARTS_WITH";
  /** Filter value */
  value: unknown;
  /** Logical connector with other filters */
  connector?: "AND" | "OR";
}

/**
 * Time-based constraint
 * Defines when permission can be used
 */
export interface TimeConstraint {
  /** Start time (24-hour format) */
  startTime?: string;
  /** End time (24-hour format) */
  endTime?: string;
  /** Allowed days of week */
  allowedDays?: number[];
  /** Timezone for time constraints */
  timezone?: string;
  /** Holiday restrictions */
  excludeHolidays?: boolean;
}

/**
 * IP address constraint
 * Defines IP-based access restrictions
 */
export interface IPConstraint {
  /** Allowed IP addresses */
  allowedIPs?: string[];
  /** Denied IP addresses */
  deniedIPs?: string[];
  /** Allowed IP ranges (CIDR notation) */
  allowedRanges?: string[];
  /** Denied IP ranges (CIDR notation) */
  deniedRanges?: string[];
}

/**
 * Device-based constraint
 * Defines device access restrictions
 */
export interface DeviceConstraint {
  /** Allowed device types */
  allowedDeviceTypes?: string[];
  /** Denied device types */
  deniedDeviceTypes?: string[];
  /** Require trusted devices */
  requireTrustedDevice?: boolean;
  /** Device fingerprint requirements */
  deviceFingerprintRequired?: boolean;
}

/**
 * Permission evaluation context
 * Context used when evaluating permission grants
 */
export interface PermissionEvaluationContext {
  /** Member requesting permission */
  memberId: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Resource being accessed */
  resource: string;
  /** Resource identifier */
  resourceId?: string;
  /** Action being performed */
  action: PermissionActionType;
  /** Current timestamp */
  timestamp: Date;
  /** Client IP address */
  ipAddress?: string;
  /** Device information */
  deviceInfo?: {
    type: string;
    fingerprint?: string;
    isTrusted: boolean;
  };
  /** Additional context data */
  contextData?: Record<string, unknown>;
}

/**
 * Permission evaluation result
 * Result of permission evaluation
 */
export interface PermissionEvaluationResult {
  /** Whether permission is granted */
  granted: boolean;
  /** Granting permission */
  permission?: PermissionDefinition;
  /** Applied constraints */
  appliedConstraints?: PermissionConstraints;
  /** Evaluation reason */
  reason?: string;
  /** Failed constraints (if denied) */
  failedConstraints?: string[];
  /** Evaluation metadata */
  metadata?: Record<string, unknown>;
  /** Evaluation timestamp */
  evaluatedAt: Date;
}

/**
 * Permission grant summary
 * Summarized view of granted permissions
 */
export interface PermissionGrantSummary {
  /** Member identifier */
  memberId: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Granted permissions by resource */
  permissionsByResource: Record<string, PermissionDefinition[]>;
  /** Granted permissions by category */
  permissionsByCategory: Record<string, PermissionDefinition[]>;
  /** Total permission count */
  totalPermissions: number;
  /** System permissions count */
  systemPermissions: number;
  /** Custom permissions count */
  customPermissions: number;
  /** Last evaluated timestamp */
  lastEvaluatedAt: Date;
}

/**
 * Permission template
 * Template for creating permission sets
 */
export interface PermissionTemplate {
  /** Template identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string;
  /** Template category */
  category: string;
  /** Permissions in this template */
  permissions: PermissionDefinition[];
  /** Whether template is active */
  isActive: boolean;
  /** Whether template is system-defined */
  isSystem: boolean;
  /** Template metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Permission audit entry
 * Audit trail for permission usage
 */
export interface PermissionAuditEntry {
  /** Audit entry identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Member who used the permission */
  memberId: string;
  /** Permission used */
  permissionId: string;
  /** Resource accessed */
  resource: string;
  /** Resource identifier */
  resourceId?: string;
  /** Action performed */
  action: PermissionActionType;
  /** Whether access was granted */
  granted: boolean;
  /** Access timestamp */
  accessedAt: Date;
  /** Client IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
  /** Session identifier */
  sessionId?: string;
  /** Additional audit data */
  auditData?: Record<string, unknown>;
}
