/**
 * useSession Hook
 * Session management and validation hook
 * Provides session state and actions
 */

import { useCallback, useEffect, useState } from "react";
import {
  SessionData,
  SessionValidationResponse,
  UseSessionReturn,
} from "../types";
import { sessionService } from "../services/session.service";
import { useIdentity } from "./useIdentity";

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export const useSession = (): UseSessionReturn => {
  const { isAuthenticated, tokens } = useIdentity();
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =============================================================================
  // DERIVED STATE
  // =============================================================================

  const isValid = useCallback((): boolean => {
    if (!session || !isAuthenticated) return false;
    return (
      session.status === "ACTIVE" && !sessionService.isSessionExpired(session)
    );
  }, [session, isAuthenticated]);

  const isExpired = useCallback((): boolean => {
    if (!session) return true;
    return sessionService.isSessionExpired(session);
  }, [session]);

  const timeUntilExpiry = useCallback((): number | null => {
    if (!session) return null;
    return sessionService.getSessionTimeUntilExpiry(session);
  }, [session]);

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const validateSession = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false;

    setIsLoading(true);
    setError(null);

    try {
      const response: SessionValidationResponse =
        await sessionService.validateSession();

      if (response.success && response.data.isValid && response.data.session) {
        setSession(response.data.session);
        return true;
      } else {
        setSession(null);
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Session validation failed";
      setError(errorMessage);
      setSession(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const refreshSession = useCallback(async (): Promise<void> => {
    if (!tokens?.refreshToken) {
      throw new Error("No refresh token available");
    }

    setIsLoading(true);
    setError(null);

    try {
      const refreshedSession = await sessionService.refreshSession({
        refreshToken: tokens.refreshToken,
      });

      setSession(refreshedSession);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Session refresh failed";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [tokens?.refreshToken]);

  const extendSession = useCallback(async (): Promise<void> => {
    if (!session) {
      throw new Error("No active session to extend");
    }

    setIsLoading(true);
    setError(null);

    try {
      const extendedSession = await sessionService.extendSession(
        session.sessionId
      );
      setSession(extendedSession);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Session extension failed";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const terminateSession = useCallback(async (): Promise<void> => {
    if (!session) return;

    setIsLoading(true);
    setError(null);

    try {
      await sessionService.revokeSession({ sessionId: session.sessionId });
      setSession(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Session termination failed";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // =============================================================================
  // INITIALIZATION EFFECT
  // =============================================================================

  useEffect(() => {
    if (isAuthenticated && !session) {
      // Try to get stored session data first
      const storedSession = sessionService.getStoredSessionData();
      if (storedSession && !sessionService.isSessionExpired(storedSession)) {
        setSession(storedSession);
      } else {
        // Validate session from server
        validateSession();
      }
    } else if (!isAuthenticated && session) {
      // Clear session if user is not authenticated
      setSession(null);
    }
  }, [isAuthenticated, session, validateSession]);

  // =============================================================================
  // AUTO-REFRESH EFFECT
  // =============================================================================

  useEffect(() => {
    if (!session || !isAuthenticated) return;

    const shouldRefresh = sessionService.shouldRefreshSession(session, 15); // 15 minutes threshold

    if (shouldRefresh) {
      const timeUntil = sessionService.getSessionTimeUntilExpiry(session);
      const refreshBuffer = 5 * 60 * 1000; // 5 minutes buffer

      if (timeUntil > refreshBuffer) {
        const timeoutId = setTimeout(() => {
          refreshSession().catch((error) => {
            console.error("Auto-refresh failed:", error);
          });
        }, timeUntil - refreshBuffer);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [session, isAuthenticated, refreshSession]);

  // =============================================================================
  // RETURN INTERFACE
  // =============================================================================

  return {
    // State
    session,
    isValid: isValid(),
    isExpired: isExpired(),
    timeUntilExpiry: timeUntilExpiry(),
    isLoading,
    error,

    // Actions
    validateSession,
    refreshSession,
    extendSession,
    terminateSession,
  };
};

export default useSession;
