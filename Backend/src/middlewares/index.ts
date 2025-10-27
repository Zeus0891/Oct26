/**
 * Middleware Index
 *
 * Central export point for all enterprise middleware components.
 * Organized by category for easy importing and maintenance.
 */

// =============================================================================
// TYPES
// =============================================================================
export * from "./types";

// =============================================================================
// SECURITY MIDDLEWARE
// =============================================================================
export {
  jwtAuthMiddleware,
  optionalJwtAuthMiddleware,
} from "./security/jwt-auth.middleware";

export {
  rbacAuthMiddleware,
  requirePermission,
  requireRole,
  requireAdmin,
  requireProjectManager,
  requireUser,
  canReadUsers,
  canCreateUsers,
  canUpdateUsers,
  canDeleteUsers,
  canReadProjects,
  canCreateProjects,
  canUpdateProjects,
  canDeleteProjects,
} from "./security/rbac-auth.middleware";

export {
  tenantContextMiddleware,
  validateTenantMiddleware,
  multiTenantMiddleware,
} from "./security/tenant-context.middleware";

export {
  dataClassificationMiddleware,
  DataClassification,
  userDataClassification,
  projectDataClassification,
  financialDataClassification,
  classifyUserData,
  classifyProjectData,
  classifyFinancialData,
  customClassification,
  classificationAuditMiddleware,
} from "./security/data-classification.middleware";

export {
  encryptionMiddleware,
  userPIIEncryption,
  financialDataEncryption,
  documentEncryption,
  encryptUserPII,
  encryptFinancialData,
  encryptDocuments,
  initializeEncryptionKeys,
  rotateEncryptionKey,
  encryptionStatusMiddleware,
} from "./security/encryption.middleware";

// =============================================================================
// CORE MIDDLEWARE
// =============================================================================
export {
  errorHandlerMiddleware,
  notFoundHandler,
  asyncHandler,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "./core/error-handler.middleware";

export {
  validationMiddleware,
  validateBody,
  validateQuery,
  validateParams,
  sanitizeInputMiddleware,
  // Common schemas
  uuidParamsSchema,
  paginationQuerySchema,
  searchQuerySchema,
  tenantIdSchema,
  createUserSchema,
  updateUserSchema,
  loginSchema,
  passwordResetSchema,
  createTenantSchema,
  createProjectSchema,
} from "./core/validation.middleware";

// =============================================================================
// CORE MIDDLEWARE (CONTINUED)
// =============================================================================
export { default as correlationIdMiddleware } from "./core/correlation-id.middleware";
export { default as rateLimitMiddleware } from "./core/rate-limit.middleware";

// =============================================================================
// LOGGING MIDDLEWARE
// =============================================================================
export { default as auditLogMiddleware } from "./compliance/audit-log.middleware";
export { default as performanceMonitorMiddleware } from "./core/performance-monitor.middleware";

// =============================================================================
// INTEGRATION MIDDLEWARE
// =============================================================================
export {
  externalAPIMiddleware,
  stripeAPIConfig,
  sendgridAPIConfig,
  slackAPIConfig,
  twilioAPIConfig,
  sendEmail,
  sendSlackNotification,
  sendSMS,
  processStripePayment,
  getAPIStatus,
  testAPIConnection,
} from "./integrations/external-api.middleware";

// Note: Other integration middleware exports will be added as they are implemented
// export { webhookMiddleware } from "./integrations/webhook.middleware";
// export { eventBusMiddleware } from "./integrations/event-bus.middleware";
// export { cacheMiddleware } from "./integrations/cache.middleware";
// export { notificationMiddleware } from "./integrations/notification.middleware";

// =============================================================================
// MIDDLEWARE COMBINATIONS
// =============================================================================

// Import specific middlewares for stack functions
import { jwtAuthMiddleware } from "./security/jwt-auth.middleware";
import { tenantContextMiddleware } from "./security/tenant-context.middleware";
import {
  rbacAuthMiddleware,
  requireAdmin,
} from "./security/rbac-auth.middleware";
import rateLimitMiddleware from "./core/rate-limit.middleware";
import { sanitizeInputMiddleware } from "./core/validation.middleware";

/**
 * Standard authentication stack
 * Use for routes that require authenticated users
 */
export const authStack = () => [jwtAuthMiddleware, tenantContextMiddleware];

/**
 * Full security stack
 * Use for routes that require authentication + specific permissions
 */
export const securityStack = (permission: string) => [
  jwtAuthMiddleware,
  tenantContextMiddleware,
  rbacAuthMiddleware(permission),
];

/**
 * Admin-only stack
 * Use for routes that require admin access
 */
export const adminStack = () => [
  jwtAuthMiddleware,
  tenantContextMiddleware,
  requireAdmin(),
];

/**
 * Public route stack
 * Use for routes that don't require authentication but need basic protection
 */
export const publicStack = () => [
  rateLimitMiddleware(),
  sanitizeInputMiddleware,
];
