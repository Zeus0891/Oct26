/**
 * Shared Types Index
 *
 * Central export point for all transversal (cross-domain) types in the enterprise architecture.
 * These types provide reusable primitives shared across modules with perfect Prisma schema alignment,
 * full RBAC integration, and comprehensive audit trails.
 *
 * ## Architecture Overview
 *
 * This shared types system implements enterprise-grade patterns:
 * - **Multi-Tenant Isolation**: All types support tenant-scoped RLS filtering
 * - **RBAC Integration**: Permission-aware operations with role hierarchy support
 * - **Audit Trails**: Comprehensive change tracking and compliance support
 * - **Type Safety**: Perfect alignment with Prisma schema and client exports
 * - **Zero Duplication**: Single source of truth for cross-domain primitives
 *
 * ## Type Categories
 *
 * ### 🧱 Base Types
 * Foundational primitives used across all domains:
 * - Tenant context and multi-tenancy support
 * - Actor representation and audit metadata
 * - RLS context for secure data access
 * - Currency, tax, and approval workflow base types
 *
 * ### 🔐 Security Types
 * RBAC and access control primitives:
 * - Role hierarchy and permission management
 * - Authentication and session context
 * - Compliance and privacy controls
 * - Access patterns and authorization flows
 *
 * ### 💼 Finance Types
 * Financial and accounting primitives:
 * - Money handling with currency precision
 * - General ledger and journal entries
 * - Currency rate management
 * - Billing and payment processing
 *
 * ### 🔄 Workflow Types
 * Business process and workflow primitives:
 * - Status lifecycle management
 * - Revision control and versioning
 * - Approval flow orchestration
 * - Task assignment and tracking
 *
 * ### � Catalog Types
 * Reference data and standardized lookups:
 * - Country and region codes for internationalization
 * - Currency definitions and formatting rules
 * - Units of measure and conversion standards
 * - Industry-standard reference data

 * ### �🔗 Integration Types
 * System interoperability and external connectivity:
 * - External system reference mapping
 * - Webhook delivery and event management
 * - API credential and rate limit management
 * - Generic integration patterns
 *
 * ## Usage Guidelines
 *
 * 1. **Import Specificity**: Import specific types rather than using wildcard imports
 *    ```typescript
 *    import type { TenantInfo, ActorInfo } from '@/shared/types/base';
 *    import type { RBACRole, PermissionGrant } from '@/shared/types/security';
 *    ```
 *
 * 2. **Enum Usage**: Always import enums from @prisma/client, never redefine
 *    ```typescript
 *    import type { RoleType, AssignmentScope } from '@prisma/client';
 *    ```
 *
 * 3. **Type Composition**: Extend base types for domain-specific needs
 *    ```typescript
 *    interface ProjectMember extends ActorInfo {
 *      projectRole: string;
 *      assignedAt: Date;
 *    }
 *    ```
 *
 * ## Integration Points
 *
 * - **RLS Context**: `withRLS.ts` consumes `RLSContext` for transaction scoping
 * - **RBAC Layer**: Auto-generated RBAC files consume security type definitions
 * - **Audit System**: `TenantAuditLog` integrates with audit metadata types
 * - **Validation**: Business rules reference shared validation patterns
 *
 * @category Shared Types
 * @description Enterprise-grade transversal type definitions
 * @version 1.0.0
 */

// =============================================================================
// 🧱 BASE TYPES - Foundational primitives for enterprise architecture
// =============================================================================

/**
 * Core foundational types used across all domains.
 * These provide the building blocks for multi-tenant, RBAC-aware applications.
 */
export * from "./base";

// =============================================================================
// 🔐 SECURITY TYPES - RBAC and access control primitives
// =============================================================================

/**
 * Security and access control types with full RBAC integration.
 * Aligned with database functions (rls.*) and role hierarchy patterns.
 */
export * from "./security";

// Re-export commonly needed context types from services for convenience
export type {
    RLSClaims, RequestContext
} from "../services/base/context.service";

// =============================================================================
// 💼 FINANCE TYPES - Financial and accounting primitives
// =============================================================================

/**
 * Financial management types for accounting, billing, and payment processing.
 * Support multi-currency operations with precise decimal handling.
 */
export * from "./finance";

// =============================================================================
// 🔄 WORKFLOW TYPES - Business process and workflow management
// =============================================================================

/**
 * Workflow and process management types for status tracking, approvals,
 * revision control, and task management with RBAC integration.
 *
 * Note: To avoid naming conflicts with base approval types, import specific
 * workflow types when needed rather than using wildcard imports.
 */
export {
    ApprovalApprover, ApprovalDecisionInfo, ApprovalDelegationRequest,
    ApprovalEscalation, ApprovalNotificationConfig, ApprovalRequestInfo,
    // Workflow approval flow types (prefixed to avoid conflicts)
    ApprovalRuleDefinition, ApprovalStatusInfo, ApprovalStep, ApprovalStepInstance,
    ApprovalWorkflowEvent, ApprovalWorkflowInstance,
    ApprovalWorkflowState, AssignTaskRequest, BidStatusInfo, BulkApprovalOperation, BulkStatusOperation, BulkTaskOperation,
    // Projects domain DTOs
    CreateProjectDTO, CreateProjectMemberDTO, CreateProjectTaskDTO, CreateRevisionRequest, CreateTaskRequest, EstimateRevisionInfo, EstimateStatusInfo, GenericRevision, ProjectListFilter, ProjectMemberListFilter, ProjectRevisionInfo, ProjectStatusInfo, ProjectTaskListFilter, RestoreRevisionRequest, RevisionAuditEvent,
    RevisionBranch, RevisionComparison,
    RevisionFieldChange, RevisionMergeRequest, RevisionMetadata, RevisionMetrics, RevisionPermissions,
    // Revision control types
    RevisionTrackingBase, StatusChangeEvent, StatusLifecycle, StatusMetrics, StatusOperationResult,
    // Status management types
    StatusTrackingBase,
    StatusTransition, StatusTransitionRequest, StatusValidationResult, SubmittalStatusInfo, TaskAssignmentInfo,
    TaskChecklistItemInfo,
    TaskDependencyInfo, TaskFilter,
    // Task management types
    TaskInfo, TaskMetrics, TaskNotificationConfig, TaskProgress, TaskSort, TaskStatusInfo, TaskTemplate, TaskWithDetails, TaskWorklog, UpdateProjectDTO, UpdateProjectMemberDTO, UpdateProjectTaskDTO, UpdateTaskRequest
} from "./workflow";

// =============================================================================
// � CATALOG TYPES - Reference data and standardized lookups
// =============================================================================

/**
 * Catalog and reference data types providing standardized lookups for
 * countries, currencies, units of measure, and other industry standards.
 */
export * from "./catalogs";

// =============================================================================
// �🔗 INTEGRATION TYPES - External system connectivity
// =============================================================================

/**
 * Integration and interoperability types for external system connections,
 * API management, webhook delivery, and cross-system reference mapping.
 */
export * from "./integration";

// =============================================================================
// TYPE RE-EXPORTS - Commonly used Prisma enums for convenience
// =============================================================================

/**
 * Commonly used Prisma enums re-exported for convenience.
 * These maintain the single source of truth principle while providing
 * easier access to frequently used enum values.
 */
export type {
    APBillStatus, ActorStatus, ActorType, ApiKeyScope, ApiKeyStatus, ApprovalStatus, AssignmentScope, AuditAction,
    // Financial enums
    CurrencyCode,
    DebitCreditIndicator, DeliveryChannel, DeliveryStatus,
    // Workflow enums
    EstimateStatus,
    // Common impact/risk/theme enums
    ImpactLevel, IntegrationCategory,
    // Integration enums
    IntegrationConnectionStatus,
    IntegrationProviderStatus, PaymentStatus, PermissionScope, ProjectStatus,
    // Common utility enums
    RetentionPolicy, RiskLevel,
    // Security and RBAC enums
    RoleType, SubmittalStatus, TaskPriority,
    TaskType, TenantRegion,
    // Tenant and actor enums
    TenantStatus,
    TenantTier, ThemePreference, WorkItemStatus
} from "@prisma/client";

// =============================================================================
// VERSION INFORMATION
// =============================================================================

/**
 * Shared types version information
 */
export const SHARED_TYPES_VERSION = "1.0.0";

/**
 * Supported Prisma schema version
 */
export const PRISMA_SCHEMA_VERSION = "2025.1";

/**
 * Type system metadata
 */
export const TYPE_SYSTEM_META = {
  version: SHARED_TYPES_VERSION,
  prismaVersion: PRISMA_SCHEMA_VERSION,
  generatedAt: "2025-10-21T00:00:00Z",
  categories: [
    "base",
    "security",
    "finance",
    "workflow",
    "integration",
    "catalogs",
  ],
  totalTypes: 180, // Updated count based on actual implementation
  features: [
    "Multi-tenant RLS support",
    "RBAC integration",
    "Comprehensive audit trails",
    "Perfect Prisma alignment",
    "Enterprise-grade patterns",
    "Reference data catalogs",
  ],
} as const;
