/**
 * Role Types - Role hierarchy definitions and management
 *
 * Depends on Prisma Tables: Role, RolePermission, MemberRole
 * Depends on Prisma Enums: RoleType, AssignmentScope
 *
 * Purpose: Role hierarchy definitions aligned with RBAC.schema.v7.yml role codes and assignment scopes
 */

import type { RoleType, AssignmentScope } from "@prisma/client";

/**
 * Enhanced role definition with hierarchy support
 * Maps to Prisma Role table with additional metadata
 */
export interface RoleDefinition extends RoleBase {
  /** Role hierarchy level */
  hierarchyLevel: number;
  /** Parent role in hierarchy */
  parentRole?: RoleDefinition;
  /** Child roles in hierarchy */
  childRoles: RoleDefinition[];
  /** Role assignment scope */
  assignmentScope: AssignmentScope;
  /** Inherited permissions from parent roles */
  inheritedPermissions: string[];
  /** Direct permissions assigned to role */
  directPermissions: string[];
  /** Effective permissions (direct + inherited) */
  effectivePermissions: string[];
  /** Role capabilities */
  capabilities: RoleCapability[];
  /** Assignment constraints */
  assignmentConstraints?: RoleAssignmentConstraints;
}

/**
 * Base role information from Prisma schema
 * Core role properties aligned with Role table
 */
export interface RoleBase {
  /** Role identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Role name */
  name: string;
  /** Role display name */
  displayName: string;
  /** Role description */
  description?: string;
  /** Role type */
  type: RoleType;
  /** Role code (from RBAC.schema.v7.yml) */
  code: string;
  /** Role category */
  category: string;
  /** Whether role is active */
  isActive: boolean;
  /** Whether role is system-defined */
  isSystem: boolean;
  /** Whether role is assignable */
  isAssignable: boolean;
  /** Role metadata */
  metadata?: Record<string, unknown>;
  /** Role tags */
  tags: string[];
}

/**
 * Role capability definition
 * Defines specific capabilities granted by a role
 */
export interface RoleCapability {
  /** Capability identifier */
  id: string;
  /** Capability name */
  name: string;
  /** Capability description */
  description?: string;
  /** Resource this capability applies to */
  resource: string;
  /** Actions allowed by this capability */
  actions: string[];
  /** Capability constraints */
  constraints?: Record<string, unknown>;
  /** Whether capability is inherited */
  isInherited: boolean;
}

/**
 * Role assignment constraints
 * Defines rules and limitations for role assignment
 */
export interface RoleAssignmentConstraints {
  /** Maximum number of members with this role */
  maxAssignments?: number;
  /** Required prerequisite roles */
  prerequisiteRoles?: string[];
  /** Mutually exclusive roles */
  exclusiveRoles?: string[];
  /** Assignment approval required */
  requiresApproval: boolean;
  /** Assignment duration limit (days) */
  maxDuration?: number;
  /** Allowed assignment contexts */
  allowedContexts?: AssignmentScope[];
  /** Custom assignment rules */
  customRules?: Record<string, unknown>;
}

/**
 * Role hierarchy tree node
 * Represents a role in the hierarchy structure
 */
export interface RoleHierarchyNode {
  /** Role information */
  role: RoleDefinition;
  /** Parent node */
  parent?: RoleHierarchyNode;
  /** Child nodes */
  children: RoleHierarchyNode[];
  /** Depth in hierarchy (0 = root) */
  depth: number;
  /** Path from root to this node */
  path: string[];
  /** Total permissions (direct + inherited) */
  totalPermissions: number;
  /** Member count with this role */
  memberCount?: number;
}

/**
 * Role template definition
 * Template for creating standardized roles
 */
export interface RoleTemplate {
  /** Template identifier */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string;
  /** Role type this template creates */
  roleType: RoleType;
  /** Default permissions for roles created from template */
  defaultPermissions: string[];
  /** Default capabilities */
  defaultCapabilities: RoleCapability[];
  /** Template configuration */
  configuration: RoleTemplateConfiguration;
  /** Whether template is active */
  isActive: boolean;
  /** Template metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Role template configuration
 * Configuration options for role templates
 */
export interface RoleTemplateConfiguration {
  /** Allow permission customization */
  allowCustomPermissions: boolean;
  /** Allow hierarchy modification */
  allowHierarchyModification: boolean;
  /** Default assignment scope */
  defaultAssignmentScope: AssignmentScope;
  /** Assignment constraints template */
  assignmentConstraintsTemplate?: Partial<RoleAssignmentConstraints>;
  /** Required metadata fields */
  requiredMetadataFields?: string[];
  /** Validation rules */
  validationRules?: Record<string, unknown>;
}

/**
 * Role assignment request
 * Request to assign a role to a member
 */
export interface RoleAssignmentRequest {
  /** Member to assign role to */
  memberId: string;
  /** Role to assign */
  roleId: string;
  /** Assignment scope */
  scope: AssignmentScope;
  /** Assignment context (project, department, etc.) */
  contextId?: string;
  /** Assignment effective from */
  effectiveFrom?: Date;
  /** Assignment effective to */
  effectiveTo?: Date;
  /** Assignment reason */
  reason?: string;
  /** Assignment metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Role assignment result
 * Result of role assignment operation
 */
export interface RoleAssignmentResult {
  /** Assignment success status */
  success: boolean;
  /** Assignment identifier (if successful) */
  assignmentId?: string;
  /** Assigned role information */
  role?: RoleDefinition;
  /** Assignment details */
  assignment?: RoleAssignmentDetails;
  /** Error message (if failed) */
  error?: string;
  /** Validation warnings */
  warnings?: string[];
  /** Assignment timestamp */
  assignedAt: Date;
}

/**
 * Role assignment details
 * Detailed information about a role assignment
 */
export interface RoleAssignmentDetails {
  /** Assignment identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Member identifier */
  memberId: string;
  /** Role identifier */
  roleId: string;
  /** Assignment scope */
  scope: AssignmentScope;
  /** Assignment context */
  contextId?: string;
  /** Assignment status */
  status: string;
  /** Assigned by member ID */
  assignedById: string;
  /** Assignment timestamp */
  assignedAt: Date;
  /** Assignment effective from */
  effectiveFrom?: Date;
  /** Assignment effective to */
  effectiveTo?: Date;
  /** Whether assignment is active */
  isActive: boolean;
  /** Assignment conditions */
  conditions?: Record<string, unknown>;
  /** Assignment metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Role conflict detection result
 * Result of detecting conflicts between roles
 */
export interface RoleConflictDetection {
  /** Whether conflicts were detected */
  hasConflicts: boolean;
  /** Detected conflicts */
  conflicts: RoleConflict[];
  /** Conflict resolution suggestions */
  resolutionSuggestions?: ConflictResolutionSuggestion[];
  /** Analysis timestamp */
  analyzedAt: Date;
}

/**
 * Role conflict definition
 * Defines a conflict between roles
 */
export interface RoleConflict {
  /** Conflict type */
  type:
    | "PERMISSION_OVERLAP"
    | "EXCLUSIVE_ROLES"
    | "HIERARCHY_VIOLATION"
    | "CONSTRAINT_VIOLATION";
  /** Conflicting roles */
  conflictingRoles: string[];
  /** Conflict description */
  description: string;
  /** Conflict severity */
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** Affected permissions/capabilities */
  affectedItems?: string[];
  /** Conflict metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Conflict resolution suggestion
 * Suggestion for resolving role conflicts
 */
export interface ConflictResolutionSuggestion {
  /** Suggestion type */
  type:
    | "REMOVE_ROLE"
    | "MODIFY_PERMISSIONS"
    | "CHANGE_HIERARCHY"
    | "ADD_CONSTRAINTS";
  /** Suggestion description */
  description: string;
  /** Suggested actions */
  actions: string[];
  /** Impact assessment */
  impact: "LOW" | "MEDIUM" | "HIGH";
  /** Automated resolution available */
  canAutoResolve: boolean;
}

/**
 * Role usage analytics
 * Analytics data for role usage and effectiveness
 */
export interface RoleUsageAnalytics {
  /** Role identifier */
  roleId: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Analysis period start */
  periodStart: Date;
  /** Analysis period end */
  periodEnd: Date;
  /** Total members with this role */
  totalMembers: number;
  /** Active members with this role */
  activeMembers: number;
  /** Permission usage statistics */
  permissionUsage: Record<string, number>;
  /** Most used capabilities */
  topCapabilities: string[];
  /** Assignment frequency */
  assignmentFrequency: number;
  /** Average assignment duration */
  avgAssignmentDuration?: number;
  /** Role effectiveness score */
  effectivenessScore?: number;
}
