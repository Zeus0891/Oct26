/**
 * Profile Types
 * User profile management types
 * Aligned with backend User model and profile endpoints
 */

// =============================================================================
// PROFILE CORE TYPES
// =============================================================================

export interface UserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  phoneVerified: boolean;
  dateOfBirth?: Date | string;
  timezone?: string;
  locale?: string;
  lastLoginAt?: Date | string;
  status: UserStatus;
  preferences: UserPreferences;
  security: UserSecuritySettings;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "PENDING_VERIFICATION";

export interface UserPreferences {
  language: string;
  theme: "light" | "dark" | "system";
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  security: boolean;
}

export interface PrivacySettings {
  profileVisibility: "public" | "private" | "contacts";
  showOnlineStatus: boolean;
  allowDataCollection: boolean;
}

export interface UserSecuritySettings {
  mfaEnabled: boolean;
  trustedDevicesCount: number;
  lastPasswordChange?: Date | string;
  passwordStrength: "weak" | "medium" | "strong";
  sessionTimeout: number; // minutes
}

// =============================================================================
// PROFILE UPDATE TYPES
// =============================================================================

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  timezone?: string;
  locale?: string;
  preferences?: Partial<UserPreferences>;
}

export interface ProfileUpdateResponse {
  success: boolean;
  data: {
    user: UserProfile;
    changes: ProfileChange[];
  };
  message: string;
}

export interface ProfileChange {
  field: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Date | string;
}

// =============================================================================
// AVATAR MANAGEMENT TYPES
// =============================================================================

export interface AvatarUploadRequest {
  file: File;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AvatarUploadResponse {
  success: boolean;
  data: {
    avatarUrl: string;
    thumbnailUrl?: string;
    uploadId: string;
  };
  message: string;
}

// =============================================================================
// PASSWORD MANAGEMENT TYPES
// =============================================================================

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  data: {
    passwordChanged: boolean;
    strength: PasswordStrength;
    mustLogoutOtherSessions: boolean;
  };
  message: string;
}

export interface PasswordStrength {
  score: number; // 0-4
  level: "weak" | "fair" | "good" | "strong" | "very_strong";
  feedback: string[];
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  rule: string;
  satisfied: boolean;
  description: string;
}

// =============================================================================
// EMAIL VERIFICATION TYPES
// =============================================================================

export interface EmailVerificationRequest {
  email?: string; // If changing email
}

export interface EmailVerificationResponse {
  success: boolean;
  data: {
    verificationSent: boolean;
    email: string;
    expiresAt: string;
  };
  message: string;
}

export interface EmailVerificationConfirmRequest {
  token: string;
}

// =============================================================================
// PHONE VERIFICATION TYPES
// =============================================================================

export interface PhoneVerificationRequest {
  phoneNumber: string;
  method: "SMS" | "VOICE";
}

export interface PhoneVerificationResponse {
  success: boolean;
  data: {
    verificationSent: boolean;
    phoneNumber: string;
    maskedNumber: string; // e.g., "***-***-1234"
    expiresAt: string;
  };
  message: string;
}

export interface PhoneVerificationConfirmRequest {
  phoneNumber: string;
  code: string;
}

// =============================================================================
// PROFILE HOOKS TYPES
// =============================================================================

export interface UseProfileReturn {
  // State
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;

  // Actions
  updateProfile: (updates: ProfileUpdateRequest) => Promise<UserProfile>;
  changePassword: (request: PasswordChangeRequest) => Promise<boolean>;
  uploadAvatar: (request: AvatarUploadRequest) => Promise<string>;
  deleteAvatar: () => Promise<void>;
  sendEmailVerification: (email?: string) => Promise<void>;
  confirmEmailVerification: (token: string) => Promise<boolean>;
  sendPhoneVerification: (request: PhoneVerificationRequest) => Promise<void>;
  confirmPhoneVerification: (
    request: PhoneVerificationConfirmRequest
  ) => Promise<boolean>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

// =============================================================================
// PROFILE VALIDATION TYPES
// =============================================================================

export interface ProfileValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface ProfileCompleteness {
  percentage: number;
  missingFields: string[];
  recommendations: string[];
}
