/**
 * Device Service
 * API client for device management and registration
 * Aligned with backend /api/identity/devices endpoints
 */

import api from "@/lib/api";
// DeviceInfo type imported via utils
import {
  getCurrentDeviceInfo,
  calculateDeviceTrustScore,
  formatDeviceForDisplay,
} from "../utils/device.utils";

// =============================================================================
// DEVICE TYPES
// =============================================================================

export interface DeviceRegistration {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  userAgent: string;
  platform: string;
  ipAddress: string;
  isMobile: boolean;
  isVerified: boolean;
  isTrusted: boolean;
  trustScore: number;
  lastSeen: string;
  registeredAt: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  capabilities: {
    webauthn: boolean;
    biometrics: boolean;
    pushNotifications: boolean;
    geolocation: boolean;
  };
}

export interface DeviceRegistrationRequest {
  deviceName?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  capabilities?: Record<string, boolean>;
  requestVerification?: boolean;
}

export interface DeviceUpdateRequest {
  deviceId: string;
  deviceName?: string;
  isTrusted?: boolean;
  settings?: {
    pushNotifications?: boolean;
    locationTracking?: boolean;
    sessionTimeout?: number;
  };
}

export interface DeviceVerificationRequest {
  deviceId: string;
  verificationCode?: string;
  verificationMethod: "SMS" | "EMAIL" | "PUSH";
}

export interface DeviceStats {
  totalDevices: number;
  verifiedDevices: number;
  trustedDevices: number;
  mobileDevices: number;
  desktopDevices: number;
  lastActiveDevice: DeviceRegistration;
  devicesByPlatform: Array<{
    platform: string;
    count: number;
  }>;
  securityAlerts: Array<{
    deviceId: string;
    alertType: "NEW_DEVICE" | "SUSPICIOUS_LOGIN" | "LOCATION_CHANGE";
    createdAt: string;
  }>;
}

// =============================================================================
// DEVICE API RESPONSE TYPES
// =============================================================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: unknown;
}

// =============================================================================
// DEVICE SERVICE CLASS
// =============================================================================

class DeviceService {
  private readonly baseUrl = "/api/identity/devices";

  /**
   * Get all registered devices for current user
   */
  async getRegisteredDevices(): Promise<ApiResponse<DeviceRegistration[]>> {
    try {
      const response = await api.get<DeviceRegistration[]>(this.baseUrl);

      return {
        success: true,
        data: response.data,
        message: "Devices retrieved successfully",
      };
    } catch (error) {
      console.error("Failed to get devices:", error);
      return {
        success: false,
        data: [],
        message: "Failed to retrieve devices",
        error,
      };
    }
  }

  /**
   * Get device by ID
   */
  async getDeviceById(
    deviceId: string
  ): Promise<ApiResponse<DeviceRegistration | null>> {
    try {
      const response = await api.get<DeviceRegistration>(
        `${this.baseUrl}/${deviceId}`
      );

      return {
        success: true,
        data: response.data,
        message: "Device retrieved successfully",
      };
    } catch (error) {
      console.error("Failed to get device:", error);
      return {
        success: false,
        data: null,
        message: "Failed to retrieve device",
        error,
      };
    }
  }

  /**
   * Register current device
   */
  async registerDevice(
    registrationData?: DeviceRegistrationRequest
  ): Promise<ApiResponse<DeviceRegistration>> {
    try {
      const currentDevice = getCurrentDeviceInfo();

      const requestData = {
        deviceId: currentDevice.deviceId,
        deviceName: registrationData?.deviceName || currentDevice.deviceName,
        userAgent: currentDevice.userAgent,
        platform: currentDevice.platform,
        isMobile: currentDevice.isMobile,
        trustScore: calculateDeviceTrustScore(currentDevice),
        location: registrationData?.location,
        capabilities: registrationData?.capabilities || {
          webauthn: !!(navigator.credentials && window.PublicKeyCredential),
          biometrics:
            !!window.PublicKeyCredential
              ?.isUserVerifyingPlatformAuthenticatorAvailable,
          pushNotifications:
            "Notification" in window && "serviceWorker" in navigator,
          geolocation: "geolocation" in navigator,
        },
        requestVerification: registrationData?.requestVerification || false,
      };

      const response = await api.post<DeviceRegistration>(
        this.baseUrl,
        requestData
      );

      return {
        success: true,
        data: response.data,
        message: "Device registered successfully",
      };
    } catch (error) {
      console.error("Failed to register device:", error);
      return {
        success: false,
        data: {} as DeviceRegistration,
        message: "Failed to register device",
        error,
      };
    }
  }

  /**
   * Update device information
   */
  async updateDevice(
    updateData: DeviceUpdateRequest
  ): Promise<ApiResponse<DeviceRegistration>> {
    try {
      const response = await api.put<DeviceRegistration>(
        `${this.baseUrl}/${updateData.deviceId}`,
        updateData
      );

      return {
        success: true,
        data: response.data,
        message: "Device updated successfully",
      };
    } catch (error) {
      console.error("Failed to update device:", error);
      return {
        success: false,
        data: {} as DeviceRegistration,
        message: "Failed to update device",
        error,
      };
    }
  }

  /**
   * Remove device from account
   */
  async removeDevice(deviceId: string): Promise<ApiResponse<null>> {
    try {
      await api.delete(`${this.baseUrl}/${deviceId}`);

      return {
        success: true,
        data: null,
        message: "Device removed successfully",
      };
    } catch (error) {
      console.error("Failed to remove device:", error);
      return {
        success: false,
        data: null,
        message: "Failed to remove device",
        error,
      };
    }
  }

  /**
   * Verify device
   */
  async verifyDevice(
    verificationData: DeviceVerificationRequest
  ): Promise<ApiResponse<DeviceRegistration>> {
    try {
      const response = await api.post<DeviceRegistration>(
        `${this.baseUrl}/${verificationData.deviceId}/verify`,
        {
          verificationCode: verificationData.verificationCode,
          verificationMethod: verificationData.verificationMethod,
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Device verified successfully",
      };
    } catch (error) {
      console.error("Failed to verify device:", error);
      return {
        success: false,
        data: {} as DeviceRegistration,
        message: "Failed to verify device",
        error,
      };
    }
  }

  /**
   * Mark device as trusted
   */
  async trustDevice(
    deviceId: string
  ): Promise<ApiResponse<DeviceRegistration>> {
    try {
      const response = await api.post<DeviceRegistration>(
        `${this.baseUrl}/${deviceId}/trust`
      );

      return {
        success: true,
        data: response.data,
        message: "Device marked as trusted",
      };
    } catch (error) {
      console.error("Failed to trust device:", error);
      return {
        success: false,
        data: {} as DeviceRegistration,
        message: "Failed to trust device",
        error,
      };
    }
  }

  /**
   * Remove trust from device
   */
  async untrustDevice(
    deviceId: string
  ): Promise<ApiResponse<DeviceRegistration>> {
    try {
      const response = await api.post<DeviceRegistration>(
        `${this.baseUrl}/${deviceId}/untrust`
      );

      return {
        success: true,
        data: response.data,
        message: "Device trust removed",
      };
    } catch (error) {
      console.error("Failed to untrust device:", error);
      return {
        success: false,
        data: {} as DeviceRegistration,
        message: "Failed to untrust device",
        error,
      };
    }
  }

  /**
   * Get current device info
   */
  async getCurrentDevice(): Promise<ApiResponse<DeviceRegistration | null>> {
    try {
      const currentDevice = getCurrentDeviceInfo();
      const response = await api.get<DeviceRegistration>(
        `${this.baseUrl}/current`,
        {
          params: { deviceId: currentDevice.deviceId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Current device retrieved successfully",
      };
    } catch (error) {
      console.error("Failed to get current device:", error);
      return {
        success: false,
        data: null,
        message: "Failed to retrieve current device",
        error,
      };
    }
  }

  /**
   * Update current device activity
   */
  async updateDeviceActivity(): Promise<ApiResponse<null>> {
    try {
      const currentDevice = getCurrentDeviceInfo();

      await api.post(`${this.baseUrl}/activity`, {
        deviceId: currentDevice.deviceId,
        lastSeen: new Date().toISOString(),
        userAgent: currentDevice.userAgent,
      });

      return {
        success: true,
        data: null,
        message: "Device activity updated",
      };
    } catch (error) {
      console.error("Failed to update device activity:", error);
      return {
        success: false,
        data: null,
        message: "Failed to update device activity",
        error,
      };
    }
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(): Promise<ApiResponse<DeviceStats>> {
    try {
      const response = await api.get<DeviceStats>(`${this.baseUrl}/stats`);

      return {
        success: true,
        data: response.data,
        message: "Device statistics retrieved successfully",
      };
    } catch (error) {
      console.error("Failed to get device stats:", error);
      return {
        success: false,
        data: {} as DeviceStats,
        message: "Failed to retrieve device statistics",
        error,
      };
    }
  }

  /**
   * Check if device is registered
   */
  async checkDeviceRegistration(): Promise<
    ApiResponse<{ isRegistered: boolean; device?: DeviceRegistration }>
  > {
    try {
      const currentDevice = getCurrentDeviceInfo();
      const response = await api.get<{
        isRegistered: boolean;
        device?: DeviceRegistration;
      }>(`${this.baseUrl}/check`, {
        params: { deviceId: currentDevice.deviceId },
      });

      return {
        success: true,
        data: response.data,
        message: "Device registration checked",
      };
    } catch (error) {
      console.error("Failed to check device registration:", error);
      return {
        success: false,
        data: { isRegistered: false },
        message: "Failed to check device registration",
        error,
      };
    }
  }

  /**
   * Get device security recommendations
   */
  async getSecurityRecommendations(deviceId?: string): Promise<
    ApiResponse<{
      recommendations: string[];
      securityScore: number;
      riskLevel: "low" | "medium" | "high";
    }>
  > {
    try {
      const params = deviceId ? { deviceId } : {};
      const response = await api.get<{
        recommendations: string[];
        securityScore: number;
        riskLevel: "low" | "medium" | "high";
      }>(`${this.baseUrl}/security/recommendations`, { params });

      return {
        success: true,
        data: response.data,
        message: "Security recommendations retrieved",
      };
    } catch (error) {
      console.error("Failed to get security recommendations:", error);
      return {
        success: false,
        data: {
          recommendations: [],
          securityScore: 0,
          riskLevel: "high",
        },
        message: "Failed to retrieve security recommendations",
        error,
      };
    }
  }

  // =============================================================================
  // CLIENT-SIDE UTILITY METHODS
  // =============================================================================

  /**
   * Format device for display (client-side)
   */
  formatDeviceForUI(device: DeviceRegistration) {
    return formatDeviceForDisplay({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      userAgent: device.userAgent,
      platform: device.platform,
      isMobile: device.isMobile,
      lastSeen: device.lastSeen,
    });
  }

  /**
   * Auto-register current device if not registered
   */
  async autoRegisterDevice(): Promise<ApiResponse<DeviceRegistration | null>> {
    try {
      const checkResult = await this.checkDeviceRegistration();

      if (checkResult.success && !checkResult.data.isRegistered) {
        return await this.registerDevice({
          requestVerification: false,
        });
      }

      return {
        success: true,
        data: checkResult.data.device || null,
        message: "Device already registered",
      };
    } catch (error) {
      console.error("Failed to auto-register device:", error);
      return {
        success: false,
        data: null,
        message: "Failed to auto-register device",
        error,
      };
    }
  }
}

// Export singleton instance and class
export const deviceService = new DeviceService();
export default deviceService;

// Export error class for specific error handling
export class DeviceServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "DeviceServiceError";
  }
}
