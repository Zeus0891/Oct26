/**
 * =====================================================================
 *  ENTERPRISE VALIDATION UTILITIES — Shared Helper Functions
 * =====================================================================
 *  Purpose:
 *   Provides reusable field-level validation helpers used across all
 *   validators in the enterprise system.
 *
 *  Design Principles:
 *   - Pure functions with no side effects
 *   - Framework-agnostic validation logic
 *   - Consistent error messaging
 *   - Type-safe implementations
 * =====================================================================
 */

/**
 * Validates if a string is a valid UUID (v4 format).
 *
 * @param value - String to validate
 * @returns True if valid UUID, false otherwise
 */
export function isUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validates if a string is a valid email address.
 *
 * @param value - String to validate
 * @returns True if valid email, false otherwise
 */
export function isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Validates if a string meets password strength requirements.
 *
 * @param password - Password to validate
 * @returns Object with validation result and specific issues
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (password.length < 8) {
    issues.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    issues.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    issues.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    issues.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    issues.push("Password must contain at least one special character");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Validates if a date string is in valid ISO format.
 *
 * @param value - Date string to validate
 * @returns True if valid ISO date, false otherwise
 */
export function isValidDate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.toISOString() === value;
}

/**
 * Validates if a phone number is in valid format.
 * Supports various international formats.
 *
 * @param value - Phone number to validate
 * @returns True if valid phone number, false otherwise
 */
export function isValidPhoneNumber(value: string): boolean {
  // Basic international phone number validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const cleanValue = value.replace(/[\s\-\(\)]/g, "");
  return phoneRegex.test(cleanValue);
}

/**
 * Validates if a string contains only alphanumeric characters and allowed special characters.
 *
 * @param value - String to validate
 * @param allowedSpecialChars - Array of allowed special characters
 * @returns True if valid, false otherwise
 */
export function isAlphanumericWithSpecial(
  value: string,
  allowedSpecialChars: string[] = []
): boolean {
  const specialCharsPattern =
    allowedSpecialChars.length > 0
      ? allowedSpecialChars.map((char) => `\\${char}`).join("")
      : "";
  const pattern = new RegExp(`^[a-zA-Z0-9${specialCharsPattern}]+$`);
  return pattern.test(value);
}

/**
 * Validates if a numeric value is within specified range.
 *
 * @param value - Number to validate
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @returns True if within range, false otherwise
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validates if a string length is within specified bounds.
 *
 * @param value - String to validate
 * @param minLength - Minimum allowed length
 * @param maxLength - Maximum allowed length
 * @returns True if within bounds, false otherwise
 */
export function isValidLength(
  value: string,
  minLength: number,
  maxLength: number
): boolean {
  return value.length >= minLength && value.length <= maxLength;
}

/**
 * Validates if a URL is in valid format.
 *
 * @param value - URL string to validate
 * @returns True if valid URL, false otherwise
 */
export function isValidURL(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a value is a valid JSON string.
 *
 * @param value - String to validate as JSON
 * @returns True if valid JSON, false otherwise
 */
export function isValidJSON(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a date is in the future.
 *
 * @param date - Date to validate
 * @returns True if date is in the future, false otherwise
 */
export function isFutureDate(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Validates if a date is in the past.
 *
 * @param date - Date to validate
 * @returns True if date is in the past, false otherwise
 */
export function isPastDate(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Validates if start date is before end date.
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns True if start date is before end date, false otherwise
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate.getTime() < endDate.getTime();
}

/**
 * Normalizes and validates a tenant code.
 * Tenant codes should be lowercase alphanumeric with hyphens.
 *
 * @param code - Tenant code to validate
 * @returns Normalized code if valid, null if invalid
 */
export function normalizeTenantCode(code: string): string | null {
  const normalized = code.toLowerCase().trim();
  const isValid =
    /^[a-z0-9-]+$/.test(normalized) &&
    normalized.length >= 3 &&
    normalized.length <= 50;
  return isValid ? normalized : null;
}

/**
 * Validates if a currency code is valid (ISO 4217).
 *
 * @param code - Currency code to validate
 * @returns True if valid currency code, false otherwise
 */
export function isValidCurrencyCode(code: string): boolean {
  const validCurrencies = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "SEK",
    "NZD",
    "MXN",
    "SGD",
    "HKD",
    "NOK",
    "TRY",
    "ZAR",
    "BRL",
    "INR",
    "KRW",
    "DKK",
  ];
  return validCurrencies.includes(code.toUpperCase());
}

/**
 * Validates if a tax rate is within acceptable bounds.
 *
 * @param rate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns True if valid tax rate, false otherwise
 */
export function isValidTaxRate(rate: number): boolean {
  return rate >= 0 && rate <= 1;
}

/**
 * Validates if a percentage value is within bounds.
 *
 * @param percentage - Percentage value (0-100)
 * @returns True if valid percentage, false otherwise
 */
export function isValidPercentage(percentage: number): boolean {
  return percentage >= 0 && percentage <= 100;
}
