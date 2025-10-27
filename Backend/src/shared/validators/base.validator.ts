import { z, ZodSchema, ZodIssue } from "zod";
import {
  ValidationResult,
  ValidationSuccess,
  ValidationFailure,
  ValidationIssue,
  ValidationContext,
  ValidationFactory,
  ValidationSeverity,
} from "./validation.types";
import { withTenantRLS } from "../../lib/prisma/withRLS";

/**
 * Abstract base validator class providing foundational validation patterns.
 *
 * All shared and feature-level validators should extend this class to ensure
 * consistent validation behavior across the enterprise system.
 *
 * Features:
 * - Zod schema integration with standardized error mapping
 * - Rich contextual metadata for audit and RLS integration
 * - Support for warnings and blocking errors
 * - Optional RLS-aware validation execution
 *
 * @template T - The validated data type
 *
 * @example
 * ```typescript
 * class UserValidator extends BaseValidator<User> {
 *   schema = z.object({
 *     email: z.string().email(),
 *     name: z.string().min(1)
 *   });
 * }
 *
 * const validator = new UserValidator();
 * const result = validator.validate(userData, context);
 * ```
 */
export abstract class BaseValidator<T> {
  /**
   * Zod schema for validating entity data.
   * Must be implemented by each validator subclass.
   */
  abstract readonly schema: ZodSchema<T>;

  /**
   * Core validation method using Zod schema.
   * Maps Zod validation issues to standardized ValidationIssue format.
   *
   * @param data - Raw data to validate
   * @param context - Validation context for audit and RLS
   * @returns ValidationResult with success/failure and issues
   */
  validate(data: unknown, context?: ValidationContext): ValidationResult<T> {
    try {
      const result = this.schema.safeParse(data);

      if (result.success) {
        return ValidationFactory.success(result.data, undefined, context);
      }

      const errors = result.error.issues.map((issue: ZodIssue) =>
        this.mapZodIssueToValidationIssue(issue, context)
      );

      return ValidationFactory.failure(errors, context);
    } catch (error) {
      const validationIssue: ValidationIssue = {
        field: "unknown",
        message: `Validation error: ${
          (error as Error).message || "Unknown error"
        }`,
        code: "VALIDATION_EXCEPTION",
        severity: "ERROR" as ValidationSeverity,
        context,
      };

      return ValidationFactory.failure([validationIssue], context);
    }
  }

  /**
   * Validates data with optional RLS context integration.
   * This method can be overridden by subclasses to integrate with withTenantRLS.
   *
   * @param data - Raw data to validate
   * @param context - Validation context including tenant information
   * @returns ValidationResult with RLS-aware validation
   */
  async validateWithRLS(
    data: unknown,
    context: ValidationContext
  ): Promise<ValidationResult<T>> {
    // Base implementation wraps validation with RLS context
    // Subclasses can override to integrate with withTenantRLS
    if (context.tenantId) {
      return await withTenantRLS(
        context.tenantId,
        [], // Default empty roles array, subclasses can override
        async () => {
          return this.validate(data, context);
        },
        context.actorId
      );
    }

    // Fallback to regular validation if RLS context is incomplete
    return this.validate(data, context);
  }

  /**
   * Validates data for creation operations.
   * Can be overridden to add creation-specific validation rules.
   *
   * @param data - Data for entity creation
   * @param context - Validation context
   * @returns ValidationResult for create operation
   */
  validateForCreate(
    data: unknown,
    context?: ValidationContext
  ): ValidationResult<T> {
    return this.validate(data, context);
  }

  /**
   * Validates data for update operations.
   * Note: Partial validation should be implemented by subclasses as needed.
   *
   * @param data - Data for entity update
   * @param context - Validation context
   * @returns ValidationResult for update operation
   */
  validateForUpdate(
    data: unknown,
    context?: ValidationContext
  ): ValidationResult<T> {
    // Base implementation uses full validation
    // Subclasses can override to implement partial validation
    return this.validate(data, context);
  }

  /**
   * Maps Zod validation issues to standardized ValidationIssue format.
   *
   * @param issue - Zod validation issue
   * @param context - Validation context
   * @returns Formatted ValidationIssue
   */
  protected mapZodIssueToValidationIssue(
    issue: ZodIssue,
    context?: ValidationContext
  ): ValidationIssue {
    return {
      field: issue.path.length > 0 ? issue.path.join(".") : "root",
      message: issue.message,
      code: issue.code.toUpperCase(),
      severity: "ERROR" as ValidationSeverity,
      meta: {
        zodCode: issue.code,
        expectedType: this.getExpectedTypeFromIssue(issue),
        receivedValue: "received" in issue ? issue.received : undefined,
      },
      context,
    };
  }

  /**
   * Extracts expected type information from Zod issue for better error messages.
   *
   * @param issue - Zod validation issue
   * @returns Expected type description
   */
  protected getExpectedTypeFromIssue(issue: ZodIssue): string {
    switch (issue.code) {
      case "invalid_type":
        return `Expected ${(issue as any).expected}, received ${
          (issue as any).received
        }`;
      case "too_small":
        return `Minimum ${(issue as any).minimum} ${
          (issue as any).type === "string" ? "characters" : "value"
        }`;
      case "too_big":
        return `Maximum ${(issue as any).maximum} ${
          (issue as any).type === "string" ? "characters" : "value"
        }`;
      case "invalid_format":
        return "Valid format";
      case "unrecognized_keys":
        return "Valid object structure";
      case "invalid_union":
        return "Valid union type";
      case "custom":
        return issue.message || "Valid value";
      default:
        return "Valid value";
    }
  }

  /**
   * Creates a validation context with standard metadata.
   * Helper method for consistent context creation.
   *
   * @param overrides - Context properties to override
   * @returns Complete ValidationContext
   */
  protected createValidationContext(
    overrides: Partial<ValidationContext> = {}
  ): ValidationContext {
    return {
      timestamp: new Date(),
      ...overrides,
    };
  }

  /**
   * Adds warning to successful validation result.
   * Useful for non-blocking validation issues.
   *
   * @param result - Existing validation result
   * @param warning - Warning to add
   * @returns Updated validation result
   */
  protected addWarning<U>(
    result: ValidationResult<U>,
    warning: ValidationIssue
  ): ValidationResult<U> {
    if (result.success) {
      const existingWarnings = result.warnings || [];
      const newWarnings = [...existingWarnings, warning];
      return { ...result, warnings: newWarnings };
    }
    return result;
  }

  /**
   * Combines multiple validation results into a single result.
   * Useful for validating complex objects with multiple validators.
   *
   * @param results - Array of validation results
   * @returns Combined validation result
   */
  protected static combineResults<U>(
    results: ValidationResult<U>[]
  ): ValidationResult<U[]> {
    const failures = results.filter((r): r is ValidationFailure => !r.success);
    const successes = results.filter(
      (r): r is ValidationSuccess<U> => r.success
    );

    if (failures.length > 0) {
      const allErrors = failures.flatMap((f) => f.errors);
      return ValidationFactory.failure(allErrors);
    }

    const data = successes.map((s) => s.data);
    const allWarnings = successes.flatMap((s) => s.warnings || []);

    return ValidationFactory.success(
      data,
      allWarnings.length > 0 ? allWarnings : undefined
    );
  }
}
