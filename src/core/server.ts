/**
 * Server Entry Point
 *
 * Main entry point for the ERP Multitenant SaaS backend application.
 * Handles application bootstrap, server startup, and graceful shutdown.
 *
 * @module Server
 * @category Core Infrastructure - Server
 * @description Application entry point and server lifecycle management
 * @version 1.0.0
 */

// Load environment variables from .env before anything else
import "dotenv/config";

import { Express } from "express";
import { bootstrapAndStart, BootstrapConfig } from "./bootstrap";

// Feature modules
import accessRouter from "../features/access-control";
import usersRoutes from "../features/identity/users.routes";
import tenantRouter from "../features/tenant";
import tenantPublicRoutes from "../features/tenant/routes/public.routes";

// Configuration and environment
const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3001,
  HOST: process.env.HOST || "localhost",
  APP_NAME: process.env.APP_NAME || "ERP Multitenant SaaS",
  APP_VERSION: process.env.npm_package_version || "1.0.0",
};

/**
 * Main server startup function
 */
async function startServer(): Promise<void> {
  console.log(`🚀 Starting ${env.APP_NAME} v${env.APP_VERSION}`);
  console.log(`📦 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 Target: http://${env.HOST}:${env.PORT}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Configure bootstrap options based on environment
    // Enable core endpoints in development by default, or when --health flag is passed
    const enableCoreEndpoints =
      process.argv.includes("--health") || env.NODE_ENV === "development";
    const bootstrapConfig: BootstrapConfig = {
      app: {
        middleware: {
          enableCors: true,
          enableHelmet: true,
          // Mount Identity before the global /api auth chain so it can manage its own public endpoints
          preAuthRoutes: (app: Express) => {
            // Mount Identity endpoints before global /api auth chain
            app.use("/users", usersRoutes);
            // Mount Tenant public bootstrap endpoints (register/bootstrap)
            app.use("/tenants", tenantPublicRoutes);
          },
          enableCompression: true,
          enableRateLimit: env.NODE_ENV === "production",
          enableMetrics: true,
          // Core observability endpoints are opt-in; enable with --health
          enableCoreEndpoints,
          enableRequestLogging: true,
          enableAuth: true,
          enableRbac: true,
          enableRls: true,
        },
        disableRoutes: true, // Keep core clean - routes mounted via customRoutes

        // Mount feature module routers
        customRoutes: (app: Express) => {
          // Tenant module - all tenant-scoped operations (protected by per-route stacks)
          app.use("/api/tenant", tenantRouter);

          // Future feature modules will be mounted here:
          // Identity module - authentication + profile/MFA/devices
          // Access Control module - roles, permissions, role-permissions
          app.use("/api/access", accessRouter);
        },

        enableGracefulShutdown: true,
      },
      // Keep core clean by default: skip bootstrap health check routes.
      // When --health is used to expose endpoints via middleware, we still skip
      // bootstrap health checks to avoid duplicate routes.
      skipHealthChecks: true,
      skipDatabaseInit: !process.argv.includes("--db"),
      shutdownTimeout: 30000, // 30 seconds
      enableGracefulShutdown: true,
    };

    // Bootstrap and start the application
    await bootstrapAndStart(bootstrapConfig, env.PORT, env.HOST);

    // Log successful startup
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Application started successfully!");
    console.log(`📍 Server listening on http://${env.HOST}:${env.PORT}`);
    // Core runs clean: health/metrics/docs endpoints are disabled by default
    console.log(`🕐 Started at: ${new Date().toISOString()}`);

    if (env.NODE_ENV === "development") {
      console.log("🔧 Development mode features:");
      console.log("   • Detailed error messages");
      console.log("   • Request/response logging");
      console.log("   • Hot reload support");
      console.log("   • Debug endpoints enabled");
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Log environment-specific information
    if (env.NODE_ENV === "development") {
      console.log("🛠️  Development Tips:");
      console.log("   • Use --skip-health to skip health checks");
      console.log("   • Use --skip-db to skip database initialization");
      console.log("   • Check logs for detailed request information");
      console.log(
        "   • Enable core endpoints with --health and feature routes via customRoutes"
      );
    }

    // Keep the process alive
    return new Promise(() => {
      // This promise never resolves, keeping the server running
      // Graceful shutdown is handled by the bootstrap process
    });
  } catch (error) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ Failed to start server");
    console.error("Error:", (error as Error).message);

    if (env.NODE_ENV === "development") {
      console.error("Stack trace:", (error as Error).stack);
    }

    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Exit with error code
    process.exit(1);
  }
}

/**
 * Parse command line arguments for server configuration
 */
function parseArguments(): { [key: string]: any } {
  const args = process.argv.slice(2);
  const config: { [key: string]: any } = {};

  const it = args[Symbol.iterator]();
  for (let current = it.next(); !current.done; current = it.next()) {
    const arg = current.value;

    switch (arg) {
      case "--port":
      case "-p": {
        const next = it.next();
        if (!next.done) {
          config.port = Number.parseInt(next.value, 10);
        }
        break;
      }
      case "--host":
      case "-h": {
        const next = it.next();
        if (!next.done) {
          config.host = next.value;
        }
        break;
      }
      case "--skip-health":
        config.skipHealth = true;
        break;
      case "--skip-db":
        config.skipDb = true;
        break;
      case "--help":
        printHelp();
        process.exit(0);
      // eslint-disable-next-line no-fallthrough
      case "--version":
        console.log(env.APP_VERSION);
        process.exit(0);
    }
  }

  return config;
}

/**
 * Print help information
 */
function printHelp(): void {
  console.log(`${env.APP_NAME} v${env.APP_VERSION}`);
  console.log("");
  console.log("Usage: npm start [options]");
  console.log("       node dist/server.js [options]");
  console.log("");
  console.log("Options:");
  console.log("  -p, --port <number>    Port to listen on (default: 3001)");
  console.log("  -h, --host <string>    Host to bind to (default: localhost)");
  console.log("  --skip-health          Skip startup health checks");
  console.log("  --skip-db              Skip database initialization");
  console.log("  --help                 Show this help message");
  console.log("  --version              Show version number");
  console.log("");
  console.log("Environment Variables:");
  console.log(
    "  NODE_ENV              Application environment (development|staging|production)"
  );
  console.log("  PORT                  Server port (default: 3001)");
  console.log("  HOST                  Server host (default: localhost)");
  console.log("  DATABASE_URL          PostgreSQL connection string");
  console.log("  JWT_SECRET            Secret key for JWT token signing");
  console.log("  REDIS_URL             Redis connection string");
  console.log("");
  console.log("Examples:");
  console.log(
    "  npm start                               # Start with default settings"
  );
  console.log("  npm start -- --port 8080               # Start on port 8080");
  console.log(
    "  npm start -- --skip-health --skip-db   # Start without checks"
  );
  console.log(
    "  NODE_ENV=production npm start          # Start in production mode"
  );
}

/**
 * Display startup banner
 */
function displayBanner(): void {
  console.log("");
  console.log("███████╗██████╗ ██████╗     ███████╗ █████╗  █████╗ ███████╗");
  console.log("██╔════╝██╔══██╗██╔══██╗    ██╔════╝██╔══██╗██╔══██╗██╔════╝");
  console.log("█████╗  ██████╔╝██████╔╝    ███████╗███████║███████║███████╗");
  console.log("██╔══╝  ██╔══██╗██╔═══╝     ╚════██║██╔══██║██╔══██║╚════██║");
  console.log("███████╗██║  ██║██║         ███████║██║  ██║██║  ██║███████║");
  console.log("╚══════╝╚═╝  ╚═╝╚═╝         ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝");
  console.log("");
  console.log(`${env.APP_NAME} Backend API Server`);
  console.log(`Version ${env.APP_VERSION} | Environment: ${env.NODE_ENV}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

/**
 * Handle uncaught errors at the process level
 */
function setupGlobalErrorHandlers(): void {
  process.on("uncaughtException", (error: Error) => {
    console.error("🚨 Uncaught Exception:", error.message);
    console.error("Stack:", error.stack);
    console.error("The application will now exit...");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    console.error("🚨 Unhandled Promise Rejection:", reason);
    console.error("Promise:", promise);
    console.error("The application will now exit...");
    process.exit(1);
  });
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  // Setup global error handlers first
  setupGlobalErrorHandlers();

  // Parse command line arguments
  const args = parseArguments();

  // Override environment variables with command line arguments
  if (args.port) env.PORT = args.port;
  if (args.host) env.HOST = args.host;

  // Display banner
  displayBanner();

  // Start the server
  await startServer();
}

// Start the application if this file is run directly
// Schedule startup without direct top-level await to maintain compatibility
if (require.main === module) {
  setImmediate(() => {
    void main();
  });
}

// Export for testing or programmatic use
export { displayBanner, parseArguments, startServer };
export default main;
