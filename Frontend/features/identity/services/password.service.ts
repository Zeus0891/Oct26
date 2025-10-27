/**
 * Password Service
 * Password reset and management API client
 * Aligned with backend password endpoints
 */

import { ApiResponse } from "../types";

// =============================================================================
// PASSWORD TYPES
// =============================================================================

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetResponse {
  success: boolean;
  data: {
    resetSent: boolean;
    email: string;
    expiresAt: string;
  };
  message: string;
}

interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordValidateTokenResponse {
  success: boolean;
  data: {
    isValid: boolean;
    email?: string;
    expiresAt?: string;
  };
  message: string;
}

// =============================================================================
// PASSWORD API CLIENT
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const PASSWORD_API_BASE = `${API_BASE_URL}/api/identity/password`;

class PasswordApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(`${PASSWORD_API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || response.statusText);
    }

    return await response.json();
  }

  async requestReset(email: string): Promise<PasswordResetResponse> {
    const response = await this.request<PasswordResetResponse["data"]>(
      "/reset-request",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );

    return {
      success: response.success,
      data: response.data!,
      message: response.message,
    };
  }

  async confirmReset(request: PasswordResetConfirmRequest): Promise<void> {
    await this.request("/reset-confirm", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async validateToken(token: string): Promise<PasswordValidateTokenResponse> {
    const response = await this.request<PasswordValidateTokenResponse["data"]>(
      `/validate-token/${token}`,
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
}

export const passwordService = new PasswordApiClient();
export default passwordService;
