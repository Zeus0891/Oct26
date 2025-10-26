import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, JwtPayload } from "../types";

/**
 * JWT Authentication Middleware
 *
 * Validates JWT tokens and extracts user/tenant context.
 * Sets req.user with authenticated user information.
 *
 * @param req - Extended Express request with auth context
 * @param res - Express response object
 * @param next - Express next function
 */
export const jwtAuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // In test/E2E environment, bypass JWT verification and stub user context
    if (process.env.NODE_ENV === "test" || process.env.E2E === "1") {
      const tenantIdHeader = (req.headers["x-tenant-id"] ||
        req.headers["X-Tenant-Id"]) as string | undefined;
      req.user = {
        id: "00000000-0000-0000-0000-000000000000",
        email: "test@example.com",
        tenantId: tenantIdHeader || "00000000-0000-0000-0000-000000000001",
        roles: ["SYSTEM_ADMIN", "ADMIN"],
        permissions: ["*"] as any,
      };
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Access token required",
        code: "AUTH_TOKEN_MISSING",
        correlationId: req.correlationId,
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable not set");
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload & {
      tenantId?: string;
    };

    // Set user context on request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      // Support both snake_case and camelCase tenant id from token
      tenantId: (decoded as any).tenant_id || decoded.tenantId || "",
      roles: decoded.roles || [],
      permissions: decoded.permissions || [],
    };

    console.log(
      `[JWT_AUTH] User ${decoded.email} authenticated for tenant ${decoded.tenant_id}`
    );

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        message: "Invalid token",
        code: "AUTH_TOKEN_INVALID",
        correlationId: req.correlationId,
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        message: "Token expired",
        code: "AUTH_TOKEN_EXPIRED",
        correlationId: req.correlationId,
      });
      return;
    }

    console.error("[JWT_AUTH] Authentication error:", error);
    res.status(500).json({
      message: "Authentication service error",
      code: "AUTH_SERVICE_ERROR",
      correlationId: req.correlationId,
    });
  }
};

/**
 * Optional JWT Authentication Middleware
 * Same as jwtAuthMiddleware but doesn't fail if no token provided
 */
export const optionalJwtAuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // No token provided, continue without authentication
    next();
    return;
  }

  // Token provided, validate it
  jwtAuthMiddleware(req, res, next);
};
