/**
 * Context Service - Request and tenant context management
 *
 * Provides context validation, RLS claim management, and multi-tenant isolation
 * for all shared services. Implements the RequestContext pattern from Action Plan.
 *
 * @module ContextService
 * @category Shared Services - Base Infrastructure
 * @description Context management and tenant isolation service
 * @version 1.0.0
 */

/**
 * Base entity interface with audit fields
 */
export interface BaseEntity {
  /** Unique entity identifier */
  id: string;
  /** Entity creation timestamp */
  createdAt: Date;
  /** Entity last update timestamp */
  updatedAt: Date;
  /** Entity version for optimistic concurrency control */
  version: number;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** User ID who created the entity */
  createdBy?: string;
  /** User ID who last updated the entity */
  updatedBy?: string;
}

/**
 * Actor context - authenticated user information
 */
export interface ActorContext {
  /** User ID */
  userId: string;
  /** Member ID within tenant */
  memberId: string;
  /** Tenant ID */
  tenantId: string;
  /** User roles */
  roles: string[];
  /** User permissions */
  permissions: string[];
  /** Session ID */
  sessionId?: string;
  /** User email */
  email?: string;
  /** User display name */
  displayName?: string;
}

/**
 * Tenant context for multi-tenant operations
 */
export interface TenantContext {
  /** Tenant ID */
  tenantId: string;
  /** Tenant slug/identifier */
  tenantSlug?: string;
  /** Tenant name */
  tenantName?: string;
  /** Data isolation level */
  isolationLevel?:
    | "SHARED_DATABASE"
    | "DEDICATED_SCHEMA"
    | "DEDICATED_DATABASE";
  /** Compliance level */
  complianceLevel?: "BASIC" | "STANDARD" | "ENTERPRISE" | "SOC2";
}

/**
 * Request metadata information
 */
export interface RequestMetadata {
  /** Client IP address */
  ip?: string;
  /** User agent string */
  userAgent?: string;
  /** Request timestamp */
  timestamp: Date;
  /** Request method */
  method?: string;
  /** Request URL */
  url?: string;
  /** Additional headers */
  headers?: Record<string, string>;
}

/**
 * Request context - standardized context for all operations
 */
export interface RequestContext {
  /** Correlation ID for request tracking */
  correlationId: string;
  /**
   * Legacy convenience field for actor ID
   * Note: Prefer ctx.actor.userId going forward
   */
  userId?: string;
  /**
   * Legacy convenience field for tenant ID
   * Note: Prefer ctx.tenant.tenantId or ctx.actor.tenantId going forward
   */
  tenantId?: string;
  /**
   * Legacy convenience field for raw user info
   * Note: Prefer ctx.actor for structured access
   */
  user?: {
    id: string;
    tenantId?: string;
    memberId?: string;
    roles?: string[];
    permissions?: string[];
  };
  /** Authenticated actor information */
  actor?: ActorContext;
  /** Tenant context */
  tenant?: TenantContext;
  /** Request metadata */
  request?: RequestMetadata;
  /**
   * Legacy convenience timestamp at root level
   * Note: Prefer request.timestamp going forward
   */
  timestamp?: Date;
  /**
   * Legacy convenience method at root level
   * Note: Prefer request.method going forward
   */
  method?: string;
  /**
   * Legacy convenience request path at root level
   * Note: Prefer request.url going forward
   */
  path?: string;
  /**
   * Legacy convenience IP address at root level
   * Note: Prefer request.ip going forward
   */
  ipAddress?: string;
  /**
   * Legacy convenience user agent at root level
   * Note: Prefer request.userAgent going forward
   */
  userAgent?: string;
}

/**
 * RLS claims for PostgreSQL row level security
 */
export interface RLSClaims {
  /** Tenant ID */
  tenant_id: string;
  /** User ID */
  user_id?: string;
  /** Member ID */
  member_id?: string;
  /** User roles array */
  roles?: string[];
  /** Session ID */
  session_id?: string;
}

/**
 * Context validation result
 */
export interface ContextValidationResult {
  /** Whether context is valid */
  isValid: boolean;
  /** Validation errors if any */
  errors?: string[];
  /** Validated context */
  context?: RequestContext;
}

/**
 * Context service for managing request contexts and tenant isolation
 *
 * Provides utilities for context validation, RLS claim generation,
 * and multi-tenant operation support.
 *
 * @example
 * ```typescript
 * const contextService = new ContextService();
 *
 * // Validate request context
 * const validation = await contextService.validateContext(ctx);
 * if (!validation.isValid) {
 *   throw new Error('Invalid context');
 * }
 *
 * // Generate RLS claims
 * const claims = contextService.generateRLSClaims(ctx);
 * ```
 */
export class ContextService {
  /**
   * Validate request context
   *
   * Ensures that the provided context has all required fields
   * and that the actor has appropriate tenant access.
   *
   * @param ctx - Request context to validate
   * @returns Validation result with errors if any
   */
  async validateContext(ctx: RequestContext): Promise<ContextValidationResult> {
    const errors: string[] = [];

    // Validate correlation ID
    if (!ctx.correlationId) {
      errors.push("Correlation ID is required");
    }

    // Validate actor context for authenticated operations
    if (ctx.actor) {
      if (!ctx.actor.userId) {
        errors.push("Actor user ID is required");
      }

      if (!ctx.actor.memberId) {
        errors.push("Actor member ID is required");
      }

      if (!ctx.actor.tenantId) {
        errors.push("Actor tenant ID is required");
      }

      if (!Array.isArray(ctx.actor.roles)) {
        errors.push("Actor roles must be an array");
      }

      if (!Array.isArray(ctx.actor.permissions)) {
        errors.push("Actor permissions must be an array");
      }
    }

    // Validate tenant context
    if (ctx.tenant) {
      if (!ctx.tenant.tenantId) {
        errors.push("Tenant ID is required");
      }
    }

    // Cross-validate actor and tenant consistency
    if (ctx.actor && ctx.tenant) {
      if (ctx.actor.tenantId !== ctx.tenant.tenantId) {
        errors.push("Actor and tenant context must have matching tenant IDs");
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      context: errors.length === 0 ? ctx : undefined,
    };
  }

  /**
   * Generate RLS claims for database operations
   *
   * Converts request context into PostgreSQL RLS claims format
   * for use with withRLS operations.
   *
   * @param ctx - Request context
   * @returns RLS claims object
   */
  generateRLSClaims(ctx: RequestContext): RLSClaims {
    const claims: RLSClaims = {
      tenant_id: ctx.tenant?.tenantId || ctx.actor?.tenantId || "",
    };

    if (ctx.actor) {
      claims.user_id = ctx.actor.userId;
      claims.member_id = ctx.actor.memberId;
      claims.roles = ctx.actor.roles;
      claims.session_id = ctx.actor.sessionId;
    }

    return claims;
  }

  /**
   * Create request context from Express request
   *
   * Extracts context information from Express request object,
   * typically populated by authentication middleware.
   *
   * @param req - Express request object
   * @returns Request context
   */
  createContextFromRequest(req: any): RequestContext {
    return {
      correlationId: req.correlationId || this.generateCorrelationId(),
      userId: req.user?.id || req.user?.userId,
      tenantId: req.tenant?.id || req.tenant?.tenantId || req.user?.tenantId,
      method: req.method,
      path:
        req.path ||
        (req.originalUrl
          ? new URL(
              req.originalUrl,
              `http://${req.headers?.host || "localhost"}`
            ).pathname
          : undefined),
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get ? req.get("User-Agent") : req.headers?.["user-agent"],
      user: req.user
        ? {
            id: req.user.id || req.user.userId,
            tenantId: req.user.tenantId,
            memberId: req.user.memberId,
            roles: req.user.roles || [],
            permissions: req.user.permissions || [],
          }
        : undefined,
      actor: req.user
        ? {
            userId: req.user.id || req.user.userId,
            memberId: req.user.memberId,
            tenantId: req.user.tenantId,
            roles: req.user.roles || [],
            permissions: req.user.permissions || [],
            sessionId: req.user.sessionId,
            email: req.user.email,
            displayName:
              req.user.displayName ||
              `${req.user.firstName} ${req.user.lastName}`.trim(),
          }
        : undefined,
      tenant: req.tenant
        ? {
            tenantId: req.tenant.id || req.tenant.tenantId,
            tenantSlug: req.tenant.slug,
            tenantName: req.tenant.name,
            isolationLevel: req.tenant.isolationLevel,
            complianceLevel: req.tenant.complianceLevel,
          }
        : undefined,
      request: {
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get("User-Agent"),
        timestamp: new Date(),
        method: req.method,
        url: req.originalUrl || req.url,
        headers: req.headers,
      },
    };
  }

  /**
   * Generate correlation ID for request tracking
   *
   * Creates a unique identifier for correlating logs and operations
   * across the request lifecycle.
   *
   * @returns Unique correlation ID
   */
  generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get tenant context for operations
   *
   * Extracts or creates tenant context from request context,
   * ensuring required fields are present.
   *
   * @param ctx - Request context
   * @returns Tenant context
   * @throws Error if tenant context is invalid
   */
  getTenantContext(ctx: RequestContext): TenantContext {
    if (!ctx.tenant && !ctx.actor?.tenantId) {
      throw new Error("Tenant context is required for this operation");
    }

    return (
      ctx.tenant || {
        tenantId: ctx.actor!.tenantId,
        tenantSlug: undefined,
        tenantName: undefined,
      }
    );
  }

  /**
   * Get actor context for operations
   *
   * Extracts actor context from request context,
   * ensuring authentication is present.
   *
   * @param ctx - Request context
   * @returns Actor context
   * @throws Error if actor context is invalid
   */
  getActorContext(ctx: RequestContext): ActorContext {
    if (!ctx.actor) {
      throw new Error("Authentication is required for this operation");
    }

    return ctx.actor;
  }

  /**
   * Validate access to specific tenant
   *
   * Ensures the authenticated actor has access to the specified tenant.
   *
   * @param ctx - Request context
   * @param targetTenantId - Tenant ID to validate access for
   * @returns Whether access is allowed
   */
  async validateTenantAccess(
    ctx: RequestContext,
    targetTenantId: string
  ): Promise<boolean> {
    if (!ctx.actor) {
      return false;
    }

    // Actor must belong to the target tenant
    return ctx.actor.tenantId === targetTenantId;
  }

  /**
   * Create system context for internal operations
   *
   * Creates a system-level context for internal operations
   * that don't originate from user requests.
   *
   * @param tenantId - Optional tenant ID for tenant-scoped operations
   * @returns System request context
   */
  createSystemContext(tenantId?: string): RequestContext {
    return {
      correlationId: `system-${this.generateCorrelationId()}`,
      tenant: tenantId
        ? {
            tenantId,
            tenantSlug: undefined,
            tenantName: undefined,
          }
        : undefined,
      request: {
        timestamp: new Date(),
        ip: "127.0.0.1",
        userAgent: "SystemService/1.0",
        method: "SYSTEM",
        url: "/internal",
      },
    };
  }

  /**
   * Merge context with additional information
   *
   * Safely merges additional context information while preserving
   * existing context structure.
   *
   * @param ctx - Base request context
   * @param additional - Additional context information
   * @returns Merged context
   */
  mergeContext(
    ctx: RequestContext,
    additional: Partial<RequestContext>
  ): RequestContext {
    return {
      ...ctx,
      ...additional,
      actor: additional.actor
        ? { ...ctx.actor, ...additional.actor }
        : ctx.actor,
      tenant: additional.tenant
        ? { ...ctx.tenant, ...additional.tenant }
        : ctx.tenant,
      request: additional.request
        ? { ...ctx.request, ...additional.request }
        : ctx.request,
    };
  }
}
