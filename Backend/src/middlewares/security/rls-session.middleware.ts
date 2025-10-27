import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types";
import {
  checkDatabaseHealth,
  connectWithRetry,
  applyRlsClaims,
} from "../../core/config/prisma.config";

/**
 * RLS Session Middleware
 * Sets PostgreSQL session GUC `request.jwt.claims` so database RLS policies can enforce tenant isolation.
 * Must run AFTER jwtAuthMiddleware + tenantContextMiddleware.
 */
export const rlsSessionMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip RLS for global Identity operations
    if (
      req.path.startsWith("/api/identity/mfa") ||
      req.path.startsWith("/api/identity/password") ||
      req.path.startsWith("/api/identity/devices")
    ) {
      return next();
    }

    if (!req.user || !req.tenant) {
      return next();
    }

    // Avoid resetting multiple times per request
    if ((req as any)._rlsClaimsApplied) {
      return next();
    }

    // Check connection health before attempting to set claims
    try {
      const health = await checkDatabaseHealth();
      if (health.status !== "healthy") {
        // Attempt to reconnect once using core retry helper
        await connectWithRetry();
      }
    } catch (healthError) {
      console.error(
        "[RLS_SESSION] Database connection unhealthy, skipping RLS claims",
        healthError
      );
      return next(); // Continue without RLS claims rather than failing the request
    }

    const claims = {
      tenant_id: req.tenant.id,
      user_id: req.user.id,
      role: "authenticated",
      roles: req.user.roles.join(","),
      correlation_id: req.correlationId,
    };

    // Apply RLS claims via core helper (handles parameterization and small retry)
    await applyRlsClaims(claims);

    (req as any)._rlsClaimsApplied = true;
    if (process.env.NODE_ENV === "development") {
      console.log("[RLS_SESSION] Claims set", claims);
    }
    next();
  } catch (err) {
    console.error("[RLS_SESSION] Failed to apply RLS claims", err);
    // In development, we might want to see these errors, but in production continue
    if (process.env.NODE_ENV === "development") {
      next(err);
    } else {
      console.warn(
        "[RLS_SESSION] Continuing request without RLS claims due to error"
      );
      next();
    }
  }
};

export default rlsSessionMiddleware;
