/**
 * Pagination Service - Universal pagination utilities
 *
 * Provides standardized cursor-based and offset-based pagination patterns
 * for all shared services with performance optimization and type safety.
 *
 * @module PaginationService
 * @category Shared Services - Base Infrastructure
 * @description Universal pagination service for data listing operations
 * @version 1.0.0
 */

import type { RequestContext } from "./context.service";
import {
  AuditService,
  AuditEventType,
  AuditSeverity,
} from "../audit/audit.service";
import { ErrorUtils } from "../../utils/base/error.util";

/**
 * Pagination request parameters
 */
export interface PageRequest {
  /** Page number (1-based, for offset pagination) */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Cursor for cursor-based pagination */
  cursor?: string;
  /** Skip number of items (for offset pagination) */
  skip?: number;
  /** Take number of items (alias for limit) */
  take?: number;
}

/**
 * Sort specification
 */
export interface Sort {
  /** Field to sort by */
  field: string;
  /** Sort direction */
  direction: "asc" | "desc";
}

/**
 * Pagination metadata for responses
 */
export interface PageMeta {
  /** Total number of items */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
  /** Next cursor (for cursor-based pagination) */
  nextCursor?: string;
  /** Previous cursor (for cursor-based pagination) */
  previousCursor?: string;
}

/**
 * Cursor information for cursor-based pagination
 */
export interface CursorInfo {
  /** Encoded cursor string */
  cursor: string;
  /** Cursor creation timestamp */
  createdAt: Date;
  /** Entity ID at cursor position */
  entityId: string;
  /** Sort field value at cursor position */
  sortValue?: any;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  items: T[];
  /** Pagination metadata */
  pagination: PageMeta;
  /** Applied sorting */
  sorting?: Sort[];
  /** Applied filters */
  filters?: Record<string, any>;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Default page size */
  defaultLimit: number;
  /** Maximum page size */
  maxLimit: number;
  /** Minimum page size */
  minLimit: number;
  /** Default sort order */
  defaultSort: Sort[];
  /** Whether to use cursor-based pagination by default */
  preferCursor: boolean;
}

/**
 * Default pagination configuration
 */
const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  defaultLimit: 25,
  maxLimit: 100,
  minLimit: 1,
  defaultSort: [{ field: "createdAt", direction: "desc" }],
  preferCursor: false,
};

/**
 * Universal pagination service
 *
 * Provides standardized pagination patterns with both cursor-based and offset-based
 * pagination support. Includes performance optimizations and type safety.
 *
 * @example
 * ```typescript
 * const paginationService = new PaginationService();
 *
 * // Offset-based pagination
 * const offsetParams = paginationService.parseOffsetRequest({
 *   page: 2,
 *   limit: 50
 * });
 *
 * // Cursor-based pagination
 * const cursorParams = paginationService.parseCursorRequest({
 *   cursor: 'encoded_cursor_string',
 *   limit: 25
 * });
 *
 * // Create paginated response
 * const response = paginationService.createPaginatedResponse(
 *   items,
 *   totalCount,
 *   offsetParams
 * );
 * ```
 */
export class PaginationService {
  private config: PaginationConfig;

  constructor(
    config?: Partial<PaginationConfig>,
    private readonly auditService?: AuditService
  ) {
    this.config = { ...DEFAULT_PAGINATION_CONFIG, ...config };
  }

  /**
   * Parse offset-based pagination request with security validation and audit logging
   *
   * Converts client pagination request into standardized offset-based parameters.
   *
   * @param request - Client pagination request
   * @param context - Request context for audit logging
   * @param entityType - Type of entity being paginated
   * @returns Standardized offset parameters
   */
  parseOffsetRequest(
    request: PageRequest = {},
    context?: RequestContext,
    entityType?: string
  ): {
    skip: number;
    take: number;
    page: number;
    limit: number;
  } {
    try {
      // Validate pagination parameters for potential security issues
      this.validatePaginationRequest(request, context);

      // Determine limit (take) with security boundaries
      let limit = request.limit || request.take || this.config.defaultLimit;
      limit = Math.max(
        this.config.minLimit,
        Math.min(limit, this.config.maxLimit)
      );

      // Validate limit doesn't exceed security thresholds
      if (limit > this.config.maxLimit) {
        if (this.auditService && context) {
          this.auditService.logEvent({
            type: AuditEventType.SECURITY_VIOLATION,
            severity: AuditSeverity.MEDIUM,
            description: `Pagination limit exceeded maximum allowed: ${limit} > ${this.config.maxLimit}`,
            userId: context.actor?.userId,
            tenantId: context.tenant?.tenantId,
            resource: {
              type: entityType || "pagination",
              id: "limit_exceeded",
              name: "pagination_limit_violation",
            },
            metadata: {
              correlationId: context.correlationId,
              requestedLimit: limit,
              maxAllowed: this.config.maxLimit,
              entityType,
            },
          });
        }

        limit = this.config.maxLimit; // Force to maximum
      }

      // Determine page and skip
      let page = request.page || 1;
      page = Math.max(1, page);

      let skip = request.skip;
      if (skip === undefined) {
        skip = (page - 1) * limit;
      }

      // Ensure skip is non-negative and reasonable
      skip = Math.max(0, skip);

      // Security check: prevent excessive skip values that could impact performance
      const maxSkip = 10000; // Configurable security limit
      if (skip > maxSkip) {
        if (this.auditService && context) {
          this.auditService.logEvent({
            type: AuditEventType.SECURITY_VIOLATION,
            severity: AuditSeverity.MEDIUM,
            description: `Pagination skip value too high: ${skip} > ${maxSkip}`,
            userId: context.actor?.userId,
            tenantId: context.tenant?.tenantId,
            resource: {
              type: entityType || "pagination",
              id: "skip_exceeded",
              name: "pagination_skip_violation",
            },
            metadata: {
              correlationId: context.correlationId,
              requestedSkip: skip,
              maxAllowed: maxSkip,
              entityType,
            },
          });
        }

        throw ErrorUtils.createValidationError(
          `Skip value too high: ${skip}. Maximum allowed: ${maxSkip}`,
          { skip: `${skip}`, maxSkip: `${maxSkip}` }
        );
      }

      const result = {
        skip,
        take: limit,
        page: Math.floor(skip / limit) + 1,
        limit,
      };

      // Audit pagination request
      if (this.auditService && context) {
        this.auditService.logEvent({
          type: AuditEventType.READ,
          severity: AuditSeverity.LOW,
          description: `Pagination request parsed - ${
            entityType || "entity"
          } page ${result.page}`,
          userId: context.actor?.userId,
          tenantId: context.tenant?.tenantId,
          resource: {
            type: entityType || "pagination",
            id: "offset_request",
            name: "pagination_offset_parsed",
          },
          metadata: {
            correlationId: context.correlationId,
            page: result.page,
            limit: result.limit,
            skip: result.skip,
            entityType,
          },
        });
      }

      return result;
    } catch (error) {
      if (this.auditService && context) {
        this.auditService.logEvent({
          type: AuditEventType.SECURITY_VIOLATION,
          severity: AuditSeverity.HIGH,
          description: `Pagination parsing failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          userId: context.actor?.userId,
          tenantId: context.tenant?.tenantId,
          resource: {
            type: entityType || "pagination",
            id: "parse_error",
            name: "pagination_parse_error",
          },
          metadata: {
            correlationId: context.correlationId,
            error: error instanceof Error ? error.message : String(error),
            request: JSON.stringify(request),
            entityType,
          },
        });
      }

      throw error;
    }
  }

  /**
   * Validate pagination request for security issues
   *
   * @param request - Pagination request to validate
   * @param context - Request context
   */
  private validatePaginationRequest(
    request: PageRequest,
    context?: RequestContext
  ): void {
    // Check for negative values
    if (request.page !== undefined && request.page < 1) {
      throw ErrorUtils.createValidationError("Page number must be positive");
    }

    if (request.limit !== undefined && request.limit < 1) {
      throw ErrorUtils.createValidationError("Limit must be positive");
    }

    if (request.skip !== undefined && request.skip < 0) {
      throw ErrorUtils.createValidationError("Skip value cannot be negative");
    }

    // Check for unreasonably large values that could indicate an attack
    if (request.limit !== undefined && request.limit > 10000) {
      throw ErrorUtils.createValidationError("Limit value too large");
    }

    if (request.page !== undefined && request.page > 1000000) {
      throw ErrorUtils.createValidationError("Page number too large");
    }
  }

  /**
   * Parse cursor-based pagination request
   *
   * Converts client cursor request into standardized cursor-based parameters.
   *
   * @param request - Client cursor request
   * @returns Standardized cursor parameters
   */
  /**
   * Parse cursor-based pagination request with security validation and audit logging
   *
   * @param request - Pagination request with cursor
   * @param context - Request context for audit logging
   * @param entityType - Type of entity being paginated
   * @returns Cursor pagination parameters
   */
  parseCursorRequest(
    request: PageRequest = {},
    context?: RequestContext,
    entityType?: string
  ): {
    cursor?: string;
    take: number;
    limit: number;
    cursorInfo?: CursorInfo;
  } {
    try {
      // Validate pagination parameters
      this.validatePaginationRequest(request, context);

      let limit = request.limit || request.take || this.config.defaultLimit;
      limit = Math.max(
        this.config.minLimit,
        Math.min(limit, this.config.maxLimit)
      );

      // Security check for limit
      if (limit > this.config.maxLimit) {
        if (this.auditService && context) {
          this.auditService.logEvent({
            type: AuditEventType.SECURITY_VIOLATION,
            severity: AuditSeverity.MEDIUM,
            description: `Cursor pagination limit exceeded: ${limit} > ${this.config.maxLimit}`,
            userId: context.actor?.userId,
            tenantId: context.tenant?.tenantId,
            resource: {
              type: entityType || "cursor_pagination",
              id: "limit_exceeded",
              name: "cursor_pagination_limit_violation",
            },
            metadata: {
              correlationId: context.correlationId,
              requestedLimit: limit,
              maxAllowed: this.config.maxLimit,
              entityType,
            },
          });
        }

        limit = this.config.maxLimit;
      }

      const cursor = request.cursor;
      let cursorInfo: CursorInfo | undefined;

      if (cursor) {
        try {
          cursorInfo = this.decodeCursor(cursor);

          // Audit successful cursor decode
          if (this.auditService && context) {
            this.auditService.logEvent({
              type: AuditEventType.READ,
              severity: AuditSeverity.LOW,
              description: `Cursor decoded successfully for ${
                entityType || "entity"
              }`,
              userId: context.actor?.userId,
              tenantId: context.tenant?.tenantId,
              resource: {
                type: entityType || "cursor_pagination",
                id: "cursor_decoded",
                name: "cursor_decode_success",
              },
              metadata: {
                correlationId: context.correlationId,
                cursorDecoded: true,
                entityType,
              },
            });
          }
        } catch (error) {
          // Audit invalid cursor attempt
          if (this.auditService && context) {
            this.auditService.logEvent({
              type: AuditEventType.SECURITY_VIOLATION,
              severity: AuditSeverity.MEDIUM,
              description: `Invalid cursor provided: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
              userId: context.actor?.userId,
              tenantId: context.tenant?.tenantId,
              resource: {
                type: entityType || "cursor_pagination",
                id: "invalid_cursor",
                name: "cursor_decode_failed",
              },
              metadata: {
                correlationId: context.correlationId,
                cursor: cursor.substring(0, 50) + "...", // Truncate for security
                error: error instanceof Error ? error.message : String(error),
                entityType,
              },
            });
          }

          // Invalid cursor could indicate tampering attempt
          console.warn("[PaginationService] Invalid cursor provided:", cursor);
        }
      }

      const result = {
        cursor,
        take: limit,
        limit,
        cursorInfo,
      };

      // Audit pagination request
      if (this.auditService && context) {
        this.auditService.logEvent({
          type: AuditEventType.READ,
          severity: AuditSeverity.LOW,
          description: `Cursor pagination request parsed - ${
            entityType || "entity"
          }`,
          userId: context.actor?.userId,
          tenantId: context.tenant?.tenantId,
          resource: {
            type: entityType || "cursor_pagination",
            id: "cursor_request",
            name: "cursor_pagination_parsed",
          },
          metadata: {
            correlationId: context.correlationId,
            limit: result.limit,
            hasCursor: !!result.cursor,
            entityType,
          },
        });
      }

      return result;
    } catch (error) {
      if (this.auditService && context) {
        this.auditService.logEvent({
          type: AuditEventType.SECURITY_VIOLATION,
          severity: AuditSeverity.HIGH,
          description: `Cursor pagination parsing failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          userId: context.actor?.userId,
          tenantId: context.tenant?.tenantId,
          resource: {
            type: entityType || "cursor_pagination",
            id: "parse_error",
            name: "cursor_pagination_parse_error",
          },
          metadata: {
            correlationId: context.correlationId,
            error: error instanceof Error ? error.message : String(error),
            request: JSON.stringify(request),
            entityType,
          },
        });
      }

      throw error;
    }
  }

  /**
   * Create paginated response for offset-based pagination
   *
   * Creates standardized paginated response with metadata.
   *
   * @param items - Array of items for current page
   * @param totalCount - Total number of items across all pages
   * @param params - Pagination parameters used
   * @param sorting - Applied sorting
   * @param filters - Applied filters
   * @returns Paginated response
   */
  /**
   * Create paginated response with audit logging
   *
   * @param items - Array of items for current page
   * @param totalCount - Total number of items across all pages
   * @param params - Pagination parameters used
   * @param sorting - Applied sorting
   * @param filters - Applied filters
   * @param context - Request context for audit logging
   * @param entityType - Type of entity being paginated
   * @returns Paginated response
   */
  createPaginatedResponse<T>(
    items: T[],
    totalCount: number,
    params: { page: number; limit: number; skip?: number },
    sorting?: Sort[],
    filters?: Record<string, any>,
    context?: RequestContext,
    entityType?: string
  ): PaginatedResponse<T> {
    try {
      const totalPages = Math.ceil(totalCount / params.limit);
      const hasNextPage = params.page < totalPages;
      const hasPreviousPage = params.page > 1;

      const response: PaginatedResponse<T> = {
        items,
        pagination: {
          total: totalCount,
          page: params.page,
          limit: params.limit,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
        sorting,
        filters,
      };

      // Audit successful pagination response creation
      if (this.auditService && context) {
        this.auditService.logEvent({
          type: AuditEventType.READ,
          severity: AuditSeverity.LOW,
          description: `Paginated response created for ${
            entityType || "entity"
          } - page ${params.page} of ${totalPages}`,
          userId: context.actor?.userId,
          tenantId: context.tenant?.tenantId,
          resource: {
            type: entityType || "pagination",
            id: "paginated_response",
            name: "pagination_response_created",
          },
          metadata: {
            correlationId: context.correlationId,
            totalCount,
            page: params.page,
            limit: params.limit,
            totalPages,
            itemCount: items.length,
            hasFilters: !!filters && Object.keys(filters).length > 0,
            hasSorting: !!sorting && sorting.length > 0,
            entityType,
          },
        });
      }

      return response;
    } catch (error) {
      if (this.auditService && context) {
        this.auditService.logEvent({
          type: AuditEventType.SECURITY_VIOLATION,
          severity: AuditSeverity.HIGH,
          description: `Paginated response creation failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          userId: context.actor?.userId,
          tenantId: context.tenant?.tenantId,
          resource: {
            type: entityType || "pagination",
            id: "response_error",
            name: "pagination_response_error",
          },
          metadata: {
            correlationId: context.correlationId,
            error: error instanceof Error ? error.message : String(error),
            totalCount,
            params,
            entityType,
          },
        });
      }

      throw error;
    }
  }

  /**
   * Create cursor-based paginated response
   *
   * Creates standardized cursor-based paginated response with navigation cursors.
   *
   * @param items - Array of items for current page
   * @param params - Cursor parameters used
   * @param hasNextPage - Whether there are more items after current page
   * @param sorting - Applied sorting
   * @param filters - Applied filters
   * @returns Cursor-based paginated response
   */
  createCursorPaginatedResponse<T extends { id: string; createdAt?: Date }>(
    items: T[],
    params: { limit: number; cursor?: string },
    hasNextPage: boolean,
    sorting?: Sort[],
    filters?: Record<string, any>
  ): PaginatedResponse<T> {
    let nextCursor: string | undefined;
    let previousCursor: string | undefined;

    if (items.length > 0) {
      // Create next cursor from last item
      if (hasNextPage) {
        const lastItem = items[items.length - 1];
        nextCursor = this.encodeCursor({
          cursor: `next_${lastItem.id}`,
          createdAt: new Date(),
          entityId: lastItem.id,
          sortValue: lastItem.createdAt,
        });
      }

      // Create previous cursor from first item
      if (params.cursor) {
        const firstItem = items[0];
        previousCursor = this.encodeCursor({
          cursor: `prev_${firstItem.id}`,
          createdAt: new Date(),
          entityId: firstItem.id,
          sortValue: firstItem.createdAt,
        });
      }
    }

    return {
      items,
      pagination: {
        total: -1, // Not applicable for cursor-based pagination
        page: -1, // Not applicable for cursor-based pagination
        limit: params.limit,
        totalPages: -1, // Not applicable for cursor-based pagination
        hasNextPage,
        hasPreviousPage: !!params.cursor,
        nextCursor,
        previousCursor,
      },
      sorting,
      filters,
    };
  }

  /**
   * Parse sorting parameters
   *
   * Converts client sort request into standardized sort parameters.
   *
   * @param sortBy - Comma-separated sort fields
   * @param sortOrder - Comma-separated sort directions
   * @returns Array of sort specifications
   */
  parseSorting(
    sortBy?: string | string[],
    sortOrder?: string | string[]
  ): Sort[] {
    if (!sortBy) {
      return this.config.defaultSort;
    }

    const fields = Array.isArray(sortBy) ? sortBy : sortBy.split(",");
    const directions = Array.isArray(sortOrder)
      ? sortOrder
      : sortOrder
        ? sortOrder.split(",")
        : [];

    return fields.map((field, index) => ({
      field: field.trim(),
      direction:
        directions[index]?.trim().toLowerCase() === "desc" ? "desc" : "asc",
    }));
  }

  /**
   * Build Prisma orderBy from sort parameters
   *
   * Converts sort specifications into Prisma orderBy format.
   *
   * @param sorting - Sort specifications
   * @returns Prisma orderBy object
   */
  buildPrismaOrderBy(sorting: Sort[]): Record<string, "asc" | "desc">[] {
    return sorting.map((sort) => ({
      [sort.field]: sort.direction,
    }));
  }

  /**
   * Encode cursor for pagination
   *
   * Creates a base64-encoded cursor string for cursor-based pagination.
   *
   * @param cursorInfo - Cursor information to encode
   * @returns Encoded cursor string
   */
  encodeCursor(cursorInfo: CursorInfo): string {
    const cursorData = {
      id: cursorInfo.entityId,
      t: cursorInfo.createdAt.getTime(),
      sv: cursorInfo.sortValue,
    };

    return Buffer.from(JSON.stringify(cursorData)).toString("base64url");
  }

  /**
   * Decode cursor from pagination request
   *
   * Decodes a base64-encoded cursor string into cursor information.
   *
   * @param cursor - Encoded cursor string
   * @returns Decoded cursor information
   * @throws Error if cursor is invalid
   */
  decodeCursor(cursor: string): CursorInfo {
    try {
      const cursorData = JSON.parse(
        Buffer.from(cursor, "base64url").toString("utf-8")
      );

      return {
        cursor,
        createdAt: new Date(cursorData.t),
        entityId: cursorData.id,
        sortValue: cursorData.sv,
      };
    } catch (error) {
      throw new Error(`Invalid cursor format: ${cursor}`);
    }
  }

  /**
   * Build cursor-based where clause for Prisma
   *
   * Creates Prisma where clause for cursor-based pagination.
   *
   * @param cursorInfo - Decoded cursor information
   * @param direction - Pagination direction ('next' or 'prev')
   * @param sortField - Field used for sorting (default: 'createdAt')
   * @returns Prisma where clause
   */
  buildCursorWhereClause(
    cursorInfo: CursorInfo,
    direction: "next" | "prev" = "next",
    sortField: string = "createdAt"
  ): Record<string, any> {
    const operator = direction === "next" ? "lt" : "gt";

    return {
      OR: [
        {
          [sortField]: {
            [operator]: cursorInfo.sortValue,
          },
        },
        {
          [sortField]: cursorInfo.sortValue,
          id: {
            [operator]: cursorInfo.entityId,
          },
        },
      ],
    };
  }

  /**
   * Calculate pagination statistics
   *
   * Provides comprehensive pagination statistics for monitoring and analytics.
   *
   * @param totalItems - Total number of items
   * @param currentPage - Current page number
   * @param pageSize - Items per page
   * @returns Pagination statistics
   */
  calculateStatistics(
    totalItems: number,
    currentPage: number,
    pageSize: number
  ): {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    startItem: number;
    endItem: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    itemsOnCurrentPage: number;
  } {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    const itemsOnCurrentPage = Math.max(0, endItem - startItem + 1);

    return {
      totalItems,
      totalPages,
      currentPage,
      pageSize,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      itemsOnCurrentPage,
    };
  }
}
