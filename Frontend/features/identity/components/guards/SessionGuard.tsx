/**
 * SessionGuard Component
 * Session-specific guard that validates active session state
 * Works in conjunction with AuthGuard for enhanced security
 */

"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../hooks/useSession";
import { useIdentity } from "../../hooks/useIdentity";

// =============================================================================
// TYPES
// =============================================================================

interface SessionGuardProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
  requireActiveTenant?: boolean;
  maxInactivity?: number; // Minutes of inactivity before forcing re-auth
  showSessionWarning?: boolean;
}

// =============================================================================
// SESSION GUARD COMPONENT
// =============================================================================

export const SessionGuard: React.FC<SessionGuardProps> = ({
  children,
  redirectTo = "/login",
  fallback = null,
  requireActiveTenant = false,
  maxInactivity = 120, // 2 hours default
  showSessionWarning = true,
}) => {
  const router = useRouter();
  const { isAuthenticated } = useIdentity();
  const {
    session,
    isValid,
    isExpired,
    timeUntilExpiry,
    isLoading,
    validateSession,
    refreshSession,
  } = useSession();

  const [showWarning, setShowWarning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // =============================================================================
  // SESSION VALIDATION EFFECT
  // =============================================================================

  useEffect(() => {
    const validateCurrentSession = async () => {
      if (!isAuthenticated || isLoading) return;

      setIsValidating(true);

      try {
        const sessionValid = await validateSession();

        if (!sessionValid || isExpired) {
          router.push(redirectTo);
          return;
        }

        // Check if tenant is required
        if (requireActiveTenant && session && !session.tenantId) {
          router.push("/tenant/select");
          return;
        }
      } catch (error) {
        console.error("Session validation error:", error);
        router.push(redirectTo);
      } finally {
        setIsValidating(false);
      }
    };

    validateCurrentSession();
  }, [
    isAuthenticated,
    isLoading,
    isExpired,
    session,
    requireActiveTenant,
    router,
    redirectTo,
    validateSession,
  ]);

  // =============================================================================
  // SESSION EXPIRY WARNING EFFECT
  // =============================================================================

  useEffect(() => {
    if (!showSessionWarning || !timeUntilExpiry) return;

    // Show warning 10 minutes before expiry
    const warningThreshold = 10 * 60 * 1000; // 10 minutes in ms

    if (timeUntilExpiry <= warningThreshold && timeUntilExpiry > 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [timeUntilExpiry, showSessionWarning]);

  // =============================================================================
  // INACTIVITY DETECTION EFFECT
  // =============================================================================

  useEffect(() => {
    if (!maxInactivity || !session) return;

    const handleActivity = () => {
      // Update last activity timestamp
      const lastActivity = session.lastAccessedAt
        ? new Date(session.lastAccessedAt)
        : new Date();
      const now = new Date();
      const inactiveTime = now.getTime() - lastActivity.getTime();
      const maxInactiveMs = maxInactivity * 60 * 1000;

      if (inactiveTime > maxInactiveMs) {
        router.push(redirectTo);
      }
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [maxInactivity, session, router, redirectTo]);

  // =============================================================================
  // SESSION REFRESH HANDLER
  // =============================================================================

  const handleRefreshSession = async () => {
    try {
      await refreshSession();
      setShowWarning(false);
    } catch (error) {
      console.error("Session refresh failed:", error);
      router.push(redirectTo);
    }
  };

  // =============================================================================
  // RENDER LOGIC
  // =============================================================================

  // Show loader while validating
  if (isLoading || isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If session is invalid, show fallback or redirect
  if (!isAuthenticated || !isValid || isExpired) {
    return fallback ? <>{fallback}</> : null;
  }

  // If tenant is required but not set
  if (requireActiveTenant && session && !session.tenantId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            Tenant Selection Required
          </h2>
          <p className="text-gray-600">Please select a tenant to continue.</p>
        </div>
      </div>
    );
  }

  // Render children with optional session warning
  return (
    <>
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-3 text-center z-50">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <span>
              Your session will expire in{" "}
              {Math.ceil((timeUntilExpiry || 0) / 60000)} minutes.
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleRefreshSession}
                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
              >
                Extend Session
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={showWarning ? "mt-16" : ""}>{children}</div>
    </>
  );
};

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Hook to check session validity
 */
export const useSessionGuard = () => {
  const { session, isValid, isExpired, timeUntilExpiry } = useSession();

  return {
    hasActiveSession: isValid && !isExpired,
    session,
    timeUntilExpiry,
    isExpiringSoon: timeUntilExpiry ? timeUntilExpiry < 10 * 60 * 1000 : false, // 10 minutes
  };
};

/**
 * HOC for wrapping components with SessionGuard
 */
export const withSessionGuard = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  guardProps?: Omit<SessionGuardProps, "children">
) => {
  const GuardedComponent: React.FC<P> = (props) => (
    <SessionGuard {...guardProps}>
      <WrappedComponent {...props} />
    </SessionGuard>
  );

  GuardedComponent.displayName = `withSessionGuard(${WrappedComponent.displayName || WrappedComponent.name})`;

  return GuardedComponent;
};

export default SessionGuard;
