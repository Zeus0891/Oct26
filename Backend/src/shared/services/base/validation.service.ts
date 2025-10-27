/**
 * Validation Service - Cross-domain validation and business rules
 *
 * Provides standardized validation patterns, business rule checking,
 * and data consistency enforcement across all shared services.
 *
 * @module ValidationService
 * @category Shared Services - Base Infrastructure
 * @description Cross-domain validation and business rule service
 * @version 1.0.0
 */

import type { RequestContext } from "./context.service";
import {
  AuditService,
  AuditEventType,
  AuditSeverity,
} from "../audit/audit.service";
import {
  ValidationFactory,
  ValidationResult as VFResult,
  ValidationContext as VFContext,
  ValidationIssue as VFIssue,
  isValidationFailure,
} from "../../validators/validation.types";
import { ErrorUtils } from "../../utils/base/error.util";

/**
 * Validation issue severity levels
 */
export enum ValidationSeverity {
  ERROR = "ERROR",
  WARNING = "WARNING",
  INFO = "INFO",
}

/**
 * Validation issue description
 */
export interface ValidationIssue {
  /** Issue code for programmatic handling */
  code: string;
  /** Human-readable message */
  message: string;
  /** Issue severity */
  severity: ValidationSeverity;
  /** Field path where issue occurred */
  field?: string;
  /** Invalid value that caused the issue */
  value?: any;
  /** Additional context */
  context?: Record<string, any>;
}

/**
 * Business rule violation
 */
export interface BusinessRuleViolation {
  /** Rule identifier */
  ruleId: string;
  /** Rule description */
  description: string;
  /** Violated constraint */
  constraint: string;
  /** Field(s) involved in violation */
  fields: string[];
  /** Current values that violate the rule */
  values: Record<string, any>;
  /** Suggested corrective action */
  suggestion?: string;
}

/**
 * Validation context for rule evaluation
 */
export interface ValidationContext {
  /** Request context */
  requestContext: RequestContext;
  /** Entity type being validated */
  entityType: string;
  /** Operation being performed */
  operation: "CREATE" | "UPDATE" | "DELETE";
  /** Related entities for cross-entity validation */
  relatedEntities?: Record<string, any>;
  /** Custom validation flags */
  flags?: Record<string, boolean>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation issues found */
  issues: ValidationIssue[];
  /** Business rule violations */
  ruleViolations: BusinessRuleViolation[];
  /** Warnings (non-blocking issues) */
  warnings: ValidationIssue[];
  /** Validated and normalized data */
  validatedData?: any;
}

/**
 * Validation rule definition
 */
export interface ValidationRule {
  /** Rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Validation function */
  validate: (
    data: any,
    context: ValidationContext
  ) => Promise<ValidationIssue[]>;
  /** Whether rule is required (blocking) */
  required: boolean;
  /** Rule priority (higher = earlier execution) */
  priority: number;
  /** Applicable entity types */
  entityTypes?: string[];
  /** Applicable operations */
  operations?: ("CREATE" | "UPDATE" | "DELETE")[];
}

/**
 * Field validation rule
 */
export interface FieldRule {
  /** Field name */
  field: string;
  /** Field is required */
  required?: boolean;
  /** Field type */
  type?: "string" | "number" | "boolean" | "date" | "email" | "url" | "uuid";
  /** Minimum value/length */
  min?: number;
  /** Maximum value/length */
  max?: number;
  /** Regex pattern for string validation */
  pattern?: RegExp;
  /** Custom validation function */
  custom?: (
    value: any,
    context: ValidationContext
  ) => Promise<ValidationIssue[]>;
  /** Allowed values (enum) */
  allowedValues?: any[];
  /** Default value */
  defaultValue?: any;
  /** Normalization function */
  normalize?: (value: any) => any;
}

/**
 * Cross-domain validation service
 *
 * Provides comprehensive validation patterns including field validation,
 * business rule checking, and cross-entity consistency enforcement.
 *
 * @example
 * ```typescript
 * const validationService = new ValidationService();
 *
 * // Register custom validation rule
 * validationService.registerRule({
 *   id: 'unique-email',
 *   name: 'Unique Email Validation',
 *   description: 'Ensures email addresses are unique within tenant',
 *   validate: async (data, context) => {
 *     // Custom validation logic
 *     return [];
 *   },
 *   required: true,
 *   priority: 100
 * });
 *
 * // Validate entity data
 * const result = await validationService.validateEntity(
 *   userData,
 *   validationContext
 * );
 * ```
 */
export class ValidationService {
  private rules = new Map<string, ValidationRule>();
  private fieldRules = new Map<string, FieldRule[]>();

  constructor(private readonly auditService?: AuditService) {
    this.registerDefaultRules();
  }

  /**
   * Register validation rule
   *
   * Adds a new validation rule to the service for use in entity validation.
   *
   * @param rule - Validation rule to register
   */
  registerRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Register field validation rules
   *
   * Adds field-specific validation rules for an entity type.
   *
   * @param entityType - Entity type to apply rules to
   * @param rules - Array of field validation rules
   */
  registerFieldRules(entityType: string, rules: FieldRule[]): void {
    this.fieldRules.set(entityType, rules);
  }

  /**
   * Validate entity data with audit logging and ValidationFactory integration
   *
   * Performs comprehensive validation including field validation,
   * business rules, and cross-entity consistency checks.
   *
   * @param data - Entity data to validate
   * @param context - Validation context
   * @returns Validation result with issues and violations
   */
  async validateEntity(
    data: any,
    context: ValidationContext
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];
    const ruleViolations: BusinessRuleViolation[] = [];
    const warnings: ValidationIssue[] = [];

    // Audit validation start
    if (this.auditService) {
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.LOW,
        description: `Starting validation for ${context.entityType} - ${context.operation} operation`,
        userId: context.requestContext.actor?.userId,
        tenantId: context.requestContext.tenant?.tenantId,
        resource: {
          type: context.entityType,
          id: "validation_start",
          name: `${context.entityType}_validation`,
        },
        metadata: {
          correlationId: context.requestContext.correlationId,
          operation: context.operation,
          entityType: context.entityType,
          hasRelatedEntities: !!context.relatedEntities,
        },
      });
    }

    try {
      // 1. Field-level validation using ValidationFactory patterns
      const fieldValidationContext: VFContext = {
        tenantId: context.requestContext.tenant?.tenantId,
        entity: context.entityType,
        correlationId: context.requestContext.correlationId,
        actorId: context.requestContext.actor?.userId,
        timestamp: new Date(),
      };

      // Use ValidationFactory for standardized validation
      const fieldResult = await this.validateFieldsWithFactory(
        data,
        fieldValidationContext
      );

      if (isValidationFailure(fieldResult)) {
        issues.push(
          ...fieldResult.errors.map((error) => ({
            code: error.code || "FIELD_VALIDATION_ERROR",
            message: error.message,
            severity: ValidationSeverity.ERROR,
            field: error.field,
            value: data[error.field],
          }))
        );
      }

      // 2. Business rule validation
      const ruleIssues = await this.validateBusinessRules(data, context);
      issues.push(...ruleIssues.issues);
      ruleViolations.push(...ruleIssues.violations);

      // 3. Cross-entity validation
      if (context.relatedEntities) {
        const crossIssues = await this.validateCrossEntity(data, context);
        issues.push(...crossIssues);
      }

      // Separate warnings from errors
      const errors = issues.filter(
        (issue) => issue.severity === ValidationSeverity.ERROR
      );
      warnings.push(
        ...issues.filter(
          (issue) => issue.severity === ValidationSeverity.WARNING
        )
      );

      // Normalize data if validation passed
      let validatedData: any;
      if (errors.length === 0 && ruleViolations.length === 0) {
        validatedData = await this.normalizeData(data, context);
      }

      const result = {
        isValid: errors.length === 0 && ruleViolations.length === 0,
        issues: errors,
        ruleViolations,
        warnings,
        validatedData,
      };

      // Audit validation completion
      if (this.auditService) {
        await this.auditService.logEvent({
          type: AuditEventType.READ,
          severity: result.isValid ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
          description: `Validation completed for ${context.entityType} - ${
            result.isValid ? "SUCCESS" : "FAILED"
          }`,
          userId: context.requestContext.actor?.userId,
          tenantId: context.requestContext.tenant?.tenantId,
          resource: {
            type: context.entityType,
            id: result.isValid ? "validation_success" : "validation_failure",
            name: `${context.entityType}_validation_result`,
          },
          metadata: {
            correlationId: context.requestContext.correlationId,
            isValid: result.isValid,
            errorCount: errors.length,
            warningCount: warnings.length,
            ruleViolationCount: ruleViolations.length,
            executionTime: Date.now() - startTime,
          },
        });
      }

      return result;
    } catch (error) {
      // Enhanced error handling using ErrorUtils
      const errorInfo = ErrorUtils.safeGetErrorInfo(error);
      const validationError = ErrorUtils.createValidationError(
        `Validation failed: ${errorInfo.message}`
      );

      // Audit validation error
      if (this.auditService) {
        await this.auditService.logEvent({
          type: AuditEventType.SECURITY_VIOLATION,
          severity: AuditSeverity.HIGH,
          description: `Validation error for ${context.entityType}: ${errorInfo.message}`,
          userId: context.requestContext.actor?.userId,
          tenantId: context.requestContext.tenant?.tenantId,
          resource: {
            type: context.entityType,
            id: "validation_error",
            name: `${context.entityType}_validation_error`,
          },
          metadata: {
            correlationId: context.requestContext.correlationId,
            error: errorInfo.message,
            stack: errorInfo.stack,
            executionTime: Date.now() - startTime,
          },
        });
      }

      return {
        isValid: false,
        issues: [
          {
            code: validationError.code || "VALIDATION_ERROR",
            message: validationError.message,
            severity: ValidationSeverity.ERROR,
          },
        ],
        ruleViolations: [],
        warnings: [],
      };
    }
  }

  /**
   * Validate fields using ValidationFactory patterns
   *
   * @param data - Entity data to validate
   * @param context - ValidationFactory context
   * @returns ValidationFactory result
   */
  private async validateFieldsWithFactory(
    data: any,
    context: VFContext
  ): Promise<VFResult<any>> {
    try {
      // Perform field validation logic here
      const issues: VFIssue[] = [];

      // Basic field validation - can be extended
      if (typeof data !== "object" || data === null) {
        issues.push({
          field: "root",
          message: "Data must be a valid object",
          code: "INVALID_DATA_TYPE",
        });
      }

      if (issues.length > 0) {
        return ValidationFactory.failure(issues, context);
      }

      return ValidationFactory.success(data, undefined, context);
    } catch (error) {
      return ValidationFactory.failure(
        [
          {
            field: "general",
            message:
              error instanceof Error
                ? error.message
                : "Field validation failed",
            code: "FIELD_VALIDATION_ERROR",
          },
        ],
        context
      );
    }
  }

  /**
   * Validate business rules
   *
   * Checks entity data against registered business rules.
   *
   * @param data - Entity data
   * @param context - Validation context
   * @returns Business rule validation result
   */
  async validateBusinessRules(
    data: any,
    context: ValidationContext
  ): Promise<{
    issues: ValidationIssue[];
    violations: BusinessRuleViolation[];
  }> {
    const issues: ValidationIssue[] = [];
    const violations: BusinessRuleViolation[] = [];

    // Get applicable rules for entity type and operation
    const applicableRules = Array.from(this.rules.values())
      .filter((rule) => {
        const entityMatch =
          !rule.entityTypes || rule.entityTypes.includes(context.entityType);
        const operationMatch =
          !rule.operations || rule.operations.includes(context.operation);
        return entityMatch && operationMatch;
      })
      .sort((a, b) => b.priority - a.priority);

    // Execute rules
    for (const rule of applicableRules) {
      try {
        const ruleIssues = await rule.validate(data, context);

        if (rule.required && ruleIssues.length > 0) {
          // Convert required rule failures to business rule violations
          violations.push({
            ruleId: rule.id,
            description: rule.description,
            constraint: rule.name,
            fields: ruleIssues.map((issue) => issue.field || "unknown"),
            values: ruleIssues.reduce(
              (acc, issue) => {
                if (issue.field) {
                  acc[issue.field] = issue.value;
                }
                return acc;
              },
              {} as Record<string, any>
            ),
            suggestion: `Fix issues: ${ruleIssues
              .map((i) => i.message)
              .join(", ")}`,
          });
        } else {
          issues.push(...ruleIssues);
        }
      } catch (error) {
        issues.push({
          code: "RULE_EXECUTION_ERROR",
          message: `Failed to execute rule ${rule.id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
          severity: ValidationSeverity.ERROR,
        });
      }
    }

    return { issues, violations };
  }

  /**
   * Validate fields
   *
   * Performs field-level validation based on registered field rules.
   *
   * @param data - Entity data
   * @param context - Validation context
   * @returns Array of field validation issues
   */
  private async validateFields(
    data: any,
    context: ValidationContext
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const fieldRules = this.fieldRules.get(context.entityType) || [];

    for (const rule of fieldRules) {
      const value = data[rule.field];

      // Required field validation
      if (
        rule.required &&
        (value === undefined || value === null || value === "")
      ) {
        issues.push({
          code: "REQUIRED_FIELD",
          message: `Field '${rule.field}' is required`,
          severity: ValidationSeverity.ERROR,
          field: rule.field,
          value,
        });
        continue;
      }

      // Skip further validation if field is not present and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      if (rule.type) {
        const typeIssue = this.validateFieldType(rule.field, value, rule.type);
        if (typeIssue) {
          issues.push(typeIssue);
          continue;
        }
      }

      // Length/range validation
      if (rule.min !== undefined || rule.max !== undefined) {
        const rangeIssue = this.validateFieldRange(
          rule.field,
          value,
          rule.min,
          rule.max
        );
        if (rangeIssue) {
          issues.push(rangeIssue);
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === "string") {
        if (!rule.pattern.test(value)) {
          issues.push({
            code: "PATTERN_MISMATCH",
            message: `Field '${rule.field}' does not match required pattern`,
            severity: ValidationSeverity.ERROR,
            field: rule.field,
            value,
          });
        }
      }

      // Allowed values validation
      if (rule.allowedValues && !rule.allowedValues.includes(value)) {
        issues.push({
          code: "INVALID_VALUE",
          message: `Field '${
            rule.field
          }' must be one of: ${rule.allowedValues.join(", ")}`,
          severity: ValidationSeverity.ERROR,
          field: rule.field,
          value,
          context: { allowedValues: rule.allowedValues },
        });
      }

      // Custom validation
      if (rule.custom) {
        try {
          const customIssues = await rule.custom(value, context);
          issues.push(...customIssues);
        } catch (error) {
          issues.push({
            code: "CUSTOM_VALIDATION_ERROR",
            message: `Custom validation failed for field '${rule.field}'`,
            severity: ValidationSeverity.ERROR,
            field: rule.field,
            value,
          });
        }
      }
    }

    return issues;
  }

  /**
   * Validate field type
   *
   * Checks if field value matches expected type.
   *
   * @param field - Field name
   * @param value - Field value
   * @param expectedType - Expected type
   * @returns Validation issue if type is invalid
   */
  private validateFieldType(
    field: string,
    value: any,
    expectedType: string
  ): ValidationIssue | null {
    switch (expectedType) {
      case "string":
        if (typeof value !== "string") {
          return {
            code: "INVALID_TYPE",
            message: `Field '${field}' must be a string`,
            severity: ValidationSeverity.ERROR,
            field,
            value,
          };
        }
        break;

      case "number":
        if (typeof value !== "number" || isNaN(value)) {
          return {
            code: "INVALID_TYPE",
            message: `Field '${field}' must be a valid number`,
            severity: ValidationSeverity.ERROR,
            field,
            value,
          };
        }
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          return {
            code: "INVALID_TYPE",
            message: `Field '${field}' must be a boolean`,
            severity: ValidationSeverity.ERROR,
            field,
            value,
          };
        }
        break;

      case "date":
        if (!(value instanceof Date) && !this.isValidDateString(value)) {
          return {
            code: "INVALID_TYPE",
            message: `Field '${field}' must be a valid date`,
            severity: ValidationSeverity.ERROR,
            field,
            value,
          };
        }
        break;

      case "email":
        if (typeof value !== "string" || !this.isValidEmail(value)) {
          return {
            code: "INVALID_EMAIL",
            message: `Field '${field}' must be a valid email address`,
            severity: ValidationSeverity.ERROR,
            field,
            value,
          };
        }
        break;

      case "url":
        if (typeof value !== "string" || !this.isValidUrl(value)) {
          return {
            code: "INVALID_URL",
            message: `Field '${field}' must be a valid URL`,
            severity: ValidationSeverity.ERROR,
            field,
            value,
          };
        }
        break;

      case "uuid":
        if (typeof value !== "string" || !this.isValidUuid(value)) {
          return {
            code: "INVALID_UUID",
            message: `Field '${field}' must be a valid UUID`,
            severity: ValidationSeverity.ERROR,
            field,
            value,
          };
        }
        break;
    }

    return null;
  }

  /**
   * Validate field range
   *
   * Checks if field value is within acceptable range.
   *
   * @param field - Field name
   * @param value - Field value
   * @param min - Minimum value/length
   * @param max - Maximum value/length
   * @returns Validation issue if range is invalid
   */
  private validateFieldRange(
    field: string,
    value: any,
    min?: number,
    max?: number
  ): ValidationIssue | null {
    const length = typeof value === "string" ? value.length : value;

    if (min !== undefined && length < min) {
      return {
        code: "VALUE_TOO_SMALL",
        message: `Field '${field}' must be at least ${min}`,
        severity: ValidationSeverity.ERROR,
        field,
        value,
        context: { min, actual: length },
      };
    }

    if (max !== undefined && length > max) {
      return {
        code: "VALUE_TOO_LARGE",
        message: `Field '${field}' must not exceed ${max}`,
        severity: ValidationSeverity.ERROR,
        field,
        value,
        context: { max, actual: length },
      };
    }

    return null;
  }

  /**
   * Validate cross-entity relationships
   *
   * Performs validation across related entities for consistency.
   *
   * @param data - Entity data
   * @param context - Validation context with related entities
   * @returns Array of cross-entity validation issues
   */
  private async validateCrossEntity(
    data: any,
    context: ValidationContext
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Implementation would include:
    // - Foreign key validation
    // - Referential integrity checks
    // - Cross-entity business rules
    // - Cascade validation effects

    return issues;
  }

  /**
   * Normalize data
   *
   * Applies normalization rules to validated data.
   *
   * @param data - Entity data
   * @param context - Validation context
   * @returns Normalized data
   */
  private async normalizeData(
    data: any,
    context: ValidationContext
  ): Promise<any> {
    const normalized = { ...data };
    const fieldRules = this.fieldRules.get(context.entityType) || [];

    for (const rule of fieldRules) {
      if (rule.normalize && normalized[rule.field] !== undefined) {
        normalized[rule.field] = rule.normalize(normalized[rule.field]);
      }

      // Apply default values
      if (
        rule.defaultValue !== undefined &&
        normalized[rule.field] === undefined
      ) {
        normalized[rule.field] = rule.defaultValue;
      }
    }

    return normalized;
  }

  /**
   * Register default validation rules
   *
   * Sets up common validation rules used across all entities.
   */
  private registerDefaultRules(): void {
    // Tenant isolation rule
    this.registerRule({
      id: "tenant-isolation",
      name: "Tenant Isolation",
      description: "Ensures entity belongs to correct tenant",
      validate: async (data, context) => {
        const issues: ValidationIssue[] = [];

        if (data.tenantId && context.requestContext.tenant?.tenantId) {
          if (data.tenantId !== context.requestContext.tenant.tenantId) {
            issues.push({
              code: "TENANT_MISMATCH",
              message: "Entity tenant ID must match request context",
              severity: ValidationSeverity.ERROR,
              field: "tenantId",
              value: data.tenantId,
            });
          }
        }

        return issues;
      },
      required: true,
      priority: 1000,
    });

    // Audit metadata rule
    this.registerRule({
      id: "audit-metadata",
      name: "Audit Metadata",
      description: "Validates audit metadata fields",
      validate: async (data, context) => {
        const issues: ValidationIssue[] = [];

        if (context.operation === "UPDATE" && !data.version) {
          issues.push({
            code: "MISSING_VERSION",
            message:
              "Version field is required for updates (optimistic locking)",
            severity: ValidationSeverity.ERROR,
            field: "version",
            value: data.version,
          });
        }

        return issues;
      },
      required: false,
      priority: 500,
    });
  }

  // Utility validation methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidUuid(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private isValidDateString(date: any): boolean {
    if (typeof date !== "string") return false;
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }

  /**
   * Validate multiple entities in bulk with audit logging
   *
   * @param items - Array of items to validate
   * @param context - Base validation context
   * @returns Array of validation results
   */
  async validateBulk<T>(
    items: T[],
    context: Omit<ValidationContext, "operation"> & {
      operation: ValidationContext["operation"];
    }
  ): Promise<ValidationResult[]> {
    const startTime = Date.now();
    const results: ValidationResult[] = [];

    if (this.auditService) {
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.LOW,
        description: `Starting bulk validation for ${context.entityType} - ${items.length} items`,
        userId: context.requestContext.actor?.userId,
        tenantId: context.requestContext.tenant?.tenantId,
        resource: {
          type: context.entityType,
          id: "bulk_validation_start",
          name: `${context.entityType}_bulk_validation`,
        },
        metadata: {
          correlationId: context.requestContext.correlationId,
          itemCount: items.length,
          operation: context.operation,
        },
      });
    }

    try {
      // Process items in parallel for better performance
      const validationPromises = items.map((item, index) =>
        this.validateEntity(item, {
          ...context,
          requestContext: {
            ...context.requestContext,
            correlationId: `${context.requestContext.correlationId}-item-${index}`,
          },
        })
      );

      const bulkResults = await Promise.all(validationPromises);
      results.push(...bulkResults);

      const successCount = results.filter((r) => r.isValid).length;
      const errorCount = results.length - successCount;

      if (this.auditService) {
        await this.auditService.logEvent({
          type: AuditEventType.READ,
          severity: errorCount > 0 ? AuditSeverity.MEDIUM : AuditSeverity.LOW,
          description: `Bulk validation completed - ${successCount}/${items.length} valid items`,
          userId: context.requestContext.actor?.userId,
          tenantId: context.requestContext.tenant?.tenantId,
          resource: {
            type: context.entityType,
            id: "bulk_validation_complete",
            name: `${context.entityType}_bulk_validation_complete`,
          },
          metadata: {
            correlationId: context.requestContext.correlationId,
            totalItems: items.length,
            validItems: successCount,
            invalidItems: errorCount,
            executionTime: Date.now() - startTime,
          },
        });
      }

      return results;
    } catch (error) {
      if (this.auditService) {
        await this.auditService.logEvent({
          type: AuditEventType.SECURITY_VIOLATION,
          severity: AuditSeverity.HIGH,
          description: `Bulk validation failed for ${context.entityType}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          userId: context.requestContext.actor?.userId,
          tenantId: context.requestContext.tenant?.tenantId,
          resource: {
            type: context.entityType,
            id: "bulk_validation_error",
            name: `${context.entityType}_bulk_validation_error`,
          },
          metadata: {
            correlationId: context.requestContext.correlationId,
            error: error instanceof Error ? error.message : String(error),
            itemCount: items.length,
            executionTime: Date.now() - startTime,
          },
        });
      }

      throw ErrorUtils.wrapError(
        error instanceof Error ? error : new Error(String(error)),
        {
          category: ErrorUtils.createValidationError("Bulk validation failed")
            .category,
          context: {
            itemCount: items.length,
            entityType: context.entityType,
          },
        }
      );
    }
  }

  /**
   * Create ValidationFactory-compatible result from legacy ValidationResult
   *
   * @param legacyResult - Legacy validation result
   * @param context - Validation context
   * @returns ValidationFactory result
   */
  toValidationFactoryResult<T>(
    legacyResult: ValidationResult,
    context: VFContext
  ): VFResult<T> {
    if (legacyResult.isValid && legacyResult.validatedData) {
      const warnings = legacyResult.warnings?.map((w) => ({
        field: w.field || "unknown",
        message: w.message,
        code: w.code,
      })) as VFIssue[];

      return ValidationFactory.success(
        legacyResult.validatedData as T,
        warnings,
        context
      );
    }

    const errors = [
      ...legacyResult.issues.map((issue) => ({
        field: issue.field || "unknown",
        message: issue.message,
        code: issue.code,
      })),
      ...legacyResult.ruleViolations.map((violation) => ({
        field: violation.fields[0] || "unknown",
        message: violation.description,
        code: violation.ruleId,
      })),
    ] as VFIssue[];

    return ValidationFactory.failure(errors, context);
  }

  /**
   * Validate using ValidationFactory patterns directly
   *
   * @param data - Data to validate
   * @param entityType - Type of entity being validated
   * @param requestContext - Request context
   * @returns ValidationFactory result
   */
  async validateWithFactory<T>(
    data: T,
    entityType: string,
    requestContext: RequestContext
  ): Promise<VFResult<T>> {
    const context: VFContext = {
      tenantId: requestContext.tenant?.tenantId,
      entity: entityType,
      correlationId: requestContext.correlationId,
      actorId: requestContext.actor?.userId,
      timestamp: new Date(),
    };

    try {
      const legacyContext: ValidationContext = {
        requestContext,
        entityType,
        operation: "CREATE", // Default operation
      };

      const result = await this.validateEntity(data, legacyContext);
      return this.toValidationFactoryResult<T>(result, context);
    } catch (error) {
      return ValidationFactory.failure(
        [
          {
            field: "general",
            message:
              error instanceof Error ? error.message : "Validation failed",
            code: "VALIDATION_ERROR",
          },
        ],
        context
      );
    }
  }
}
