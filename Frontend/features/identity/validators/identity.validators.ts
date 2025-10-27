/**
 * Identity Validators
 * Core validation schemas for identity operations
 * Aligned with backend Identity module validation
 */

import { z } from "zod";

// =============================================================================
// BASIC VALIDATION HELPERS
// =============================================================================

/**
 * Email validation with comprehensive rules
 */
export const validateEmail = (
  email: string
): { isValid: boolean; message?: string } => {
  if (!email) {
    return { isValid: false, message: "Email is required" };
  }

  if (email.length > 254) {
    return { isValid: false, message: "Email is too long" };
  }

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  return { isValid: true };
};

/**
 * Password strength validation
 */
export const getPasswordStrength = (
  password: string
): {
  score: number; // 0-4
  feedback: string;
  isValid: boolean;
  color: string;
  label: string;
} => {
  if (!password) {
    return {
      score: 0,
      feedback: "Password is required",
      isValid: false,
      color: "bg-gray-300",
      label: "Enter a password",
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score++;
  else feedback.push("at least 8 characters");

  // Uppercase letter
  if (/[A-Z]/.test(password)) score++;
  else feedback.push("one uppercase letter");

  // Lowercase letter
  if (/[a-z]/.test(password)) score++;
  else feedback.push("one lowercase letter");

  // Number
  if (/\d/.test(password)) score++;
  else feedback.push("one number");

  // Special character
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  else feedback.push("one special character");

  const isValid = score >= 3; // Require at least 3/5 criteria

  let strengthMessage = "";
  if (score === 0) strengthMessage = "Very weak";
  else if (score === 1) strengthMessage = "Weak";
  else if (score === 2) strengthMessage = "Fair";
  else if (score === 3) strengthMessage = "Good";
  else if (score === 4) strengthMessage = "Strong";
  else strengthMessage = "Very strong";

  const finalFeedback = isValid
    ? `${strengthMessage} password`
    : `Password needs: ${feedback.join(", ")}`;

  // Color mapping based on score
  const colors = [
    "bg-red-500", // 0 - Very weak
    "bg-red-400", // 1 - Weak
    "bg-yellow-400", // 2 - Fair
    "bg-blue-400", // 3 - Good
    "bg-green-400", // 4 - Strong
    "bg-green-500", // 5 - Very strong
  ];

  return {
    score,
    feedback: finalFeedback,
    isValid,
    color: colors[score] || "bg-gray-300",
    label: strengthMessage,
  };
};

/**
 * Password validation function
 */
export const validatePassword = (
  password: string
): { isValid: boolean; message?: string } => {
  const result = getPasswordStrength(password);
  return {
    isValid: result.isValid,
    message: result.isValid ? undefined : result.feedback,
  };
};

// =============================================================================
// ZOD SCHEMAS - LOGIN & REGISTRATION
// =============================================================================

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),

  password: z.string().min(1, "Password is required"),

  rememberMe: z.boolean().optional().default(false),

  mfaCode: z
    .string()
    .optional()
    .refine((code) => {
      if (!code) return true; // Optional field
      return /^\d{6}$/.test(code);
    }, "MFA code must be 6 digits"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration validation schema
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .max(254, "Email is too long")
      .email("Please enter a valid email address")
      .transform((email) => email.toLowerCase().trim()),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long")
      .refine((password) => {
        const result = getPasswordStrength(password);
        return result.isValid;
      }, "Password does not meet security requirements"),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name is too long")
      .regex(/^[a-zA-Z\s'-]+$/, "First name contains invalid characters"),

    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name is too long")
      .regex(/^[a-zA-Z\s'-]+$/, "Last name contains invalid characters"),

    acceptTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions"
      ),

    acceptPrivacy: z
      .boolean()
      .refine((val) => val === true, "You must accept the privacy policy"),

    marketingOptIn: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// =============================================================================
// PASSWORD RESET SCHEMAS
// =============================================================================

/**
 * Forgot password validation schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password validation schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .transform((email) => email.toLowerCase().trim()),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long")
      .refine((password) => {
        const result = getPasswordStrength(password);
        return result.isValid;
      }, "Password does not meet security requirements"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Change password validation schema (for authenticated users)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long")
      .refine((password) => {
        const result = getPasswordStrength(password);
        return result.isValid;
      }, "Password does not meet security requirements"),

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

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// =============================================================================
// EMAIL VERIFICATION SCHEMAS
// =============================================================================

/**
 * Email verification schema
 */
export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),
});

export type EmailVerificationData = z.infer<typeof emailVerificationSchema>;

/**
 * Resend email verification schema
 */
export const resendVerificationSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),
});

export type ResendVerificationData = z.infer<typeof resendVerificationSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate form data with a schema and return typed results
 */
export const validateFormData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      });
      return { success: false, errors };
    }
    return {
      success: false,
      errors: { general: "Validation failed" },
    };
  }
};

/**
 * Validate single field with a schema
 */
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  fieldName: string,
  value: unknown
): string | null => {
  try {
    schema.parse({ [fieldName]: value });
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.issues.find((issue) =>
        issue.path.includes(fieldName)
      );
      return fieldError?.message || null;
    }
    return "Validation error";
  }
};

// =============================================================================
// FORM STATE HELPERS
// =============================================================================

/**
 * Form state interface for validation tracking
 */
export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
}

/**
 * Create initial form validation state
 */
export const createInitialValidationState = (): FormValidationState => ({
  isValid: false,
  errors: {},
  touched: {},
  isDirty: false,
});

/**
 * Update form validation state
 */
export const updateValidationState = (
  current: FormValidationState,
  updates: Partial<FormValidationState>
): FormValidationState => ({
  ...current,
  ...updates,
});

const IdentityValidators = {
  // Schemas
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  emailVerificationSchema,
  resendVerificationSchema,

  // Helpers
  validateEmail,
  validatePassword,
  getPasswordStrength,
  validateFormData,
  validateField,

  // Form state
  createInitialValidationState,
  updateValidationState,
};

export default IdentityValidators;
