/**
 * Validation Utility
 *
 * Provides comprehensive input validation utilities for all feature modules.
 * Integrates with existing validation system and provides type-safe validators.
 *
 * @module ValidationUtils
 * @category Shared Utils - Base
 * @description Input validation and data integrity utilities
 * @version 1.0.0
 */

import { TypeGuards } from "./type-guards.util";
import { StringUtils } from "./string.util";
import {
  VALIDATION_PATTERNS,
  VALIDATION_LIMITS,
  VALIDATION_MESSAGES,
} from "./validation.constants";

/**
 * Validation result object
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Field validation rule
 */
export interface ValidationRule<T = unknown> {
  /** Rule name for identification */
  name: string;
  /** Validation function */
  validator: (value: T) => boolean | string;
  /** Error message when validation fails */
  message?: string;
  /** Whether this rule is required (non-optional fields) */
  required?: boolean;
}

/**
 * Schema for object validation
 */
export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

/**
 * Validation options
 */
export interface ValidationOptions {
  /** Stop at first error */
  stopAtFirstError?: boolean;
  /** Allow undefined values */
  allowUndefined?: boolean;
  /** Allow null values */
  allowNull?: boolean;
  /** Trim string values before validation */
  trimStrings?: boolean;
}

/**
 * Utility class for input validation and data integrity checks.
 * Provides both simple validators and complex schema validation.
 *
 * @example
 * ```typescript
 * import { ValidationUtils } from '@/shared/utils';
 *
 * // Simple validation
 * const emailResult = ValidationUtils.validateEmail("user@domain.com");
 * const passwordResult = ValidationUtils.validatePassword("SecurePass123!");
 *
 * // Schema validation
 * const userSchema = {
 *   email: [ValidationUtils.rules.required(), ValidationUtils.rules.email()],
 *   age: [ValidationUtils.rules.number(), ValidationUtils.rules.min(18)]
 * };
 *
 * const result = ValidationUtils.validateSchema(userData, userSchema);
 * ```
 */
export class ValidationUtils {
  /**
   * Common validation patterns (imported from centralized constants)
   * @deprecated Use VALIDATION_PATTERNS from validation.constants.ts directly
   */
  static readonly PATTERNS = VALIDATION_PATTERNS;

  /**
   * Validates an email address.
   *
   * @param email - Email to validate
   * @param options - Validation options
   * @returns Validation result
   * @complexity O(n) where n is email length
   */
  static validateEmail(
    email: unknown,
    options: ValidationOptions = {}
  ): ValidationResult {
    if (!TypeGuards.isString(email)) {
      return { isValid: false, error: "Email must be a string" };
    }

    const trimmedEmail = options.trimStrings ? email.trim() : email;

    if (trimmedEmail.length === 0) {
      return { isValid: false, error: "Email cannot be empty" };
    }

    if (trimmedEmail.length > 254) {
      return { isValid: false, error: "Email is too long" };
    }

    if (!this.PATTERNS.EMAIL.test(trimmedEmail)) {
      return { isValid: false, error: "Invalid email format" };
    }

    return { isValid: true };
  }

  /**
   * Validates a password with strength requirements.
   *
   * @param password - Password to validate
   * @param options - Validation options
   * @returns Validation result with strength details
   * @complexity O(n) where n is password length
   */
  static validatePassword(
    password: unknown,
    options: ValidationOptions = {}
  ): ValidationResult {
    if (!TypeGuards.isString(password)) {
      return { isValid: false, error: "Password must be a string" };
    }

    const issues: string[] = [];
    const details: Record<string, boolean> = {};

    // Length check
    if (password.length < 8) {
      issues.push("at least 8 characters");
      details.minLength = false;
    } else {
      details.minLength = true;
    }

    // Character type checks
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    details.hasLowercase = hasLower;
    details.hasUppercase = hasUpper;
    details.hasDigit = hasDigit;
    details.hasSpecialChar = hasSpecial;

    if (!hasLower) issues.push("lowercase letter");
    if (!hasUpper) issues.push("uppercase letter");
    if (!hasDigit) issues.push("digit");
    if (!hasSpecial) issues.push("special character (@$!%*?&)");

    // Common patterns to avoid
    const commonPatterns = [
      /(.)\1{2,}/, // Repeated characters
      /123|abc|qwerty/i, // Sequential patterns
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        issues.push("avoid common patterns");
        details.avoidsCommonPatterns = false;
        break;
      }
    }

    if (!details.hasOwnProperty("avoidsCommonPatterns")) {
      details.avoidsCommonPatterns = true;
    }

    const isValid = issues.length === 0;
    const error =
      issues.length > 0
        ? `Password must contain ${issues.join(", ")}`
        : undefined;

    return { isValid, error, details };
  }

  /**
   * Validates a phone number (US format).
   *
   * @param phone - Phone number to validate
   * @param options - Validation options
   * @returns Validation result
   * @complexity O(n) where n is phone length
   */
  static validatePhone(
    phone: unknown,
    options: ValidationOptions = {}
  ): ValidationResult {
    if (!TypeGuards.isString(phone)) {
      return { isValid: false, error: "Phone number must be a string" };
    }

    const trimmedPhone = options.trimStrings ? phone.trim() : phone;

    if (!this.PATTERNS.PHONE_US.test(trimmedPhone)) {
      return {
        isValid: false,
        error: "Invalid phone number format (use US format: +1-XXX-XXX-XXXX)",
      };
    }

    return { isValid: true };
  }

  /**
   * Validates a URL.
   *
   * @param url - URL to validate
   * @param options - Validation options
   * @returns Validation result
   * @complexity O(n) where n is URL length
   */
  static validateUrl(
    url: unknown,
    options: ValidationOptions = {}
  ): ValidationResult {
    if (!TypeGuards.isString(url)) {
      return { isValid: false, error: "URL must be a string" };
    }

    const trimmedUrl = options.trimStrings ? url.trim() : url;

    // Use StringUtils.isUrl for validation
    if (!StringUtils.isUrl(trimmedUrl)) {
      return { isValid: false, error: "Invalid URL format" };
    }

    return { isValid: true };
  }

  /**
   * Validates a UUID.
   *
   * @param uuid - UUID to validate
   * @param options - Validation options
   * @returns Validation result
   * @complexity O(1)
   */
  static validateUuid(
    uuid: unknown,
    options: ValidationOptions = {}
  ): ValidationResult {
    if (!TypeGuards.isString(uuid)) {
      return { isValid: false, error: "UUID must be a string" };
    }

    const trimmedUuid = options.trimStrings ? uuid.trim() : uuid;

    if (!this.PATTERNS.UUID.test(trimmedUuid)) {
      return { isValid: false, error: "Invalid UUID format" };
    }

    return { isValid: true };
  }

  /**
   * Validates a credit card number using Luhn algorithm.
   *
   * @param cardNumber - Credit card number to validate
   * @param options - Validation options
   * @returns Validation result with card type
   * @complexity O(n) where n is card number length
   */
  static validateCreditCard(
    cardNumber: unknown,
    options: ValidationOptions = {}
  ): ValidationResult {
    if (!TypeGuards.isString(cardNumber)) {
      return { isValid: false, error: "Credit card number must be a string" };
    }

    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/[\s-]/g, "");

    if (!/^\d+$/.test(cleaned)) {
      return {
        isValid: false,
        error: "Credit card number must contain only digits",
      };
    }

    // Basic format check
    if (!this.PATTERNS.CREDIT_CARD.test(cleaned)) {
      return { isValid: false, error: "Invalid credit card format" };
    }

    // Luhn algorithm
    let sum = 0;
    let alternate = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = (digit % 10) + 1;
        }
      }

      sum += digit;
      alternate = !alternate;
    }

    const isValid = sum % 10 === 0;
    const cardType = this.detectCardType(cleaned);

    return {
      isValid,
      error: isValid ? undefined : "Invalid credit card number",
      details: { cardType },
    };
  }

  /**
   * Detects credit card type from number.
   */
  private static detectCardType(cardNumber: string): string {
    if (/^4/.test(cardNumber)) return "Visa";
    if (/^5[1-5]/.test(cardNumber)) return "MasterCard";
    if (/^3[47]/.test(cardNumber)) return "American Express";
    if (/^6/.test(cardNumber)) return "Discover";
    return "Unknown";
  }

  /**
   * Validates an IP address (IPv4 or IPv6).
   *
   * @param ip - IP address to validate
   * @param version - IP version (4, 6, or "any")
   * @param options - Validation options
   * @returns Validation result
   * @complexity O(1)
   */
  static validateIp(
    ip: unknown,
    version: 4 | 6 | "any" = "any",
    options: ValidationOptions = {}
  ): ValidationResult {
    if (!TypeGuards.isString(ip)) {
      return { isValid: false, error: "IP address must be a string" };
    }

    const trimmedIp = options.trimStrings ? ip.trim() : ip;

    let isValid = false;
    let detectedVersion: number | undefined;

    if (version === 4 || version === "any") {
      if (this.PATTERNS.IPV4.test(trimmedIp)) {
        isValid = true;
        detectedVersion = 4;
      }
    }

    if (!isValid && (version === 6 || version === "any")) {
      if (this.PATTERNS.IPV6.test(trimmedIp)) {
        isValid = true;
        detectedVersion = 6;
      }
    }

    return {
      isValid,
      error: isValid
        ? undefined
        : `Invalid IPv${version === "any" ? "4/IPv6" : version} address`,
      details: { version: detectedVersion },
    };
  }

  /**
   * Validates a hex color code.
   *
   * @param color - Color code to validate
   * @param options - Validation options
   * @returns Validation result
   * @complexity O(1)
   */
  static validateHexColor(
    color: unknown,
    options: ValidationOptions = {}
  ): ValidationResult {
    if (!TypeGuards.isString(color)) {
      return { isValid: false, error: "Color must be a string" };
    }

    const trimmedColor = options.trimStrings ? color.trim() : color;

    if (!this.PATTERNS.HEX_COLOR.test(trimmedColor)) {
      return {
        isValid: false,
        error: "Invalid hex color format (use #RRGGBB or #RGB)",
      };
    }

    return { isValid: true };
  }

  /**
   * Validates a numeric range.
   *
   * @param value - Value to validate
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns Validation result
   * @complexity O(1)
   */
  static validateRange(
    value: unknown,
    min: number,
    max: number
  ): ValidationResult {
    if (!TypeGuards.isNumber(value)) {
      return { isValid: false, error: "Value must be a number" };
    }

    if (value < min || value > max) {
      return {
        isValid: false,
        error: `Value must be between ${min} and ${max}`,
        details: { min, max, value },
      };
    }

    return { isValid: true };
  }

  /**
   * Validates string length.
   *
   * @param str - String to validate
   * @param minLength - Minimum length
   * @param maxLength - Maximum length
   * @returns Validation result
   * @complexity O(1)
   */
  static validateLength(
    str: unknown,
    minLength = 0,
    maxLength = Infinity
  ): ValidationResult {
    if (!TypeGuards.isString(str)) {
      return { isValid: false, error: "Value must be a string" };
    }

    if (str.length < minLength) {
      return {
        isValid: false,
        error: `String must be at least ${minLength} characters long`,
        details: { minLength, maxLength, actualLength: str.length },
      };
    }

    if (str.length > maxLength) {
      return {
        isValid: false,
        error: `String must be no more than ${maxLength} characters long`,
        details: { minLength, maxLength, actualLength: str.length },
      };
    }

    return { isValid: true };
  }

  /**
   * Pre-built validation rules for common use cases.
   */
  static readonly rules = {
    /**
     * Required field rule
     */
    required: (message = "Field is required"): ValidationRule => ({
      name: "required",
      validator: (value) => {
        if (value === null || value === undefined) return false;
        if (TypeGuards.isString(value)) return value.trim().length > 0;
        if (TypeGuards.isArray(value)) return value.length > 0;
        return true;
      },
      message,
      required: true,
    }),

    /**
     * String type rule
     */
    string: (message = "Must be a string"): ValidationRule<string> => ({
      name: "string",
      validator: (value) => TypeGuards.isString(value),
      message,
    }),

    /**
     * Number type rule
     */
    number: (message = "Must be a number"): ValidationRule<number> => ({
      name: "number",
      validator: (value) => TypeGuards.isNumber(value),
      message,
    }),

    /**
     * Email format rule
     */
    email: (message = "Must be a valid email"): ValidationRule<string> => ({
      name: "email",
      validator: (value) => ValidationUtils.validateEmail(value).isValid,
      message,
    }),

    /**
     * Minimum length rule
     */
    minLength: (length: number, message?: string): ValidationRule<string> => ({
      name: "minLength",
      validator: (value) =>
        TypeGuards.isString(value) && value.length >= length,
      message: message || `Must be at least ${length} characters`,
    }),

    /**
     * Maximum length rule
     */
    maxLength: (length: number, message?: string): ValidationRule<string> => ({
      name: "maxLength",
      validator: (value) =>
        TypeGuards.isString(value) && value.length <= length,
      message: message || `Must be no more than ${length} characters`,
    }),

    /**
     * Minimum value rule
     */
    min: (minValue: number, message?: string): ValidationRule<number> => ({
      name: "min",
      validator: (value) => TypeGuards.isNumber(value) && value >= minValue,
      message: message || `Must be at least ${minValue}`,
    }),

    /**
     * Maximum value rule
     */
    max: (maxValue: number, message?: string): ValidationRule<number> => ({
      name: "max",
      validator: (value) => TypeGuards.isNumber(value) && value <= maxValue,
      message: message || `Must be no more than ${maxValue}`,
    }),

    /**
     * Pattern matching rule
     */
    pattern: (
      regex: RegExp,
      message = "Invalid format"
    ): ValidationRule<string> => ({
      name: "pattern",
      validator: (value) => TypeGuards.isString(value) && regex.test(value),
      message,
    }),

    /**
     * Custom validation rule
     */
    custom: <T>(
      validator: (value: T) => boolean | string,
      message = "Validation failed"
    ): ValidationRule<T> => ({
      name: "custom",
      validator,
      message,
    }),
  };

  /**
   * Validates an object against a schema.
   *
   * @param data - Object to validate
   * @param schema - Validation schema
   * @param options - Validation options
   * @returns Validation result with field-specific errors
   * @complexity O(n * m) where n is number of fields and m is average rules per field
   */
  static validateSchema<T extends Record<string, unknown>>(
    data: T,
    schema: ValidationSchema<T>,
    options: ValidationOptions = {}
  ): ValidationResult {
    if (!TypeGuards.isObject(data)) {
      return { isValid: false, error: "Data must be an object" };
    }

    const { stopAtFirstError = false, trimStrings = false } = options;
    const errors: Record<string, string> = {};
    let processedData = data;

    // Trim strings if requested
    if (trimStrings) {
      processedData = { ...data };
      for (const [key, value] of Object.entries(processedData)) {
        if (TypeGuards.isString(value)) {
          processedData[key as keyof T] = value.trim() as T[keyof T];
        }
      }
    }

    // Validate each field
    for (const [field, rules] of Object.entries(schema) as [
      keyof T,
      ValidationRule[],
    ][]) {
      if (!rules || rules.length === 0) continue;

      const value = processedData[field];

      for (const rule of rules) {
        const result = rule.validator(value);

        if (result === false || TypeGuards.isString(result)) {
          const errorMessage = TypeGuards.isString(result)
            ? result
            : rule.message || "Validation failed";
          errors[String(field)] = errorMessage;

          if (stopAtFirstError) {
            return {
              isValid: false,
              error: `${String(field)}: ${errorMessage}`,
              details: { fieldErrors: errors },
            };
          }
          break; // Move to next field
        }
      }
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      isValid,
      error: isValid ? undefined : "Validation failed",
      details: isValid ? undefined : { fieldErrors: errors },
    };
  }

  /**
   * Creates a validation function for a specific schema.
   *
   * @param schema - Validation schema
   * @param options - Default validation options
   * @returns Validation function
   * @complexity O(1) creation, O(n * m) per validation
   */
  static createValidator<T extends Record<string, unknown>>(
    schema: ValidationSchema<T>,
    options: ValidationOptions = {}
  ) {
    return (data: T): ValidationResult => {
      return this.validateSchema(data, schema, options);
    };
  }

  /**
   * Sanitizes and validates input data.
   *
   * @param data - Raw input data
   * @param schema - Validation schema
   * @param options - Validation options
   * @returns Sanitized and validated data or null if invalid
   * @complexity O(n * m) where n is number of fields and m is average rules per field
   */
  static sanitizeAndValidate<T extends Record<string, unknown>>(
    data: unknown,
    schema: ValidationSchema<T>,
    options: ValidationOptions = {}
  ): { data: T | null; result: ValidationResult } {
    if (!TypeGuards.isObject(data)) {
      return {
        data: null,
        result: { isValid: false, error: "Input must be an object" },
      };
    }

    const result = this.validateSchema(data as T, schema, {
      ...options,
      trimStrings: true,
    });

    return {
      data: result.isValid ? (data as T) : null,
      result,
    };
  }
}
