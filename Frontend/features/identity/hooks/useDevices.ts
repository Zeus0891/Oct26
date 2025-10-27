/**
 * useDevices Hook
 * Device management and registration for enhanced security
 * Provides device operations, trusted device management, and device analytics
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { deviceService } from "../services/device.service";
import { useIdentityStore } from "../stores/identityStore";

// =============================================================================
// DEVICE TYPES (Using service types)
// =============================================================================

import type {
  DeviceRegistration,
  DeviceRegistrationRequest,
} from "../services/device.service";

export interface UseDevicesReturn {
  // Data
  devices: DeviceRegistration[];
  currentDevice: DeviceRegistration | null;

  // Loading states
  isLoading: boolean;
  isOperating: boolean;

  // Error handling
  error: string | null;

  // Device operations
  getDevices: () => Promise<void>;
  getCurrentDevice: () => Promise<void>;
  registerDevice: (request: DeviceRegistrationRequest) => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;

  // Security operations
  trustDevice: (deviceId: string) => Promise<void>;
  untrustDevice: (deviceId: string) => Promise<void>;

  // Utilities
  refreshDevices: () => Promise<void>;

  // Computed values
  trustedDevices: DeviceRegistration[];
  deviceCount: number;
  hasCurrentDevice: boolean;
}

// =============================================================================
// CUSTOM HOOK IMPLEMENTATION
// =============================================================================

export const useDevices = (): UseDevicesReturn => {
  const { user } = useIdentityStore();

  // State management
  const [devices, setDevices] = useState<DeviceRegistration[]>([]);
  const [currentDevice, setCurrentDevice] = useState<DeviceRegistration | null>(
    null
  );

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isOperating, setIsOperating] = useState(false);

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const trustedDevices = useMemo(() => {
    return devices.filter((device) => device.isTrusted);
  }, [devices]);

  const deviceCount = useMemo(() => {
    return devices.length;
  }, [devices]);

  const hasCurrentDevice = useMemo(() => {
    return currentDevice !== null;
  }, [currentDevice]);

  // =============================================================================
  // DEVICE OPERATIONS
  // =============================================================================

  const getDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deviceService.getRegisteredDevices();

      if (result.success && result.data) {
        setDevices(result.data);
      } else {
        throw new Error("Failed to load devices");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load devices";
      setError(errorMessage);
      console.error("Devices loading error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentDevice = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deviceService.getCurrentDevice();

      if (result.success && result.data) {
        setCurrentDevice(result.data);
      }
    } catch (err) {
      console.error("Failed to get current device:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerDevice = useCallback(
    async (request: DeviceRegistrationRequest) => {
      setIsOperating(true);
      setError(null);

      try {
        const result = await deviceService.registerDevice(request);

        if (result.success && result.data) {
          // Add the new device to the list
          setDevices((prev) => [...prev, result.data!]);

          // Set as current device
          setCurrentDevice(result.data);
        } else {
          throw new Error("Failed to register device");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to register device";
        setError(errorMessage);
        throw err;
      } finally {
        setIsOperating(false);
      }
    },
    []
  );

  const removeDevice = useCallback(
    async (deviceId: string) => {
      setIsOperating(true);
      setError(null);

      try {
        const result = await deviceService.removeDevice(deviceId);

        if (result.success) {
          // Remove device from list
          setDevices((prev) => prev.filter((device) => device.id !== deviceId));

          // Clear current device if it was removed
          if (currentDevice?.id === deviceId) {
            setCurrentDevice(null);
          }
        } else {
          throw new Error("Failed to remove device");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove device";
        setError(errorMessage);
        throw err;
      } finally {
        setIsOperating(false);
      }
    },
    [currentDevice?.id]
  );

  // =============================================================================
  // SECURITY OPERATIONS
  // =============================================================================

  const trustDevice = useCallback(
    async (deviceId: string) => {
      setIsOperating(true);
      setError(null);

      try {
        const result = await deviceService.trustDevice(deviceId);

        if (result.success) {
          // Refresh devices list to get updated trust status
          await getDevices();

          // Update current device if it matches
          if (currentDevice?.id === deviceId) {
            setCurrentDevice((prev) =>
              prev ? { ...prev, isTrusted: true } : null
            );
          }
        } else {
          throw new Error("Failed to trust device");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to trust device";
        setError(errorMessage);
        throw err;
      } finally {
        setIsOperating(false);
      }
    },
    [currentDevice?.id, getDevices]
  );

  const untrustDevice = useCallback(
    async (deviceId: string) => {
      setIsOperating(true);
      setError(null);

      try {
        const result = await deviceService.untrustDevice(deviceId);

        if (result.success) {
          // Refresh devices list to get updated trust status
          await getDevices();

          // Update current device if it matches
          if (currentDevice?.id === deviceId) {
            setCurrentDevice((prev) =>
              prev ? { ...prev, isTrusted: false } : null
            );
          }
        } else {
          throw new Error("Failed to untrust device");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to untrust device";
        setError(errorMessage);
        throw err;
      } finally {
        setIsOperating(false);
      }
    },
    [currentDevice?.id, getDevices]
  );

  // =============================================================================
  // UTILITIES
  // =============================================================================

  const refreshDevices = useCallback(async () => {
    await Promise.all([getDevices(), getCurrentDevice()]);
  }, [getDevices, getCurrentDevice]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Load devices when user is available
  useEffect(() => {
    if (user && devices.length === 0) {
      refreshDevices();
    }
  }, [user, devices.length, refreshDevices]);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // Data
    devices,
    currentDevice,

    // Loading states
    isLoading,
    isOperating,

    // Error handling
    error,

    // Device operations
    getDevices,
    getCurrentDevice,
    registerDevice,
    removeDevice,

    // Security operations
    trustDevice,
    untrustDevice,

    // Utilities
    refreshDevices,

    // Computed values
    trustedDevices,
    deviceCount,
    hasCurrentDevice,
  };
};

export default useDevices;
