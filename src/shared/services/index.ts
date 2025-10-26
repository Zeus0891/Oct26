/**
 * Shared Services Index
 *
 * Central export point for all shared services in the enterprise architecture.
 * Provides foundational infrastructure services that support all feature modules.
 *
 * @module SharedServices
 * @category Shared Services
 * @description Complete shared services infrastructure
 * @version 1.0.0
 */

// =============================================================================
// BASE SERVICES - Foundation infrastructure
// =============================================================================

// Base service patterns
export { BaseService } from "./base/base.service";

// Context management
export { ContextService } from "./base/context.service";
export type {
  RequestContext,
  ActorContext,
  TenantContext,
  BaseEntity,
  RLSClaims,
} from "./base/context.service";

// Pagination services
export { PaginationService } from "./base/pagination.service";

// Validation services
export { ValidationService } from "./base/validation.service";
export type {
  ValidationRule,
  ValidationResult,
  ValidationContext,
} from "./base/validation.service";

// =============================================================================
// AUDIT SERVICES - Compliance and monitoring
// =============================================================================

// Audit infrastructure
export { AuditService } from "./audit/audit.service";
export type {
  AuditEvent,
  AuditFilter,
  AuditSummary,
} from "./audit/audit.service";
export {
  AuditEventType,
  AuditSeverity,
  AuditStatus,
} from "./audit/audit.service";

// =============================================================================
// SECURITY SERVICES - Authentication and authorization
// =============================================================================

// Authentication services
export { AuthService } from "./security/auth.service";
export type {
  AuthCredentials,
  AuthResult,
  SessionInfo,
  PasswordResetRequest,
  PasswordReset,
  MFASetup,
  MFAVerification,
} from "./security/auth.service";

// RBAC services
export { RBACService } from "./security/rbac.service";
export type {
  PermissionCheckRequest,
  PermissionCheckResult,
  RoleAssignmentRequest,
  PermissionGrantRequest,
  BulkPermissionOperation,
  RoleHierarchy,
} from "./security/rbac.service";

// Permission services
export { PermissionService } from "./security/permission.service";
export type {
  PermissionEvaluationRequest,
  PermissionEvaluationResult,
  EffectivePermission,
  PermissionCondition,
  PermissionScope,
} from "./security/permission.service";

// Compliance services
export { ComplianceService } from "./security/compliance.service";
export type {
  DataSubjectRight,
  ProcessingBasis,
  DataRetentionPolicy,
  RetentionRule,
  DataSubjectRequest,
  DataProcessingRecord,
  PrivacyImpactAssessment,
  DataBreachIncident,
} from "./security/compliance.service";

// =============================================================================
// BARREL EXPORTS - Simplified imports
// =============================================================================

/**
 * Re-export common types for convenience
 */
export type { ApiResponse } from "./security/auth.service";

// =============================================================================
// SERVICE FACTORY - Dependency injection helpers
// =============================================================================

import { PrismaClient } from "@prisma/client";
import { AuditService } from "./audit/audit.service";
import { AuthService } from "./security/auth.service";
import { RBACService } from "./security/rbac.service";
import { PermissionService } from "./security/permission.service";
import { ComplianceService } from "./security/compliance.service";
import { ContextService } from "./base/context.service";
import { PaginationService } from "./base/pagination.service";
import { ValidationService } from "./base/validation.service";

/**
 * Service factory for creating configured service instances
 */
export class ServiceFactory {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create audit service instance
   */
  createAuditService(): AuditService {
    return new AuditService(this.prisma);
  }

  /**
   * Create authentication service instance
   */
  createAuthService(): AuthService {
    const auditService = this.createAuditService();
    return new AuthService(this.prisma, auditService);
  }

  /**
   * Create RBAC service instance
   */
  createRBACService(): RBACService {
    const auditService = this.createAuditService();
    return new RBACService(this.prisma, auditService);
  }

  /**
   * Create permission service instance
   */
  createPermissionService(): PermissionService {
    const auditService = this.createAuditService();
    const rbacService = this.createRBACService();
    return new PermissionService(this.prisma, auditService, rbacService);
  }

  /**
   * Create compliance service instance
   */
  createComplianceService(): ComplianceService {
    const auditService = this.createAuditService();
    return new ComplianceService(this.prisma, auditService);
  }

  /**
   * Create context service instance
   */
  createContextService(): ContextService {
    return new ContextService();
  }

  /**
   * Create pagination service instance
   */
  createPaginationService(): PaginationService {
    return new PaginationService();
  }

  /**
   * Create validation service instance
   */
  createValidationService(): ValidationService {
    return new ValidationService();
  }

  /**
   * Create all services at once
   */
  createAllServices() {
    const auditService = this.createAuditService();
    const contextService = this.createContextService();
    const paginationService = this.createPaginationService();
    const validationService = this.createValidationService();
    const authService = this.createAuthService();
    const rbacService = this.createRBACService();
    const permissionService = this.createPermissionService();
    const complianceService = this.createComplianceService();

    return {
      audit: auditService,
      context: contextService,
      pagination: paginationService,
      validation: validationService,
      auth: authService,
      rbac: rbacService,
      permission: permissionService,
      compliance: complianceService,
    };
  }
}

// =============================================================================
// VERSION INFORMATION
// =============================================================================

/**
 * Shared services version information
 */
export const SHARED_SERVICES_VERSION = "1.0.0";

/**
 * Service capabilities metadata
 */
export const SERVICE_CAPABILITIES = {
  version: SHARED_SERVICES_VERSION,
  generatedAt: "2025-01-20T00:00:00Z",
  categories: ["base", "audit", "security"],
  services: [
    "BaseService",
    "ContextService",
    "PaginationService",
    "ValidationService",
    "AuditService",
    "AuthService",
    "RBACService",
  ],
  features: [
    "Multi-tenant RLS support",
    "Comprehensive audit logging",
    "Enterprise authentication",
    "Hierarchical RBAC",
    "Business rule validation",
    "Cursor-based pagination",
    "Request context management",
  ],
  integrations: [
    "Prisma ORM",
    "PostgreSQL RLS",
    "JWT authentication",
    "bcrypt password hashing",
    "Cross-service audit trails",
  ],
} as const;

/**
 * Service health check interface
 */
export interface ServiceHealthCheck {
  service: string;
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: Date;
  details?: Record<string, unknown>;
}

/**
 * Service health monitoring
 */
export class ServiceHealthMonitor {
  constructor(
    private readonly services: ReturnType<ServiceFactory["createAllServices"]>
  ) {}

  /**
   * Check health of all services
   */
  async checkHealth(): Promise<ServiceHealthCheck[]> {
    const checks: ServiceHealthCheck[] = [];

    // Basic health checks for each service
    for (const [serviceName, service] of Object.entries(this.services)) {
      try {
        // Simple health check - service is instantiated and has expected methods
        const isHealthy = service && typeof service === "object";

        checks.push({
          service: serviceName,
          status: isHealthy ? "healthy" : "unhealthy",
          timestamp: new Date(),
          details: {
            hasInstance: !!service,
            methods: service
              ? Object.getOwnPropertyNames(Object.getPrototypeOf(service))
              : [],
          },
        });
      } catch (error) {
        checks.push({
          service: serviceName,
          status: "unhealthy",
          timestamp: new Date(),
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    }

    return checks;
  }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/**
 * @example
 * ```typescript
 * // Initialize service factory
 * import { PrismaClient } from '@prisma/client';
 * import { ServiceFactory } from './shared/services';
 *
 * const prisma = new PrismaClient();
 * const serviceFactory = new ServiceFactory(prisma);
 * const services = serviceFactory.createAllServices();
 *
 * // Use authentication service
 * const authResult = await services.auth.authenticate({
 *   identifier: 'user@example.com',
 *   password: 'password123'
 * }, requestContext);
 *
 * // Check permissions with RBAC
 * const hasPermission = await services.rbac.checkPermission({
 *   user: { userId: 'user-123', tenantId: 'tenant-456', roles: ['manager'] },
 *   resource: { type: 'Project', id: 'proj-789' },
 *   action: 'update'
 * }, requestContext);
 *
 * // Paginate results
 * const paginatedResults = await services.pagination.paginate(
 *   queryBuilder,
 *   { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }
 * );
 *
 * // Validate business rules
 * const validation = await services.validation.validateBusinessRules(
 *   'Project',
 *   'create',
 *   projectData,
 *   requestContext
 * );
 * ```
 */
