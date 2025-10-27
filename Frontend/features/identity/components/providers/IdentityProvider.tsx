/**
 * Identity Provider
 * Context provider for identity state management
 * Wraps the app to provide identity functionality
 */

"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useIdentity } from "../../hooks/useIdentity";
import type {
  UserProfile,
  TokenPair,
  LoginRequest,
  RegisterRequest,
  JWTPayload,
} from "../../types";

// =============================================================================
// CONTEXT TYPES
// =============================================================================

interface IdentityContextValue {
  // State
  user: UserProfile | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Derived state
  hasValidTokens: boolean;
  tokenPayload: JWTPayload | null;
  timeUntilExpiry: number | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;

  // Utilities
  checkAuthStatus: () => Promise<boolean>;
  isTokenExpired: () => boolean;
  getUserDisplayName: () => string;
  getUserInitials: () => string;
}

interface IdentityProviderProps {
  children: ReactNode;
  onAuthStateChange?: (
    isAuthenticated: boolean,
    user: UserProfile | null
  ) => void;
  enableAutoRefresh?: boolean;
  refreshThreshold?: number; // Minutes before expiry
}

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const IdentityContext = createContext<IdentityContextValue | null>(null);

// =============================================================================
// IDENTITY PROVIDER COMPONENT
// =============================================================================

export const IdentityProvider: React.FC<IdentityProviderProps> = ({
  children,
  onAuthStateChange,
  enableAutoRefresh = true,
  refreshThreshold = 5,
}) => {
  const identity = useIdentity();

  const { user, isAuthenticated, tokens, timeUntilExpiry, refreshTokens } =
    identity;

  // =============================================================================
  // AUTH STATE CHANGE EFFECT
  // =============================================================================

  useEffect(() => {
    if (onAuthStateChange) {
      onAuthStateChange(isAuthenticated, user);
    }
  }, [isAuthenticated, user, onAuthStateChange]);

  // =============================================================================
  // AUTO-REFRESH EFFECT
  // =============================================================================

  useEffect(() => {
    if (!enableAutoRefresh || !isAuthenticated || !tokens?.accessToken) return;

    const refreshThresholdMs = refreshThreshold * 60 * 1000; // Convert to milliseconds
    const timeUntil = timeUntilExpiry;

    if (timeUntil && timeUntil <= refreshThresholdMs && timeUntil > 0) {
      // Schedule refresh slightly before threshold
      const refreshDelay = Math.max(0, timeUntil - 30 * 1000); // 30 seconds before threshold

      const timeoutId = setTimeout(() => {
        refreshTokens().catch((error) => {
          console.error("Auto-refresh failed:", error);
          // Note: Don't auto-logout on refresh failure, let user continue until next API call
        });
      }, refreshDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [
    enableAutoRefresh,
    isAuthenticated,
    tokens?.accessToken,
    timeUntilExpiry,
    refreshThreshold,
    refreshTokens,
  ]);

  // =============================================================================
  // VISIBILITY CHANGE EFFECT (Tab Focus)
  // =============================================================================

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        // Check auth status when tab becomes visible
        try {
          const isValid = await identity.checkAuthStatus();
          if (!isValid) {
            console.warn(
              "Authentication invalid on tab focus, user may need to re-login"
            );
          }
        } catch (error) {
          console.error("Auth check failed on tab focus:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, identity]);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const contextValue: IdentityContextValue = {
    ...identity,
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <IdentityContext.Provider value={contextValue}>
      {children}
    </IdentityContext.Provider>
  );
};

// =============================================================================
// CONTEXT HOOK
// =============================================================================

export const useIdentityContext = (): IdentityContextValue => {
  const context = useContext(IdentityContext);

  if (!context) {
    throw new Error(
      "useIdentityContext must be used within an IdentityProvider"
    );
  }

  return context;
};

// =============================================================================
// CONVENIENCE SELECTORS
// =============================================================================

export const useCurrentUser = (): UserProfile | null => {
  const { user } = useIdentityContext();
  return user;
};

export const useAuthStatus = (): {
  isAuthenticated: boolean;
  isLoading: boolean;
} => {
  const { isAuthenticated, isLoading } = useIdentityContext();
  return { isAuthenticated, isLoading };
};

export const useTokenInfo = (): {
  tokens: TokenPair | null;
  hasValidTokens: boolean;
  timeUntilExpiry: number | null;
} => {
  const { tokens, hasValidTokens, timeUntilExpiry } = useIdentityContext();
  return { tokens, hasValidTokens, timeUntilExpiry };
};

// =============================================================================
// HIGHER-ORDER COMPONENT
// =============================================================================

export const withIdentityProvider = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  providerProps?: Omit<IdentityProviderProps, "children">
) => {
  const WithIdentityProviderComponent: React.FC<P> = (props) => (
    <IdentityProvider {...providerProps}>
      <WrappedComponent {...props} />
    </IdentityProvider>
  );

  WithIdentityProviderComponent.displayName = `withIdentityProvider(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithIdentityProviderComponent;
};

export default IdentityProvider;
