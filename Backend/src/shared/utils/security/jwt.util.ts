/**
 * JWT Utility
 *
 * Provides JSON Web Token operations for authentication and authorization.
 * Includes token creation, verification, and secure handling with proper validation.
 *
 * @module JwtUtils
 * @category Shared Utils - Security
 * @description JWT token operations and management utilities
 * @version 1.0.0
 */

import type { AuthenticationMethod, AuthenticationType } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import { TypeGuards } from "../base/type-guards.util";
import { CryptoUtils } from "./crypto.util";

/**
 * JWT token types
 */
export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
  VERIFICATION = "verification",
  RESET_PASSWORD = "reset_password",
  API = "api",
}

/**
 * JWT payload interface
 */
export interface JwtPayload {
  /** Subject (user ID) */
  sub: string;
  /** Token type */
  type: TokenType;
  /** Issued at timestamp */
  iat?: number;
  /** Expiration timestamp */
  exp?: number;
  /** Not before timestamp */
  nbf?: number;
  /** JWT ID */
  jti?: string;
  /** Issuer */
  iss?: string;
  /** Audience */
  aud?: string | string[];
  /** Custom claims */
  [key: string]: unknown;
  // Common optional custom claims used across the app
  email?: string;
  emailVerified?: boolean;
  tenantId?: string;
  roles?: string[];
  permissions?: string[];
  sessionId?: string;
  deviceId?: string;
  authMethod?: AuthenticationMethod;
  authType?: AuthenticationType;
  mfaVerified?: boolean;
}

/**
 * JWT signing options
 */
export interface JwtSignOptions {
  /** Token expiration time */
  expiresIn?: string | number;
  /** Not before time */
  notBefore?: string | number;
  /** Issuer */
  issuer?: string;
  /** Audience */
  audience?: string | string[];
  /** JWT ID */
  jwtid?: string;
  /** Algorithm to use */
  algorithm?: jwt.Algorithm;
  /** Additional headers */
  header?: Record<string, unknown>;
}

/**
 * JWT verification options
 */
export interface JwtVerifyOptions {
  /** Expected issuer */
  issuer?: string;
  /** Expected audience */
  audience?: string | string[];
  /** Maximum age */
  maxAge?: string | number;
  /** Clock tolerance */
  clockTolerance?: number;
  /** Ignore expiration */
  ignoreExpiration?: boolean;
  /** Ignore not before */
  ignoreNotBefore?: boolean;
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  /** Whether token is valid */
  isValid: boolean;
  /** Decoded payload if valid */
  payload?: JwtPayload;
  /** Error message if invalid */
  error?: string;
  /** Whether token is expired */
  isExpired?: boolean;
  /** Whether token is not yet valid */
  isNotYetValid?: boolean;
}

/**
 * Token pair for access/refresh pattern
 */
export interface TokenPair {
  /** Access token */
  accessToken: string;
  /** Refresh token */
  refreshToken: string;
  /** Access token expiration */
  accessExpiresAt: Date;
  /** Refresh token expiration */
  refreshExpiresAt: Date;
}

/**
 * Result of token refresh operation
 */
export interface RefreshTokenResult {
  /** Whether refresh operation succeeded */
  success: boolean;
  /** Error message if refresh failed */
  error?: string;
  /** Error code for programmatic handling */
  code?: string;
  /** New token pair if refresh succeeded */
  tokens?: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  };
  /** Additional metadata about the refresh operation */
  metadata?: {
    userId: string;
    rotatedRefreshToken: boolean;
    preservedClaims: string[];
    tokenId?: string;
    issuedAt: Date;
  };
}

/**
 * Utility class for JWT token operations.
 * Provides secure token creation, verification, and management with proper validation.
 *
 * @example
 * ```typescript
 * import { JwtUtils, TokenType } from '@/shared/utils';
 *
 * // Create tokens
 * const accessToken = JwtUtils.sign(
 *   { sub: "user123", type: TokenType.ACCESS },
 *   "secret",
 *   { expiresIn: "15m" }
 * );
 *
 * // Verify token
 * const result = JwtUtils.verify(accessToken, "secret");
 * if (result.isValid) {
 *   console.log("User ID:", result.payload.sub);
 * }
 *
 * // Create token pair
 * const tokens = JwtUtils.createTokenPair("user123", "secret");
 * ```
 */
export class JwtUtils {
  /**
   * Default algorithm for JWT signing
   */
  private static readonly DEFAULT_ALGORITHM: jwt.Algorithm = "HS256";

  /**
   * Default access token expiration
   */
  private static readonly DEFAULT_ACCESS_EXPIRATION = "15m";

  /**
   * Default refresh token expiration
   */
  private static readonly DEFAULT_REFRESH_EXPIRATION = "7d";

  /**
   * Signs a JWT token with the provided payload and secret.
   *
   * @param payload - JWT payload
   * @param secret - Secret key for signing
   * @param options - Signing options
   * @returns Signed JWT token
   * @complexity O(n) where n is payload size
   */
  static sign(
    payload: JwtPayload,
    secret: string,
    options: JwtSignOptions = {}
  ): string {
    if (!TypeGuards.isObject(payload)) {
      throw new Error("Payload must be an object");
    }

    if (!TypeGuards.isString(secret) || secret.length === 0) {
      throw new Error("Secret must be a non-empty string");
    }

    if (!payload.sub || !TypeGuards.isString(payload.sub)) {
      throw new Error("Payload must contain a valid subject (sub)");
    }

    if (!payload.type || !Object.values(TokenType).includes(payload.type)) {
      throw new Error("Payload must contain a valid token type");
    }

    const {
      expiresIn,
      notBefore,
      issuer,
      audience,
      jwtid,
      algorithm = this.DEFAULT_ALGORITHM,
      header,
    } = options;

    // Generate JTI if not provided
    const tokenId = jwtid || CryptoUtils.generateSecureToken(16);

    // Prepare payload (do not include jti in payload if using options.jwtid)
    const tokenPayload: JwtPayload = {
      ...payload,
    };

    // Prepare signing options
    const signOptions: any = { algorithm };
    if (expiresIn !== undefined) signOptions.expiresIn = expiresIn;
    if (notBefore !== undefined) signOptions.notBefore = notBefore;
    if (issuer !== undefined) signOptions.issuer = issuer;
    if (audience !== undefined) signOptions.audience = audience;
    if (tokenId) signOptions.jwtid = tokenId;

    try {
  return jwt.sign(tokenPayload, secret, signOptions);
    } catch (error) {
      throw new Error(
        `JWT signing failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Verifies and decodes a JWT token.
   *
   * @param token - JWT token to verify
   * @param secret - Secret key for verification
   * @param options - Verification options
   * @returns Token validation result
   * @complexity O(n) where n is token size
   */
  static verify(
    token: string,
    secret: string,
    options: JwtVerifyOptions = {}
  ): TokenValidationResult {
    if (!TypeGuards.isString(token) || token.trim().length === 0) {
      return {
        isValid: false,
        error: "Token must be a non-empty string",
      };
    }

    if (!TypeGuards.isString(secret) || secret.length === 0) {
      return {
        isValid: false,
        error: "Secret must be a non-empty string",
      };
    }

    const {
      issuer,
      audience,
      maxAge,
      clockTolerance,
      ignoreExpiration = false,
      ignoreNotBefore = false,
    } = options;

    const verifyOptions: any = {
      issuer,
      audience,
      maxAge,
      clockTolerance,
      ignoreExpiration,
      ignoreNotBefore,
    };

    try {
      const decoded = jwt.verify(
        token,
        secret,
        verifyOptions
      ) as unknown as JwtPayload;

      // Additional validation
      if (!decoded.sub || !TypeGuards.isString(decoded.sub)) {
        return {
          isValid: false,
          error: "Token missing valid subject",
        };
      }

      if (!decoded.type || !Object.values(TokenType).includes(decoded.type)) {
        return {
          isValid: false,
          error: "Token missing valid type",
        };
      }

      return {
        isValid: true,
        payload: decoded,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        let errorMsg = "Invalid token";
        let isExpired = false;
        let isNotYetValid = false;

        if (error instanceof jwt.TokenExpiredError) {
          errorMsg = "Token has expired";
          isExpired = true;
        } else if (error instanceof jwt.NotBeforeError) {
          errorMsg = "Token not yet valid";
          isNotYetValid = true;
        } else if (error.message.includes("invalid signature")) {
          errorMsg = "Invalid token signature";
        } else if (error.message.includes("malformed")) {
          errorMsg = "Malformed token";
        }

        return {
          isValid: false,
          error: errorMsg,
          isExpired,
          isNotYetValid,
        };
      }

      return {
        isValid: false,
        error: "Token verification failed",
      };
    }
  }

  /**
   * Decodes a JWT token without verification (unsafe - use for inspection only).
   *
   * @param token - JWT token to decode
   * @returns Decoded token components or null
   * @complexity O(n) where n is token size
   */
  static decode(token: string): {
    header: Record<string, unknown>;
    payload: JwtPayload;
    signature: string;
  } | null {
    if (!TypeGuards.isString(token)) return null;

    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === "string") return null;

      return {
        header: decoded.header as unknown as Record<string, unknown>,
        payload: decoded.payload as JwtPayload,
        signature: decoded.signature,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Creates an access token with standard claims.
   *
   * @param userId - User identifier
   * @param secret - Signing secret
   * @param options - Additional options
   * @returns Access token
   * @complexity O(n) where n is payload size
   */
  static createAccessToken(
    userId: string,
    secret: string,
    options: {
      expiresIn?: string;
      permissions?: string[];
      roles?: string[];
      tenantId?: string;
      sessionId?: string;
    } = {}
  ): string {
    const {
      expiresIn = this.DEFAULT_ACCESS_EXPIRATION,
      permissions = [],
      roles = [],
      tenantId,
      sessionId,
    } = options;

    const payload: JwtPayload = {
      sub: userId,
      type: TokenType.ACCESS,
      permissions,
      roles,
      tenantId,
      sessionId,
    };

    return this.sign(payload, secret, { expiresIn });
  }

  /**
   * Creates a refresh token with minimal claims.
   *
   * @param userId - User identifier
   * @param secret - Signing secret
   * @param options - Additional options
   * @returns Refresh token
   * @complexity O(n) where n is payload size
   */
  static createRefreshToken(
    userId: string,
    secret: string,
    options: {
      expiresIn?: string;
      sessionId?: string;
      deviceId?: string;
    } = {}
  ): string {
    const {
      expiresIn = this.DEFAULT_REFRESH_EXPIRATION,
      sessionId,
      deviceId,
    } = options;

    const payload: JwtPayload = {
      sub: userId,
      type: TokenType.REFRESH,
      sessionId,
      deviceId,
    };

    return this.sign(payload, secret, { expiresIn });
  }

  /**
   * Creates a token pair (access + refresh tokens).
   *
   * @param userId - User identifier
   * @param secret - Signing secret
   * @param options - Token options
   * @returns Token pair with expiration dates
   * @complexity O(n) where n is payload size
   */
  static createTokenPair(
    userId: string,
    secret: string,
    options: {
      accessExpiresIn?: string;
      refreshExpiresIn?: string;
      permissions?: string[];
      roles?: string[];
      tenantId?: string;
      sessionId?: string;
      deviceId?: string;
    } = {}
  ): TokenPair {
    const {
      accessExpiresIn = this.DEFAULT_ACCESS_EXPIRATION,
      refreshExpiresIn = this.DEFAULT_REFRESH_EXPIRATION,
      sessionId = CryptoUtils.generateSecureToken(16),
      ...tokenOptions
    } = options;

    const accessToken = this.createAccessToken(userId, secret, {
      ...tokenOptions,
      expiresIn: accessExpiresIn,
      sessionId,
    });

    const refreshToken = this.createRefreshToken(userId, secret, {
      expiresIn: refreshExpiresIn,
      sessionId,
      deviceId: options.deviceId,
    });

    // Calculate expiration dates
    const now = new Date();
    const accessExpiresAt = new Date(
      now.getTime() + this.parseExpiration(accessExpiresIn)
    );
    const refreshExpiresAt = new Date(
      now.getTime() + this.parseExpiration(refreshExpiresIn)
    );

    return {
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
    };
  }

  /**
   * Creates a verification token for email/phone verification.
   *
   * @param userId - User identifier
   * @param secret - Signing secret
   * @param purpose - Verification purpose
   * @param options - Additional options
   * @returns Verification token
   * @complexity O(n) where n is payload size
   */
  static createVerificationToken(
    userId: string,
    secret: string,
    purpose: string,
    options: {
      expiresIn?: string;
      email?: string;
      phone?: string;
    } = {}
  ): string {
    const { expiresIn = "1h", email, phone } = options;

    const payload: JwtPayload = {
      sub: userId,
      type: TokenType.VERIFICATION,
      purpose,
      email,
      phone,
    };

    return this.sign(payload, secret, { expiresIn });
  }

  /**
   * Creates a password reset token.
   *
   * @param userId - User identifier
   * @param secret - Signing secret
   * @param options - Additional options
   * @returns Password reset token
   * @complexity O(n) where n is payload size
   */
  static createPasswordResetToken(
    userId: string,
    secret: string,
    options: {
      expiresIn?: string;
      currentPasswordHash?: string;
    } = {}
  ): string {
    const { expiresIn = "30m", currentPasswordHash } = options;

    const payload: JwtPayload = {
      sub: userId,
      type: TokenType.RESET_PASSWORD,
      // Include hash of current password to invalidate token if password changes
      currentPasswordHash: currentPasswordHash
        ? CryptoUtils.hash(currentPasswordHash).hash
        : undefined,
    };

    return this.sign(payload, secret, { expiresIn });
  }

  /**
   * Creates an API token for service-to-service communication.
   *
   * @param serviceId - Service identifier
   * @param secret - Signing secret
   * @param options - Additional options
   * @returns API token
   * @complexity O(n) where n is payload size
   */
  static createApiToken(
    serviceId: string,
    secret: string,
    options: {
      scopes?: string[];
      expiresIn?: string;
      audience?: string;
    } = {}
  ): string {
    const { scopes = [], expiresIn, audience } = options;

    const payload: JwtPayload = {
      sub: serviceId,
      type: TokenType.API,
      scopes,
    };

    return this.sign(payload, secret, { expiresIn, audience });
  }

  /**
   * Extracts user ID from token without full verification.
   *
   * @param token - JWT token
   * @returns User ID or null
   * @complexity O(n) where n is token size
   */
  static extractUserId(token: string): string | null {
    const decoded = this.decode(token);
    return decoded?.payload?.sub || null;
  }

  /**
   * Extracts token type from token without full verification.
   *
   * @param token - JWT token
   * @returns Token type or null
   * @complexity O(n) where n is token size
   */
  static extractTokenType(token: string): TokenType | null {
    const decoded = this.decode(token);
    return decoded?.payload?.type || null;
  }

  /**
   * Checks if token is expired without full verification.
   *
   * @param token - JWT token
   * @returns True if token is expired
   * @complexity O(n) where n is token size
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decode(token);
    if (!decoded?.payload?.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return decoded.payload.exp < now;
  }

  /**
   * Gets token expiration date without full verification.
   *
   * @param token - JWT token
   * @returns Expiration date or null
   * @complexity O(n) where n is token size
   */
  static getTokenExpiration(token: string): Date | null {
    const decoded = this.decode(token);
    if (!decoded?.payload?.exp) return null;

    return new Date(decoded.payload.exp * 1000);
  }

  /**
   * Validates token type matches expected type.
   *
   * @param token - JWT token
   * @param secret - Verification secret
   * @param expectedType - Expected token type
   * @returns Validation result
   * @complexity O(n) where n is token size
   */
  static validateTokenType(
    token: string,
    secret: string,
    expectedType: TokenType
  ): TokenValidationResult {
    const result = this.verify(token, secret);

    if (!result.isValid) return result;

    if (result.payload!.type !== expectedType) {
      return {
        isValid: false,
        error: `Expected ${expectedType} token, got ${result.payload!.type}`,
      };
    }

    return result;
  }

  /**
   * Refreshes an access token using a refresh token.
   *
   * @param refreshToken - Valid refresh token
   * @param secret - Verification secret
   * @param newTokenOptions - Options for new access token
   * @returns New access token or null
   * @complexity O(n) where n is token size
   */
  static refreshAccessToken(
    refreshToken: string,
    secret: string,
    newTokenOptions: {
      permissions?: string[];
      roles?: string[];
      tenantId?: string;
      expiresIn?: string;
    } = {}
  ): string | null {
    const result = this.validateTokenType(
      refreshToken,
      secret,
      TokenType.REFRESH
    );

    if (!result.isValid || !result.payload) return null;

    const { sub: userId, sessionId } = result.payload;

    return this.createAccessToken(userId, secret, {
      ...newTokenOptions,
      sessionId: sessionId as string,
    });
  }

  /**
   * Parses expiration string to milliseconds.
   *
   * @param expiration - Expiration string (e.g., "15m", "7d")
   * @returns Milliseconds
   * @complexity O(1)
   */
  private static parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 0;

    const [, amount, unit] = match;
    const value = parseInt(amount, 10);

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }

  /**
   * Creates a blacklist checker for token revocation.
   *
   * @param blacklistedTokens - Set of revoked token IDs
   * @returns Token validator function
   * @complexity O(1) creation, O(1) per check
   */
  static createBlacklistChecker(blacklistedTokens: Set<string>) {
    return (token: string, secret: string): TokenValidationResult => {
      const result = this.verify(token, secret);

      if (!result.isValid) return result;

      const tokenId = result.payload!.jti;
      if (tokenId && blacklistedTokens.has(tokenId)) {
        return {
          isValid: false,
          error: "Token has been revoked",
        };
      }

      return result;
    };
  }

  /**
   * Refreshes an access token using a valid refresh token.
   * Validates the refresh token and generates a new access/refresh token pair.
   * Supports multi-tenant environments with proper session management.
   *
   * @param refreshToken - The refresh token to validate and use
   * @param secret - Secret key for token operations
   * @param options - Refresh options and new token configuration
   * @returns New token pair or error result
   * @complexity O(1)
   *
   * @example
   * ```typescript
   * const refreshResult = JwtUtils.refreshToken(oldRefreshToken, jwtSecret, {
   *   accessExpiresIn: '15m',
   *   refreshExpiresIn: '7d',
   *   rotateRefreshToken: true,
   *   preserveClaims: ['tenantId', 'roles']
   * });
   *
   * if (refreshResult.success) {
   *   const { accessToken, refreshToken } = refreshResult.tokens;
   *   // Use new tokens
   * } else {
   *   // Handle refresh failure (user needs to re-authenticate)
   *   console.error(refreshResult.error);
   * }
   * ```
   */
  static refreshToken(
    refreshToken: string,
    secret: string,
    options: {
      /** Expiration time for new access token */
      accessExpiresIn?: string;
      /** Expiration time for new refresh token */
      refreshExpiresIn?: string;
      /** Whether to rotate (generate new) refresh token */
      rotateRefreshToken?: boolean;
      /** Claims to preserve from original token */
      preserveClaims?: string[];
      /** Additional claims to add to new tokens */
      additionalClaims?: Record<string, unknown>;
      /** Custom issuer */
      issuer?: string;
      /** Custom audience */
      audience?: string | string[];
      /** Custom JWT ID generator */
      jwtIdGenerator?: () => string;
    } = {}
  ): RefreshTokenResult {
    const {
      accessExpiresIn = "15m",
      refreshExpiresIn = "7d",
      rotateRefreshToken = true,
      preserveClaims = [],
      additionalClaims = {},
      issuer,
      audience,
      jwtIdGenerator = () => CryptoUtils.generateUuid(),
    } = options;

    // Validate refresh token
    const validation = this.verify(refreshToken, secret);
    if (!validation.isValid || !validation.payload) {
      return {
        success: false,
        error: validation.error || "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      };
    }

    const payload = validation.payload;

    // Verify it's actually a refresh token
    if (payload.type !== TokenType.REFRESH) {
      return {
        success: false,
        error: "Token is not a refresh token",
        code: "WRONG_TOKEN_TYPE",
      };
    }

    // Check if token is expired (additional safety check)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp <= now) {
      return {
        success: false,
        error: "Refresh token has expired",
        code: "REFRESH_TOKEN_EXPIRED",
      };
    }

    // Extract user ID and preserved claims
    const userId = payload.sub;
    if (!userId) {
      return {
        success: false,
        error: "Refresh token missing user ID",
        code: "MISSING_USER_ID",
      };
    }

    // Build preserved claims object
    const preservedClaims: Record<string, unknown> = {};
    preserveClaims.forEach((claimName) => {
      if (
        claimName in payload &&
        claimName !== "sub" &&
        claimName !== "type" &&
        claimName !== "iat" &&
        claimName !== "exp" &&
        claimName !== "nbf" &&
        claimName !== "jti"
      ) {
        preservedClaims[claimName] = payload[claimName];
      }
    });

    // Merge all claims for new tokens
    const newClaims = {
      ...preservedClaims,
      ...additionalClaims,
    };

    // Generate new access token
    const accessSignOptions: JwtSignOptions = {
      expiresIn: accessExpiresIn,
      issuer,
      audience,
      jwtid: jwtIdGenerator(),
    };

    const newAccessToken = this.sign(
      {
        sub: userId,
        type: TokenType.ACCESS,
        ...newClaims,
      },
      secret,
      accessSignOptions
    );

    // Generate new refresh token if rotation is enabled
    let newRefreshToken: string;
    if (rotateRefreshToken) {
      const refreshSignOptions: JwtSignOptions = {
        expiresIn: refreshExpiresIn,
        issuer,
        audience,
        jwtid: jwtIdGenerator(),
      };

      newRefreshToken = this.sign(
        {
          sub: userId,
          type: TokenType.REFRESH,
          ...newClaims,
        },
        secret,
        refreshSignOptions
      );
    } else {
      newRefreshToken = refreshToken; // Keep existing refresh token
    }

    return {
      success: true,
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenType: "Bearer",
        expiresIn: this.parseExpirationTime(accessExpiresIn),
      },
      metadata: {
        userId,
        rotatedRefreshToken: rotateRefreshToken,
        preservedClaims: Object.keys(preservedClaims),
        tokenId: accessSignOptions.jwtid,
        issuedAt: new Date(),
      },
    };
  }

  /**
   * Helper method to parse expiration time strings to seconds.
   *
   * @param expiresIn - Expiration string (e.g., '15m', '7d', '1h')
   * @returns Expiration time in seconds
   * @complexity O(1)
   */
  private static parseExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 60 * 60 * 24;
      default:
        return 900;
    }
  }
}
