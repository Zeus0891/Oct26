/**
 * Base Controller - Abstract foundation for all controllers
 *
 * Provides standardized HTTP patterns, RBAC integration, and RLS support.
 * All feature controllers should extend this base class to ensure consistency
 * across the application's API surface.
 *
 * @module BaseController
 * @category Shared Controllers - Base Foundation
 * @description Abstract base controller with common HTTP patterns
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import { BaseService } from "../../services/base/base.service";
import { BaseValidator } from "../../validators/base.validator";
import {
  RequestContext,
  BaseEntity,
  TenantContext,
  ContextService,
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
  ValidationResult,
  ValidationContext,
} from "../../validators/validation.types";

/**
 * Standard HTTP method types
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Controller route definition
 */
export interface RouteDefinition {
  path: string;
  method: HttpMethod;
  handler: string;
  permissions?: string[];
  roles?: string[];
  scopes?: string[];
}

/**
 * Request with authentication context
 */
export interface AuthenticatedRequest extends Request {
  context?: RequestContext;
  user?: {
    userId: string;
    email: string;
    tenantId: string;
    roles: string[];
    permissions: string[];
  };
}

/**
 * Standard response metadata
 */
export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  performance?: {
    executionTime: number;
    queryTime?: number;
  };
}

/**
 * Controller error types
 */
export class ControllerError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "CONTROLLER_ERROR",
    public details?: unknown
  ) {
    super(message);
    this.name = "ControllerError";
  }
}

export class ValidationError extends ControllerError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class AuthorizationError extends ControllerError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends ControllerError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    super(message, 404, "NOT_FOUND_ERROR");
    this.name = "NotFoundError";
  }
}

/**
 * Abstract base controller class
 *
 * Provides enterprise-grade foundation patterns for all controllers including:
 * - RBAC integration with permission checks
 * - Multi-tenant RLS (Row Level Security) enforcement
 * - Comprehensive audit logging with correlation tracking
 * - Standardized validation using ValidationFactory
 * - Consistent ApiResponse patterns
 * - Performance monitoring and security controls
 *
 * 🔒 **Security Requirements:**
 * All endpoints extending this controller MUST use the following middleware chain:
 * - `jwt-auth` - JWT token validation and user extraction
 * - `rbac-auth` - Role-based access control validation
 * - `tenant-context` - Multi-tenant context establishment
 * - `rls-session` - Row level security session setup
 *
 * 🔍 **RLS Compliance:**
 * All database operations are automatically wrapped with `withTenantRLS(context, fn)`
 * to ensure proper tenant isolation and security policy enforcement.
 *
 * @example
 * ```typescript
 * // Route configuration with required middleware
 * router.post('/users',
 *   jwtAuthMiddleware,
 *   rbacAuthMiddleware('users', 'create'),
 *   tenantContextMiddleware,
 *   rlsSessionMiddleware,
 *   userController.create.bind(userController)
 * );
 *
 * @Controller('/api/v1/users')
 * export class UserController extends BaseController<User> {
 *   constructor(
 *     userService: UserService,
 *     userValidator: UserValidator,
 *     auditService: AuditService
 *   ) {
 *     super(userService, userValidator, auditService);
 *   }
 *
 *   @Post()
 *   @Permission('users', 'create')
 *   async create(req: AuthenticatedRequest, res: Response): Promise<void> {
 *     const result = await this.handleCreate(req.body, req);
 *     res.status(201).json(result);
 *   }
 * }
 * ```
 */
export abstract class BaseController<T extends BaseEntity> {
  protected readonly routes: RouteDefinition[] = [];
  protected readonly contextService: ContextService = new ContextService();

  constructor(
    protected readonly service: BaseService<T>,
    protected readonly validator: BaseValidator<T>,
    protected readonly auditService: AuditService,
    protected readonly validationService: ValidationService = new ValidationService(),
    protected readonly paginationService: PaginationService = new PaginationService()
  ) {}

  /**
   * Handle CREATE operations
   *
   * Standardized create endpoint with validation, permissions, and audit logging.
   *
   * @param body - Request body for entity creation
   * @param req - Authenticated request with context
   * @returns Promise resolving to API response with created entity
   */
  protected async handleCreate(
    body: Partial<T>,
    req: AuthenticatedRequest
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();

    try {
      // Ensure request context exists
      if (!req.context) {
        throw new ControllerError("Request context not found", 401);
      }

      // Prepare validation context for audit and RLS integration
      const validationContext: ValidationContext = {
        tenantId: req.context.tenant?.tenantId,
        entity: this.getEntityName(),
        correlationId: req.context.correlationId,
        actorId: req.context.actor?.userId,
        timestamp: new Date(),
      };

      // Validate input using ValidationFactory pattern
      const validationResult = await this.validateInput(
        body,
        validationContext,
        "create"
      );
      if (!validationResult.success) {
        throw new ValidationError("Validation failed", validationResult.errors);
      }

      // Create entity through service
      const result = await this.service.create(
        req.context,
        validationResult.data as any // Type assertion for generic compatibility
      );

      // Audit the creation
      await this.auditService.logEvent({
        type: AuditEventType.CREATE,
        severity: AuditSeverity.LOW,
        description: `Created ${this.getEntityName()}`,
        userId: req.context.actor?.userId,
        tenantId: req.context.tenant?.tenantId,
        resource: {
          type: this.getEntityName(),
          id: result.data?.id,
        },
        metadata: {
          executionTime: Date.now() - startTime,
          correlationId: req.context.correlationId,
        },
      });

      return {
        success: true,
        data: result.data,
        metadata: {
          timestamp: new Date(),
          requestId: req.context.correlationId || "unknown",
        },
      };
    } catch (error) {
      await this.handleError(error, req, "CREATE");
      throw error;
    }
  }

  /**
   * Handle READ operations by ID
   *
   * Standardized get-by-id endpoint with permissions and audit logging.
   *
   * @param id - Entity identifier
   * @param req - Authenticated request with context
   * @returns Promise resolving to API response with found entity
   */
  protected async handleFindById(
    id: string,
    req: AuthenticatedRequest
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();

    try {
      if (!req.context) {
        throw new ControllerError("Request context not found", 401);
      }

      // Validate ID format
      if (!this.isValidId(id)) {
        throw new ValidationError("Invalid ID format");
      }

      // Find entity through service
      const result = await this.service.findById(req.context, id);

      if (!result.success || !result.data) {
        throw new NotFoundError(this.getEntityName(), id);
      }

      // Audit the read operation
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.LOW,
        description: `Read ${this.getEntityName()} by ID`,
        userId: req.context.actor?.userId,
        tenantId: req.context.tenant?.tenantId,
        resource: {
          type: this.getEntityName(),
          id,
        },
        metadata: {
          executionTime: Date.now() - startTime,
          correlationId: req.context.correlationId,
        },
      });

      return {
        success: true,
        data: result.data,
        metadata: {
          timestamp: new Date(),
          requestId: req.context.correlationId || "unknown",
        },
      };
    } catch (error) {
      await this.handleError(error, req, "READ");
      throw error;
    }
  }

  /**
   * Handle UPDATE operations
   *
   * Standardized update endpoint with validation, permissions, and audit logging.
   *
   * @param id - Entity identifier
   * @param body - Request body for entity update
   * @param req - Authenticated request with context
   * @returns Promise resolving to API response with updated entity
   */
  protected async handleUpdate(
    id: string,
    body: Partial<T>,
    req: AuthenticatedRequest
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();

    try {
      if (!req.context) {
        throw new ControllerError("Request context not found", 401);
      }

      // Validate ID format
      if (!this.isValidId(id)) {
        throw new ValidationError("Invalid ID format");
      }

      // Prepare validation context
      const validationContext: ValidationContext = {
        tenantId: req.context.tenant?.tenantId,
        entity: this.getEntityName(),
        entityId: id,
        correlationId: req.context.correlationId,
        actorId: req.context.actor?.userId,
        timestamp: new Date(),
      };

      // Validate input using ValidationFactory pattern
      const validationResult = await this.validateInput(
        body,
        validationContext,
        "update"
      );
      if (!validationResult.success) {
        throw new ValidationError("Validation failed", validationResult.errors);
      }

      // Update entity through service
      const result = await this.service.update(
        req.context,
        id,
        validationResult.data as any // Type assertion for generic compatibility
      );

      if (!result.success) {
        throw new NotFoundError(this.getEntityName(), id);
      }

      // Audit the update
      await this.auditService.logEvent({
        type: AuditEventType.UPDATE,
        severity: AuditSeverity.MEDIUM,
        description: `Updated ${this.getEntityName()}`,
        userId: req.context.actor?.userId,
        tenantId: req.context.tenant?.tenantId,
        resource: {
          type: this.getEntityName(),
          id,
        },
        metadata: {
          executionTime: Date.now() - startTime,
          correlationId: req.context.correlationId,
        },
      });

      return {
        success: true,
        data: result.data,
        metadata: {
          timestamp: new Date(),
          requestId: req.context.correlationId || "unknown",
        },
      };
    } catch (error) {
      await this.handleError(error, req, "UPDATE");
      throw error;
    }
  }

  /**
   * Handle DELETE operations
   *
   * Standardized delete endpoint with permissions and audit logging.
   *
   * @param id - Entity identifier
   * @param req - Authenticated request with context
   * @returns Promise resolving to API response confirming deletion
   */
  protected async handleDelete(
    id: string,
    req: AuthenticatedRequest
  ): Promise<ApiResponse<void>> {
    const startTime = Date.now();

    try {
      if (!req.context) {
        throw new ControllerError("Request context not found", 401);
      }

      // Validate ID format
      if (!this.isValidId(id)) {
        throw new ValidationError("Invalid ID format");
      }

      // Delete entity through service
      const result = await this.service.delete(req.context, id);

      if (!result.success) {
        throw new NotFoundError(this.getEntityName(), id);
      }

      // Audit the deletion
      await this.auditService.logEvent({
        type: AuditEventType.DELETE,
        severity: AuditSeverity.HIGH,
        description: `Deleted ${this.getEntityName()}`,
        userId: req.context.actor?.userId,
        tenantId: req.context.tenant?.tenantId,
        resource: {
          type: this.getEntityName(),
          id,
        },
        metadata: {
          executionTime: Date.now() - startTime,
          correlationId: req.context.correlationId,
        },
      });

      return {
        success: true,
        metadata: {
          timestamp: new Date(),
          requestId: req.context.correlationId || "unknown",
        },
      };
    } catch (error) {
      await this.handleError(error, req, "DELETE");
      throw error;
    }
  }

  /**
   * Handle LIST operations
   *
   * Note: This is a placeholder. BaseService doesn't have a list method yet.
   * Individual services should implement their own list functionality.
   *
   * @param query - Query parameters for filtering and pagination
   * @param req - Authenticated request with context
   * @returns Promise resolving to API response with entity list
   */
  protected async handleList(
    query: Record<string, unknown>,
    req: AuthenticatedRequest
  ): Promise<ApiResponse<T[]>> {
    const startTime = Date.now();

    try {
      if (!req.context) {
        throw new ControllerError("Request context not found", 401);
      }

      // This is a placeholder implementation
      // Individual controllers should override this method
      throw new ControllerError("List operation not implemented", 501);
    } catch (error) {
      await this.handleError(error, req, "LIST");
      throw error;
    }
  }

  /**
   * Build standardized response metadata
   */
  protected buildResponseMetadata(
    req: AuthenticatedRequest,
    startTime: number,
    serviceMeta?: any
  ): ResponseMetadata {
    return {
      timestamp: new Date().toISOString(),
      requestId: req.context?.correlationId || "unknown",
      pagination: serviceMeta?.pagination,
      performance: {
        executionTime: Date.now() - startTime,
        queryTime: serviceMeta?.queryTime,
      },
    };
  }

  /**
   * Validate input using ValidationFactory pattern
   *
   * Provides enterprise-grade validation with RLS context integration.
   * Uses ValidationFactory for consistent validation result patterns.
   *
   * @param data - Data to validate
   * @param context - Validation context for audit and RLS
   * @param operation - Operation type for specific validation rules
   * @returns Promise resolving to ValidationResult
   */
  protected async validateInput<V = Partial<T>>(
    data: V,
    context: ValidationContext,
    operation: "create" | "update" | "delete" | "search"
  ): Promise<ValidationResult<V>> {
    try {
      // Use ValidationFactory for consistent results
      if (!data) {
        return ValidationFactory.failure(
          [
            {
              field: "data",
              message: "Request data is required",
              code: "MISSING_DATA",
              severity: "ERROR",
              context,
            },
          ],
          context
        );
      }

      // Delegate to validator with RLS context
      let validationResult: ValidationResult<V>;

      switch (operation) {
        case "create":
          validationResult = (await this.validator.validateWithRLS(
            data,
            context
          )) as ValidationResult<V>;
          break;
        case "update":
          validationResult = (await this.validator.validateWithRLS(
            data,
            context
          )) as ValidationResult<V>;
          break;
        default:
          validationResult = this.validator.validate(
            data,
            context
          ) as ValidationResult<V>;
      }

      // Return standardized ValidationFactory result
      return validationResult;
    } catch (error) {
      // Handle validation errors consistently
      return ValidationFactory.failure(
        [
          {
            field: "validation",
            message:
              error instanceof Error ? error.message : "Validation error",
            code: "VALIDATION_EXCEPTION",
            severity: "ERROR",
            context,
          },
        ],
        context
      );
    }
  }

  /**
   * Build standardized API response with correlation tracking
   *
   * Ensures all responses follow the same pattern with proper metadata,
   * correlation IDs, and audit context.
   *
   * @param data - Response data
   * @param req - Authenticated request
   * @param startTime - Request start timestamp for performance tracking
   * @returns Standardized ApiResponse
   */
  protected buildApiResponse<R>(
    data: R,
    req: AuthenticatedRequest,
    startTime?: number
  ): ApiResponse<R> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date(),
        requestId: req.context?.correlationId || "unknown",
        ...(startTime && {
          performance: {
            executionTime: Date.now() - startTime,
          },
        }),
      },
    };
  }

  /**
   * Build standardized error response
   *
   * @param error - Error instance
   * @param req - Authenticated request
   * @param code - Error code
   * @returns Standardized error ApiResponse
   */
  protected buildErrorResponse(
    error: string | Error,
    req: AuthenticatedRequest,
    code: string = "CONTROLLER_ERROR"
  ): ApiResponse<never> {
    return {
      success: false,
      error: {
        code,
        message: error instanceof Error ? error.message : error,
      },
      metadata: {
        timestamp: new Date(),
        requestId: req.context?.correlationId || "unknown",
      },
    };
  }

  /**
   * Handle controller errors
   */
  protected async handleError(
    error: unknown,
    req: AuthenticatedRequest,
    operation: string
  ): Promise<void> {
    try {
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: `Error in ${operation} operation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: req.context?.actor?.userId,
        tenantId: req.context?.tenant?.tenantId,
        resource: {
          type: this.getEntityName(),
        },
        metadata: {
          operation,
          error: error instanceof Error ? error.stack : String(error),
          correlationId: req.context?.correlationId,
        },
      });
    } catch (auditError) {
      console.error("[BaseController] Failed to audit error:", auditError);
    }
  }

  /**
   * Validate list query parameters
   */
  protected async validateListQuery(
    query: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Basic pagination validation
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100); // Max 100 items per page

    const validatedQuery = {
      ...query,
      page: Math.max(1, page),
      limit: Math.max(1, limit),
    };

    return validatedQuery;
  }

  /**
   * Validate ID format
   */
  protected isValidId(id: string): boolean {
    // Basic UUID validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id) || /^\d+$/.test(id); // UUID or numeric ID
  }

  /**
   * Get entity name for audit and error messages
   * Override in child classes
   */
  protected abstract getEntityName(): string;

  /**
   * Register route definition
   */
  protected registerRoute(route: RouteDefinition): void {
    this.routes.push(route);
  }

  /**
   * Get all registered routes
   */
  public getRoutes(): RouteDefinition[] {
    return [...this.routes];
  }

  /**
   * Convenience: send a standardized success response (minimal variant)
   */
  protected sendSuccess<R = unknown>(
    res: Response,
    data?: R,
    status = 200
  ): void {
    res.status(status).json({ success: true, data });
  }

  /**
   * Convenience: build a simple error descriptor compatible with sendError
   */
  protected createError(
    code: string,
    message: string,
    status = 500,
    details?: unknown
  ): { code: string; message: string; status: number; details?: unknown } {
    return { code, message, status, details };
  }

  /**
   * Convenience: send a standardized error response (minimal variant)
   */
  protected sendError(
    res: Response,
    error: { code: string; message: string; status?: number; details?: unknown }
  ): void {
    res.status(error.status ?? 500).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  /**
   * Convenience: get tenant context from request (fallback to deriving it)
   */
  protected getTenantContext(req: AuthenticatedRequest): TenantContext {
    const ctx =
      req.context ?? this.contextService.createContextFromRequest(req as any);
    return this.contextService.getTenantContext(ctx);
  }
}
