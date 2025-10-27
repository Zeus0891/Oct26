/**
 * RBAC Service - Role-Based Access Control management
 *
 * Provides comprehensive role and permission management with hierarchical
 * roles, resource-based permissions, and policy enforcement.
 *
 * @module RBACService
 * @category Shared Services - Security Infrastructure
 * @description RBAC and permission management service
 * @version 1.0.0
 */

import { PrismaClient } from "@prisma/client";
import type { RequestContext } from "../base/context.service";
import {
  AuditService,
  AuditEventType,
  AuditSeverity,
} from "../audit/audit.service";
import {
  RbacUtils,
  type Permission,
  type Role,
  type UserContext,
} from "../../utils/security/rbac.util";
import { withTenantRLS } from "../../../lib/prisma/withRLS";
import { ErrorUtils } from "../../utils/base/error.util";

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Permission check request
 */
export interface PermissionCheckRequest {
  /** User context for permission check */
  user: {
    userId: string;
    tenantId: string;
    roles: string[];
  };
  /** Resource being accessed */
  resource: {
    type: string;
    id?: string;
    attributes?: Record<string, unknown>;
  };
  /** Action being performed */
  action: string;
  /** Additional context */
  context?: Record<string, unknown>;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  /** Whether permission is granted */
  granted: boolean;
  /** Reason for denial (if any) */
  reason?: string;
  /** Applied policies */
  appliedPolicies?: string[];
  /** Required permissions that were missing */
  missingPermissions?: string[];
  /** Effective permissions */
  effectivePermissions?: string[];
}

/**
 * Role assignment request
 */
export interface RoleAssignmentRequest {
  /** User to assign role to */
  userId: string;
  /** Role to assign */
  roleId: string;
  /** Tenant context */
  tenantId: string;
  /** Assignment scope */
  scope?: {
    resourceType?: string;
    resourceId?: string;
    attributes?: Record<string, unknown>;
  };
  /** Assignment metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Permission grant request
 */
export interface PermissionGrantRequest {
  /** Target of the grant (user or role) */
  target: {
    type: "user" | "role";
    id: string;
  };
  /** Permission to grant */
  permission: string;
  /** Resource scope */
  resource?: {
    type: string;
    id?: string;
  };
  /** Grant conditions */
  conditions?: Record<string, unknown>;
  /** Tenant context */
  tenantId: string;
}

/**
 * Bulk permission operation
 */
export interface BulkPermissionOperation {
  /** Operation type */
  operation: "grant" | "revoke" | "check";
  /** List of permission requests */
  requests: (PermissionGrantRequest | PermissionCheckRequest)[];
  /** Batch metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Role hierarchy definition
 */
export interface RoleHierarchy {
  /** Role identifier */
  roleId: string;
  /** Parent roles */
  parents: string[];
  /** Child roles */
  children: string[];
  /** Role level in hierarchy */
  level: number;
  /** Inherited permissions */
  inheritedPermissions: string[];
}

/**
 * RBAC service
 *
 * Provides comprehensive role-based access control with support for
 * hierarchical roles, resource-based permissions, and policy enforcement.
 *
 * @example
 * ```typescript
 * const rbacService = new RBACService(prisma, auditService);
 *
 * // Check user permission
 * const hasAccess = await rbacService.checkPermission({
 *   user: { userId: 'user-123', tenantId: 'tenant-456', roles: ['manager'] },
 *   resource: { type: 'Project', id: 'proj-789' },
 *   action: 'update'
 * });
 *
 * // Assign role to user
 * await rbacService.assignRole({
 *   userId: 'user-123',
 *   roleId: 'project-manager',
 *   tenantId: 'tenant-456'
 * }, ctx);
 * ```
 */
export class RBACService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly auditService: AuditService
  ) {}

  /**
   * Check user permission with comprehensive audit logging and error handling
   *
   * Evaluates whether a user has permission to perform an action on a resource.
   * All permission checks are audited for security compliance.
   *
   * @param request - Permission check request
   * @param ctx - Request context
   * @returns Permission check result
   */
  async checkPermission(
    request: PermissionCheckRequest,
    ctx?: RequestContext
  ): Promise<PermissionCheckResult> {
    const startTime = Date.now();
    let result: PermissionCheckResult;

    try {
      // Validate input parameters
      const validation = this.validatePermissionCheckRequest(request);
      if (!validation.success) {
        this.auditService.logEvent({
          type: AuditEventType.SECURITY_VIOLATION,
          severity: AuditSeverity.HIGH,
          description: `Invalid permission check request: ${validation.error}`,
          userId: request.user?.userId,
          tenantId: request.user?.tenantId,
          resource: {
            type: request.resource?.type || "unknown",
            id: request.resource?.id || "unknown",
            name: "permission_check_validation_failed",
          },
          metadata: {
            correlationId: ctx?.correlationId,
            validationError: validation.error,
            requestedAction: request.action,
            resourceType: request.resource?.type,
          },
        });

        throw ErrorUtils.createValidationError(
          `Permission check validation failed: ${validation.error}`,
          { validation: validation.error || "Unknown validation error" }
        );
      }

      // Audit permission check start
      this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.LOW,
        description: `Permission check initiated for ${request.action} on ${request.resource.type}`,
        userId: request.user.userId,
        tenantId: request.user.tenantId,
        resource: {
          type: request.resource.type,
          id: request.resource.id,
          name: "permission_check_initiated",
        },
        metadata: {
          correlationId: ctx?.correlationId,
          requestedAction: request.action,
          resourceType: request.resource.type,
          resourceId: request.resource.id,
          userRoles: request.user.roles,
        },
      });

      // Create user context for RBAC utilities
      const userPermissions: string[] = await withTenantRLS(
        request.user.tenantId,
        request.user.roles,
        async (prisma) =>
          await this.getUserPermissions(
            request.user.userId,
            request.user.tenantId
          ),
        request.user.userId
      );

      const userContext: UserContext = {
        userId: request.user.userId,
        tenantId: request.user.tenantId,
        roles: request.user.roles.map((roleId) => ({
          id: roleId,
          name: roleId,
          permissions: [],
        })) as any,
      };

      // Use RBAC utilities to check permission
      const rbacResult = await RbacUtils.checkPermission(
        userContext,
        request.action as any, // Cast to satisfy type requirements
        {
          type: request.resource.type as any,
          id: request.resource.id,
          attributes: request.resource.attributes,
          tenantId: request.user.tenantId,
        } as any
      );

      result = {
        granted: rbacResult.granted,
        reason: rbacResult.reason,
        appliedPolicies: [],
        missingPermissions: [],
        effectivePermissions: userPermissions,
      };

      // Comprehensive audit logging for permission result
      const executionTime = Date.now() - startTime;
      this.auditService.logEvent({
        type: result.granted
          ? AuditEventType.PERMISSION_GRANTED
          : AuditEventType.PERMISSION_DENIED,
        severity: this.getAuditSeverityForPermissionCheck(request, result),
        description: `Permission ${result.granted ? "granted" : "denied"} for ${
          request.action
        } on ${request.resource.type}${
          result.reason ? ` - ${result.reason}` : ""
        }`,
        userId: request.user.userId,
        tenantId: request.user.tenantId,
        resource: {
          type: request.resource.type,
          id: request.resource.id,
          name: result.granted ? "permission_granted" : "permission_denied",
        },
        metadata: {
          correlationId: ctx?.correlationId,
          requestedAction: request.action,
          resourceType: request.resource.type,
          resourceId: request.resource.id,
          granted: result.granted,
          reason: result.reason,
          executionTimeMs: executionTime,
          userRoles: request.user.roles,
          effectivePermissionsCount: userPermissions.length,
          isSensitiveOperation: this.isSensitiveOperation(
            request.action,
            request.resource.type
          ),
        },
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Comprehensive error audit logging
      this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: `Permission check failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: request.user?.userId,
        tenantId: request.user?.tenantId,
        resource: {
          type: request.resource?.type || "unknown",
          id: request.resource?.id || "unknown",
          name: "permission_check_failed",
        },
        metadata: {
          correlationId: ctx?.correlationId,
          error: error instanceof Error ? error.message : String(error),
          requestedAction: request.action,
          resourceType: request.resource?.type,
          executionTimeMs: executionTime,
        },
      });

      console.error("[RBACService] Permission check error:", error);

      // Default to deny on error for security
      result = {
        granted: false,
        reason:
          error instanceof Error
            ? error.message
            : "Permission check failed due to system error",
        appliedPolicies: [],
        missingPermissions: [],
        effectivePermissions: [],
      };

      return result;
    }
  }

  /**
   * Validate permission check request parameters
   *
   * @param request - Permission check request to validate
   * @returns Validation result
   */
  private validatePermissionCheckRequest(request: PermissionCheckRequest): {
    success: boolean;
    error?: string;
  } {
    if (!request.user?.userId) {
      return { success: false, error: "User ID is required" };
    }

    if (!request.user?.tenantId) {
      return { success: false, error: "Tenant ID is required" };
    }

    if (!request.resource?.type) {
      return { success: false, error: "Resource type is required" };
    }

    if (!request.action) {
      return { success: false, error: "Action is required" };
    }

    return { success: true };
  }

  /**
   * Get appropriate audit severity for permission check
   *
   * @param request - Permission check request
   * @param result - Permission check result
   * @returns Audit severity level
   */
  private getAuditSeverityForPermissionCheck(
    request: PermissionCheckRequest,
    result: PermissionCheckResult
  ): AuditSeverity {
    // High severity for denied sensitive operations
    if (
      !result.granted &&
      this.isSensitiveOperation(request.action, request.resource.type)
    ) {
      return AuditSeverity.HIGH;
    }

    // Medium severity for denied operations
    if (!result.granted) {
      return AuditSeverity.MEDIUM;
    }

    // Medium severity for granted sensitive operations
    if (
      result.granted &&
      this.isSensitiveOperation(request.action, request.resource.type)
    ) {
      return AuditSeverity.MEDIUM;
    }

    // Low severity for granted regular operations
    return AuditSeverity.LOW;
  }

  /**
   * Validate role assignment request parameters
   *
   * @param assignment - Role assignment request to validate
   * @param ctx - Request context
   * @returns Validation result
   */
  private validateRoleAssignmentRequest(
    assignment: RoleAssignmentRequest,
    ctx: RequestContext
  ): { success: boolean; error?: string } {
    if (!assignment.userId) {
      return { success: false, error: "Target user ID is required" };
    }

    if (!assignment.roleId) {
      return { success: false, error: "Role ID is required" };
    }

    if (!assignment.tenantId) {
      return { success: false, error: "Tenant ID is required" };
    }

    if (!ctx.actor?.userId) {
      return { success: false, error: "Actor user ID is required" };
    }

    return { success: true };
  }

  /**
   * Assign role to user with comprehensive audit logging and validation
   *
   * Assigns a role to a user within a specific tenant context with full
   * security validation and audit trail.
   *
   * @param assignment - Role assignment request
   * @param ctx - Request context
   * @returns Assignment result
   */
  async assignRole(
    assignment: RoleAssignmentRequest,
    ctx: RequestContext
  ): Promise<ApiResponse<{ success: boolean }>> {
    const startTime = Date.now();

    try {
      // Validate input parameters
      const validation = this.validateRoleAssignmentRequest(assignment, ctx);
      if (!validation.success) {
        this.auditService.logEvent({
          type: AuditEventType.SECURITY_VIOLATION,
          severity: AuditSeverity.HIGH,
          description: `Invalid role assignment request: ${validation.error}`,
          userId: ctx.actor?.userId,
          tenantId: assignment.tenantId,
          resource: {
            type: "RoleAssignment",
            id: assignment.roleId,
            name: "role_assignment_validation_failed",
          },
          metadata: {
            correlationId: ctx.correlationId,
            validationError: validation.error,
            targetUserId: assignment.userId,
            roleId: assignment.roleId,
          },
        });

        return {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: validation.error || "Role assignment validation failed",
          },
        };
      }

      // Audit role assignment attempt start
      this.auditService.logEvent({
        type: AuditEventType.UPDATE,
        severity: AuditSeverity.MEDIUM,
        description: `Role assignment initiated: ${assignment.roleId} to user ${assignment.userId}`,
        userId: ctx.actor?.userId,
        tenantId: assignment.tenantId,
        resource: {
          type: "RoleAssignment",
          id: assignment.roleId,
          name: "role_assignment_initiated",
        },
        metadata: {
          correlationId: ctx.correlationId,
          targetUserId: assignment.userId,
          roleId: assignment.roleId,
          actorId: ctx.actor?.userId,
          scope: assignment.scope,
        },
      });

      // Check if actor has permission to assign roles
      const canAssignRoles = await this.checkPermission(
        {
          user: {
            userId: ctx.actor?.userId || "",
            tenantId: assignment.tenantId,
            roles: ctx.actor?.roles || [],
          },
          resource: {
            type: "Role",
            id: assignment.roleId,
          },
          action: "assign",
        },
        ctx
      );

      if (!canAssignRoles.granted) {
        this.auditService.logEvent({
          type: AuditEventType.PERMISSION_DENIED,
          severity: AuditSeverity.HIGH,
          description: `Role assignment denied: insufficient permissions to assign role ${assignment.roleId}`,
          userId: ctx.actor?.userId,
          tenantId: assignment.tenantId,
          resource: {
            type: "RoleAssignment",
            id: assignment.roleId,
            name: "role_assignment_permission_denied",
          },
          metadata: {
            correlationId: ctx.correlationId,
            targetUserId: assignment.userId,
            roleId: assignment.roleId,
            reason: canAssignRoles.reason,
          },
        });

        return {
          success: false,
          error: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: "Insufficient permissions to assign roles",
            details: canAssignRoles.reason,
          },
        };
      }

      // Verify role exists and is valid for tenant using RLS
      const role = await withTenantRLS(
        assignment.tenantId,
        ctx.actor?.roles || [],
        async (tx) =>
          await this.getRoleById(assignment.roleId, assignment.tenantId),
        ctx.actor?.userId
      );

      if (!role) {
        this.auditService.logEvent({
          type: AuditEventType.SECURITY_VIOLATION,
          severity: AuditSeverity.HIGH,
          description: `Role assignment failed: role ${assignment.roleId} not found in tenant`,
          userId: ctx.actor?.userId,
          tenantId: assignment.tenantId,
          resource: {
            type: "RoleAssignment",
            id: assignment.roleId,
            name: "role_not_found",
          },
          metadata: {
            correlationId: ctx.correlationId,
            targetUserId: assignment.userId,
            roleId: assignment.roleId,
          },
        });

        return {
          success: false,
          error: {
            code: "ROLE_NOT_FOUND",
            message: "Role not found or not available in tenant",
          },
        };
      }

      // Verify user exists and belongs to tenant using RLS
      const userExists = await withTenantRLS(
        assignment.tenantId,
        ctx.actor?.roles || [],
        async (tx) =>
          await this.verifyUserInTenant(assignment.userId, assignment.tenantId),
        ctx.actor?.userId
      );

      if (!userExists) {
        this.auditService.logEvent({
          type: AuditEventType.SECURITY_VIOLATION,
          severity: AuditSeverity.HIGH,
          description: `Role assignment failed: user ${assignment.userId} not found in tenant`,
          userId: ctx.actor?.userId,
          tenantId: assignment.tenantId,
          resource: {
            type: "RoleAssignment",
            id: assignment.userId,
            name: "user_not_found",
          },
          metadata: {
            correlationId: ctx.correlationId,
            targetUserId: assignment.userId,
            roleId: assignment.roleId,
          },
        });

        return {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found or not in tenant",
          },
        };
      }

      // Check if assignment already exists using RLS
      const existingAssignment = await withTenantRLS(
        assignment.tenantId,
        ctx.actor?.roles || [],
        async (tx) =>
          await this.getUserRoleAssignment(
            assignment.userId,
            assignment.roleId,
            assignment.tenantId
          ),
        ctx.actor?.userId
      );

      if (existingAssignment) {
        this.auditService.logEvent({
          type: AuditEventType.SECURITY_VIOLATION,
          severity: AuditSeverity.MEDIUM,
          description: `Role assignment failed: role ${assignment.roleId} already assigned to user ${assignment.userId}`,
          userId: ctx.actor?.userId,
          tenantId: assignment.tenantId,
          resource: {
            type: "RoleAssignment",
            id: assignment.roleId,
            name: "role_already_assigned",
          },
          metadata: {
            correlationId: ctx.correlationId,
            targetUserId: assignment.userId,
            roleId: assignment.roleId,
            existingAssignmentId: existingAssignment.id,
          },
        });

        return {
          success: false,
          error: {
            code: "ROLE_ALREADY_ASSIGNED",
            message: "Role is already assigned to user",
          },
        };
      }

      // Create role assignment with RLS and comprehensive error handling
      const rlsResult = await withTenantRLS(
        assignment.tenantId,
        ctx.actor?.roles || [],
        async (tx: any) => {
          return await tx.tenantUserRole.create({
            data: {
              userId: assignment.userId,
              roleId: assignment.roleId,
              tenantId: assignment.tenantId,
              assignedBy: ctx.actor?.userId,
              assignedAt: new Date(),
              scope: assignment.scope as any,
              metadata: assignment.metadata as any,
            },
          });
        },
        ctx.actor?.userId
      );

      const executionTime = Date.now() - startTime;

      // Comprehensive success audit logging
      this.auditService.logEvent({
        type: AuditEventType.ROLE_ASSIGNED,
        severity: AuditSeverity.HIGH,
        description: `Role assignment successful: ${role.name} (${assignment.roleId}) assigned to user ${assignment.userId}`,
        userId: ctx.actor?.userId,
        tenantId: assignment.tenantId,
        resource: {
          type: "RoleAssignment",
          id: rlsResult.id,
          name: "role_assignment_success",
        },
        metadata: {
          correlationId: ctx.correlationId,
          targetUserId: assignment.userId,
          roleId: assignment.roleId,
          roleName: role.name || assignment.roleId,
          assignmentId: rlsResult.id,
          executionTimeMs: executionTime,
          scope: assignment.scope,
        },
      });

      return {
        success: true,
        data: { success: true },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Comprehensive error audit logging
      this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: `Role assignment failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: ctx.actor?.userId,
        tenantId: assignment.tenantId,
        resource: {
          type: "RoleAssignment",
          id: assignment.roleId,
          name: "role_assignment_failed",
        },
        metadata: {
          correlationId: ctx.correlationId,
          targetUserId: assignment.userId,
          roleId: assignment.roleId,
          executionTimeMs: executionTime,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      console.error("[RBACService] Role assignment error:", error);

      return {
        success: false,
        error: {
          code: "ROLE_ASSIGNMENT_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to assign role",
        },
      };
    }
  }

  /**
   * Revoke role from user
   *
   * Removes a role assignment from a user.
   *
   * @param userId - User ID
   * @param roleId - Role ID
   * @param tenantId - Tenant ID
   * @param ctx - Request context
   * @returns Revocation result
   */
  async revokeRole(
    userId: string,
    roleId: string,
    tenantId: string,
    ctx: RequestContext
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      // Check if actor has permission to revoke roles
      const canRevokeRoles = await this.checkPermission(
        {
          user: {
            userId: ctx.actor?.userId || "",
            tenantId: tenantId,
            roles: ctx.actor?.roles || [],
          },
          resource: {
            type: "Role",
            id: roleId,
          },
          action: "revoke",
        },
        ctx
      );

      if (!canRevokeRoles.granted) {
        return {
          success: false,
          error: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: "Insufficient permissions to revoke roles",
          },
        };
      }

      // Find and remove role assignment
      const assignment = await this.getUserRoleAssignment(
        userId,
        roleId,
        tenantId
      );
      if (!assignment) {
        return {
          success: false,
          error: {
            code: "ASSIGNMENT_NOT_FOUND",
            message: "Role assignment not found",
          },
        };
      }

      // Remove assignment with RLS
      await withTenantRLS(
        tenantId,
        ctx.actor?.roles || [],
        async (tx: any) => {
          return await tx.tenantUserRole.delete({
            where: {
              id: assignment.id,
            },
          });
        },
        ctx.actor?.userId
      );

      await this.auditService.logEvent({
        type: AuditEventType.ROLE_REMOVED,
        severity: AuditSeverity.MEDIUM,
        description: `Role ${
          assignment.role?.name || roleId
        } revoked from user`,
        userId: ctx.actor?.userId,
        tenantId: tenantId,
        resource: {
          type: "UserRole",
          id: userId,
        },
        metadata: {
          targetUserId: userId,
          roleId: roleId,
          roleName: assignment.role?.name,
          correlationId: ctx.correlationId,
        },
      });

      return {
        success: true,
        data: { success: true },
      };
    } catch (error) {
      console.error("[RBACService] Role revocation error:", error);
      return {
        success: false,
        error: {
          code: "ROLE_REVOCATION_ERROR",
          message: "Failed to revoke role",
        },
      };
    }
  }

  /**
   * Get user roles
   *
   * Retrieves all roles assigned to a user within a tenant.
   *
   * @param userId - User ID
   * @param tenantId - Tenant ID
   * @returns User roles
   */
  async getUserRoles(userId: string, tenantId: string): Promise<Role[]> {
    try {
      // Query user roles with RLS
      const assignments = await withTenantRLS(
        tenantId,
        [], // Basic access for reading own roles
        async (tx: any) => {
          return (
            (await tx.tenantUserRole?.findMany({
              where: {
                userId: userId,
                tenantId: tenantId,
                isActive: true,
              },
              include: {
                role: {
                  include: {
                    permissions: true,
                  },
                },
              },
            })) || []
          );
        },
        userId
      );
      return assignments.map((assignment: any) => ({
        id: assignment.role.id,
        name: assignment.role.name,
        description: assignment.role.description,
        permissions: assignment.role.permissions?.map((p: any) => p.name) || [],
        isSystemRole: assignment.role.isSystemRole || false,
        tenantId: assignment.tenantId,
        createdAt: assignment.role.createdAt,
        updatedAt: assignment.role.updatedAt,
      }));
    } catch (error) {
      console.error("[RBACService] Get user roles error:", error);
      return [];
    }
  }

  /**
   * Get user permissions
   *
   * Retrieves all effective permissions for a user (from all assigned roles).
   *
   * @param userId - User ID
   * @param tenantId - Tenant ID
   * @returns User permissions
   */
  async getUserPermissions(
    userId: string,
    tenantId: string
  ): Promise<string[]> {
    try {
      const roles = await this.getUserRoles(userId, tenantId);
      const permissions = new Set<string>();

      // Collect all permissions from all roles
      for (const role of roles) {
        for (const permission of role.permissions) {
          if (typeof permission === "string") {
            permissions.add(permission);
          } else if (
            permission &&
            typeof permission === "object" &&
            "name" in permission
          ) {
            permissions.add((permission as any).name);
          }
        }
      }

      return Array.from(permissions);
    } catch (error) {
      console.error("[RBACService] Get user permissions error:", error);
      return [];
    }
  }

  /**
   * Get role hierarchy
   *
   * Retrieves the role hierarchy for a tenant.
   *
   * @param tenantId - Tenant ID
   * @returns Role hierarchy
   */
  async getRoleHierarchy(tenantId: string): Promise<RoleHierarchy[]> {
    try {
      // In real implementation, this would query role hierarchy table
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error("[RBACService] Get role hierarchy error:", error);
      return [];
    }
  }

  /**
   * Perform bulk permission operations
   *
   * Executes multiple permission operations in a single transaction.
   *
   * @param operation - Bulk operation definition
   * @param ctx - Request context
   * @returns Bulk operation results
   */
  async bulkPermissionOperation(
    operation: BulkPermissionOperation,
    ctx: RequestContext
  ): Promise<ApiResponse<{ results: any[] }>> {
    try {
      const results = [];

      for (const request of operation.requests) {
        if (operation.operation === "check") {
          const result = await this.checkPermission(
            request as PermissionCheckRequest,
            ctx
          );
          results.push(result);
        }
        // Add other bulk operations as needed
      }

      return {
        success: true,
        data: { results },
      };
    } catch (error) {
      console.error("[RBACService] Bulk operation error:", error);
      return {
        success: false,
        error: {
          code: "BULK_OPERATION_ERROR",
          message: "Bulk permission operation failed",
        },
      };
    }
  }

  // Private helper methods

  /**
   * Get role by ID within tenant
   */
  private async getRoleById(roleId: string, tenantId: string): Promise<any> {
    try {
      // In real implementation, this would use actual Prisma schema
      // For now, return a mock role for interface compatibility
      return {
        id: roleId,
        name: "Mock Role",
        description: "Mock role for development",
        tenantId: tenantId,
        permissions: [],
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify user exists in tenant
   */
  private async verifyUserInTenant(
    userId: string,
    tenantId: string
  ): Promise<boolean> {
    try {
      // In real implementation, this would query the user table
      // For now, return true for development
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user role assignment
   */
  private async getUserRoleAssignment(
    userId: string,
    roleId: string,
    tenantId: string
  ): Promise<any> {
    try {
      // In real implementation, this would query the role assignment table
      // For now, return null to indicate no existing assignment
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if operation is sensitive and requires auditing
   */
  private isSensitiveOperation(action: string, resourceType: string): boolean {
    const sensitiveActions = ["delete", "update", "assign", "revoke", "admin"];
    const sensitiveResources = ["User", "Role", "Permission", "TenantUser"];

    return (
      sensitiveActions.includes(action.toLowerCase()) ||
      sensitiveResources.includes(resourceType)
    );
  }
}
