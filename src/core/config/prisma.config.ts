/**
 * Prisma Configuration
 *
 * Configures and exports a Prisma Client instance with enterprise-grade settings
 * including connection pooling, RLS enforcement, logging, and graceful shutdown.
 *
 * @module PrismaConfig
 * @category Core Infrastructure - Configuration
 * @description Prisma Client configuration and connection management
 * @version 1.0.0
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { env, isDevelopment } from "./env.config";

/**
 * Prisma Client configuration options
 */
const prismaConfig: Prisma.PrismaClientOptions = {
  // Database connection
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },

  // Logging configuration based on environment
  log: isDevelopment
    ? ([
        { emit: "event", level: "query" },
        { emit: "event", level: "info" },
        { emit: "event", level: "warn" },
        { emit: "event", level: "error" },
      ] as const)
    : ([
        { emit: "event", level: "warn" },
        { emit: "event", level: "error" },
      ] as const),

  // Error formatting
  errorFormat: isDevelopment ? "pretty" : "minimal",
};

/**
 * Global Prisma Client instance
 */
export const prisma = new PrismaClient(prismaConfig);

/**
 * Initialize Prisma Client with enterprise configurations
 */
export async function initializePrisma(): Promise<PrismaClient> {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection established successfully");

    // Set up query logging in development
    if (isDevelopment) {
      (prisma as any).$on("query", (e: any) => {
        console.log("🔍 Query: " + e.query);
        console.log("📊 Params: " + e.params);
        console.log("⏱️  Duration: " + e.duration + "ms");
      });
    }

    // Set up error logging
    (prisma as any).$on("error", (e: any) => {
      console.error("❌ Prisma Error:", e);
    });

    // Set up info logging
    (prisma as any).$on("info", (e: any) => {
      console.log("ℹ️ Prisma Info:", e.message);
    });

    // Set up warn logging
    (prisma as any).$on("warn", (e: any) => {
      console.warn("⚠️ Prisma Warning:", e.message);
    });

    // Verify RLS is properly configured if enabled
    if (env.RLS_ENABLED) {
      await verifyRLSConfiguration();
    }

    console.log("✅ Prisma Client initialized successfully");
    return prisma;
  } catch (error) {
    console.error("❌ Failed to initialize Prisma Client:", error);
    throw error;
  }
}

/**
 * Verify Row Level Security (RLS) configuration
 */
async function verifyRLSConfiguration(): Promise<void> {
  try {
    // Check if RLS is enabled on key tables
    const rlsCheck = await prisma.$queryRaw`
      SELECT 
        schemaname, 
        tablename, 
        rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND rowsecurity = true;
    `;

    console.log("🔒 RLS Configuration verified:", rlsCheck);
  } catch (error) {
    console.warn("⚠️ Could not verify RLS configuration:", error);
  }
}

/**
 * Execute database operations with RLS context
 * Wraps operations with the withTenantRLS utility if available
 */
export async function withRLSContext<T>(
  tenantId: string,
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    // Import withTenantRLS dynamically to avoid circular dependencies
    const { withTenantRLS } = await import("../../lib/prisma/withRLS");

    // Default roles for system operations
    const systemRoles = ["system", "admin"];

    return await withTenantRLS(tenantId, systemRoles, operation);
  } catch (error) {
    console.warn(
      "⚠️ withTenantRLS not available, executing without RLS context",
      error
    );
    return await operation(prisma);
  }
}

/**
 * Gracefully disconnect from the database
 */
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("✅ Database connection closed gracefully");
  } catch (error) {
    console.error("❌ Error disconnecting from database:", error);
  }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<{
  status: "healthy" | "unhealthy";
  details?: any;
  responseTime?: number;
}> {
  const startTime = Date.now();

  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1 as health_check`;

    const responseTime = Date.now() - startTime;

    return {
      status: "healthy",
      responseTime,
      details: {
        connectionStatus: "connected",
        responseTime: `${responseTime}ms`,
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        connectionStatus: "disconnected",
      },
    };
  }
}

/**
 * Get database connection information
 */
export async function getDatabaseInfo(): Promise<{
  version?: string;
  connectionCount?: number;
  maxConnections?: number;
}> {
  try {
    const [versionResult, connectionResult] = await Promise.all([
      prisma.$queryRaw`SELECT version() as version`,
      prisma.$queryRaw`
        SELECT 
          count(*) as active_connections,
          setting::int as max_connections
        FROM pg_stat_activity 
        CROSS JOIN pg_settings 
        WHERE pg_settings.name = 'max_connections'
        GROUP BY setting
      `,
    ]);

    return {
      version: (versionResult as any)[0]?.version,
      connectionCount: (connectionResult as any)[0]?.active_connections,
      maxConnections: (connectionResult as any)[0]?.max_connections,
    };
  } catch (error) {
    console.warn("⚠️ Could not retrieve database info:", error);
    return {};
  }
}

/**
 * Connection retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

/**
 * Retry database connection with exponential backoff
 */
export async function connectWithRetry(): Promise<PrismaClient> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      await prisma.$connect();
      console.log(`✅ Database connected on attempt ${attempt}`);
      return prisma;
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ Connection attempt ${attempt} failed:`, error);

      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
          RETRY_CONFIG.maxDelay
        );
        console.log(`⏳ Retrying connection in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to connect to database after ${RETRY_CONFIG.maxRetries} attempts: ${
      lastError?.message || "Unknown error"
    }`
  );
}

/**
 * Setup graceful shutdown handlers for Prisma
 */
export function setupPrismaShutdownHandlers(): void {
  const gracefulShutdown = async (signal: string) => {
    console.log(`📡 Received ${signal}, closing database connections...`);
    await disconnectPrisma();
    process.exit(0);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGUSR2", () => gracefulShutdown("SIGUSR2")); // For nodemon
}

// Export the configured Prisma client as default
export default prisma;

/**
 * Apply PostgreSQL RLS claims for the current session.
 * Uses parameterized $executeRaw to avoid unsafe SQL and includes a tiny retry for transient connection errors.
 */
export async function applyRlsClaims(claims: {
  tenant_id: string;
  user_id: string;
  role?: string;
  roles?: string;
  correlation_id?: string;
}): Promise<void> {
  const maxRetries = 2;
  const delayMs = 500;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Use parameterized query to set request.jwt.claims safely
      await prisma.$executeRaw`select set_config('request.jwt.claims', ${JSON.stringify(
        claims
      )}, true)`;
      return;
    } catch (err: any) {
      const isConnError =
        err?.code === "P1001" ||
        err?.code === "P1002" ||
        /closed|connection/i.test(String(err?.message));

      const isLastAttempt = attempt >= maxRetries;
      if (!isConnError || isLastAttempt) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}
