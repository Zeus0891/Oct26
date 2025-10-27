/**
 * MFA (Multi-Factor Authentication) Utils
 * Utility functions for MFA operations and validation
 * Aligned with backend MFA architecture
 */

import { AuthFactorType } from "../types/mfa.types";

// Type alias for convenience
type MfaMethod = AuthFactorType;

// =============================================================================
// MFA VALIDATION UTILS
// =============================================================================

/**
 * Validate TOTP code format (6 digits)
 */
export const isValidTotpCode = (code: string): boolean => {
  if (!code || typeof code !== "string") return false;
  return /^\d{6}$/.test(code.trim());
};

/**
 * Validate SMS code format (6 digits)
 */
export const isValidSmsCode = (code: string): boolean => {
  return isValidTotpCode(code); // Same format as TOTP
};

/**
 * Validate email code format (6 digits)
 */
export const isValidEmailCode = (code: string): boolean => {
  return isValidTotpCode(code); // Same format as TOTP
};

/**
 * Validate backup code format (8 alphanumeric characters)
 */
export const isValidBackupCode = (code: string): boolean => {
  if (!code || typeof code !== "string") return false;
  return /^[A-Z0-9]{8}$/.test(code.trim().toUpperCase());
};

/**
 * Validate phone number for SMS MFA
 */
export const isValidMfaPhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== "string") return false;

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");

  // Check if it's a valid length (10-15 digits)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

/**
 * Format phone number for display
 */
export const formatPhoneNumberForDisplay = (phone: string): string => {
  if (!phone) return "";

  const digitsOnly = phone.replace(/\D/g, "");

  // US format: (XXX) XXX-XXXX
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }

  // International format: +X XXX XXX XXXX
  if (digitsOnly.length > 10) {
    const countryCode = digitsOnly.slice(0, -10);
    const number = digitsOnly.slice(-10);
    return `+${countryCode} ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
  }

  return phone;
};

/**
 * Normalize phone number for storage
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return "";

  const digitsOnly = phone.replace(/\D/g, "");

  // Add country code if missing (default to US: +1)
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }

  // Add + prefix if missing
  if (!phone.startsWith("+")) {
    return `+${digitsOnly}`;
  }

  return `+${digitsOnly}`;
};

// =============================================================================
// MFA METHOD UTILS
// =============================================================================

/**
 * Get display name for MFA method
 */
export const getMfaMethodDisplayName = (method: MfaMethod): string => {
  const displayNames: Record<MfaMethod, string> = {
    TOTP: "Authenticator App",
    SMS: "SMS Text Message",
    EMAIL: "Email Code",
    BACKUP_CODE: "Backup Codes",
    WEBAUTHN: "Security Key",
    HARDWARE_TOKEN: "Hardware Token",
  };

  return displayNames[method] || method;
};

/**
 * Get icon name for MFA method (for UI components)
 */
export const getMfaMethodIcon = (method: MfaMethod): string => {
  const icons: Record<MfaMethod, string> = {
    TOTP: "smartphone",
    SMS: "message-circle",
    EMAIL: "mail",
    BACKUP_CODE: "key",
    WEBAUTHN: "shield",
    HARDWARE_TOKEN: "usb",
  };

  return icons[method] || "lock";
};

/**
 * Get description for MFA method
 */
export const getMfaMethodDescription = (method: MfaMethod): string => {
  const descriptions: Record<MfaMethod, string> = {
    TOTP: "Use an authenticator app like Google Authenticator or Authy to generate time-based codes.",
    SMS: "Receive a verification code via text message to your registered phone number.",
    EMAIL:
      "Receive a verification code via email to your registered email address.",
    BACKUP_CODE:
      "Use a pre-generated backup code when other methods are unavailable.",
    WEBAUTHN:
      "Use a hardware security key or built-in biometric authentication.",
    HARDWARE_TOKEN: "Use a physical hardware token for authentication.",
  };

  return descriptions[method] || "Multi-factor authentication method.";
};

/**
 * Check if MFA method is primary (can be used as main method)
 */
export const isPrimaryMfaMethod = (method: MfaMethod): boolean => {
  return ["TOTP", "SMS", "EMAIL", "WEBAUTHN"].includes(method);
};

/**
 * Check if MFA method requires setup
 */
export const requiresMfaSetup = (method: MfaMethod): boolean => {
  return ["TOTP", "SMS", "EMAIL", "WEBAUTHN"].includes(method);
};

/**
 * Get recommended MFA methods in priority order
 */
export const getRecommendedMfaMethods = (): MfaMethod[] => {
  return ["TOTP", "WEBAUTHN", "SMS", "EMAIL", "BACKUP_CODE"];
};

// =============================================================================
// MFA SETUP UTILS
// =============================================================================

/**
 * Generate TOTP setup QR code URL
 */
export const generateTotpQrCodeUrl = (setupData: {
  type: "TOTP";
  totpSecret: string;
  userEmail?: string;
}): string => {
  if (setupData.type !== "TOTP" || !setupData.totpSecret) {
    throw new Error("Invalid TOTP setup data");
  }

  const issuer = "YourApp"; // Replace with your app name
  const accountName = setupData.userEmail || "user@example.com";
  const secret = setupData.totpSecret;

  return `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;
};

/**
 * Generate backup codes (8 codes, 8 characters each)
 */
export const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let i = 0; i < 8; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    codes.push(code);
  }

  return codes;
};

/**
 * Format backup codes for display
 */
export const formatBackupCodesForDisplay = (codes: string[]): string[] => {
  return codes.map((code) => code.replace(/(.{4})(.{4})/, "$1-$2"));
};

// Extended MFA setup data type for utility functions
interface ExtendedMfaSetupData {
  type: AuthFactorType;
  totpSecret?: string;
  phoneNumber?: string;
  email?: string;
  credentialId?: string;
  name?: string;
}

/**
 * Validate MFA setup data
 */
export const validateMfaSetupData = (
  setupData: ExtendedMfaSetupData
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!setupData.type) {
    errors.push("MFA method is required");
  }

  switch (setupData.type) {
    case "TOTP":
      if (!setupData.totpSecret) {
        errors.push("TOTP secret is required");
      }
      break;

    case "SMS":
      if (!setupData.phoneNumber) {
        errors.push("Phone number is required for SMS MFA");
      } else if (!isValidMfaPhoneNumber(setupData.phoneNumber)) {
        errors.push("Invalid phone number format");
      }
      break;

    case "EMAIL":
      if (!setupData.email) {
        errors.push("Email address is required for Email MFA");
      }
      break;

    case "WEBAUTHN":
      if (!setupData.credentialId) {
        errors.push("WebAuthn credential is required");
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// =============================================================================
// MFA VERIFICATION UTILS
// =============================================================================

// Extended MFA verification data type for utility functions
interface ExtendedMfaVerificationData {
  type: AuthFactorType;
  code: string;
}

/**
 * Validate MFA verification data
 */
export const validateMfaVerificationData = (
  verificationData: ExtendedMfaVerificationData
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!verificationData.type) {
    errors.push("MFA method is required");
  }

  if (!verificationData.code) {
    errors.push("Verification code is required");
  }

  switch (verificationData.type) {
    case "TOTP":
      if (!isValidTotpCode(verificationData.code)) {
        errors.push("Invalid TOTP code format (must be 6 digits)");
      }
      break;

    case "SMS":
      if (!isValidSmsCode(verificationData.code)) {
        errors.push("Invalid SMS code format (must be 6 digits)");
      }
      break;

    case "EMAIL":
      if (!isValidEmailCode(verificationData.code)) {
        errors.push("Invalid email code format (must be 6 digits)");
      }
      break;

    case "BACKUP_CODE":
      if (!isValidBackupCode(verificationData.code)) {
        errors.push(
          "Invalid backup code format (must be 8 alphanumeric characters)"
        );
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize MFA code input
 */
export const sanitizeMfaCode = (code: string, method: MfaMethod): string => {
  if (!code) return "";

  switch (method) {
    case "TOTP":
    case "SMS":
    case "EMAIL":
      // Remove all non-digits and limit to 6 characters
      return code.replace(/\D/g, "").slice(0, 6);

    case "BACKUP_CODE":
      // Remove spaces, hyphens, and convert to uppercase
      return code.replace(/[\s-]/g, "").toUpperCase().slice(0, 8);

    default:
      return code.trim();
  }
};

// =============================================================================
// MFA SECURITY UTILS
// =============================================================================

/**
 * Check if MFA method is secure
 */
export const isMfaMethodSecure = (method: MfaMethod): boolean => {
  const securityRanking: Record<MfaMethod, number> = {
    WEBAUTHN: 5, // Most secure
    TOTP: 4, // Very secure
    SMS: 2, // Moderate (SIM swapping risk)
    EMAIL: 2, // Moderate (email compromise risk)
    BACKUP_CODE: 1, // Least secure (should only be backup)
    HARDWARE_TOKEN: 4, // Very secure
  };

  return securityRanking[method] >= 3;
};

/**
 * Get MFA security score (0-100)
 */
export const getMfaSecurityScore = (enabledMethods: MfaMethod[]): number => {
  if (enabledMethods.length === 0) return 0;

  const methodScores: Record<MfaMethod, number> = {
    WEBAUTHN: 50,
    TOTP: 40,
    SMS: 20,
    EMAIL: 20,
    BACKUP_CODE: 10,
    HARDWARE_TOKEN: 45,
  };

  let totalScore = 0;
  const uniqueMethods = [...new Set(enabledMethods)];

  uniqueMethods.forEach((method) => {
    totalScore += methodScores[method] || 0;
  });

  // Bonus for multiple methods
  if (uniqueMethods.length >= 2) {
    totalScore += 15;
  }

  return Math.min(100, totalScore);
};

/**
 * Get MFA security recommendations
 */
export const getMfaSecurityRecommendations = (
  enabledMethods: MfaMethod[]
): string[] => {
  const recommendations: string[] = [];

  if (enabledMethods.length === 0) {
    recommendations.push(
      "Enable at least one MFA method to secure your account"
    );
    return recommendations;
  }

  if (
    !enabledMethods.includes("TOTP") &&
    !enabledMethods.includes("WEBAUTHN")
  ) {
    recommendations.push(
      "Consider using an authenticator app or security key for better security"
    );
  }

  if (enabledMethods.includes("SMS") && !enabledMethods.includes("TOTP")) {
    recommendations.push(
      "Add an authenticator app as SMS can be vulnerable to SIM swapping"
    );
  }

  if (enabledMethods.length === 1) {
    recommendations.push(
      "Enable a backup MFA method in case your primary method is unavailable"
    );
  }

  if (!enabledMethods.includes("BACKUP_CODE")) {
    recommendations.push("Generate backup codes for emergency access");
  }

  return recommendations;
};

/**
 * Format MFA code for user input display
 */
export const formatMfaCodeInput = (code: string, method: MfaMethod): string => {
  const sanitized = sanitizeMfaCode(code, method);

  switch (method) {
    case "TOTP":
    case "SMS":
    case "EMAIL":
      // Format as XXX XXX
      if (sanitized.length <= 3) {
        return sanitized;
      }
      return `${sanitized.slice(0, 3)} ${sanitized.slice(3)}`;

    case "BACKUP_CODE":
      // Format as XXXX-XXXX
      if (sanitized.length <= 4) {
        return sanitized;
      }
      return `${sanitized.slice(0, 4)}-${sanitized.slice(4)}`;

    default:
      return sanitized;
  }
};
