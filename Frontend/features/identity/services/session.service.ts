/**
 * Session Service
 * Session management and validation API client
 * Aligned with backend session endpoints
 */

import {
  SessionData,
  SessionValidationResponse,
  SessionRefreshRequest,
  SessionRevocationRequest,
  ApiResponse,
} from "../types";

// =============================================================================
// SESSION API CLIENT
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SESSION_API_BASE = `${API_BASE_URL}/api/identity/sessions`;

class SessionApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = true
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (requiresAuth) {
      const token = this.getStoredToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    // Add tenant context if available
    const tenantId = this.getCurrentTenantId();
    if (tenantId) {
      headers["X-Tenant-Id"] = tenantId;
    }

    const response = await fetch(`${SESSION_API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new SessionServiceError(
        `HTTP ${response.status}`,
        errorData.message || response.statusText,
        response.status
      );
    }

    return await response.json();
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
  // SESSION VALIDATION METHODS
  // =============================================================================

  async validateSession(): Promise<SessionValidationResponse> {
    const response = await this.request<SessionValidationResponse["data"]>(
      "/validate",
      {
        method: "GET",
      }
    );

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  async getCurrentSession(): Promise<SessionData | null> {
    try {
      const response = await this.request<SessionData>("/current", {
        method: "GET",
      });
      return response.data || null;
    } catch (error) {
      console.error("Failed to get current session:", error);
      return null;
    }
  }

  async getAllSessions(): Promise<SessionData[]> {
    const response = await this.request<SessionData[]>("/all", {
      method: "GET",
    });

    return response.data || [];
  }

  // =============================================================================
  // SESSION MANAGEMENT METHODS
  // =============================================================================

  async refreshSession(request: SessionRefreshRequest): Promise<SessionData> {
    const response = await this.request<SessionData>("/refresh", {
      method: "POST",
      body: JSON.stringify(request),
    });

    if (!response.data) {
      throw new SessionServiceError("REFRESH_FAILED", "Session refresh failed");
    }

    return response.data;
  }

  async extendSession(sessionId?: string): Promise<SessionData> {
    const endpoint = sessionId ? `/extend/${sessionId}` : "/extend";
    const response = await this.request<SessionData>(endpoint, {
      method: "POST",
    });

    if (!response.data) {
      throw new SessionServiceError(
        "EXTEND_FAILED",
        "Session extension failed"
      );
    }

    return response.data;
  }

  async revokeSession(request: SessionRevocationRequest): Promise<void> {
    const endpoint = request.sessionId ? `/${request.sessionId}` : "/current";
    await this.request(endpoint, {
      method: "DELETE",
      body: JSON.stringify(request),
    });
  }

  async revokeAllSessions(): Promise<void> {
    await this.request("/all", {
      method: "DELETE",
    });
  }

  // =============================================================================
  // SESSION UTILITIES
  // =============================================================================

  isSessionExpired(session: SessionData): boolean {
    const expiryTime = new Date(session.expiresAt).getTime();
    const currentTime = Date.now();
    return currentTime >= expiryTime;
  }

  getSessionTimeUntilExpiry(session: SessionData): number {
    const expiryTime = new Date(session.expiresAt).getTime();
    const currentTime = Date.now();
    return Math.max(0, expiryTime - currentTime);
  }

  shouldRefreshSession(session: SessionData, thresholdMinutes = 15): boolean {
    const timeUntilExpiry = this.getSessionTimeUntilExpiry(session);
    const thresholdMs = thresholdMinutes * 60 * 1000;
    return timeUntilExpiry <= thresholdMs;
  }

  // =============================================================================
  // LOCAL STORAGE MANAGEMENT
  // =============================================================================

  storeSessionData(
    session: SessionData,
    tokens: { accessToken: string; refreshToken: string }
  ): void {
    if (typeof window === "undefined") return;

    localStorage.setItem("sessionId", session.sessionId);
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("sessionData", JSON.stringify(session));

    if (session.tenantId) {
      localStorage.setItem("currentTenantId", session.tenantId);
    }
  }

  getStoredSessionData(): SessionData | null {
    if (typeof window === "undefined") return null;

    try {
      const sessionData = localStorage.getItem("sessionData");
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error("Error parsing stored session data:", error);
      return null;
    }
  }

  clearSessionData(): void {
    if (typeof window === "undefined") return;

    const keysToRemove = [
      "sessionId",
      "accessToken",
      "refreshToken",
      "sessionData",
      "currentTenantId",
    ];

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  // =============================================================================
  // SESSION MONITORING
  // =============================================================================

  startSessionMonitoring(
    onExpired: () => void,
    onRefreshNeeded: () => void,
    checkInterval = 60000 // 1 minute
  ): () => void {
    const intervalId = setInterval(() => {
      const session = this.getStoredSessionData();
      if (!session) return;

      if (this.isSessionExpired(session)) {
        onExpired();
      } else if (this.shouldRefreshSession(session)) {
        onRefreshNeeded();
      }
    }, checkInterval);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class SessionServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "SessionServiceError";
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const sessionService = new SessionApiClient();

// =============================================================================
// CONVENIENCE METHODS
// =============================================================================

export const sessionApi = {
  // Validation
  validate: () => sessionService.validateSession(),
  getCurrent: () => sessionService.getCurrentSession(),
  getAll: () => sessionService.getAllSessions(),

  // Management
  refresh: (refreshToken: string) =>
    sessionService.refreshSession({ refreshToken }),
  extend: (sessionId?: string) => sessionService.extendSession(sessionId),
  revoke: (sessionId?: string, allSessions = false) =>
    allSessions
      ? sessionService.revokeAllSessions()
      : sessionService.revokeSession({ sessionId }),

  // Utilities
  isExpired: (session: SessionData) => sessionService.isSessionExpired(session),
  timeUntilExpiry: (session: SessionData) =>
    sessionService.getSessionTimeUntilExpiry(session),
  shouldRefresh: (session: SessionData) =>
    sessionService.shouldRefreshSession(session),

  // Storage
  store: (
    session: SessionData,
    tokens: { accessToken: string; refreshToken: string }
  ) => sessionService.storeSessionData(session, tokens),
  getStored: () => sessionService.getStoredSessionData(),
  clear: () => sessionService.clearSessionData(),

  // Monitoring
  startMonitoring: (
    onExpired: () => void,
    onRefreshNeeded: () => void,
    interval?: number
  ) =>
    sessionService.startSessionMonitoring(onExpired, onRefreshNeeded, interval),
};

export default sessionService;
