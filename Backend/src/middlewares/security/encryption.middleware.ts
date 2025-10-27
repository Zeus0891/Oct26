import crypto from "crypto";
import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types";

/**
 * Encryption Configuration
 */
interface EncryptionConfig {
  algorithm: string;
  keyDerivation: "pbkdf2" | "scrypt";
  iterations?: number;
  saltLength: number;
  tagLength?: number; // For GCM mode
}

/**
 * Field Encryption Configuration
 */
interface FieldEncryptionConfig {
  field: string;
  encrypt: boolean;
  decrypt: boolean;
  keyId?: string; // For key rotation
}

/**
 * Entity Encryption Configuration
 */
interface EntityEncryptionConfig {
  entity: string;
  fields: FieldEncryptionConfig[];
  config?: Partial<EncryptionConfig>;
}

/**
 * Default encryption configuration
 */
const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: "aes-256-gcm",
  keyDerivation: "pbkdf2",
  iterations: 100000,
  saltLength: 32,
  tagLength: 16,
};

/**
 * Encryption key management
 */
class EncryptionKeyManager {
  private static keys: Map<string, Buffer> = new Map();

  static setMasterKey(keyId: string, key: string | Buffer): void {
    const keyBuffer = typeof key === "string" ? Buffer.from(key, "hex") : key;
    this.keys.set(keyId, keyBuffer);
  }

  static getKey(keyId: string = "default"): Buffer {
    const key = this.keys.get(keyId);
    if (!key) {
      // In production, this should come from a secure key management service
      const masterKey = process.env.ENCRYPTION_MASTER_KEY;
      if (!masterKey) {
        throw new Error("Encryption master key not configured");
      }
      const derivedKey = crypto.pbkdf2Sync(
        masterKey,
        "salt",
        100000,
        32,
        "sha512"
      );
      this.keys.set(keyId, derivedKey);
      return derivedKey;
    }
    return key;
  }

  static rotateKey(keyId: string): void {
    // Generate new key for rotation
    const newKey = crypto.randomBytes(32);
    this.keys.set(`${keyId}_new`, newKey);
    console.log(`[ENCRYPTION] Key rotation initiated for ${keyId}`);
  }
}

/**
 * Field-Level Encryption Middleware
 *
 * Provides transparent field-level encryption/decryption for sensitive data.
 * Supports multiple encryption algorithms and key rotation capabilities.
 *
 * @param entityConfig - Encryption configuration for the specific entity
 */
export const encryptionMiddleware = (entityConfig: EntityEncryptionConfig) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const config = { ...DEFAULT_ENCRYPTION_CONFIG, ...entityConfig.config };

      // Encrypt incoming data (requests)
      if (req.body) {
        req.body = processEncryption(req.body, entityConfig, config, true);
      }

      // Store original res.json to intercept responses
      const originalJson = res.json;

      // Decrypt outgoing data (responses)
      res.json = function (data: any) {
        const processedData = processEncryption(
          data,
          entityConfig,
          config,
          false
        );
        return originalJson.call(this, processedData);
      };

      console.log(
        `[ENCRYPTION] Applied encryption rules for ${entityConfig.entity}`
      );
      next();
    } catch (error) {
      console.error("[ENCRYPTION] Encryption middleware error:", error);
      next(error);
    }
  };
};

/**
 * Process encryption/decryption for data
 */
function processEncryption(
  data: any,
  entityConfig: EntityEncryptionConfig,
  config: EncryptionConfig,
  isEncryption: boolean
): any {
  if (!data) return data;

  // Process arrays
  if (Array.isArray(data)) {
    return data.map((item) =>
      processItem(item, entityConfig, config, isEncryption)
    );
  }

  // Process single object
  if (typeof data === "object" && data !== null) {
    // Check if this is a paginated response
    if (data.data && Array.isArray(data.data)) {
      return {
        ...data,
        data: data.data.map((item: any) =>
          processItem(item, entityConfig, config, isEncryption)
        ),
      };
    }

    return processItem(data, entityConfig, config, isEncryption);
  }

  return data;
}

/**
 * Process individual item for encryption/decryption
 */
function processItem(
  item: any,
  entityConfig: EntityEncryptionConfig,
  config: EncryptionConfig,
  isEncryption: boolean
): any {
  if (!item || typeof item !== "object") return item;

  const processed = { ...item };

  entityConfig.fields.forEach((fieldConfig) => {
    const { field, encrypt, decrypt, keyId } = fieldConfig;

    if (processed.hasOwnProperty(field) && processed[field] !== null) {
      const shouldProcess = isEncryption ? encrypt : decrypt;

      if (shouldProcess) {
        try {
          if (isEncryption) {
            processed[field] = encryptField(processed[field], config, keyId);
          } else {
            processed[field] = decryptField(processed[field], config, keyId);
          }
        } catch (error) {
          console.error(`[ENCRYPTION] Error processing field ${field}:`, error);
          // Don't fail the entire request for encryption errors
          if (!isEncryption) {
            processed[field] = "[ENCRYPTION_ERROR]";
          }
        }
      }
    }
  });

  return processed;
}

/**
 * Encrypt a single field value
 */
function encryptField(
  value: string,
  config: EncryptionConfig,
  keyId?: string
): string {
  if (!value || typeof value !== "string") return value;

  const key = EncryptionKeyManager.getKey(keyId);
  const salt = crypto.randomBytes(config.saltLength);
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM

  // Derive key with salt
  let derivedKey: Buffer;
  if (config.keyDerivation === "scrypt") {
    derivedKey = crypto.scryptSync(key, salt, 32);
  } else {
    derivedKey = crypto.pbkdf2Sync(key, salt, config.iterations!, 32, "sha512");
  }

  const cipher = crypto.createCipheriv(
    config.algorithm,
    derivedKey,
    iv
  ) as any;
  const encryptedBuf = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Combine salt, iv, authTag, and encrypted data
  const combined = Buffer.concat([salt, iv, authTag, encryptedBuf]);

  return `enc:${combined.toString("base64")}`;
}

/**
 * Decrypt a single field value
 */
function decryptField(
  encryptedValue: string,
  config: EncryptionConfig,
  keyId?: string
): string {
  if (!encryptedValue || !encryptedValue.startsWith("enc:")) {
    return encryptedValue; // Not encrypted
  }

  try {
    const key = EncryptionKeyManager.getKey(keyId);
    const combined = Buffer.from(encryptedValue.substring(4), "base64");

    // Extract components
    const salt = combined.subarray(0, config.saltLength);
    const iv = combined.subarray(config.saltLength, config.saltLength + 12);
    const authTag = combined.subarray(
      config.saltLength + 12,
      config.saltLength + 12 + 16
    );
    const encrypted = combined.subarray(config.saltLength + 12 + 16);

    // Derive key with salt
    let derivedKey: Buffer;
    if (config.keyDerivation === "scrypt") {
      derivedKey = crypto.scryptSync(key, salt, 32);
    } else {
      derivedKey = crypto.pbkdf2Sync(
        key,
        salt,
        config.iterations!,
        32,
        "sha512"
      );
    }

    const decipher = (crypto.createDecipheriv(
      config.algorithm,
      derivedKey,
      iv
    ) as any);
    decipher.setAuthTag(authTag);

    const decryptedBuf = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decryptedBuf.toString("utf8");
  } catch (error) {
    console.error("[ENCRYPTION] Decryption failed:", error);
    return "[DECRYPTION_ERROR]";
  }
}

// =============================================================================
// PRE-CONFIGURED ENCRYPTIONS FOR COMMON ENTITIES
// =============================================================================

/**
 * User PII encryption configuration
 */
export const userPIIEncryption: EntityEncryptionConfig = {
  entity: "User",
  fields: [
    { field: "ssn", encrypt: true, decrypt: true, keyId: "pii" },
    { field: "phone", encrypt: true, decrypt: true, keyId: "pii" },
    { field: "address", encrypt: true, decrypt: true, keyId: "pii" },
    { field: "bankAccount", encrypt: true, decrypt: true, keyId: "financial" },
  ],
};

/**
 * Financial data encryption configuration
 */
export const financialDataEncryption: EntityEncryptionConfig = {
  entity: "Financial",
  fields: [
    {
      field: "accountNumber",
      encrypt: true,
      decrypt: true,
      keyId: "financial",
    },
    {
      field: "routingNumber",
      encrypt: true,
      decrypt: true,
      keyId: "financial",
    },
    {
      field: "creditCardNumber",
      encrypt: true,
      decrypt: true,
      keyId: "payment",
    },
    { field: "cvv", encrypt: true, decrypt: false, keyId: "payment" }, // Never decrypt CVV
  ],
};

/**
 * Document encryption configuration
 */
export const documentEncryption: EntityEncryptionConfig = {
  entity: "Document",
  fields: [
    { field: "content", encrypt: true, decrypt: true, keyId: "documents" },
    { field: "metadata", encrypt: true, decrypt: true, keyId: "documents" },
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Apply user PII encryption
 */
export const encryptUserPII = () => encryptionMiddleware(userPIIEncryption);

/**
 * Apply financial data encryption
 */
export const encryptFinancialData = () =>
  encryptionMiddleware(financialDataEncryption);

/**
 * Apply document encryption
 */
export const encryptDocuments = () => encryptionMiddleware(documentEncryption);

/**
 * Initialize encryption keys from environment
 */
export const initializeEncryptionKeys = (): void => {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;
  const piiKey = process.env.PII_ENCRYPTION_KEY;
  const financialKey = process.env.FINANCIAL_ENCRYPTION_KEY;
  const paymentKey = process.env.PAYMENT_ENCRYPTION_KEY;

  if (masterKey) EncryptionKeyManager.setMasterKey("default", masterKey);
  if (piiKey) EncryptionKeyManager.setMasterKey("pii", piiKey);
  if (financialKey)
    EncryptionKeyManager.setMasterKey("financial", financialKey);
  if (paymentKey) EncryptionKeyManager.setMasterKey("payment", paymentKey);

  console.log("[ENCRYPTION] Encryption keys initialized");
};

/**
 * Key rotation utility
 */
export const rotateEncryptionKey = (keyId: string): void => {
  EncryptionKeyManager.rotateKey(keyId);
};

/**
 * Encryption status check middleware
 */
export const encryptionStatusMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Add encryption status to response headers for debugging
  res.setHeader("x-encryption-enabled", "true");
  res.setHeader("x-encryption-algorithm", DEFAULT_ENCRYPTION_CONFIG.algorithm);

  next();
};
