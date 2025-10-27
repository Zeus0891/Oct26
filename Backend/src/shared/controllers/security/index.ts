/**
 * Security Controllers Index
 *
 * Exports all security-related controller classes for authentication,
 * authorization, and security monitoring.
 *
 * @module SecurityControllers
 * @category Shared Controllers - Security Infrastructure
 * @description Security controller exports
 * @version 1.0.0
 */

// Authentication controller
export { AuthController } from "./auth.controller";

// Re-export authentication DTOs
export type {
  LoginRequestDto,
  RefreshTokenRequestDto,
  LogoutRequestDto,
  LoginResponseDto,
} from "./auth.controller";

/**
 * Security controller configuration interface
 */
export interface SecurityControllerConfig {
  /** Enable multi-factor authentication */
  enableMFA?: boolean;
  /** Enable session monitoring */
  enableSessionMonitoring?: boolean;
  /** Enable audit logging for security events */
  enableSecurityAudit?: boolean;
  /** Token expiration settings */
  tokenSettings?: {
    accessTokenExpiry?: string;
    refreshTokenExpiry?: string;
  };
  /** Rate limiting settings */
  rateLimitSettings?: {
    maxLoginAttempts?: number;
    lockoutDuration?: number;
  };
}
