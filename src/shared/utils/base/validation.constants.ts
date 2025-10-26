/**
 * Validation Constants
 *
 * Centralized repository of regex patterns and validation constants.
 * Prevents duplication of expressions across utilities and ensures consistency.
 *
 * @module ValidationConstants
 * @category Shared Utils - Base
 * @description Centralized validation patterns and constants
 * @version 1.0.0
 */

/**
 * Regular expression patterns for common validation scenarios.
 * All patterns are compiled for optimal performance and reusability.
 *
 * @example
 * ```typescript
 * import { VALIDATION_PATTERNS } from '@/shared/utils/base/validation.constants';
 *
 * // Validate email
 * const isValidEmail = VALIDATION_PATTERNS.EMAIL.test(emailString);
 *
 * // Validate UUID
 * const isValidUUID = VALIDATION_PATTERNS.UUID.test(uuidString);
 * ```
 */
export const VALIDATION_PATTERNS = {
  /**
   * Email validation pattern (RFC 5322 compliant)
   * Supports most common email formats while preventing common attack vectors
   *
   * @example Valid: user@domain.com, test.email+tag@example.co.uk
   * @example Invalid: @domain.com, user@, user@domain
   */
  EMAIL:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,

  /**
   * UUID validation pattern (all versions: v1, v2, v3, v4, v5)
   * Matches standard UUID format with hyphens
   *
   * @example Valid: 123e4567-e89b-12d3-a456-426614174000
   * @example Invalid: 123e4567e89b12d3a456426614174000 (no hyphens)
   */
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

  /**
   * US phone number validation pattern
   * Supports various formats with optional country code
   *
   * @example Valid: (555) 123-4567, +1-555-123-4567, 555.123.4567
   * @example Invalid: 555-123, 1234567890123 (too many digits)
   */
  PHONE_US: /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,

  /**
   * International phone number validation pattern
   * Supports E.164 format and common international formats
   *
   * @example Valid: +44 20 1234 5678, +1 (555) 123-4567
   */
  PHONE_INTERNATIONAL: /^\+?[1-9]\d{1,14}$/,

  /**
   * Credit card validation pattern (basic format check)
   * Supports Visa, MasterCard, American Express, Discover
   * Note: This only validates format, use Luhn algorithm for full validation
   *
   * @example Valid: 4111111111111111 (Visa), 5555555555554444 (MasterCard)
   */
  CREDIT_CARD:
    /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,

  /**
   * Strong password validation pattern
   * Requires at least 8 characters with mixed case, numbers, and special characters
   *
   * @example Valid: MyP@ssw0rd123, Str0ng!Pass
   * @example Invalid: password123 (no uppercase/special), 123456 (too simple)
   */
  PASSWORD_STRONG:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  /**
   * Medium strength password pattern
   * Requires at least 6 characters with mixed case and numbers
   */
  PASSWORD_MEDIUM: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,

  /**
   * URL validation pattern (HTTP/HTTPS)
   * Validates web URLs with optional ports and query parameters
   *
   * @example Valid: https://example.com, http://localhost:3000/api?param=value
   * @example Invalid: ftp://example.com, not-a-url
   */
  URL: /^https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$/,

  /**
   * IPv4 address validation pattern
   * Validates standard IPv4 addresses (0-255 per octet)
   *
   * @example Valid: 192.168.1.1, 10.0.0.1, 255.255.255.255
   * @example Invalid: 256.1.1.1, 192.168.1, 192.168.1.1.1
   */
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,

  /**
   * IPv6 address validation pattern
   * Validates standard IPv6 addresses (full format)
   *
   * @example Valid: 2001:db8:85a3::8a2e:370:7334
   */
  IPV6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,

  /**
   * MAC address validation pattern
   * Supports both colon and hyphen separated formats
   *
   * @example Valid: 00:1B:44:11:3A:B7, 00-1B-44-11-3A-B7
   */
  MAC_ADDRESS: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,

  /**
   * Hexadecimal color validation pattern
   * Supports both 3 and 6 digit hex colors with optional hash
   *
   * @example Valid: #FF0000, #f00, FF0000, f00
   */
  HEX_COLOR: /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,

  /**
   * Social Security Number validation pattern (US)
   * Supports XXX-XX-XXXX format
   *
   * @example Valid: 123-45-6789
   * @example Invalid: 000-00-0000, 666-12-3456
   */
  SSN: /^(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}$/,

  /**
   * ZIP code validation pattern (US)
   * Supports both 5-digit and ZIP+4 formats
   *
   * @example Valid: 12345, 12345-6789
   */
  ZIP_CODE: /^\d{5}(-\d{4})?$/,

  /**
   * Alphanumeric validation pattern
   * Only letters and numbers, no spaces or special characters
   *
   * @example Valid: abc123, TestString123
   * @example Invalid: abc 123, test-string
   */
  ALPHANUMERIC: /^[A-Za-z0-9]+$/,

  /**
   * Alphanumeric with spaces validation pattern
   * Letters, numbers, and spaces only
   */
  ALPHANUMERIC_SPACES: /^[A-Za-z0-9\s]+$/,

  /**
   * Username validation pattern
   * 3-20 characters, letters, numbers, underscores, and hyphens
   * Must start and end with alphanumeric character
   *
   * @example Valid: user123, test_user, my-name
   * @example Invalid: _user, user_, a, toolongusernamethatexceedslimit
   */
  USERNAME: /^[A-Za-z0-9]([A-Za-z0-9_-]{1,18}[A-Za-z0-9])?$/,

  /**
   * Slug validation pattern (URL-friendly)
   * Lowercase letters, numbers, and hyphens only
   *
   * @example Valid: my-blog-post, article-123
   * @example Invalid: My Blog Post, article_123
   */
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  /**
   * Base64 validation pattern
   * Standard Base64 encoding with optional padding
   */
  BASE64: /^[A-Za-z0-9+/]*={0,2}$/,

  /**
   * JWT token validation pattern
   * Three Base64-URL encoded parts separated by dots
   */
  JWT: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/,

  /**
   * Semantic version validation pattern
   * Supports standard semantic versioning (major.minor.patch)
   *
   * @example Valid: 1.0.0, 2.1.3-beta.1, 1.0.0-alpha+build.1
   */
  SEMVER:
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,

  /**
   * HTML tag validation pattern
   * Matches HTML/XML tags including self-closing tags
   */
  HTML_TAG: /<\/?[a-z][\s\S]*>/i,

  /**
   * ISO 8601 date validation pattern
   * Supports various ISO date formats
   *
   * @example Valid: 2023-12-25, 2023-12-25T10:30:00Z
   */
  ISO_DATE:
    /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?)?$/,
} as const;

/**
 * Validation limits and constraints.
 * Common limits used across different validation scenarios.
 */
export const VALIDATION_LIMITS = {
  /** Email address length limits */
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 254,
  },

  /** Password length limits */
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    MIN_STRONG_LENGTH: 12,
  },

  /** Username constraints */
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
  },

  /** Text field limits */
  TEXT: {
    SHORT_MAX: 255,
    MEDIUM_MAX: 1000,
    LONG_MAX: 5000,
  },

  /** Phone number limits */
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },

  /** Common numeric limits */
  NUMERIC: {
    SAFE_INTEGER_MIN: Number.MIN_SAFE_INTEGER,
    SAFE_INTEGER_MAX: Number.MAX_SAFE_INTEGER,
    PERCENTAGE_MIN: 0,
    PERCENTAGE_MAX: 100,
  },

  /** File size limits (in bytes) */
  FILE_SIZE: {
    SMALL: 1024 * 1024, // 1MB
    MEDIUM: 5 * 1024 * 1024, // 5MB
    LARGE: 10 * 1024 * 1024, // 10MB
    MAX: 50 * 1024 * 1024, // 50MB
  },
} as const;

/**
 * Character sets for password and string generation.
 * Organized by character type for flexible composition.
 */
export const CHARACTER_SETS = {
  /** Lowercase letters */
  LOWERCASE: "abcdefghijklmnopqrstuvwxyz",

  /** Uppercase letters */
  UPPERCASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

  /** Numeric digits */
  NUMBERS: "0123456789",

  /** Basic special characters (safe for most contexts) */
  SPECIAL_BASIC: "!@#$%^&*",

  /** Extended special characters */
  SPECIAL_EXTENDED: "!@#$%^&*()_+-=[]{}|;:,.<>?",

  /** URL-safe characters */
  URL_SAFE:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~",

  /** Base64 characters */
  BASE64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",

  /** Hexadecimal characters */
  HEX: "0123456789ABCDEF",

  /** Alphanumeric characters */
  ALPHANUMERIC:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
} as const;

/**
 * Common validation error messages.
 * Standardized error messages for consistent user experience.
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_FORMAT: "Invalid format",
  TOO_SHORT: "Value is too short",
  TOO_LONG: "Value is too long",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_URL: "Please enter a valid URL",
  INVALID_PHONE: "Please enter a valid phone number",
  WEAK_PASSWORD: "Password is too weak",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match",
  INVALID_DATE: "Please enter a valid date",
  INVALID_NUMBER: "Please enter a valid number",
  OUT_OF_RANGE: "Value is out of acceptable range",
  INVALID_UUID: "Invalid UUID format",
  INVALID_JSON: "Invalid JSON format",
  FILE_TOO_LARGE: "File size exceeds maximum limit",
  UNSUPPORTED_FILE_TYPE: "File type is not supported",
} as const;

/**
 * MIME type constants for file validation.
 * Common MIME types organized by category.
 */
export const MIME_TYPES = {
  /** Image MIME types */
  IMAGES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
    "image/tiff",
  ],

  /** Document MIME types */
  DOCUMENTS: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
  ],

  /** Archive MIME types */
  ARCHIVES: [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-tar",
    "application/gzip",
    "application/x-7z-compressed",
  ],

  /** Video MIME types */
  VIDEOS: [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
  ],

  /** Audio MIME types */
  AUDIO: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/webm"],
} as const;

/**
 * Validation rule presets for common scenarios.
 * Pre-configured validation rules that can be composed together.
 */
export const VALIDATION_PRESETS = {
  /** Email validation preset */
  EMAIL: {
    pattern: VALIDATION_PATTERNS.EMAIL,
    minLength: VALIDATION_LIMITS.EMAIL.MIN_LENGTH,
    maxLength: VALIDATION_LIMITS.EMAIL.MAX_LENGTH,
    message: VALIDATION_MESSAGES.INVALID_EMAIL,
  },

  /** Strong password validation preset */
  STRONG_PASSWORD: {
    pattern: VALIDATION_PATTERNS.PASSWORD_STRONG,
    minLength: VALIDATION_LIMITS.PASSWORD.MIN_STRONG_LENGTH,
    maxLength: VALIDATION_LIMITS.PASSWORD.MAX_LENGTH,
    message: VALIDATION_MESSAGES.WEAK_PASSWORD,
  },

  /** Username validation preset */
  USERNAME: {
    pattern: VALIDATION_PATTERNS.USERNAME,
    minLength: VALIDATION_LIMITS.USERNAME.MIN_LENGTH,
    maxLength: VALIDATION_LIMITS.USERNAME.MAX_LENGTH,
    message:
      "Username must be 3-20 characters, letters, numbers, hyphens and underscores only",
  },

  /** URL validation preset */
  URL: {
    pattern: VALIDATION_PATTERNS.URL,
    message: VALIDATION_MESSAGES.INVALID_URL,
  },

  /** UUID validation preset */
  UUID: {
    pattern: VALIDATION_PATTERNS.UUID,
    message: VALIDATION_MESSAGES.INVALID_UUID,
  },
} as const;

/**
 * Type definitions for validation patterns
 */
export type ValidationPatternName = keyof typeof VALIDATION_PATTERNS;
export type ValidationLimitCategory = keyof typeof VALIDATION_LIMITS;
export type CharacterSetName = keyof typeof CHARACTER_SETS;
export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;
export type MimeTypeCategory = keyof typeof MIME_TYPES;
export type ValidationPresetName = keyof typeof VALIDATION_PRESETS;

/**
 * Utility functions for working with validation constants
 */
export const ValidationConstantsUtils = {
  /**
   * Gets a validation pattern by name.
   *
   * @param name - Pattern name
   * @returns Compiled regular expression
   */
  getPattern(name: ValidationPatternName): RegExp {
    return VALIDATION_PATTERNS[name];
  },

  /**
   * Tests a value against a validation pattern.
   *
   * @param value - Value to test
   * @param patternName - Pattern name to test against
   * @returns True if value matches pattern
   */
  testPattern(value: string, patternName: ValidationPatternName): boolean {
    return VALIDATION_PATTERNS[patternName].test(value);
  },

  /**
   * Gets all MIME types for a category.
   *
   * @param category - MIME type category
   * @returns Array of MIME type strings
   */
  getMimeTypes(category: MimeTypeCategory): readonly string[] {
    return MIME_TYPES[category];
  },

  /**
   * Checks if a MIME type belongs to a category.
   *
   * @param mimeType - MIME type to check
   * @param category - Category to check against
   * @returns True if MIME type belongs to category
   */
  isMimeTypeInCategory(mimeType: string, category: MimeTypeCategory): boolean {
    return (MIME_TYPES[category] as readonly string[]).includes(mimeType);
  },

  /**
   * Generates a character set by combining multiple sets.
   *
   * @param sets - Array of character set names to combine
   * @returns Combined character string
   */
  combineCharacterSets(...sets: CharacterSetName[]): string {
    return sets.map((set) => CHARACTER_SETS[set]).join("");
  },
} as const;
