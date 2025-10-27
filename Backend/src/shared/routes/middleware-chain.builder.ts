/**
 * Middleware Chain Builder
 *
 * Provides pre-configured middleware chains for different route types.
 * Uses existing middleware stacks to avoid type compatibility issues.
 *
 * @module MiddlewareChainBuilder
 * @category Shared Routes - Middleware
 * @description Pre-configured middleware chains for Express routes
 * @version 1.0.0
 */

import { RequestHandler } from "express";
import {
  // Pre-built stacks that work correctly
  authStack,
  securityStack,
  adminStack,
  publicStack,
} from "../../middlewares";

/**
 * Route permission definitions
 */
export interface RoutePermissions {
  [action: string]: string;
}

/**
 * Standard CRUD permissions
 */
const CrudPermissions: RoutePermissions = {
  LIST: "READ",
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

/**
 * Bulk operation permissions
 */
const BulkPermissions: RoutePermissions = {
  BULK_CREATE: "BULK_CREATE",
  BULK_UPDATE: "BULK_UPDATE",
  BULK_DELETE: "BULK_DELETE",
};

/**
 * Search operation permissions
 */
const SearchPermissions: RoutePermissions = {
  SEARCH: "READ",
  ADVANCED_SEARCH: "READ",
  EXPORT_SEARCH: "EXPORT",
};

/**
 * Pre-configured middleware chains for common scenarios
 * Uses existing middleware stacks from the middleware layer
 */
export const MiddlewareChains = {
  /**
   * Public route chain - minimal protection
   * No authentication required
   */
  public: (): RequestHandler[] => publicStack() as any,

  /**
   * Authenticated route chain - requires login
   * Basic authentication + tenant context
   */
  authenticated: (): RequestHandler[] => authStack() as any,

  /**
   * Protected route chain - requires specific permission
   * Full security with RBAC authorization
   */
  protected: (permission: string): RequestHandler[] =>
    securityStack(permission) as any,

  /**
   * Admin route chain - requires admin privileges
   * Full admin access validation
   */
  admin: (): RequestHandler[] => adminStack() as any,

  /**
   * CRUD operation chains
   */
  crud: {
    list: (resource: string): RequestHandler[] =>
      securityStack(`${resource}:READ`) as any,
    create: (resource: string): RequestHandler[] =>
      securityStack(`${resource}:CREATE`) as any,
    read: (resource: string): RequestHandler[] =>
      securityStack(`${resource}:READ`) as any,
    update: (resource: string): RequestHandler[] =>
      securityStack(`${resource}:UPDATE`) as any,
    delete: (resource: string): RequestHandler[] =>
      securityStack(`${resource}:DELETE`) as any,
  },

  /**
   * Bulk operation chains
   */
  bulk: {
    create: (resource: string): RequestHandler[] =>
      securityStack(`${resource}:BULK_CREATE`) as any,
    update: (resource: string): RequestHandler[] =>
      securityStack(`${resource}:BULK_UPDATE`) as any,
    delete: (resource: string): RequestHandler[] =>
      securityStack(`${resource}:BULK_DELETE`) as any,
  },

  /**
   * Search operation chains
   */
  search: {
    basic: (resource: string): RequestHandler[] =>
      securityStack(`${resource}:READ`) as any,
    advanced: (resource: string): RequestHandler[] =>
      securityStack(`${resource}:SEARCH`) as any,
    export: (resource: string): RequestHandler[] =>
      securityStack(`${resource}:EXPORT`) as any,
  },

  /**
   * System operation chains
   */
  system: {
    health: (): RequestHandler[] => publicStack() as any,
    metrics: (): RequestHandler[] => adminStack() as any,
    status: (): RequestHandler[] => authStack() as any,
  },

  /**
   * Authentication operation chains
   */
  auth: {
    login: (): RequestHandler[] => publicStack() as any,
    logout: (): RequestHandler[] => authStack() as any,
    refresh: (): RequestHandler[] => authStack() as any,
  },
};

/**
 * Rate limit configurations for different operations
 */
/**
 * Rate limiting presets for different route types
 */
const RateLimits = {
  // High-frequency endpoints (auth, public APIs)
  HIGH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
    message: "Too many requests, please try again later.",
  },

  // Standard API endpoints
  STANDARD: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per window
    message: "Rate limit exceeded, please slow down.",
  },

  // Sensitive operations (admin, bulk operations)
  RESTRICTED: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: "Rate limit exceeded for sensitive operations.",
  },

  // Authentication endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 auth attempts per window
    message: "Too many authentication attempts, please try again later.",
  },

  // Operation-specific limits
  create: {
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "Too many create operations, please slow down.",
  },

  update: {
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: "Too many update operations, please slow down.",
  },

  delete: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many delete operations, please slow down.",
  },

  bulk: {
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Too many bulk operations, please slow down.",
  },

  search: {
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: "Too many search operations, please slow down.",
  },

  export: {
    windowMs: 15 * 60 * 1000,
    max: 25,
    message: "Too many export operations, please slow down.",
  },

  authenticated: {
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: "Rate limit exceeded for authenticated operations.",
  },
} as const;

/**
 * Validation schema templates
 */
export interface ValidationSchema {
  body?: any;
  query?: any;
  params?: any;
  headers?: any;
}

/**
 * Common validation schemas
 */
/**
 * Common schema validation presets
 */
const CommonSchemas = {
  // Pagination schemas
  pagination: {
    page: {
      type: "number" as const,
      minimum: 1,
      default: 1,
    },
    limit: {
      type: "number" as const,
      minimum: 1,
      maximum: 100,
      default: 20,
    },
    offset: {
      type: "number" as const,
      minimum: 0,
      default: 0,
    },
  },

  // Common field validations
  fields: {
    id: {
      type: "string" as const,
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
    email: {
      type: "string" as const,
      format: "email" as const,
    },
    timestamp: {
      type: "string" as const,
      format: "date-time" as const,
    },
    text: {
      type: "string" as const,
      minLength: 1,
      maxLength: 1000,
    },
    name: {
      type: "string" as const,
      minLength: 2,
      maxLength: 100,
    },
  },

  // Filter schemas
  filters: {
    dateRange: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string" as const,
          format: "date-time" as const,
        },
        endDate: {
          type: "string" as const,
          format: "date-time" as const,
        },
      },
    },
    search: {
      type: "object" as const,
      properties: {
        query: {
          type: "string" as const,
          minLength: 1,
          maxLength: 100,
        },
        fields: {
          type: "array" as const,
          items: {
            type: "string" as const,
          },
        },
      },
    },
  },

  // Route-specific schemas
  uuidParams: {
    type: "object" as const,
    properties: {
      id: {
        type: "string" as const,
        pattern:
          "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
      },
    },
    required: ["id"],
  },

  paginationQuery: {
    type: "object" as const,
    properties: {
      page: {
        type: "number" as const,
        minimum: 1,
        default: 1,
      },
      limit: {
        type: "number" as const,
        minimum: 1,
        maximum: 100,
        default: 20,
      },
      sort: {
        type: "string" as const,
      },
      order: {
        type: "string" as const,
        enum: ["asc", "desc"],
        default: "asc",
      },
    },
  },

  searchQuery: {
    type: "object" as const,
    properties: {
      q: {
        type: "string" as const,
        minLength: 1,
        maxLength: 100,
      },
      fields: {
        type: "array" as const,
        items: {
          type: "string" as const,
        },
      },
      filters: {
        type: "object" as const,
      },
    },
  },

  bulkBody: {
    type: "object" as const,
    properties: {
      ids: {
        type: "array" as const,
        items: {
          type: "string" as const,
          pattern:
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        },
        minItems: 1,
        maxItems: 100,
      },
      operation: {
        type: "string" as const,
        enum: ["update", "delete", "archive"],
      },
      data: {
        type: "object" as const,
      },
    },
    required: ["ids", "operation"],
  },
} as const;

/**
 * Export all middleware utilities
 */
export {
  MiddlewareChains as default,
  CrudPermissions,
  BulkPermissions,
  SearchPermissions,
  RateLimits,
  CommonSchemas,
};
