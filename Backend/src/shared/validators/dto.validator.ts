/**
 * =====================================================================
 *  ENTERPRISE DTO VALIDATOR — API Request Validation
 * =====================================================================
 *  Purpose:
 *   Validates incoming DTOs for API requests, focusing on structural
 *   integrity, required fields, format validation, and data types.
 *
 *  Features:
 *   - UUID format validation
 *   - Date/time format validation
 *   - Email and phone number validation
 *   - Required field enforcement
 *   - Type safety and format consistency
 *
 *  Usage:
 *   Used by API controllers and middleware to validate incoming
 *   request payloads before processing.
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
} from "./validation.types";
import {
  isUUID,
  isEmail,
  isValidPhoneNumber,
  isValidDate,
  isValidURL,
  isValidJSON,
  isValidLength,
  isValidCurrencyCode,
} from "./validation.utils";

/**
 * Common DTO validation schemas using Zod with custom refinements.
 */
export class DTOSchemas {
  /**
   * UUID field validation schema.
   */
  static readonly uuid = z.string().refine(isUUID, {
    message: "Must be a valid UUID format",
  });

  /**
   * Email field validation schema.
   */
  static readonly email = z.string().email().refine(isEmail, {
    message: "Must be a valid email address",
  });

  /**
   * Phone number validation schema.
   */
  static readonly phoneNumber = z.string().refine(isValidPhoneNumber, {
    message: "Must be a valid phone number",
  });

  /**
   * ISO date string validation schema.
   */
  static readonly isoDate = z.string().refine(isValidDate, {
    message: "Must be a valid ISO date string",
  });

  /**
   * URL validation schema.
   */
  static readonly url = z.string().url().refine(isValidURL, {
    message: "Must be a valid URL",
  });

  /**
   * JSON string validation schema.
   */
  static readonly jsonString = z.string().refine(isValidJSON, {
    message: "Must be valid JSON",
  });

  /**
   * Currency code validation schema.
   */
  static readonly currencyCode = z
    .string()
    .length(3)
    .refine(isValidCurrencyCode, {
      message: "Must be a valid ISO 4217 currency code",
    });

  /**
   * Tenant-scoped name validation.
   */
  static readonly tenantName = z
    .string()
    .refine((val) => isValidLength(val, 1, 100), {
      message: "Name must be between 1 and 100 characters",
    });

  /**
   * Description field validation.
   */
  static readonly description = z
    .string()
    .refine((val) => isValidLength(val, 0, 2000), {
      message: "Description must not exceed 2000 characters",
    })
    .optional();

  /**
   * Status field validation (generic).
   */
  static readonly status = z.enum([
    "ACTIVE",
    "INACTIVE",
    "PENDING",
    "ARCHIVED",
  ]);

  /**
   * Pagination offset validation.
   */
  static readonly paginationOffset = z.number().int().min(0);

  /**
   * Pagination limit validation.
   */
  static readonly paginationLimit = z.number().int().min(1).max(1000);
}

/**
 * Generic DTO validator for common API request patterns.
 * Extends BaseValidator to provide DTO-specific validation logic.
 *
 * @template T - The DTO type being validated
 *
 * @example
 * ```typescript
 * const createUserSchema = z.object({
 *   email: DTOSchemas.email,
 *   name: DTOSchemas.tenantName,
 *   tenantId: DTOSchemas.uuid
 * });
 *
 * const validator = new DTOValidator(createUserSchema);
 * const result = validator.validate(requestBody, context);
 * ```
 */
export class DTOValidator<T> extends BaseValidator<T> {
  constructor(public readonly schema: ZodSchema<T>) {
    super();
  }

  /**
   * Validates DTO with enhanced field-level error messages.
   * Provides more user-friendly error messages for API responses.
   *
   * @param data - Raw DTO data to validate
   * @param context - Validation context
   * @returns ValidationResult with enhanced error messages
   */
  validateDTO(data: unknown, context?: ValidationContext): ValidationResult<T> {
    const result = this.validate(data, context);

    if (!result.success) {
      // Enhance error messages for better API responses
      const failure = result as ValidationFailure;
      const enhancedErrors = failure.errors.map((error) => ({
        ...error,
        message: this.enhanceErrorMessage(error.field, error.message),
      }));

      return ValidationFactory.failure(enhancedErrors, context);
    }

    return result;
  }

  /**
   * Validates create operation DTO.
   * Ensures all required fields for entity creation are present.
   *
   * @param data - Create DTO data
   * @param context - Validation context
   * @returns ValidationResult for create operation
   */
  validateForCreate(
    data: unknown,
    context?: ValidationContext
  ): ValidationResult<T> {
    const result = this.validateDTO(data, context);

    if (!result.success) {
      return result;
    }

    // Add creation-specific warnings
    const warnings: ValidationIssue[] = [];

    // Check for potentially missing optional fields that are recommended
    if (typeof data === "object" && data !== null) {
      const dataObj = data as Record<string, unknown>;

      if (!dataObj.description) {
        warnings.push({
          field: "description",
          message: "Consider adding a description for better record keeping",
          code: "MISSING_OPTIONAL_DESCRIPTION",
          severity: "WARNING" as ValidationSeverity,
          context,
        });
      }
    }

    return warnings.length > 0
      ? ValidationFactory.success(result.data, warnings, context)
      : result;
  }

  /**
   * Validates update operation DTO.
   * Allows partial updates while maintaining data integrity.
   *
   * @param data - Update DTO data
   * @param context - Validation context
   * @returns ValidationResult for update operation
   */
  validateForUpdate(
    data: unknown,
    context?: ValidationContext
  ): ValidationResult<T> {
    // For updates, we validate the provided fields only
    try {
      const result = this.schema.safeParse(data);

      if (result.success) {
        return ValidationFactory.success(result.data, undefined, context);
      }

      const errors = result.error.issues.map((issue: any) =>
        this.mapZodIssueToValidationIssue(issue, context)
      );

      return ValidationFactory.failure(errors, context);
    } catch (error) {
      const validationIssue: ValidationIssue = {
        field: "unknown",
        message: `Update validation error: ${
          (error as Error).message || "Unknown error"
        }`,
        code: "UPDATE_VALIDATION_EXCEPTION",
        severity: "ERROR" as ValidationSeverity,
        context,
      };

      return ValidationFactory.failure([validationIssue], context);
    }
  }

  /**
   * Validates pagination parameters.
   *
   * @param params - Pagination parameters
   * @param context - Validation context
   * @returns ValidationResult for pagination
   */
  static validatePagination(
    params: { offset?: number; limit?: number },
    context?: ValidationContext
  ): ValidationResult<{ offset: number; limit: number }> {
    const schema = z.object({
      offset: DTOSchemas.paginationOffset.default(0),
      limit: DTOSchemas.paginationLimit.default(50),
    });

    try {
      const result = schema.safeParse(params);

      if (result.success) {
        return ValidationFactory.success(result.data, undefined, context);
      }

      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code.toUpperCase(),
        severity: "ERROR" as ValidationSeverity,
        context,
      }));

      return ValidationFactory.failure(errors, context);
    } catch (error) {
      const validationIssue: ValidationIssue = {
        field: "pagination",
        message: `Pagination validation error: ${
          (error as Error).message || "Unknown error"
        }`,
        code: "PAGINATION_VALIDATION_EXCEPTION",
        severity: "ERROR" as ValidationSeverity,
        context,
      };

      return ValidationFactory.failure([validationIssue], context);
    }
  }

  /**
   * Validates query parameters for filtering and searching.
   *
   * @param params - Query parameters
   * @param context - Validation context
   * @returns ValidationResult for query parameters
   */
  static validateQueryParams(
    params: Record<string, unknown>,
    context?: ValidationContext
  ): ValidationResult<Record<string, unknown>> {
    const warnings: ValidationIssue[] = [];
    const cleanedParams: Record<string, unknown> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        warnings.push({
          field: key,
          message: `Query parameter '${key}' is empty and will be ignored`,
          code: "EMPTY_QUERY_PARAM",
          severity: "WARNING" as ValidationSeverity,
          context,
        });
      } else {
        cleanedParams[key] = value;
      }
    });

    return ValidationFactory.success(
      cleanedParams,
      warnings.length > 0 ? warnings : undefined,
      context
    );
  }

  /**
   * Enhances error messages for better user experience.
   *
   * @param field - Field name that failed validation
   * @param originalMessage - Original Zod error message
   * @returns Enhanced error message
   */
  private enhanceErrorMessage(field: string, originalMessage: string): string {
    const fieldFriendlyNames: Record<string, string> = {
      tenantId: "Tenant ID",
      userId: "User ID",
      memberId: "Member ID",
      entityId: "Entity ID",
      createdAt: "Creation Date",
      updatedAt: "Update Date",
      deletedAt: "Deletion Date",
    };

    const friendlyField = fieldFriendlyNames[field] || field;

    // Common error message improvements
    if (originalMessage.includes("Required")) {
      return `${friendlyField} is required`;
    }

    if (originalMessage.includes("UUID")) {
      return `${friendlyField} must be a valid identifier`;
    }

    if (originalMessage.includes("email")) {
      return `${friendlyField} must be a valid email address`;
    }

    if (originalMessage.includes("phone")) {
      return `${friendlyField} must be a valid phone number`;
    }

    if (originalMessage.includes("date")) {
      return `${friendlyField} must be a valid date`;
    }

    return `${friendlyField}: ${originalMessage}`;
  }
}

/**
 * Pre-configured DTO validators for common use cases.
 */
export class CommonDTOValidators {
  /**
   * Tenant creation DTO validator.
   */
  static readonly createTenant = new DTOValidator(
    z.object({
      name: DTOSchemas.tenantName,
      code: z.string().min(3).max(50),
      description: DTOSchemas.description,
      settings: DTOSchemas.jsonString.optional(),
    })
  );

  /**
   * User creation DTO validator.
   */
  static readonly createUser = new DTOValidator(
    z.object({
      email: DTOSchemas.email,
      firstName: DTOSchemas.tenantName,
      lastName: DTOSchemas.tenantName,
      tenantId: DTOSchemas.uuid.optional(),
    })
  );

  /**
   * Entity lookup DTO validator.
   */
  static readonly entityLookup = new DTOValidator(
    z.object({
      id: DTOSchemas.uuid,
      tenantId: DTOSchemas.uuid,
    })
  );

  /**
   * Date range filter DTO validator.
   */
  static readonly dateRangeFilter = new DTOValidator(
    z.object({
      startDate: DTOSchemas.isoDate,
      endDate: DTOSchemas.isoDate,
      tenantId: DTOSchemas.uuid,
    })
  );
}
