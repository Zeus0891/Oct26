/**
 * RBAC Types - Role-Based Access Control system
 *
 * Depends on Prisma Tables: Role, Permission, RolePermission, MemberRole
 * Depends on Prisma Enums: RoleType, PermissionScope, PermissionType
 *
 * Purpose: Role-based access control, permission management, and authorization across all modules
 */

import type { RoleType } from "@prisma/client";

/**
 * RBAC role information
 * Maps to Prisma Role table core fields for RBAC operations
 */
export interface RBACRole {
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
  /** Role scope (GLOBAL, TENANT, MODULE) */
  scope: string;
  /** Role level/hierarchy */
  level: number;
  /** Whether role is active */
  isActive: boolean;
  /** Whether role is system-defined */
  isSystem: boolean;
  /** Whether role is assignable */
  isAssignable: boolean;
  /** Parent role ID (for hierarchy) */
  parentId?: string;
  /** Role metadata */
  metadata?: Record<string, unknown>;
  /** Role tags */
  tags: string[];
}

/**
 * Permission definition
 * Maps to Prisma Permission table
 */
export interface PermissionBase {
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
  /** Permission type */
  type: string;
  /** Permission scope */
  scope: string;
  /** Resource this permission applies to */
  resource: string;
  /** Action this permission allows */
  action: string;
  /** Whether permission is active */
  isActive: boolean;
  /** Whether permission is system-defined */
  isSystem: boolean;
  /** Permission conditions/constraints */
  conditions?: Record<string, unknown>;
  /** Permission metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Role-Permission association
 * Maps to Prisma RolePermission table
 */
export interface RolePermissionBase {
  /** Association identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Role identifier */
  roleId: string;
  /** Permission identifier */
  permissionId: string;
  /** Whether association is active */
  isActive: boolean;
  /** Grant conditions */
  conditions?: Record<string, unknown>;
  /** Grant effective from */
  effectiveFrom?: Date;
  /** Grant effective to */
  effectiveTo?: Date;
  /** Grant metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Member-Role assignment
 * Maps to Prisma MemberRole table
 */
export interface MemberRoleBase {
  /** Assignment identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Member identifier */
  memberId: string;
  /** Role identifier */
  roleId: string;
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
 * Complete role with permissions
 * Role including associated permissions
 */
export interface RoleWithPermissions extends RBACRole {
  /** Assigned permissions */
  permissions: PermissionBase[];
  /** Child roles (for hierarchy) */
  childRoles?: RBACRole[];
  /** Parent role (for hierarchy) */
  parentRole?: RBACRole;
  /** Permission count */
  permissionCount: number;
  /** Member count assigned to this role */
  memberCount?: number;
}

/**
 * Member role assignments
 * Complete role information for a member
 */
export interface MemberRoleAssignments {
  /** Member identifier */
  memberId: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Assigned roles */
  roles: RBACRole[];
  /** Effective permissions */
  effectivePermissions: PermissionBase[];
  /** Permission summary by resource */
  permissionsByResource: Record<string, PermissionBase[]>;
  /** Highest role level */
  maxRoleLevel: number;
  /** Assignment details */
  assignments: MemberRoleBase[];
}

/**
 * Permission check request
 * Request to check if member has permission
 */
export interface PermissionCheckRequest {
  /** Member identifier */
  memberId: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Permission to check */
  permission: string;
  /** Resource being accessed */
  resource?: string;
  /** Resource identifier */
  resourceId?: string;
  /** Additional context */
  context?: Record<string, unknown>;
}

/**
 * Permission check result
 * Result of permission check
 */
export interface PermissionCheckResult {
  /** Whether permission is granted */
  granted: boolean;
  /** Granting role (if any) */
  grantingRole?: RBACRole;
  /** Granting permission */
  grantingPermission?: PermissionBase;
  /** Check reason/explanation */
  reason?: string;
  /** Additional context */
  context?: Record<string, unknown>;
  /** Check timestamp */
  checkedAt: Date;
}

/**
 * RBAC hierarchy node
 * Node in the RBAC role hierarchy tree
 */
export interface RBACHierarchyNode {
  /** Role information */
  role: RBACRole;
  /** Parent node */
  parent?: RBACHierarchyNode;
  /** Child nodes */
  children: RBACHierarchyNode[];
  /** Depth in hierarchy */
  depth: number;
  /** Path from root */
  path: string[];
  /** Inherited permissions count */
  inheritedPermissionCount: number;
}

/**
 * RBAC configuration for tenant
 * Tenant-specific RBAC settings
 */
export interface RBACConfiguration {
  /** Associated tenant ID */
  tenantId: string;
  /** Whether role hierarchy is enabled */
  hierarchyEnabled: boolean;
  /** Whether permission inheritance is enabled */
  inheritanceEnabled: boolean;
  /** Maximum role depth */
  maxRoleDepth: number;
  /** Default roles for new members */
  defaultRoles: string[];
  /** Role assignment rules */
  assignmentRules?: RoleAssignmentRule[];
  /** Permission evaluation mode */
  evaluationMode: string;
  /** Whether role conflicts are allowed */
  allowRoleConflicts: boolean;
}

/**
 * Role assignment rule
 * Rules for automatic role assignment
 */
export interface RoleAssignmentRule {
  /** Rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Condition for assignment */
  condition: Record<string, unknown>;
  /** Roles to assign */
  rolesToAssign: string[];
  /** Whether rule is active */
  isActive: boolean;
  /** Rule priority */
  priority: number;
}

/**
 * Permission audit entry
 * Audit trail for permission changes
 */
export interface PermissionAudit {
  /** Audit entry identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Member who made the change */
  changedById: string;
  /** Change type */
  changeType: string;
  /** Target member/role */
  targetId: string;
  /** Target type (MEMBER, ROLE) */
  targetType: string;
  /** Permission affected */
  permissionId?: string;
  /** Role affected */
  roleId?: string;
  /** Change details */
  changeDetails: Record<string, unknown>;
  /** Change timestamp */
  changedAt: Date;
  /** Change reason */
  reason?: string;
}
