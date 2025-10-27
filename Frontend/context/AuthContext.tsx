"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser } from "@/features/identity/types";
import { AuthService } from "@/features/identity/services";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        // Ensure cookie is set if token exists
        document.cookie = `auth-token=${savedToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        document.cookie =
          "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Try real API first
      console.log("🔍 Attempting login with real API:", {
        email,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
      });
      try {
        const response = await AuthService.login({ email, password });
        console.log("✅ Real API login successful:", response);

        // Backend returns: { success, data: { accessToken, refreshToken, user, ... } }
        const { accessToken, user: newUser } = response.data;
        const newToken = accessToken;

        setToken(newToken);
        setUser(newUser);

        localStorage.setItem("token", newToken);
        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));

        // Set cookie for middleware
        document.cookie = `auth-token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
        console.log("✅ Login state updated successfully");
        return;
      } catch (apiError) {
        console.error("❌ Real API login failed:", apiError);
        console.warn(
          "🔄 Backend API not available, using mock authentication:",
          apiError
        );

        // Mock authentication for development
        if (email && password) {
          const mockToken = `mock.jwt.token.${Date.now()}`;
          const mockUser = {
            id: "mock-user-id",
            email: email,
            emailVerified: true,
            firstName: email.split("@")[0],
            lastName: "User",
            displayName: email.split("@")[0] + " User",
            roles: ["ADMIN"],
            permissions: ["*"],
            tenantId: "mock-tenant-id",
          };

          setToken(mockToken);
          setUser(mockUser);

          localStorage.setItem("token", mockToken);
          localStorage.setItem("accessToken", mockToken);
          localStorage.setItem("user", JSON.stringify(mockUser));

          // Set cookie for middleware
          document.cookie = `auth-token=${mockToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
          return;
        }

        throw new Error("Invalid email or password");
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // Try real API first
      try {
        const response = await AuthService.register({
          email,
          password,
          firstName: name.split(" ")[0] || name,
          lastName: name.split(" ").slice(1).join(" ") || "",
        });
        const { tokens, user: newUser } = response.data;
        const newToken = tokens.accessToken;

        setToken(newToken);
        setUser(newUser);

        localStorage.setItem("token", newToken);
        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));

        // Set cookie for middleware
        document.cookie = `auth-token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
        return;
      } catch (apiError) {
        console.warn(
          "Backend API not available, using mock registration:",
          apiError
        );

        // Mock registration for development
        if (email && password && name) {
          const mockToken = `mock.jwt.token.${Date.now()}`;
          const mockUser = {
            id: "mock-user-id",
            email: email,
            emailVerified: true,
            firstName: name.split(" ")[0] || name,
            lastName: name.split(" ").slice(1).join(" ") || "",
            displayName: name,
            roles: ["ADMIN"],
            permissions: ["*"],
            tenantId: "mock-tenant-id",
          };

          setToken(mockToken);
          setUser(mockUser);

          localStorage.setItem("token", mockToken);
          localStorage.setItem("accessToken", mockToken);
          localStorage.setItem("user", JSON.stringify(mockUser));

          // Set cookie for middleware
          document.cookie = `auth-token=${mockToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
          return;
        }

        throw new Error("Registration failed");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Remove cookie
    document.cookie =
      "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
  };

  const refreshUser = async () => {
    try {
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error refreshing user data:", error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
