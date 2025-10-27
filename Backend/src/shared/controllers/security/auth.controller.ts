/**
 * Authentication Controller - Cross-tenant authentication endpoints
 *
 * Provides secure authentication endpoints including login, logout, token refresh,
 * and session validation for multi-tenant environments with comprehensive
 * security controls and audit logging.
 *
 * @module AuthController
 * @category Shared Controllers - Security
 * @description Authentication endpoints controller
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import {
  ControllerError,
  ValidationError,
  AuthenticatedRequest,
} from "../base/base.controller";
import {
  AuthService,
  AuthCredentials,
  AuthResult,
  ApiResponse,
} from "../../services/security/auth.service";
import {
  AuditService,
  AuditEventType,
  AuditSeverity,
} from "../../services/audit/audit.service";
import { ValidationService } from "../../services/base/validation.service";
import {
  ValidationFactory,
  ValidationResult,
  ValidationContext,
} from "../../validators/validation.types";
import { RequestContext } from "../../services/base/context.service";

/**
 * Login request DTO
 */
export interface LoginRequestDto {
  /** User identifier (email or username) */
  identifier: string;
  /** User password */
  password: string;
  /** Tenant identifier */
  tenantId: string;
  /** Remember me flag */
  rememberMe?: boolean;
  /** Client information */
  clientInfo?: {
    /** Client IP address */
    ipAddress?: string;
    /** User agent string */
    userAgent?: string;
    /** Device fingerprint */
    deviceFingerprint?: string;
  };
}

/**
 * Token refresh request DTO
 */
export interface RefreshTokenRequestDto {
  /** Refresh token */
  refreshToken: string;
  /** Tenant identifier */
  tenantId: string;
}

/**
 * Logout request DTO
 */
export interface LogoutRequestDto {
  /** Whether to logout from all devices */
  allDevices?: boolean;
  /** Refresh token (optional) */
  refreshToken?: string;
}

/**
 * Login response DTO
 */
export interface LoginResponseDto {
  /** Authentication result */
  auth: AuthResult;
  /** User information */
  user?: {
    id: string;
    email: string;
    name?: string;
    roles: string[];
    permissions: string[];
    tenantId: string;
  };
}

/**
 * Authentication Controller
 *
 * Handles all authentication-related endpoints with comprehensive security
 * controls, rate limiting, and audit logging for multi-tenant environments.
 *
 * @example
 * ```typescript
 * @Controller('/api/v1/auth')
 * export class ApplicationAuthController extends AuthController {
 *   constructor(
 *     authService: AuthService,
 *     auditService: AuditService
 *   ) {
 *     super(authService, auditService);
 *   }
 * }
 * ```
 */
export class AuthController {
  constructor(
    protected readonly authService: AuthService,
    protected readonly auditService: AuditService,
    protected readonly validationService: ValidationService = new ValidationService()
  ) {}

  /**
   * Handle POST requests for user authentication
   *
   * 🔒 Middleware Requirements: None (public endpoint with internal rate limiting)
   * 🔍 RLS: Not applicable (pre-authentication endpoint)
   * 📝 Audit: Authentication attempts logged as HIGH severity for security monitoring
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const startTime = Date.now();
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.get("user-agent") || "unknown";

    try {
      const loginRequest = req.body as LoginRequestDto;

      // Audit login attempt start
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.HIGH,
        description: `Authentication attempt for user: ${loginRequest.identifier} in tenant: ${loginRequest.tenantId}`,
        userId: undefined, // No user context yet
        tenantId: loginRequest.tenantId,
        resource: {
          type: "authentication",
          id: "login_attempt",
          name: "user_login",
        },
        metadata: {
          identifier: loginRequest.identifier,
          tenantId: loginRequest.tenantId,
          ipAddress: ipAddress,
          userAgent: userAgent,
          rememberMe: loginRequest.rememberMe || false,
          attemptTime: new Date().toISOString(),
        },
      });

      const result = await this.handleLogin(loginRequest, req);

      // Audit successful login
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.HIGH,
        description: `Successful authentication for user: ${loginRequest.identifier} in tenant: ${loginRequest.tenantId}`,
        userId: result.data?.user?.id,
        tenantId: loginRequest.tenantId,
        resource: {
          type: "authentication",
          id: "login_success",
          name: "user_login_success",
        },
        metadata: {
          identifier: loginRequest.identifier,
          tenantId: loginRequest.tenantId,
          ipAddress: ipAddress,
          userAgent: userAgent,
          executionTime: Date.now() - startTime,
          sessionId: result.data?.auth?.session?.sessionId,
          roles: result.data?.user?.roles,
          permissions: result.data?.user?.permissions?.length,
        },
      });

      res.status(200).json(result);
    } catch (error) {
      // Audit failed login attempt
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: `Failed authentication attempt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: undefined,
        tenantId: (req.body as LoginRequestDto)?.tenantId,
        resource: {
          type: "authentication",
          id: "login_failure",
          name: "user_login_failure",
        },
        metadata: {
          identifier: (req.body as LoginRequestDto)?.identifier,
          tenantId: (req.body as LoginRequestDto)?.tenantId,
          error: error instanceof Error ? error.message : String(error),
          ipAddress: ipAddress,
          userAgent: userAgent,
          executionTime: Date.now() - startTime,
          attemptTime: new Date().toISOString(),
        },
      });

      next(error);
    }
  }

  /**
   * Handle POST requests for token refresh
   *
   * 🔒 Middleware Requirements: None (public endpoint with token validation)
   * 🔍 RLS: Not applicable (token-based authentication endpoint)
   * 📝 Audit: Token refresh attempts logged as MEDIUM severity for session monitoring
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const startTime = Date.now();
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.get("user-agent") || "unknown";

    try {
      const refreshRequest = req.body as RefreshTokenRequestDto;

      // Audit token refresh attempt
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.MEDIUM,
        description: `Token refresh attempt for tenant: ${refreshRequest.tenantId}`,
        userId: undefined, // Will be determined from token
        tenantId: refreshRequest.tenantId,
        resource: {
          type: "authentication",
          id: "token_refresh",
          name: "token_refresh_attempt",
        },
        metadata: {
          tenantId: refreshRequest.tenantId,
          ipAddress: ipAddress,
          userAgent: userAgent,
          refreshTime: new Date().toISOString(),
        },
      });

      const result = await this.handleRefresh(refreshRequest, req);

      // Audit successful token refresh
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.MEDIUM,
        description: `Successful token refresh for tenant: ${refreshRequest.tenantId}`,
        userId: result.data?.user?.userId,
        tenantId: refreshRequest.tenantId,
        resource: {
          type: "authentication",
          id: "token_refresh_success",
          name: "token_refresh_success",
        },
        metadata: {
          tenantId: refreshRequest.tenantId,
          ipAddress: ipAddress,
          userAgent: userAgent,
          executionTime: Date.now() - startTime,
          newSessionId: result.data?.session?.sessionId,
        },
      });

      res.status(200).json(result);
    } catch (error) {
      // Audit failed token refresh
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: `Failed token refresh attempt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: undefined,
        tenantId: (req.body as RefreshTokenRequestDto)?.tenantId,
        resource: {
          type: "authentication",
          id: "token_refresh_failure",
          name: "token_refresh_failure",
        },
        metadata: {
          tenantId: (req.body as RefreshTokenRequestDto)?.tenantId,
          error: error instanceof Error ? error.message : String(error),
          ipAddress: ipAddress,
          userAgent: userAgent,
          executionTime: Date.now() - startTime,
        },
      });

      next(error);
    }
  }

  /**
   * Handle POST requests for user logout
   *
   * 🔒 Middleware Requirements: jwt-auth (requires valid session)
   * 🔍 RLS: Uses authenticated user context for session termination
   * 📝 Audit: Logout events logged as MEDIUM severity for session monitoring
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async logout(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const startTime = Date.now();
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.get("user-agent") || "unknown";

    try {
      if (!req.context?.actor || !req.context?.tenant) {
        throw new ControllerError(
          "Authentication and tenant context required",
          401
        );
      }

      const logoutRequest = req.body as LogoutRequestDto;

      // Audit logout attempt
      await this.auditService.logEvent({
        type: AuditEventType.DELETE,
        severity: AuditSeverity.MEDIUM,
        description: `User logout attempt - ${
          logoutRequest.allDevices ? "all devices" : "current device"
        }`,
        userId: req.context.actor.userId,
        tenantId: req.context.tenant.tenantId,
        resource: {
          type: "authentication",
          id: "user_logout",
          name: "user_logout_attempt",
        },
        metadata: {
          correlationId: req.context.correlationId,
          allDevices: logoutRequest.allDevices || false,
          ipAddress: ipAddress,
          userAgent: userAgent,
          logoutTime: new Date().toISOString(),
        },
      });

      const result = await this.handleLogout(logoutRequest, req);

      // Audit successful logout
      await this.auditService.logEvent({
        type: AuditEventType.DELETE,
        severity: AuditSeverity.MEDIUM,
        description: `Successful user logout - ${
          logoutRequest.allDevices ? "all devices" : "current device"
        }`,
        userId: req.context.actor.userId,
        tenantId: req.context.tenant.tenantId,
        resource: {
          type: "authentication",
          id: "user_logout_success",
          name: "user_logout_success",
        },
        metadata: {
          correlationId: req.context.correlationId,
          allDevices: logoutRequest.allDevices || false,
          ipAddress: ipAddress,
          userAgent: userAgent,
          executionTime: Date.now() - startTime,
        },
      });

      res.status(200).json(result);
    } catch (error) {
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.MEDIUM,
        description: `Failed logout attempt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: req.context?.actor?.userId,
        tenantId: req.context?.tenant?.tenantId,
        resource: {
          type: "authentication",
          id: "user_logout_failure",
          name: "user_logout_failure",
        },
        metadata: {
          correlationId: req.context?.correlationId,
          error: error instanceof Error ? error.message : String(error),
          ipAddress: ipAddress,
          userAgent: userAgent,
          executionTime: Date.now() - startTime,
        },
      });

      next(error);
    }
  }

  /**
   * Handle GET requests for current user session info
   *
   * 🔒 Middleware Requirements: jwt-auth (requires valid session)
   * 🔍 RLS: Uses authenticated user context for session validation
   * 📝 Audit: Session validation logged as LOW severity for monitoring
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async getSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const startTime = Date.now();

    try {
      if (!req.context?.actor || !req.context?.tenant) {
        throw new ControllerError(
          "Authentication and tenant context required",
          401
        );
      }

      // Audit session validation
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.LOW,
        description: `Session validation check for user`,
        userId: req.context.actor.userId,
        tenantId: req.context.tenant.tenantId,
        resource: {
          type: "authentication",
          id: "session_validation",
          name: "session_validation_check",
        },
        metadata: {
          correlationId: req.context.correlationId,
          userAgent: req.get("user-agent"),
          ipAddress: req.ip || req.connection.remoteAddress,
        },
      });

      const result = await this.handleGetSession(req);

      res.status(200).json(result);
    } catch (error) {
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.MEDIUM,
        description: `Failed session validation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: req.context?.actor?.userId,
        tenantId: req.context?.tenant?.tenantId,
        resource: {
          type: "authentication",
          id: "session_validation_failure",
          name: "session_validation_failure",
        },
        metadata: {
          correlationId: req.context?.correlationId,
          error: error instanceof Error ? error.message : String(error),
          executionTime: Date.now() - startTime,
          userAgent: req.get("user-agent"),
          ipAddress: req.ip || req.connection.remoteAddress,
        },
      });

      next(error);
    }
  }

  /**
   * Handle login operation
   */
  protected async handleLogin(
    loginRequest: LoginRequestDto,
    req: Request
  ): Promise<ApiResponse<LoginResponseDto>> {
    const startTime = Date.now();

    try {
      // Validate login request
      await this.validateLoginRequest(loginRequest);

      // Extract client information
      const clientInfo = {
        ipAddress: req.ip || loginRequest.clientInfo?.ipAddress,
        userAgent:
          req.headers["user-agent"] || loginRequest.clientInfo?.userAgent,
        deviceFingerprint: loginRequest.clientInfo?.deviceFingerprint,
      };

      // Prepare authentication credentials
      const credentials: AuthCredentials = {
        identifier: loginRequest.identifier,
        password: loginRequest.password,
        tenantId: loginRequest.tenantId,
        deviceInfo: {
          ip: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
          deviceId: clientInfo.deviceFingerprint,
        },
      };

      // Create request context for the operation
      const context: RequestContext = {
        tenant: { tenantId: loginRequest.tenantId },
        actor: undefined, // No actor yet since we're authenticating
        correlationId: this.generateCorrelationId(),
        request: {
          timestamp: new Date(),
          ip: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
        },
      };

      // Perform authentication
      const authResult = await this.authService.authenticate(
        credentials,
        context
      );

      if (!authResult.success) {
        throw new ControllerError("Authentication failed", 401, "AUTH_FAILED");
      }

      // Build login response
      const loginResponse: LoginResponseDto = {
        auth: authResult.data!,
        user: authResult.data!.user
          ? {
              id: authResult.data!.user.userId,
              email: authResult.data!.user.email,
              name: `${authResult.data!.user.firstName || ""} ${
                authResult.data!.user.lastName || ""
              }`.trim(),
              roles: authResult.data!.user.roles,
              permissions: authResult.data!.user.permissions,
              tenantId: authResult.data!.user.tenantId,
            }
          : undefined,
      };

      // Audit successful login
      await this.auditService.logEvent({
        type: AuditEventType.LOGIN,
        severity: AuditSeverity.LOW,
        description: "User login successful",
        userId: authResult.data!.user?.userId,
        tenantId: loginRequest.tenantId,
        metadata: {
          userEmail: authResult.data!.user?.email,
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
          executionTime: Date.now() - startTime,
        },
      });

      return {
        success: true,
        data: loginResponse,
        metadata: {
          timestamp: new Date(),
          requestId: context.correlationId,
        },
      };
    } catch (error) {
      // Audit failed login attempt
      await this.auditService.logEvent({
        type: AuditEventType.LOGIN_FAILED,
        severity: AuditSeverity.HIGH,
        description: `Login failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        tenantId: loginRequest.tenantId,
        metadata: {
          identifier: loginRequest.identifier,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          error: error instanceof Error ? error.message : "Unknown error",
          executionTime: Date.now() - startTime,
        },
      });

      throw error;
    }
  }

  /**
   * Handle token refresh operation
   */
  protected async handleRefresh(
    refreshRequest: RefreshTokenRequestDto,
    req: Request
  ): Promise<ApiResponse<AuthResult>> {
    try {
      // Validate refresh request
      await this.validateRefreshRequest(refreshRequest);

      // Create request context
      const context: RequestContext = {
        tenant: { tenantId: refreshRequest.tenantId },
        actor: undefined,
        correlationId: this.generateCorrelationId(),
        request: {
          timestamp: new Date(),
          ip: req.ip,
          userAgent: req.headers["user-agent"],
        },
      };

      // Refresh tokens
      const result = await this.authService.refreshTokens(
        refreshRequest.refreshToken,
        context
      );

      if (!result.success) {
        throw new ControllerError(
          "Token refresh failed",
          401,
          "REFRESH_FAILED"
        );
      }

      // Build AuthResult from refresh response
      const authResult: AuthResult = {
        success: true,
        tokens: result.data!.tokens,
      };

      return {
        success: true,
        data: authResult,
        metadata: {
          timestamp: new Date(),
          requestId: context.correlationId,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle logout operation
   */
  protected async handleLogout(
    logoutRequest: LogoutRequestDto,
    req: AuthenticatedRequest
  ): Promise<ApiResponse<{ loggedOut: boolean }>> {
    try {
      if (!req.context) {
        throw new ControllerError("Request context not found", 401);
      }

      // Perform logout
      const result = await this.authService.logout(
        req.context.actor!.userId,
        req.context
      );

      // Audit logout
      await this.auditService.logEvent({
        type: AuditEventType.LOGOUT,
        severity: AuditSeverity.LOW,
        description: "User logout",
        userId: req.context.actor!.userId,
        tenantId: req.context.tenant!.tenantId,
        metadata: {
          allDevices: logoutRequest.allDevices || false,
          correlationId: req.context.correlationId,
        },
      });

      return {
        success: true,
        data: { loggedOut: result.success },
        metadata: {
          timestamp: new Date(),
          requestId: req.context.correlationId,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle get session operation
   */
  protected async handleGetSession(
    req: AuthenticatedRequest
  ): Promise<
    ApiResponse<{ userId: string; tenantId: string; roles: string[] }>
  > {
    try {
      if (!req.context || !req.context.actor) {
        throw new ControllerError("Request context not found", 401);
      }

      // Return current session info from context
      const sessionInfo = {
        userId: req.context.actor.userId,
        tenantId: req.context.tenant!.tenantId,
        roles: req.context.actor.roles || [],
      };

      return {
        success: true,
        data: sessionInfo,
        metadata: {
          timestamp: new Date(),
          requestId: req.context.correlationId,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validation methods
   */
  protected async validateLoginRequest(
    request: LoginRequestDto
  ): Promise<void> {
    if (!request.identifier || request.identifier.trim().length === 0) {
      throw new ValidationError("User identifier is required");
    }

    if (!request.password || request.password.length === 0) {
      throw new ValidationError("Password is required");
    }

    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new ValidationError("Tenant ID is required");
    }

    // Validate email format if identifier looks like an email
    if (request.identifier.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.identifier)) {
        throw new ValidationError("Invalid email format");
      }
    }
  }

  protected async validateRefreshRequest(
    request: RefreshTokenRequestDto
  ): Promise<void> {
    if (!request.refreshToken || request.refreshToken.trim().length === 0) {
      throw new ValidationError("Refresh token is required");
    }

    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new ValidationError("Tenant ID is required");
    }
  }

  /**
   * Generate correlation ID for request tracking
   */
  protected generateCorrelationId(): string {
    return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
