/**
 * usePasswordReset Hook
 * Password reset flow management with secure token validation
 * Provides complete password reset workflow from request to completion
 */

import { useState, useCallback, useMemo } from "react";
import { passwordService } from "../services/password.service";

export interface UsePasswordResetReturn {
  // Loading states
  isLoading: boolean;
  isOperating: boolean;

  // Error handling
  error: string | null;

  // Success states
  resetRequested: boolean;
  resetCompleted: boolean;

  // Password reset operations
  requestPasswordReset: (email: string) => Promise<void>;
  validateResetToken: (token: string) => Promise<boolean>;
  resetPassword: (
    token: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;

  // Utilities
  clearState: () => void;

  // Computed values
  canResetPassword: boolean;
}

// =============================================================================
// CUSTOM HOOK IMPLEMENTATION
// =============================================================================

export const usePasswordReset = (): UsePasswordResetReturn => {
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isOperating, setIsOperating] = useState(false);

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Success states
  const [resetRequested, setResetRequested] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const canResetPassword = useMemo(() => {
    return resetRequested && !resetCompleted && !error;
  }, [resetRequested, resetCompleted, error]);

  // =============================================================================
  // PASSWORD RESET OPERATIONS
  // =============================================================================

  const requestPasswordReset = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    setResetRequested(false);

    try {
      const result = await passwordService.requestReset(email);

      // Service returns PasswordResetResponse directly
      if (result.message) {
        setResetRequested(true);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to request password reset";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateResetToken = useCallback(
    async (token: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await passwordService.validateToken(token);

        // The service returns PasswordValidateTokenResponse
        return result.data?.isValid || false;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to validate reset token";
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string, confirmPassword: string) => {
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      setIsOperating(true);
      setError(null);

      try {
        const request = {
          token,
          newPassword,
          confirmPassword: confirmPassword,
        };

        await passwordService.confirmReset(request);

        // If we get here, it was successful (void return)
        setResetCompleted(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to reset password";
        setError(errorMessage);
        throw err;
      } finally {
        setIsOperating(false);
      }
    },
    []
  );

  // =============================================================================
  // UTILITIES
  // =============================================================================

  const clearState = useCallback(() => {
    setError(null);
    setResetRequested(false);
    setResetCompleted(false);
    setIsLoading(false);
    setIsOperating(false);
  }, []);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // Loading states
    isLoading,
    isOperating,

    // Error handling
    error,

    // Success states
    resetRequested,
    resetCompleted,

    // Password reset operations
    requestPasswordReset,
    validateResetToken,
    resetPassword,

    // Utilities
    clearState,

    // Computed values
    canResetPassword,
  };
};

export default usePasswordReset;
