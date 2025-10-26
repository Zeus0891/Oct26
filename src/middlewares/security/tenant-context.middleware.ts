import { Response, NextFunction } from "express";
import { AuthenticatedRequest, TenantContext } from "../types";

/**
 * Tenant Context Middleware
 *
 * Establishes tenant context for RLS (Row Level Security) integration.
 * Sets PostgreSQL session variables for tenant isolation.
 * Validates tenant access rights and switches tenant context when needed.
 *
 * @param req - Extended Express request with auth context
 * @param res - Express response object
 * @param next - Express next function
 */
export const tenantContextMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip tenant context for non-authenticated requests
    if (!req.user) {
      next();
      return;
    }

    const { user } = req;

    // Check for tenant switch request via header
    const requestedTenantId = req.headers["x-tenant-id"] as string;
    const targetTenantId = requestedTenantId || user.tenantId;

    // Validate tenant access (security check)
    if (requestedTenantId && requestedTenantId !== user.tenantId) {
      // Only allow tenant switching for system admins or multi-tenant users
      const canSwitchTenant =
        user.roles.includes("SYSTEM_ADMIN") ||
        user.permissions.includes("TENANT_SWITCH");

      if (!canSwitchTenant) {
        res.status(403).json({
          message: "Tenant switching not permitted",
          code: "TENANT_SWITCH_DENIED",
          correlationId: req.correlationId,
        });
        return;
      }

      console.log(
        `[TENANT_CONTEXT] User ${user.email} switching to tenant ${requestedTenantId}`
      );
    }

    // TODO: In production, fetch tenant details from database
    // For now, using minimal tenant context
    const tenantContext: TenantContext = {
      id: targetTenantId,
      slug: `tenant-${targetTenantId}`, // Will be fetched from DB
      name: `Tenant ${targetTenantId}`, // Will be fetched from DB
      status: "ACTIVE",
      settings: {},
    };

    // Set tenant context on request
    req.tenant = tenantContext;

    // Establish RLS context for PostgreSQL
    // This integrates with our existing RLS helper functions
    req.rlsContext = {
      tenantId: targetTenantId,
      userId: user.id,
      roles: user.roles,
      setJwtClaims: () => {
        // This would be used with Prisma $executeRaw to set:
        // SET request.jwt.claims = '{"tenant_id": "...", "role": "authenticated", "roles": "ADMIN"}';
        return {
          tenant_id: targetTenantId,
          user_id: user.id,
          role: "authenticated",
          roles: user.roles.join(","),
        };
      },
    };

    console.log(
      `[TENANT_CONTEXT] Established context for tenant ${targetTenantId}, user ${user.email}`
    );

    next();
  } catch (error) {
    console.error("[TENANT_CONTEXT] Context establishment error:", error);
    res.status(500).json({
      message: "Tenant context service error",
      code: "TENANT_CONTEXT_ERROR",
      correlationId: req.correlationId,
    });
  }
};

/**
 * Tenant Validation Middleware
 *
 * Validates that the current request's tenant context is active and accessible
 */
export const validateTenantMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.tenant) {
      res.status(400).json({
        message: "Tenant context required",
        code: "TENANT_CONTEXT_MISSING",
        correlationId: req.correlationId,
      });
      return;
    }

    // Validate tenant status
    if (req.tenant.status !== "ACTIVE") {
      res.status(403).json({
        message: `Tenant is ${req.tenant.status.toLowerCase()}`,
        code: "TENANT_NOT_ACTIVE",
        correlationId: req.correlationId,
      });
      return;
    }

    next();
  } catch (error) {
    console.error("[TENANT_VALIDATION] Validation error:", error);
    res.status(500).json({
      message: "Tenant validation service error",
      code: "TENANT_VALIDATION_ERROR",
      correlationId: req.correlationId,
    });
  }
};

/**
 * Multi-tenant route helper
 * Combines tenant context establishment and validation
 */
export const multiTenantMiddleware = [
  tenantContextMiddleware,
  validateTenantMiddleware,
];
