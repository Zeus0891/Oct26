/**
 * Legacy Crypto API Compatibility
 *
 * Provides backward-compatible exports for the CryptoUtils class
 * to maintain existing import statements throughout the codebase.
 */

import { CryptoUtils, HashResult } from "./security/crypto.util";

// Export the class for new usage
export { CryptoUtils };

// Backward compatibility exports
export const createHash = (data: string, algorithm?: string): string => {
  const result = CryptoUtils.hash(data, algorithm as any);
  return result.hash;
};

// Return string hash for compatibility (DB stores string)
export const hashPassword = (password: string): string => {
  return CryptoUtils.hashPassword(password).hash;
};

// Accept either a stored hash string or a HashResult structure
export const verifyPassword = (
  password: string,
  hashOrResult: string | HashResult
): boolean => {
  if (typeof hashOrResult === "string") {
    // Legacy fallback (no salt) - compare against simple hash
    const derived = CryptoUtils.hash(password);
    return CryptoUtils.constantTimeEqual(derived.hash, hashOrResult);
  }
  return CryptoUtils.verifyPassword(password, hashOrResult);
};

export const generateSecureToken = (length?: number): string => {
  return CryptoUtils.generateSecureToken(length);
};

// ---------------------------------------------------------------------------
// Encryption compatibility adapters expected by some utilities
// ---------------------------------------------------------------------------
export interface EncryptionConfig {
  key: string; // symmetric key or passphrase
  algorithm?: string; // currently ignored; AES-256-GCM by default
}

export async function encrypt(
  data: string,
  configOrPassword: string | EncryptionConfig
): Promise<import("./security/crypto.util").EncryptedData> {
  const password =
    typeof configOrPassword === "string"
      ? configOrPassword
      : configOrPassword.key;
  return await CryptoUtils.encrypt(data, password);
}

export async function decrypt(
  encrypted: Parameters<typeof CryptoUtils.decrypt>[0],
  configOrPassword: string | EncryptionConfig
): Promise<string> {
  const password =
    typeof configOrPassword === "string"
      ? configOrPassword
      : configOrPassword.key;
  return CryptoUtils.decrypt(encrypted, password);
}

export function generateEncryptionKey(bytes = 32): string {
  return CryptoUtils.generateRandomBytes(bytes).toString("base64");
}

// Re-export types and enums
export * from "./security/crypto.util";
