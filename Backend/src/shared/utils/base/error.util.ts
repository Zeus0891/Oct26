/**
 * Error Utility
 *
 * Provides comprehensive error handling and creation utilities.
 * Integrates with logging systems and provides structured error reporting.
 *
 * @module ErrorUtils
 * @category Shared Utils - Base
 * @description Error handling, creation, and reporting utilities
 * @version 1.0.0
 */

import { TypeGuards } from "./type-guards.util";

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  RATE_LIMIT = "rate_limit",
  INTERNAL = "internal",
  EXTERNAL = "external",
  NETWORK = "network",
  DATABASE = "database",
  BUSINESS_LOGIC = "business_logic",
  USER_INPUT = "user_input",
}

/**
 * Structured error metadata
 */
export interface ErrorMetadata {
  /** Error category */
  category?: ErrorCategory;
  /** Error severity */
  severity?: ErrorSeverity;
  /** HTTP status code */
  statusCode?: number;
  /** Error code for client identification */
  code?: string;
  /** Additional context data */
  context?: Record<string, unknown>;
  /** Timestamp when error occurred */
  timestamp?: Date;
  /** User ID associated with error */
  userId?: string;
  /** Request ID for tracing */
  requestId?: string;
  /** Stack trace */
  stack?: string;
  /** Original error that caused this error */
  cause?: Error;
}

/**
 * Application error with structured metadata
 */
export class AppError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly userId?: string;
  public readonly requestId?: string;
  public readonly cause?: Error;

  constructor(message: string, metadata: ErrorMetadata = {}) {
    super(message);

    this.name = "AppError";
    this.category = metadata.category || ErrorCategory.INTERNAL;
    this.severity = metadata.severity || ErrorSeverity.MEDIUM;
    this.statusCode = metadata.statusCode || this.getDefaultStatusCode();
    this.code = metadata.code;
    this.context = metadata.context;
    this.timestamp = metadata.timestamp || new Date();
    this.userId = metadata.userId;
    this.requestId = metadata.requestId;
    this.cause = metadata.cause;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Gets default status code based on category
   */
  private getDefaultStatusCode(): number {
    switch (this.category) {
      case ErrorCategory.VALIDATION:
      case ErrorCategory.USER_INPUT:
        return 400;
      case ErrorCategory.AUTHENTICATION:
        return 401;
      case ErrorCategory.AUTHORIZATION:
        return 403;
      case ErrorCategory.NOT_FOUND:
        return 404;
      case ErrorCategory.CONFLICT:
        return 409;
      case ErrorCategory.RATE_LIMIT:
        return 429;
      default:
        return 500;
    }
  }

  /**
   * Converts error to plain object for serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      statusCode: this.statusCode,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      userId: this.userId,
      requestId: this.requestId,
      stack: this.stack,
      cause: this.cause
        ? {
            name: this.cause.name,
            message: this.cause.message,
            stack: this.cause.stack,
          }
        : undefined,
    };
  }
}

/**
 * Validation error with field-specific details
 */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;

  constructor(
    message: string,
    fields?: Record<string, string>,
    metadata: ErrorMetadata = {}
  ) {
    super(message, {
      ...metadata,
      category: ErrorCategory.VALIDATION,
      statusCode: 400,
    });

    this.name = "ValidationError";
    this.fields = fields;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }
}

/**
 * Business logic error for domain-specific failures
 */
export class BusinessError extends AppError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super(message, {
      ...metadata,
      category: ErrorCategory.BUSINESS_LOGIC,
    });

    this.name = "BusinessError";
  }
}

/**
 * Utility class for error handling, creation, and reporting.
 * Provides structured error management with proper categorization and metadata.
 *
 * @example
 * ```typescript
 * import { ErrorUtils } from '@/shared/utils';
 *
 * // Create structured errors
 * const validationError = ErrorUtils.createValidationError(
 *   "Invalid email format",
 *   { email: "Must be a valid email address" }
 * );
 *
 * // Wrap and enhance existing errors
 * const enhancedError = ErrorUtils.wrapError(originalError, {
 *   category: ErrorCategory.DATABASE,
 *   context: { query: "SELECT * FROM users" }
 * });
 *
 * // Safe error handling
 * const errorInfo = ErrorUtils.safeGetErrorInfo(unknownError);
 * ```
 */
export class ErrorUtils {
  /**
   * Creates a validation error with field-specific details.
   *
   * @param message - Error message
   * @param fields - Field validation errors
   * @param metadata - Additional error metadata
   * @returns ValidationError instance
   * @complexity O(1)
   */
  static createValidationError(
    message: string,
    fields?: Record<string, string>,
    metadata: ErrorMetadata = {}
  ): ValidationError {
    return new ValidationError(message, fields, metadata);
  }

  /**
   * Creates a business logic error.
   *
   * @param message - Error message
   * @param metadata - Error metadata
   * @returns BusinessError instance
   * @complexity O(1)
   */
  static createBusinessError(
    message: string,
    metadata: ErrorMetadata = {}
  ): BusinessError {
    return new BusinessError(message, metadata);
  }

  /**
   * Creates an authentication error.
   *
   * @param message - Error message
   * @param metadata - Error metadata
   * @returns AppError instance
   * @complexity O(1)
   */
  static createAuthError(
    message: string = "Authentication required",
    metadata: ErrorMetadata = {}
  ): AppError {
    return new AppError(message, {
      ...metadata,
      category: ErrorCategory.AUTHENTICATION,
      statusCode: 401,
      severity: ErrorSeverity.HIGH,
    });
  }

  /**
   * Creates an authorization error.
   *
   * @param message - Error message
   * @param metadata - Error metadata
   * @returns AppError instance
   * @complexity O(1)
   */
  static createAuthzError(
    message: string = "Insufficient permissions",
    metadata: ErrorMetadata = {}
  ): AppError {
    return new AppError(message, {
      ...metadata,
      category: ErrorCategory.AUTHORIZATION,
      statusCode: 403,
      severity: ErrorSeverity.HIGH,
    });
  }

  /**
   * Creates a not found error.
   *
   * @param resource - Resource that wasn't found
   * @param metadata - Error metadata
   * @returns AppError instance
   * @complexity O(1)
   */
  static createNotFoundError(
    resource: string = "Resource",
    metadata: ErrorMetadata = {}
  ): AppError {
    return new AppError(`${resource} not found`, {
      ...metadata,
      category: ErrorCategory.NOT_FOUND,
      statusCode: 404,
      severity: ErrorSeverity.MEDIUM,
    });
  }

  /**
   * Creates a conflict error.
   *
   * @param message - Error message
   * @param metadata - Error metadata
   * @returns AppError instance
   * @complexity O(1)
   */
  static createConflictError(
    message: string = "Resource already exists",
    metadata: ErrorMetadata = {}
  ): AppError {
    return new AppError(message, {
      ...metadata,
      category: ErrorCategory.CONFLICT,
      statusCode: 409,
      severity: ErrorSeverity.MEDIUM,
    });
  }

  /**
   * Creates a rate limit error.
   *
   * @param message - Error message
   * @param metadata - Error metadata
   * @returns AppError instance
   * @complexity O(1)
   */
  static createRateLimitError(
    message: string = "Rate limit exceeded",
    metadata: ErrorMetadata = {}
  ): AppError {
    return new AppError(message, {
      ...metadata,
      category: ErrorCategory.RATE_LIMIT,
      statusCode: 429,
      severity: ErrorSeverity.MEDIUM,
    });
  }

  /**
   * Creates an internal server error.
   *
   * @param message - Error message
   * @param metadata - Error metadata
   * @returns AppError instance
   * @complexity O(1)
   */
  static createInternalError(
    message: string = "Internal server error",
    metadata: ErrorMetadata = {}
  ): AppError {
    return new AppError(message, {
      ...metadata,
      category: ErrorCategory.INTERNAL,
      statusCode: 500,
      severity: ErrorSeverity.HIGH,
    });
  }

  /**
   * Wraps an existing error with additional metadata.
   *
   * @param error - Original error
   * @param metadata - Additional metadata
   * @returns Enhanced AppError
   * @complexity O(1)
   */
  static wrapError(error: Error, metadata: ErrorMetadata = {}): AppError {
    if (error instanceof AppError) {
      // Merge metadata with existing AppError
      return new AppError(error.message, {
        category: error.category,
        severity: error.severity,
        statusCode: error.statusCode,
        code: error.code,
        context: { ...error.context, ...metadata.context },
        timestamp: error.timestamp,
        userId: error.userId || metadata.userId,
        requestId: error.requestId || metadata.requestId,
        cause: error.cause || metadata.cause,
        ...metadata,
      });
    }

    return new AppError(error.message, {
      ...metadata,
      cause: error,
      stack: error.stack,
    });
  }

  /**
   * Safely extracts error information from unknown input.
   *
   * @param error - Unknown error input
   * @returns Normalized error information
   * @complexity O(1)
   */
  static safeGetErrorInfo(error: unknown): {
    message: string;
    name: string;
    stack?: string;
    statusCode: number;
    category: ErrorCategory;
    severity: ErrorSeverity;
  } {
    if (error instanceof AppError) {
      return {
        message: error.message,
        name: error.name,
        stack: error.stack,
        statusCode: error.statusCode,
        category: error.category,
        severity: error.severity,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        name: error.name,
        stack: error.stack,
        statusCode: 500,
        category: ErrorCategory.INTERNAL,
        severity: ErrorSeverity.MEDIUM,
      };
    }

    if (TypeGuards.isString(error)) {
      return {
        message: error,
        name: "StringError",
        statusCode: 500,
        category: ErrorCategory.INTERNAL,
        severity: ErrorSeverity.MEDIUM,
      };
    }

    if (
      TypeGuards.isObject(error) &&
      TypeGuards.isString((error as any).message)
    ) {
      return {
        message: (error as any).message,
        name: (error as any).name || "ObjectError",
        statusCode: 500,
        category: ErrorCategory.INTERNAL,
        severity: ErrorSeverity.MEDIUM,
      };
    }

    return {
      message: "An unknown error occurred",
      name: "UnknownError",
      statusCode: 500,
      category: ErrorCategory.INTERNAL,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  /**
   * Formats error for client response (removes sensitive information).
   *
   * @param error - Error to format
   * @param includeStack - Whether to include stack trace
   * @returns Client-safe error object
   * @complexity O(1)
   */
  static formatForClient(
    error: unknown,
    includeStack = false
  ): Record<string, unknown> {
    const errorInfo = this.safeGetErrorInfo(error);

    const clientError: Record<string, unknown> = {
      message: errorInfo.message,
      statusCode: errorInfo.statusCode,
      category: errorInfo.category,
    };

    if (error instanceof AppError) {
      if (error.code) clientError.code = error.code;

      // Include validation field errors for client-side handling
      if (error instanceof ValidationError && error.fields) {
        clientError.fields = error.fields;
      }
    }

    // Only include stack in development or for critical errors
    if (includeStack && errorInfo.stack) {
      clientError.stack = errorInfo.stack;
    }

    return clientError;
  }

  /**
   * Formats error for logging (includes all details).
   *
   * @param error - Error to format
   * @param additionalContext - Additional context for logging
   * @returns Complete error log object
   * @complexity O(1)
   */
  static formatForLogging(
    error: unknown,
    additionalContext?: Record<string, unknown>
  ): Record<string, unknown> {
    const errorInfo = this.safeGetErrorInfo(error);

    const logData: Record<string, unknown> = {
      message: errorInfo.message,
      name: errorInfo.name,
      statusCode: errorInfo.statusCode,
      category: errorInfo.category,
      severity: errorInfo.severity,
      stack: errorInfo.stack,
      timestamp: new Date().toISOString(),
    };

    if (error instanceof AppError) {
      logData.code = error.code;
      logData.context = error.context;
      logData.userId = error.userId;
      logData.requestId = error.requestId;

      if (error.cause) {
        logData.cause = {
          message: error.cause.message,
          name: error.cause.name,
          stack: error.cause.stack,
        };
      }
    }

    if (additionalContext) {
      logData.additionalContext = additionalContext;
    }

    return logData;
  }

  /**
   * Checks if an error is operational (expected) vs programming error.
   *
   * @param error - Error to check
   * @returns True if operational error
   * @complexity O(1)
   */
  static isOperationalError(error: unknown): boolean {
    if (error instanceof AppError) {
      return [
        ErrorCategory.VALIDATION,
        ErrorCategory.AUTHENTICATION,
        ErrorCategory.AUTHORIZATION,
        ErrorCategory.NOT_FOUND,
        ErrorCategory.CONFLICT,
        ErrorCategory.RATE_LIMIT,
        ErrorCategory.USER_INPUT,
        ErrorCategory.BUSINESS_LOGIC,
      ].includes(error.category);
    }

    return false;
  }

  /**
   * Aggregates multiple errors into a single error.
   *
   * @param errors - Array of errors to aggregate
   * @param message - Aggregate error message
   * @param metadata - Error metadata
   * @returns Aggregated AppError
   * @complexity O(n) where n is number of errors
   */
  static aggregateErrors(
    errors: Error[],
    message: string = "Multiple errors occurred",
    metadata: ErrorMetadata = {}
  ): AppError {
    const context = {
      errorCount: errors.length,
      errors: errors.map((err) => this.safeGetErrorInfo(err)),
      ...metadata.context,
    };

    const highestSeverity = errors.reduce((highest, error) => {
      const errorInfo = this.safeGetErrorInfo(error);
      const severityLevels = Object.values(ErrorSeverity);
      const currentLevel = severityLevels.indexOf(errorInfo.severity);
      const highestLevel = severityLevels.indexOf(highest);

      return currentLevel > highestLevel ? errorInfo.severity : highest;
    }, ErrorSeverity.LOW);

    return new AppError(message, {
      ...metadata,
      context,
      severity: highestSeverity,
    });
  }

  /**
   * Creates an error handler function with context.
   *
   * @param context - Error context
   * @param logger - Optional logger function
   * @returns Error handler function
   * @complexity O(1) creation
   */
  static createErrorHandler(
    context: Record<string, unknown>,
    logger?: (error: Record<string, unknown>) => void
  ) {
    return (error: unknown) => {
      const enhancedError = this.wrapError(
        error instanceof Error ? error : new Error(String(error)),
        { context }
      );

      if (logger) {
        logger(this.formatForLogging(enhancedError));
      }

      return enhancedError;
    };
  }

  /**
   * Retries an operation with exponential backoff on failure.
   *
   * @param operation - Operation to retry
   * @param maxRetries - Maximum number of retries
   * @param baseDelay - Base delay in milliseconds
   * @returns Promise with operation result
   * @complexity O(1) per attempt
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) break;

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw this.wrapError(lastError!, {
      context: {
        attempts: maxRetries + 1,
        operation: operation.name || "anonymous",
      },
      category: ErrorCategory.EXTERNAL,
    });
  }
}
