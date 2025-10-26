/**
 * =====================================================================
 *  ENTERPRISE VALIDATION SYSTEM — Main Export Index
 * =====================================================================
 *  Purpose:
 *   Central export point for all shared validators in the enterprise
 *   validation system. Provides clean, organized access to all
 *   validation components and utilities.
 *
 *  Exported Components:
 *   - Base validator classes
 *   - DTO validators for API requests
 *   - Async validators for database operations
 *   - Business rule validators
 *   - Cross-field validators
 *   - Authentication validators
 *   - RBAC validators (roles and permissions)
 *   - Validation utilities and helpers
 *   - Type definitions and interfaces
 *
 *  Usage:
 *   Import specific validators or use namespace imports:
 *
 *   ```typescript
 *   // Specific imports
 *   import { BaseValidator, DTOValidator } from '@/shared/validators';
 *
 *   // Namespace import
 *   import * as Validators from '@/shared/validators';
 *   ```
 * =====================================================================
 */

// =====================================================================
// CORE VALIDATION TYPES AND UTILITIES
// =====================================================================

// Export all validation types and interfaces
export * from "./validation.types";
import type { ValidationContext } from "./validation.types";

// Export validation utilities and helper functions
export * from "./validation.utils";

// =====================================================================
// BASE VALIDATOR CLASSES
// =====================================================================

// Export the foundational base validator
export { BaseValidator } from "./base.validator";

// Export async validation capabilities
export { AsyncValidator } from "./async.validator";

// =====================================================================
// SPECIALIZED VALIDATORS
// =====================================================================

// DTO Validation for API requests
export { DTOValidator, DTOSchemas, CommonDTOValidators } from "./dto.validator";

// Business Rule Validation
export {
  BusinessRuleValidator,
  FinancialTransactionBusinessRuleValidator,
  ProjectTimelineBusinessRuleValidator,
  type BusinessRule,
  type BusinessRuleContext,
  type BusinessRuleSeverity,
} from "./business-rule.validator";

// Cross-Field Validation
export {
  CrossFieldValidator,
  DateRangeCrossFieldValidator,
  FinancialCalculationCrossFieldValidator,
  AddressCrossFieldValidator,
  type CrossFieldRule,
} from "./cross-field.validator";

// =====================================================================
// AUTHENTICATION AND SECURITY VALIDATORS
// =====================================================================

// Authentication validators
export {
  AuthSchemas,
  LoginCredentialsValidator,
  UserRegistrationValidator,
  MFAValidator,
  PasswordResetValidator,
  TokenValidator,
  SessionValidator,
} from "./auth.validator";

// =====================================================================
// RBAC VALIDATORS
// =====================================================================

// Role management validators
export {
  RoleSchemas,
  RoleCreationValidator,
  RoleUpdateValidator,
  RoleAssignmentValidator,
  RoleHierarchyValidator,
  RoleDeletionValidator,
  type RoleType,
} from "./role.validator";

// Permission management validators
export {
  PermissionSchemas,
  PermissionCreationValidator,
  PermissionAssignmentValidator,
  PermissionInheritanceValidator,
  PermissionUpdateValidator,
  PermissionDeletionValidator,
  type PermissionScope,
  type PermissionAction,
} from "./permission.validator";

// =====================================================================
// CONCRETE ASYNC VALIDATOR IMPLEMENTATIONS
// =====================================================================

// Specific async validators for common use cases
export {
  EmailUniquenessValidator,
  TenantCodeUniquenessValidator,
  EntityOwnershipValidator,
} from "./async.validator";

// =====================================================================
// VALIDATION FACTORY AND HELPERS
// =====================================================================

// Re-export validation factory for easy access
export { ValidationFactory } from "./validation.types";

// =====================================================================
// TYPE GUARDS AND UTILITIES
// =====================================================================

// Re-export type guards for runtime validation checking
export { isValidationSuccess, isValidationFailure } from "./validation.types";

// =====================================================================
// VALIDATION CONSTANTS AND CONFIGURATIONS
// =====================================================================

/**
 * Default validation configuration values.
 */
export const ValidationDefaults = {
  // Password validation defaults
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,

  // Text field length defaults
  SHORT_TEXT_MAX_LENGTH: 100,
  MEDIUM_TEXT_MAX_LENGTH: 500,
  LONG_TEXT_MAX_LENGTH: 2000,

  // Numeric validation defaults
  PERCENTAGE_MIN: 0,
  PERCENTAGE_MAX: 100,
  TAX_RATE_MIN: 0,
  TAX_RATE_MAX: 1,

  // Date validation defaults
  MAX_DATE_RANGE_YEARS: 5,
  MAX_PROJECT_DURATION_YEARS: 2,

  // Role and permission defaults
  ROLE_CODE_MIN_LENGTH: 3,
  ROLE_CODE_MAX_LENGTH: 50,
  PERMISSION_CODE_MIN_LENGTH: 3,
  PERMISSION_CODE_MAX_LENGTH: 100,

  // Pagination defaults
  PAGINATION_DEFAULT_LIMIT: 50,
  PAGINATION_MAX_LIMIT: 1000,

  // Session defaults
  SESSION_EXPIRY_WARNING_MINUTES: 15,

  // Business rule defaults
  APPROVAL_WARNING_THRESHOLD: 5000,
  APPROVAL_BLOCKING_THRESHOLD: 50000,
  DISCOUNT_WARNING_THRESHOLD: 20,
  DISCOUNT_MAX_THRESHOLD: 50,
} as const;

/**
 * Common validation error codes used across validators.
 */
export const ValidationErrorCodes = {
  // Generic validation errors
  VALIDATION_EXCEPTION: "VALIDATION_EXCEPTION",
  REQUIRED_FIELD_MISSING: "REQUIRED_FIELD_MISSING",
  INVALID_FORMAT: "INVALID_FORMAT",

  // Uniqueness validation errors
  DUPLICATE_VALUE: "DUPLICATE_VALUE",
  DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
  DUPLICATE_CODE: "DUPLICATE_CODE",

  // Relationship validation errors
  INVALID_ENTITY_REFERENCE: "INVALID_ENTITY_REFERENCE",
  INVALID_TENANT_OWNERSHIP: "INVALID_TENANT_OWNERSHIP",
  CIRCULAR_REFERENCE: "CIRCULAR_REFERENCE",

  // Security validation errors
  WEAK_PASSWORD: "WEAK_PASSWORD",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",

  // Business rule errors
  APPROVAL_REQUIRED: "APPROVAL_REQUIRED",
  BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
  INVALID_DATE_RANGE: "INVALID_DATE_RANGE",
  CALCULATION_ERROR: "CALCULATION_ERROR",

  // RBAC errors
  INVALID_ROLE_ASSIGNMENT: "INVALID_ROLE_ASSIGNMENT",
  INVALID_PERMISSION_SCOPE: "INVALID_PERMISSION_SCOPE",
  PERMISSION_INHERITANCE_ERROR: "PERMISSION_INHERITANCE_ERROR",
} as const;

/**
 * Helper functions for creating common validation contexts.
 */
export const ValidationContextHelpers = {
  /**
   * Creates a standard validation context with timestamp.
   */
  createContext: (overrides: Partial<ValidationContext> = {}) => ({
    timestamp: new Date(),
    ...overrides,
  }),

  /**
   * Creates a tenant-scoped validation context.
   */
  createTenantContext: (
    tenantId: string,
    overrides: Partial<ValidationContext> = {}
  ) => ({
    timestamp: new Date(),
    tenantId,
    ...overrides,
  }),

  /**
   * Creates an actor-aware validation context.
   */
  createActorContext: (
    tenantId: string,
    actorId: string,
    overrides: Partial<ValidationContext> = {}
  ) => ({
    timestamp: new Date(),
    tenantId,
    actorId,
    ...overrides,
  }),

  /**
   * Creates a full validation context with correlation ID.
   */
  createFullContext: (
    tenantId: string,
    actorId: string,
    entity: string,
    entityId?: string,
    correlationId?: string
  ) => ({
    timestamp: new Date(),
    tenantId,
    actorId,
    entity,
    entityId,
    correlationId:
      correlationId ||
      `${entity}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  }),
};

// =====================================================================
// VERSION AND METADATA
// =====================================================================

/**
 * Validation system metadata.
 */
export const ValidationSystemInfo = {
  version: "1.0.0",
  description: "Enterprise Validation System for Multitenant SaaS ERP",
  features: [
    "Schema validation with Zod integration",
    "Async validation with database checks",
    "Business rule validation",
    "Cross-field dependency validation",
    "Authentication and security validation",
    "RBAC role and permission validation",
    "RLS-aware validation execution",
    "Comprehensive error reporting",
    "Performance monitoring",
    "Type-safe validation results",
  ],
  compatibility: {
    nodejs: ">=18.0.0",
    typescript: ">=5.0.0",
    zod: ">=3.0.0",
    prisma: ">=5.0.0",
  },
} as const;
