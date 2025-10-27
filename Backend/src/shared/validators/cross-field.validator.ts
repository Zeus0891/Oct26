/**
 * =====================================================================
 *  ENTERPRISE CROSS-FIELD VALIDATOR — Inter-Field Dependencies
 * =====================================================================
 *  Purpose:
 *   Validates dependencies and relationships between fields within
 *   the same object or entity. Handles conditional validation logic
 *   where one field's validity depends on another field's value.
 *
 *  Features:
 *   - Date range validation (startDate < endDate)
 *   - Conditional field requirements
 *   - Numeric relationship validation
 *   - Complex field interdependencies
 *   - Context-aware validation rules
 *
 *  Usage:
 *   Used for validating complex objects where field relationships
 *   matter more than individual field validation.
 * =====================================================================
 */

import { z, ZodSchema } from "zod";
import { BaseValidator } from "./base.validator";
import {
  ValidationResult,
  ValidationIssue,
  ValidationContext,
  ValidationFactory,
  ValidationSeverity,
} from "./validation.types";
import {
  isValidDateRange,
  isFutureDate,
  isPastDate,
  isInRange,
  isValidPercentage,
} from "./validation.utils";

/**
 * Cross-field validation rule interface.
 */
export interface CrossFieldRule<T> {
  /** Unique rule identifier */
  id: string;
  /** Rule name for documentation */
  name: string;
  /** Fields involved in this rule */
  fields: (keyof T)[];
  /** Validation function */
  validate: (data: T, context?: ValidationContext) => ValidationIssue | null;
  /** Rule severity */
  severity: ValidationSeverity;
  /** Whether rule is active */
  isActive: boolean;
}

/**
 * Abstract base class for cross-field validators.
 * Provides framework for validating field relationships and dependencies.
 *
 * @template T - The data type being validated
 *
 * @example
 * ```typescript
 * class DateRangeValidator extends CrossFieldValidator<{
 *   startDate: Date;
 *   endDate: Date;
 *   isActive: boolean;
 * }> {
 *   schema = z.object({
 *     startDate: z.date(),
 *     endDate: z.date(),
 *     isActive: z.boolean()
 *   });
 *
 *   protected getCrossFieldRules() {
 *     return [
 *       {
 *         id: 'date-range',
 *         name: 'Date Range Validation',
 *         fields: ['startDate', 'endDate'],
 *         validate: (data) => this.validateDateRange(data.startDate, data.endDate),
 *         severity: 'ERROR',
 *         isActive: true
 *       }
 *     ];
 *   }
 * }
 * ```
 */
export abstract class CrossFieldValidator<T> extends BaseValidator<T> {
  /**
   * Gets the cross-field validation rules to apply.
   * Must be implemented by subclasses.
   *
   * @returns Array of cross-field validation rules
   */
  protected abstract getCrossFieldRules(): CrossFieldRule<T>[];

  /**
   * Validates data with cross-field rules.
   *
   * @param data - Data to validate
   * @param context - Validation context
   * @returns ValidationResult with cross-field validation issues
   */
  validateCrossFields(
    data: unknown,
    context?: ValidationContext
  ): ValidationResult<T> {
    // First perform schema validation
    const schemaResult = this.validate(data, context);
    if (!schemaResult.success) {
      return schemaResult;
    }

    const validatedData = schemaResult.data;
    const rules = this.getCrossFieldRules();
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // Apply each cross-field rule
    for (const rule of rules) {
      if (!rule.isActive) continue;

      try {
        const issue = rule.validate(validatedData, context);
        if (issue) {
          if (issue.severity === "ERROR") {
            errors.push(issue);
          } else {
            warnings.push(issue);
          }
        }
      } catch (error) {
        // Rule evaluation failed
        errors.push({
          field: rule.fields.join(", "),
          message: `Cross-field validation failed: ${rule.name}`,
          code: "CROSS_FIELD_VALIDATION_ERROR",
          severity: "ERROR" as ValidationSeverity,
          context,
          meta: {
            ruleId: rule.id,
            error: (error as Error).message,
          },
        });
      }
    }

    if (errors.length > 0) {
      return ValidationFactory.failure(errors, context);
    }

    return ValidationFactory.success(
      validatedData,
      warnings.length > 0 ? warnings : undefined,
      context
    );
  }

  /**
   * Validates date range relationship.
   *
   * @param startDate - Start date
   * @param endDate - End date
   * @param fieldNames - Field names for error reporting
   * @param context - Validation context
   * @returns Validation issue if invalid, null if valid
   */
  protected validateDateRangeRelationship(
    startDate: Date,
    endDate: Date,
    fieldNames: { start: string; end: string } = {
      start: "startDate",
      end: "endDate",
    },
    context?: ValidationContext
  ): ValidationIssue | null {
    if (!isValidDateRange(startDate, endDate)) {
      return {
        field: `${fieldNames.start}, ${fieldNames.end}`,
        message: `${fieldNames.start} must be before ${fieldNames.end}`,
        code: "INVALID_DATE_RANGE",
        severity: "ERROR" as ValidationSeverity,
        context,
        meta: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      };
    }

    return null;
  }

  /**
   * Validates conditional field requirements.
   *
   * @param conditionField - Field that determines requirement
   * @param conditionValue - Value that triggers requirement
   * @param requiredField - Field that becomes required
   * @param requiredValue - Value of the required field
   * @param fieldNames - Field names for error reporting
   * @param context - Validation context
   * @returns Validation issue if invalid, null if valid
   */
  protected validateConditionalRequirement<K extends keyof T>(
    conditionField: K,
    conditionValue: T[K],
    requiredField: K,
    requiredValue: T[K],
    fieldNames: { condition: string; required: string },
    context?: ValidationContext
  ): ValidationIssue | null {
    const shouldBeRequired =
      conditionValue !== undefined && conditionValue !== null;
    const hasRequiredValue =
      requiredValue !== undefined && requiredValue !== null;

    if (shouldBeRequired && !hasRequiredValue) {
      return {
        field: fieldNames.required,
        message: `${fieldNames.required} is required when ${fieldNames.condition} is specified`,
        code: "CONDITIONAL_FIELD_REQUIRED",
        severity: "ERROR" as ValidationSeverity,
        context,
        meta: {
          conditionField: String(conditionField),
          requiredField: String(requiredField),
        },
      };
    }

    return null;
  }

  /**
   * Validates numeric relationship between fields.
   *
   * @param value1 - First numeric value
   * @param value2 - Second numeric value
   * @param relationship - Relationship type
   * @param fieldNames - Field names for error reporting
   * @param context - Validation context
   * @returns Validation issue if invalid, null if valid
   */
  protected validateNumericRelationship(
    value1: number,
    value2: number,
    relationship:
      | "less_than"
      | "less_than_or_equal"
      | "greater_than"
      | "greater_than_or_equal"
      | "equal",
    fieldNames: { first: string; second: string },
    context?: ValidationContext
  ): ValidationIssue | null {
    let isValid = false;
    let expectedRelation = "";

    switch (relationship) {
      case "less_than":
        isValid = value1 < value2;
        expectedRelation = "less than";
        break;
      case "less_than_or_equal":
        isValid = value1 <= value2;
        expectedRelation = "less than or equal to";
        break;
      case "greater_than":
        isValid = value1 > value2;
        expectedRelation = "greater than";
        break;
      case "greater_than_or_equal":
        isValid = value1 >= value2;
        expectedRelation = "greater than or equal to";
        break;
      case "equal":
        isValid = value1 === value2;
        expectedRelation = "equal to";
        break;
    }

    if (!isValid) {
      return {
        field: `${fieldNames.first}, ${fieldNames.second}`,
        message: `${fieldNames.first} must be ${expectedRelation} ${fieldNames.second}`,
        code: "INVALID_NUMERIC_RELATIONSHIP",
        severity: "ERROR" as ValidationSeverity,
        context,
        meta: {
          value1,
          value2,
          relationship,
          expectedRelation,
        },
      };
    }

    return null;
  }

  /**
   * Validates percentage field relationships.
   *
   * @param percentages - Array of percentage values
   * @param fieldNames - Array of field names
   * @param maxTotal - Maximum allowed total (default 100)
   * @param context - Validation context
   * @returns Validation issue if invalid, null if valid
   */
  protected validatePercentageTotal(
    percentages: number[],
    fieldNames: string[],
    maxTotal: number = 100,
    context?: ValidationContext
  ): ValidationIssue | null {
    const total = percentages.reduce((sum, percentage) => sum + percentage, 0);

    if (total > maxTotal) {
      return {
        field: fieldNames.join(", "),
        message: `Total of ${fieldNames.join(
          ", "
        )} cannot exceed ${maxTotal}% (current: ${total}%)`,
        code: "PERCENTAGE_TOTAL_EXCEEDED",
        severity: "ERROR" as ValidationSeverity,
        context,
        meta: {
          total,
          maxTotal,
          percentages,
          fieldNames,
        },
      };
    }

    return null;
  }
}

/**
 * Common cross-field validator implementations.
 */

/**
 * Date range cross-field validator.
 */
export class DateRangeCrossFieldValidator extends CrossFieldValidator<{
  startDate: string;
  endDate: string;
  isActive?: boolean;
}> {
  schema = z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    isActive: z.boolean().optional(),
  });

  protected getCrossFieldRules(): CrossFieldRule<{
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }>[] {
    return [
      {
        id: "date-range-order",
        name: "Date Range Order",
        fields: ["startDate", "endDate"],
        validate: (data, context) => {
          const start = new Date(data.startDate);
          const end = new Date(data.endDate);
          return this.validateDateRangeRelationship(
            start,
            end,
            undefined,
            context
          );
        },
        severity: "ERROR",
        isActive: true,
      },
      {
        id: "future-start-date-warning",
        name: "Future Start Date Warning",
        fields: ["startDate"],
        validate: (data, context) => {
          const start = new Date(data.startDate);
          if (isPastDate(start)) {
            return {
              field: "startDate",
              message: "Start date is in the past",
              code: "PAST_START_DATE_WARNING",
              severity: "WARNING" as ValidationSeverity,
              context,
            };
          }
          return null;
        },
        severity: "WARNING",
        isActive: true,
      },
    ];
  }
}

/**
 * Financial calculation cross-field validator.
 */
export class FinancialCalculationCrossFieldValidator extends CrossFieldValidator<{
  subtotal: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxPercentage?: number;
  taxAmount?: number;
  total: number;
}> {
  schema = z.object({
    subtotal: z.number().positive(),
    discountPercentage: z.number().min(0).max(100).optional(),
    discountAmount: z.number().min(0).optional(),
    taxPercentage: z.number().min(0).max(100).optional(),
    taxAmount: z.number().min(0).optional(),
    total: z.number().positive(),
  });

  protected getCrossFieldRules(): CrossFieldRule<{
    subtotal: number;
    discountPercentage?: number;
    discountAmount?: number;
    taxPercentage?: number;
    taxAmount?: number;
    total: number;
  }>[] {
    return [
      {
        id: "discount-consistency",
        name: "Discount Consistency",
        fields: ["discountPercentage", "discountAmount", "subtotal"],
        validate: (data, context) => {
          if (data.discountPercentage && data.discountAmount) {
            const expectedAmount =
              (data.subtotal * data.discountPercentage) / 100;
            const tolerance = 0.01; // Allow 1 cent tolerance for rounding

            if (Math.abs(data.discountAmount - expectedAmount) > tolerance) {
              return {
                field: "discountAmount, discountPercentage",
                message: `Discount amount (${data.discountAmount}) does not match discount percentage (${data.discountPercentage}%)`,
                code: "DISCOUNT_INCONSISTENCY",
                severity: "ERROR" as ValidationSeverity,
                context,
                meta: {
                  discountAmount: data.discountAmount,
                  discountPercentage: data.discountPercentage,
                  expectedAmount,
                  tolerance,
                },
              };
            }
          }
          return null;
        },
        severity: "ERROR",
        isActive: true,
      },
      {
        id: "tax-consistency",
        name: "Tax Consistency",
        fields: ["taxPercentage", "taxAmount", "subtotal", "discountAmount"],
        validate: (data, context) => {
          if (data.taxPercentage && data.taxAmount) {
            const taxableAmount = data.subtotal - (data.discountAmount || 0);
            const expectedTaxAmount =
              (taxableAmount * data.taxPercentage) / 100;
            const tolerance = 0.01; // Allow 1 cent tolerance for rounding

            if (Math.abs(data.taxAmount - expectedTaxAmount) > tolerance) {
              return {
                field: "taxAmount, taxPercentage",
                message: `Tax amount (${data.taxAmount}) does not match tax percentage (${data.taxPercentage}%)`,
                code: "TAX_INCONSISTENCY",
                severity: "ERROR" as ValidationSeverity,
                context,
                meta: {
                  taxAmount: data.taxAmount,
                  taxPercentage: data.taxPercentage,
                  expectedTaxAmount,
                  taxableAmount,
                  tolerance,
                },
              };
            }
          }
          return null;
        },
        severity: "ERROR",
        isActive: true,
      },
      {
        id: "total-calculation",
        name: "Total Calculation",
        fields: ["subtotal", "discountAmount", "taxAmount", "total"],
        validate: (data, context) => {
          const expectedTotal =
            data.subtotal - (data.discountAmount || 0) + (data.taxAmount || 0);
          const tolerance = 0.01; // Allow 1 cent tolerance for rounding

          if (Math.abs(data.total - expectedTotal) > tolerance) {
            return {
              field: "total",
              message: `Total (${data.total}) does not match calculated value (${expectedTotal})`,
              code: "TOTAL_CALCULATION_ERROR",
              severity: "ERROR" as ValidationSeverity,
              context,
              meta: {
                total: data.total,
                expectedTotal,
                subtotal: data.subtotal,
                discountAmount: data.discountAmount || 0,
                taxAmount: data.taxAmount || 0,
                tolerance,
              },
            };
          }
          return null;
        },
        severity: "ERROR",
        isActive: true,
      },
    ];
  }
}

/**
 * Address validation cross-field validator.
 */
export class AddressCrossFieldValidator extends CrossFieldValidator<{
  country: string;
  state?: string;
  postalCode?: string;
  city: string;
}> {
  schema = z.object({
    country: z.string().length(2), // ISO country code
    state: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().min(1),
  });

  protected getCrossFieldRules(): CrossFieldRule<{
    country: string;
    state?: string;
    postalCode?: string;
    city: string;
  }>[] {
    return [
      {
        id: "us-state-requirement",
        name: "US State Requirement",
        fields: ["country", "state"],
        validate: (data, context) => {
          return this.validateConditionalRequirement(
            "country",
            data.country === "US" ? data.country : undefined,
            "state",
            data.state,
            { condition: "country (US)", required: "state" },
            context
          );
        },
        severity: "ERROR",
        isActive: true,
      },
      {
        id: "postal-code-format",
        name: "Postal Code Format",
        fields: ["country", "postalCode"],
        validate: (data, context) => {
          if (!data.postalCode) return null;

          let isValid = true;
          let expectedFormat = "";

          switch (data.country) {
            case "US":
              isValid = /^\d{5}(-\d{4})?$/.test(data.postalCode);
              expectedFormat = "12345 or 12345-6789";
              break;
            case "CA":
              isValid = /^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(data.postalCode);
              expectedFormat = "A1A 1A1";
              break;
            case "GB":
              isValid = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/.test(
                data.postalCode
              );
              expectedFormat = "SW1A 1AA";
              break;
            default:
              return null; // No validation for other countries
          }

          if (!isValid) {
            return {
              field: "postalCode",
              message: `Invalid postal code format for ${data.country}. Expected: ${expectedFormat}`,
              code: "INVALID_POSTAL_CODE_FORMAT",
              severity: "ERROR" as ValidationSeverity,
              context,
              meta: {
                country: data.country,
                postalCode: data.postalCode,
                expectedFormat,
              },
            };
          }

          return null;
        },
        severity: "ERROR",
        isActive: true,
      },
    ];
  }
}
