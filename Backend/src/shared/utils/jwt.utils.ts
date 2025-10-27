/**
 * Legacy JWT API Compatibility
 *
 * Provides backward-compatible exports for JWT utilities
 * to maintain existing import statements throughout the codebase.
 */

import { JwtUtils, TokenType } from "./security/jwt.util";
import { v4 as uuidv4 } from "uuid";

// Export the class for new usage
export { JwtUtils };

// Backward compatibility exports
export const generateCorrelationId = (): string => {
  return uuidv4();
};

// Re-export everything from the security JWT util
export * from "./security/jwt.util";

// ---------------------------------------------------------------------------
// Backward-compat named helpers expected by legacy code
// ---------------------------------------------------------------------------

export const TOKEN_EXPIRATION = {
  ACCESS_TOKEN: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;

export function generateAccessToken(payload: Record<string, unknown>): string {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return JwtUtils.sign(
    { ...(payload as any), type: TokenType.ACCESS },
    secret,
    {
      expiresIn: `${TOKEN_EXPIRATION.ACCESS_TOKEN}s`,
    }
  );
}

export function generateRefreshToken(payload: Record<string, unknown>): string {
  const secret =
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "dev-secret";
  return JwtUtils.sign(
    { ...(payload as any), type: TokenType.REFRESH },
    secret,
    { expiresIn: `${TOKEN_EXPIRATION.REFRESH_TOKEN}s` }
  );
}

export function generateTokenPair(payload: Record<string, unknown>) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer" as const,
    expiresIn: TOKEN_EXPIRATION.ACCESS_TOKEN,
  };
}

export function validateAccessToken(token: string) {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return JwtUtils.verify(token, secret);
}

export function validateRefreshToken(token: string) {
  const secret =
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "dev-secret";
  return JwtUtils.verify(token, secret);
}
