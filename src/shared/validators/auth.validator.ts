/**
 * =====================================================================
 *  ENTERPRISE AUTH VALIDATOR — Authentication & Security Validation
 * =====================================================================
 *  Purpose:
 *   Validates authentication-related data including login credentials,
 *   user registration, password policies, MFA tokens, and security
 *   requirements for the enterprise system.
 *
 *  Features:
 *   - Login credential validation
 *   - Password strength enforcement
 *   - MFA token validation
 *   - Account security checks
 *   - Token expiration validation
 *   - RBAC integration
 *
 *  Usage:
 *   Used by authentication controllers and middleware to validate
 *   all security-related operations and user credentials.
 * =====================================================================
 */

import { z, ZodSchema } from "zod";
import { BaseValidator } from "./base.validator";
import {
  ValidationResult,
  ValidationIssue,
  ValidationContext,
  ValidationFactory,
  ValidationSeverity,
} from "./validation.types";
import {
  isEmail,
  validatePasswordStrength,
  isUUID,
  isValidLength,
  isAlphanumericWithSpecial,
} from "./validation.utils";

/**
 * Authentication validation schemas.
 */
export class AuthSchemas {
  /**
   * Email validation for authentication.
   */
  static readonly email = z
    .string()
    .email("Must be a valid email address")
    .min(5, "Email must be at least 5 characters")
    .max(254, "Email must not exceed 254 characters")
    .refine(isEmail, { message: "Invalid email format" });

  /**
   * Password validation with strength requirements.
   */
  static readonly password = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .refine((password: string) => validatePasswordStrength(password).isValid, {
      message: "Password does not meet security requirements",
    });

  /**
   * Username validation.
   */
  static readonly username = z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .refine(
      (username) => isAlphanumericWithSpecial(username, ["-", "_", "."]),
      {
        message:
          "Username can only contain letters, numbers, hyphens, underscores, and dots",
      }
    );

  /**
   * MFA token validation.
   */
  static readonly mfaToken = z
    .string()
    .length(6, "MFA token must be exactly 6 digits")
    .regex(/^\d{6}$/, "MFA token must contain only digits");

  /**
   * JWT token validation.
   */
  static readonly jwtToken = z
    .string()
    .min(1, "Token is required")
    .regex(
      /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/,
      "Invalid JWT token format"
    );

  /**
   * Tenant code validation for authentication.
   */
  static readonly tenantCode = z
    .string()
    .min(3, "Tenant code must be at least 3 characters")
    .max(50, "Tenant code must not exceed 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Tenant code must be lowercase alphanumeric with hyphens only"
    );
}

/**
 * Login credentials validator.
 */
export class LoginCredentialsValidator extends BaseValidator<{
  email: string;
  password: string;
  tenantCode?: string;
  rememberMe?: boolean;
}> {
  schema = z.object({
    email: AuthSchemas.email,
    password: z.string().min(1, "Password is required"), // Don't validate strength on login
    tenantCode: AuthSchemas.tenantCode.optional(),
    rememberMe: z.boolean().optional().default(false),
  });

  /**
   * Validates login credentials with additional security checks.
   *
   * @param data - Login data
   * @param context - Validation context
   * @returns ValidationResult with security warnings
   */
  validateLogin(
    data: unknown,
    context?: ValidationContext
  ): ValidationResult<{
    email: string;
    password: string;
    tenantCode?: string;
    rememberMe?: boolean;
  }> {
    const result = this.validate(data, context);

    if (!result.success) {
      return result;
    }

    const warnings: ValidationIssue[] = [];
    const validatedData = result.data;

    // Add security warnings
    if (validatedData.rememberMe) {
      warnings.push({
        field: "rememberMe",
        message: "Extended session requested - ensure secure device",
        code: "EXTENDED_SESSION_WARNING",
        severity: "WARNING" as ValidationSeverity,
        context,
        meta: {
          securityLevel: "LOW_RISK",
        },
      });
    }

    // Check password strength even for login (informational)
    const passwordStrength = validatePasswordStrength(validatedData.password);
    if (!passwordStrength.isValid) {
      warnings.push({
        field: "password",
        message: "Password does not meet current security standards",
        code: "WEAK_PASSWORD_WARNING",
        severity: "WARNING" as ValidationSeverity,
        context,
        meta: {
          issues: passwordStrength.issues,
        },
      });
    }

    return ValidationFactory.success(
      validatedData,
      warnings.length > 0 ? warnings : undefined,
      context
    );
  }
}

/**
 * User registration validator.
 */
export class UserRegistrationValidator extends BaseValidator<{
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  tenantCode?: string;
  acceptTerms: boolean;
}> {
  schema = z
    .object({
      email: AuthSchemas.email,
      password: AuthSchemas.password,
      confirmPassword: z.string().min(1, "Password confirmation is required"),
      firstName: z
        .string()
        .min(1, "First name is required")
        .max(100, "First name too long"),
      lastName: z
        .string()
        .min(1, "Last name is required")
        .max(100, "Last name too long"),
      tenantCode: AuthSchemas.tenantCode.optional(),
      acceptTerms: z.boolean().refine((val) => val === true, {
        message: "Terms and conditions must be accepted",
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  /**
   * Validates user registration with enhanced checks.
   *
   * @param data - Registration data
   * @param context - Validation context
   * @returns ValidationResult with registration validation
   */
  validateRegistration(
    data: unknown,
    context?: ValidationContext
  ): ValidationResult<{
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    tenantCode?: string;
    acceptTerms: boolean;
  }> {
    const result = this.validate(data, context);

    if (!result.success) {
      return result;
    }

    const warnings: ValidationIssue[] = [];
    const validatedData = result.data;

    // Additional name validation
    if (validatedData.firstName.length < 2) {
      warnings.push({
        field: "firstName",
        message: "First name is very short",
        code: "SHORT_FIRST_NAME",
        severity: "WARNING" as ValidationSeverity,
        context,
      });
    }

    if (validatedData.lastName.length < 2) {
      warnings.push({
        field: "lastName",
        message: "Last name is very short",
        code: "SHORT_LAST_NAME",
        severity: "WARNING" as ValidationSeverity,
        context,
      });
    }

    return ValidationFactory.success(
      validatedData,
      warnings.length > 0 ? warnings : undefined,
      context
    );
  }
}

/**
 * MFA validation validator.
 */
export class MFAValidator extends BaseValidator<{
  token: string;
  type: "TOTP" | "SMS" | "EMAIL";
  userId: string;
}> {
  schema = z.object({
    token: AuthSchemas.mfaToken,
    type: z.enum(["TOTP", "SMS", "EMAIL"]),
    userId: z.string().uuid("Invalid user ID format"),
  });

  /**
   * Validates MFA token with type-specific checks.
   *
   * @param data - MFA data
   * @param context - Validation context
   * @returns ValidationResult with MFA validation
   */
  validateMFA(
    data: unknown,
    context?: ValidationContext
  ): ValidationResult<{
    token: string;
    type: "TOTP" | "SMS" | "EMAIL";
    userId: string;
  }> {
    const result = this.validate(data, context);

    if (!result.success) {
      return result;
    }

    const warnings: ValidationIssue[] = [];
    const validatedData = result.data;

    // Type-specific warnings
    if (validatedData.type === "SMS") {
      warnings.push({
        field: "type",
        message: "SMS MFA is less secure than TOTP - consider upgrading",
        code: "SMS_MFA_SECURITY_WARNING",
        severity: "WARNING" as ValidationSeverity,
        context,
        meta: {
          recommendedType: "TOTP",
        },
      });
    }

    if (validatedData.type === "EMAIL") {
      warnings.push({
        field: "type",
        message: "Email MFA is less secure than TOTP - consider upgrading",
        code: "EMAIL_MFA_SECURITY_WARNING",
        severity: "WARNING" as ValidationSeverity,
        context,
        meta: {
          recommendedType: "TOTP",
        },
      });
    }

    return ValidationFactory.success(
      validatedData,
      warnings.length > 0 ? warnings : undefined,
      context
    );
  }
}

/**
 * Password reset validator.
 */
export class PasswordResetValidator extends BaseValidator<{
  email: string;
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
}> {
  schema = z
    .object({
      email: AuthSchemas.email,
      token: z.string().optional(),
      newPassword: AuthSchemas.password.optional(),
      confirmPassword: z.string().optional(),
    })
    .refine(
      (data) => {
        // If password fields are provided, they must match
        if (data.newPassword && data.confirmPassword) {
          return data.newPassword === data.confirmPassword;
        }
        return true;
      },
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }
    )
    .refine(
      (data) => {
        // If token is provided, password fields are required
        if (data.token) {
          return data.newPassword && data.confirmPassword;
        }
        return true;
      },
      {
        message: "New password is required when using reset token",
        path: ["newPassword"],
      }
    );

  /**
   * Validates password reset request.
   *
   * @param data - Password reset data
   * @param context - Validation context
   * @returns ValidationResult with password reset validation
   */
  validatePasswordReset(
    data: unknown,
    context?: ValidationContext
  ): ValidationResult<{
    email: string;
    token?: string;
    newPassword?: string;
    confirmPassword?: string;
  }> {
    const result = this.validate(data, context);

    if (!result.success) {
      return result;
    }

    const warnings: ValidationIssue[] = [];
    const validatedData = result.data;

    // Security warning for password reset
    warnings.push({
      field: "email",
      message: "Password reset requested - verify this action was authorized",
      code: "PASSWORD_RESET_SECURITY_NOTICE",
      severity: "WARNING" as ValidationSeverity,
      context,
      meta: {
        securityAction: "PASSWORD_RESET",
        requiresVerification: true,
      },
    });

    return ValidationFactory.success(
      validatedData,
      warnings.length > 0 ? warnings : undefined,
      context
    );
  }
}

/**
 * Token validation validator.
 */
export class TokenValidator extends BaseValidator<{
  token: string;
  type: "ACCESS" | "REFRESH" | "RESET" | "VERIFICATION";
}> {
  schema = z.object({
    token: z.string().min(1, "Token is required"),
    type: z.enum(["ACCESS", "REFRESH", "RESET", "VERIFICATION"]),
  });

  /**
   * Validates token format and type.
   *
   * @param data - Token data
   * @param context - Validation context
   * @returns ValidationResult with token validation
   */
  validateToken(
    data: unknown,
    context?: ValidationContext
  ): ValidationResult<{
    token: string;
    type: "ACCESS" | "REFRESH" | "RESET" | "VERIFICATION";
  }> {
    const result = this.validate(data, context);

    if (!result.success) {
      return result;
    }

    const validatedData = result.data;
    const warnings: ValidationIssue[] = [];

    // Validate JWT format for ACCESS and REFRESH tokens
    if (["ACCESS", "REFRESH"].includes(validatedData.type)) {
      const jwtPattern = /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/;
      if (!jwtPattern.test(validatedData.token)) {
        return ValidationFactory.failure(
          [
            {
              field: "token",
              message: "Invalid JWT token format",
              code: "INVALID_JWT_FORMAT",
              severity: "ERROR" as ValidationSeverity,
              context,
            },
          ],
          context
        );
      }
    }

    // Validate UUID format for other token types
    if (["RESET", "VERIFICATION"].includes(validatedData.type)) {
      if (!isUUID(validatedData.token)) {
        return ValidationFactory.failure(
          [
            {
              field: "token",
              message: "Invalid token format - must be UUID",
              code: "INVALID_UUID_TOKEN",
              severity: "ERROR" as ValidationSeverity,
              context,
            },
          ],
          context
        );
      }
    }

    return ValidationFactory.success(
      validatedData,
      warnings.length > 0 ? warnings : undefined,
      context
    );
  }
}

/**
 * Session validation validator.
 */
export class SessionValidator extends BaseValidator<{
  sessionId: string;
  userId: string;
  tenantId: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
}> {
  schema = z.object({
    sessionId: z.string().uuid("Invalid session ID format"),
    userId: z.string().uuid("Invalid user ID format"),
    tenantId: z.string().uuid("Invalid tenant ID format"),
    expiresAt: z.string().datetime("Invalid expiration date"),
    ipAddress: z.string().optional(),
    userAgent: z.string().max(1000, "User agent too long").optional(),
  });

  /**
   * Validates session data with security checks.
   *
   * @param data - Session data
   * @param context - Validation context
   * @returns ValidationResult with session validation
   */
  validateSession(
    data: unknown,
    context?: ValidationContext
  ): ValidationResult<{
    sessionId: string;
    userId: string;
    tenantId: string;
    expiresAt: string;
    ipAddress?: string;
    userAgent?: string;
  }> {
    const result = this.validate(data, context);

    if (!result.success) {
      return result;
    }

    const validatedData = result.data;
    const warnings: ValidationIssue[] = [];
    const errors: ValidationIssue[] = [];

    // Check if session is expired
    const expirationDate = new Date(validatedData.expiresAt);
    const now = new Date();

    if (expirationDate <= now) {
      errors.push({
        field: "expiresAt",
        message: "Session has expired",
        code: "SESSION_EXPIRED",
        severity: "ERROR" as ValidationSeverity,
        context,
        meta: {
          expiresAt: validatedData.expiresAt,
          currentTime: now.toISOString(),
        },
      });
    } else {
      // Warn if session expires soon (within 15 minutes)
      const fifteenMinutes = 15 * 60 * 1000;
      if (expirationDate.getTime() - now.getTime() < fifteenMinutes) {
        warnings.push({
          field: "expiresAt",
          message: "Session expires soon",
          code: "SESSION_EXPIRING_SOON",
          severity: "WARNING" as ValidationSeverity,
          context,
          meta: {
            expiresAt: validatedData.expiresAt,
            minutesRemaining: Math.floor(
              (expirationDate.getTime() - now.getTime()) / 60000
            ),
          },
        });
      }
    }

    if (errors.length > 0) {
      return ValidationFactory.failure(errors, context);
    }

    return ValidationFactory.success(
      validatedData,
      warnings.length > 0 ? warnings : undefined,
      context
    );
  }
}
