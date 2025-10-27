/**
 * Environment Configuration
 *
 * Validates and exports environment variables using Zod schema validation.
 * Provides type-safe access to all configuration values throughout the application.
 *
 * @module EnvConfig
 * @category Core Infrastructure - Configuration
 * @description Environment variable validation and configuration
 * @version 1.0.0
 */

import { z } from "zod";

/**
 * Environment validation schema using Zod
 */
export const EnvSchema = z.object({
  // Application Environment
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),

  // Server Configuration
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  HOST: z.string().default("localhost"),

  // Database Configuration
  DATABASE_URL: z.string().refine(
    (val) => {
      try {
        // eslint-disable-next-line no-new
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid database URL format" }
  ),
  DATABASE_MAX_CONNECTIONS: z.coerce.number().min(1).max(100).default(20),
  DATABASE_TIMEOUT: z.coerce.number().min(1000).default(10000),

  // Security Configuration
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
  JWT_ACCESS_EXPIRATION: z.string().default("15m"),
  JWT_REFRESH_EXPIRATION: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().min(10).max(15).default(12),

  // Encryption Configuration
  ENCRYPTION_KEY: z
    .string()
    .min(32, "Encryption key must be at least 32 characters"),
  DATA_ENCRYPTION_ALGORITHM: z.string().default("aes-256-gcm"),

  // Multi-tenant Configuration
  TENANT_ISOLATION_ENABLED: z.coerce.boolean().default(true),
  RLS_ENABLED: z.coerce.boolean().default(true),
  DEFAULT_TENANT_ID: z.string().optional(),

  // Logging Configuration
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FORMAT: z.enum(["json", "simple"]).default("json"),
  LOG_FILE_PATH: z.string().default("./logs/app.log"),

  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: z.coerce.boolean().default(false),

  // CORS Configuration
  CORS_ORIGIN: z.string().default("*"),
  CORS_CREDENTIALS: z.coerce.boolean().default(true),

  // API Configuration
  API_VERSION: z.string().default("v1"),
  API_PREFIX: z.string().default("/api"),

  // External Services
  REDIS_URL: z
    .string()
    .refine(
      (val) => {
        try {
          // eslint-disable-next-line no-new
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid URL" }
    )
    .optional(),
  EMAIL_SERVICE_URL: z
    .string()
    .refine(
      (val) => {
        try {
          // eslint-disable-next-line no-new
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid URL" }
    )
    .optional(),
  WEBHOOK_SECRET: z.string().optional(),

  // Monitoring Configuration
  PROMETHEUS_ENABLED: z.coerce.boolean().default(true),
  PROMETHEUS_PORT: z.coerce.number().default(9090),
  HEALTH_CHECK_TIMEOUT: z.coerce.number().default(5000),

  // Performance Configuration
  REQUEST_TIMEOUT: z.coerce.number().default(30000),
  BODY_LIMIT: z.string().default("10mb"),

  // Server Configuration (migrated from legacy server.ts)
  SERVER_TIMEOUT: z.coerce.number().default(30000),
  KEEP_ALIVE_TIMEOUT: z.coerce.number().default(65000),
  HEADERS_TIMEOUT: z.coerce.number().default(66000),
  MAX_REQUEST_SIZE: z.string().default("10mb"),

  // Database Configuration (migrated from legacy server.ts)
  DB_MAX_CONNECTIONS: z.coerce.number().default(20),
  DB_CONNECTION_TIMEOUT: z.coerce.number().default(10000),
  DB_QUERY_TIMEOUT: z.coerce.number().default(5000),

  // Security Configuration (migrated from legacy server.ts)
  RATE_LIMIT_WINDOW: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  BCRYPT_ROUNDS: z.coerce.number().default(12),

  // Production Configuration (migrated from legacy server.ts)
  REQUIRE_DB_ON_START: z.coerce.boolean().default(false),
  CLIENT_URLS: z.string().optional(),

  // Development Configuration
  DEBUG_ENABLED: z.coerce.boolean().default(false),
  MOCK_EXTERNAL_SERVICES: z.coerce.boolean().default(false),
});

/**
 * Validated environment configuration
 */
export const env = EnvSchema.parse(process.env);

/**
 * Type-safe environment configuration type
 */
export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * Validate environment configuration and provide helpful error messages
 * Enhanced with production validation logic from legacy server.ts
 */
export function validateEnvironment(): void {
  try {
    EnvSchema.parse(process.env);
    console.log("✅ Environment configuration validated successfully");

    // Additional production validation (migrated from legacy server.ts)
    const requireDb = env.REQUIRE_DB_ON_START;

    // JWT secret is always required in production
    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing required environment variable: JWT_SECRET");
      process.exit(1);
    }

    if (process.env.JWT_SECRET.length < 32) {
      console.error("❌ JWT_SECRET must be at least 32 characters long");
      process.exit(1);
    }

    // DATABASE_URL is required only if we enforce DB on start
    if (requireDb && !process.env.DATABASE_URL) {
      console.error(
        "❌ REQUIRE_DB_ON_START=true but DATABASE_URL is missing; cannot start"
      );
      process.exit(1);
    }

    if (!requireDb && !process.env.DATABASE_URL) {
      console.warn(
        "⚠️ DATABASE_URL not set and REQUIRE_DB_ON_START!=true; starting without DB (health will show degraded until DB is configured)"
      );
    }

    console.log("✅ Production environment validation passed");
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment configuration validation failed:");
      for (const issue of error.issues) {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      }
      console.error(
        "\nPlease check your .env file and ensure all required variables are set."
      );
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Get environment-specific configuration overrides
 */
export function getEnvironmentDefaults(): Partial<EnvConfig> {
  switch (env.NODE_ENV) {
    case "development":
      return {
        LOG_LEVEL: "debug",
        DEBUG_ENABLED: true,
        MOCK_EXTERNAL_SERVICES: true,
        CORS_ORIGIN: "*",
      };

    case "staging":
      return {
        LOG_LEVEL: "info",
        DEBUG_ENABLED: false,
        MOCK_EXTERNAL_SERVICES: false,
        RATE_LIMIT_MAX_REQUESTS: 200,
      };

    case "production":
      return {
        LOG_LEVEL: "warn",
        DEBUG_ENABLED: false,
        MOCK_EXTERNAL_SERVICES: false,
        RATE_LIMIT_MAX_REQUESTS: 1000,
        LOG_FORMAT: "json",
      };

    default:
      return {};
  }
}

/**
 * Check if the application is running in development mode
 */
export const isDevelopment = env.NODE_ENV === "development";

/**
 * Check if the application is running in production mode
 */
export const isProduction = env.NODE_ENV === "production";

/**
 * Check if the application is running in staging mode
 */
export const isStaging = env.NODE_ENV === "staging";

/**
 * Get database configuration
 */
export const getDatabaseConfig = () => ({
  url: env.DATABASE_URL,
  maxConnections: env.DATABASE_MAX_CONNECTIONS,
  timeout: env.DATABASE_TIMEOUT,
});

/**
 * Get JWT configuration
 */
export const getJWTConfig = () => ({
  secret: env.JWT_SECRET,
  accessExpiration: env.JWT_ACCESS_EXPIRATION,
  refreshExpiration: env.JWT_REFRESH_EXPIRATION,
});

/**
 * Get security configuration
 */
export const getSecurityConfig = () => ({
  bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  encryptionKey: env.ENCRYPTION_KEY,
  encryptionAlgorithm: env.DATA_ENCRYPTION_ALGORITHM,
  tenantIsolationEnabled: env.TENANT_ISOLATION_ENABLED,
  rlsEnabled: env.RLS_ENABLED,
});

/**
 * Get logging configuration
 */
export const getLoggingConfig = () => ({
  level: env.LOG_LEVEL,
  format: env.LOG_FORMAT,
  filePath: env.LOG_FILE_PATH,
});

/**
 * Get rate limiting configuration
 */
export const getRateLimitConfig = () => ({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  skipSuccessfulRequests: env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS,
});

/**
 * Get server configuration (migrated from legacy server.ts)
 */
export const getServerConfig = () => ({
  port: env.PORT,
  host: env.HOST,
  timeout: env.SERVER_TIMEOUT,
  keepAliveTimeout: env.KEEP_ALIVE_TIMEOUT,
  headersTimeout: env.HEADERS_TIMEOUT,
  maxRequestSize: env.MAX_REQUEST_SIZE,
  requestTimeout: env.REQUEST_TIMEOUT,
  bodyLimit: env.BODY_LIMIT,
});

/**
 * Get database configuration (enhanced with legacy server.ts config)
 */
export const getDatabaseConfigLegacy = () => ({
  url: env.DATABASE_URL,
  maxConnections: env.DB_MAX_CONNECTIONS,
  connectionTimeout: env.DB_CONNECTION_TIMEOUT,
  queryTimeout: env.DB_QUERY_TIMEOUT,
  timeout: env.DATABASE_TIMEOUT,
});

/**
 * Get security configuration (enhanced with legacy server.ts config)
 */
export const getSecurityConfigLegacy = () => ({
  bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  encryptionKey: env.ENCRYPTION_KEY,
  encryptionAlgorithm: env.DATA_ENCRYPTION_ALGORITHM,
  tenantIsolationEnabled: env.TENANT_ISOLATION_ENABLED,
  rlsEnabled: env.RLS_ENABLED,
  rateLimitWindow: env.RATE_LIMIT_WINDOW,
  rateLimitMax: env.RATE_LIMIT_MAX,
  bcryptRounds: env.BCRYPT_ROUNDS,
});

/**
 * Get CORS origins configuration (migrated from legacy server.ts)
 */
export const getCorsConfig = () => ({
  origins: env.CLIENT_URLS
    ? env.CLIENT_URLS.split(",")
        .map((o) => o.trim())
        .filter(Boolean)
    : [],
  credentials: env.CORS_CREDENTIALS,
  origin: env.CORS_ORIGIN,
});
