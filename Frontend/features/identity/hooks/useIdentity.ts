/**
 * useIdentity Hook
 * Main identity hook for authentication and user management
 * Provides convenient interface to identity store and services
 */

import { useCallback, useEffect } from "react";
import {
  useIdentityStore,
  useUser,
  useTokens,
  useIsAuthenticated,
  useIdentityLoading,
  useIdentityError,
} from "../stores/identityStore";
import {
  LoginRequest,
  RegisterRequest,
  UserProfile,
  JWTPayload,
  TokenPair,
} from "../types";
import { identityService } from "../services/identity.service";

// =============================================================================
// HOOK INTERFACE
// =============================================================================

interface UseIdentityReturn {
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

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export const useIdentity = (): UseIdentityReturn => {
  const user = useUser();
  const tokens = useTokens();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useIdentityLoading();
  const error = useIdentityError();

  const {
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    refreshTokens: storeRefreshTokens,
    updateProfile: storeUpdateProfile,
    clearError: storeClearError,
    initialize,
    hasValidTokens,
  } = useIdentityStore();

  // =============================================================================
  // DERIVED STATE
  // =============================================================================

  const tokenPayload = useCallback((): JWTPayload | null => {
    if (!tokens?.accessToken) return null;
    return identityService.parseJWT(tokens.accessToken);
  }, [tokens?.accessToken]);

  const timeUntilExpiry = useCallback((): number | null => {
    if (!tokens?.accessToken) return null;
    return identityService.getTokenTimeUntilExpiry(tokens.accessToken);
  }, [tokens?.accessToken]);

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const login = useCallback(
    async (credentials: LoginRequest) => {
      await storeLogin(credentials);
    },
    [storeLogin]
  );

  const register = useCallback(
    async (userData: RegisterRequest) => {
      await storeRegister(userData);
    },
    [storeRegister]
  );

  const logout = useCallback(async () => {
    await storeLogout();
  }, [storeLogout]);

  const refreshTokens = useCallback(async () => {
    await storeRefreshTokens();
  }, [storeRefreshTokens]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      await storeUpdateProfile(updates);
    },
    [storeUpdateProfile]
  );

  // =============================================================================
  // UTILITIES
  // =============================================================================

  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    if (!tokens?.accessToken) return false;

    try {
      const isValid = await identityService.validateToken(tokens.accessToken);
      return isValid;
    } catch {
      return false;
    }
  }, [tokens?.accessToken]);

  const isTokenExpired = useCallback((): boolean => {
    if (!tokens?.accessToken) return true;
    return identityService.isTokenExpired(tokens.accessToken);
  }, [tokens?.accessToken]);

  const getUserDisplayName = useCallback((): string => {
    if (!user) return "Anonymous User";

    if (user.displayName) return user.displayName;
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;

    return user.email.split("@")[0];
  }, [user]);

  const getUserInitials = useCallback((): string => {
    if (!user) return "AU";

    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName.slice(0, 2).toUpperCase();
    }

    return user.email.slice(0, 2).toUpperCase();
  }, [user]);

  // =============================================================================
  // INITIALIZATION EFFECT
  // =============================================================================

  useEffect(() => {
    // Initialize identity store on mount
    initialize();
  }, [initialize]);

  // =============================================================================
  // AUTO-REFRESH EFFECT
  // =============================================================================

  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken) return;

    // Set up auto-refresh 5 minutes before token expires
    const refreshThreshold = 5 * 60 * 1000; // 5 minutes in ms
    const timeUntil = timeUntilExpiry();

    if (timeUntil && timeUntil > refreshThreshold) {
      const timeoutId = setTimeout(() => {
        refreshTokens().catch((error) => {
          console.error("Auto-refresh failed:", error);
          // Don't logout automatically on auto-refresh failure
          // Let the user continue until they make a request that fails
        });
      }, timeUntil - refreshThreshold);

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, tokens?.accessToken, timeUntilExpiry, refreshTokens]);

  // =============================================================================
  // RETURN INTERFACE
  // =============================================================================

  return {
    // State
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,

    // Derived state
    hasValidTokens,
    tokenPayload: tokenPayload(),
    timeUntilExpiry: timeUntilExpiry(),

    // Actions
    login,
    register,
    logout,
    refreshTokens,
    updateProfile,
    clearError: storeClearError,

    // Utilities
    checkAuthStatus,
    isTokenExpired,
    getUserDisplayName,
    getUserInitials,
  };
};

export default useIdentity;
