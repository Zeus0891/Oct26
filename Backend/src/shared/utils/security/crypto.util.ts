/**
 * Crypto Utility
 *
 * Provides secure cryptographic operations for encryption, hashing, and key management.
 * Uses Node.js crypto module with secure defaults and proper error handling.
 *
 * @module CryptoUtils
 * @category Shared Utils - Security
 * @description Cryptographic operations and security utilities
 * @version 1.0.0
 */

import * as crypto from "crypto";
import { promisify } from "util";
import { TypeGuards } from "../base/type-guards.util";
import { UtilityPerformance } from "../performance/performance.util";

const scryptAsync = promisify(crypto.scrypt);

/**
 * Encryption algorithms supported
 */
export enum EncryptionAlgorithm {
  AES_256_GCM = "aes-256-gcm",
}

/**
 * Hashing algorithms supported
 */
export enum HashAlgorithm {
  SHA256 = "sha256",
  SHA512 = "sha512",
  SHA3_256 = "sha3-256",
  SHA3_512 = "sha3-512",
}

/**
 * Key derivation parameters
 */
export interface KeyDerivationOptions {
  /** Salt for key derivation */
  salt?: Buffer;
  /** Key length in bytes */
  keyLength?: number;
  /** CPU/memory cost parameter */
  N?: number;
  /** Block size parameter */
  r?: number;
  /** Parallelization parameter */
  p?: number;
}

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  /** Encrypted data */
  data: string;
  /** Initialization vector */
  iv: string;
  /** Authentication tag */
  tag: string;
  /** Salt used for key derivation */
  salt: string;
  /** Algorithm used */
  algorithm: EncryptionAlgorithm;
}

/**
 * Hash result with metadata
 */
export interface HashResult {
  /** Hash value */
  hash: string;
  /** Salt used (if any) */
  salt?: string;
  /** Algorithm used */
  algorithm: HashAlgorithm;
  /** Iterations (for password hashing) */
  iterations?: number;
}

/**
 * Utility class for cryptographic operations.
 * Provides secure encryption, hashing, and key management with industry best practices.
 *
 * @example
 * ```typescript
 * import { CryptoUtils } from '@/shared/utils';
 *
 * // Encryption
 * const encrypted = await CryptoUtils.encrypt("sensitive data", "password123");
 * const decrypted = await CryptoUtils.decrypt(encrypted, "password123");
 *
 * // Hashing
 * const hash = CryptoUtils.hash("data to hash", HashAlgorithm.SHA256);
 * const isValid = CryptoUtils.verifyHash("data to hash", hash.hash, hash.salt);
 *
 * // Secure random generation
 * const token = CryptoUtils.generateSecureToken(32);
 * const apiKey = CryptoUtils.generateApiKey();
 * ```
 */
export class CryptoUtils {
  /**
   * Default encryption algorithm
   */
  private static readonly DEFAULT_ALGORITHM = EncryptionAlgorithm.AES_256_GCM;

  /**
   * Default hash algorithm
   */
  private static readonly DEFAULT_HASH_ALGORITHM = HashAlgorithm.SHA256;

  /**
   * Key length in bytes (32 bytes = 256 bits)
   */
  private static readonly KEY_LENGTH = 32;

  /**
   * IV length in bytes (12 bytes for GCM)
   */
  private static readonly IV_LENGTH = 12;

  /**
   * Salt length in bytes
   */
  private static readonly SALT_LENGTH = 16;

  /**
   * Generates cryptographically secure random bytes.
   *
   * @param length - Number of bytes to generate
   * @returns Buffer containing random bytes
   * @complexity O(1)
   */
  static generateRandomBytes(length: number): Buffer {
    if (!TypeGuards.isNumber(length) || length <= 0) {
      throw new Error("Length must be a positive number");
    }

    return crypto.randomBytes(length);
  }

  /**
   * Generates a secure random token as hex string.
   *
   * @param length - Length in bytes (default: 32)
   * @returns Hex-encoded random token
   * @complexity O(1)
   */
  static generateSecureToken(length = 32): string {
    return this.generateRandomBytes(length).toString("hex");
  }

  /**
   * Generates a secure API key.
   *
   * @returns Base64-encoded API key
   * @complexity O(1)
   */
  static generateApiKey(): string {
    const prefix = "sk_";
    const randomPart = this.generateRandomBytes(32).toString("base64url");
    return prefix + randomPart;
  }

  /**
   * Generates a UUID v4.
   *
   * @returns UUID v4 string
   * @complexity O(1)
   */
  static generateUuid(): string {
    const bytes = this.generateRandomBytes(16);

    // Set version (4) and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = bytes.toString("hex");
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32),
    ].join("-");
  }

  /**
   * Derives a key from password using scrypt (async).
   *
   * @param password - Password for key derivation
   * @param salt - Salt for key derivation
   * @param options - Key derivation options
   * @returns Promise resolving to derived key
   * @complexity O(N * r * p) where N, r, p are scrypt parameters
   */
  static async deriveKey(
    password: string,
    salt: Buffer,
    options: KeyDerivationOptions = {}
  ): Promise<Buffer> {
    if (!TypeGuards.isString(password)) {
      throw new Error("Password must be a string");
    }

    if (!Buffer.isBuffer(salt)) {
      throw new Error("Salt must be a Buffer");
    }

    const { keyLength = this.KEY_LENGTH } = options;

    return scryptAsync(password, salt, keyLength) as Promise<Buffer>;
  }

  /**
   * Derives a key from password using scrypt (synchronous).
   * Provides enhanced security for symmetric encryption with configurable parameters.
   * Uses scrypt algorithm which is memory-hard and resistant to ASIC attacks.
   *
   * @param password - Password for key derivation
   * @param salt - Salt for key derivation (should be unique per password)
   * @param options - Key derivation options
   * @returns Derived key buffer
   * @complexity O(N * r * p) where N, r, p are scrypt parameters
   *
   * @example
   * ```typescript
   * const salt = CryptoUtils.generateRandomBytes(32);
   * const key = CryptoUtils.deriveKeyFromPassword('userPassword123', salt, {
   *   keyLength: 32,
   *   N: 16384,  // CPU/memory cost
   *   r: 8,      // Block size
   *   p: 1       // Parallelization
   * });
   *
   * // Use derived key for encryption
   * const encrypted = await CryptoUtils.encryptWithDerivedKey(data, key);
   * ```
   */
  static deriveKeyFromPassword(
    password: string,
    salt: Buffer,
    options: KeyDerivationOptions = {}
  ): Buffer {
    if (!TypeGuards.isString(password)) {
      throw new Error("Password must be a string");
    }

    if (!Buffer.isBuffer(salt)) {
      throw new Error("Salt must be a Buffer");
    }

    if (salt.length < 16) {
      throw new Error("Salt must be at least 16 bytes long");
    }

    const {
      keyLength = this.KEY_LENGTH,
      N = 16384, // CPU/memory cost (2^14)
      r = 8, // Block size
      p = 1, // Parallelization
    } = options;

    // Validate scrypt parameters
    if (N <= 1 || (N & (N - 1)) !== 0) {
      throw new Error("N must be a power of 2 greater than 1");
    }

    if (r <= 0 || p <= 0) {
      throw new Error("r and p must be positive integers");
    }

    if (keyLength <= 0 || keyLength > 2048) {
      throw new Error("keyLength must be between 1 and 2048 bytes");
    }

    try {
      return crypto.scryptSync(password, salt, keyLength, { N, r, p });
    } catch (error) {
      throw new Error(
        `Key derivation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Derives a key from password using PBKDF2 (synchronous).
   * Alternative key derivation method using PBKDF2-HMAC-SHA256.
   * Less memory-intensive than scrypt but still cryptographically secure.
   *
   * @param password - Password for key derivation
   * @param salt - Salt for key derivation (should be unique per password)
   * @param options - PBKDF2 options
   * @returns Derived key buffer
   * @complexity O(iterations) where iterations is the iteration count
   *
   * @example
   * ```typescript
   * const salt = CryptoUtils.generateRandomBytes(32);
   * const key = CryptoUtils.deriveKeyFromPasswordPBKDF2('userPassword123', salt, {
   *   keyLength: 32,
   *   iterations: 100000,  // Recommended minimum for 2024+
   *   digest: 'sha256'
   * });
   *
   * // Use derived key for encryption
   * const encrypted = await CryptoUtils.encryptWithDerivedKey(data, key);
   * ```
   */
  static deriveKeyFromPasswordPBKDF2(
    password: string,
    salt: Buffer,
    options: {
      keyLength?: number;
      iterations?: number;
      digest?: string;
    } = {}
  ): Buffer {
    if (!TypeGuards.isString(password)) {
      throw new Error("Password must be a string");
    }

    if (!Buffer.isBuffer(salt)) {
      throw new Error("Salt must be a Buffer");
    }

    if (salt.length < 16) {
      throw new Error("Salt must be at least 16 bytes long");
    }

    const {
      keyLength = this.KEY_LENGTH,
      iterations = 100000, // Recommended minimum for 2024+
      digest = "sha256",
    } = options;

    // Validate parameters
    if (keyLength <= 0 || keyLength > 2048) {
      throw new Error("keyLength must be between 1 and 2048 bytes");
    }

    if (iterations < 10000) {
      throw new Error("iterations must be at least 10,000 for security");
    }

    try {
      return crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest);
    } catch (error) {
      throw new Error(
        `PBKDF2 key derivation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
  /**
   * Encrypts data using AES-256-GCM with password-based key derivation.
   *
   * @param data - Data to encrypt
   * @param password - Password for encryption
   * @param options - Key derivation options
   * @returns Encrypted data structure
   * @complexity O(n + k) where n is data length and k is key derivation time
   *
   * @example
   * ```typescript
   * const encryptedData = await CryptoUtils.encrypt('sensitive data', 'myPassword123');
   * // Returns: { data: "base64...", iv: "base64...", tag: "", salt: "base64...", algorithm: "aes-256-gcm" }
   *
   * const decrypted = await CryptoUtils.decrypt(encryptedData, 'myPassword123');
   * // Returns: "sensitive data"
   * ```
   */
  static async encrypt(
    data: string,
    password: string,
    options: KeyDerivationOptions = {}
  ): Promise<EncryptedData> {
    if (!TypeGuards.isString(data)) {
      throw new Error("Data must be a string");
    }

    if (!TypeGuards.isString(password)) {
      throw new Error("Password must be a string");
    }

    // Generate random salt and IV
    const salt = options.salt || this.generateRandomBytes(this.SALT_LENGTH);
    const iv = this.generateRandomBytes(this.IV_LENGTH);

    // Derive encryption key
    const key = await this.deriveKey(password, salt, options);

    // Create cipher (AES-256-GCM)
    const cipher = crypto.createCipheriv(
      this.DEFAULT_ALGORITHM,
      key,
      iv
    ) as any;

    // Encrypt data
    const encrypted = Buffer.concat([
      cipher.update(data, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag() as Buffer;

    return {
      data: encrypted.toString("base64"),
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
      salt: salt.toString("base64"),
      algorithm: this.DEFAULT_ALGORITHM,
    };
  }

  /**
   * Decrypts data using AES-256-GCM with password-based key derivation.
   *
   * @param encryptedData - Encrypted data structure
   * @param password - Password for decryption
   * @param options - Key derivation options
   * @returns Decrypted data string
   * @complexity O(n + k) where n is data length and k is key derivation time
   */
  static async decrypt(
    encryptedData: EncryptedData,
    password: string,
    options: KeyDerivationOptions = {}
  ): Promise<string> {
    if (!TypeGuards.isObject(encryptedData)) {
      throw new Error("Encrypted data must be an object");
    }

    if (!TypeGuards.isString(password)) {
      throw new Error("Password must be a string");
    }

    const { data, iv, tag, salt, algorithm } = encryptedData;

    if (algorithm !== this.DEFAULT_ALGORITHM) {
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    // Parse base64 components
    const encryptedBuffer = Buffer.from(data, "base64");
    const ivBuffer = Buffer.from(iv, "base64");
    const tagBuffer = Buffer.from(tag, "base64");
    const saltBuffer = Buffer.from(salt, "base64");

    // Derive decryption key
    const key = await this.deriveKey(password, saltBuffer, options);

    // Create decipher (AES-256-GCM)
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      ivBuffer
    ) as any;
    if (tagBuffer && tagBuffer.length > 0) {
      decipher.setAuthTag(tagBuffer);
    }

    try {
      // Decrypt data
      const decrypted = Buffer.concat([
        decipher.update(encryptedBuffer),
        decipher.final(),
      ]);

      return decrypted.toString("utf8");
    } catch (error) {
      throw new Error("Decryption failed: invalid password or corrupted data");
    }
  }

  /**
   * Creates a hash of data using specified algorithm.
   *
   * @param data - Data to hash
   * @param algorithm - Hash algorithm to use
   * @param salt - Optional salt for the hash
   * @returns Hash result with metadata
   * @complexity O(n) where n is data length
   */
  static hash(
    data: string | Buffer,
    algorithm: HashAlgorithm = this.DEFAULT_HASH_ALGORITHM,
    salt?: Buffer
  ): HashResult {
    if (!TypeGuards.isString(data) && !Buffer.isBuffer(data)) {
      throw new Error("Data must be a string or Buffer");
    }

    const hash = crypto.createHash(algorithm);

    if (salt) {
      hash.update(salt);
    }

    hash.update(data);

    return {
      hash: hash.digest("hex"),
      salt: salt?.toString("hex"),
      algorithm,
    };
  }

  /**
   * Creates an HMAC (Hash-based Message Authentication Code).
   *
   * @param data - Data to authenticate
   * @param key - Secret key for HMAC
   * @param algorithm - Hash algorithm to use
   * @returns HMAC hex string
   * @complexity O(n) where n is data length
   */
  static hmac(
    data: string | Buffer,
    key: string | Buffer,
    algorithm: HashAlgorithm = this.DEFAULT_HASH_ALGORITHM
  ): string {
    if (!TypeGuards.isString(data) && !Buffer.isBuffer(data)) {
      throw new Error("Data must be a string or Buffer");
    }

    if (!TypeGuards.isString(key) && !Buffer.isBuffer(key)) {
      throw new Error("Key must be a string or Buffer");
    }

    return crypto.createHmac(algorithm, key).update(data).digest("hex");
  }

  /**
   * Verifies an HMAC.
   *
   * @param data - Original data
   * @param key - Secret key used for HMAC
   * @param signature - HMAC signature to verify
   * @param algorithm - Hash algorithm used
   * @returns True if HMAC is valid
   * @complexity O(n) where n is data length
   */
  static verifyHmac(
    data: string | Buffer,
    key: string | Buffer,
    signature: string,
    algorithm: HashAlgorithm = this.DEFAULT_HASH_ALGORITHM
  ): boolean {
    try {
      const expectedSignature = this.hmac(data, key, algorithm);
      const signatureBuffer = Buffer.from(signature, "hex");
      const expectedBuffer = Buffer.from(expectedSignature, "hex");

      // Use timing-safe comparison
      return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifies a hash against original data.
   *
   * @param data - Original data
   * @param hash - Hash to verify
   * @param salt - Salt used in original hash (if any)
   * @param algorithm - Hash algorithm used
   * @returns True if hash is valid
   * @complexity O(n) where n is data length
   */
  static verifyHash(
    data: string | Buffer,
    hash: string,
    salt?: string,
    algorithm: HashAlgorithm = this.DEFAULT_HASH_ALGORITHM
  ): boolean {
    try {
      const saltBuffer = salt ? Buffer.from(salt, "hex") : undefined;
      const computedHash = this.hash(data, algorithm, saltBuffer);

      return computedHash.hash === hash;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generates a secure salt for password hashing.
   *
   * @param length - Salt length in bytes
   * @returns Salt buffer
   * @complexity O(1)
   */
  static generateSalt(length = this.SALT_LENGTH): Buffer {
    return this.generateRandomBytes(length);
  }

  /**
   * Creates a secure hash for passwords with salt.
   *
   * @param password - Password to hash
   * @param algorithm - Hash algorithm to use
   * @returns Hash result with salt and metadata
   * @complexity O(n) where n is password length
   */
  static hashPassword(
    password: string,
    algorithm: HashAlgorithm = HashAlgorithm.SHA512
  ): HashResult {
    if (!TypeGuards.isString(password)) {
      throw new Error("Password must be a string");
    }

    const salt = this.generateSalt();
    return this.hash(password, algorithm, salt);
  }

  /**
   * Verifies a password against its hash.
   *
   * @param password - Plain text password
   * @param hashResult - Hash result from hashPassword
   * @returns True if password matches
   * @complexity O(n) where n is password length
   */
  static verifyPassword(password: string, hashResult: HashResult): boolean {
    if (!TypeGuards.isString(password)) {
      return false;
    }

    if (
      !TypeGuards.isObject(hashResult) ||
      !hashResult.hash ||
      !hashResult.salt
    ) {
      return false;
    }

    return this.verifyHash(
      password,
      hashResult.hash,
      hashResult.salt,
      hashResult.algorithm
    );
  }

  /**
   * Constant-time string comparison to prevent timing attacks.
   *
   * @param a - First string
   * @param b - Second string
   * @returns True if strings are equal
   * @complexity O(n) where n is string length
   */
  static constantTimeEqual(a: string, b: string): boolean {
    if (!TypeGuards.isString(a) || !TypeGuards.isString(b)) {
      return false;
    }

    if (a.length !== b.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch (error) {
      return false;
    }
  }

  /**
   * Generates a cryptographically secure random integer.
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Random integer in range
   * @complexity O(1)
   */
  static randomInt(min: number, max: number): number {
    if (!TypeGuards.isNumber(min) || !TypeGuards.isNumber(max)) {
      throw new Error("Min and max must be numbers");
    }

    if (min >= max) {
      throw new Error("Max must be greater than min");
    }

    const range = max - min;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const maxValue = Math.pow(256, bytesNeeded);
    const threshold = maxValue - (maxValue % range);

    let randomValue;
    do {
      const randomBytes = this.generateRandomBytes(bytesNeeded);
      randomValue = 0;
      for (let i = 0; i < bytesNeeded; i++) {
        randomValue = (randomValue << 8) + randomBytes[i];
      }
    } while (randomValue >= threshold);

    return min + (randomValue % range);
  }

  /**
   * Generates a random string from a character set.
   *
   * @param length - Length of string to generate
   * @param charset - Character set to use
   * @returns Random string
   * @complexity O(n) where n is length
   */
  static randomString(
    length: number,
    charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  ): string {
    if (!TypeGuards.isNumber(length) || length <= 0) {
      throw new Error("Length must be a positive number");
    }

    if (!TypeGuards.isString(charset) || charset.length === 0) {
      throw new Error("Charset must be a non-empty string");
    }

    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = this.randomInt(0, charset.length);
      result += charset[randomIndex];
    }

    return result;
  }

  /**
   * Generates a secure password with specified criteria.
   *
   * @param length - Password length
   * @param options - Password generation options
   * @returns Generated password
   * @complexity O(n) where n is length
   */
  static generatePassword(
    length = 16,
    options: {
      includeUppercase?: boolean;
      includeLowercase?: boolean;
      includeNumbers?: boolean;
      includeSymbols?: boolean;
      excludeSimilar?: boolean;
    } = {}
  ): string {
    const {
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = false,
    } = options;

    let charset = "";

    if (includeUppercase) {
      charset += excludeSimilar
        ? "ABCDEFGHJKLMNPQRSTUVWXYZ"
        : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }

    if (includeLowercase) {
      charset += excludeSimilar
        ? "abcdefghjkmnpqrstuvwxyz"
        : "abcdefghijklmnopqrstuvwxyz";
    }

    if (includeNumbers) {
      charset += excludeSimilar ? "23456789" : "0123456789";
    }

    if (includeSymbols) {
      charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    }

    if (charset.length === 0) {
      throw new Error("At least one character type must be included");
    }

    return this.randomString(length, charset);
  }

  /**
   * Securely wipes a buffer by overwriting with random data.
   *
   * @param buffer - Buffer to wipe
   * @complexity O(n) where n is buffer length
   */
  static secureWipe(buffer: Buffer): void {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error("Input must be a Buffer");
    }

    // Overwrite with random data multiple times
    for (let i = 0; i < 3; i++) {
      const randomData = this.generateRandomBytes(buffer.length);
      randomData.copy(buffer);
    }

    // Final overwrite with zeros
    buffer.fill(0);
  }

  // Performance-wrapped critical methods for enterprise monitoring

  /**
   * Performance-measured encrypt method.
   * Measures execution time and optionally memory usage for encryption operations.
   *
   * @param data - Data to encrypt
   * @param password - Password for encryption
   * @param options - Key derivation options
   * @returns Encrypted data structure
   *
   * @example
   * ```typescript
   * const result = await CryptoUtils.encryptMeasured('sensitive data', 'password');
   * // Automatically logged if duration > 100ms
   * ```
   */
  static encryptMeasured = UtilityPerformance.wrapAsync(
    "CryptoUtils.encrypt",
    this.encrypt.bind(this),
    { trackMemory: true, logThreshold: 100 }
  );

  /**
   * Performance-measured decrypt method.
   * Measures execution time and optionally memory usage for decryption operations.
   *
   * @param encryptedData - Encrypted data structure
   * @param password - Password for decryption
   * @param options - Key derivation options
   * @returns Decrypted data string
   */
  static decryptMeasured = UtilityPerformance.wrapAsync(
    "CryptoUtils.decrypt",
    this.decrypt.bind(this),
    { trackMemory: true, logThreshold: 100 }
  );

  /**
   * Performance-measured hash method.
   * Measures execution time for hashing operations.
   *
   * @param data - Data to hash
   * @param algorithm - Hash algorithm to use
   * @returns Hash result object
   */
  static hashMeasured = UtilityPerformance.wrap(
    "CryptoUtils.hash",
    this.hash.bind(this),
    { logThreshold: 50 }
  );

  /**
   * Performance-measured key derivation method.
   * Measures execution time for password-based key derivation.
   *
   * @param password - Password for key derivation
   * @param salt - Salt for key derivation
   * @param options - Key derivation options
   * @returns Derived key buffer
   */
  static deriveKeyMeasured = UtilityPerformance.wrapAsync(
    "CryptoUtils.deriveKey",
    this.deriveKey.bind(this),
    { trackMemory: true, logThreshold: 200 }
  );
}
