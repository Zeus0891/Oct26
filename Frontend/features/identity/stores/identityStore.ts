/**
 * Identity Store
 * Zustand store for identity state management
 * Aligned with backend Identity module
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  UserProfile,
  LoginRequest,
  RegisterRequest,
  TokenPair,
  IdentityState,
} from "../types";
import { identityService } from "../services/identity.service";
import { sessionService } from "../services/session.service";

// =============================================================================
// IDENTITY STORE INTERFACE
// =============================================================================

interface IdentityStore extends IdentityState {
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  setTokens: (tokens: TokenPair | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => Promise<void>;

  // Computed properties
  isAuthenticated: boolean;
  hasValidTokens: boolean;
}

// =============================================================================
// IDENTITY STORE IMPLEMENTATION
// =============================================================================

export const useIdentityStore = create<IdentityStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastActivity: null,

        // Computed Properties
        get hasValidTokens() {
          const { tokens } = get();
          if (!tokens?.accessToken) return false;

          try {
            return !identityService.isTokenExpired(tokens.accessToken);
          } catch {
            return false;
          }
        },

        // =======================================================================
        // AUTHENTICATION ACTIONS
        // =======================================================================

        login: async (credentials: LoginRequest) => {
          set({ isLoading: true, error: null });

          try {
            const response = await identityService.login(credentials);

            if (response.success && response.data) {
              const { user, accessToken, refreshToken, expiresIn } =
                response.data;

              // Create tokens object from response
              const tokens: TokenPair = {
                accessToken,
                refreshToken,
                expiresIn,
                tokenType: "Bearer",
              };

              // Store tokens in localStorage for persistence
              if (typeof window !== "undefined") {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
              }

              set({
                user,
                tokens,
                isAuthenticated: true,
                isLoading: false,
                lastActivity: new Date(),
              });
            } else {
              throw new Error(response.message || "Login failed");
            }
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : "Login failed",
              isAuthenticated: false,
            });
            throw error;
          }
        },

        register: async (userData: RegisterRequest) => {
          set({ isLoading: true, error: null });

          try {
            // Step 1: Register user (creates user but doesn't return tokens)
            const registerResponse = await identityService.register(userData);

            if (!registerResponse.success) {
              throw new Error(
                registerResponse.message || "Registration failed"
              );
            }

            // Step 2: Auto-login with the same credentials to get tokens
            const loginResponse = await identityService.login({
              email: userData.email,
              password: userData.password,
            });

            if (loginResponse.success && loginResponse.data) {
              const { user, accessToken, refreshToken, expiresIn } =
                loginResponse.data;

              // Create tokens object from login response
              const tokens: TokenPair = {
                accessToken,
                refreshToken,
                expiresIn,
                tokenType: "Bearer",
              };

              // Store tokens in localStorage
              if (typeof window !== "undefined") {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
              }

              set({
                user,
                tokens,
                isAuthenticated: true,
                isLoading: false,
                lastActivity: new Date(),
              });
            } else {
              throw new Error("Login after registration failed");
            }
          } catch (error) {
            set({
              isLoading: false,
              error:
                error instanceof Error ? error.message : "Registration failed",
              isAuthenticated: false,
            });
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true });

          try {
            // Call backend logout
            await identityService.logout();
          } catch (error) {
            console.error("Logout error:", error);
            // Continue with local logout even if backend call fails
          } finally {
            // Clear local state and storage
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("currentTenantId");
            }

            // Clear session data
            sessionService.clearSessionData();

            set({
              user: null,
              tokens: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              lastActivity: null,
            });
          }
        },

        refreshTokens: async () => {
          const { tokens } = get();

          if (!tokens?.refreshToken) {
            throw new Error("No refresh token available");
          }

          set({ isLoading: true });

          try {
            const response = await identityService.refreshTokens({
              refreshToken: tokens.refreshToken,
            });

            if (response.success && response.data) {
              // Backend returns TokenPair directly in data
              const newTokens = response.data;

              // Update localStorage
              if (typeof window !== "undefined") {
                localStorage.setItem("accessToken", newTokens.accessToken);
                localStorage.setItem("refreshToken", newTokens.refreshToken);
              }

              set({
                tokens: newTokens,
                // Keep existing user, refresh doesn't return user info
                isLoading: false,
                lastActivity: new Date(),
              });
            } else {
              throw new Error(response.message || "Token refresh failed");
            }
          } catch (error) {
            // If refresh fails, logout user
            await get().logout();
            throw error;
          }
        },

        // =======================================================================
        // PROFILE ACTIONS
        // =======================================================================

        updateProfile: async (updates: Partial<UserProfile>) => {
          const { user } = get();

          if (!user) {
            throw new Error("No user logged in");
          }

          set({ isLoading: true });

          try {
            const updatedUser = await identityService.updateUser(
              user.id,
              updates
            );

            set({
              user: updatedUser,
              isLoading: false,
              lastActivity: new Date(),
            });
          } catch (error) {
            set({
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Profile update failed",
            });
            throw error;
          }
        },

        // =======================================================================
        // UTILITY ACTIONS
        // =======================================================================

        setUser: (user: UserProfile | null) => {
          set({
            user,
            isAuthenticated: !!user,
            lastActivity: user ? new Date() : null,
          });
        },

        setTokens: (tokens: TokenPair | null) => {
          set({ tokens });

          // Update localStorage
          if (typeof window !== "undefined") {
            if (tokens) {
              localStorage.setItem("accessToken", tokens.accessToken);
              localStorage.setItem("refreshToken", tokens.refreshToken);
            } else {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
            }
          }
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        clearError: () => {
          set({ error: null });
        },

        // =======================================================================
        // INITIALIZATION
        // =======================================================================

        initialize: async () => {
          if (typeof window === "undefined") return;

          const accessToken = localStorage.getItem("accessToken");
          const refreshToken = localStorage.getItem("refreshToken");

          if (!accessToken || !refreshToken) {
            set({ isAuthenticated: false });
            return;
          }

          set({ isLoading: true });

          try {
            // Check if token is still valid
            if (identityService.isTokenExpired(accessToken)) {
              // Try to refresh
              await get().refreshTokens();
            } else {
              // Get current user data
              const user = await identityService.getCurrentUser();

              set({
                user,
                tokens: {
                  accessToken,
                  refreshToken,
                  tokenType: "Bearer",
                  expiresIn: 0,
                },
                isAuthenticated: true,
                isLoading: false,
                lastActivity: new Date(),
              });
            }
          } catch (error) {
            // If initialization fails, clear everything
            await get().logout();
            console.error("Identity initialization failed:", error);
          }
        },
      }),
      {
        name: "identity-storage",
        partialize: (state) => ({
          user: state.user,
          tokens: state.tokens,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: "identity-store",
    }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

export const useUser = () => useIdentityStore((state) => state.user);
export const useTokens = () => useIdentityStore((state) => state.tokens);
export const useIsAuthenticated = () =>
  useIdentityStore((state) => state.isAuthenticated);
export const useIdentityLoading = () =>
  useIdentityStore((state) => state.isLoading);
export const useIdentityError = () => useIdentityStore((state) => state.error);

export default useIdentityStore;
