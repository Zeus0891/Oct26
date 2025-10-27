/**
 * Identity Module Index
 * Main export point for the Identity module
 * Provides all identity functionality in a clean API
 */

// =============================================================================
// CORE EXPORTS
// =============================================================================

// Types
export * from "./types";

// Services
export * from "./services";

// Stores & Hooks
export * from "./stores";
export * from "./hooks";

// Validators - Main schemas and helpers
export {
  // Core schemas
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,

  // Profile schemas
  profileUpdateSchema,
  privacyPreferencesSchema,
  notificationPreferencesSchema,

  // MFA schemas
  mfaVerificationSchema,
  totpSetupSchema,

  // Session schemas
  createSessionSchema,
  switchTenantSchema,

  // Validation helpers
  validateEmail,
  validatePassword,
  getPasswordStrength,
  validateName,
  validateDisplayName,

  // Default validator modules
  IdentityValidators,
  SessionValidators,
  MFAValidators,
  PasswordValidators,
  ProfileValidators,
} from "./validators";

// Components
export * from "./components";

// Utils - Identity utility functions
export * from "./utils";
