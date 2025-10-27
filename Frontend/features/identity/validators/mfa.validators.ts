/**
 * MFA Validators
 * Validation schemas for Multi-Factor Authentication operations
 * Aligned with backend MFA types and security requirements
 */

import { z } from "zod";

// =============================================================================
// MFA SETUP VALIDATION SCHEMAS
// =============================================================================

/**
 * TOTP setup validation schema
 */
export const totpSetupSchema = z.object({
  secret: z
    .string()
    .min(1, "TOTP secret is required")
    .regex(/^[A-Z2-7]{32}$/, "Invalid TOTP secret format"),

  code: z
    .string()
    .min(1, "Verification code is required")
    .regex(/^\d{6}$/, "Code must be 6 digits"),

  backupCodes: z.array(z.string()).optional(),
});

export type TOTPSetupData = z.infer<typeof totpSetupSchema>;

/**
 * SMS setup validation schema
 */
export const smsSetupSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^\+[1-9]\d{1,14}$/,
      "Phone number must be in international format (+1234567890)"
    ),

  verificationCode: z
    .string()
    .optional()
    .refine((code) => {
      if (!code) return true;
      return /^\d{6}$/.test(code);
    }, "Verification code must be 6 digits"),
});

export type SMSSetupData = z.infer<typeof smsSetupSchema>;

/**
 * Email MFA setup validation schema
 */
export const emailMfaSetupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),

  verificationCode: z
    .string()
    .optional()
    .refine((code) => {
      if (!code) return true;
      return /^\d{6}$/.test(code);
    }, "Verification code must be 6 digits"),
});

export type EmailMFASetupData = z.infer<typeof emailMfaSetupSchema>;

// =============================================================================
// MFA VERIFICATION SCHEMAS
// =============================================================================

/**
 * MFA code verification schema
 */
export const mfaVerificationSchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .regex(/^\d{6}$/, "Code must be 6 digits"),

  method: z.enum(["totp", "sms", "email", "backup"]).default("totp"),

  rememberDevice: z.boolean().optional().default(false),
});

export type MFAVerificationData = z.infer<typeof mfaVerificationSchema>;

/**
 * Backup code verification schema
 */
export const backupCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Backup code is required")
    .regex(/^[A-Za-z0-9]{8}$/, "Backup code must be 8 characters"),
});

export type BackupCodeData = z.infer<typeof backupCodeSchema>;

// =============================================================================
// MFA MANAGEMENT SCHEMAS
// =============================================================================

/**
 * MFA method disable schema
 */
export const disableMfaSchema = z.object({
  method: z.enum(["totp", "sms", "email"]).or(z.literal("all")),

  confirmationCode: z
    .string()
    .min(1, "Confirmation required")
    .regex(/^\d{6}$/, "Confirmation code must be 6 digits"),

  password: z.string().min(1, "Password verification required"),
});

export type DisableMFAData = z.infer<typeof disableMfaSchema>;

/**
 * Backup codes regeneration schema
 */
export const regenerateBackupCodesSchema = z.object({
  confirmationCode: z
    .string()
    .min(1, "MFA code required")
    .regex(/^\d{6}$/, "Code must be 6 digits"),

  password: z.string().min(1, "Password verification required"),
});

export type RegenerateBackupCodesData = z.infer<
  typeof regenerateBackupCodesSchema
>;

// =============================================================================
// MFA PREFERENCES SCHEMAS
// =============================================================================

/**
 * MFA preferences schema
 */
export const mfaPreferencesSchema = z.object({
  primaryMethod: z.enum(["totp", "sms", "email"]).nullable(),

  fallbackMethod: z.enum(["totp", "sms", "email", "backup"]).nullable(),

  requireForSensitiveActions: z.boolean().default(true),

  trustDeviceDuration: z
    .number()
    .min(0, "Duration must be non-negative")
    .max(2592000, "Maximum trust duration is 30 days") // 30 days in seconds
    .default(0), // 0 = don't trust devices

  notifyOnNewDevice: z.boolean().default(true),
});

export type MFAPreferencesData = z.infer<typeof mfaPreferencesSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate TOTP code format and timing
 */
export const validateTOTPCode = (
  code: string,
  window: number = 1
): {
  isValid: boolean;
  message?: string;
  timeWindow?: number;
} => {
  if (!code) {
    return { isValid: false, message: "TOTP code is required" };
  }

  if (!/^\d{6}$/.test(code)) {
    return { isValid: false, message: "TOTP code must be 6 digits" };
  }

  // Additional timing validation would require the secret and current time
  // This is a format-only validation for the frontend
  return {
    isValid: true,
    timeWindow: window,
  };
};

/**
 * Validate phone number format for SMS MFA
 */
export const validatePhoneNumber = (
  phoneNumber: string
): {
  isValid: boolean;
  message?: string;
  formatted?: string;
} => {
  if (!phoneNumber) {
    return { isValid: false, message: "Phone number is required" };
  }

  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, "");

  // Must start with + and have 10-15 digits
  const phoneRegex = /^\+[1-9]\d{9,14}$/;

  if (!phoneRegex.test(cleaned)) {
    return {
      isValid: false,
      message: "Phone number must be in international format (+1234567890)",
    };
  }

  return {
    isValid: true,
    formatted: cleaned,
  };
};

/**
 * Validate backup code format
 */
export const validateBackupCode = (
  code: string
): {
  isValid: boolean;
  message?: string;
} => {
  if (!code) {
    return { isValid: false, message: "Backup code is required" };
  }

  // Remove spaces and convert to uppercase
  const cleaned = code.replace(/\s/g, "").toUpperCase();

  if (!/^[A-Z0-9]{8}$/.test(cleaned)) {
    return {
      isValid: false,
      message: "Backup code must be 8 alphanumeric characters",
    };
  }

  return { isValid: true };
};

/**
 * Validate MFA method availability
 */
export const validateMFAMethodAvailability = (
  method: "totp" | "sms" | "email",
  userMfaMethods: string[]
): { isAvailable: boolean; message?: string } => {
  if (!Array.isArray(userMfaMethods)) {
    return { isAvailable: false, message: "Invalid MFA methods data" };
  }

  if (!userMfaMethods.includes(method)) {
    return {
      isAvailable: false,
      message: `${method.toUpperCase()} is not enabled for this account`,
    };
  }

  return { isAvailable: true };
};

/**
 * Calculate MFA security score
 */
export const calculateMFASecurityScore = (methods: {
  totp?: boolean;
  sms?: boolean;
  email?: boolean;
  backupCodes?: boolean;
}): {
  score: number; // 0-100
  level: "none" | "basic" | "good" | "excellent";
  recommendations: string[];
} => {
  let score = 0;
  const recommendations: string[] = [];

  // TOTP (most secure)
  if (methods.totp) {
    score += 40;
  } else {
    recommendations.push("Enable authenticator app (TOTP) for best security");
  }

  // SMS (moderate security)
  if (methods.sms) {
    score += 25;
  } else if (!methods.totp) {
    recommendations.push("Enable SMS verification as a fallback method");
  }

  // Email (basic security)
  if (methods.email) {
    score += 15;
  }

  // Backup codes
  if (methods.backupCodes) {
    score += 20;
  } else {
    recommendations.push("Generate backup codes for account recovery");
  }

  // Determine security level
  let level: "none" | "basic" | "good" | "excellent";
  if (score === 0) level = "none";
  else if (score < 40) level = "basic";
  else if (score < 70) level = "good";
  else level = "excellent";

  return { score, level, recommendations };
};

// =============================================================================
// FORM VALIDATION HELPERS
// =============================================================================

/**
 * MFA form validation state
 */
export interface MFAFormValidationState {
  code?: string;
  phoneNumber?: string;
  email?: string;
  backupCode?: string;
}

/**
 * Validate MFA form fields
 */
export const validateMFAFormField = (
  fieldName: keyof MFAFormValidationState,
  value: string
): string | null => {
  switch (fieldName) {
    case "code":
      const codeValidation = validateTOTPCode(value);
      return codeValidation.isValid
        ? null
        : codeValidation.message || "Invalid code";

    case "phoneNumber":
      const phoneValidation = validatePhoneNumber(value);
      return phoneValidation.isValid
        ? null
        : phoneValidation.message || "Invalid phone number";

    case "email":
      try {
        z.string().email().parse(value);
        return null;
      } catch {
        return "Please enter a valid email address";
      }

    case "backupCode":
      const backupValidation = validateBackupCode(value);
      return backupValidation.isValid
        ? null
        : backupValidation.message || "Invalid backup code";

    default:
      return null;
  }
};

const MFAValidators = {
  // Schemas
  totpSetupSchema,
  smsSetupSchema,
  emailMfaSetupSchema,
  mfaVerificationSchema,
  backupCodeSchema,
  disableMfaSchema,
  regenerateBackupCodesSchema,
  mfaPreferencesSchema,

  // Validation helpers
  validateTOTPCode,
  validatePhoneNumber,
  validateBackupCode,
  validateMFAMethodAvailability,
  calculateMFASecurityScore,
  validateMFAFormField,
};

export default MFAValidators;
