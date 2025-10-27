/**
 * Identity Types
 * Aligned with backend Identity module types and endpoints
 * Source: Backend/src/features/identity/types/identity.types.ts
 */

// =============================================================================
// CORE IDENTITY TYPES
// =============================================================================

export interface UserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  timezone?: string;
  locale?: string;
  lastLoginAt?: Date | string;
  status: UserStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "PENDING_VERIFICATION";

/**
 * Authenticated user type for AuthContext
 */
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  roles?: string[];
  permissions?: string[];
  tenantId?: string;
}

// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: IdentityDeviceInfo;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    user: UserProfile;
    sessionId: string;
    deviceTrusted: boolean;
    requiresMfa?: boolean;
    mfaToken?: string;
  };
  message: string;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  timezone?: string;
  locale?: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: UserProfile;
    tokens: TokenPair;
    emailVerificationRequired: boolean;
  };
  message: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: TokenPair; // Backend returns TokenPair directly
  message: string;
}

// =============================================================================
// JWT TOKEN CLAIMS
// =============================================================================

export interface JWTPayload {
  sub: string; // user id
  email: string;
  tenantId?: string; // optional for global operations
  memberId?: string; // Member ID within tenant
  sessionId: string;
  roles?: string[]; // roles within tenant
  permissions?: string[]; // effective permissions
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}

// =============================================================================
// DEVICE INFORMATION
// =============================================================================

export interface IdentityDeviceInfo {
  type: IdentityDeviceType;
  name: string;
  userAgent: string;
  fingerprint?: string;
  ipAddress?: string;
  location?: GeolocationInfo;
}

export type IdentityDeviceType =
  | "MOBILE"
  | "DESKTOP"
  | "TABLET"
  | "BROWSER"
  | "API_CLIENT";

export interface GeolocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
}

// =============================================================================
// VALIDATION & ERROR TYPES
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface IdentityError {
  code: string;
  message: string;
  details?: ValidationError[];
  correlationId?: string;
}

// =============================================================================
// API RESPONSE WRAPPER
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  errors?: IdentityError[];
  correlationId?: string;
}

// =============================================================================
// IDENTITY STATE TYPES
// =============================================================================

export interface IdentityState {
  user: UserProfile | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: Date | null;
}

export interface IdentityActions {
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}
