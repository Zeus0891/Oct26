/**
 * Password Utility
 *
 * Provides secure password handling, validation, and strength assessment.
 * Integrates with bcrypt for secure password hashing and verification.
 *
 * @module PasswordUtils
 * @category Shared Utils - Security
 * @description Password security and validation utilities
 * @version 1.0.0
 */

import * as bcrypt from "bcrypt";
import { TypeGuards } from "../base/type-guards.util";
import { CryptoUtils } from "./crypto.util";
import { UtilityPerformance } from "../performance/performance.util";

/**
 * Password strength levels
 */
export enum PasswordStrength {
  VERY_WEAK = "very_weak",
  WEAK = "weak",
  MODERATE = "moderate",
  STRONG = "strong",
  VERY_STRONG = "very_strong",
}

/**
 * Password validation options
 */
export interface PasswordValidationOptions {
  /** Minimum password length */
  minLength?: number;
  /** Maximum password length */
  maxLength?: number;
  /** Require lowercase letters */
  requireLowercase?: boolean;
  /** Require uppercase letters */
  requireUppercase?: boolean;
  /** Require numbers */
  requireNumbers?: boolean;
  /** Require special characters */
  requireSpecialChars?: boolean;
  /** Disallow common passwords */
  disallowCommon?: boolean;
  /** Disallow personal information */
  disallowPersonalInfo?: string[];
  /** Custom validation pattern */
  customPattern?: RegExp;
}

/**
 * Password strength assessment result
 */
export interface PasswordStrengthResult {
  /** Overall strength level */
  strength: PasswordStrength;
  /** Strength score (0-100) */
  score: number;
  /** Detailed feedback */
  feedback: string[];
  /** Suggestions for improvement */
  suggestions: string[];
  /** Whether password meets minimum requirements */
  isValid: boolean;
  /** Estimated time to crack */
  crackTime?: string;
}

/**
 * Password hash result
 */
export interface PasswordHashResult {
  /** Hashed password */
  hash: string;
  /** Salt rounds used */
  saltRounds: number;
  /** Algorithm used */
  algorithm: string;
  /** Timestamp when hashed */
  hashedAt: Date;
}

/**
 * Utility class for secure password operations.
 * Provides password hashing, verification, strength assessment, and validation.
 *
 * @example
 * ```typescript
 * import { PasswordUtils } from '@/shared/utils';
 *
 * // Hash a password
 * const hashResult = await PasswordUtils.hash("SecurePassword123!");
 *
 * // Verify a password
 * const isValid = await PasswordUtils.verify("SecurePassword123!", hashResult.hash);
 *
 * // Check password strength
 * const strength = PasswordUtils.assessStrength("SecurePassword123!");
 *
 * // Validate password against policy
 * const validation = PasswordUtils.validate("password123", {
 *   minLength: 12,
 *   requireUppercase: true,
 *   requireSpecialChars: true
 * });
 * ```
 */
export class PasswordUtils {
  /**
   * Default salt rounds for bcrypt
   */
  private static readonly DEFAULT_SALT_ROUNDS = 12;

  /**
   * Common weak passwords to check against
   */
  private static readonly COMMON_PASSWORDS = new Set([
    "password",
    "123456",
    "password123",
    "admin",
    "qwerty",
    "letmein",
    "welcome",
    "monkey",
    "1234567890",
    "abc123",
    "111111",
    "123123",
    "password1",
    "123456789",
    "welcome123",
    "admin123",
    "root",
    "toor",
    "pass",
    "test",
    "guest",
    "info",
    "administrator",
    "changeme",
  ]);

  /**
   * Sequential patterns to detect
   */
  private static readonly SEQUENTIAL_PATTERNS = [
    /123|234|345|456|567|678|789|890/,
    /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i,
    /qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm/i,
  ];

  /**
   * Hashes a password using bcrypt with secure salt rounds.
   *
   * @param password - Plain text password to hash
   * @param saltRounds - Number of salt rounds (default: 12)
   * @returns Promise resolving to password hash result
   * @complexity O(2^n) where n is salt rounds
   */
  static async hash(
    password: string,
    saltRounds = this.DEFAULT_SALT_ROUNDS
  ): Promise<PasswordHashResult> {
    if (!TypeGuards.isString(password)) {
      throw new Error("Password must be a string");
    }

    if (
      !TypeGuards.isNumber(saltRounds) ||
      saltRounds < 10 ||
      saltRounds > 15
    ) {
      throw new Error("Salt rounds must be between 10 and 15");
    }

    try {
      const hash = await bcrypt.hash(password, saltRounds);

      return {
        hash,
        saltRounds,
        algorithm: "bcrypt",
        hashedAt: new Date(),
      };
    } catch (error) {
      throw new Error(
        `Password hashing failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Verifies a password against its hash using bcrypt.
   *
   * @param password - Plain text password to verify
   * @param hash - Hashed password to verify against
   * @returns Promise resolving to true if password matches
   * @complexity O(2^n) where n is salt rounds used in hash
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    if (!TypeGuards.isString(password) || !TypeGuards.isString(hash)) {
      return false;
    }

    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validates a password against security policy.
   *
   * @param password - Password to validate
   * @param options - Validation options
   * @returns Validation result with detailed feedback
   * @complexity O(n) where n is password length
   */
  static validate(
    password: string,
    options: PasswordValidationOptions = {}
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    if (!TypeGuards.isString(password)) {
      return {
        isValid: false,
        errors: ["Password must be a string"],
        warnings: [],
      };
    }

    const {
      minLength = 8,
      maxLength = 128,
      requireLowercase = true,
      requireUppercase = true,
      requireNumbers = true,
      requireSpecialChars = true,
      disallowCommon = true,
      disallowPersonalInfo = [],
      customPattern,
    } = options;

    const errors: string[] = [];
    const warnings: string[] = [];

    // Length validation
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    if (password.length > maxLength) {
      errors.push(`Password must be no more than ${maxLength} characters long`);
    }

    // Character requirements
    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (requireNumbers && !/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (
      requireSpecialChars &&
      !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    ) {
      errors.push("Password must contain at least one special character");
    }

    // Custom pattern validation
    if (customPattern && !customPattern.test(password)) {
      errors.push("Password does not meet custom requirements");
    }

    // Common password check
    if (disallowCommon && this.COMMON_PASSWORDS.has(password.toLowerCase())) {
      errors.push("Password is too common");
    }

    // Personal information check
    if (disallowPersonalInfo.length > 0) {
      const lowerPassword = password.toLowerCase();
      for (const info of disallowPersonalInfo) {
        if (info && lowerPassword.includes(info.toLowerCase())) {
          errors.push("Password should not contain personal information");
          break;
        }
      }
    }

    // Sequential patterns check
    for (const pattern of this.SEQUENTIAL_PATTERNS) {
      if (pattern.test(password)) {
        warnings.push("Password contains sequential characters");
        break;
      }
    }

    // Repeated characters check
    if (/(.)\1{2,}/.test(password)) {
      warnings.push("Password contains repeated characters");
    }

    // Dictionary words check (simplified)
    if (password.length >= 4 && /^[a-zA-Z]+$/.test(password)) {
      warnings.push("Password appears to be a dictionary word");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Assesses password strength and provides detailed feedback.
   *
   * @param password - Password to assess
   * @param options - Assessment options
   * @returns Comprehensive strength assessment
   * @complexity O(n) where n is password length
   */
  static assessStrength(
    password: string,
    options: PasswordValidationOptions = {}
  ): PasswordStrengthResult {
    if (!TypeGuards.isString(password)) {
      return {
        strength: PasswordStrength.VERY_WEAK,
        score: 0,
        feedback: ["Invalid password format"],
        suggestions: ["Provide a valid string password"],
        isValid: false,
      };
    }

    let score = 0;
    const feedback: string[] = [];
    const suggestions: string[] = [];

    // Base score from length
    if (password.length >= 8) score += 25;
    else suggestions.push("Use at least 8 characters");

    if (password.length >= 12) score += 15;
    else if (password.length >= 8)
      suggestions.push("Consider using 12+ characters for better security");

    // Character variety scoring
    let charTypes = 0;

    if (/[a-z]/.test(password)) {
      charTypes++;
      score += 10;
    } else {
      suggestions.push("Add lowercase letters");
    }

    if (/[A-Z]/.test(password)) {
      charTypes++;
      score += 10;
    } else {
      suggestions.push("Add uppercase letters");
    }

    if (/\d/.test(password)) {
      charTypes++;
      score += 10;
    } else {
      suggestions.push("Add numbers");
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      charTypes++;
      score += 15;
    } else {
      suggestions.push("Add special characters");
    }

    // Bonus for character variety
    if (charTypes >= 3) score += 10;
    if (charTypes === 4) score += 10;

    // Penalties for common patterns
    if (this.COMMON_PASSWORDS.has(password.toLowerCase())) {
      score -= 30;
      feedback.push("Password is too common");
      suggestions.push("Use a unique password");
    }

    // Sequential patterns penalty
    for (const pattern of this.SEQUENTIAL_PATTERNS) {
      if (pattern.test(password)) {
        score -= 10;
        feedback.push("Contains sequential characters");
        suggestions.push("Avoid sequential patterns");
        break;
      }
    }

    // Repeated characters penalty
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      feedback.push("Contains repeated characters");
      suggestions.push("Avoid repeating characters");
    }

    // Dictionary words penalty
    if (password.length >= 4 && /^[a-zA-Z]+$/.test(password)) {
      score -= 15;
      feedback.push("Appears to be a dictionary word");
      suggestions.push("Mix letters with numbers and symbols");
    }

    // Normalize score to 0-100 range
    score = Math.max(0, Math.min(100, score));

    // Determine strength level
    let strength: PasswordStrength;
    if (score >= 80) {
      strength = PasswordStrength.VERY_STRONG;
      feedback.push("Excellent password strength");
    } else if (score >= 60) {
      strength = PasswordStrength.STRONG;
      feedback.push("Good password strength");
    } else if (score >= 40) {
      strength = PasswordStrength.MODERATE;
      feedback.push("Moderate password strength");
    } else if (score >= 20) {
      strength = PasswordStrength.WEAK;
      feedback.push("Weak password");
    } else {
      strength = PasswordStrength.VERY_WEAK;
      feedback.push("Very weak password");
    }

    // Validation against policy
    const validation = this.validate(password, options);

    // Estimate crack time (simplified)
    const crackTime = this.estimateCrackTime(password, score);

    return {
      strength,
      score,
      feedback,
      suggestions: validation.isValid
        ? suggestions
        : [...suggestions, ...validation.errors],
      isValid: validation.isValid,
      crackTime,
    };
  }

  /**
   * Generates a secure password with specified criteria.
   *
   * @param length - Password length
   * @param options - Generation options
   * @returns Generated secure password
   * @complexity O(n) where n is password length
   */
  static generate(
    length = 16,
    options: {
      includeUppercase?: boolean;
      includeLowercase?: boolean;
      includeNumbers?: boolean;
      includeSymbols?: boolean;
      excludeSimilar?: boolean;
      excludeAmbiguous?: boolean;
    } = {}
  ): string {
    const {
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = false,
      excludeAmbiguous = false,
    } = options;

    return CryptoUtils.generatePassword(length, {
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      excludeSimilar,
    });
  }

  /**
   * Gets information about a bcrypt hash.
   *
   * @param hash - Bcrypt hash to analyze
   * @returns Hash information
   * @complexity O(1)
   */
  static getHashInfo(hash: string): {
    algorithm: string;
    saltRounds: number;
    isValid: boolean;
  } {
    if (!TypeGuards.isString(hash)) {
      return { algorithm: "unknown", saltRounds: 0, isValid: false };
    }

    try {
      const saltRounds = bcrypt.getRounds(hash);
      return {
        algorithm: "bcrypt",
        saltRounds,
        isValid: true,
      };
    } catch (error) {
      return { algorithm: "unknown", saltRounds: 0, isValid: false };
    }
  }

  /**
   * Estimates time to crack password (simplified calculation).
   *
   * @param password - Password to analyze
   * @param strengthScore - Password strength score
   * @returns Human-readable crack time estimate
   * @complexity O(1)
   */
  private static estimateCrackTime(
    password: string,
    strengthScore: number
  ): string {
    // Simplified calculation based on character space and length
    let charSpace = 0;

    if (/[a-z]/.test(password)) charSpace += 26;
    if (/[A-Z]/.test(password)) charSpace += 26;
    if (/\d/.test(password)) charSpace += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) charSpace += 32;

    const combinations = Math.pow(charSpace, password.length);

    // Assume 1 billion attempts per second (modern GPU)
    const attemptsPerSecond = 1e9;
    const secondsToHalf = combinations / (2 * attemptsPerSecond);

    if (secondsToHalf < 1) return "Instantly";
    if (secondsToHalf < 60) return "Seconds";
    if (secondsToHalf < 3600) return "Minutes";
    if (secondsToHalf < 86400) return "Hours";
    if (secondsToHalf < 2592000) return "Days";
    if (secondsToHalf < 31536000) return "Months";
    if (secondsToHalf < 31536000 * 100) return "Years";
    if (secondsToHalf < 31536000 * 1000) return "Centuries";

    return "Millennia";
  }

  /**
   * Sanitizes password-related errors for client response.
   *
   * @param error - Error to sanitize
   * @returns Sanitized error message
   * @complexity O(1)
   */
  static sanitizeError(error: unknown): string {
    if (error instanceof Error) {
      // Remove sensitive implementation details
      return error.message.replace(/bcrypt|hash|salt/gi, "authentication");
    }

    return "Password processing failed";
  }

  /**
   * Creates a password policy validator function.
   *
   * @param options - Policy options
   * @returns Validator function
   * @complexity O(1) creation
   */
  static createPolicyValidator(options: PasswordValidationOptions) {
    return (password: string) => this.validate(password, options);
  }

  /**
   * Compares password strength between two passwords.
   *
   * @param password1 - First password
   * @param password2 - Second password
   * @returns Comparison result (-1, 0, 1)
   * @complexity O(n) where n is password length
   */
  static compareStrength(password1: string, password2: string): number {
    const strength1 = this.assessStrength(password1);
    const strength2 = this.assessStrength(password2);

    if (strength1.score < strength2.score) return -1;
    if (strength1.score > strength2.score) return 1;
    return 0;
  }

  /**
   * Determines if a password hash needs to be rehashed.
   * Detects old hash versions, insufficient salt rounds, or outdated algorithms.
   * Essential for maintaining security standards over time.
   *
   * @param hash - The password hash to analyze
   * @param options - Rehash criteria options
   * @returns Rehash analysis result
   * @complexity O(1)
   *
   * @example
   * ```typescript
   * // Check if stored hash needs upgrading
   * const storedHash = '$2b$10$abc123...';
   * const rehashInfo = PasswordUtils.needsRehash(storedHash, {
   *   minRounds: 12,
   *   preferredVersion: '2b'
   * });
   *
   * if (rehashInfo.needsRehash) {
   *   console.log('Reason:', rehashInfo.reason);
   *   // Rehash password on next successful login
   *   const newHash = await PasswordUtils.hash(plainPassword, 12);
   * }
   * ```
   */
  static needsRehash(
    hash: string,
    options: {
      /** Minimum salt rounds required */
      minRounds?: number;
      /** Preferred bcrypt version ('2a', '2b', '2x', '2y') */
      preferredVersion?: string;
      /** Maximum age of hash in days */
      maxAgeInDays?: number;
      /** Hash creation timestamp (if available) */
      createdAt?: Date;
    } = {}
  ): {
    needsRehash: boolean;
    reason?: string;
    currentRounds?: number;
    currentVersion?: string;
    recommended: {
      rounds: number;
      version: string;
    };
  } {
    const {
      minRounds = 12,
      preferredVersion = "2b",
      maxAgeInDays,
      createdAt,
    } = options;

    if (!TypeGuards.isString(hash)) {
      return {
        needsRehash: true,
        reason: "Invalid hash format",
        recommended: { rounds: minRounds, version: preferredVersion },
      };
    }

    // Parse bcrypt hash format: $version$rounds$salt+hash
    const bcryptPattern = /^\$2([abxy]?)\$(\d{1,2})\$.{53}$/;
    const match = hash.match(bcryptPattern);

    if (!match) {
      return {
        needsRehash: true,
        reason: "Not a valid bcrypt hash",
        recommended: { rounds: minRounds, version: preferredVersion },
      };
    }

    const currentVersion = `2${match[1] || "a"}`;
    const currentRounds = parseInt(match[2], 10);

    // Check bcrypt version
    const versionPriority = { "2a": 1, "2x": 2, "2y": 3, "2b": 4 };
    const currentVersionPriority =
      versionPriority[currentVersion as keyof typeof versionPriority] || 0;
    const preferredVersionPriority =
      versionPriority[preferredVersion as keyof typeof versionPriority] || 4;

    if (currentVersionPriority < preferredVersionPriority) {
      return {
        needsRehash: true,
        reason: `Outdated bcrypt version ${currentVersion}, recommend ${preferredVersion}`,
        currentRounds,
        currentVersion,
        recommended: {
          rounds: Math.max(currentRounds, minRounds),
          version: preferredVersion,
        },
      };
    }

    // Check salt rounds
    if (currentRounds < minRounds) {
      return {
        needsRehash: true,
        reason: `Insufficient salt rounds: ${currentRounds} < ${minRounds}`,
        currentRounds,
        currentVersion,
        recommended: { rounds: minRounds, version: preferredVersion },
      };
    }

    // Check hash age if provided
    if (maxAgeInDays && createdAt) {
      const ageInDays =
        (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays > maxAgeInDays) {
        return {
          needsRehash: true,
          reason: `Hash is ${Math.floor(
            ageInDays
          )} days old, exceeds maximum of ${maxAgeInDays} days`,
          currentRounds,
          currentVersion,
          recommended: { rounds: minRounds, version: preferredVersion },
        };
      }
    }

    // Check for known vulnerable rounds (historically insecure)
    if (currentRounds < 10) {
      return {
        needsRehash: true,
        reason: `Salt rounds ${currentRounds} considered cryptographically weak`,
        currentRounds,
        currentVersion,
        recommended: { rounds: minRounds, version: preferredVersion },
      };
    }

    // Hash appears to be current and secure
    return {
      needsRehash: false,
      currentRounds,
      currentVersion,
      recommended: { rounds: minRounds, version: preferredVersion },
    };
  }

  /**
   * Checks if a hash was created with legacy parameters and provides upgrade recommendations.
   * Useful for bulk analysis of stored password hashes.
   *
   * @param hashes - Array of hash objects to analyze
   * @returns Analysis summary with upgrade recommendations
   * @complexity O(n) where n is number of hashes
   *
   * @example
   * ```typescript
   * const hashesToAnalyze = [
   *   { hash: '$2a$10$abc...', userId: 'user1', createdAt: new Date('2020-01-01') },
   *   { hash: '$2b$12$def...', userId: 'user2', createdAt: new Date('2023-01-01') }
   * ];
   *
   * const analysis = PasswordUtils.analyzeHashSecurity(hashesToAnalyze);
   * console.log(`${analysis.needsUpgrade} out of ${analysis.total} hashes need upgrading`);
   * ```
   */
  static analyzeHashSecurity(
    hashes: Array<{
      hash: string;
      userId?: string;
      createdAt?: Date;
    }>,
    options: {
      minRounds?: number;
      preferredVersion?: string;
      maxAgeInDays?: number;
    } = {}
  ): {
    total: number;
    needsUpgrade: number;
    byReason: Record<string, number>;
    recommendations: {
      immediate: Array<{ userId?: string; reason: string }>;
      scheduled: Array<{ userId?: string; reason: string }>;
    };
  } {
    const analysis = {
      total: hashes.length,
      needsUpgrade: 0,
      byReason: {} as Record<string, number>,
      recommendations: {
        immediate: [] as Array<{ userId?: string; reason: string }>,
        scheduled: [] as Array<{ userId?: string; reason: string }>,
      },
    };

    hashes.forEach(({ hash, userId, createdAt }) => {
      const rehashInfo = this.needsRehash(hash, { ...options, createdAt });

      if (rehashInfo.needsRehash && rehashInfo.reason) {
        analysis.needsUpgrade++;

        // Count by reason
        analysis.byReason[rehashInfo.reason] =
          (analysis.byReason[rehashInfo.reason] || 0) + 1;

        // Categorize urgency
        const isImmediate =
          rehashInfo.reason.includes("vulnerable") ||
          rehashInfo.reason.includes("weak") ||
          (rehashInfo.currentRounds && rehashInfo.currentRounds < 10);

        const recommendation = { userId, reason: rehashInfo.reason };

        if (isImmediate) {
          analysis.recommendations.immediate.push(recommendation);
        } else {
          analysis.recommendations.scheduled.push(recommendation);
        }
      }
    });

    return analysis;
  }

  // Performance-wrapped critical methods for enterprise monitoring

  /**
   * Performance-measured hash method.
   * Measures execution time for bcrypt password hashing operations.
   *
   * @param password - Password to hash
   * @param rounds - Number of salt rounds
   * @returns Promise resolving to hash result
   *
   * @example
   * ```typescript
   * const result = await PasswordUtils.hashMeasured('password123', 12);
   * // Automatically logged if duration > 500ms (bcrypt is typically slower)
   * ```
   */
  static hashMeasured = UtilityPerformance.wrapAsync(
    "PasswordUtils.hash",
    this.hash.bind(this),
    { trackMemory: true, logThreshold: 500 } // Higher threshold for bcrypt
  );

  /**
   * Performance-measured verify method.
   * Measures execution time for bcrypt password verification operations.
   *
   * @param password - Plain text password
   * @param hashResult - Hash result to verify against
   * @returns Promise resolving to verification result
   */
  static verifyMeasured = UtilityPerformance.wrapAsync(
    "PasswordUtils.verify",
    this.verify.bind(this),
    { trackMemory: true, logThreshold: 300 }
  );

  /**
   * Performance-measured strength assessment method.
   * Measures execution time for password strength analysis.
   *
   * @param password - Password to assess
   * @returns Strength assessment result
   */
  static assessStrengthMeasured = UtilityPerformance.wrap(
    "PasswordUtils.assessStrength",
    this.assessStrength.bind(this),
    { logThreshold: 10 }
  );
}
