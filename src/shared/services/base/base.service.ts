/**
 * Base Service Infrastructure
 *
 * Abstract foundation class providing common patterns for all domain services.
 * Implements enterprise-grade patterns including RLS integration, audit logging,
 * permission checking, and standardized error handling.
 *
 * @module BaseService
 * @category Shared Services - Base Infrastructure
 * @description Abstract service foundation with multi-tenant support
 * @version 1.0.0
 */

import { PrismaClient } from "@prisma/client";
import { withTenantRLS } from "../../../lib/prisma/withRLS";
import type {
  BaseEntity,
  RequestContext,
  ActorContext,
  TenantContext,
} from "./context.service";
import {
  AuditService as AuditServiceInterface,
  AuditEventType,
  AuditSeverity,
} from "../audit/audit.service";
import { RBACService } from "../security/rbac.service";
import {
  ValidationFactory,
  ValidationResult,
  ValidationContext,
  ValidationIssue,
  isValidationFailure,
} from "../../validators/validation.types";
import { ErrorUtils } from "../../utils/base/error.util";

/**
 * Simplified API response type for services
 */
export interface ApiResponse<T = unknown> {
  /** Indicates if the request was successful */
  success: boolean;
  /** Response data (present on success) */
  data?: T;
  /** Error information (present on failure) */
  error?: {
    code: string;
    message: string;
    correlationId?: string;
    details?: Record<string, any>;
  };
  /** Response metadata */
  meta?: {
    correlationId?: string;
    timestamp: Date;
    executionTime?: number;
  };
}

/**
 * Create success response
 */
export const createSuccessResponse = <T>(
  data: T,
  meta?: { correlationId?: string; timestamp: Date; executionTime?: number }
): ApiResponse<T> => ({
  success: true,
  data,
  meta,
});

/**
 * Create error response
 */
export const createErrorResponse = (error: {
  code: string;
  message: string;
  correlationId?: string;
  details?: Record<string, any>;
}): ApiResponse<never> => ({
  success: false,
  error,
});

/**
 * Base entity input for creation operations
 */
export type CreateInput<T extends BaseEntity> = Omit<
  T,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "version"
  | "tenantId"
  | "createdBy"
  | "updatedBy"
>;

/**
 * Base entity input for update operations
 */
export type UpdateInput<T extends BaseEntity> = Partial<CreateInput<T>> & {
  version: number; // Required for optimistic concurrency control
};

/**
 * Entity identifier type
 */
export type EntityId = string;

/**
 * Audit action enumeration
 */
export enum AuditAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LIST = "LIST",
  SEARCH = "SEARCH",
  EXPORT = "EXPORT",
  IMPORT = "IMPORT",
}

/**
 * Service error types
 */
export class BusinessRuleViolation extends Error {
  constructor(
    message: string,
    public violations: Record<string, string[]>
  ) {
    super(message);
    this.name = "BusinessRuleViolation";
  }
}

export class InsufficientPermissionsError extends Error {
  constructor(
    message: string = "Insufficient permissions for this operation",
    public requiredPermission?: string
  ) {
    super(message);
    this.name = "InsufficientPermissionsError";
  }
}

export class EntityNotFoundError extends Error {
  constructor(entityType: string, entityId: string) {
    super(`${entityType} with ID ${entityId} not found`);
    this.name = "EntityNotFoundError";
  }
}

export class OptimisticLockError extends Error {
  constructor(entityType: string, entityId: string, expectedVersion: number) {
    super(
      `${entityType} with ID ${entityId} was modified by another user. Expected version ${expectedVersion}.`
    );
    this.name = "OptimisticLockError";
  }
}

/**
 * Abstract base service providing common infrastructure patterns
 *
 * This class provides the foundational infrastructure that all domain services
 * should extend. It includes multi-tenant isolation, audit logging, permission
 * checking, and standardized error handling.
 *
 * @example
 * ```typescript
 * export class ProjectService extends BaseService<Project> {
 *   constructor(prisma: PrismaClient, auditService: AuditService) {
 *     super(prisma, auditService, 'Project');
 *   }
 *
 *   async create(
 *     ctx: RequestContext,
 *     data: CreateProjectInput
 *   ): Promise<ApiResponse<Project>> {
 *     return this.withAudit(ctx, AuditAction.CREATE, async () => {
 *       return await withRLS(
 *         {
 *           tenantId: ctx.tenant.tenantId,
 *           userId: ctx.actor.userId,
 *           roles: ctx.actor.roles
 *         },
 *         async (tx) => {
 *           const project = await tx.project.create({
 *             data: {
 *               ...data,
 *               tenantId: ctx.tenant.tenantId,
 *               createdBy: ctx.actor.userId,
 *               updatedBy: ctx.actor.userId
 *             }
 *           });
 *           return project;
 *         }
 *       );
 *     });
 *   }
 * }
 * ```
 */
export abstract class BaseService<T extends BaseEntity> {
  protected constructor(
    protected readonly prisma: PrismaClient,
    protected readonly auditService: AuditServiceInterface,
    protected readonly rbacService: RBACService,
    protected readonly entityName: string
  ) {}

  /**
   * Create a new entity with audit logging and permission checking
   */
  abstract create(
    ctx: RequestContext,
    data: CreateInput<T>
  ): Promise<ApiResponse<T>>;

  /**
   * Update an existing entity with optimistic concurrency control
   */
  abstract update(
    ctx: RequestContext,
    id: EntityId,
    data: UpdateInput<T>
  ): Promise<ApiResponse<T>>;

  /**
   * Delete an entity (soft delete if supported)
   */
  abstract delete(
    ctx: RequestContext,
    id: EntityId
  ): Promise<ApiResponse<void>>;

  /**
   * Find entity by ID with tenant isolation
   */
  abstract findById(
    ctx: RequestContext,
    id: EntityId
  ): Promise<ApiResponse<T | null>>;

  /**
   * Wrapper for operations that require audit logging
   *
   * Provides standardized audit logging, error handling, and performance tracking
   * for all service operations.
   *
   * @param ctx - Request context with tenant and actor information
   * @param action - The audit action being performed
   * @param operation - The operation to execute
   * @returns Promise with the operation result wrapped in ApiResponse
   */
  protected async withAudit<R>(
    ctx: RequestContext,
    action: AuditAction,
    operation: () => Promise<R>
  ): Promise<ApiResponse<R>> {
    const startTime = Date.now();

    try {
      // Log the operation start
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.LOW,
        description: `${action} operation on ${this.entityName}`,
        userId: ctx.actor?.userId,
        sessionId: ctx.actor?.sessionId,
        tenantId: ctx.tenant?.tenantId,
        client: {
          ip: ctx.request?.ip,
          userAgent: ctx.request?.userAgent,
        },
        metadata: {
          correlationId: ctx.correlationId,
          entityType: this.entityName,
          action,
          startTime,
        },
      });

      // Execute the operation
      const result = await operation();

      // Log successful completion
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.LOW,
        description: `${action} operation on ${this.entityName} completed successfully`,
        userId: ctx.actor?.userId,
        sessionId: ctx.actor?.sessionId,
        tenantId: ctx.tenant?.tenantId,
        metadata: {
          correlationId: ctx.correlationId,
          entityType: this.entityName,
          action,
          executionTime: Date.now() - startTime,
        },
      });

      return createSuccessResponse(result, {
        correlationId: ctx.correlationId,
        timestamp: new Date(),
        executionTime: Date.now() - startTime,
      });
    } catch (error) {
      // Log the error
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: `${action} operation on ${this.entityName} failed`,
        userId: ctx.actor?.userId,
        sessionId: ctx.actor?.sessionId,
        tenantId: ctx.tenant?.tenantId,
        metadata: {
          correlationId: ctx.correlationId,
          entityType: this.entityName,
          action,
          error: error instanceof Error ? error.message : String(error),
          executionTime: Date.now() - startTime,
        },
      });

      // Transform and return error response
      return this.handleError(error, ctx.correlationId);
    }
  }

  /**
   * Execute operation with RLS context and comprehensive error handling
   *
   * Convenience wrapper for operations that need tenant isolation through RLS.
   * Includes audit logging for RLS enforcement and validation.
   *
   * @param ctx - Request context with tenant information
   * @param operation - Database operation to execute
   * @returns Promise with operation result
   */
  protected async withTenantRLS<R>(
    ctx: RequestContext,
    operation: (prisma: PrismaClient) => Promise<R>
  ): Promise<R> {
    if (!ctx.tenant?.tenantId) {
      const error = ErrorUtils.createAuthzError(
        "Tenant context is required for RLS operations"
      );
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: "RLS operation attempted without tenant context",
        userId: ctx.actor?.userId,
        tenantId: undefined,
        resource: {
          type: this.entityName,
          id: "rls_violation",
          name: `${this.entityName}_rls_violation`,
        },
        metadata: {
          correlationId: ctx.correlationId,
          error: error.message,
        },
      });
      throw error;
    }

    if (!ctx.actor?.userId) {
      const error = ErrorUtils.createAuthError(
        "User authentication required for RLS operations"
      );
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: "RLS operation attempted without user authentication",
        userId: undefined,
        tenantId: ctx.tenant.tenantId,
        resource: {
          type: this.entityName,
          id: "auth_violation",
          name: `${this.entityName}_auth_violation`,
        },
        metadata: {
          correlationId: ctx.correlationId,
        },
      });
      throw error;
    }

    try {
      return await withTenantRLS(
        ctx.tenant.tenantId,
        ctx.actor.roles || [],
        operation,
        ctx.actor.userId
      );
    } catch (error) {
      // Log RLS operation failures for security monitoring
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: `RLS operation failed for ${this.entityName}`,
        userId: ctx.actor.userId,
        tenantId: ctx.tenant.tenantId,
        resource: {
          type: this.entityName,
          id: "rls_operation_failure",
          name: `${this.entityName}_rls_failure`,
        },
        metadata: {
          correlationId: ctx.correlationId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  /**
   * Execute bulk operations with RLS and audit logging
   *
   * @param ctx - Request context
   * @param items - Array of items to process
   * @param operation - Operation to perform on each item
   * @param batchSize - Number of items to process in each batch
   * @returns Promise with bulk operation results
   */
  protected async withBulkRLS<I, R>(
    ctx: RequestContext,
    items: I[],
    operation: (item: I, prisma: PrismaClient) => Promise<R>,
    batchSize: number = 50
  ): Promise<R[]> {
    const results: R[] = [];
    const startTime = Date.now();

    await this.auditService.logEvent({
      type: AuditEventType.UPDATE,
      severity: AuditSeverity.MEDIUM,
      description: `Starting bulk operation on ${this.entityName} - ${items.length} items`,
      userId: ctx.actor?.userId,
      tenantId: ctx.tenant?.tenantId,
      resource: {
        type: this.entityName,
        id: "bulk_operation_start",
        name: `${this.entityName}_bulk_start`,
      },
      metadata: {
        correlationId: ctx.correlationId,
        itemCount: items.length,
        batchSize,
      },
    });

    try {
      // Process items in batches
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        const batchResults = await this.withTenantRLS(ctx, async (prisma) => {
          return Promise.all(batch.map((item) => operation(item, prisma)));
        });

        results.push(...batchResults);
      }

      await this.auditService.logEvent({
        type: AuditEventType.UPDATE,
        severity: AuditSeverity.MEDIUM,
        description: `Completed bulk operation on ${this.entityName} - ${results.length}/${items.length} successful`,
        userId: ctx.actor?.userId,
        tenantId: ctx.tenant?.tenantId,
        resource: {
          type: this.entityName,
          id: "bulk_operation_success",
          name: `${this.entityName}_bulk_success`,
        },
        metadata: {
          correlationId: ctx.correlationId,
          totalItems: items.length,
          successfulItems: results.length,
          executionTime: Date.now() - startTime,
        },
      });

      return results;
    } catch (error) {
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: `Failed bulk operation on ${this.entityName}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: ctx.actor?.userId,
        tenantId: ctx.tenant?.tenantId,
        resource: {
          type: this.entityName,
          id: "bulk_operation_failure",
          name: `${this.entityName}_bulk_failure`,
        },
        metadata: {
          correlationId: ctx.correlationId,
          error: error instanceof Error ? error.message : String(error),
          totalItems: items.length,
          processedItems: results.length,
          executionTime: Date.now() - startTime,
        },
      });
      throw error;
    }
  }

  /**
   * Validate entity ownership and permissions using RBAC
   *
   * Ensures the actor has permission to access/modify the specified entity.
   *
   * @param ctx - Request context
   * @param entityId - Entity ID to check
   * @param requiredPermission - Required permission string
   * @throws InsufficientPermissionsError if access is denied
   */
  protected async validateAccess(
    ctx: RequestContext,
    entityId: EntityId,
    requiredPermission: string
  ): Promise<void> {
    if (!ctx.tenant?.tenantId) {
      throw new InsufficientPermissionsError(
        "Tenant context required",
        requiredPermission
      );
    }

    if (!ctx.actor?.userId) {
      throw new InsufficientPermissionsError(
        "User authentication required",
        requiredPermission
      );
    }

    // Check permissions using RBAC service
    const permissionCheck = await this.rbacService.checkPermission({
      user: {
        userId: ctx.actor.userId,
        tenantId: ctx.tenant.tenantId,
        roles: ctx.actor.roles || [],
      },
      resource: {
        type: this.entityName,
        id: entityId,
      },
      action: requiredPermission,
      context: {
        correlationId: ctx.correlationId,
        requestPath: ctx.request?.url,
      },
    });

    if (!permissionCheck.granted) {
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: `Access denied for ${requiredPermission} on ${this.entityName}`,
        userId: ctx.actor.userId,
        tenantId: ctx.tenant.tenantId,
        resource: {
          type: this.entityName,
          id: entityId,
          name: `${this.entityName}_access_denied`,
        },
        metadata: {
          correlationId: ctx.correlationId,
          requiredPermission,
          reason: permissionCheck.reason,
          missingPermissions: permissionCheck.missingPermissions,
        },
      });

      throw new InsufficientPermissionsError(
        `Access denied: ${
          permissionCheck.reason || "Insufficient permissions"
        }`,
        requiredPermission
      );
    }
  }

  /**
   * Validate input data using ValidationFactory
   *
   * @param data - Data to validate
   * @param context - Validation context
   * @returns ValidationResult with success/failure status
   */
  protected async validateInput<D>(
    data: D,
    context: ValidationContext
  ): Promise<ValidationResult<D>> {
    try {
      // Perform basic validation checks
      const issues: ValidationIssue[] = [];

      // Add validation logic here - can be overridden in child classes
      // Note: Business rules validation requires RequestContext, handled separately

      if (issues.length > 0) {
        return ValidationFactory.failure(issues, context);
      }

      return ValidationFactory.success(data, undefined, context);
    } catch (error) {
      return ValidationFactory.failure(
        [
          {
            field: "general",
            message:
              error instanceof Error ? error.message : "Validation failed",
            code: "VALIDATION_ERROR",
          },
        ],
        context
      );
    }
  }

  /**
   * Apply optimistic concurrency control
   *
   * Ensures entity version matches expected version before update.
   *
   * @param entity - Entity with current version
   * @param expectedVersion - Expected version from client
   * @throws OptimisticLockError if versions don't match
   */
  protected validateVersion(entity: BaseEntity, expectedVersion: number): void {
    if (entity.version !== expectedVersion) {
      throw new OptimisticLockError(
        this.entityName,
        entity.id,
        expectedVersion
      );
    }
  }

  /**
   * Standardized error handling and response transformation using ErrorUtils
   *
   * Converts service-level errors into appropriate API responses.
   *
   * @param error - The error to handle
   * @param correlationId - Request correlation ID
   * @returns Standardized error response
   */
  protected handleError(
    error: unknown,
    correlationId?: string
  ): ApiResponse<never> {
    // Use ErrorUtils for comprehensive error handling
    const errorInfo = ErrorUtils.safeGetErrorInfo(error);

    if (error instanceof BusinessRuleViolation) {
      const businessError = ErrorUtils.createBusinessError(error.message, {
        context: { violations: error.violations },
      });
      return createErrorResponse({
        code: "BUSINESS_RULE_VIOLATION",
        message: businessError.message,
        correlationId,
        details: {
          violations: error.violations,
          severity: businessError.severity,
          category: businessError.category,
        },
      });
    }

    if (error instanceof InsufficientPermissionsError) {
      const authzError = ErrorUtils.createAuthzError(error.message, {
        context: { requiredPermission: error.requiredPermission },
      });
      return createErrorResponse({
        code: "INSUFFICIENT_PERMISSIONS",
        message: authzError.message,
        correlationId,
        details: {
          requiredPermission: error.requiredPermission,
          severity: authzError.severity,
          category: authzError.category,
        },
      });
    }

    if (error instanceof EntityNotFoundError) {
      const notFoundError = ErrorUtils.createNotFoundError(error.message);
      return createErrorResponse({
        code: "ENTITY_NOT_FOUND",
        message: notFoundError.message,
        correlationId,
        details: {
          severity: notFoundError.severity,
          category: notFoundError.category,
        },
      });
    }

    if (error instanceof OptimisticLockError) {
      const conflictError = ErrorUtils.createConflictError(error.message);
      return createErrorResponse({
        code: "OPTIMISTIC_LOCK_ERROR",
        message: conflictError.message,
        correlationId,
        details: {
          severity: conflictError.severity,
          category: conflictError.category,
        },
      });
    }

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;

      switch (prismaError.code) {
        case "P2002": // Unique constraint violation
          const duplicateError = ErrorUtils.createConflictError(
            "An entity with this information already exists"
          );
          return createErrorResponse({
            code: "DUPLICATE_ENTITY",
            message: duplicateError.message,
            correlationId,
            details: {
              field: prismaError.meta?.target,
              severity: duplicateError.severity,
              category: duplicateError.category,
            },
          });

        case "P2025": // Record not found
          const recordNotFoundError = ErrorUtils.createNotFoundError(
            "The requested entity was not found"
          );
          return createErrorResponse({
            code: "ENTITY_NOT_FOUND",
            message: recordNotFoundError.message,
            correlationId,
            details: {
              severity: recordNotFoundError.severity,
              category: recordNotFoundError.category,
            },
          });

        case "P2003": // Foreign key constraint violation
          const fkError = ErrorUtils.createBusinessError(
            "Referenced entity does not exist"
          );
          return createErrorResponse({
            code: "FOREIGN_KEY_VIOLATION",
            message: fkError.message,
            correlationId,
            details: {
              field: prismaError.meta?.field_name,
              severity: fkError.severity,
              category: fkError.category,
            },
          });
      }
    }

    // Generic error fallback
    const internalError = ErrorUtils.createInternalError(errorInfo.message);
    return createErrorResponse({
      code: "INTERNAL_ERROR",
      message: internalError.message,
      correlationId,
      details: {
        severity: internalError.severity,
        category: internalError.category,
      },
    });
  }

  /**
   * Build audit metadata for entity operations
   *
   * Creates standardized audit metadata for database operations.
   *
   * @param ctx - Request context
   * @returns Audit metadata object
   */
  protected buildAuditMetadata(ctx: RequestContext) {
    return {
      createdBy: ctx.actor?.userId,
      updatedBy: ctx.actor?.userId,
      tenantId: ctx.tenant?.tenantId,
      correlationId: ctx.correlationId,
    };
  }

  /**
   * Validate business rules for entity operations
   *
   * Override in child classes to implement entity-specific business rules.
   *
   * @param ctx - Request context
   * @param data - Entity data to validate
   * @param operation - Operation being performed
   * @throws BusinessRuleViolation if rules are violated
   */
  protected async validateBusinessRules(
    ctx: RequestContext,
    data: Partial<T>,
    operation: AuditAction
  ): Promise<void> {
    // Base implementation - override in child classes
    // Default validation can include common rules like:
    // - Required fields
    // - Data format validation
    // - Cross-field constraints
  }

  /**
   * Apply default values and transformations
   *
   * Override in child classes to apply entity-specific defaults.
   *
   * @param ctx - Request context
   * @param data - Input data
   * @returns Transformed data with defaults applied
   */
  protected applyDefaults(
    ctx: RequestContext,
    data: CreateInput<T> | UpdateInput<T>
  ): CreateInput<T> | UpdateInput<T> {
    return data;
  }

  /**
   * Pre-save hook for additional processing
   *
   * Override in child classes for custom pre-save logic.
   *
   * @param ctx - Request context
   * @param data - Entity data
   * @param operation - Operation being performed
   */
  protected async beforeSave(
    ctx: RequestContext,
    data: Partial<T>,
    operation: AuditAction
  ): Promise<void> {
    // Override in child classes
  }

  /**
   * Post-save hook for additional processing
   *
   * Override in child classes for custom post-save logic.
   *
   * @param ctx - Request context
   * @param entity - Saved entity
   * @param operation - Operation that was performed
   */
  protected async afterSave(
    ctx: RequestContext,
    entity: T,
    operation: AuditAction
  ): Promise<void> {
    // Override in child classes
  }
}
