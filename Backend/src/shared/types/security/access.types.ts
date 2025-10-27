/**
 * Access Types - RBAC semantic layer and access control
 *
 * Depends on Prisma Tables: Role, Permission, RolePermission, Member, MemberRole
 * Depends on Prisma Enums: PermissionScope, RoleType, AssignmentScope
 *
 * Purpose: RBAC semantic layer aligned with actual database functions (rls.*) and role hierarchy
 */

import type {
  PermissionScope,
  RoleType,
  AssignmentScope,
} from "@prisma/client";

/**
 * Access profile for a member
 * Complete access control information for authorization decisions
 */
export interface AccessProfile {
  /** Member identifier */
  memberId: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Member roles with assignments */
  roles: MemberRoleAssignment[];
  /** Effective permissions */
  permissions: EffectivePermission[];
  /** Access capabilities */
  capabilities: AccessCapability[];
  /** Access constraints */
  constraints: AccessConstraint[];
  /** Profile last updated */
  lastUpdated: Date;
  /** Profile cache expiry */
  expiresAt?: Date;
}

/**
 * Member role assignment with context
 * Role assignment with scope and context information
 */
export interface MemberRoleAssignment {
  /** Assignment identifier */
  assignmentId: string;
  /** Role identifier */
  roleId: string;
  /** Role name */
  roleName: string;
  /** Role type */
  roleType: RoleType;
  /** Assignment scope */
  scope: AssignmentScope;
  /** Assignment context (project, department, etc.) */
  contextId?: string;
  /** Context name */
  contextName?: string;
  /** Assignment effective from */
  effectiveFrom?: Date;
  /** Assignment effective to */
  effectiveTo?: Date;
  /** Whether assignment is active */
  isActive: boolean;
  /** Assignment metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Effective permission with source tracing
 * Permission with information about how it was granted
 */
export interface EffectivePermission {
  /** Permission identifier */
  permissionId: string;
  /** Permission name */
  permissionName: string;
  /** Permission scope */
  scope: PermissionScope;
  /** Resource this permission applies to */
  resource: string;
  /** Action this permission allows */
  action: string;
  /** Granting role */
  grantingRole: string;
  /** Assignment scope that granted this permission */
  grantingScope: AssignmentScope;
  /** Context where permission is effective */
  contextId?: string;
  /** Permission constraints */
  constraints?: Record<string, unknown>;
  /** Whether permission is inherited */
  isInherited: boolean;
  /** Permission effective from */
  effectiveFrom?: Date;
  /** Permission effective to */
  effectiveTo?: Date;
}

/**
 * Access capability
 * Higher-level capability composed of multiple permissions
 */
export interface AccessCapability {
  /** Capability identifier */
  id: string;
  /** Capability name */
  name: string;
  /** Capability description */
  description?: string;
  /** Resource this capability applies to */
  resource: string;
  /** Actions included in this capability */
  actions: string[];
  /** Required permissions */
  requiredPermissions: string[];
  /** Capability scope */
  scope: AssignmentScope;
  /** Context where capability is effective */
  contextId?: string;
  /** Granting role */
  grantingRole: string;
  /** Capability metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Access constraint
 * Limitation or condition on access rights
 */
export interface AccessConstraint {
  /** Constraint identifier */
  id: string;
  /** Constraint type */
  type: "TIME" | "IP" | "DEVICE" | "LOCATION" | "DATA" | "FIELD" | "CUSTOM";
  /** Constraint description */
  description?: string;
  /** Target resource */
  resource?: string;
  /** Constraint configuration */
  configuration: Record<string, unknown>;
  /** Whether constraint is active */
  isActive: boolean;
  /** Constraint effective from */
  effectiveFrom?: Date;
  /** Constraint effective to */
  effectiveTo?: Date;
  /** Source of constraint (role, policy, etc.) */
  source: string;
}

/**
 * Access request for authorization
 * Request to check access to a resource
 */
export interface AccessRequest {
  /** Member requesting access */
  memberId: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Resource being accessed */
  resource: string;
  /** Resource identifier */
  resourceId?: string;
  /** Action being performed */
  action: string;
  /** Request context */
  context?: AccessRequestContext;
  /** Additional request data */
  requestData?: Record<string, unknown>;
}

/**
 * Access request context
 * Context information for access requests
 */
export interface AccessRequestContext {
  /** Project context */
  projectId?: string;
  /** Department context */
  departmentId?: string;
  /** Team context */
  teamId?: string;
  /** Client IP address */
  ipAddress?: string;
  /** Device information */
  deviceInfo?: {
    type: string;
    fingerprint?: string;
    isTrusted: boolean;
  };
  /** Session information */
  sessionId?: string;
  /** Request timestamp */
  timestamp: Date;
  /** User agent */
  userAgent?: string;
  /** Additional context */
  customContext?: Record<string, unknown>;
}

/**
 * Access decision result
 * Result of access authorization check
 */
export interface AccessDecision {
  /** Whether access is granted */
  granted: boolean;
  /** Decision reason */
  reason: string;
  /** Granting permission (if granted) */
  grantingPermission?: EffectivePermission;
  /** Applied constraints */
  appliedConstraints?: AccessConstraint[];
  /** Failed constraints (if denied) */
  failedConstraints?: AccessConstraint[];
  /** Decision confidence score */
  confidence?: number;
  /** Decision metadata */
  metadata?: Record<string, unknown>;
  /** Decision timestamp */
  decidedAt: Date;
  /** Decision cache TTL */
  cacheTtl?: number;
}

/**
 * Permission grant definition
 * Defines how permissions are granted through roles
 */
export interface PermissionGrant {
  /** Grant identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Role granting the permission */
  roleId: string;
  /** Permission being granted */
  permissionId: string;
  /** Grant scope */
  scope: AssignmentScope;
  /** Grant conditions */
  conditions?: GrantCondition[];
  /** Grant effective from */
  effectiveFrom?: Date;
  /** Grant effective to */
  effectiveTo?: Date;
  /** Whether grant is active */
  isActive: boolean;
  /** Grant metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Grant condition
 * Condition that must be met for permission grant
 */
export interface GrantCondition {
  /** Condition type */
  type: "CONTEXT" | "TIME" | "RESOURCE" | "CUSTOM";
  /** Condition field */
  field: string;
  /** Condition operator */
  operator:
    | "EQUALS"
    | "NOT_EQUALS"
    | "IN"
    | "NOT_IN"
    | "GREATER_THAN"
    | "LESS_THAN";
  /** Condition value */
  value: unknown;
  /** Condition description */
  description?: string;
}

/**
 * Access policy definition
 * Policy that governs access control decisions
 */
export interface AccessPolicy {
  /** Policy identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Policy name */
  name: string;
  /** Policy description */
  description?: string;
  /** Policy type */
  type: "ALLOW" | "DENY" | "CONDITIONAL";
  /** Policy priority */
  priority: number;
  /** Target resources */
  resources: string[];
  /** Target actions */
  actions: string[];
  /** Policy conditions */
  conditions?: PolicyCondition[];
  /** Policy effect */
  effect: "ALLOW" | "DENY";
  /** Whether policy is active */
  isActive: boolean;
  /** Policy metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Policy condition
 * Condition for policy evaluation
 */
export interface PolicyCondition {
  /** Condition field */
  field: string;
  /** Condition operator */
  operator: string;
  /** Condition value */
  value: unknown;
  /** Logical connector */
  connector?: "AND" | "OR";
}

/**
 * Access audit event
 * Audit event for access control decisions
 */
export interface AccessAuditEvent {
  /** Event identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Member who requested access */
  memberId: string;
  /** Access request details */
  request: AccessRequest;
  /** Access decision */
  decision: AccessDecision;
  /** Event timestamp */
  timestamp: Date;
  /** Session identifier */
  sessionId?: string;
  /** Client IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
  /** Event metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Access summary for member
 * Summary of member's access rights and usage
 */
export interface MemberAccessSummary {
  /** Member identifier */
  memberId: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Total roles assigned */
  totalRoles: number;
  /** Total effective permissions */
  totalPermissions: number;
  /** Access by resource */
  accessByResource: Record<string, string[]>;
  /** Recent access requests */
  recentRequests: number;
  /** Successful access rate */
  successRate: number;
  /** Last access timestamp */
  lastAccess?: Date;
  /** Access constraints count */
  constraintCount: number;
  /** Summary generated at */
  generatedAt: Date;
}
