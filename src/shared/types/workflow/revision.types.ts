/**
 * Workflow Revision Types
 *
 * Defines version control and audit trail types for entities that support
 * revision tracking with permission-based access and comprehensive change auditing.
 *
 * @description Revision and versioning for workflow entities
 * @aligned_with Prisma tables: EstimateRevision, ProjectReport (versioned entities)
 * @aligned_with Prisma enums: EstimateChildStatus, ProjectChildStatus
 */

import type {
  EstimateChildStatus,
  ProjectChildStatus,
  RetentionPolicy,
} from "@prisma/client";

/**
 * Base interface for all revisioned entities
 * Provides common fields for version tracking and change management
 */
export interface RevisionTrackingBase {
  /** Current version number */
  version: number;
  /** When this version was created */
  createdAt: Date;
  /** When this version was last updated */
  updatedAt: Date;
  /** Actor who created this version */
  createdByActorId?: string;
  /** Actor who last updated this version */
  updatedByActorId?: string;
  /** Audit correlation ID for tracking related changes */
  auditCorrelationId?: string;
  /** Data classification level */
  dataClassification: string;
  /** Data retention policy */
  retentionPolicy?: RetentionPolicy;
}

/**
 * Revision metadata and change summary
 */
export interface RevisionMetadata {
  /** Revision number (sequential) */
  revisionNumber: number;
  /** Status of this revision */
  status: string;
  /** Summary of changes in this revision */
  changeSummary?: string;
  /** Tags associated with this revision */
  tags?: string[];
  /** Whether this is a major revision */
  isMajorRevision: boolean;
  /** Previous revision ID */
  previousRevisionId?: string;
  /** Next revision ID (if not current) */
  nextRevisionId?: string;
}

/**
 * Estimate revision tracking aligned with EstimateRevision table
 */
export interface EstimateRevisionInfo extends RevisionTrackingBase {
  /** Revision ID */
  id: string;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Parent estimate ID */
  estimateId: string;
  /** Revision number */
  revisionNumber: number;
  /** Status from EstimateChildStatus enum */
  status: EstimateChildStatus;

  /** Financial snapshot data */
  snapshotSubtotal?: number;
  snapshotDiscountType?: string;
  snapshotDiscountValue?: number;
  snapshotDiscountAmount?: number;
  snapshotTaxType?: string;
  snapshotTaxRate?: number;
  snapshotTaxAmount?: number;
  snapshotGrandTotal?: number;
  snapshotTerms?: string;
  snapshotValidUntil?: Date;
}

/**
 * Project revision tracking for versioned project entities
 */
export interface ProjectRevisionInfo extends RevisionTrackingBase {
  /** Revision ID */
  id: string;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Parent project ID */
  projectId: string;
  /** Status from ProjectChildStatus enum */
  status: ProjectChildStatus;
  /** Type of project artifact being revised */
  artifactType: string;
  /** Reference to the specific artifact */
  artifactId: string;
}

/**
 * Generic revision for any revisioned entity
 */
export interface GenericRevision extends RevisionTrackingBase {
  /** Revision ID */
  id: string;
  /** Tenant ID */
  tenantId: string;
  /** Parent entity ID */
  parentEntityId: string;
  /** Entity type being revised */
  entityType: string;
  /** Revision metadata */
  metadata: RevisionMetadata;
  /** Snapshot data at time of revision */
  snapshotData?: Record<string, unknown>;
}

/**
 * Revision comparison result
 */
export interface RevisionComparison {
  /** Source revision */
  sourceRevision: string;
  /** Target revision */
  targetRevision: string;
  /** Field-level changes */
  changes: RevisionFieldChange[];
  /** Summary statistics */
  changesSummary: {
    addedFields: number;
    modifiedFields: number;
    removedFields: number;
  };
}

/**
 * Individual field change in a revision
 */
export interface RevisionFieldChange {
  /** Field path (dot notation) */
  fieldPath: string;
  /** Field display name */
  fieldName: string;
  /** Change type */
  changeType: "ADDED" | "MODIFIED" | "REMOVED";
  /** Previous value */
  previousValue?: unknown;
  /** New value */
  newValue?: unknown;
  /** Data type of the field */
  dataType: string;
}

/**
 * Revision creation request
 */
export interface CreateRevisionRequest {
  /** Parent entity ID */
  parentEntityId: string;
  /** Entity type */
  entityType: string;
  /** Actor creating revision */
  actorId: string;
  /** Reason for creating revision */
  reason?: string;
  /** Whether this is a major revision */
  isMajorRevision?: boolean;
  /** Tags to associate */
  tags?: string[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Revision restore request
 */
export interface RestoreRevisionRequest {
  /** Revision ID to restore */
  revisionId: string;
  /** Target entity ID */
  targetEntityId: string;
  /** Actor performing restore */
  actorId: string;
  /** Reason for restore */
  reason: string;
  /** Whether to create backup before restore */
  createBackup?: boolean;
}

/**
 * Revision permissions for access control
 */
export interface RevisionPermissions {
  /** Can view revision history */
  canView: boolean;
  /** Can create new revisions */
  canCreate: boolean;
  /** Can restore from revisions */
  canRestore: boolean;
  /** Can delete revisions */
  canDelete: boolean;
  /** Can compare revisions */
  canCompare: boolean;
  /** Can export revision data */
  canExport: boolean;
}

/**
 * Revision audit event
 */
export interface RevisionAuditEvent {
  /** Event ID */
  id: string;
  /** Event type */
  eventType: "CREATED" | "RESTORED" | "DELETED" | "COMPARED" | "EXPORTED";
  /** Entity that was revised */
  entityId: string;
  /** Entity type */
  entityType: string;
  /** Revision ID involved */
  revisionId: string;
  /** Actor who performed action */
  actorId: string;
  /** Timestamp of event */
  timestamp: Date;
  /** Additional event data */
  eventData?: Record<string, unknown>;
}

/**
 * Revision branch for parallel development
 */
export interface RevisionBranch {
  /** Branch ID */
  id: string;
  /** Branch name */
  name: string;
  /** Base revision this branch started from */
  baseRevisionId: string;
  /** Current head revision of branch */
  headRevisionId: string;
  /** Actor who created branch */
  createdByActorId: string;
  /** Branch creation timestamp */
  createdAt: Date;
  /** Whether branch is active */
  isActive: boolean;
  /** Branch description */
  description?: string;
}

/**
 * Revision merge request
 */
export interface RevisionMergeRequest {
  /** Source branch */
  sourceBranch: string;
  /** Target branch */
  targetBranch: string;
  /** Actor requesting merge */
  requestedByActorId: string;
  /** Merge title */
  title: string;
  /** Merge description */
  description?: string;
  /** Auto-merge if no conflicts */
  autoMerge?: boolean;
  /** Reviewers for merge approval */
  reviewers?: string[];
}

/**
 * Revision analytics and metrics
 */
export interface RevisionMetrics {
  /** Entity type */
  entityType: string;
  /** Time period */
  periodStart: Date;
  periodEnd: Date;
  /** Total revisions created */
  totalRevisions: number;
  /** Revisions by type */
  revisionsByType: Record<string, number>;
  /** Average time between revisions */
  averageTimeBetweenRevisions: number;
  /** Most active contributors */
  topContributors: Array<{
    actorId: string;
    revisionCount: number;
  }>;
  /** Revision size statistics */
  sizeMetrics: {
    averageSize: number;
    largestRevision: number;
    smallestRevision: number;
  };
}
