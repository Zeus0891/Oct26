/**
 * Identity Utils Index
 * Centralized exports for all identity utility functions
 */

// Session utilities
export {
  isSessionExpired,
  shouldRefreshSession,
  getSessionRemainingTime,
  formatSessionRemainingTime,
  createSessionFromLogin,
  updateSessionTokens,
  markSessionMfaVerified,
  cleanExpiredSessions,
  sortSessionsByLastAccessed,
  findActiveSession,
  isSessionSuspicious,
  createDeviceInfo,
  getBrowserInfo,
  storeSessionSafely,
  retrieveStoredSession,
  clearStoredSession,
  isValidSessionData,
  requiresMfaVerification,
  getSessionDisplayInfo,
} from "./session.utils";

// Token utilities
export * from "./token.utils";

// MFA utilities
export {
  isValidTotpCode,
  isValidSmsCode,
  isValidEmailCode,
  isValidBackupCode,
  isValidMfaPhoneNumber,
  formatPhoneNumberForDisplay,
  normalizePhoneNumber,
  getMfaMethodDisplayName,
  getMfaMethodIcon,
  getMfaMethodDescription,
  isPrimaryMfaMethod,
  requiresMfaSetup,
  getRecommendedMfaMethods,
  generateTotpQrCodeUrl,
  generateBackupCodes,
  formatBackupCodesForDisplay,
  validateMfaSetupData,
  validateMfaVerificationData,
  sanitizeMfaCode,
  isMfaMethodSecure,
  getMfaSecurityScore,
  getMfaSecurityRecommendations,
  formatMfaCodeInput,
} from "./mfa.utils";

// Device utilities (with prefix to avoid conflicts)
export {
  getCurrentDeviceInfo,
  generateDeviceFingerprint as generateDeviceId,
  getDeviceName,
  getBrowserName,
  isMobileDevice,
  isTabletDevice,
  isDesktopDevice,
  getDeviceType,
  supportsWebAuthn,
  supportsBiometrics,
  supportsPushNotifications,
  supportsGeolocation,
  supportsCamera,
  getDeviceCapabilities,
  isDeviceTrusted,
  calculateDeviceTrustScore,
  getDeviceSecurityRecommendations,
  areDevicesSame,
  hasDeviceChanged,
  getDeviceChangeSummary,
  formatDeviceForDisplay,
  formatLastSeen,
  needsSecurityReview,
  generateDeviceRegistrationData,
} from "./device.utils";
