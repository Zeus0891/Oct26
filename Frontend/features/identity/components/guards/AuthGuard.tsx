/**
 * AuthGuard Component
 * Base authentication guard for protecting routes and components
 * Ensures user is authenticated before rendering children
 */

"use client";

import React, { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "../../hooks/useIdentity";

// =============================================================================
// TYPES
// =============================================================================

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
  requireEmailVerified?: boolean;
  showLoader?: boolean;
}

// =============================================================================
// AUTH GUARD COMPONENT
// =============================================================================

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectTo = "/login",
  fallback = null,
  requireEmailVerified = false,
  showLoader = true,
}) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasValidTokens, checkAuthStatus } =
    useIdentity();

  // =============================================================================
  // AUTHENTICATION CHECK EFFECT
  // =============================================================================

  useEffect(() => {
    const validateAuth = async () => {
      if (isLoading) return; // Wait for loading to complete

      // If no tokens or not authenticated, redirect
      if (!isAuthenticated || !hasValidTokens) {
        router.push(redirectTo);
        return;
      }

      // Additional token validation
      const isValid = await checkAuthStatus();
      if (!isValid) {
        router.push(redirectTo);
        return;
      }

      // Check email verification if required
      if (requireEmailVerified && user && !user.emailVerified) {
        router.push("/identity/verify-email");
        return;
      }
    };

    validateAuth();
  }, [
    isAuthenticated,
    hasValidTokens,
    isLoading,
    user,
    requireEmailVerified,
    router,
    redirectTo,
    checkAuthStatus,
  ]);

  // =============================================================================
  // RENDER LOGIC
  // =============================================================================

  // Show loader while checking authentication
  if (isLoading || (!isAuthenticated && showLoader)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, show fallback or nothing (redirect handles navigation)
  if (!isAuthenticated || !hasValidTokens) {
    return fallback ? <>{fallback}</> : null;
  }

  // If email verification required but not verified
  if (requireEmailVerified && user && !user.emailVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            Email Verification Required
          </h2>
          <p className="text-gray-600">Please verify your email to continue.</p>
        </div>
      </div>
    );
  }

  // Authenticated - render children
  return <>{children}</>;
};

// =============================================================================
// CONVENIENCE WRAPPER HOOKS
// =============================================================================

/**
 * Hook to check if user is authenticated
 * Useful for conditional rendering without full guard component
 */
export const useAuthGuard = () => {
  const { isAuthenticated, hasValidTokens, user } = useIdentity();

  return {
    isAuthenticated: isAuthenticated && hasValidTokens,
    isEmailVerified: user?.emailVerified || false,
    canAccess: (requireEmailVerified = false) => {
      if (!isAuthenticated || !hasValidTokens) return false;
      if (requireEmailVerified && user && !user.emailVerified) return false;
      return true;
    },
  };
};

/**
 * HOC for wrapping pages with AuthGuard
 */
export const withAuthGuard = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  guardProps?: Omit<AuthGuardProps, "children">
) => {
  const GuardedComponent: React.FC<P> = (props) => (
    <AuthGuard {...guardProps}>
      <WrappedComponent {...props} />
    </AuthGuard>
  );

  GuardedComponent.displayName = `withAuthGuard(${WrappedComponent.displayName || WrappedComponent.name})`;

  return GuardedComponent;
};

export default AuthGuard;
