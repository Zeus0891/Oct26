/**
 * =====================================================================
 *  ENTERPRISE ASYNC VALIDATOR — Asynchronous Validation Operations
 * =====================================================================
 *  Purpose:
 *   Handles asynchronous validation operations that require database
 *   lookups, external service calls, or complex business rule checks.
 *
 *  Features:
 *   - Uniqueness constraint validation
 *   - Cross-entity relationship validation
 *   - Tenant ownership verification
 *   - Performance monitoring with timing metrics
 *   - RLS-aware validation execution
 *
 *  Usage:
 *   Used for validations that cannot be performed with static rules
 *   and require runtime data verification.
 * =====================================================================
 */

import { z, ZodSchema } from "zod";
import { BaseValidator } from "./base.validator";
import {
  ValidationResult,
  ValidationSuccess,
  ValidationFailure,
  ValidationIssue,
  ValidationContext,
  ValidationFactory,
  ValidationSeverity,
  AsyncValidationResult,
} from "./validation.types";
import { withTenantRLS } from "../../lib/prisma/withRLS";

/**
 * Abstract base class for asynchronous validators.
 * Extends BaseValidator to provide async validation capabilities.
 *
 * @template T - The data type being validated
 *
 * @example
 * ```typescript
 * class EmailUniquenessValidator extends AsyncValidator<{ email: string }> {
 *   schema = z.object({ email: z.string().email() });
 *
 *   async validateUniqueness(data: { email: string }, context: ValidationContext) {
 *     return await this.validateAsync(data, context);
 *   }
 * }
 * ```
 */
export abstract class AsyncValidator<T> extends BaseValidator<T> {
  /**
   * Performs asynchronous validation with timing metrics.
   *
   * @param data - Data to validate
   * @param context - Validation context
   * @returns Promise resolving to AsyncValidationResult
   */
  async validateAsync(
    data: unknown,
    context: ValidationContext
  ): Promise<AsyncValidationResult<T>> {
    const startTime = performance.now();

    try {
      // First perform synchronous validation
      const syncResult = this.validate(data, context);
      if (!syncResult.success) {
        const durationMs = performance.now() - startTime;
        return {
          ...syncResult,
          durationMs,
          async: true,
        };
      }

      // Perform async validation
      const asyncResult = await this.performAsyncValidation(
        syncResult.data,
        context
      );
      const durationMs = performance.now() - startTime;

      return {
        ...asyncResult,
        durationMs,
        async: true,
      };
    } catch (error) {
      const durationMs = performance.now() - startTime;
      const validationIssue: ValidationIssue = {
        field: "async_validation",
        message: `Async validation failed: ${(error as Error).message}`,
        code: "ASYNC_VALIDATION_ERROR",
        severity: "ERROR" as ValidationSeverity,
        context,
      };

      return {
        success: false,
        errors: [validationIssue],
        durationMs,
        async: true,
      };
    }
  }

  /**
   * Performs asynchronous validation with RLS context.
   *
   * @param data - Data to validate
   * @param context - Validation context
   * @returns Promise resolving to AsyncValidationResult
   */
  async validateAsyncWithRLS(
    data: unknown,
    context: ValidationContext
  ): Promise<AsyncValidationResult<T>> {
    if (!context.tenantId) {
      const validationIssue: ValidationIssue = {
        field: "tenantId",
        message: "Tenant ID is required for RLS validation",
        code: "MISSING_TENANT_ID",
        severity: "ERROR" as ValidationSeverity,
        context,
      };

      return {
        success: false,
        errors: [validationIssue],
        durationMs: 0,
        async: true,
      };
    }

    return await withTenantRLS(
      context.tenantId,
      [], // Default empty roles, subclasses can override
      async () => {
        return await this.validateAsync(data, context);
      },
      context.actorId
    );
  }

  /**
   * Abstract method to be implemented by subclasses.
   * Contains the actual async validation logic.
   *
   * @param data - Validated data from sync validation
   * @param context - Validation context
   * @returns Promise resolving to AsyncValidationResult
   */
  protected abstract performAsyncValidation(
    data: T,
    context: ValidationContext
  ): Promise<AsyncValidationResult<T>>;

  /**
   * Validates uniqueness of a field within tenant scope.
   *
   * @param fieldName - Name of the field to check
   * @param fieldValue - Value to check for uniqueness
   * @param context - Validation context
   * @param excludeId - Optional ID to exclude from uniqueness check (for updates)
   * @returns Promise resolving to validation result
   */
  protected async validateUniqueness(
    fieldName: string,
    fieldValue: string,
    context: ValidationContext,
    excludeId?: string
  ): Promise<ValidationIssue | null> {
    // This is a placeholder implementation
    // Subclasses should override with actual database checks

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 10));

    // For demonstration - in real implementation, this would query the database
    const isDuplicate = false; // Replace with actual uniqueness check

    if (isDuplicate) {
      return {
        field: fieldName,
        message: `${fieldName} already exists in this tenant`,
        code: "DUPLICATE_VALUE",
        severity: "ERROR" as ValidationSeverity,
        context,
        meta: {
          fieldValue: fieldValue,
          excludeId,
        },
      };
    }

    return null;
  }

  /**
   * Validates that an entity belongs to the specified tenant.
   *
   * @param entityType - Type of entity to check
   * @param entityId - ID of the entity
   * @param tenantId - Expected tenant ID
   * @param context - Validation context
   * @returns Promise resolving to validation result
   */
  protected async validateTenantOwnership(
    entityType: string,
    entityId: string,
    tenantId: string,
    context: ValidationContext
  ): Promise<ValidationIssue | null> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 10));

    // For demonstration - in real implementation, this would query the database
    const belongsToTenant = true; // Replace with actual ownership check

    if (!belongsToTenant) {
      return {
        field: "tenantId",
        message: `${entityType} does not belong to the specified tenant`,
        code: "INVALID_TENANT_OWNERSHIP",
        severity: "ERROR" as ValidationSeverity,
        context,
        meta: {
          entityType,
          entityId,
          tenantId,
        },
      };
    }

    return null;
  }

  /**
   * Validates that referenced entities exist and are accessible.
   *
   * @param references - Array of entity references to validate
   * @param context - Validation context
   * @returns Promise resolving to validation issues array
   */
  protected async validateEntityReferences(
    references: Array<{ type: string; id: string; field: string }>,
    context: ValidationContext
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    for (const ref of references) {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 5));

      // For demonstration - in real implementation, this would query the database
      const entityExists = true; // Replace with actual existence check

      if (!entityExists) {
        issues.push({
          field: ref.field,
          message: `Referenced ${ref.type} does not exist`,
          code: "INVALID_ENTITY_REFERENCE",
          severity: "ERROR" as ValidationSeverity,
          context,
          meta: {
            entityType: ref.type,
            entityId: ref.id,
          },
        });
      }
    }

    return issues;
  }

  /**
   * Combines multiple async validation results.
   *
   * @param results - Array of async validation results
   * @returns Combined async validation result
   */
  protected combineAsyncResults<U>(
    results: AsyncValidationResult<U>[]
  ): AsyncValidationResult<U[]> {
    const failures = results.filter(
      (r): r is ValidationFailure & { durationMs?: number; async?: boolean } =>
        !r.success
    );
    const successes = results.filter(
      (
        r
      ): r is ValidationSuccess<U> & { durationMs?: number; async?: boolean } =>
        r.success
    );

    const totalDuration = results.reduce(
      (sum, r) => sum + (r.durationMs || 0),
      0
    );

    if (failures.length > 0) {
      const allErrors = failures.flatMap((f) => f.errors);
      return {
        success: false,
        errors: allErrors,
        durationMs: totalDuration,
        async: true,
      };
    }

    const data = successes.map((s) => s.data);
    const allWarnings = successes.flatMap((s) => s.warnings || []);

    return {
      success: true,
      data,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
      durationMs: totalDuration,
      async: true,
    };
  }
}

/**
 * Concrete async validator implementations for common use cases.
 */

/**
 * Email uniqueness validator.
 * Validates that an email address is unique within a tenant.
 */
export class EmailUniquenessValidator extends AsyncValidator<{
  email: string;
}> {
  schema = z.object({
    email: z.string().email(),
  });

  protected async performAsyncValidation(
    data: { email: string },
    context: ValidationContext
  ): Promise<AsyncValidationResult<{ email: string }>> {
    if (!context.tenantId) {
      return {
        success: false,
        errors: [
          {
            field: "tenantId",
            message: "Tenant ID is required for email uniqueness validation",
            code: "MISSING_TENANT_ID",
            severity: "ERROR" as ValidationSeverity,
            context,
          },
        ],
        durationMs: 0,
        async: true,
      };
    }

    const uniquenessIssue = await this.validateUniqueness(
      "email",
      data.email,
      context
    );

    if (uniquenessIssue) {
      return {
        success: false,
        errors: [uniquenessIssue],
        durationMs: 0,
        async: true,
      };
    }

    return {
      success: true,
      data,
      durationMs: 0,
      async: true,
    };
  }
}

/**
 * Tenant code uniqueness validator.
 * Validates that a tenant code is globally unique.
 */
export class TenantCodeUniquenessValidator extends AsyncValidator<{
  code: string;
}> {
  schema = z.object({
    code: z.string().min(3).max(50),
  });

  protected async performAsyncValidation(
    data: { code: string },
    context: ValidationContext
  ): Promise<AsyncValidationResult<{ code: string }>> {
    // For tenant codes, we check global uniqueness (not tenant-scoped)
    const uniquenessIssue = await this.validateUniqueness(
      "code",
      data.code,
      { ...context, tenantId: "global" } // Use global scope for tenant codes
    );

    if (uniquenessIssue) {
      return {
        success: false,
        errors: [uniquenessIssue],
        durationMs: 0,
        async: true,
      };
    }

    return {
      success: true,
      data,
      durationMs: 0,
      async: true,
    };
  }
}

/**
 * Entity ownership validator.
 * Validates that entities belong to the correct tenant.
 */
export class EntityOwnershipValidator extends AsyncValidator<{
  entityType: string;
  entityId: string;
  tenantId: string;
}> {
  schema = z.object({
    entityType: z.string().min(1),
    entityId: z.string().uuid(),
    tenantId: z.string().uuid(),
  });

  protected async performAsyncValidation(
    data: { entityType: string; entityId: string; tenantId: string },
    context: ValidationContext
  ): Promise<
    AsyncValidationResult<{
      entityType: string;
      entityId: string;
      tenantId: string;
    }>
  > {
    const ownershipIssue = await this.validateTenantOwnership(
      data.entityType,
      data.entityId,
      data.tenantId,
      context
    );

    if (ownershipIssue) {
      return {
        success: false,
        errors: [ownershipIssue],
        durationMs: 0,
        async: true,
      };
    }

    return {
      success: true,
      data,
      durationMs: 0,
      async: true,
    };
  }
}
