/**
 * =====================================================================
 *  ENTERPRISE VALIDATION TYPES — Shared Transversal Layer
 * =====================================================================
 *  Purpose:
 *   Defines the unified data structures for validation across all ERP modules.
 *   These types are used by BaseValidator, AsyncValidator, DTOValidator,
 *   and all feature-level validators.
 *
 *  Design Principles:
 *   - Framework-agnostic (no Prisma client, no Zod imports)
 *   - Compatible with RLS, RBAC, and audit pipeline
 *   - Supports warnings, severity levels, contextual metadata, and suggestions
 *   - 100% type-safe and forward-compatible
 * =====================================================================
 */

/**
 * Severity levels for validation results.
 * Extendable for "INFO" or custom categories if required.
 */
export type ValidationSeverity = "ERROR" | "WARNING";

/**
 * Type of the entity or data source being validated.
 * Helps correlate validation events with audit trails.
 */
export interface ValidationContext {
  tenantId?: string;
  entity?: string; // Example: "Estimate", "Invoice", "User"
  entityId?: string;
  correlationId?: string; // Audit correlation ID
  actorId?: string; // Member/User performing the action
  timestamp?: Date;
}

/**
 * Individual validation issue.
 * Each field-level or rule-level validation error/warning
 * should be represented as a ValidationIssue.
 */
export interface ValidationIssue {
  /** Field or property name where the validation failed */
  field: string;

  /** Human-readable validation message */
  message: string;

  /** Optional code for error categorization or i18n mapping */
  code?: string;

  /** Severity level — ERROR blocks persistence, WARNING may not */
  severity?: ValidationSeverity;

  /** Suggested remediation for the user or system */
  suggestion?: string;

  /** Extended metadata (contextual or debug info) */
  meta?: Record<string, any>;

  /** Contextual reference for multi-tenant audit pipelines */
  context?: ValidationContext;
}

/**
 * Base structure for successful validations.
 * Used when data passes validation or contains non-blocking warnings.
 */
export interface ValidationSuccess<T = unknown> {
  success: true;
  /** The validated and possibly transformed data */
  data: T;
  /** Optional list of warnings (non-blocking) */
  warnings?: ValidationIssue[];
  /** Optional contextual metadata for audit or tracking */
  context?: ValidationContext;
}

/**
 * Base structure for failed validations.
 * Used when blocking errors are detected.
 */
export interface ValidationFailure {
  success: false;
  /** List of blocking validation errors */
  errors: ValidationIssue[];
  /** Optional contextual metadata */
  context?: ValidationContext;
}

/**
 * Unified validation result.
 * Returned by all validators across the system.
 */
export type ValidationResult<T = unknown> =
  | ValidationSuccess<T>
  | ValidationFailure;

/**
 * Async validation result (extends ValidationResult with async metadata).
 * Must use type composition (&), not interface extension.
 */
export type AsyncValidationResult<T = unknown> =
  | (ValidationSuccess<T> & {
      durationMs?: number;
      async?: boolean;
    })
  | (ValidationFailure & {
      durationMs?: number;
      async?: boolean;
    });

/**
 * Helper interface for validation rule metadata.
 * Useful for building reusable BusinessRuleEngine entries.
 */
export interface ValidationRule {
  /** Unique rule ID or code */
  id: string;
  /** Human-readable description of the rule */
  description: string;
  /** Severity if the rule fails */
  severity: ValidationSeverity;
  /** Optional tags for grouping (e.g. "Finance", "Security") */
  tags?: string[];
  /** Whether the rule is currently enabled */
  active?: boolean;
}

/**
 * Aggregated report of all validations executed within a transaction.
 * Useful for batch or multi-entity validations.
 */
export interface ValidationReport<T = unknown> {
  /** Aggregate success indicator */
  success: boolean;
  /** All validation results (successes and failures) */
  results: ValidationResult<T>[];
  /** Total count of issues found */
  totalIssues: number;
  /** Timestamp of when the report was generated */
  generatedAt: Date;
  /** Optional metadata (tenant, actor, correlationId, etc.) */
  context?: ValidationContext;
}

/**
 * Utility factory functions (optional but recommended).
 * These ensure consistent creation of ValidationResult objects.
 */
export const ValidationFactory = {
  success<T>(
    data: T,
    warnings?: ValidationIssue[],
    context?: ValidationContext
  ): ValidationSuccess<T> {
    return { success: true, data, warnings, context };
  },

  failure(
    errors: ValidationIssue[],
    context?: ValidationContext
  ): ValidationFailure {
    return { success: false, errors, context };
  },
};

/**
 * Type guards for safe runtime checks.
 */
export const isValidationSuccess = <T>(
  result: ValidationResult<T>
): result is ValidationSuccess<T> => result.success;

export const isValidationFailure = <T>(
  result: ValidationResult<T>
): result is ValidationFailure => !result.success;

/**
 * Example usage:
 *
 * const result = validator.validate(data);
 * if (isValidationFailure(result)) {
 *   logger.error("Validation failed:", result.errors);
 * } else {
 *   proceedWith(result.data);
 * }
 */
