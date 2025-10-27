/**
 * Shared Utilities Index
 *
 * Central export point for all shared utility functions and classes.
 * Provides a comprehensive toolkit for type safety, data manipulation,
 * security operations, and common functionality across all feature modules.
 *
 * @module SharedUtils
 * @category Shared Utils
 * @description Comprehensive utility library for the application
 * @version 1.0.0
 */

// =============================================================================
// BARREL EXPORTS - Simplified imports for cleaner code
// =============================================================================

// Export all base utilities
export * from "./base/type-guards.util";
export * from "./base/data-transform.util";
export * from "./base/array.util";
export * from "./base/object.util";
export * from "./base/string.util";
export * from "./base/date.util";
export * from "./base/validation.util";
export * from "./base/error.util";
export * from "./base/validation.constants";

// Export all security utilities
export * from "./security/crypto.util";
export * from "./security/password.util";
export * from "./security/jwt.util";
export * from "./security/rbac.util";
export * from "./security/audit.util";

// Legacy compatibility exports
export * from "./crypto";
export * from "./audit";
export * from "./jwt.utils";

// Export performance utilities
export * from "./performance/performance.util";
export * from "./base/validation.util";

// Error Handling - Structured error management
export {
  ErrorUtils,
  AppError,
  ValidationError,
  BusinessError,
  ErrorSeverity,
  ErrorCategory,
  type ErrorMetadata,
} from "./base/error.util";

// =============================================================================
// SECURITY UTILITIES - Cryptography, authentication, and authorization
// =============================================================================

// Cryptographic Operations - Encryption, hashing, and key management
export {
  CryptoUtils,
  EncryptionAlgorithm,
  HashAlgorithm,
  type KeyDerivationOptions,
  type EncryptedData,
  type HashResult,
} from "./security/crypto.util";

// Password Security - Password hashing, validation, and strength assessment
export {
  PasswordUtils,
  PasswordStrength,
  type PasswordValidationOptions,
  type PasswordStrengthResult,
  type PasswordHashResult,
} from "./security/password.util";

// JWT Operations - Token creation, verification, and management
export {
  JwtUtils,
  TokenType,
  type JwtPayload,
  type JwtSignOptions,
  type JwtVerifyOptions,
  type TokenValidationResult,
  type TokenPair,
} from "./security/jwt.util";

// RBAC Operations - Role-based access control and permissions
export {
  RbacUtils,
  PermissionAction,
  PermissionResource,
  PermissionScope,
  type Permission,
  type Role,
  type UserContext,
  type ResourceContext,
  type PermissionCheckResult,
  type PolicyContext,
} from "./security/rbac.util";

// Audit Logging - Security monitoring and event tracking
export {
  AuditUtils,
  AuditEventType,
  AuditSeverity,
  AuditStatus,
  type AuditEvent,
  type AuditFilter,
  type AuditSummary,
  type SecurityMonitoringConfig,
} from "./security/audit.util";

// =============================================================================
// UTILITY COLLECTIONS - Organized access to utility groups
// =============================================================================

// Import utilities for use in collections
import { TypeGuards } from "./base/type-guards.util";
import { DataTransformUtils } from "./base/data-transform.util";
import { ArrayUtils } from "./base/array.util";
import { ObjectUtils } from "./base/object.util";
import { StringUtils } from "./base/string.util";
import { DateUtils } from "./base/date.util";
import {
  ValidationUtils,
  type ValidationSchema,
  type ValidationOptions,
} from "./base/validation.util";
import { ErrorUtils } from "./base/error.util";
import { CryptoUtils, type EncryptedData } from "./security/crypto.util";
import {
  PasswordUtils,
  type PasswordHashResult,
} from "./security/password.util";
import { JwtUtils, type TokenPair } from "./security/jwt.util";
import {
  RbacUtils,
  type PermissionAction,
  type PermissionResource,
  type UserContext,
  type ResourceContext,
  type PermissionCheckResult,
} from "./security/rbac.util";
import { AuditUtils, type AuditEvent } from "./security/audit.util";

/**
 * Base utility collection for foundational operations
 */
export const BaseUtils = {
  TypeGuards,
  DataTransformUtils,
  ArrayUtils,
  ObjectUtils,
  StringUtils,
  DateUtils,
  ValidationUtils,
  ErrorUtils,
} as const;

/**
 * Security utility collection for authentication and authorization
 */
export const SecurityUtils = {
  CryptoUtils,
  PasswordUtils,
  JwtUtils,
  RbacUtils,
  AuditUtils,
} as const;

/**
 * All utilities collection for convenience
 */
export const AllUtils = {
  ...BaseUtils,
  ...SecurityUtils,
} as const;

// =============================================================================
// UTILITY FACTORY FUNCTIONS - Common utility patterns and helpers
// =============================================================================

/**
 * Creates a comprehensive validator function combining multiple validation rules.
 *
 * @param schema - Validation schema
 * @param options - Validation options
 * @returns Validator function
 *
 * @example
 * ```typescript
 * const userValidator = createValidator({
 *   email: [ValidationUtils.rules.required(), ValidationUtils.rules.email()],
 *   password: [ValidationUtils.rules.required(), ValidationUtils.rules.minLength(8)]
 * });
 *
 * const result = userValidator(userData);
 * ```
 */
export function createValidator<T extends Record<string, unknown>>(
  schema: ValidationSchema<T>,
  options?: ValidationOptions
) {
  return ValidationUtils.createValidator(schema, options);
}

/**
 * Creates a permission checker function for specific resource and action.
 *
 * @param action - Permission action required
 * @param resourceType - Resource type to check
 * @param options - Additional options
 * @returns Permission checker function
 *
 * @example
 * ```typescript
 * const canEditProject = createPermissionChecker(
 *   PermissionAction.UPDATE,
 *   PermissionResource.PROJECT
 * );
 *
 * const hasPermission = canEditProject(userContext, projectId);
 * ```
 */
export function createPermissionChecker(
  action: PermissionAction,
  resourceType: PermissionResource,
  options?: {
    resourceIdKey?: string;
    onDenied?: (reason: string) => void;
  }
) {
  return RbacUtils.createPermissionChecker(action, resourceType, options);
}

/**
 * Creates an error handler with context for consistent error processing.
 *
 * @param context - Error context information
 * @param logger - Optional logger function
 * @returns Error handler function
 *
 * @example
 * ```typescript
 * const handleApiError = createErrorHandler(
 *   { module: "userService", operation: "createUser" },
 *   console.error
 * );
 *
 * try {
 *   await createUser(userData);
 * } catch (error) {
 *   throw handleApiError(error);
 * }
 * ```
 */
export function createErrorHandler(
  context: Record<string, unknown>,
  logger?: (error: Record<string, unknown>) => void
) {
  return ErrorUtils.createErrorHandler(context, logger);
}

/**
 * Creates audit event loggers for common operations.
 *
 * @param logger - Base logger function
 * @returns Object with specialized audit loggers
 *
 * @example
 * ```typescript
 * const auditLoggers = createAuditLoggers(saveAuditEvent);
 *
 * // Log authentication events
 * await auditLoggers.auth.loginSuccess(userId, sessionId, clientInfo);
 *
 * // Log data access events
 * await auditLoggers.data.create(userId, resource, sessionId, tenantId);
 * ```
 */
export function createAuditLoggers(
  logger: (event: AuditEvent) => Promise<void>
) {
  return {
    auth: AuditUtils.createAuthEventLoggers(logger),
    data: AuditUtils.createDataEventLoggers(logger),
  };
}

// =============================================================================
// COMMON PATTERNS - Frequently used utility combinations
// =============================================================================

/**
 * Validates and sanitizes input data with comprehensive error handling.
 *
 * @param data - Raw input data
 * @param schema - Validation schema
 * @param options - Validation options
 * @returns Sanitized data or throws ValidationError
 *
 * @example
 * ```typescript
 * const userData = validateAndSanitize(
 *   requestBody,
 *   userValidationSchema,
 *   { trimStrings: true }
 * );
 * ```
 */
export async function validateAndSanitize<T extends Record<string, unknown>>(
  data: unknown,
  schema: ValidationSchema<T>,
  options?: ValidationOptions
): Promise<T> {
  // Use the sanitizeAndValidate method which handles both operations
  const { data: sanitizedData, result } = ValidationUtils.sanitizeAndValidate(
    data,
    schema,
    options
  );

  if (!result.isValid) {
    throw ErrorUtils.createValidationError(
      "Data validation failed",
      result.error
        ? { general: result.error }
        : { general: "Validation failed" }
    );
  }

  if (!sanitizedData) {
    throw ErrorUtils.createValidationError("Data sanitization failed", {
      general: "Sanitized data is null",
    });
  }

  return sanitizedData;
}

/**
 * Securely hashes a password with automatic salt generation.
 *
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 12)
 * @returns Promise resolving to password hash result
 *
 * @example
 * ```typescript
 * const hashResult = await hashPassword("userPassword123");
 * // Store hashResult.hash in database
 * ```
 */
export async function hashPassword(
  password: string,
  saltRounds?: number
): Promise<PasswordHashResult> {
  return PasswordUtils.hash(password, saltRounds);
}

/**
 * Verifies a password against its hash.
 *
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns Promise resolving to verification result
 *
 * @example
 * ```typescript
 * const isValid = await verifyPassword(inputPassword, storedHash);
 * ```
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return PasswordUtils.verify(password, hash);
}

/**
 * Creates JWT token pairs for authentication.
 *
 * @param userId - User identifier
 * @param secret - JWT secret
 * @param options - Token options
 * @returns Token pair with expiration dates
 *
 * @example
 * ```typescript
 * const tokens = createTokenPair("user123", jwtSecret, {
 *   permissions: ["read:projects", "write:projects"],
 *   tenantId: "tenant123"
 * });
 * ```
 */
export function createTokenPair(
  userId: string,
  secret: string,
  options?: {
    accessExpiresIn?: string;
    refreshExpiresIn?: string;
    permissions?: string[];
    roles?: string[];
    tenantId?: string;
    sessionId?: string;
    deviceId?: string;
  }
): TokenPair {
  return JwtUtils.createTokenPair(userId, secret, options);
}

/**
 * Checks user permission for a specific action on a resource.
 *
 * @param user - User context
 * @param action - Permission action
 * @param resource - Resource context
 * @returns Permission check result
 *
 * @example
 * ```typescript
 * const canEdit = checkPermission(
 *   userContext,
 *   PermissionAction.UPDATE,
 *   { type: PermissionResource.PROJECT, id: "proj-123" }
 * );
 * ```
 */
export function checkPermission(
  user: UserContext,
  action: PermissionAction,
  resource: ResourceContext
): PermissionCheckResult {
  return RbacUtils.checkPermission(user, action, resource);
}

/**
 * Encrypts sensitive data with password-based encryption.
 *
 * @param data - Data to encrypt
 * @param password - Encryption password
 * @returns Promise resolving to encrypted data structure
 *
 * @example
 * ```typescript
 * const encrypted = await encryptData("sensitive information", "encryption-key");
 * // Store encrypted structure safely
 * ```
 */
export async function encryptData(
  data: string,
  password: string
): Promise<EncryptedData> {
  return CryptoUtils.encrypt(data, password);
}

/**
 * Decrypts data encrypted with encryptData function.
 *
 * @param encryptedData - Encrypted data structure
 * @param password - Decryption password
 * @returns Promise resolving to decrypted string
 *
 * @example
 * ```typescript
 * const decrypted = await decryptData(encryptedStruct, "encryption-key");
 * ```
 */
export async function decryptData(
  encryptedData: EncryptedData,
  password: string
): Promise<string> {
  return CryptoUtils.decrypt(encryptedData, password);
}

// =============================================================================
// TYPE DEFINITIONS - Common types used across utilities
// =============================================================================

/**
 * Generic utility function type
 */
export type UtilityFunction<TArgs extends readonly unknown[], TReturn> = (
  ...args: TArgs
) => TReturn;

/**
 * Async utility function type
 */
export type AsyncUtilityFunction<TArgs extends readonly unknown[], TReturn> = (
  ...args: TArgs
) => Promise<TReturn>;

/**
 * Configuration options for utility initialization
 */
export interface UtilityConfig {
  /** Enable debug logging */
  debug?: boolean;
  /** Environment context */
  environment?: "development" | "staging" | "production";
  /** Default locale for formatting */
  locale?: string;
  /** Timezone for date operations */
  timezone?: string;
}

/**
 * Utility performance metrics
 */
export interface UtilityMetrics {
  /** Function name */
  functionName: string;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Memory usage in bytes */
  memoryUsage?: number;
  /** Success/failure status */
  success: boolean;
  /** Timestamp */
  timestamp: Date;
}

// =============================================================================
// VERSION INFORMATION
// =============================================================================

/**
 * Utility library version information
 */
export const UTILS_VERSION = {
  version: "1.0.0",
  buildDate: new Date().toISOString(),
  features: [
    "Type Safety",
    "Data Manipulation",
    "Security Operations",
    "Validation",
    "Error Handling",
    "Audit Logging",
    "RBAC",
    "JWT Management",
    "Cryptography",
    "Password Security",
  ],
} as const;

/**
 * Gets version information for the utility library
 */
export function getVersionInfo() {
  return UTILS_VERSION;
}
