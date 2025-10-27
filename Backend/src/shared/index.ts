/**
 * =====================================================================
 *  ENTERPRISE SHARED MODULE — Main Export Index
 * =====================================================================
 *  Purpose:
 *   Central export point for all shared infrastructure components in the
 *   ERP Multitenant SaaS enterprise architecture. Provides clean, organized
 *   access to all transversal types, utilities, services, and patterns.
 *
 *  Architecture Principles:
 *   - **Zero Duplication**: Single source of truth for cross-domain components
 *   - **Type Safety**: Perfect alignment with Prisma schema and enterprise patterns
 *   - **Multi-Tenant**: All components support tenant-scoped operations
 *   - **RBAC Integration**: Permission-aware operations with role hierarchy
 *   - **Audit Compliance**: Comprehensive change tracking and compliance support
 *   - **Performance**: Optimized for high-throughput enterprise workloads
 *
 *  Module Categories:
 *   🧱 Types     - Transversal type definitions and interfaces
 *   🔧 Utils     - Utility functions and helper classes
 *   🏗️ Services  - Infrastructure services and patterns
 *   🎯 Controllers - Base controller classes and patterns
 *   ✅ Validators - Validation system and rule engines
 *   🛣️ Routes    - Shared routing patterns and middleware
 *
 *  Version: 1.0.0
 *  Module: SharedInfrastructure
 *  Category: Core Infrastructure
 * =====================================================================
 */

// =============================================================================
// 🧱 TYPES - Transversal Type System
// =============================================================================

/**
 * Export all shared types from the centralized type system.
 * Includes base types, security types, finance types, workflow types,
 * catalog types, and integration types.
 */
export * from "./types";

// =============================================================================
// 🎯 SPECIALIZED EXPORTS - Commonly Used Components
// =============================================================================

/**
 * Re-export frequently used types and classes for convenience.
 * These are the most commonly imported components across features.
 */

// Context and Security Types (from services)
export type {
  RequestContext,
  ActorContext,
  TenantContext,
  RLSClaims,
  BaseEntity,
} from "./services/base/context.service";

// Security Context (from types)
export type { SecurityContext, RLSContext } from "./types/base/rls.types";

// Error Management (from utils)
export {
  AppError,
  ValidationError,
  BusinessError,
  ErrorUtils,
  ErrorSeverity,
  ErrorCategory,
} from "./utils/base/error.util";

// Common API Response Type (alias for backward compatibility)
export { AppError as ApiError } from "./utils/base/error.util";

// Base Service Pattern (from services)
export { BaseService } from "./services/base/base.service";

// Base Controller Pattern (from controllers)
export { BaseController } from "./controllers/base/base.controller";

// =============================================================================
// 🔧 UTILS - Core Utility Classes (Enterprise Grade)
// =============================================================================

// Security Utils - Core cryptographic and security operations
export { CryptoUtils } from "./utils/security/crypto.util";
export { JwtUtils } from "./utils/security/jwt.util";
export { PasswordUtils } from "./utils/security/password.util";
export { RbacUtils } from "./utils/security/rbac.util";
export { AuditUtils } from "./utils/security/audit.util";

// Base Utils - Core data manipulation and validation
export { TypeGuards } from "./utils/base/type-guards.util";
export { ArrayUtils } from "./utils/base/array.util";
export { ObjectUtils } from "./utils/base/object.util";
export { StringUtils } from "./utils/base/string.util";
export { DateUtils } from "./utils/base/date.util";
export { ValidationUtils } from "./utils/base/validation.util";

// Performance Utils
export { UtilityPerformance } from "./utils/performance/performance.util";

// =============================================================================
// ✅ VALIDATORS - Core Validation Classes
// =============================================================================

export { BaseValidator } from "./validators/base.validator";

export type {
  ValidationResult,
  ValidationSuccess,
  ValidationFailure,
  ValidationIssue,
  ValidationContext as ValidatorContext,
  ValidationFactory,
  AsyncValidationResult,
} from "./validators/validation.types";

// =============================================================================
// 📊 MODULE METADATA - Version and Configuration
// =============================================================================

/**
 * Shared module metadata and version information
 */
export const SHARED_MODULE_VERSION = "1.0.0";
export const SHARED_MODULE_NAME = "ERP-Shared-Infrastructure";

/**
 * Module configuration and feature flags
 */
export const SHARED_MODULE_CONFIG = {
  name: SHARED_MODULE_NAME,
  version: SHARED_MODULE_VERSION,
  description: "Enterprise shared infrastructure for ERP Multitenant SaaS",

  // Feature flags
  features: {
    auditLogging: true,
    performanceMonitoring: true,
    securityEnforcement: true,
    validationSystem: true,
    errorHandling: true,
    multiTenancy: true,
    rbacIntegration: true,
    rlsEnforcement: true,
  },

  // Component counts for monitoring
  components: {
    types: "50+",
    utils: "30+",
    services: "20+",
    controllers: "10+",
    validators: "25+",
    routes: "5+",
  },

  // Compliance and standards
  compliance: {
    dataProtection: "GDPR, CCPA compliant",
    security: "SOC 2 Type II aligned",
    audit: "Full audit trail support",
    multiTenant: "Row-level security enforced",
  },
} as const;

/**
 * Type-safe feature flag checker
 */
export function isSharedFeatureEnabled(
  feature: keyof typeof SHARED_MODULE_CONFIG.features
): boolean {
  return SHARED_MODULE_CONFIG.features[feature];
}
