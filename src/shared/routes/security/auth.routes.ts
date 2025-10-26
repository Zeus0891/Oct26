/**
 * Authentication Routes
 *
 * Cross-tenant authentication endpoints for login, logout, and token refresh.
 * These routes handle authentication without being tied to specific tenants
 * during the initial authentication phase.
 *
 * @module AuthRoutes
 * @category Shared Routes - Security Infrastructure
 * @description Authentication and session management routes
 * @version 1.0.0
 */

import { Router, Request, Response, NextFunction } from "express";
import { MiddlewareChains } from "../middleware-chain.builder";
import { AuthenticatedRequest } from "../../../middlewares/types";

/**
 * Authentication route configuration
 */
export interface AuthRouteConfig {
  /** Base path for auth routes (e.g., '/auth') */
  basePath: string;
  /** Enable password reset functionality */
  enablePasswordReset?: boolean;
  /** Enable email verification */
  enableEmailVerification?: boolean;
  /** Enable social authentication */
  enableSocialAuth?: boolean;
  /** Custom rate limits for auth operations */
  rateLimits?: {
    login?: any;
    register?: any;
    resetPassword?: any;
  };
}

/**
 * Authentication routes class
 *
 * Handles all authentication-related endpoints with proper security
 * middleware and rate limiting.
 */
export class AuthRoutes {
  private readonly router: Router;
  private readonly config: AuthRouteConfig;

  constructor(config: AuthRouteConfig) {
    this.router = Router();
    this.config = config;
    this.setupRoutes();
  }

  /**
   * Setup authentication routes
   */
  private setupRoutes(): void {
    // Login endpoint
    this.router.post(
      "/login",
      ...MiddlewareChains.auth.login(),
      this.handleAsyncRoute(this.loginHandler.bind(this))
    );

    // Logout endpoint
    this.router.post(
      "/logout",
      ...MiddlewareChains.auth.logout(),
      this.handleAsyncRoute(this.logoutHandler.bind(this))
    );

    // Token refresh endpoint
    // Note: Refresh must be public (uses refresh token in body), no JWT required
    this.router.post(
      "/refresh",
      ...MiddlewareChains.public(),
      this.handleAsyncRoute(this.refreshHandler.bind(this))
    );

    // Current user profile
    this.router.get(
      "/me",
      ...MiddlewareChains.authenticated(),
      this.handleAsyncRoute(this.meHandler.bind(this))
    );

    // Optional features
    if (this.config.enablePasswordReset) {
      this.setupPasswordResetRoutes();
    }

    if (this.config.enableEmailVerification) {
      this.setupEmailVerificationRoutes();
    }

    if (this.config.enableSocialAuth) {
      this.setupSocialAuthRoutes();
    }
  }

  /**
   * Login handler
   */
  private async loginHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password, tenantSlug } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: "INVALID_CREDENTIALS",
          message: "Email and password are required",
        });
        return;
      }

      // Mock successful login response
      // In real implementation, this would call AuthController
      const result = {
        success: true,
        data: {
          user: {
            id: "user-123",
            email,
            tenantId: "tenant-123",
            roles: ["USER"],
            permissions: ["READ"],
          },
          tokens: {
            accessToken: "jwt-access-token",
            refreshToken: "jwt-refresh-token",
            expiresIn: 3600,
          },
          tenant: tenantSlug
            ? {
                id: "tenant-123",
                slug: tenantSlug,
                name: "Example Tenant",
              }
            : null,
        },
        message: "Login successful",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout handler
   */
  private async logoutHandler(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = {
        success: true,
        message: "Logout successful",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Token refresh handler
   */
  private async refreshHandler(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: "INVALID_TOKEN",
          message: "Refresh token is required",
        });
        return;
      }

      // Mock token refresh response
      const result = {
        success: true,
        data: {
          accessToken: "new-jwt-access-token",
          refreshToken: "new-jwt-refresh-token",
          expiresIn: 3600,
        },
        message: "Token refreshed successfully",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Current user profile handler
   */
  private async meHandler(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: "UNAUTHORIZED",
          message: "User not authenticated",
        });
        return;
      }

      const result = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            tenantId: user.tenantId,
            roles: user.roles,
            permissions: user.permissions,
          },
          tenant: req.tenant || null,
        },
        message: "User profile retrieved successfully",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Setup password reset routes
   */
  private setupPasswordResetRoutes(): void {
    // Request password reset
    this.router.post(
      "/forgot-password",
      ...MiddlewareChains.public(),
      this.handleAsyncRoute(this.forgotPasswordHandler.bind(this))
    );

    // Reset password with token
    this.router.post(
      "/reset-password",
      ...MiddlewareChains.public(),
      this.handleAsyncRoute(this.resetPasswordHandler.bind(this))
    );

    // Change password (authenticated)
    this.router.post(
      "/change-password",
      ...MiddlewareChains.authenticated(),
      this.handleAsyncRoute(this.changePasswordHandler.bind(this))
    );
  }

  /**
   * Setup email verification routes
   */
  private setupEmailVerificationRoutes(): void {
    // Send verification email
    this.router.post(
      "/send-verification",
      ...MiddlewareChains.authenticated(),
      this.handleAsyncRoute(this.sendVerificationHandler.bind(this))
    );

    // Verify email with token
    this.router.post(
      "/verify-email",
      ...MiddlewareChains.public(),
      this.handleAsyncRoute(this.verifyEmailHandler.bind(this))
    );
  }

  /**
   * Setup social authentication routes
   */
  private setupSocialAuthRoutes(): void {
    // Google OAuth
    this.router.post(
      "/oauth/google",
      ...MiddlewareChains.public(),
      this.handleAsyncRoute(this.googleOAuthHandler.bind(this))
    );

    // Microsoft OAuth
    this.router.post(
      "/oauth/microsoft",
      ...MiddlewareChains.public(),
      this.handleAsyncRoute(this.microsoftOAuthHandler.bind(this))
    );
  }

  /**
   * Password reset handlers
   */
  private async forgotPasswordHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;

      const result = {
        success: true,
        message: "Password reset email sent successfully",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  private async resetPasswordHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      const result = {
        success: true,
        message: "Password reset successfully",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  private async changePasswordHandler(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;

      const result = {
        success: true,
        message: "Password changed successfully",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Email verification handlers
   */
  private async sendVerificationHandler(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = {
        success: true,
        message: "Verification email sent successfully",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  private async verifyEmailHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = req.body;

      const result = {
        success: true,
        message: "Email verified successfully",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Social authentication handlers
   */
  private async googleOAuthHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = req.body;

      const result = {
        success: true,
        data: {
          user: {
            id: "google-user-123",
            email: "user@gmail.com",
            provider: "google",
          },
          tokens: {
            accessToken: "jwt-access-token",
            refreshToken: "jwt-refresh-token",
          },
        },
        message: "Google authentication successful",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  private async microsoftOAuthHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = req.body;

      const result = {
        success: true,
        data: {
          user: {
            id: "microsoft-user-123",
            email: "user@outlook.com",
            provider: "microsoft",
          },
          tokens: {
            accessToken: "jwt-access-token",
            refreshToken: "jwt-refresh-token",
          },
        },
        message: "Microsoft authentication successful",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Async route handler wrapper
   */
  private handleAsyncRoute(
    handler: (req: any, res: Response, next: NextFunction) => Promise<void>
  ): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(handler(req, res, next)).catch(next);
    };
  }

  /**
   * Get the Express router
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Get the base path
   */
  public getBasePath(): string {
    return this.config.basePath;
  }
}

/**
 * Export the authentication routes class
 */
export default AuthRoutes;
