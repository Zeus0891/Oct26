/**
 * Workflow Status Types
 *
 * Defines status lifecycle management with role-based state transition permissions.
 * These types apply to all stateful entities in the system and support RBAC-aware
 * status transitions with audit trails.
 *
 * @description Status management for workflow entities
 * @aligned_with Prisma tables: Estimate, Bid, Project, ApprovalRequest, Submittal, Task
 * @aligned_with Prisma enums: EstimateStatus, BidStatus, ProjectStatus, ApprovalStatus, SubmittalStatus, WorkItemStatus, TaskPriority, TaskType
 */

import type {
  EstimateStatus,
  BidStatus,
  ProjectStatus,
  ApprovalStatus,
  SubmittalStatus,
  WorkItemStatus,
  TaskPriority,
  TaskType,
} from "@prisma/client";

/**
 * Base interface for all status-aware entities
 * Provides common fields for status tracking and transitions
 */
export interface StatusTrackingBase {
  /** Current status of the entity */
  status: string;
  /** Timestamp when status was last changed */
  statusChangedAt?: Date;
  /** Actor who changed the status */
  statusChangedByActorId?: string;
  /** Optional reason for status change */
  statusChangeReason?: string;
  /** Version number for optimistic locking */
  version: number;
}

/**
 * Status transition definition with permission requirements
 */
export interface StatusTransition {
  /** Source status */
  fromStatus: string;
  /** Target status */
  toStatus: string;
  /** Required permission to perform transition */
  requiredPermission: string;
  /** Required role types that can perform transition */
  allowedRoles: string[];
  /** Whether transition requires approval */
  requiresApproval: boolean;
  /** Optional validation rules */
  validationRules?: string[];
}

/**
 * Status lifecycle configuration for an entity type
 */
export interface StatusLifecycle {
  /** Entity type this lifecycle applies to */
  entityType: string;
  /** Initial status when entity is created */
  initialStatus: string;
  /** All possible statuses for this entity */
  possibleStatuses: string[];
  /** Valid transitions between statuses */
  transitions: StatusTransition[];
  /** Final statuses (cannot transition from) */
  finalStatuses: string[];
}

/**
 * Estimate status tracking aligned with EstimateStatus enum
 */
export interface EstimateStatusInfo extends StatusTrackingBase {
  status: EstimateStatus;
}

/**
 * Bid status tracking aligned with BidStatus enum
 */
export interface BidStatusInfo extends StatusTrackingBase {
  status: BidStatus;
}

/**
 * Project status tracking aligned with ProjectStatus enum
 */
export interface ProjectStatusInfo extends StatusTrackingBase {
  status: ProjectStatus;
}

/**
 * Approval status tracking aligned with ApprovalStatus enum
 */
export interface ApprovalStatusInfo extends StatusTrackingBase {
  status: ApprovalStatus;
}

/**
 * Submittal status tracking aligned with SubmittalStatus enum
 */
export interface SubmittalStatusInfo extends StatusTrackingBase {
  status: SubmittalStatus;
}

/**
 * Task/Work item status tracking aligned with WorkItemStatus enum
 */
export interface TaskStatusInfo extends StatusTrackingBase {
  status: WorkItemStatus;
  /** Task priority from TaskPriority enum */
  priority: TaskPriority;
  /** Task type from TaskType enum */
  taskType: TaskType;
  /** Estimated completion date */
  dueDate?: Date;
  /** Actual completion date */
  completedAt?: Date;
}

/**
 * Status change audit event
 */
export interface StatusChangeEvent {
  /** Entity ID that changed status */
  entityId: string;
  /** Entity type */
  entityType: string;
  /** Previous status */
  previousStatus: string;
  /** New status */
  newStatus: string;
  /** Actor who made the change */
  changedByActorId: string;
  /** Timestamp of change */
  changedAt: Date;
  /** Reason for change */
  reason?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Status validation result
 */
export interface StatusValidationResult {
  /** Whether transition is valid */
  isValid: boolean;
  /** Error message if invalid */
  errorMessage?: string;
  /** Required permissions missing */
  missingPermissions?: string[];
  /** Additional validation issues */
  validationErrors?: string[];
}

/**
 * Status transition request
 */
export interface StatusTransitionRequest {
  /** Entity ID to transition */
  entityId: string;
  /** Entity type */
  entityType: string;
  /** Target status */
  targetStatus: string;
  /** Actor requesting transition */
  actorId: string;
  /** Reason for transition */
  reason?: string;
  /** Additional data for transition */
  metadata?: Record<string, unknown>;
}

/**
 * Bulk status operation for multiple entities
 */
export interface BulkStatusOperation {
  /** Entity IDs to update */
  entityIds: string[];
  /** Entity type */
  entityType: string;
  /** Target status for all entities */
  targetStatus: string;
  /** Actor performing operation */
  actorId: string;
  /** Reason for bulk operation */
  reason?: string;
  /** Whether to skip validation failures */
  skipFailures: boolean;
}

/**
 * Status operation result
 */
export interface StatusOperationResult {
  /** Whether operation succeeded */
  success: boolean;
  /** Number of entities affected */
  affectedCount: number;
  /** Failed entity IDs with reasons */
  failures?: Array<{
    entityId: string;
    reason: string;
  }>;
  /** Validation results per entity */
  validationResults?: Array<{
    entityId: string;
    result: StatusValidationResult;
  }>;
}

/**
 * Status metrics and analytics
 */
export interface StatusMetrics {
  /** Entity type */
  entityType: string;
  /** Time period for metrics */
  periodStart: Date;
  periodEnd: Date;
  /** Count by status */
  statusCounts: Record<string, number>;
  /** Average time in each status */
  averageTimeInStatus: Record<string, number>;
  /** Transition frequency */
  transitionCounts: Record<string, number>;
}
