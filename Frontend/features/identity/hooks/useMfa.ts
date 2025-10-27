/**
 * useMfa Hook
 * Multi-Factor Authentication management with TOTP support
 * Provides MFA setup, verification, and backup code management
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { mfaService } from "../services/mfa.service";
import { useIdentityStore } from "../stores/identityStore";

// =============================================================================
// MFA TYPES (Using service types)
// =============================================================================

// Using any for now since types are complex
// TODO: Import proper types when service types are stable

export interface UseMfaReturn {
  // Data
  mfaEnabled: boolean;
  backupCodesCount: number;
  qrCodeData: string | null;

  // Loading states
  isLoading: boolean;
  isOperating: boolean;

  // Error handling
  error: string | null;

  // MFA operations
  getMfaStatus: () => Promise<void>;
  setupMfa: () => Promise<unknown | null>;
  verifyMfaSetup: (code: string) => Promise<void>;
  disableMfa: (password: string) => Promise<void>;

  // Note: Additional verification and backup code methods can be added when needed

  // Utilities
  refreshMfaStatus: () => Promise<void>;

  // Computed values
  isMfaRequired: boolean;
  hasBackupCodes: boolean;
}

// =============================================================================
// CUSTOM HOOK IMPLEMENTATION
// =============================================================================

export const useMfa = (): UseMfaReturn => {
  const { user } = useIdentityStore();

  // State management
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [backupCodesCount, setBackupCodesCount] = useState(0);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isOperating, setIsOperating] = useState(false);

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const isMfaRequired = useMemo(() => {
    // TODO: Implement logic to determine if MFA is required
    // This could be based on user role, security policies, etc.
    return false;
  }, []);

  const hasBackupCodes = useMemo(() => {
    return backupCodesCount > 0;
  }, [backupCodesCount]);

  // =============================================================================
  // MFA STATUS AND SETUP
  // =============================================================================

  const getMfaStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mfaService.getMfaStatus();

      if (result.success && result.data) {
        setMfaEnabled(result.data.isEnabled);
        setBackupCodesCount(result.data.backupCodesRemaining);
      } else {
        throw new Error("Failed to get MFA status");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get MFA status";
      setError(errorMessage);
      console.error("MFA status error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setupMfa = useCallback(async (): Promise<unknown | null> => {
    setIsOperating(true);
    setError(null);

    try {
      // Create a basic TOTP setup request
      const setupRequest = {
        type: "TOTP" as const,
        phoneNumber: undefined, // Not needed for TOTP
      };

      const result = await mfaService.setupTotp(setupRequest);

      if (result.success && result.data) {
        // Store QR code data for display
        setQrCodeData(result.data.qrCodeUrl || null);
        return result.data;
      } else {
        throw new Error("Failed to setup MFA");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to setup MFA";
      setError(errorMessage);
      throw err;
    } finally {
      setIsOperating(false);
    }
  }, []);

  const verifyMfaSetup = useCallback(async (code: string) => {
    setIsOperating(true);
    setError(null);

    try {
      const request = {
        code,
        type: "totp",
        factorId: "temp-factor-id", // TODO: Get actual factor ID from setup
      };

      const result = await mfaService.verifyTotpSetup(request);

      if (result.success) {
        setMfaEnabled(true);
        setQrCodeData(null); // Clear QR code after successful setup
      } else {
        throw new Error("Failed to verify MFA setup");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to verify MFA setup";
      setError(errorMessage);
      throw err;
    } finally {
      setIsOperating(false);
    }
  }, []);

  const disableMfa = useCallback(async (password: string) => {
    setIsOperating(true);
    setError(null);

    try {
      const request = {
        currentPassword: password,
        confirmDisable: true,
      };

      await mfaService.disableMfa(request);

      // If we get here, it was successful (void return)
      setMfaEnabled(false);
      setBackupCodesCount(0);
      setQrCodeData(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to disable MFA";
      setError(errorMessage);
      throw err;
    } finally {
      setIsOperating(false);
    }
  }, []);

  // =============================================================================
  // UTILITIES
  // =============================================================================

  const refreshMfaStatus = useCallback(async () => {
    await getMfaStatus();
  }, [getMfaStatus]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Load MFA status when user is available
  useEffect(() => {
    if (user) {
      refreshMfaStatus();
    }
  }, [user, refreshMfaStatus]);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // Data
    mfaEnabled,
    backupCodesCount,
    qrCodeData,

    // Loading states
    isLoading,
    isOperating,

    // Error handling
    error,

    // MFA operations
    getMfaStatus,
    setupMfa,
    verifyMfaSetup,
    disableMfa,

    // Note: Additional methods can be added when needed

    // Utilities
    refreshMfaStatus,

    // Computed values
    isMfaRequired,
    hasBackupCodes,
  };
};

export default useMfa;
