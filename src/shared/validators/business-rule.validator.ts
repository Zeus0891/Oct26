/**
 * =====================================================================
 *  ENTERPRISE BUSINESS RULE VALIDATOR — Complex Business Logic
 * =====================================================================
 *  Purpose:
 *   Enforces complex business rules that span multiple entities,
 *   workflows, and require contextual business logic validation.
 *
 *  Features:
 *   - Multi-entity business rule validation
 *   - Approval threshold enforcement
 *   - Hierarchical permission rules
 *   - Conditional validation based on business state
 *   - Integration with BusinessRuleEngine
 *
 *  Usage:
 *   Used for validating complex business scenarios that require
 *   understanding of business context and multi-entity relationships.
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
  isInRange,
  isValidPercentage,
  isValidTaxRate,
  isFutureDate,
  isPastDate,
  isValidDateRange,
} from "./validation.utils";

/**
 * Business rule severity levels.
 */
export type BusinessRuleSeverity = "BLOCKING" | "WARNING" | "RECOMMENDATION";

/**
 * Business rule context interface.
 */
export interface BusinessRuleContext extends ValidationContext {
  /** Business rule type being validated */
  ruleType?: string;
  /** Entity state that triggered validation */
  entityState?: string;
  /** Related entity IDs */
  relatedEntities?: Record<string, string>;
  /** Business context variables */
  businessContext?: Record<string, unknown>;
}

/**
 * Business rule definition interface.
 */
export interface BusinessRule {
  /** Unique rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Rule category */
  category: string;
  /** Rule severity */
  severity: BusinessRuleSeverity;
  /** Rule condition function */
  condition: (data: any, context: BusinessRuleContext) => boolean;
  /** Error message when rule fails */
  message: string;
  /** Rule code for identification */
  code: string;
  /** Whether rule is active */
  isActive: boolean;
}

/**
 * Abstract base class for business rule validators.
 * Provides framework for implementing complex business logic validation.
 *
 * @template T - The data type being validated
 *
 * @example
 * ```typescript
 * class EstimateBusinessRuleValidator extends BusinessRuleValidator<EstimateData> {
 *   schema = z.object({
 *     amount: z.number().positive(),
 *     discountPercentage: z.number().optional(),
 *     // ... other fields
 *   });
 *
 *   protected getBusinessRules(): BusinessRule[] {
 *     return [
 *       {
 *         id: 'discount-limit',
 *         name: 'Discount Limit',
 *         description: 'Discount cannot exceed 20% without approval',
 *         category: 'PRICING',
 *         severity: 'WARNING',
 *         condition: (data) => !data.discountPercentage || data.discountPercentage <= 20,
 *         message: 'Discount exceeds 20% - approval required',
 *         code: 'DISCOUNT_LIMIT_EXCEEDED',
 *         isActive: true
 *       }
 *     ];
 *   }
 * }
 * ```
 */
export abstract class BusinessRuleValidator<T> extends BaseValidator<T> {
  /**
   * Gets the business rules to apply for this validator.
   * Must be implemented by subclasses.
   *
   * @returns Array of business rules
   */
  protected abstract getBusinessRules(): BusinessRule[];

  /**
   * Validates data against business rules.
   *
   * @param data - Data to validate
   * @param context - Business rule context
   * @returns ValidationResult with business rule violations
   */
  validateBusinessRules(
    data: unknown,
    context: BusinessRuleContext
  ): ValidationResult<T> {
    // First perform schema validation
    const schemaResult = this.validate(data, context);
    if (!schemaResult.success) {
      return schemaResult;
    }

    const validatedData = schemaResult.data;
    const rules = this.getBusinessRules();
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // Apply each business rule
    for (const rule of rules) {
      if (!rule.isActive) continue;

      try {
        const ruleContext: BusinessRuleContext = {
          ...context,
          ruleType: rule.category,
        };

        const passed = rule.condition(validatedData, ruleContext);

        if (!passed) {
          const issue: ValidationIssue = {
            field: "business_rule",
            message: rule.message,
            code: rule.code,
            severity: rule.severity === "BLOCKING" ? "ERROR" : "WARNING",
            context: ruleContext,
            meta: {
              ruleId: rule.id,
              ruleName: rule.name,
              ruleCategory: rule.category,
              businessRuleSeverity: rule.severity,
            },
          };

          if (rule.severity === "BLOCKING") {
            errors.push(issue);
          } else {
            warnings.push(issue);
          }
        }
      } catch (error) {
        // Rule evaluation failed
        errors.push({
          field: "business_rule",
          message: `Business rule evaluation failed: ${rule.name}`,
          code: "RULE_EVALUATION_ERROR",
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
   * Validates approval requirements based on thresholds.
   *
   * @param amount - Amount to validate
   * @param thresholds - Approval thresholds
   * @param context - Validation context
   * @returns Validation issues if approval required
   */
  protected validateApprovalThresholds(
    amount: number,
    thresholds: { warning: number; blocking: number },
    context: BusinessRuleContext
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (amount >= thresholds.blocking) {
      issues.push({
        field: "amount",
        message: `Amount ${amount} requires management approval (threshold: ${thresholds.blocking})`,
        code: "APPROVAL_REQUIRED_BLOCKING",
        severity: "ERROR" as ValidationSeverity,
        context,
        meta: {
          amount,
          threshold: thresholds.blocking,
          approvalLevel: "MANAGEMENT",
        },
      });
    } else if (amount >= thresholds.warning) {
      issues.push({
        field: "amount",
        message: `Amount ${amount} requires supervisor approval (threshold: ${thresholds.warning})`,
        code: "APPROVAL_REQUIRED_WARNING",
        severity: "WARNING" as ValidationSeverity,
        context,
        meta: {
          amount,
          threshold: thresholds.warning,
          approvalLevel: "SUPERVISOR",
        },
      });
    }

    return issues;
  }

  /**
   * Validates date-based business rules.
   *
   * @param startDate - Start date
   * @param endDate - End date
   * @param context - Validation context
   * @returns Validation issues for date rules
   */
  protected validateDateBusinessRules(
    startDate: Date,
    endDate: Date,
    context: BusinessRuleContext
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate date range
    if (!isValidDateRange(startDate, endDate)) {
      issues.push({
        field: "dateRange",
        message: "Start date must be before end date",
        code: "INVALID_DATE_RANGE",
        severity: "ERROR" as ValidationSeverity,
        context,
      });
    }

    // Check if dates are in the past
    if (isPastDate(startDate)) {
      issues.push({
        field: "startDate",
        message: "Start date cannot be in the past",
        code: "PAST_START_DATE",
        severity: "WARNING" as ValidationSeverity,
        context,
      });
    }

    // Check for reasonable date ranges (e.g., not more than 5 years)
    const maxDateRange = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years in milliseconds
    if (endDate.getTime() - startDate.getTime() > maxDateRange) {
      issues.push({
        field: "dateRange",
        message: "Date range exceeds maximum allowed period of 5 years",
        code: "EXCESSIVE_DATE_RANGE",
        severity: "WARNING" as ValidationSeverity,
        context,
      });
    }

    return issues;
  }

  /**
   * Validates percentage-based business rules.
   *
   * @param percentage - Percentage value to validate
   * @param fieldName - Field name for error reporting
   * @param limits - Percentage limits
   * @param context - Validation context
   * @returns Validation issues for percentage rules
   */
  protected validatePercentageBusinessRules(
    percentage: number,
    fieldName: string,
    limits: { max: number; warningThreshold?: number },
    context: BusinessRuleContext
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!isValidPercentage(percentage)) {
      issues.push({
        field: fieldName,
        message: `${fieldName} must be between 0 and 100`,
        code: "INVALID_PERCENTAGE",
        severity: "ERROR" as ValidationSeverity,
        context,
      });
      return issues;
    }

    if (percentage > limits.max) {
      issues.push({
        field: fieldName,
        message: `${fieldName} cannot exceed ${limits.max}%`,
        code: "PERCENTAGE_LIMIT_EXCEEDED",
        severity: "ERROR" as ValidationSeverity,
        context,
        meta: {
          value: percentage,
          limit: limits.max,
        },
      });
    } else if (
      limits.warningThreshold &&
      percentage > limits.warningThreshold
    ) {
      issues.push({
        field: fieldName,
        message: `${fieldName} of ${percentage}% is above recommended threshold of ${limits.warningThreshold}%`,
        code: "PERCENTAGE_WARNING_THRESHOLD",
        severity: "WARNING" as ValidationSeverity,
        context,
        meta: {
          value: percentage,
          warningThreshold: limits.warningThreshold,
        },
      });
    }

    return issues;
  }
}

/**
 * Common business rule implementations.
 */

/**
 * Financial transaction business rule validator.
 */
export class FinancialTransactionBusinessRuleValidator extends BusinessRuleValidator<{
  amount: number;
  currency: string;
  type: string;
  taxRate?: number;
  discountPercentage?: number;
}> {
  schema = z.object({
    amount: z.number().positive(),
    currency: z.string().length(3),
    type: z.string().min(1),
    taxRate: z.number().optional(),
    discountPercentage: z.number().optional(),
  });

  protected getBusinessRules(): BusinessRule[] {
    return [
      {
        id: "amount-limit",
        name: "Transaction Amount Limit",
        description: "Large transactions require approval",
        category: "FINANCIAL",
        severity: "WARNING",
        condition: (data) => data.amount < 10000,
        message:
          "Transaction amount exceeds $10,000 - approval may be required",
        code: "LARGE_TRANSACTION_WARNING",
        isActive: true,
      },
      {
        id: "tax-rate-validation",
        name: "Tax Rate Validation",
        description: "Tax rate must be within acceptable range",
        category: "TAX",
        severity: "BLOCKING",
        condition: (data) => !data.taxRate || isValidTaxRate(data.taxRate),
        message: "Tax rate must be between 0% and 100%",
        code: "INVALID_TAX_RATE",
        isActive: true,
      },
      {
        id: "discount-limit",
        name: "Discount Limit",
        description: "Discount cannot exceed 50%",
        category: "PRICING",
        severity: "BLOCKING",
        condition: (data) =>
          !data.discountPercentage || data.discountPercentage <= 50,
        message: "Discount cannot exceed 50%",
        code: "EXCESSIVE_DISCOUNT",
        isActive: true,
      },
    ];
  }

  /**
   * Validates financial transaction with enhanced business rules.
   *
   * @param data - Transaction data
   * @param context - Business rule context
   * @returns ValidationResult with financial business rules applied
   */
  validateTransaction(
    data: unknown,
    context: BusinessRuleContext
  ): ValidationResult<{
    amount: number;
    currency: string;
    type: string;
    taxRate?: number;
    discountPercentage?: number;
  }> {
    const result = this.validateBusinessRules(data, context);

    if (!result.success) {
      return result;
    }

    // Additional financial-specific validations
    const additionalIssues: ValidationIssue[] = [];
    const validatedData = result.data;

    // Check approval thresholds
    const approvalIssues = this.validateApprovalThresholds(
      validatedData.amount,
      { warning: 5000, blocking: 50000 },
      context
    );
    additionalIssues.push(...approvalIssues);

    // Validate discount percentage
    if (validatedData.discountPercentage) {
      const discountIssues = this.validatePercentageBusinessRules(
        validatedData.discountPercentage,
        "discountPercentage",
        { max: 50, warningThreshold: 20 },
        context
      );
      additionalIssues.push(...discountIssues);
    }

    if (additionalIssues.some((issue) => issue.severity === "ERROR")) {
      const errors = additionalIssues.filter(
        (issue) => issue.severity === "ERROR"
      );
      return ValidationFactory.failure(errors, context);
    }

    const warnings = [
      ...(result.warnings || []),
      ...additionalIssues.filter((issue) => issue.severity === "WARNING"),
    ];

    return ValidationFactory.success(
      validatedData,
      warnings.length > 0 ? warnings : undefined,
      context
    );
  }
}

/**
 * Project timeline business rule validator.
 */
export class ProjectTimelineBusinessRuleValidator extends BusinessRuleValidator<{
  startDate: string;
  endDate: string;
  projectType: string;
  estimatedHours?: number;
}> {
  schema = z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    projectType: z.string().min(1),
    estimatedHours: z.number().positive().optional(),
  });

  protected getBusinessRules(): BusinessRule[] {
    return [
      {
        id: "project-duration",
        name: "Project Duration Limit",
        description: "Projects cannot exceed 2 years",
        category: "TIMELINE",
        severity: "WARNING",
        condition: (data) => {
          const start = new Date(data.startDate);
          const end = new Date(data.endDate);
          const twoYears = 2 * 365 * 24 * 60 * 60 * 1000;
          return end.getTime() - start.getTime() <= twoYears;
        },
        message:
          "Project duration exceeds 2 years - consider breaking into phases",
        code: "EXCESSIVE_PROJECT_DURATION",
        isActive: true,
      },
      {
        id: "hours-consistency",
        name: "Hours Consistency",
        description:
          "Estimated hours should be reasonable for project duration",
        category: "ESTIMATION",
        severity: "WARNING",
        condition: (data) => {
          if (!data.estimatedHours) return true;
          const start = new Date(data.startDate);
          const end = new Date(data.endDate);
          const durationDays =
            (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
          const maxHoursPerDay = 8;
          return data.estimatedHours <= durationDays * maxHoursPerDay;
        },
        message:
          "Estimated hours exceed reasonable capacity for project duration",
        code: "EXCESSIVE_HOURS_ESTIMATE",
        isActive: true,
      },
    ];
  }
}
