/**
 * Session Types
 * Session management and validation types
 * Aligned with backend session handling
 */

// =============================================================================
// SESSION TYPES
// =============================================================================

export interface SessionData {
  sessionId: string;
  userId: string;
  tenantId?: string; // Optional for global sessions
  memberId?: string; // Member ID within tenant
  deviceId?: string;
  status: SessionStatus;
  createdAt: Date | string;
  lastAccessedAt: Date | string;
  expiresAt: Date | string;
  ipAddress?: string;
  userAgent?: string;
}

export type SessionStatus = "ACTIVE" | "EXPIRED" | "REVOKED" | "TERMINATED";

// =============================================================================
// DEVICE TYPES
// =============================================================================

export interface DeviceInfo {
  deviceId?: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
  platform?: string;
  isMobile?: boolean;
  lastSeen?: string;
}

// =============================================================================
// EXTENDED SESSION DATA
// =============================================================================

export interface ExtendedSessionData extends SessionData {
  id?: string; // Alias for sessionId
  accessToken?: string;
  refreshToken?: string;
  deviceName?: string;
  isMfaVerified?: boolean;
  roles?: string[];
  permissions?: string[];
}

export interface SessionValidationResponse {
  success: boolean;
  data: {
    isValid: boolean;
    session?: SessionData;
    user?: {
      id: string;
      email: string;
      roles?: string[];
      permissions?: string[];
    };
  };
  message: string;
}

export interface SessionRefreshRequest {
  refreshToken: string;
}

export interface SessionRevocationRequest {
  sessionId?: string; // If not provided, revokes current session
  allSessions?: boolean; // Revoke all user sessions
}

// =============================================================================
// SESSION CONTEXT TYPES
// =============================================================================

export interface SessionContextData {
  currentSession: SessionData | null;
  activeSessions: SessionData[];
  isSessionValid: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SessionContextActions {
  validateSession: () => Promise<boolean>;
  refreshSession: () => Promise<void>;
  revokeSession: (sessionId?: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  getActiveSessions: () => Promise<SessionData[]>;
  clearSessionError: () => void;
}

// =============================================================================
// SESSION STORAGE TYPES
// =============================================================================

export interface SessionStorageData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
    displayName?: string;
  };
  session: {
    id: string;
    tenantId?: string;
    roles?: string[];
    permissions?: string[];
  };
}

export interface SessionConfig {
  tokenStorageKey: string;
  refreshStorageKey: string;
  userStorageKey: string;
  sessionTimeout: number;
  refreshThreshold: number; // Minutes before expiry to auto-refresh
  maxRetries: number;
}

// =============================================================================
// SESSION HOOKS TYPES
// =============================================================================

export interface UseSessionReturn {
  // State
  session: SessionData | null;
  isValid: boolean;
  isExpired: boolean;
  timeUntilExpiry: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  validateSession: () => Promise<boolean>;
  refreshSession: () => Promise<void>;
  extendSession: () => Promise<void>;
  terminateSession: () => Promise<void>;
}
