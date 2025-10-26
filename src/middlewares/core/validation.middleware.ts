import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../types";
import { ValidationError } from "./error-handler.middleware";

/**
 * Simple validation schema interface
 */
interface ValidationSchema<T = any> {
  parse: (data: any) => T;
}

/**
 * Request Validation Middleware
 *
 * Provides comprehensive input validation and sanitization using simple validators.
 * Validates request body, query parameters, and URL parameters.
 *
 * @param schema - Validation schema object with optional body, query, params
 */
export const validationMiddleware = (schema: {
  body?: ValidationSchema<any>;
  query?: ValidationSchema<any>;
  params?: ValidationSchema<any>;
}) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const errors: Record<string, any> = {};

      // Validate request body
      if (schema.body) {
        try {
          req.body = schema.body.parse(req.body);
        } catch (error) {
          errors.body =
            error instanceof Error ? error.message : "Validation failed";
        }
      }

      // Validate query parameters
      if (schema.query) {
        try {
          req.query = schema.query.parse(req.query);
        } catch (error) {
          errors.query =
            error instanceof Error ? error.message : "Validation failed";
        }
      }

      // Validate URL parameters
      if (schema.params) {
        try {
          req.params = schema.params.parse(req.params);
        } catch (error) {
          errors.params =
            error instanceof Error ? error.message : "Validation failed";
        }
      }

      // If validation errors exist, throw ValidationError
      if (Object.keys(errors).length > 0) {
        throw new ValidationError("Request validation failed", errors);
      }

      console.log(
        `[VALIDATION] Request validated for ${req.method} ${req.path}`
      );
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Body Validation Middleware
 * Shorthand for validating only request body
 */
export const validateBody = (schema: ValidationSchema<any>) =>
  validationMiddleware({ body: schema });

/**
 * Query Validation Middleware
 * Shorthand for validating only query parameters
 */
export const validateQuery = (schema: ValidationSchema<any>) =>
  validationMiddleware({ query: schema });

/**
 * Params Validation Middleware
 * Shorthand for validating only URL parameters
 */
export const validateParams = (schema: ValidationSchema<any>) =>
  validationMiddleware({ params: schema });

// =============================================================================
// SIMPLE VALIDATION HELPERS
// =============================================================================

/**
 * Simple email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Simple UUID validation
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Simple validation schema creators
 */
export const createValidator = <T>(
  validator: (data: any) => T
): ValidationSchema<T> => ({
  parse: validator,
});

// =============================================================================
// COMMON VALIDATION SCHEMAS
// =============================================================================

/**
 * Common UUID parameter validation
 */
export const uuidParamsSchema = createValidator((data: any) => {
  if (!data.id || !isValidUUID(data.id)) {
    throw new Error("Invalid UUID format");
  }
  return data;
});

/**
 * Common pagination query parameters
 */
export const paginationQuerySchema = createValidator((data: any) => {
  const page = data.page ? parseInt(data.page) : 1;
  const limit = data.limit ? parseInt(data.limit) : 20;
  const sort = data.sort || "id";
  const order = data.order === "asc" ? "asc" : "desc";

  if (isNaN(page) || page < 1) {
    throw new Error("Page must be a positive number");
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new Error("Limit must be between 1 and 100");
  }

  return { page, limit, sort, order };
});

/**
 * Common search query parameters
 */
export const searchQuerySchema = createValidator((data: any) => {
  return {
    search: data.search || "",
    filter: data.filter || "",
  };
});

/**
 * Tenant ID validation (UUID format)
 */
export const tenantIdSchema = createValidator((tenantId: string) => {
  if (!isValidUUID(tenantId)) {
    throw new Error("Invalid tenant ID format");
  }
  return tenantId;
});

/**
 * Common user creation validation
 */
export const createUserSchema = createValidator((data: any) => {
  if (!data.email || !isValidEmail(data.email)) {
    throw new Error("Valid email required");
  }

  if (
    !data.firstName ||
    typeof data.firstName !== "string" ||
    data.firstName.length === 0
  ) {
    throw new Error("First name required");
  }

  if (
    !data.lastName ||
    typeof data.lastName !== "string" ||
    data.lastName.length === 0
  ) {
    throw new Error("Last name required");
  }

  return {
    email: data.email,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    roles: Array.isArray(data.roles) ? data.roles : [],
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
  };
});

/**
 * Common user update validation
 */
export const updateUserSchema = createValidator((data: any) => {
  const result: any = {};

  if (data.email !== undefined) {
    if (!isValidEmail(data.email)) {
      throw new Error("Valid email required");
    }
    result.email = data.email;
  }

  if (data.firstName !== undefined) {
    if (typeof data.firstName !== "string" || data.firstName.length === 0) {
      throw new Error("First name must be non-empty string");
    }
    result.firstName = data.firstName.trim();
  }

  if (data.lastName !== undefined) {
    if (typeof data.lastName !== "string" || data.lastName.length === 0) {
      throw new Error("Last name must be non-empty string");
    }
    result.lastName = data.lastName.trim();
  }

  if (data.roles !== undefined) {
    if (!Array.isArray(data.roles)) {
      throw new Error("Roles must be an array");
    }
    result.roles = data.roles;
  }

  if (data.isActive !== undefined) {
    result.isActive = Boolean(data.isActive);
  }

  return result;
});

/**
 * Login credentials validation
 */
export const loginSchema = createValidator((data: any) => {
  if (!data.email || !isValidEmail(data.email)) {
    throw new Error("Valid email required");
  }

  if (
    !data.password ||
    typeof data.password !== "string" ||
    data.password.length < 8
  ) {
    throw new Error("Password must be at least 8 characters");
  }

  return {
    email: data.email,
    password: data.password,
    tenantSlug: data.tenantSlug || undefined,
  };
});

/**
 * Password reset validation
 */
export const passwordResetSchema = createValidator((data: any) => {
  if (!data.token || typeof data.token !== "string") {
    throw new Error("Reset token required");
  }

  if (
    !data.password ||
    typeof data.password !== "string" ||
    data.password.length < 8
  ) {
    throw new Error("Password must be at least 8 characters");
  }

  if (!data.confirmPassword || data.password !== data.confirmPassword) {
    throw new Error("Passwords do not match");
  }

  return {
    token: data.token,
    password: data.password,
    confirmPassword: data.confirmPassword,
  };
});

/**
 * Tenant creation validation
 */
export const createTenantSchema = createValidator((data: any) => {
  if (!data.name || typeof data.name !== "string" || data.name.length === 0) {
    throw new Error("Tenant name required");
  }

  if (!data.slug || typeof data.slug !== "string" || data.slug.length === 0) {
    throw new Error("Tenant slug required");
  }

  // Simple slug validation
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(data.slug)) {
    throw new Error(
      "Slug must contain only lowercase letters, numbers, and hyphens"
    );
  }

  const result: any = {
    name: data.name.trim(),
    slug: data.slug.trim(),
  };

  if (data.domain) {
    try {
      new URL(data.domain);
      result.domain = data.domain;
    } catch {
      throw new Error("Invalid domain format");
    }
  }

  if (data.settings && typeof data.settings === "object") {
    result.settings = data.settings;
  }

  return result;
});

/**
 * Project creation validation
 */
export const createProjectSchema = createValidator((data: any) => {
  if (!data.name || typeof data.name !== "string" || data.name.length === 0) {
    throw new Error("Project name required");
  }

  const validStatuses = [
    "PLANNING",
    "ACTIVE",
    "ON_HOLD",
    "COMPLETED",
    "CANCELLED",
  ];
  const validPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  const result: any = {
    name: data.name.trim(),
    description: data.description ? data.description.trim() : "",
    status: validStatuses.includes(data.status) ? data.status : "PLANNING",
    priority: validPriorities.includes(data.priority)
      ? data.priority
      : "MEDIUM",
  };

  if (data.startDate) {
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      throw new Error("Invalid start date");
    }
    result.startDate = startDate.toISOString();
  }

  if (data.endDate) {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      throw new Error("Invalid end date");
    }
    result.endDate = endDate.toISOString();
  }

  return result;
});

// =============================================================================
// SANITIZATION HELPERS
// =============================================================================

/**
 * Sanitize string input (remove HTML, trim whitespace)
 */
export const sanitizeString = (input: unknown): string => {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>\"']/g, ""); // Remove potentially dangerous characters
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

/**
 * Input Sanitization Middleware
 * Applies sanitization to all request inputs
 */
export const sanitizeInputMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    // Do not reassign req.query (Express defines it with a getter). Mutate instead.
    Object.assign(req.query as any, sanitizeObject(req.query));
  }

  if (req.params) {
    // Params is a plain object; mutate in place for consistency
    Object.assign(req.params as any, sanitizeObject(req.params));
  }

  next();
};
