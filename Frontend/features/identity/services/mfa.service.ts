/**
 * MFA Service
 * Multi-Factor Authentication API client
 * Aligned with backend MFA endpoints
 */

import {
  MfaSetupRequest,
  MfaSetupResponse,
  MfaVerificationRequest,
  MfaVerificationResponse,
  MfaChallengeRequest,
  MfaChallengeResponse,
  MfaStatusResponse,
  MfaDisableRequest,
  BackupCodesRegenerationResponse,
  AuthFactor,
  ApiResponse,
} from "../types";

// =============================================================================
// MFA API CLIENT
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const MFA_API_BASE = `${API_BASE_URL}/api/identity/mfa`;

class MfaApiClient {
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

    const response = await fetch(`${MFA_API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new MfaServiceError(
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

  // =============================================================================
  // MFA SETUP METHODS
  // =============================================================================

  async setupTotp(request: MfaSetupRequest): Promise<MfaSetupResponse> {
    const response = await this.request<MfaSetupResponse["data"]>(
      "/totp/setup",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  async verifyTotpSetup(
    request: MfaVerificationRequest
  ): Promise<MfaVerificationResponse> {
    const response = await this.request<MfaVerificationResponse["data"]>(
      "/totp/verify-setup",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  async setupSms(request: MfaSetupRequest): Promise<MfaSetupResponse> {
    const response = await this.request<MfaSetupResponse["data"]>(
      "/sms/setup",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  async verifySmsSetup(
    request: MfaVerificationRequest
  ): Promise<MfaVerificationResponse> {
    const response = await this.request<MfaVerificationResponse["data"]>(
      "/sms/verify-setup",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  // =============================================================================
  // MFA VERIFICATION METHODS
  // =============================================================================

  async verifyTotp(
    request: MfaVerificationRequest
  ): Promise<MfaVerificationResponse> {
    const response = await this.request<MfaVerificationResponse["data"]>(
      "/totp/verify",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  async verifySms(
    request: MfaVerificationRequest
  ): Promise<MfaVerificationResponse> {
    const response = await this.request<MfaVerificationResponse["data"]>(
      "/sms/verify",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  async verifyBackupCode(
    request: MfaVerificationRequest
  ): Promise<MfaVerificationResponse> {
    const response = await this.request<MfaVerificationResponse["data"]>(
      "/backup-code/verify",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  // =============================================================================
  // MFA CHALLENGE METHODS
  // =============================================================================

  async createChallenge(
    request: MfaChallengeRequest
  ): Promise<MfaChallengeResponse> {
    const response = await this.request<MfaChallengeResponse["data"]>(
      "/challenge",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  async sendSmsChallenge(factorId: string): Promise<void> {
    await this.request(`/sms/send/${factorId}`, {
      method: "POST",
    });
  }

  // =============================================================================
  // MFA MANAGEMENT METHODS
  // =============================================================================

  async getMfaStatus(): Promise<MfaStatusResponse> {
    const response = await this.request<MfaStatusResponse["data"]>("/status", {
      method: "GET",
    });

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  async getAuthFactors(): Promise<AuthFactor[]> {
    const response = await this.request<AuthFactor[]>("/factors", {
      method: "GET",
    });

    return response.data || [];
  }

  async updateAuthFactor(
    factorId: string,
    updates: Partial<AuthFactor>
  ): Promise<AuthFactor> {
    const response = await this.request<AuthFactor>(`/factors/${factorId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });

    if (!response.data) {
      throw new MfaServiceError("UPDATE_FAILED", "Failed to update MFA factor");
    }

    return response.data;
  }

  async deleteAuthFactor(factorId: string): Promise<void> {
    await this.request(`/factors/${factorId}`, {
      method: "DELETE",
    });
  }

  async disableMfa(request: MfaDisableRequest): Promise<void> {
    await this.request("/disable", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // =============================================================================
  // BACKUP CODES METHODS
  // =============================================================================

  async regenerateBackupCodes(
    factorId: string
  ): Promise<BackupCodesRegenerationResponse> {
    const response = await this.request<
      BackupCodesRegenerationResponse["data"]
    >(`/backup-codes/regenerate/${factorId}`, {
      method: "POST",
    });

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  async getBackupCodesCount(factorId: string): Promise<number> {
    const response = await this.request<{ count: number }>(
      `/backup-codes/count/${factorId}`,
      {
        method: "GET",
      }
    );

    return response.data?.count || 0;
  }

  // =============================================================================
  // MFA UTILITIES
  // =============================================================================

  validateTotpCode(code: string): boolean {
    // Basic validation - should be 6 digits
    return /^\d{6}$/.test(code);
  }

  validateSmsCode(code: string): boolean {
    // SMS codes can be 4-8 digits depending on provider
    return /^\d{4,8}$/.test(code);
  }

  validateBackupCode(code: string): boolean {
    // Backup codes are typically 8-10 characters alphanumeric
    return /^[A-Z0-9]{8,10}$/.test(code.toUpperCase());
  }

  formatBackupCode(code: string): string {
    // Format backup code with spaces for readability (XXXX-XXXX)
    const cleaned = code.replace(/\s/g, "").toUpperCase();
    return cleaned.replace(/(.{4})/g, "$1-").slice(0, -1);
  }

  // =============================================================================
  // QR CODE UTILITIES
  // =============================================================================

  generateQrCodeUrl(
    secret: string,
    userEmail: string,
    issuer = "Your App"
  ): string {
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedEmail = encodeURIComponent(userEmail);
    const totpUri = `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}`;

    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`;
  }
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class MfaServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "MfaServiceError";
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const mfaService = new MfaApiClient();

// =============================================================================
// CONVENIENCE METHODS
// =============================================================================

export const mfaApi = {
  // Setup
  setupTotp: (request: MfaSetupRequest) => mfaService.setupTotp(request),
  verifyTotpSetup: (request: MfaVerificationRequest) =>
    mfaService.verifyTotpSetup(request),
  setupSms: (request: MfaSetupRequest) => mfaService.setupSms(request),
  verifySmsSetup: (request: MfaVerificationRequest) =>
    mfaService.verifySmsSetup(request),

  // Verification
  verifyTotp: (request: MfaVerificationRequest) =>
    mfaService.verifyTotp(request),
  verifySms: (request: MfaVerificationRequest) => mfaService.verifySms(request),
  verifyBackupCode: (request: MfaVerificationRequest) =>
    mfaService.verifyBackupCode(request),

  // Management
  getStatus: () => mfaService.getMfaStatus(),
  getFactors: () => mfaService.getAuthFactors(),
  updateFactor: (factorId: string, updates: Partial<AuthFactor>) =>
    mfaService.updateAuthFactor(factorId, updates),
  deleteFactor: (factorId: string) => mfaService.deleteAuthFactor(factorId),
  disable: (request: MfaDisableRequest) => mfaService.disableMfa(request),

  // Backup Codes
  regenerateBackupCodes: (factorId: string) =>
    mfaService.regenerateBackupCodes(factorId),
  getBackupCodesCount: (factorId: string) =>
    mfaService.getBackupCodesCount(factorId),

  // Utilities
  validateTotpCode: (code: string) => mfaService.validateTotpCode(code),
  validateSmsCode: (code: string) => mfaService.validateSmsCode(code),
  validateBackupCode: (code: string) => mfaService.validateBackupCode(code),
  formatBackupCode: (code: string) => mfaService.formatBackupCode(code),
  generateQrCodeUrl: (secret: string, userEmail: string, issuer?: string) =>
    mfaService.generateQrCodeUrl(secret, userEmail, issuer),
};

export default mfaService;
