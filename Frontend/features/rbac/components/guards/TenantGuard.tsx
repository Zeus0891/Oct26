/**
 * TenantGuard Component
 * Ensures user has active tenant context before rendering children
 * Works with Identity module to bridge global auth to tenant-scoped RBAC
 */

"use client";

import React, { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "../../../identity/hooks/useIdentity";
import { useSession } from "../../../identity/hooks/useSession";

// =============================================================================
// TYPES
// =============================================================================

interface TenantGuardProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
  requireActiveTenant?: boolean;
  showLoader?: boolean;
  allowSandbox?: boolean; // For VIEWER role in demo environments (unused for now)
}

// =============================================================================
// TENANT GUARD COMPONENT
// =============================================================================

export const TenantGuard: React.FC<TenantGuardProps> = ({
  children,
  redirectTo = "/tenant/select",
  fallback = null,
  requireActiveTenant = true,
  showLoader = true,
  allowSandbox = true,
}) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: identityLoading } = useIdentity();
  const { session, isLoading: sessionLoading } = useSession();

  // =============================================================================
  // TENANT VALIDATION EFFECT
  // =============================================================================

  useEffect(() => {
    const validateTenantContext = () => {
      // Wait for identity and session to load
      if (identityLoading || sessionLoading) return;

      // Must be authenticated first
      if (!isAuthenticated || !user) {
        router.push("/login");
        return;
      }

      // Check if tenant context is required
      if (requireActiveTenant) {
        // Check if session has tenant context
        if (!session?.tenantId) {
          console.warn("TenantGuard: No active tenant in session");
          router.push(redirectTo);
          return;
        }

        // Check if user has access to this tenant (via JWT claims)
        // This should be validated by the backend, but we can check for basic structure
        const storedTenantId =
          typeof window !== "undefined"
            ? localStorage.getItem("currentTenantId")
            : null;

        if (storedTenantId !== session.tenantId) {
          console.warn(
            "TenantGuard: Tenant ID mismatch between storage and session"
          );
          if (typeof window !== "undefined") {
            localStorage.setItem("currentTenantId", session.tenantId);
          }
        }
      }
    };

    validateTenantContext();
  }, [
    isAuthenticated,
    user,
    session,
    identityLoading,
    sessionLoading,
    requireActiveTenant,
    router,
    redirectTo,
  ]);

  // =============================================================================
  // DERIVED STATE
  // =============================================================================

  const isLoading = identityLoading || sessionLoading;
  const hasTenantContext = session?.tenantId ? true : false;
  const isValidTenant =
    hasTenantContext &&
    (!requireActiveTenant || // If tenant not required, any context is valid
      (session?.tenantId && session.tenantId.length > 0));

  // =============================================================================
  // RENDER LOGIC
  // =============================================================================

  // Show loader while checking tenant context
  if (isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, don't render (let AuthGuard handle)
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  // If tenant context is required but missing
  if (requireActiveTenant && !isValidTenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            Tenant Selection Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please select an organization to continue.
          </p>
          <button
            onClick={() => router.push(redirectTo)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Select Organization
          </button>
        </div>
      </div>
    );
  }

  // Tenant context is valid - render children
  return <>{children}</>;
};

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Hook to check tenant context status
 */
export const useTenantGuard = () => {
  const { session } = useSession();
  const { isAuthenticated } = useIdentity();

  return {
    hasTenantContext: !!session?.tenantId,
    tenantId: session?.tenantId || null,
    isAuthenticated,
    isValidForTenant: isAuthenticated && !!session?.tenantId,
  };
};

/**
 * Hook to get current tenant information
 */
export const useCurrentTenant = () => {
  const { session } = useSession();

  return {
    tenantId: session?.tenantId || null,
    memberId: session?.memberId || null,
    // Additional tenant info would come from RBAC context
  };
};

/**
 * HOC for wrapping components with TenantGuard
 */
export const withTenantGuard = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  guardProps?: Omit<TenantGuardProps, "children">
) => {
  const GuardedComponent: React.FC<P> = (props) => (
    <TenantGuard {...guardProps}>
      <WrappedComponent {...props} />
    </TenantGuard>
  );

  GuardedComponent.displayName = `withTenantGuard(${WrappedComponent.displayName || WrappedComponent.name})`;

  return GuardedComponent;
};

export default TenantGuard;
