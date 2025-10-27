/**
 * CRUD Controller - Standard REST operations template
 *
 * Provides standardized CRUD (Create, Read, Update, Delete) operations
 * that can be extended by feature controllers for consistent REST patterns.
 *
 * @module CrudController
 * @category Shared Controllers - Base Foundation
 * @description Standard CRUD operations template
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import {
  BaseController,
  AuthenticatedRequest,
  ControllerError,
  ValidationError,
  NotFoundError,
} from "./base.controller";
import { BaseService } from "../../services/base/base.service";
import { BaseValidator } from "../../validators/base.validator";
import {
  RequestContext,
  BaseEntity,
} from "../../services/base/context.service";
import { ApiResponse } from "../../services/security/auth.service";
import {
  AuditService,
  AuditEventType,
  AuditSeverity,
} from "../../services/audit/audit.service";
import { ValidationService } from "../../services/base/validation.service";
import { PaginationService } from "../../services/base/pagination.service";
import {
  ValidationFactory,
  ValidationContext,
  ValidationResult,
} from "../../validators/validation.types";

/**
 * CRUD operation types
 */
export type CrudOperation = "CREATE" | "READ" | "UPDATE" | "DELETE" | "LIST";

/**
 * CRUD configuration options
 */
export interface CrudConfig {
  /** Enable soft delete instead of hard delete */
  softDelete?: boolean;
  /** Enable optimistic concurrency control */
  optimisticLocking?: boolean;
  /** Enable automatic timestamp management */
  autoTimestamps?: boolean;
  /** Enable audit logging for all operations */
  auditLogging?: boolean;
  /** Default pagination size */
  defaultPageSize?: number;
  /** Maximum allowed page size */
  maxPageSize?: number;
}

/**
 * Standard create request DTO
 */
export interface CreateRequestDto<T> {
  data: Partial<T>;
  metadata?: {
    correlationId?: string;
    source?: string;
    notes?: string;
  };
}

/**
 * Standard update request DTO
 */
export interface UpdateRequestDto<T> {
  data: Partial<T>;
  version?: number; // For optimistic locking
  metadata?: {
    correlationId?: string;
    source?: string;
    notes?: string;
  };
}

/**
 * Standard list query DTO
 */
export interface ListQueryDto {
  /** Page number (1-based) */
  page?: number;
  /** Page size */
  limit?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: "asc" | "desc";
  /** Search term */
  search?: string;
  /** Filters */
  filters?: Record<string, unknown>;
  /** Include related entities */
  include?: string[];
}

/**
 * Paginated response DTO
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Enterprise CRUD Controller
 *
 * Provides standardized CRUD operations with enterprise-grade security, validation,
 * audit logging, and RLS compliance. All database operations are automatically wrapped
 * with `withTenantRLS(context, fn)` for proper tenant isolation.
 *
 * 🔒 **Required Middleware Chain:**
 * All CRUD endpoints MUST be protected with the following middleware:
 * ```typescript
 * const crudMiddleware = [
 *   jwtAuthMiddleware,           // JWT authentication
 *   rbacAuthMiddleware,          // Role-based access control
 *   tenantContextMiddleware,     // Multi-tenant context
 *   rlsSessionMiddleware         // Row Level Security setup
 * ];
 * ```
 *
 * 🔍 **Security Features:**
 * - Automatic RLS enforcement for all database operations
 * - Comprehensive audit logging with correlation IDs
 * - ValidationFactory integration for consistent validation results
 * - Optimistic concurrency control for data integrity
 * - Standardized error handling with security event logging
 *
 * @example
 * ```typescript
 * // Route setup with required middleware
 * router.post('/users', ...crudMiddleware, userController.create.bind(userController));
 * router.get('/users/:id', ...crudMiddleware, userController.getById.bind(userController));
 * router.put('/users/:id', ...crudMiddleware, userController.update.bind(userController));
 * router.delete('/users/:id', ...crudMiddleware, userController.delete.bind(userController));
 * router.get('/users', ...crudMiddleware, userController.list.bind(userController));
 *
 * @Controller('/api/v1/users')
 * export class UserController extends CrudController<User> {
 *   constructor(
 *     userService: UserService,
 *     userValidator: UserValidator,
 *     auditService: AuditService
 *   ) {
 *     super(userService, userValidator, auditService, {
 *       softDelete: true,
 *       auditLogging: true,
 *       defaultPageSize: 20,
 *       optimisticLocking: true
 *     });
 *   }
 *
 *   protected getEntityName(): string {
 *     return 'User';
 *   }
 * }
 * ```
 */
export class CrudController<T extends BaseEntity> extends BaseController<T> {
  protected readonly config: Required<CrudConfig>;

  constructor(
    service: BaseService<T>,
    validator: BaseValidator<T>,
    auditService: AuditService,
    config: CrudConfig = {},
    validationService?: ValidationService,
    paginationService?: PaginationService
  ) {
    super(
      service,
      validator,
      auditService,
      validationService,
      paginationService
    );

    // Set default configuration
    this.config = {
      softDelete: config.softDelete ?? true,
      optimisticLocking: config.optimisticLocking ?? true,
      autoTimestamps: config.autoTimestamps ?? true,
      auditLogging: config.auditLogging ?? true,
      defaultPageSize: config.defaultPageSize ?? 20,
      maxPageSize: config.maxPageSize ?? 100,
    };
  }

  /**
   * Handle POST requests to create new entities
   *
   * 🔒 Middleware Requirements: jwt-auth, rbac-auth, tenant-context, rls-session
   * 🔍 RLS: All database operations use withTenantRLS for tenant isolation
   * 📝 Audit: Complete audit trail with correlation tracking
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Validate authentication and tenant context
      if (!req.context?.actor || !req.context?.tenant) {
        throw new ControllerError(
          "Authentication and tenant context required",
          401
        );
      }

      const body = req.body as CreateRequestDto<T>;

      // Enhanced validation with audit context
      const validationContext: ValidationContext = {
        tenantId: req.context.tenant.tenantId,
        entity: this.getEntityName(),
        correlationId: req.context.correlationId,
        actorId: req.context.actor.userId,
        timestamp: new Date(),
      };

      // Comprehensive audit logging for create operation
      await this.auditService.logEvent({
        type: AuditEventType.CREATE,
        severity: AuditSeverity.MEDIUM,
        description: `Creating new ${this.getEntityName()}`,
        userId: req.context.actor.userId,
        tenantId: req.context.tenant.tenantId,
        resource: {
          type: this.getEntityName(),
          name: `${this.getEntityName()}_create`,
        },
        metadata: {
          correlationId: req.context.correlationId,
          requestData: body.metadata,
          source: body.metadata?.source || "web",
        },
      });

      const result = await this.handleCreate(body.data, req);

      res.status(201).json(result);
    } catch (error) {
      // Enhanced error audit with correlation tracking
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: `Failed to create ${this.getEntityName()}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: req.context?.actor?.userId,
        tenantId: req.context?.tenant?.tenantId,
        resource: {
          type: this.getEntityName(),
          name: `${this.getEntityName()}_create_error`,
        },
        metadata: {
          correlationId: req.context?.correlationId,
          error: error instanceof Error ? error.stack : String(error),
          executionTime: Date.now() - startTime,
        },
      });

      next(error);
    }
  }

  /**
   * Handle GET requests to retrieve entities by ID
   *
   * 🔒 Middleware Requirements: jwt-auth, rbac-auth, tenant-context, rls-session
   * 🔍 RLS: Entity retrieval enforces tenant isolation via withTenantRLS
   * 📝 Audit: Read operations logged for security monitoring
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const startTime = Date.now();

    try {
      if (!req.context?.actor || !req.context?.tenant) {
        throw new ControllerError(
          "Authentication and tenant context required",
          401
        );
      }

      const { id } = req.params;

      // Audit read access attempt
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.LOW,
        description: `Accessing ${this.getEntityName()} by ID`,
        userId: req.context.actor.userId,
        tenantId: req.context.tenant.tenantId,
        resource: {
          type: this.getEntityName(),
          id: id,
          name: `${this.getEntityName()}_read`,
        },
        metadata: {
          correlationId: req.context.correlationId,
        },
      });

      const result = await this.handleFindById(id, req);

      res.status(200).json(result);
    } catch (error) {
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.MEDIUM,
        description: `Failed to read ${this.getEntityName()}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: req.context?.actor?.userId,
        tenantId: req.context?.tenant?.tenantId,
        resource: {
          type: this.getEntityName(),
          id: req.params.id,
          name: `${this.getEntityName()}_read_error`,
        },
        metadata: {
          correlationId: req.context?.correlationId,
          error: error instanceof Error ? error.stack : String(error),
          executionTime: Date.now() - startTime,
        },
      });

      next(error);
    }
  }

  /**
   * Handle PUT requests to update entities
   *
   * 🔒 Middleware Requirements: jwt-auth, rbac-auth, tenant-context, rls-session
   * 🔍 RLS: Updates enforce tenant isolation and optimistic locking via withTenantRLS
   * 📝 Audit: Complete audit trail including before/after data comparison
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const startTime = Date.now();

    try {
      if (!req.context?.actor || !req.context?.tenant) {
        throw new ControllerError(
          "Authentication and tenant context required",
          401
        );
      }

      const { id } = req.params;
      const body = req.body as UpdateRequestDto<T>;

      // Pre-update audit logging
      await this.auditService.logEvent({
        type: AuditEventType.UPDATE,
        severity: AuditSeverity.MEDIUM,
        description: `Updating ${this.getEntityName()}`,
        userId: req.context.actor.userId,
        tenantId: req.context.tenant.tenantId,
        resource: {
          type: this.getEntityName(),
          id: id,
          name: `${this.getEntityName()}_update`,
        },
        metadata: {
          correlationId: req.context.correlationId,
          updateData: body.metadata,
          version: body.version,
          source: body.metadata?.source || "web",
        },
      });

      const result = await this.handleUpdate(id, body.data, req);

      res.status(200).json(result);
    } catch (error) {
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: `Failed to update ${this.getEntityName()}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: req.context?.actor?.userId,
        tenantId: req.context?.tenant?.tenantId,
        resource: {
          type: this.getEntityName(),
          id: req.params.id,
          name: `${this.getEntityName()}_update_error`,
        },
        metadata: {
          correlationId: req.context?.correlationId,
          error: error instanceof Error ? error.stack : String(error),
          executionTime: Date.now() - startTime,
        },
      });

      next(error);
    }
  }

  /**
   * Handle DELETE requests to remove entities
   *
   * 🔒 Middleware Requirements: jwt-auth, rbac-auth, tenant-context, rls-session
   * 🔍 RLS: Deletions enforce tenant isolation and cascade rules via withTenantRLS
   * 📝 Audit: High-priority audit logging for all delete operations
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async delete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const startTime = Date.now();

    try {
      if (!req.context?.actor || !req.context?.tenant) {
        throw new ControllerError(
          "Authentication and tenant context required",
          401
        );
      }

      const { id } = req.params;

      // Pre-delete audit logging (HIGH severity for deletion attempts)
      await this.auditService.logEvent({
        type: AuditEventType.DELETE,
        severity: AuditSeverity.HIGH,
        description: `Deleting ${this.getEntityName()}`,
        userId: req.context.actor.userId,
        tenantId: req.context.tenant.tenantId,
        resource: {
          type: this.getEntityName(),
          id: id,
          name: `${this.getEntityName()}_delete`,
        },
        metadata: {
          correlationId: req.context.correlationId,
          softDelete: this.config.softDelete,
        },
      });

      const result = await this.handleDelete(id, req);

      res.status(200).json(result);
    } catch (error) {
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: `Failed to delete ${this.getEntityName()}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: req.context?.actor?.userId,
        tenantId: req.context?.tenant?.tenantId,
        resource: {
          type: this.getEntityName(),
          id: req.params.id,
          name: `${this.getEntityName()}_delete_error`,
        },
        metadata: {
          correlationId: req.context?.correlationId,
          error: error instanceof Error ? error.stack : String(error),
          executionTime: Date.now() - startTime,
          softDelete: this.config.softDelete,
        },
      });

      next(error);
    }
  }

  /**
   * Handle GET requests to list entities with pagination
   *
   * 🔒 Middleware Requirements: jwt-auth, rbac-auth, tenant-context, rls-session
   * 🔍 RLS: List operations automatically filter by tenant via withTenantRLS
   * 📝 Audit: List access logged for compliance and security monitoring
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const startTime = Date.now();

    try {
      if (!req.context?.actor || !req.context?.tenant) {
        throw new ControllerError(
          "Authentication and tenant context required",
          401
        );
      }

      const query = req.query as unknown as ListQueryDto;

      // Audit list access
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.LOW,
        description: `Listing ${this.getEntityName()} entities`,
        userId: req.context.actor.userId,
        tenantId: req.context.tenant.tenantId,
        resource: {
          type: this.getEntityName(),
          name: `${this.getEntityName()}_list`,
        },
        metadata: {
          correlationId: req.context.correlationId,
          queryParameters: query,
          page: query.page || 1,
          limit: query.limit || this.config.defaultPageSize,
        },
      });

      const result = await this.handleListWithPagination(query, req);

      res.status(200).json(result);
    } catch (error) {
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.MEDIUM,
        description: `Failed to list ${this.getEntityName()}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: req.context?.actor?.userId,
        tenantId: req.context?.tenant?.tenantId,
        resource: {
          type: this.getEntityName(),
          name: `${this.getEntityName()}_list_error`,
        },
        metadata: {
          correlationId: req.context?.correlationId,
          error: error instanceof Error ? error.stack : String(error),
          executionTime: Date.now() - startTime,
        },
      });

      next(error);
    }
  }

  /**
   * Handle PATCH requests for partial updates
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async patch(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body as Partial<T>;

      // For patch operations, we allow partial updates
      const result = await this.handleUpdate(id, body, req);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle OPTIONS requests for CORS support
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async options(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Tenant-ID",
        "Access-Control-Max-Age": "86400",
      });

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle list operations with pagination
   *
   * Placeholder implementation until BaseService supports list operations
   */
  protected async handleListWithPagination(
    query: ListQueryDto,
    req: AuthenticatedRequest
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    const startTime = Date.now();

    try {
      if (!req.context) {
        throw new ControllerError("Request context not found", 401);
      }

      // Validate pagination parameters
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(
        Number(query.limit) || this.config.defaultPageSize,
        this.config.maxPageSize
      );

      // This is a placeholder - individual controllers should override this
      // or we need to extend BaseService to support list operations
      throw new ControllerError(
        "List operation not implemented - override in child controller",
        501
      );
    } catch (error) {
      await this.handleError(error, req, "LIST");
      throw error;
    }
  }

  /**
   * Build paginated response structure
   */
  protected buildPaginatedResponse<U>(
    items: U[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResponse<U> {
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Validate CRUD configuration
   */
  protected validateConfig(): void {
    if (this.config.defaultPageSize <= 0) {
      throw new Error("Default page size must be greater than 0");
    }

    if (this.config.maxPageSize <= 0) {
      throw new Error("Maximum page size must be greater than 0");
    }

    if (this.config.defaultPageSize > this.config.maxPageSize) {
      throw new Error(
        "Default page size cannot be greater than maximum page size"
      );
    }
  }

  /**
   * Check if operation is allowed based on configuration
   */
  protected isOperationAllowed(operation: CrudOperation): boolean {
    // All operations are allowed by default
    // Override in child classes to implement custom restrictions
    return true;
  }

  /**
   * Get entity name for audit and error messages
   * Override in child classes
   */
  protected getEntityName(): string {
    return "Entity";
  }

  /**
   * Apply soft delete if enabled
   */
  protected async applySoftDelete(
    ctx: RequestContext,
    id: string
  ): Promise<ApiResponse<void>> {
    if (this.config.softDelete) {
      // Placeholder for soft delete implementation
      // This would typically update a 'deletedAt' field instead of hard deleting
      throw new ControllerError("Soft delete not yet implemented", 501);
    } else {
      return await this.service.delete(ctx, id);
    }
  }

  /**
   * Apply optimistic locking if enabled
   */
  protected validateOptimisticLock(
    currentVersion: number,
    providedVersion?: number
  ): void {
    if (this.config.optimisticLocking && providedVersion !== undefined) {
      if (currentVersion !== providedVersion) {
        throw new ControllerError(
          "Entity has been modified by another user. Please refresh and try again.",
          409, // Conflict
          "OPTIMISTIC_LOCK_FAILED"
        );
      }
    }
  }

  /**
   * Get configuration for this controller
   */
  public getConfig(): Required<CrudConfig> {
    return { ...this.config };
  }
}
