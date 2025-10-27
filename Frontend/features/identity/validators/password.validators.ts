/**
 * Password Validators
 * Comprehensive password validation and security rules
 * Aligned with backend password policies and security requirements
 */

import { z } from "zod";

// =============================================================================
// PASSWORD STRENGTH CONFIGURATION
// =============================================================================

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxRepeatingChars: number;
  preventCommonPasswords: boolean;
  preventUserInfoInPassword: boolean;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxRepeatingChars: 3,
  preventCommonPasswords: true,
  preventUserInfoInPassword: true,
};

// =============================================================================
// PASSWORD VALIDATION SCHEMAS
// =============================================================================

/**
 * Password strength validation with custom policy
 */
export const createPasswordSchema = (
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
) => {
  return z
    .string()
    .min(
      policy.minLength,
      `Password must be at least ${policy.minLength} characters`
    )
    .max(
      policy.maxLength,
      `Password must not exceed ${policy.maxLength} characters`
    )
    .refine((password) => {
      if (policy.requireUppercase && !/[A-Z]/.test(password)) {
        return false;
      }
      if (policy.requireLowercase && !/[a-z]/.test(password)) {
        return false;
      }
      if (policy.requireNumbers && !/\d/.test(password)) {
        return false;
      }
      if (
        policy.requireSpecialChars &&
        !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      ) {
        return false;
      }
      return true;
    }, "Password does not meet security requirements")
    .refine((password) => {
      if (policy.maxRepeatingChars > 0) {
        const regex = new RegExp(`(.)\\1{${policy.maxRepeatingChars},}`);
        return !regex.test(password);
      }
      return true;
    }, `Password cannot have more than ${policy.maxRepeatingChars} consecutive identical characters`)
    .refine((password) => {
      if (policy.preventCommonPasswords) {
        return !isCommonPassword(password);
      }
      return true;
    }, "Password is too common, please choose a more secure password");
};

/**
 * Default password schema
 */
export const passwordSchema = createPasswordSchema();

/**
 * Password confirmation schema
 */
export const passwordWithConfirmationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type PasswordWithConfirmationData = z.infer<
  typeof passwordWithConfirmationSchema
>;

// =============================================================================
// PASSWORD CHANGE SCHEMAS
// =============================================================================

/**
 * Password change validation schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: passwordSchema,

    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

/**
 * Admin password reset schema
 */
export const adminPasswordResetSchema = z
  .object({
    userId: z
      .string()
      .min(1, "User ID is required")
      .uuid("Invalid user ID format"),

    newPassword: passwordSchema,

    confirmNewPassword: z.string().min(1, "Please confirm the new password"),

    notifyUser: z.boolean().optional().default(true),

    forceChangeOnNextLogin: z.boolean().optional().default(true),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

export type AdminPasswordResetData = z.infer<typeof adminPasswordResetSchema>;

// =============================================================================
// PASSWORD RECOVERY SCHEMAS
// =============================================================================

/**
 * Password recovery request schema
 */
export const passwordRecoveryRequestSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),

  captcha: z.string().optional(), // For bot protection
});

export type PasswordRecoveryRequestData = z.infer<
  typeof passwordRecoveryRequestSchema
>;

/**
 * Password recovery validation schema
 */
export const passwordRecoverySchema = z
  .object({
    token: z.string().min(1, "Recovery token is required"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .transform((email) => email.toLowerCase().trim()),

    newPassword: passwordSchema,

    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

export type PasswordRecoveryData = z.infer<typeof passwordRecoverySchema>;

// =============================================================================
// PASSWORD STRENGTH ANALYSIS
// =============================================================================

export interface PasswordStrengthResult {
  score: number; // 0-100
  level: "very-weak" | "weak" | "fair" | "good" | "strong" | "very-strong";
  feedback: string[];
  warnings: string[];
  suggestions: string[];
  isValid: boolean;
  timeToBreak: string;
}

/**
 * Comprehensive password strength analysis
 */
export const analyzePasswordStrength = (
  password: string,
  userInfo?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  },
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): PasswordStrengthResult => {
  const feedback: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  if (!password) {
    return {
      score: 0,
      level: "very-weak",
      feedback: ["Password is required"],
      warnings: [],
      suggestions: ["Enter a password"],
      isValid: false,
      timeToBreak: "Instantly",
    };
  }

  // Length scoring
  if (password.length >= policy.minLength) {
    score += Math.min(25, password.length * 2);
    if (password.length >= 12) {
      feedback.push("Good length");
    }
  } else {
    warnings.push(`Password must be at least ${policy.minLength} characters`);
  }

  // Character variety scoring
  let varietyScore = 0;
  if (/[a-z]/.test(password)) {
    varietyScore += 5;
  } else if (policy.requireLowercase) {
    suggestions.push("Add lowercase letters");
  }

  if (/[A-Z]/.test(password)) {
    varietyScore += 5;
  } else if (policy.requireUppercase) {
    suggestions.push("Add uppercase letters");
  }

  if (/\d/.test(password)) {
    varietyScore += 5;
  } else if (policy.requireNumbers) {
    suggestions.push("Add numbers");
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    varietyScore += 10;
  } else if (policy.requireSpecialChars) {
    suggestions.push("Add special characters (!@#$%^&*)");
  }

  score += varietyScore;

  // Pattern analysis
  if (hasRepeatingPatterns(password)) {
    warnings.push("Avoid repeating patterns");
    score -= 10;
  }

  if (hasSequentialChars(password)) {
    warnings.push("Avoid sequential characters (abc, 123)");
    score -= 10;
  }

  if (hasKeyboardPatterns(password)) {
    warnings.push("Avoid keyboard patterns (qwerty, asdf)");
    score -= 15;
  }

  // Common password check
  if (isCommonPassword(password)) {
    warnings.push("This is a commonly used password");
    score -= 20;
  }

  // Personal information check
  if (userInfo && containsPersonalInfo(password, userInfo)) {
    warnings.push("Avoid using personal information");
    score -= 15;
  }

  // Dictionary word check
  if (containsDictionaryWords(password)) {
    warnings.push("Avoid dictionary words");
    score -= 10;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Determine strength level
  let level: PasswordStrengthResult["level"];
  if (score < 20) level = "very-weak";
  else if (score < 40) level = "weak";
  else if (score < 60) level = "fair";
  else if (score < 80) level = "good";
  else if (score < 95) level = "strong";
  else level = "very-strong";

  // Calculate time to break (simplified estimation)
  const timeToBreak = estimateTimeToBreak(password, score);

  // Policy compliance check
  const isValid = validatePasswordPolicy(password, policy);

  return {
    score,
    level,
    feedback: feedback.length > 0 ? feedback : ["Password analyzed"],
    warnings,
    suggestions,
    isValid,
    timeToBreak,
  };
};

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Common passwords list (top 100 most common)
 */
const COMMON_PASSWORDS = new Set([
  "password",
  "123456",
  "123456789",
  "qwerty",
  "abc123",
  "password123",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "dragon",
  "master",
  "football",
  "1234567",
  "baseball",
  "superman",
  "access",
  "shadow",
  "trustno1",
  "qwerty123",
  "welcome123",
  "login",
  "guest",
  "hello",
  "test",
  "user",
  // Add more common passwords as needed
]);

/**
 * Check if password is commonly used
 */
export const isCommonPassword = (password: string): boolean => {
  return COMMON_PASSWORDS.has(password.toLowerCase());
};

/**
 * Check for repeating patterns
 */
const hasRepeatingPatterns = (password: string): boolean => {
  // Check for patterns like "abcabc" or "123123"
  for (let i = 1; i <= password.length / 2; i++) {
    const pattern = password.substring(0, i);
    if (
      password === pattern.repeat(password.length / i) &&
      password.length / i >= 2
    ) {
      return true;
    }
  }
  return false;
};

/**
 * Check for sequential characters
 */
const hasSequentialChars = (password: string): boolean => {
  const sequences = [
    "abcdefghijklmnopqrstuvwxyz",
    "0123456789",
    "qwertyuiopasdfghjklzxcvbnm",
  ];

  for (const sequence of sequences) {
    for (let i = 0; i <= sequence.length - 3; i++) {
      const subseq = sequence.substring(i, i + 3);
      if (password.toLowerCase().includes(subseq)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Check for keyboard patterns
 */
const hasKeyboardPatterns = (password: string): boolean => {
  const patterns = ["qwerty", "asdf", "zxcv", "1234", "qaz", "wsx"];
  const lowerPassword = password.toLowerCase();

  return patterns.some((pattern) => lowerPassword.includes(pattern));
};

/**
 * Check if password contains personal information
 */
const containsPersonalInfo = (
  password: string,
  userInfo: {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }
): boolean => {
  const lowerPassword = password.toLowerCase();

  const personalItems = [
    userInfo.email?.split("@")[0],
    userInfo.firstName,
    userInfo.lastName,
    userInfo.username,
  ].filter(Boolean);

  return personalItems.some(
    (item) =>
      item && item.length > 2 && lowerPassword.includes(item.toLowerCase())
  );
};

/**
 * Check for dictionary words (simplified check)
 */
const containsDictionaryWords = (password: string): boolean => {
  // Simplified dictionary check - in production, use a proper dictionary
  const commonWords = [
    "password",
    "love",
    "secret",
    "god",
    "money",
    "live",
    "peace",
  ];
  const lowerPassword = password.toLowerCase();

  return commonWords.some((word) => lowerPassword.includes(word));
};

/**
 * Validate password against policy
 */
const validatePasswordPolicy = (
  password: string,
  policy: PasswordPolicy
): boolean => {
  if (
    password.length < policy.minLength ||
    password.length > policy.maxLength
  ) {
    return false;
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    return false;
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    return false;
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    return false;
  }

  if (
    policy.requireSpecialChars &&
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    return false;
  }

  if (policy.maxRepeatingChars > 0) {
    const regex = new RegExp(`(.)\\1{${policy.maxRepeatingChars},}`);
    if (regex.test(password)) {
      return false;
    }
  }

  if (policy.preventCommonPasswords && isCommonPassword(password)) {
    return false;
  }

  return true;
};

/**
 * Estimate time to break password (simplified)
 */
const estimateTimeToBreak = (password: string, score: number): string => {
  const length = password.length;

  if (score < 20) return "Instantly";
  if (score < 40) return "Minutes";
  if (score < 60) return "Hours";
  if (score < 80) return "Days";
  if (length >= 12 && score >= 80) return "Years";
  if (length >= 16 && score >= 90) return "Centuries";

  return "Months";
};

// =============================================================================
// FORM VALIDATION
// =============================================================================

/**
 * Password form validation state
 */
export interface PasswordFormValidationState {
  password?: string;
  confirmPassword?: string;
  currentPassword?: string;
}

/**
 * Validate password form field
 */
export const validatePasswordFormField = (
  fieldName: keyof PasswordFormValidationState,
  value: string,
  otherValues?: Partial<PasswordFormValidationState>
): string | null => {
  switch (fieldName) {
    case "password":
      const analysis = analyzePasswordStrength(value);
      return analysis.isValid
        ? null
        : analysis.warnings[0] || "Invalid password";

    case "confirmPassword":
      if (!value) return "Please confirm your password";
      if (otherValues?.password && value !== otherValues.password) {
        return "Passwords don't match";
      }
      return null;

    case "currentPassword":
      return value ? null : "Current password is required";

    default:
      return null;
  }
};

const PasswordValidators = {
  // Schemas
  passwordSchema,
  passwordWithConfirmationSchema,
  changePasswordSchema,
  adminPasswordResetSchema,
  passwordRecoveryRequestSchema,
  passwordRecoverySchema,

  // Policy and creation
  DEFAULT_PASSWORD_POLICY,
  createPasswordSchema,

  // Analysis
  analyzePasswordStrength,

  // Validation helpers
  isCommonPassword,
  validatePasswordPolicy,
  validatePasswordFormField,
};

export default PasswordValidators;
