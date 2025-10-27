/**
 * MFA Types
 * Multi-Factor Authentication types aligned with backend
 * Source: Backend AuthFactor model and MFA controllers
 */

// =============================================================================
// MFA CORE TYPES
// =============================================================================

export interface AuthFactor {
  id: string;
  userId: string;
  tenantId?: string; // Optional for global MFA
  type: AuthFactorType;
  status: AuthFactorStatus;
  name?: string;
  secret?: string; // Encrypted, only for setup
  backupCodes?: string[]; // Only during setup/regeneration
  lastUsedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type AuthFactorType =
  | "TOTP"
  | "SMS"
  | "EMAIL"
  | "WEBAUTHN"
  | "BACKUP_CODE"
  | "HARDWARE_TOKEN";

export type AuthFactorStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "PENDING_VERIFICATION"
  | "COMPROMISED"
  | "EXPIRED";

// =============================================================================
// MFA SETUP TYPES
// =============================================================================

export interface MfaSetupRequest {
  type: AuthFactorType;
  name?: string;
  phoneNumber?: string; // For SMS
}

export interface MfaSetupResponse {
  success: boolean;
  data: {
    factorId: string;
    type: AuthFactorType;
    qrCodeUrl?: string; // For TOTP
    secret?: string; // For manual TOTP entry
    backupCodes?: string[]; // One-time backup codes
    phoneNumber?: string; // For SMS confirmation
    nextStep: MfaSetupStep;
  };
  message: string;
}

export type MfaSetupStep =
  | "SCAN_QR"
  | "ENTER_CODE"
  | "VERIFY_PHONE"
  | "SAVE_BACKUP_CODES"
  | "COMPLETED";

export interface MfaVerificationRequest {
  factorId: string;
  code: string;
  trustDevice?: boolean;
}

export interface MfaVerificationResponse {
  success: boolean;
  data: {
    verified: boolean;
    factor?: AuthFactor;
    accessToken?: string; // New token after MFA verification
    deviceTrusted?: boolean;
  };
  message: string;
}

// =============================================================================
// MFA CHALLENGE TYPES
// =============================================================================

export interface MfaChallengeRequest {
  factors?: AuthFactorType[]; // Preferred factor types
  sessionToken?: string; // Token from partial login
}

export interface MfaChallengeResponse {
  success: boolean;
  data: {
    challengeId: string;
    availableFactors: MfaFactorOption[];
    expiresAt: string;
  };
  message: string;
}

export interface MfaFactorOption {
  factorId: string;
  type: AuthFactorType;
  name?: string;
  maskedValue?: string; // e.g., "***-***-1234" for phone
  isPreferred: boolean;
}

// =============================================================================
// MFA MANAGEMENT TYPES
// =============================================================================

export interface MfaStatusResponse {
  success: boolean;
  data: {
    isEnabled: boolean;
    factors: AuthFactor[];
    preferredFactor?: AuthFactor;
    backupCodesRemaining: number;
  };
  message: string;
}

export interface MfaDisableRequest {
  currentPassword: string;
  factorId?: string; // If not provided, disables all MFA
}

export interface BackupCodesRegenerationResponse {
  success: boolean;
  data: {
    backupCodes: string[];
    factorId: string;
  };
  message: string;
}

// =============================================================================
// MFA HOOKS TYPES
// =============================================================================

export interface UseMfaReturn {
  // State
  factors: AuthFactor[];
  isEnabled: boolean;
  isLoading: boolean;
  setupInProgress: boolean;
  currentSetup: MfaSetupResponse | null;
  error: string | null;

  // Actions
  setupMfa: (request: MfaSetupRequest) => Promise<MfaSetupResponse>;
  verifyMfaSetup: (request: MfaVerificationRequest) => Promise<boolean>;
  verifyMfaChallenge: (
    request: MfaVerificationRequest
  ) => Promise<MfaVerificationResponse>;
  getMfaStatus: () => Promise<MfaStatusResponse>;
  disableMfa: (request: MfaDisableRequest) => Promise<void>;
  regenerateBackupCodes: (factorId: string) => Promise<string[]>;
  clearError: () => void;
}

// =============================================================================
// MFA CONTEXT TYPES
// =============================================================================

export interface MfaContextData extends UseMfaReturn {
  preferredFactor: AuthFactor | null;
  backupCodesCount: number;
  lastVerification: Date | null;
}

export interface MfaProviderProps {
  children: React.ReactNode;
}
