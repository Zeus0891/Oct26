/**
 * Identity Types Index
 * Centralized export for all identity-related types
 */

// Core Identity Types
export * from "./identity.types";
export type { AuthUser, IdentityDeviceInfo } from "./identity.types";
export * from "./session.types";
export * from "./mfa.types";
export * from "./device.types";

// Profile types - selective exports to avoid UserProfile conflict
export type {
  ProfileUpdateRequest,
  ProfileUpdateResponse,
  PasswordChangeRequest,
  PasswordChangeResponse,
  UseProfileReturn,
  UserPreferences,
  NotificationPreferences,
  PrivacySettings,
  UserSecuritySettings,
  AvatarUploadRequest,
  AvatarUploadResponse,
  EmailVerificationRequest,
  PhoneVerificationRequest,
} from "./profile.types";
