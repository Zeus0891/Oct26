/**
 * Profile Validators
 * Validation schemas for user profile management
 * Aligned with backend profile types and requirements
 */

import { z } from "zod";

// =============================================================================
// PROFILE VALIDATION SCHEMAS
// =============================================================================

/**
 * User profile update validation schema
 */
export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "First name contains invalid characters")
    .transform((name) => name.trim()),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name contains invalid characters")
    .transform((name) => name.trim()),

  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name is too long")
    .regex(/^[a-zA-Z0-9\s._-]+$/, "Display name contains invalid characters")
    .transform((name) => name.trim()),

  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),

  phoneNumber: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === "") return true;
      return /^\+[1-9]\d{1,14}$/.test(phone.replace(/[\s()-]/g, ""));
    }, "Phone number must be in international format (+1234567890)")
    .transform((phone) => (phone ? phone.replace(/[\s()-]/g, "") : undefined)),

  timezone: z
    .string()
    .optional()
    .refine((tz) => {
      if (!tz) return true;
      // Basic timezone validation - in production, use a proper timezone list
      return /^[A-Za-z_]+\/[A-Za-z_]+$/.test(tz);
    }, "Invalid timezone format"),

  locale: z
    .string()
    .optional()
    .refine((locale) => {
      if (!locale) return true;
      return /^[a-z]{2}(-[A-Z]{2})?$/.test(locale);
    }, 'Locale must be in format "en" or "en-US"'),

  dateOfBirth: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return !isNaN(birthDate.getTime()) && age >= 13 && age <= 120;
    }, "Invalid date of birth"),

  bio: z.string().max(500, "Bio is too long").optional(),

  website: z
    .string()
    .url("Please enter a valid website URL")
    .max(200, "Website URL is too long")
    .optional()
    .or(z.literal("")),

  company: z.string().max(100, "Company name is too long").optional(),

  jobTitle: z.string().max(100, "Job title is too long").optional(),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

/**
 * Avatar upload validation schema
 */
export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type
        ),
      "File must be a valid image (JPEG, PNG, WebP, or GIF)"
    ),

  cropData: z
    .object({
      x: z.number().min(0),
      y: z.number().min(0),
      width: z.number().min(50, "Crop width must be at least 50 pixels"),
      height: z.number().min(50, "Crop height must be at least 50 pixels"),
    })
    .optional(),
});

export type AvatarUploadData = z.infer<typeof avatarUploadSchema>;

/**
 * Privacy preferences validation schema
 */
export const privacyPreferencesSchema = z.object({
  profileVisibility: z
    .enum(["public", "private", "contacts"])
    .default("private"),

  showEmail: z.boolean().default(false),

  showPhoneNumber: z.boolean().default(false),

  allowSearchByEmail: z.boolean().default(false),

  allowSearchByPhoneNumber: z.boolean().default(false),

  receiveMarketingEmails: z.boolean().default(false),

  receiveProductUpdates: z.boolean().default(true),

  receiveSecurityNotifications: z.boolean().default(true),
});

export type PrivacyPreferencesData = z.infer<typeof privacyPreferencesSchema>;

/**
 * Notification preferences validation schema
 */
export const notificationPreferencesSchema = z.object({
  // Email notifications
  emailDigest: z
    .enum(["never", "daily", "weekly", "monthly"])
    .default("weekly"),

  emailMentions: z.boolean().default(true),

  emailComments: z.boolean().default(true),

  emailProjectUpdates: z.boolean().default(true),

  emailSecurityAlerts: z.boolean().default(true),

  // Push notifications (for mobile/desktop apps)
  pushMentions: z.boolean().default(true),

  pushComments: z.boolean().default(false),

  pushProjectUpdates: z.boolean().default(true),

  pushSecurityAlerts: z.boolean().default(true),

  // SMS notifications
  smsSecurityAlerts: z.boolean().default(false),

  smsAccountUpdates: z.boolean().default(false),

  // Quiet hours
  quietHoursEnabled: z.boolean().default(false),

  quietHoursStart: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format")
    .default("22:00"),

  quietHoursEnd: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format")
    .default("08:00"),
});

export type NotificationPreferencesData = z.infer<
  typeof notificationPreferencesSchema
>;

/**
 * Account deactivation validation schema
 */
export const accountDeactivationSchema = z.object({
  reason: z
    .enum([
      "temporary_break",
      "privacy_concerns",
      "too_many_emails",
      "found_alternative",
      "other",
    ])
    .optional(),

  feedback: z.string().max(1000, "Feedback is too long").optional(),

  password: z.string().min(1, "Password confirmation is required"),

  confirmDeactivation: z
    .boolean()
    .refine((val) => val === true, "You must confirm account deactivation"),
});

export type AccountDeactivationData = z.infer<typeof accountDeactivationSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate name format (first/last name)
 */
export const validateName = (
  name: string,
  fieldName: string = "Name"
): {
  isValid: boolean;
  message?: string;
  formatted?: string;
} => {
  if (!name) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const trimmed = name.trim();

  if (trimmed.length < 1) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (trimmed.length > 50) {
    return { isValid: false, message: `${fieldName} is too long` };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return {
      isValid: false,
      message: `${fieldName} contains invalid characters`,
    };
  }

  // Check for excessive spaces or special characters
  if (/\s{2,}/.test(trimmed) || /[-']{2,}/.test(trimmed)) {
    return { isValid: false, message: `${fieldName} has invalid formatting` };
  }

  return {
    isValid: true,
    formatted: trimmed.replace(/\s+/g, " "), // Normalize spaces
  };
};

/**
 * Validate display name
 */
export const validateDisplayName = (
  displayName: string
): {
  isValid: boolean;
  message?: string;
  formatted?: string;
} => {
  if (!displayName) {
    return { isValid: false, message: "Display name is required" };
  }

  const trimmed = displayName.trim();

  if (trimmed.length < 1) {
    return { isValid: false, message: "Display name is required" };
  }

  if (trimmed.length > 100) {
    return { isValid: false, message: "Display name is too long" };
  }

  // Allow alphanumeric characters, spaces, dots, underscores, and hyphens
  if (!/^[a-zA-Z0-9\s._-]+$/.test(trimmed)) {
    return {
      isValid: false,
      message: "Display name contains invalid characters",
    };
  }

  // Check for excessive spaces or special characters
  if (/[\s._-]{2,}/.test(trimmed)) {
    return { isValid: false, message: "Display name has invalid formatting" };
  }

  return {
    isValid: true,
    formatted: trimmed.replace(/\s+/g, " "), // Normalize spaces
  };
};

/**
 * Validate timezone
 */
export const validateTimezone = (
  timezone: string
): {
  isValid: boolean;
  message?: string;
} => {
  if (!timezone) {
    return { isValid: true }; // Optional field
  }

  // Basic timezone validation - in production, use Intl.supportedValuesOf('timeZone')
  const timezoneRegex = /^[A-Za-z_]+\/[A-Za-z_]+$/;

  if (!timezoneRegex.test(timezone)) {
    return { isValid: false, message: "Invalid timezone format" };
  }

  // Additional validation could check against a list of valid timezones
  // In production, use Intl.supportedValuesOf('timeZone') or a timezone library
  return { isValid: true };
};

/**
 * Validate locale format
 */
export const validateLocale = (
  locale: string
): {
  isValid: boolean;
  message?: string;
} => {
  if (!locale) {
    return { isValid: true }; // Optional field
  }

  // Locale format: language code (ISO 639-1) optionally followed by country code (ISO 3166-1)
  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) {
    return {
      isValid: false,
      message: 'Locale must be in format "en" or "en-US"',
    };
  }

  return { isValid: true };
};

/**
 * Validate date of birth
 */
export const validateDateOfBirth = (
  dateString: string
): {
  isValid: boolean;
  message?: string;
  age?: number;
} => {
  if (!dateString) {
    return { isValid: true }; // Optional field
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return { isValid: false, message: "Invalid date format" };
  }

  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  const adjustedAge =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())
      ? age - 1
      : age;

  if (adjustedAge < 13) {
    return { isValid: false, message: "You must be at least 13 years old" };
  }

  if (adjustedAge > 120) {
    return { isValid: false, message: "Please enter a valid date of birth" };
  }

  return { isValid: true, age: adjustedAge };
};

/**
 * Validate website URL
 */
export const validateWebsite = (
  website: string
): {
  isValid: boolean;
  message?: string;
  formatted?: string;
} => {
  if (!website || website.trim() === "") {
    return { isValid: true }; // Optional field
  }

  const trimmed = website.trim();

  try {
    const url = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    );

    if (!["http:", "https:"].includes(url.protocol)) {
      return {
        isValid: false,
        message: "Website must use HTTP or HTTPS protocol",
      };
    }

    if (url.toString().length > 200) {
      return { isValid: false, message: "Website URL is too long" };
    }

    return {
      isValid: true,
      formatted: url.toString(),
    };
  } catch {
    return { isValid: false, message: "Please enter a valid website URL" };
  }
};

// =============================================================================
// FORM VALIDATION HELPERS
// =============================================================================

/**
 * Profile form validation state
 */
export interface ProfileFormValidationState {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  dateOfBirth?: string;
  timezone?: string;
  locale?: string;
}

/**
 * Validate profile form field
 */
export const validateProfileFormField = (
  fieldName: keyof ProfileFormValidationState,
  value: string
): string | null => {
  switch (fieldName) {
    case "firstName":
      const firstNameResult = validateName(value, "First name");
      return firstNameResult.isValid
        ? null
        : firstNameResult.message || "Invalid first name";

    case "lastName":
      const lastNameResult = validateName(value, "Last name");
      return lastNameResult.isValid
        ? null
        : lastNameResult.message || "Invalid last name";

    case "displayName":
      const displayNameResult = validateDisplayName(value);
      return displayNameResult.isValid
        ? null
        : displayNameResult.message || "Invalid display name";

    case "email":
      try {
        z.string().email().parse(value);
        return null;
      } catch {
        return "Please enter a valid email address";
      }

    case "phoneNumber":
      if (!value || value.trim() === "") return null; // Optional
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      return phoneRegex.test(value.replace(/[\s()-]/g, ""))
        ? null
        : "Phone number must be in international format (+1234567890)";

    case "website":
      const websiteResult = validateWebsite(value);
      return websiteResult.isValid
        ? null
        : websiteResult.message || "Invalid website URL";

    case "dateOfBirth":
      const dobResult = validateDateOfBirth(value);
      return dobResult.isValid
        ? null
        : dobResult.message || "Invalid date of birth";

    case "timezone":
      const timezoneResult = validateTimezone(value);
      return timezoneResult.isValid
        ? null
        : timezoneResult.message || "Invalid timezone";

    case "locale":
      const localeResult = validateLocale(value);
      return localeResult.isValid
        ? null
        : localeResult.message || "Invalid locale";

    default:
      return null;
  }
};

const ProfileValidators = {
  // Schemas
  profileUpdateSchema,
  avatarUploadSchema,
  privacyPreferencesSchema,
  notificationPreferencesSchema,
  accountDeactivationSchema,

  // Validation helpers
  validateName,
  validateDisplayName,
  validateTimezone,
  validateLocale,
  validateDateOfBirth,
  validateWebsite,
  validateProfileFormField,
};

export default ProfileValidators;
