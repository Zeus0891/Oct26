/**
 * String Utility
 *
 * Provides comprehensive text manipulation utilities for all feature modules.
 * All functions are pure and handle edge cases with proper validation.
 *
 * @module StringUtils
 * @category Shared Utils - Base
 * @description Text manipulation and string processing utilities
 * @version 1.0.0
 */

import { TypeGuards } from "./type-guards.util";

/**
 * String case conversion options
 */
export interface CaseOptions {
  /** Preserve acronyms in uppercase */
  preserveAcronyms?: boolean;
  /** Custom separator for word boundaries */
  separator?: string;
}

/**
 * Template interpolation options
 */
export interface TemplateOptions {
  /** Custom opening delimiter (default: '{{') */
  openDelimiter?: string;
  /** Custom closing delimiter (default: '}}') */
  closeDelimiter?: string;
  /** Allow HTML in replacements */
  allowHtml?: boolean;
  /** Escape function for values */
  escape?: (value: string) => string;
}

/**
 * Utility class for string operations and text processing.
 * All methods are pure functions that return new strings without side effects.
 *
 * @example
 * ```typescript
 * import { StringUtils } from '@/shared/utils';
 *
 * // Case conversions
 * const title = StringUtils.toTitleCase("hello world");
 * const slug = StringUtils.toSlug("Hello World! 123");
 *
 * // Template processing
 * const message = StringUtils.template("Hello {{name}}", { name: "John" });
 *
 * // Validation
 * const isValidEmail = StringUtils.isEmail("user@domain.com");
 * ```
 */
export class StringUtils {
  /**
   * Converts string to camelCase.
   *
   * @param str - String to convert
   * @param options - Conversion options
   * @returns camelCase string
   * @complexity O(n) where n is string length
   */
  static toCamelCase(str: string, options: CaseOptions = {}): string {
    if (!TypeGuards.isString(str)) return "";

    return str
      .trim()
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
      .replace(/^[A-Z]/, (char) => char.toLowerCase());
  }

  /**
   * Converts string to PascalCase.
   *
   * @param str - String to convert
   * @param options - Conversion options
   * @returns PascalCase string
   * @complexity O(n) where n is string length
   */
  static toPascalCase(str: string, options: CaseOptions = {}): string {
    if (!TypeGuards.isString(str)) return "";

    const camelCase = this.toCamelCase(str, options);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  /**
   * Converts string to snake_case.
   *
   * @param str - String to convert
   * @param options - Conversion options
   * @returns snake_case string
   * @complexity O(n) where n is string length
   */
  static toSnakeCase(str: string, options: CaseOptions = {}): string {
    if (!TypeGuards.isString(str)) return "";

    const { separator = "_" } = options;

    return str
      .trim()
      .replace(/([A-Z])/g, `${separator}$1`)
      .replace(/[-\s]+/g, separator)
      .toLowerCase()
      .replace(new RegExp(`^${separator}`), "");
  }

  /**
   * Converts string to kebab-case.
   *
   * @param str - String to convert
   * @param options - Conversion options
   * @returns kebab-case string
   * @complexity O(n) where n is string length
   *
   * @example
   * ```typescript
   * StringUtils.toKebabCase('HelloWorld') // → "hello-world"
   * StringUtils.toKebabCase('user_name') // → "user-name"
   * StringUtils.toKebabCase('API Response') // → "api-response"
   * ```
   */
  static toKebabCase(str: string, options: CaseOptions = {}): string {
    return this.toSnakeCase(str, { ...options, separator: "-" });
  }

  /**
   * Converts string to Title Case.
   *
   * @param str - String to convert
   * @param options - Conversion options
   * @returns Title Case string
   * @complexity O(n) where n is string length
   *
   * @example
   * ```typescript
   * StringUtils.toTitleCase('hello world') // → "Hello World"
   * StringUtils.toTitleCase('user-profile') // → "User Profile"
   * StringUtils.toTitleCase('API endpoint', { preserveAcronyms: true }) // → "API Endpoint"
   * ```
   */
  static toTitleCase(str: string, options: CaseOptions = {}): string {
    if (!TypeGuards.isString(str)) return "";

    const { preserveAcronyms = false } = options;

    return str
      .trim()
      .toLowerCase()
      .replace(/\b\w+/g, (word) => {
        if (preserveAcronyms && word.toUpperCase() === word) {
          return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      });
  }

  /**
   * Converts string to URL-friendly slug.
   *
   * @param str - String to convert
   * @param options - Conversion options
   * @returns URL slug
   * @complexity O(n) where n is string length
   */
  static toSlug(str: string, options: CaseOptions = {}): string {
    if (!TypeGuards.isString(str)) return "";

    const { separator = "-" } = options;

    return str
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^\w\s-]/g, "") // Remove special chars
      .replace(/[\s_-]+/g, separator) // Replace spaces/underscores
      .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), ""); // Trim separators
  }

  /**
   * Capitalizes the first letter of a string.
   *
   * @param str - String to capitalize
   * @returns Capitalized string
   * @complexity O(1)
   */
  static capitalize(str: string): string {
    if (!TypeGuards.isString(str) || str.length === 0) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Truncates a string to specified length with ellipsis.
   *
   * @param str - String to truncate
   * @param maxLength - Maximum length
   * @param ellipsis - Ellipsis string (default: "...")
   * @returns Truncated string
   * @complexity O(1)
   */
  static truncate(str: string, maxLength: number, ellipsis = "..."): string {
    if (!TypeGuards.isString(str)) return "";
    if (str.length <= maxLength) return str;

    return str.slice(0, maxLength - ellipsis.length) + ellipsis;
  }

  /**
   * Truncates string at word boundary.
   *
   * @param str - String to truncate
   * @param maxLength - Maximum length
   * @param ellipsis - Ellipsis string
   * @returns Truncated string at word boundary
   * @complexity O(n) where n is string length
   */
  static truncateWords(
    str: string,
    maxLength: number,
    ellipsis = "..."
  ): string {
    if (!TypeGuards.isString(str) || str.length <= maxLength) return str;

    const truncated = str.slice(0, maxLength - ellipsis.length);
    const lastSpace = truncated.lastIndexOf(" ");

    if (lastSpace === -1) return truncated + ellipsis;
    return truncated.slice(0, lastSpace) + ellipsis;
  }

  /**
   * Pads string to specified length.
   *
   * @param str - String to pad
   * @param targetLength - Target length
   * @param padString - Padding string
   * @param direction - Padding direction
   * @returns Padded string
   * @complexity O(n) where n is target length
   */
  static pad(
    str: string,
    targetLength: number,
    padString = " ",
    direction: "start" | "end" | "both" = "end"
  ): string {
    if (!TypeGuards.isString(str)) return "";

    const currentLength = str.length;
    if (currentLength >= targetLength) return str;

    const totalPadding = targetLength - currentLength;

    switch (direction) {
      case "start":
        return (
          padString
            .repeat(Math.ceil(totalPadding / padString.length))
            .slice(0, totalPadding) + str
        );
      case "both":
        const leftPadding = Math.floor(totalPadding / 2);
        const rightPadding = totalPadding - leftPadding;
        const leftPad = padString
          .repeat(Math.ceil(leftPadding / padString.length))
          .slice(0, leftPadding);
        const rightPad = padString
          .repeat(Math.ceil(rightPadding / padString.length))
          .slice(0, rightPadding);
        return leftPad + str + rightPad;
      case "end":
      default:
        return (
          str +
          padString
            .repeat(Math.ceil(totalPadding / padString.length))
            .slice(0, totalPadding)
        );
    }
  }

  /**
   * Removes whitespace from both ends of string.
   *
   * @param str - String to trim
   * @param chars - Characters to trim (default: whitespace)
   * @returns Trimmed string
   * @complexity O(n) where n is string length
   */
  static trim(str: string, chars?: string): string {
    if (!TypeGuards.isString(str)) return "";

    if (!chars) return str.trim();

    const charSet = new Set(chars.split(""));
    let start = 0;
    let end = str.length - 1;

    while (start <= end && charSet.has(str[start])) start++;
    while (end >= start && charSet.has(str[end])) end--;

    return str.slice(start, end + 1);
  }

  /**
   * Repeats string n times.
   *
   * @param str - String to repeat
   * @param count - Number of repetitions
   * @param separator - Separator between repetitions
   * @returns Repeated string
   * @complexity O(n * m) where n is count and m is string length
   */
  static repeat(str: string, count: number, separator = ""): string {
    if (!TypeGuards.isString(str) || count <= 0) return "";

    const parts = new Array(count).fill(str);
    return parts.join(separator);
  }

  /**
   * Reverses a string.
   *
   * @param str - String to reverse
   * @returns Reversed string
   * @complexity O(n) where n is string length
   */
  static reverse(str: string): string {
    if (!TypeGuards.isString(str)) return "";
    return str.split("").reverse().join("");
  }

  /**
   * Checks if string contains only alphabetic characters.
   *
   * @param str - String to check
   * @returns True if alphabetic
   * @complexity O(n) where n is string length
   */
  static isAlpha(str: string): boolean {
    if (!TypeGuards.isString(str) || str.length === 0) return false;
    return /^[a-zA-Z]+$/.test(str);
  }

  /**
   * Checks if string contains only numeric characters.
   *
   * @param str - String to check
   * @returns True if numeric
   * @complexity O(n) where n is string length
   */
  static isNumeric(str: string): boolean {
    if (!TypeGuards.isString(str) || str.length === 0) return false;
    return /^\d+$/.test(str);
  }

  /**
   * Checks if string contains only alphanumeric characters.
   *
   * @param str - String to check
   * @returns True if alphanumeric
   * @complexity O(n) where n is string length
   */
  static isAlphanumeric(str: string): boolean {
    if (!TypeGuards.isString(str) || str.length === 0) return false;
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  /**
   * Validates email format.
   *
   * @param str - String to validate
   * @returns True if valid email
   * @complexity O(n) where n is string length
   */
  static isEmail(str: string): boolean {
    if (!TypeGuards.isString(str)) return false;

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(str);
  }

  /**
   * Validates URL format.
   *
   * @param str - String to validate
   * @returns True if valid URL
   * @complexity O(n) where n is string length
   */
  static isUrl(str: string): boolean {
    if (!TypeGuards.isString(str)) return false;

    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Template string interpolation with variable substitution.
   *
   * @param template - Template string with placeholders
   * @param variables - Variables to substitute
   * @param options - Template options
   * @returns Interpolated string
   * @complexity O(n * m) where n is template length and m is number of variables
   */
  static template(
    template: string,
    variables: Record<string, unknown>,
    options: TemplateOptions = {}
  ): string {
    if (!TypeGuards.isString(template)) return "";

    const {
      openDelimiter = "{{",
      closeDelimiter = "}}",
      allowHtml = false,
      escape = (value: string) => (allowHtml ? value : this.escapeHtml(value)),
    } = options;

    const regex = new RegExp(
      `${this.escapeRegex(openDelimiter)}\\s*([^${this.escapeRegex(
        closeDelimiter
      )}]+)\\s*${this.escapeRegex(closeDelimiter)}`,
      "g"
    );

    return template.replace(regex, (match, key) => {
      const trimmedKey = key.trim();
      const value = variables[trimmedKey];

      if (value === undefined || value === null) {
        return match; // Keep original placeholder if no value
      }

      return escape(String(value));
    });
  }

  /**
   * Escapes HTML entities in string.
   *
   * @param str - String to escape
   * @returns HTML-escaped string
   * @complexity O(n) where n is string length
   */
  static escapeHtml(str: string): string {
    if (!TypeGuards.isString(str)) return "";

    const htmlEscapes: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
    };

    return str.replace(/[&<>"'/]/g, (char) => htmlEscapes[char] || char);
  }

  /**
   * Unescapes HTML entities in string.
   *
   * @param str - String to unescape
   * @returns HTML-unescaped string
   * @complexity O(n) where n is string length
   */
  static unescapeHtml(str: string): string {
    if (!TypeGuards.isString(str)) return "";

    const htmlUnescapes: Record<string, string> = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#x27;": "'",
      "&#x2F;": "/",
    };

    return str.replace(
      /&(?:amp|lt|gt|quot|#x27|#x2F);/g,
      (entity) => htmlUnescapes[entity] || entity
    );
  }

  /**
   * Escapes special regex characters.
   *
   * @param str - String to escape
   * @returns Regex-escaped string
   * @complexity O(n) where n is string length
   */
  static escapeRegex(str: string): string {
    if (!TypeGuards.isString(str)) return "";
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Removes all whitespace from string.
   *
   * @param str - String to process
   * @returns String without whitespace
   * @complexity O(n) where n is string length
   */
  static removeWhitespace(str: string): string {
    if (!TypeGuards.isString(str)) return "";
    return str.replace(/\s/g, "");
  }

  /**
   * Normalizes whitespace (converts multiple spaces to single space).
   *
   * @param str - String to normalize
   * @returns String with normalized whitespace
   * @complexity O(n) where n is string length
   */
  static normalizeWhitespace(str: string): string {
    if (!TypeGuards.isString(str)) return "";
    return str.replace(/\s+/g, " ").trim();
  }

  /**
   * Extracts words from string.
   *
   * @param str - String to extract words from
   * @param pattern - Custom word pattern
   * @returns Array of words
   * @complexity O(n) where n is string length
   */
  static extractWords(str: string, pattern?: RegExp): string[] {
    if (!TypeGuards.isString(str)) return [];

    const wordPattern = pattern || /\b\w+\b/g;
    return str.match(wordPattern) || [];
  }

  /**
   * Counts word occurrences in string.
   *
   * @param str - String to analyze
   * @param caseSensitive - Whether to match case
   * @returns Map of word to count
   * @complexity O(n) where n is string length
   */
  static wordCount(str: string, caseSensitive = false): Map<string, number> {
    const words = this.extractWords(caseSensitive ? str : str.toLowerCase());
    const counts = new Map<string, number>();

    for (const word of words) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }

    return counts;
  }

  /**
   * Calculates Levenshtein distance between two strings.
   *
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Edit distance
   * @complexity O(n * m) where n and m are string lengths
   */
  static levenshteinDistance(str1: string, str2: string): number {
    if (!TypeGuards.isString(str1) || !TypeGuards.isString(str2))
      return Infinity;

    if (str1 === str2) return 0;
    if (str1.length === 0) return str2.length;
    if (str2.length === 0) return str1.length;

    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= str1.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str2.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[str1.length][str2.length];
  }

  /**
   * Calculates similarity ratio between two strings.
   *
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Similarity ratio (0-1)
   * @complexity O(n * m) where n and m are string lengths
   */
  static similarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;

    const distance = this.levenshteinDistance(str1, str2);
    return 1 - distance / maxLength;
  }
}
