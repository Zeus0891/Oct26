/**
 * Identity Validators Index
 * Centralized exports for all identity validators
 * Provides comprehensive validation for the Identity module
 */

// =============================================================================
// MAIN VALIDATOR EXPORTS
// =============================================================================

// Identity validators (login, registration, email verification)
export {
  // Schemas
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  emailVerificationSchema,
  resendVerificationSchema,

  // Validation helpers
  validateEmail,
  validatePassword,
  getPasswordStrength,
  validateFormData,
  validateField,

  // Form state helpers
  createInitialValidationState,
  updateValidationState,

  // Types
  type LoginFormData,
  type RegisterFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
  type ChangePasswordFormData,
  type EmailVerificationData,
  type ResendVerificationData,
  type FormValidationState,
} from "./identity.validators";

// Session validators
export {
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

  // Types
  type CreateSessionData,
  type SwitchTenantData,
  type RefreshSessionData,
  type RegisterDeviceData,
  type SessionState,
  type SessionMetadata,
  type SessionFormValidationState,
} from "./session.validators";

// MFA validators
export {
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

  // Types
  type TOTPSetupData,
  type SMSSetupData,
  type EmailMFASetupData,
  type MFAVerificationData,
  type BackupCodeData,
  type DisableMFAData,
  type RegenerateBackupCodesData,
  type MFAPreferencesData,
  type MFAFormValidationState,
} from "./mfa.validators";

// Password validators
export {
  // Schemas
  passwordSchema,
  passwordWithConfirmationSchema,
  changePasswordSchema as passwordChangeSchema,
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
  validatePasswordFormField,

  // Types
  type PasswordPolicy,
  type PasswordWithConfirmationData,
  type ChangePasswordData,
  type AdminPasswordResetData,
  type PasswordRecoveryRequestData,
  type PasswordRecoveryData,
  type PasswordStrengthResult,
  type PasswordFormValidationState,
} from "./password.validators";

// Profile validators
export {
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

  // Types
  type ProfileUpdateData,
  type AvatarUploadData,
  type PrivacyPreferencesData,
  type NotificationPreferencesData,
  type AccountDeactivationData,
  type ProfileFormValidationState,
} from "./profile.validators";

// =============================================================================
// CONVENIENCE RE-EXPORTS (Already exported above)
// =============================================================================

// =============================================================================
// DEFAULT EXPORTS
// =============================================================================

export { default as IdentityValidators } from "./identity.validators";
export { default as SessionValidators } from "./session.validators";
export { default as MFAValidators } from "./mfa.validators";
export { default as PasswordValidators } from "./password.validators";
export { default as ProfileValidators } from "./profile.validators";
