/**
 * Security Configuration
 *
 * Defines standard security constants, token lifetimes, encryption algorithms,
 * and other security-related configuration for the application.
 *
 * @module SecurityConfig
 * @category Core Infrastructure - Configuration
 * @description Security constants and configuration
 * @version 1.0.0
 */

import { env } from "./env.config";

/**
 * JWT Configuration
 */
export const JWT_CONFIG = {
  // Token secrets
  accessTokenSecret: env.JWT_SECRET,
  refreshTokenSecret: env.JWT_SECRET + "_refresh", // Different secret for refresh tokens

  // Token lifetimes
  accessTokenExpiration: env.JWT_ACCESS_EXPIRATION,
  refreshTokenExpiration: env.JWT_REFRESH_EXPIRATION,

  // Token issuer and audience
  issuer: "erp-multitenant-saas",
  audience: "erp-api-client",

  // Algorithm
  algorithm: "HS256" as const,

  // Additional claims
  includeUserClaims: true,
  includeTenantClaims: true,
  includePermissionClaims: true,
} as const;

/**
 * Password Security Configuration
 */
export const PASSWORD_CONFIG = {
  // Bcrypt configuration
  saltRounds: env.BCRYPT_SALT_ROUNDS,

  // Password requirements
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialCharacters: true,

  // Password history
  preventPasswordReuse: true,
  passwordHistoryLimit: 5,

  // Password reset
  resetTokenExpiration: "1h",
  resetTokenLength: 32,

  // Account lockout
  maxFailedAttempts: 5,
  lockoutDuration: "15m",
  lockoutProgressiveDelay: true,
} as const;

/**
 * Encryption Configuration
 */
export const ENCRYPTION_CONFIG = {
  // Primary encryption
  algorithm: env.DATA_ENCRYPTION_ALGORITHM,
  keyLength: 32,
  ivLength: 16,
  tagLength: 16,

  // Key derivation
  pbkdf2Iterations: 100000,
  keyDerivationSalt: "erp-multitenant-salt",

  // Field-level encryption
  encryptSensitiveFields: true,
  encryptionFields: [
    "email",
    "phone",
    "ssn",
    "bankAccount",
    "creditCard",
    "personalData",
  ],

  // Key rotation
  keyRotationInterval: "90d",
  maxKeyAge: "1y",
  enableAutomaticKeyRotation: true,
} as const;

/**
 * Session Configuration
 */
export const SESSION_CONFIG = {
  // Session management
  maxActiveSessions: 5,
  sessionTimeout: "24h",
  extendSessionOnActivity: true,

  // Session security
  requireSecureCookies: env.NODE_ENV === "production",
  httpOnlyCookies: true,
  sameSiteCookies: "strict" as const,

  // Session storage
  storeInDatabase: true,
  enableSessionCleanup: true,
  cleanupInterval: "1h",

  // Concurrent sessions
  allowMultipleDevices: true,
  trackDeviceFingerprint: true,
  notifyNewDeviceLogin: true,
} as const;

/**
 * RBAC Security Configuration
 */
export const RBAC_CONFIG = {
  // Permission checking
  strictPermissionChecking: true,
  cachePermissions: true,
  permissionCacheTTL: "5m",

  // Role hierarchy
  enableRoleInheritance: true,
  maxRoleDepth: 5,

  // Access control
  defaultDenyAccess: true,
  enableResourceBasedAccess: true,
  enableTimeBasedAccess: false,
  enableLocationBasedAccess: false,

  // Audit
  auditPermissionChecks: true,
  auditFailedAccess: true,
  auditAdminActions: true,
} as const;

/**
 * CORS Configuration (migrated from legacy app.ts)
 */
/**
 * Helmet Security Headers Configuration (migrated from legacy app.ts)
 */
export const HELMET_CONFIG = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  // Additional security headers
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true,
} as const;

/**
 * Tenant Isolation Configuration
 */
export const TENANT_CONFIG = {
  // Isolation level
  isolationLevel: env.TENANT_ISOLATION_ENABLED ? "STRICT" : "NONE",
  enableRowLevelSecurity: env.RLS_ENABLED,

  // Default tenant
  defaultTenantId: env.DEFAULT_TENANT_ID,
  requireTenantContext: env.TENANT_ISOLATION_ENABLED,

  // Tenant validation
  validateTenantAccess: true,
  cacheTenantData: true,
  tenantCacheTTL: "10m",

  // Cross-tenant access
  allowCrossTenantAccess: false,
  auditCrossTenantAttempts: true,

  // Tenant subdomain support
  enableSubdomainRouting: false,
  subdomainPattern: /^([a-z0-9]+(-[a-z0-9]+)*)$/,
} as const;

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMIT_CONFIG = {
  // Global limits
  globalLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    skipSuccessfulRequests: env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS,
  },

  // Authentication limits
  authLimits: {
    login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 min
    register: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
    resetPassword: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 resets per hour
    refreshToken: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 refreshes per minute
  },

  // API operation limits
  operationLimits: {
    read: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 reads per minute
    write: { windowMs: 60 * 1000, maxRequests: 50 }, // 50 writes per minute
    delete: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 deletes per minute
    export: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 exports per hour
    bulk: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 bulk ops per hour
  },

  // User-specific limits
  userLimits: {
    admin: { multiplier: 5 }, // 5x normal limits
    premium: { multiplier: 3 }, // 3x normal limits
    standard: { multiplier: 1 }, // Normal limits
    free: { multiplier: 0.5 }, // Half normal limits
  },
} as const;

/**
 * Audit Configuration
 */
export const AUDIT_CONFIG = {
  // Audit levels
  enableAuditLogging: true,
  auditLevel: "DETAILED" as const,

  // Event types to audit
  auditEvents: [
    "USER_LOGIN",
    "USER_LOGOUT",
    "USER_REGISTER",
    "PASSWORD_CHANGE",
    "PERMISSION_CHECK",
    "DATA_ACCESS",
    "DATA_MODIFICATION",
    "ADMIN_ACTION",
    "SECURITY_VIOLATION",
    "EXPORT_DATA",
    "BULK_OPERATION",
  ],

  // Retention
  auditRetentionDays: 2555, // 7 years
  enableAuditArchival: true,
  archivalThresholdDays: 365,

  // Performance
  asyncAuditLogging: true,
  auditBatchSize: 100,
  auditFlushInterval: "30s",

  // Security
  auditLogEncryption: env.NODE_ENV === "production",
  auditLogIntegrity: true,
  tamperDetection: true,
} as const;

/**
 * CORS Configuration (enhanced with legacy app.ts production logic)
 */
export const CORS_CONFIG = {
  // Basic CORS settings
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-tenant-id",
    "x-correlation-id",
    "x-request-id",
  ],
  exposedHeaders: [
    "X-Correlation-ID",
    "X-Tenant-ID",
    "X-Rate-Limit-Remaining",
    "X-Rate-Limit-Reset",
  ],
  maxAge: 86400, // 24 hours

  // Production origin validation logic (migrated from legacy app.ts)
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    const allowedOrigins = (process.env.CLIENT_URLS || "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    // In non-production, include localhost defaults to ease local dev
    if ((process.env.NODE_ENV || "development") !== "production") {
      const localOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
      for (const o of localOrigins) {
        if (!allowedOrigins.includes(o)) allowedOrigins.push(o);
      }
    }

    if (allowedOrigins.length === 0) {
      console.warn(
        "[CORS] No CLIENT_URLS provided; denying all cross-origin requests (no localhost fallback)."
      );
    }

    if (!origin) return callback(null, true); // allow same-origin/no-origin (e.g., curl)
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS origin not allowed"));
  },
} as const;

/**
 * Content Security Policy (CSP) Configuration
 */
export const CSP_CONFIG = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'"],
  fontSrc: ["'self'"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"],
  reportUri: "/api/v1/security/csp-report",
} as const;

/**
 * Security Headers Configuration
 */
export const SECURITY_HEADERS = {
  // Helmet configuration
  contentSecurityPolicy: CSP_CONFIG,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  frameguard: { action: "deny" },
  xssFilter: true,
  referrerPolicy: { policy: "same-origin" },

  // Custom security headers
  customHeaders: {
    "X-API-Version": env.API_VERSION,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Referrer-Policy": "same-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  },
} as const;

/**
 * Get security configuration for specific environment
 */
export function getSecurityConfig() {
  const baseConfig = {
    jwt: JWT_CONFIG,
    password: PASSWORD_CONFIG,
    encryption: ENCRYPTION_CONFIG,
    session: SESSION_CONFIG,
    rbac: RBAC_CONFIG,
    tenant: TENANT_CONFIG,
    rateLimit: RATE_LIMIT_CONFIG,
    audit: AUDIT_CONFIG,
    cors: CORS_CONFIG,
    csp: CSP_CONFIG,
    headers: SECURITY_HEADERS,
  };

  // Environment-specific overrides
  if (env.NODE_ENV === "development") {
    return {
      ...baseConfig,
      cors: {
        ...baseConfig.cors,
        origin: true, // Allow all origins in development
      },
      audit: {
        ...baseConfig.audit,
        auditLevel: "MINIMAL" as const,
        asyncAuditLogging: false,
      },
    };
  }

  if (env.NODE_ENV === "production") {
    return {
      ...baseConfig,
      session: {
        ...baseConfig.session,
        requireSecureCookies: true,
      },
      audit: {
        ...baseConfig.audit,
        auditLogEncryption: true,
        tamperDetection: true,
      },
    };
  }

  return baseConfig;
}

/**
 * Validate security configuration
 */
export function validateSecurityConfig(): void {
  const errors: string[] = [];

  // Validate JWT secret strength
  if (JWT_CONFIG.accessTokenSecret.length < 32) {
    errors.push("JWT secret must be at least 32 characters long");
  }

  // Validate encryption key
  if (env.ENCRYPTION_KEY.length < 32) {
    errors.push("Encryption key must be at least 32 characters long");
  }

  // Validate production settings
  if (env.NODE_ENV === "production") {
    // Skip CORS origin validation since we now use a function for dynamic origin checking
    if (!SESSION_CONFIG.requireSecureCookies) {
      errors.push("Secure cookies should be required in production");
    }
  }

  if (errors.length > 0) {
    console.error("❌ Security configuration validation failed:");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    throw new Error("Invalid security configuration");
  }

  console.log("✅ Security configuration validated successfully");
}

// Export all configurations
export default {
  jwt: JWT_CONFIG,
  password: PASSWORD_CONFIG,
  encryption: ENCRYPTION_CONFIG,
  session: SESSION_CONFIG,
  rbac: RBAC_CONFIG,
  tenant: TENANT_CONFIG,
  rateLimit: RATE_LIMIT_CONFIG,
  audit: AUDIT_CONFIG,
  cors: CORS_CONFIG,
  csp: CSP_CONFIG,
  headers: SECURITY_HEADERS,
};
