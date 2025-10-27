/**
 * Session Validators
 * Validation schemas for session management operations
 * Aligned with backend session types and requirements
 */

import { z } from "zod";

// =============================================================================
// SESSION VALIDATION SCHEMAS
// =============================================================================

/**
 * Session creation validation schema
 */
export const createSessionSchema = z.object({
  tenantId: z
    .string()
    .min(1, "Tenant ID is required")
    .uuid("Invalid tenant ID format"),

  deviceInfo: z
    .object({
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
      deviceType: z.enum(["desktop", "mobile", "tablet", "unknown"]).optional(),
      browserName: z.string().optional(),
      os: z.string().optional(),
    })
    .optional(),
});

export type CreateSessionData = z.infer<typeof createSessionSchema>;

/**
 * Session switch validation schema
 */
export const switchTenantSchema = z.object({
  tenantId: z
    .string()
    .min(1, "Tenant ID is required")
    .uuid("Invalid tenant ID format"),
});

export type SwitchTenantData = z.infer<typeof switchTenantSchema>;

/**
 * Session refresh validation schema
 */
export const refreshSessionSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshSessionData = z.infer<typeof refreshSessionSchema>;

/**
 * Session device registration schema
 */
export const registerDeviceSchema = z.object({
  deviceName: z
    .string()
    .min(1, "Device name is required")
    .max(100, "Device name is too long"),

  deviceType: z
    .enum(["desktop", "mobile", "tablet", "unknown"])
    .default("unknown"),

  trusted: z.boolean().optional().default(false),

  fingerprint: z.string().optional(),
});

export type RegisterDeviceData = z.infer<typeof registerDeviceSchema>;

// =============================================================================
// SESSION STATE VALIDATION
// =============================================================================

/**
 * Session state validation schema
 */
export const sessionStateSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),

  refreshToken: z.string().min(1, "Refresh token is required"),

  tokenType: z.literal("Bearer").default("Bearer"),

  expiresIn: z.number().positive("Expires in must be positive"),

  expiresAt: z.string().datetime("Invalid expiration date"),

  tenantId: z.string().uuid("Invalid tenant ID format").nullable(),

  memberId: z.string().uuid("Invalid member ID format").nullable(),

  userId: z.string().uuid("Invalid user ID format"),
});

export type SessionState = z.infer<typeof sessionStateSchema>;

/**
 * Session metadata validation schema
 */
export const sessionMetadataSchema = z.object({
  deviceId: z.string().uuid("Invalid device ID format").nullable(),

  deviceName: z.string().nullable(),

  deviceType: z.enum(["desktop", "mobile", "tablet", "unknown"]).nullable(),

  ipAddress: z.string().nullable(),

  userAgent: z.string().nullable(),

  location: z
    .object({
      country: z.string().nullable(),
      region: z.string().nullable(),
      city: z.string().nullable(),
    })
    .nullable(),

  createdAt: z.string().datetime("Invalid creation date"),

  lastActivityAt: z.string().datetime("Invalid activity date"),

  isActive: z.boolean().default(true),
});

export type SessionMetadata = z.infer<typeof sessionMetadataSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate JWT token format (basic structure check)
 */
export const validateJWTFormat = (
  token: string
): { isValid: boolean; message?: string } => {
  if (!token) {
    return { isValid: false, message: "Token is required" };
  }

  // JWT should have 3 parts separated by dots
  const parts = token.split(".");
  if (parts.length !== 3) {
    return { isValid: false, message: "Invalid token format" };
  }

  // Check if parts are base64 encoded (basic check)
  try {
    parts.forEach((part) => {
      if (part.length === 0) {
        throw new Error("Empty token part");
      }
      // Try to decode base64 (with URL-safe characters)
      atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    });
  } catch {
    return { isValid: false, message: "Invalid token encoding" };
  }

  return { isValid: true };
};

/**
 * Validate session expiration
 */
export const validateSessionExpiration = (
  expiresAt: string
): {
  isValid: boolean;
  isExpired: boolean;
  expiresInMinutes: number;
} => {
  try {
    const expiration = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiration.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    return {
      isValid: !isNaN(expiration.getTime()),
      isExpired: diffMs <= 0,
      expiresInMinutes: Math.max(0, diffMinutes),
    };
  } catch {
    return {
      isValid: false,
      isExpired: true,
      expiresInMinutes: 0,
    };
  }
};

/**
 * Validate tenant access for user
 */
export const validateTenantAccess = (
  userTenants: string[],
  targetTenantId: string
): { hasAccess: boolean; message?: string } => {
  if (!targetTenantId) {
    return { hasAccess: false, message: "Tenant ID is required" };
  }

  if (!Array.isArray(userTenants)) {
    return { hasAccess: false, message: "Invalid user tenants data" };
  }

  if (!userTenants.includes(targetTenantId)) {
    return { hasAccess: false, message: "Access denied to this tenant" };
  }

  return { hasAccess: true };
};

// =============================================================================
// SESSION SECURITY VALIDATION
// =============================================================================

/**
 * Validate session security requirements
 */
export const validateSessionSecurity = (
  sessionData: {
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
  },
  requirements: {
    requireSameIP?: boolean;
    requireSameUserAgent?: boolean;
    requireSameDevice?: boolean;
  } = {}
): { isSecure: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  let isSecure = true;

  // IP address validation
  if (requirements.requireSameIP && !sessionData.ipAddress) {
    warnings.push("IP address verification required but not available");
    isSecure = false;
  }

  // User agent validation
  if (requirements.requireSameUserAgent && !sessionData.userAgent) {
    warnings.push("User agent verification required but not available");
    isSecure = false;
  }

  // Device fingerprint validation
  if (requirements.requireSameDevice && !sessionData.deviceFingerprint) {
    warnings.push("Device fingerprint verification required but not available");
    isSecure = false;
  }

  return { isSecure, warnings };
};

// =============================================================================
// FORM VALIDATION HELPERS
// =============================================================================

/**
 * Session form validation state
 */
export interface SessionFormValidationState {
  tenantId?: string;
  deviceName?: string;
  refreshToken?: string;
}

/**
 * Validate session form fields
 */
export const validateSessionFormField = (
  fieldName: keyof SessionFormValidationState,
  value: string
): string | null => {
  switch (fieldName) {
    case "tenantId":
      try {
        z.string().uuid().parse(value);
        return null;
      } catch {
        return "Invalid tenant ID format";
      }

    case "deviceName":
      try {
        z.string().min(1).max(100).parse(value);
        return null;
      } catch {
        return "Device name must be 1-100 characters";
      }

    case "refreshToken":
      const tokenValidation = validateJWTFormat(value);
      return tokenValidation.isValid
        ? null
        : tokenValidation.message || "Invalid token";

    default:
      return null;
  }
};

const SessionValidators = {
  // Schemas
  createSessionSchema,
  switchTenantSchema,
  refreshSessionSchema,
  registerDeviceSchema,
  sessionStateSchema,
  sessionMetadataSchema,

  // Validation helpers
  validateJWTFormat,
  validateSessionExpiration,
  validateTenantAccess,
  validateSessionSecurity,
  validateSessionFormField,
};

export default SessionValidators;
