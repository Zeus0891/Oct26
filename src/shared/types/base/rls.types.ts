/**
 * RLS Types - Row Level Security context and configuration
 *
 * Depends on Prisma Tables: RLSPolicy, RLSConfig, SecurityContext, AccessControl
 * Depends on Prisma Enums: SecurityLevel, AccessMethod, PermissionScope, RoleType
 *
 * Purpose: Row Level Security implementation, access control, and security context across all modules
 */

import {
  SecurityLevel,
  AccessMethod,
  PermissionScope,
  RoleType,
} from "@prisma/client";

/**
 * RLS Policy configuration
 * Maps to tenant-specific security policies
 */
export interface RLSPolicyBase {
  /** Policy identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Policy name */
  name: string;
  /** Target table/entity */
  tableName: string;
  /** Policy type (SELECT, INSERT, UPDATE, DELETE) */
  policyType: AccessMethod;
  /** SQL expression for policy */
  expression: string;
  /** Whether policy is enabled */
  isEnabled: boolean;
  /** Policy priority/order */
  priority: number;
  /** Policy description */
  description?: string;
}

/**
 * RLS context for database operations
 * Used to enforce row-level security in queries
 */
export interface RLSContext {
  /** Current tenant identifier */
  tenantId: string;
  /** Current user/member identifier */
  userId?: string;
  /** Current member identifier (tenant-scoped) */
  memberId?: string;
  /** Whether user is tenant owner */
  isOwner?: boolean;
  /** User access level */
  accessLevel?: SecurityLevel;
  /** Additional context variables */
  variables?: Record<string, unknown>;
}

/**
 * Security context for operations
 * Enhanced context with permission and role information
 */
export interface SecurityContext extends RLSContext {
  /** User roles within tenant */
  roles?: string[];
  /** User permissions */
  permissions?: string[];
  /** Security clearance level */
  clearanceLevel?: string;
  /** Data classification access */
  dataClassifications?: string[];
  /** Session security level */
  sessionSecurityLevel?: string;
  /** Whether MFA is verified */
  mfaVerified?: boolean;
}

/**
 * withRLS function options
 * Configuration for RLS-enabled database operations
 */
export interface WithRLSOptions {
  /** RLS context to apply */
  context: RLSContext;
  /** Whether to enable audit logging */
  auditEnabled?: boolean;
  /** Audit correlation ID */
  correlationId?: string;
  /** Override tenant isolation */
  bypassTenantIsolation?: boolean;
  /** Enable performance monitoring */
  enableMetrics?: boolean;
  /** Custom security variables */
  securityVars?: Record<string, unknown>;
}

/**
 * RLS validation result
 * Result of validating RLS context and permissions
 */
export interface RLSValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation error messages */
  errors?: string[];
  /** Warnings (non-blocking) */
  warnings?: string[];
  /** Computed security level */
  securityLevel?: string;
  /** Effective permissions */
  effectivePermissions?: string[];
}

/**
 * Access control rule
 * Defines granular access control for entities
 */
export interface AccessControlRule {
  /** Rule identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Target entity/resource */
  resource: string;
  /** Action being controlled */
  action: string;
  /** Subject (role, user, group) */
  subject: string;
  /** Subject type (ROLE, USER, GROUP) */
  subjectType: string;
  /** Whether access is allowed */
  allow: boolean;
  /** Conditions for access */
  conditions?: Record<string, unknown>;
  /** Rule priority */
  priority: number;
}

/**
 * Data classification context
 * Used for handling sensitive data access
 */
export interface DataClassificationContext {
  /** Data classification level */
  classification: string;
  /** Required clearance level */
  requiredClearance?: string;
  /** Handling instructions */
  handlingInstructions?: string[];
  /** Retention policy */
  retentionPolicy?: string;
  /** Encryption requirements */
  encryptionRequired?: boolean;
}

/**
 * RLS runtime state
 * Current state of RLS enforcement for a session
 */
export interface RLSRuntimeState {
  /** Whether RLS is active */
  isActive: boolean;
  /** Current tenant context */
  tenantId?: string;
  /** Current user context */
  userId?: string;
  /** Active policies count */
  activePolicies: number;
  /** Last validation timestamp */
  lastValidation?: Date;
  /** Performance metrics */
  metrics?: {
    validationTime?: number;
    queryOverhead?: number;
    policyEvaluations?: number;
  };
}

/**
 * Tenant isolation configuration
 * Defines how tenant data is isolated
 */
export interface TenantIsolationConfig {
  /** Tenant identifier */
  tenantId: string;
  /** Isolation mode (STRICT, STANDARD, RELAXED) */
  isolationMode: string;
  /** Allowed cross-tenant operations */
  allowedCrossTenantOps?: string[];
  /** Shared resources access */
  sharedResourceAccess?: boolean;
  /** Audit cross-tenant access */
  auditCrossTenantAccess?: boolean;
}

/**
 * RLS performance metrics
 * Metrics for monitoring RLS performance
 */
export interface RLSPerformanceMetrics {
  /** Tenant identifier */
  tenantId: string;
  /** Average policy evaluation time (ms) */
  avgEvaluationTime: number;
  /** Query overhead percentage */
  queryOverhead: number;
  /** Total policy evaluations */
  totalEvaluations: number;
  /** Failed evaluations */
  failedEvaluations: number;
  /** Cache hit rate */
  cacheHitRate: number;
  /** Measurement timestamp */
  timestamp: Date;
}
