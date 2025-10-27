import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, ApiError } from "../types";

/**
 * Global Error Handler Middleware
 *
 * Centralized error handling for the entire application.
 * Provides consistent error responses, logging, and security error masking.
 *
 * @param error - Error object or string
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandlerMiddleware = (
  error: any,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Skip if response already sent
  if (res.headersSent) {
    return next(error);
  }

  const correlationId = req.correlationId || "unknown";
  const timestamp = new Date().toISOString();
  const userContext = req.user ? `User: ${req.user.email}` : "Anonymous";
  const tenantContext = req.tenant ? `Tenant: ${req.tenant.slug}` : "No tenant";

  // Log error for internal monitoring
  console.error(
    `[ERROR_HANDLER] ${timestamp} | ${correlationId} | ${userContext} | ${tenantContext}`
  );
  console.error("Error details:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  // Determine error type and response
  let apiError: ApiError;

  if (error.name === "ValidationError" || error.statusCode === 400) {
    // Validation errors
    apiError = {
      message: error.message || "Validation failed",
      code: "VALIDATION_ERROR",
      statusCode: 400,
      correlationId,
      details: error.details || error.errors,
    };
  } else if (error.name === "UnauthorizedError" || error.statusCode === 401) {
    // Authentication errors
    apiError = {
      message: "Authentication required",
      code: "AUTHENTICATION_REQUIRED",
      statusCode: 401,
      correlationId,
    };
  } else if (error.name === "ForbiddenError" || error.statusCode === 403) {
    // Authorization errors
    apiError = {
      message: "Access forbidden",
      code: "ACCESS_FORBIDDEN",
      statusCode: 403,
      correlationId,
    };
  } else if (error.name === "NotFoundError" || error.statusCode === 404) {
    // Resource not found errors
    apiError = {
      message: "Resource not found",
      code: "RESOURCE_NOT_FOUND",
      statusCode: 404,
      correlationId,
    };
  } else if (error.name === "ConflictError" || error.statusCode === 409) {
    // Conflict errors (duplicate resources, etc.)
    apiError = {
      message: error.message || "Resource conflict",
      code: "RESOURCE_CONFLICT",
      statusCode: 409,
      correlationId,
    };
  } else if (
    error.name === "TooManyRequestsError" ||
    error.statusCode === 429
  ) {
    // Rate limiting errors
    apiError = {
      message: "Too many requests",
      code: "RATE_LIMIT_EXCEEDED",
      statusCode: 429,
      correlationId,
    };
  } else if (error.statusCode >= 400 && error.statusCode < 500) {
    // Other client errors
    apiError = {
      message: error.message || "Bad request",
      code: "CLIENT_ERROR",
      statusCode: error.statusCode,
      correlationId,
    };
  } else {
    // Server errors (5xx) - mask internal details for security
    const isDevelopment = process.env.NODE_ENV === "development";

    apiError = {
      message: isDevelopment ? error.message : "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
      correlationId,
      details: isDevelopment
        ? {
            stack: error.stack,
            originalError: error.toString(),
          }
        : undefined,
    };

    // Log critical errors for monitoring/alerting
    console.error(`[CRITICAL_ERROR] ${correlationId}:`, error);
  }

  // Send error response
  res.status(apiError.statusCode).json(apiError);
};

/**
 * 404 Not Found Handler
 *
 * Handles requests to non-existent endpoints
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const correlationId =
    (req as AuthenticatedRequest).correlationId || "unknown";

  res.status(404).json({
    message: `Cannot ${req.method} ${req.path}`,
    code: "ENDPOINT_NOT_FOUND",
    statusCode: 404,
    correlationId,
  });
};

/**
 * Async Error Wrapper
 *
 * Wraps async route handlers to automatically catch and forward errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom Error Classes for better error handling
 */
export class ValidationError extends Error {
  public statusCode = 400;
  public details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

export class UnauthorizedError extends Error {
  public statusCode = 401;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  public statusCode = 403;

  constructor(message = "Access forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  public statusCode = 404;

  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  public statusCode = 409;

  constructor(message = "Resource conflict") {
    super(message);
    this.name = "ConflictError";
  }
}
