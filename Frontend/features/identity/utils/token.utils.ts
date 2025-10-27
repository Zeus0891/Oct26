/**
 * Token Utils
 * JWT token management and validation utilities
 * Aligned with backend token architecture
 */

// Note: jwt-decode dependency not installed, using manual parsing

// =============================================================================
// TOKEN INTERFACES
// =============================================================================

interface JWTPayload {
  sub: string; // User ID
  email: string;
  tenantId?: string;
  memberId?: string;
  roles?: string[];
  permissions?: string[];
  iat: number;
  exp: number;
  jti?: string; // JWT ID
  iss?: string; // Issuer
  aud?: string; // Audience
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType?: string;
}

// =============================================================================
// TOKEN VALIDATION UTILS
// =============================================================================

/**
 * Decode JWT token safely (manual implementation)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    // Split the token into its parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token structure");
    }

    // Decode the payload (second part)
    const payload = parts[1];

    // Add padding if necessary for proper base64 decoding
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);

    // Replace URL-safe characters
    const normalizedPayload = paddedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    // Decode and parse
    const decodedPayload = atob(normalizedPayload);
    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.warn("Failed to decode JWT token:", error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp <= currentTime;
};

/**
 * Get token expiration time in seconds
 */
export const getTokenExpirationTime = (token: string): number | null => {
  const payload = decodeToken(token);
  return payload ? payload.exp : null;
};

/**
 * Get time until token expires (in seconds)
 */
export const getTimeUntilExpiration = (token: string): number => {
  const payload = decodeToken(token);
  if (!payload) return 0;

  const currentTime = Math.floor(Date.now() / 1000);
  const timeLeft = payload.exp - currentTime;
  return Math.max(0, timeLeft);
};

/**
 * Check if token should be refreshed (expires in next 5 minutes)
 */
export const shouldRefreshToken = (token: string): boolean => {
  const timeLeft = getTimeUntilExpiration(token);
  return timeLeft <= 300; // 5 minutes in seconds
};

/**
 * Format time until expiration for display
 */
export const formatTimeUntilExpiration = (token: string): string => {
  const seconds = getTimeUntilExpiration(token);

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
// TOKEN EXTRACTION UTILS
// =============================================================================

/**
 * Extract user data from token
 */
export const extractUserFromToken = (token: string) => {
  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    tenantId: payload.tenantId,
    memberId: payload.memberId,
    roles: payload.roles || [],
    permissions: payload.permissions || [],
  };
};

/**
 * Extract roles from token
 */
export const extractRolesFromToken = (token: string): string[] => {
  const payload = decodeToken(token);
  return payload?.roles || [];
};

/**
 * Extract permissions from token
 */
export const extractPermissionsFromToken = (token: string): string[] => {
  const payload = decodeToken(token);
  return payload?.permissions || [];
};

/**
 * Extract tenant ID from token
 */
export const extractTenantIdFromToken = (token: string): string | null => {
  const payload = decodeToken(token);
  return payload?.tenantId || null;
};

/**
 * Check if token has specific role
 */
export const tokenHasRole = (token: string, role: string): boolean => {
  const roles = extractRolesFromToken(token);
  return roles.includes(role);
};

/**
 * Check if token has specific permission
 */
export const tokenHasPermission = (
  token: string,
  permission: string
): boolean => {
  const permissions = extractPermissionsFromToken(token);
  return permissions.includes(permission);
};

// =============================================================================
// TOKEN STORAGE UTILS
// =============================================================================

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const TOKEN_EXPIRY_KEY = "token_expiry";

/**
 * Store token pair securely
 */
export const storeTokens = (tokenPair: TokenPair): void => {
  try {
    // Store in secure httpOnly cookies would be better, but localStorage for now
    localStorage.setItem(ACCESS_TOKEN_KEY, tokenPair.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokenPair.refreshToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, tokenPair.expiresAt);
  } catch (error) {
    console.error("Failed to store tokens:", error);
  }
};

/**
 * Get stored access token
 */
export const getStoredAccessToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.warn("Failed to retrieve access token:", error);
    return null;
  }
};

/**
 * Get stored refresh token
 */
export const getStoredRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn("Failed to retrieve refresh token:", error);
    return null;
  }
};

/**
 * Get stored token pair
 */
export const getStoredTokens = (): TokenPair | null => {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const expiresAt = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (accessToken && refreshToken && expiresAt) {
      return { accessToken, refreshToken, expiresAt };
    }

    return null;
  } catch (error) {
    console.warn("Failed to retrieve tokens:", error);
    return null;
  }
};

/**
 * Clear stored tokens
 */
export const clearStoredTokens = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.warn("Failed to clear tokens:", error);
  }
};

/**
 * Check if we have valid stored tokens
 */
export const hasValidStoredTokens = (): boolean => {
  const tokens = getStoredTokens();
  if (!tokens) return false;

  return !isTokenExpired(tokens.accessToken);
};

// =============================================================================
// TOKEN REFRESH UTILS
// =============================================================================

/**
 * Check if refresh token is expired
 */
export const isRefreshTokenExpired = (refreshToken: string): boolean => {
  // Refresh tokens typically have longer expiry, but check anyway
  return isTokenExpired(refreshToken);
};

/**
 * Prepare authorization header
 */
export const getAuthorizationHeader = (token?: string): string | null => {
  const accessToken = token || getStoredAccessToken();
  return accessToken ? `Bearer ${accessToken}` : null;
};

/**
 * Create auth headers object
 */
export const createAuthHeaders = (token?: string): Record<string, string> => {
  const authHeader = getAuthorizationHeader(token);
  return authHeader ? { Authorization: authHeader } : {};
};

/**
 * Add tenant header if present in token
 */
export const createAuthHeadersWithTenant = (
  token?: string
): Record<string, string> => {
  const accessToken = token || getStoredAccessToken();
  if (!accessToken) return {};

  const headers = createAuthHeaders(accessToken);
  const tenantId = extractTenantIdFromToken(accessToken);

  if (tenantId) {
    headers["X-Tenant-Id"] = tenantId;
  }

  return headers;
};

// =============================================================================
// TOKEN VALIDATION HELPERS
// =============================================================================

/**
 * Validate token structure
 */
export const isValidTokenStructure = (token: string): boolean => {
  if (!token || typeof token !== "string") return false;

  // JWT should have 3 parts separated by dots
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  // Each part should be base64url encoded
  try {
    parts.forEach((part) => {
      if (!part) throw new Error("Empty part");
      atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Get token information for debugging
 */
export const getTokenInfo = (token: string) => {
  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    userId: payload.sub,
    email: payload.email,
    tenantId: payload.tenantId,
    roles: payload.roles,
    permissions: payload.permissions,
    issuedAt: new Date(payload.iat * 1000).toISOString(),
    expiresAt: new Date(payload.exp * 1000).toISOString(),
    timeLeft: formatTimeUntilExpiration(token),
    isExpired: isTokenExpired(token),
    shouldRefresh: shouldRefreshToken(token),
  };
};

/**
 * Compare two tokens to see if they represent the same session
 */
export const areTokensFromSameSession = (
  token1: string,
  token2: string
): boolean => {
  const payload1 = decodeToken(token1);
  const payload2 = decodeToken(token2);

  if (!payload1 || !payload2) return false;

  return (
    payload1.sub === payload2.sub &&
    payload1.jti === payload2.jti &&
    payload1.iat === payload2.iat
  );
};

/**
 * Check if token is for specific tenant
 */
export const isTokenForTenant = (token: string, tenantId: string): boolean => {
  const tokenTenantId = extractTenantIdFromToken(token);
  return tokenTenantId === tenantId;
};

/**
 * Safe token operations with error handling
 */
export const safeTokenOperation = <T>(
  operation: () => T,
  fallback: T,
  errorMessage?: string
): T => {
  try {
    return operation();
  } catch (error) {
    if (errorMessage) {
      console.warn(errorMessage, error);
    }
    return fallback;
  }
};
