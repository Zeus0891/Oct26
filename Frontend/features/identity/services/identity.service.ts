/**
 * Identity Service
 * Core identity API client for authentication and user management
 * Aligned with backend /api/identity endpoints
 */

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UserProfile,
  ApiResponse,
  JWTPayload,
} from "../types";

// =============================================================================
// API CLIENT CONFIGURATION
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const IDENTITY_API_BASE = `${API_BASE_URL}/api/identity`;

interface ApiClientConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
}

const DEFAULT_CONFIG: ApiClientConfig = {
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
};

// =============================================================================
// API CLIENT CLASS
// =============================================================================

class IdentityApiClient {
  private config: ApiClientConfig;
  private controller: AbortController | null = null;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = false
  ): Promise<ApiResponse<T>> {
    this.controller = new AbortController();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add auth header if required
    if (requiresAuth) {
      const token = this.getStoredToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    // Add tenant header if available (for tenant-scoped operations)
    const tenantId = this.getCurrentTenantId();
    if (tenantId) {
      headers["X-Tenant-Id"] = tenantId;
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: this.controller.signal,
    };

    try {
      const response = await fetch(
        `${IDENTITY_API_BASE}${endpoint}`,
        requestOptions
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new IdentityServiceError(
          `HTTP ${response.status}`,
          errorData.message || response.statusText,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof IdentityServiceError) {
        throw error;
      }

      throw new IdentityServiceError(
        "NETWORK_ERROR",
        error instanceof Error ? error.message : "Network request failed"
      );
    }
  }

  private getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private getCurrentTenantId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("currentTenantId");
  }

  // =============================================================================
  // AUTHENTICATION METHODS
  // =============================================================================

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse["data"]>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.request<RegisterResponse["data"]>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  async refreshTokens(
    refreshRequest: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    const response = await this.request<RefreshTokenResponse["data"]>(
      "/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify(refreshRequest),
      }
    );

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  async logout(): Promise<void> {
    await this.request(
      "/auth/logout",
      {
        method: "POST",
      },
      true
    );
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await this.request<{ isValid: boolean }>(
        "/auth/validate",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data?.isValid || false;
    } catch {
      return false;
    }
  }

  // =============================================================================
  // USER PROFILE METHODS
  // =============================================================================

  async getCurrentUser(): Promise<UserProfile> {
    const response = await this.request<UserProfile>(
      "/users/me",
      {
        method: "GET",
      },
      true
    );

    if (!response.data) {
      throw new IdentityServiceError("NO_USER_DATA", "User data not found");
    }

    return response.data;
  }

  async updateUser(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const response = await this.request<UserProfile>(
      `/users/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updates),
      },
      true
    );

    if (!response.data) {
      throw new IdentityServiceError("UPDATE_FAILED", "Failed to update user");
    }

    return response.data;
  }

  // =============================================================================
  // TOKEN UTILITIES
  // =============================================================================

  parseJWT(token: string): JWTPayload | null {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error parsing JWT:", error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const payload = this.parseJWT(token);
    if (!payload) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  getTokenTimeUntilExpiry(token: string): number | null {
    const payload = this.parseJWT(token);
    if (!payload) return null;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - currentTime;
    return Math.max(0, timeUntilExpiry);
  }

  // =============================================================================
  // REQUEST CANCELLATION
  // =============================================================================

  cancelCurrentRequests(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class IdentityServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "IdentityServiceError";
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const identityService = new IdentityApiClient();

// =============================================================================
// CONVENIENCE METHODS
// =============================================================================

export const identityApi = {
  // Authentication
  login: (credentials: LoginRequest) => identityService.login(credentials),
  register: (userData: RegisterRequest) => identityService.register(userData),
  logout: () => identityService.logout(),
  refreshTokens: (refreshToken: string) =>
    identityService.refreshTokens({ refreshToken }),

  // User Management
  getCurrentUser: () => identityService.getCurrentUser(),
  updateUser: (userId: string, updates: Partial<UserProfile>) =>
    identityService.updateUser(userId, updates),

  // Token Utilities
  validateToken: (token: string) => identityService.validateToken(token),
  parseJWT: (token: string) => identityService.parseJWT(token),
  isTokenExpired: (token: string) => identityService.isTokenExpired(token),

  // Request Management
  cancelRequests: () => identityService.cancelCurrentRequests(),
};

export default identityService;
