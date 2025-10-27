/**
 * Session Utils
 * Utility functions for session management and validation
 * Aligned with backend session architecture
 */

import {
  SessionData,
  SessionStatus,
  DeviceInfo,
  ExtendedSessionData,
} from "../types/session.types";

// =============================================================================
// SESSION VALIDATION UTILS
// =============================================================================

/**
 * Validate session expiration
 */
export const isSessionExpired = (session: SessionData): boolean => {
  if (!session.expiresAt) return false;
  return new Date(session.expiresAt) <= new Date();
};

/**
 * Check if session needs refresh (expires in next 5 minutes)
 */
export const shouldRefreshSession = (session: SessionData): boolean => {
  if (!session.expiresAt) return false;
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  return new Date(session.expiresAt) <= fiveMinutesFromNow;
};

/**
 * Calculate session remaining time in seconds
 */
export const getSessionRemainingTime = (session: SessionData): number => {
  if (!session.expiresAt) return 0;
  const remaining = new Date(session.expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(remaining / 1000));
};

/**
 * Format session remaining time for display
 */
export const formatSessionRemainingTime = (session: SessionData): string => {
  const seconds = getSessionRemainingTime(session);

  if (seconds <= 0) return "Expired";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

// =============================================================================
// SESSION CREATION UTILS
// =============================================================================

/**
 * Create session data from login response
 */
export const createSessionFromLogin = (
  loginResponse: LoginResponse,
  deviceInfo?: DeviceInfo
): ExtendedSessionData => {
  return {
    sessionId: loginResponse.session?.id || crypto.randomUUID(),
    id: loginResponse.session?.id || crypto.randomUUID(),
    userId: loginResponse.user.id,
    tenantId: loginResponse.tenantId,
    memberId: loginResponse.memberId,
    accessToken: loginResponse.accessToken,
    refreshToken: loginResponse.refreshToken,
    expiresAt: loginResponse.expiresAt,
    createdAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
    ipAddress: deviceInfo?.ipAddress || "unknown",
    userAgent: deviceInfo?.userAgent || navigator.userAgent,
    deviceId: deviceInfo?.deviceId,
    deviceName: deviceInfo?.deviceName,
    status: "ACTIVE" as SessionStatus,
    isMfaVerified: loginResponse.isMfaVerified || false,
    roles: loginResponse.roles || [],
    permissions: loginResponse.permissions || [],
  };
};

// Type for login response
interface LoginResponse {
  user: { id: string };
  session?: { id: string };
  tenantId?: string;
  memberId?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  isMfaVerified?: boolean;
  roles?: string[];
  permissions?: string[];
}

/**
 * Update session with new token data
 */
export const updateSessionTokens = (
  session: ExtendedSessionData,
  tokenResponse: TokenResponse
): ExtendedSessionData => {
  return {
    ...session,
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken || session.refreshToken,
    expiresAt: tokenResponse.expiresAt,
    lastAccessedAt: new Date().toISOString(),
  };
};

// Type for token response
interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}

/**
 * Mark session as MFA verified
 */
export const markSessionMfaVerified = (
  session: ExtendedSessionData
): ExtendedSessionData => {
  return {
    ...session,
    isMfaVerified: true,
    lastAccessedAt: new Date().toISOString(),
  };
};

// =============================================================================
// SESSION CLEANUP UTILS
// =============================================================================

/**
 * Clean expired sessions from array
 */
export const cleanExpiredSessions = (
  sessions: SessionData[]
): SessionData[] => {
  return sessions.filter((session) => !isSessionExpired(session));
};

/**
 * Sort sessions by last accessed (most recent first)
 */
export const sortSessionsByLastAccessed = (
  sessions: SessionData[]
): SessionData[] => {
  return [...sessions].sort(
    (a, b) =>
      new Date(b.lastAccessedAt).getTime() -
      new Date(a.lastAccessedAt).getTime()
  );
};

/**
 * Find active session for user
 */
export const findActiveSession = (
  sessions: SessionData[],
  userId: string,
  tenantId?: string
): SessionData | null => {
  const activeSessions = sessions.filter(
    (session) =>
      session.userId === userId &&
      session.status === "ACTIVE" &&
      !isSessionExpired(session) &&
      (tenantId ? session.tenantId === tenantId : true)
  );

  return activeSessions.length > 0
    ? sortSessionsByLastAccessed(activeSessions)[0]
    : null;
};

// =============================================================================
// SESSION SECURITY UTILS
// =============================================================================

/**
 * Check if session is suspicious (different IP/device)
 */
export const isSessionSuspicious = (
  session: SessionData,
  currentDeviceInfo: DeviceInfo
): boolean => {
  // Check for different IP (basic check)
  if (session.ipAddress && currentDeviceInfo.ipAddress) {
    if (session.ipAddress !== currentDeviceInfo.ipAddress) {
      return true;
    }
  }

  // Check for different device
  if (session.deviceId && currentDeviceInfo.deviceId) {
    if (session.deviceId !== currentDeviceInfo.deviceId) {
      return true;
    }
  }

  return false;
};

/**
 * Generate device fingerprint for session tracking
 */
export const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Device fingerprint", 2, 2);
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join("|");

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(16);
};

/**
 * Create device info from browser
 */
export const createDeviceInfo = (): DeviceInfo => {
  return {
    deviceId: generateDeviceFingerprint(),
    deviceName: getBrowserInfo(),
    userAgent: navigator.userAgent,
    ipAddress: "client", // Will be set by server
    platform: navigator.platform,
    isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
    lastSeen: new Date().toISOString(),
  };
};

/**
 * Get browser info for device naming
 */
export const getBrowserInfo = (): string => {
  const userAgent = navigator.userAgent;

  if (userAgent.includes("Chrome")) return "Chrome Browser";
  if (userAgent.includes("Firefox")) return "Firefox Browser";
  if (userAgent.includes("Safari")) return "Safari Browser";
  if (userAgent.includes("Edge")) return "Edge Browser";

  return "Unknown Browser";
};

// =============================================================================
// SESSION STORAGE UTILS
// =============================================================================

/**
 * Safely store session in localStorage
 */
export const storeSessionSafely = (session: ExtendedSessionData): void => {
  try {
    // Don't store sensitive tokens in localStorage
    const safeSession = {
      sessionId: session.sessionId,
      userId: session.userId,
      tenantId: session.tenantId,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      lastAccessedAt: session.lastAccessedAt,
      deviceId: session.deviceId,
      deviceName: session.deviceName,
      status: session.status,
      isMfaVerified: session.isMfaVerified,
      roles: session.roles,
      permissions: session.permissions,
    };

    localStorage.setItem("session_meta", JSON.stringify(safeSession));
  } catch (error) {
    console.warn("Failed to store session metadata:", error);
  }
};

/**
 * Safely retrieve session from localStorage
 */
export const retrieveStoredSession = (): Partial<SessionData> | null => {
  try {
    const stored = localStorage.getItem("session_meta");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn("Failed to retrieve session metadata:", error);
    return null;
  }
};

/**
 * Clear stored session data
 */
export const clearStoredSession = (): void => {
  try {
    localStorage.removeItem("session_meta");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  } catch (error) {
    console.warn("Failed to clear session data:", error);
  }
};

// =============================================================================
// SESSION VALIDATION HELPERS
// =============================================================================

/**
 * Validate session data structure
 */
export const isValidSessionData = (
  session: unknown
): session is SessionData => {
  if (!session || typeof session !== "object" || session === null) {
    return false;
  }

  const s = session as SessionData;
  return (
    typeof s.sessionId === "string" &&
    typeof s.userId === "string" &&
    typeof s.status === "string" &&
    ["ACTIVE", "EXPIRED", "REVOKED", "TERMINATED"].includes(s.status)
  );
};

/**
 * Check if session requires MFA verification
 */
export const requiresMfaVerification = (
  session: ExtendedSessionData
): boolean => {
  return !session.isMfaVerified;
};

/**
 * Get session display info for UI
 */
export const getSessionDisplayInfo = (session: ExtendedSessionData) => {
  return {
    id: session.id || session.sessionId,
    deviceName: session.deviceName || "Unknown Device",
    location:
      session.ipAddress === "client" ? "Current Device" : session.ipAddress,
    lastActive: formatSessionRemainingTime(session),
    isActive: session.status === "ACTIVE" && !isSessionExpired(session),
    isCurrent: true, // Would be determined by comparison with current session
    createdAt: new Date(session.createdAt).toLocaleDateString(),
  };
};
