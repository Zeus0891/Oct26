/**
 * Device Types
 * Device registration and management types
 * Aligned with backend UserDevice model
 */

// =============================================================================
// DEVICE CORE TYPES
// =============================================================================

export interface UserDevice {
  id: string;
  userId: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  fingerprint: string;
  userAgent: string;
  ipAddress?: string;
  lastUsedAt?: Date | string;
  isTrusted: boolean;
  location?: DeviceLocation;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type DeviceType =
  | "MOBILE"
  | "DESKTOP"
  | "TABLET"
  | "BROWSER"
  | "API_CLIENT";

export type DeviceStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "COMPROMISED"
  | "REVOKED"
  | "PENDING_VERIFICATION";

export interface DeviceLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// =============================================================================
// DEVICE REGISTRATION TYPES
// =============================================================================

export interface DeviceRegistrationRequest {
  name: string;
  type: DeviceType;
  fingerprint?: string;
  userAgent: string;
  location?: DeviceLocation;
  trustDevice?: boolean;
}

export interface DeviceRegistrationResponse {
  success: boolean;
  data: {
    device: UserDevice;
    verificationRequired: boolean;
    verificationMethod?: "EMAIL" | "SMS" | "MFA";
  };
  message: string;
}

export interface DeviceVerificationRequest {
  deviceId: string;
  verificationCode: string;
}

export interface DeviceVerificationResponse {
  success: boolean;
  data: {
    device: UserDevice;
    isVerified: boolean;
  };
  message: string;
}

// =============================================================================
// DEVICE MANAGEMENT TYPES
// =============================================================================

export interface DeviceListResponse {
  success: boolean;
  data: {
    devices: UserDevice[];
    currentDevice?: UserDevice;
    totalCount: number;
  };
  message: string;
}

export interface DeviceUpdateRequest {
  deviceId: string;
  name?: string;
  status?: DeviceStatus;
  isTrusted?: boolean;
}

export interface DeviceRevocationRequest {
  deviceId?: string; // If not provided, revokes current device
  reason?: string;
}

// =============================================================================
// DEVICE FINGERPRINTING TYPES
// =============================================================================

export interface DeviceFingerprint {
  userAgent: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  canvas?: string; // Canvas fingerprint hash
  webgl?: string; // WebGL fingerprint hash
}

export interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  device: string;
  isBot: boolean;
}

// =============================================================================
// DEVICE HOOKS TYPES
// =============================================================================

export interface UseDevicesReturn {
  // State
  devices: UserDevice[];
  currentDevice: UserDevice | null;
  isLoading: boolean;
  registrationInProgress: boolean;
  error: string | null;

  // Actions
  registerDevice: (
    request: DeviceRegistrationRequest
  ) => Promise<DeviceRegistrationResponse>;
  verifyDevice: (request: DeviceVerificationRequest) => Promise<boolean>;
  getDevices: () => Promise<UserDevice[]>;
  updateDevice: (request: DeviceUpdateRequest) => Promise<UserDevice>;
  revokeDevice: (request: DeviceRevocationRequest) => Promise<void>;
  trustDevice: (deviceId: string) => Promise<void>;
  untrustDevice: (deviceId: string) => Promise<void>;
  getCurrentDevice: () => UserDevice | null;
  generateFingerprint: () => DeviceFingerprint;
  clearError: () => void;
}

// =============================================================================
// DEVICE SECURITY TYPES
// =============================================================================

export interface DeviceSecurityEvent {
  type: DeviceSecurityEventType;
  deviceId: string;
  timestamp: Date | string;
  details: Record<string, unknown>;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export type DeviceSecurityEventType =
  | "NEW_DEVICE_LOGIN"
  | "SUSPICIOUS_LOCATION"
  | "FINGERPRINT_MISMATCH"
  | "DEVICE_COMPROMISED"
  | "MULTIPLE_FAILED_ATTEMPTS";

export interface DeviceRiskFactor {
  type: string;
  weight: number;
  description: string;
}

export interface DeviceRiskAssessment {
  deviceId: string;
  riskScore: number; // 0-100
  factors: DeviceRiskFactor[];
  recommendation: "ALLOW" | "CHALLENGE" | "BLOCK";
}
