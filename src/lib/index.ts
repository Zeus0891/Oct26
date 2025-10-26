/**
 * @fileoverview Legacy Lib Module - Modernized Export Hub
 *
 * This module serves as a compatibility layer between legacy lib components
 * and the new core infrastructure. Provides clean exports while maintaining
 * backward compatibility for existing services.
 *
 * @module LibIndex
 * @category Legacy Infrastructure - Migration Layer
 * @description Modernized export hub with core infrastructure alignment
 * @version 2.0.0
 */

// ============================================================================
// RLS (Row Level Security) Engine - Core Enterprise Feature
// ============================================================================
export {
  withRLS,
  withTenantRLS,
  withSystemRLS,
  RLSUtils,
} from "./prisma/withRLS";

export type {
  RLSContext,
  RLSOperationResult,
  RLSOptions,
} from "./prisma/withRLS";

// ============================================================================
// Prisma Client - Redirect to Core Infrastructure
// ============================================================================
export {
  prisma,
  initializePrisma,
  disconnectPrisma,
  checkDatabaseHealth,
  withRLSContext,
} from "../core/config/prisma.config";

// ============================================================================
// Shared Types - Core Application Types
// ============================================================================
export type { ApiResponse } from "../shared/types";

/**
 * Module initialization notice
 * Logs when the lib module is loaded to track migration progress
 */
if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
  // Only log in non-test environments to avoid test pollution
  try {
    // Try to use core logger if available, fallback to console
    const { logger } = require("../core/logging/logger.service");
    logger.info("lib module aligned with core infrastructure");
  } catch {
    // Fallback to console if core logger not available
    console.info(
      "[lib] Legacy lib module aligned with core infrastructure - migration in progress"
    );
  }
}
