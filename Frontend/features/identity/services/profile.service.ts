/**
 * Profile Service
 * API client for user profile management and preferences
 * Aligned with backend /api/identity/profile endpoints
 */

import api from "@/lib/api";

// =============================================================================
// PROFILE TYPES
// =============================================================================

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  timezone?: string;
  locale?: string;
  bio?: string;
  website?: string;
  location?: {
    country?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileComplete: boolean;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  timezone?: string;
  locale?: string;
  bio?: string;
  website?: string;
  location?: {
    country?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: "light" | "dark" | "auto";
  language: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  currency: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  dashboard: DashboardSettings;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  email: {
    marketing: boolean;
    security: boolean;
    updates: boolean;
    reminders: boolean;
    digest: "daily" | "weekly" | "monthly" | "never";
  };
  push: {
    enabled: boolean;
    security: boolean;
    updates: boolean;
    reminders: boolean;
    mentions: boolean;
  };
  sms: {
    enabled: boolean;
    security: boolean;
    critical: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: "public" | "private" | "contacts";
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowSearchEngineIndexing: boolean;
  dataRetention: "minimal" | "standard" | "extended";
  cookieConsent: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
}

export interface DashboardSettings {
  layout: "grid" | "list" | "cards";
  density: "comfortable" | "compact" | "spacious";
  widgets: Array<{
    id: string;
    type: string;
    position: { x: number; y: number; w: number; h: number };
    visible: boolean;
    settings: Record<string, unknown>;
  }>;
  shortcuts: Array<{
    id: string;
    label: string;
    url: string;
    icon?: string;
    order: number;
  }>;
}

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
  avatarUrl: string;
  thumbnailUrl: string;
  uploadId: string;
}

export interface UserSecuritySettings {
  id: string;
  userId: string;
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  deviceTracking: boolean;
  sessionTimeout: number;
  passwordExpiryDays?: number;
  allowedLoginMethods: Array<"password" | "sso" | "magic_link">;
  ipWhitelist: string[];
  trustedDevicesOnly: boolean;
  requireMfaForSensitiveActions: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SecuritySettingsUpdateRequest {
  loginNotifications?: boolean;
  deviceTracking?: boolean;
  sessionTimeout?: number;
  passwordExpiryDays?: number;
  allowedLoginMethods?: Array<"password" | "sso" | "magic_link">;
  ipWhitelist?: string[];
  trustedDevicesOnly?: boolean;
  requireMfaForSensitiveActions?: boolean;
}

export interface LoginHistory {
  id: string;
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo: {
    deviceId: string;
    deviceName: string;
    platform: string;
    isMobile: boolean;
  };
  location?: {
    country: string;
    city: string;
    region: string;
  };
  loginMethod: "password" | "sso" | "magic_link" | "mfa";
  success: boolean;
  failureReason?: string;
  createdAt: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: unknown;
}

// =============================================================================
// PROFILE SERVICE CLASS
// =============================================================================

class ProfileService {
  private readonly baseUrl = "/api/identity/profile";

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await api.get<UserProfile>(this.baseUrl);

      return {
        success: true,
        data: response.data,
        message: "Profile retrieved successfully",
      };
    } catch (error) {
      console.error("Failed to get profile:", error);
      return {
        success: false,
        data: {} as UserProfile,
        message: "Failed to retrieve profile",
        error,
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    profileData: ProfileUpdateRequest
  ): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await api.put<UserProfile>(this.baseUrl, profileData);

      return {
        success: true,
        data: response.data,
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Failed to update profile:", error);
      return {
        success: false,
        data: {} as UserProfile,
        message: "Failed to update profile",
        error,
      };
    }
  }

  /**
   * Upload profile avatar
   */
  async uploadAvatar(
    uploadData: AvatarUploadRequest
  ): Promise<ApiResponse<AvatarUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append("avatar", uploadData.file);

      if (uploadData.cropData) {
        formData.append("cropData", JSON.stringify(uploadData.cropData));
      }

      const response = await api.post<AvatarUploadResponse>(
        `${this.baseUrl}/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Avatar uploaded successfully",
      };
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      return {
        success: false,
        data: {} as AvatarUploadResponse,
        message: "Failed to upload avatar",
        error,
      };
    }
  }

  /**
   * Remove profile avatar
   */
  async removeAvatar(): Promise<ApiResponse<null>> {
    try {
      await api.delete(`${this.baseUrl}/avatar`);

      return {
        success: true,
        data: null,
        message: "Avatar removed successfully",
      };
    } catch (error) {
      console.error("Failed to remove avatar:", error);
      return {
        success: false,
        data: null,
        message: "Failed to remove avatar",
        error,
      };
    }
  }

  // =============================================================================
  // PREFERENCES MANAGEMENT
  // =============================================================================

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await api.get<UserPreferences>(
        `${this.baseUrl}/preferences`
      );

      return {
        success: true,
        data: response.data,
        message: "Preferences retrieved successfully",
      };
    } catch (error) {
      console.error("Failed to get preferences:", error);
      return {
        success: false,
        data: {} as UserPreferences,
        message: "Failed to retrieve preferences",
        error,
      };
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    preferences: Partial<UserPreferences>
  ): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await api.put<UserPreferences>(
        `${this.baseUrl}/preferences`,
        preferences
      );

      return {
        success: true,
        data: response.data,
        message: "Preferences updated successfully",
      };
    } catch (error) {
      console.error("Failed to update preferences:", error);
      return {
        success: false,
        data: {} as UserPreferences,
        message: "Failed to update preferences",
        error,
      };
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    notifications: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> {
    try {
      const response = await api.put<NotificationPreferences>(
        `${this.baseUrl}/preferences/notifications`,
        notifications
      );

      return {
        success: true,
        data: response.data,
        message: "Notification preferences updated successfully",
      };
    } catch (error) {
      console.error("Failed to update notification preferences:", error);
      return {
        success: false,
        data: {} as NotificationPreferences,
        message: "Failed to update notification preferences",
        error,
      };
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    privacy: Partial<PrivacySettings>
  ): Promise<ApiResponse<PrivacySettings>> {
    try {
      const response = await api.put<PrivacySettings>(
        `${this.baseUrl}/preferences/privacy`,
        privacy
      );

      return {
        success: true,
        data: response.data,
        message: "Privacy settings updated successfully",
      };
    } catch (error) {
      console.error("Failed to update privacy settings:", error);
      return {
        success: false,
        data: {} as PrivacySettings,
        message: "Failed to update privacy settings",
        error,
      };
    }
  }

  // =============================================================================
  // SECURITY SETTINGS
  // =============================================================================

  /**
   * Get security settings
   */
  async getSecuritySettings(): Promise<ApiResponse<UserSecuritySettings>> {
    try {
      const response = await api.get<UserSecuritySettings>(
        `${this.baseUrl}/security`
      );

      return {
        success: true,
        data: response.data,
        message: "Security settings retrieved successfully",
      };
    } catch (error) {
      console.error("Failed to get security settings:", error);
      return {
        success: false,
        data: {} as UserSecuritySettings,
        message: "Failed to retrieve security settings",
        error,
      };
    }
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(
    settings: SecuritySettingsUpdateRequest
  ): Promise<ApiResponse<UserSecuritySettings>> {
    try {
      const response = await api.put<UserSecuritySettings>(
        `${this.baseUrl}/security`,
        settings
      );

      return {
        success: true,
        data: response.data,
        message: "Security settings updated successfully",
      };
    } catch (error) {
      console.error("Failed to update security settings:", error);
      return {
        success: false,
        data: {} as UserSecuritySettings,
        message: "Failed to update security settings",
        error,
      };
    }
  }

  /**
   * Get login history
   */
  async getLoginHistory(
    limit = 50,
    offset = 0
  ): Promise<
    ApiResponse<{
      history: LoginHistory[];
      total: number;
      hasMore: boolean;
    }>
  > {
    try {
      const response = await api.get<{
        history: LoginHistory[];
        total: number;
        hasMore: boolean;
      }>(`${this.baseUrl}/login-history`, {
        params: { limit, offset },
      });

      return {
        success: true,
        data: response.data,
        message: "Login history retrieved successfully",
      };
    } catch (error) {
      console.error("Failed to get login history:", error);
      return {
        success: false,
        data: { history: [], total: 0, hasMore: false },
        message: "Failed to retrieve login history",
        error,
      };
    }
  }

  // =============================================================================
  // EMAIL & PHONE VERIFICATION
  // =============================================================================

  /**
   * Request email verification
   */
  async requestEmailVerification(): Promise<
    ApiResponse<{ sent: boolean; expiresAt: string }>
  > {
    try {
      const response = await api.post<{ sent: boolean; expiresAt: string }>(
        `${this.baseUrl}/verify-email`
      );

      return {
        success: true,
        data: response.data,
        message: "Verification email sent successfully",
      };
    } catch (error) {
      console.error("Failed to request email verification:", error);
      return {
        success: false,
        data: { sent: false, expiresAt: "" },
        message: "Failed to send verification email",
        error,
      };
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(
    token: string
  ): Promise<ApiResponse<{ verified: boolean }>> {
    try {
      const response = await api.post<{ verified: boolean }>(
        `${this.baseUrl}/verify-email/confirm`,
        {
          token,
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Email verified successfully",
      };
    } catch (error) {
      console.error("Failed to verify email:", error);
      return {
        success: false,
        data: { verified: false },
        message: "Failed to verify email",
        error,
      };
    }
  }

  /**
   * Request phone verification
   */
  async requestPhoneVerification(
    phoneNumber: string
  ): Promise<ApiResponse<{ sent: boolean; expiresAt: string }>> {
    try {
      const response = await api.post<{ sent: boolean; expiresAt: string }>(
        `${this.baseUrl}/verify-phone`,
        { phoneNumber }
      );

      return {
        success: true,
        data: response.data,
        message: "Verification SMS sent successfully",
      };
    } catch (error) {
      console.error("Failed to request phone verification:", error);
      return {
        success: false,
        data: { sent: false, expiresAt: "" },
        message: "Failed to send verification SMS",
        error,
      };
    }
  }

  /**
   * Verify phone with code
   */
  async verifyPhone(
    phoneNumber: string,
    verificationCode: string
  ): Promise<ApiResponse<{ verified: boolean }>> {
    try {
      const response = await api.post<{ verified: boolean }>(
        `${this.baseUrl}/verify-phone/confirm`,
        {
          phoneNumber,
          verificationCode,
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Phone verified successfully",
      };
    } catch (error) {
      console.error("Failed to verify phone:", error);
      return {
        success: false,
        data: { verified: false },
        message: "Failed to verify phone",
        error,
      };
    }
  }

  // =============================================================================
  // ACCOUNT MANAGEMENT
  // =============================================================================

  /**
   * Request account deletion
   */
  async requestAccountDeletion(
    reason?: string,
    feedback?: string
  ): Promise<ApiResponse<{ requestId: string; scheduledFor: string }>> {
    try {
      const response = await api.post<{
        requestId: string;
        scheduledFor: string;
      }>(`${this.baseUrl}/delete-account`, { reason, feedback });

      return {
        success: true,
        data: response.data,
        message: "Account deletion scheduled successfully",
      };
    } catch (error) {
      console.error("Failed to request account deletion:", error);
      return {
        success: false,
        data: { requestId: "", scheduledFor: "" },
        message: "Failed to schedule account deletion",
        error,
      };
    }
  }

  /**
   * Cancel account deletion
   */
  async cancelAccountDeletion(): Promise<ApiResponse<{ cancelled: boolean }>> {
    try {
      const response = await api.post<{ cancelled: boolean }>(
        `${this.baseUrl}/cancel-deletion`
      );

      return {
        success: true,
        data: response.data,
        message: "Account deletion cancelled successfully",
      };
    } catch (error) {
      console.error("Failed to cancel account deletion:", error);
      return {
        success: false,
        data: { cancelled: false },
        message: "Failed to cancel account deletion",
        error,
      };
    }
  }

  /**
   * Export user data
   */
  async exportUserData(
    format: "json" | "csv" = "json"
  ): Promise<
    ApiResponse<{ exportId: string; downloadUrl?: string; status: string }>
  > {
    try {
      const response = await api.post<{
        exportId: string;
        downloadUrl?: string;
        status: string;
      }>(`${this.baseUrl}/export-data`, { format });

      return {
        success: true,
        data: response.data,
        message: "Data export initiated successfully",
      };
    } catch (error) {
      console.error("Failed to export user data:", error);
      return {
        success: false,
        data: { exportId: "", status: "failed" },
        message: "Failed to initiate data export",
        error,
      };
    }
  }

  // =============================================================================
  // PROFILE COMPLETION & VALIDATION
  // =============================================================================

  /**
   * Get profile completion status
   */
  async getProfileCompletion(): Promise<
    ApiResponse<{
      completionPercentage: number;
      missingFields: string[];
      recommendations: string[];
    }>
  > {
    try {
      const response = await api.get<{
        completionPercentage: number;
        missingFields: string[];
        recommendations: string[];
      }>(`${this.baseUrl}/completion`);

      return {
        success: true,
        data: response.data,
        message: "Profile completion status retrieved",
      };
    } catch (error) {
      console.error("Failed to get profile completion:", error);
      return {
        success: false,
        data: {
          completionPercentage: 0,
          missingFields: [],
          recommendations: [],
        },
        message: "Failed to retrieve profile completion status",
        error,
      };
    }
  }

  /**
   * Validate profile data
   */
  async validateProfileData(
    profileData: Partial<ProfileUpdateRequest>
  ): Promise<
    ApiResponse<{
      isValid: boolean;
      errors: Array<{ field: string; message: string }>;
    }>
  > {
    try {
      const response = await api.post<{
        isValid: boolean;
        errors: Array<{ field: string; message: string }>;
      }>(`${this.baseUrl}/validate`, profileData);

      return {
        success: true,
        data: response.data,
        message: "Profile data validated",
      };
    } catch (error) {
      console.error("Failed to validate profile data:", error);
      return {
        success: false,
        data: {
          isValid: false,
          errors: [{ field: "general", message: "Validation failed" }],
        },
        message: "Failed to validate profile data",
        error,
      };
    }
  }
}

// Export singleton instance and class
export const profileService = new ProfileService();
export default profileService;

// Export error class for specific error handling
export class ProfileServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ProfileServiceError";
  }
}
