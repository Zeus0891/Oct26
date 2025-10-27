/**
 * Audit Types - Audit trail and tracking context
 *
 * Depends on Prisma Tables: AuditLog, AuditEntity, AuditTrail, SystemLog
 * Depends on Prisma Enums: AuditAction, AuditStatus, SystemLogLevel, SystemLogType
 *
 * Purpose: Audit logging, change tracking, and compliance monitoring across all modules
 */

import type { AuditAction, LogLevel, LogType } from "@prisma/client";

/**
 * Base audit log entry
 * Maps to Prisma AuditLog table core fields
 */
export interface AuditLogBase {
  /** Unique audit log identifier (UUID) */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Actor (user/member) who performed the action */
  actorId?: string;
  /** Type of action performed */
  action: AuditAction;
  /** Audit status */
  status: string;
  /** Entity type being audited */
  entityType: string;
  /** Entity identifier being audited */
  entityId: string;
  /** Old values (before change) */
  oldValues?: Record<string, unknown>;
  /** New values (after change) */
  newValues?: Record<string, unknown>;
  /** Changed fields */
  changedFields?: string[];
  /** Audit timestamp */
  timestamp: Date;
  /** Client IP address */
  ipAddress?: string;
  /** User agent information */
  userAgent?: string;
  /** Request correlation ID */
  correlationId?: string;
  /** Session identifier */
  sessionId?: string;
  /** Additional audit metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Audit entity configuration
 * Maps to Prisma AuditEntity table
 */
export interface AuditEntityBase {
  /** Entity type identifier */
  entityType: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Whether auditing is enabled for this entity */
  auditEnabled: boolean;
  /** Fields to include in audit */
  auditFields?: string[];
  /** Fields to exclude from audit */
  excludeFields?: string[];
  /** Retention period in days */
  retentionDays?: number;
  /** Audit level (BASIC, DETAILED, FULL) */
  auditLevel: string;
}

/**
 * Audit trail summary
 * Maps to Prisma AuditTrail table
 */
export interface AuditTrailBase {
  /** Trail identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Entity type */
  entityType: string;
  /** Entity identifier */
  entityId: string;
  /** First audit entry date */
  firstAuditAt: Date;
  /** Last audit entry date */
  lastAuditAt: Date;
  /** Total number of audit entries */
  totalEntries: number;
  /** Unique actors count */
  uniqueActors: number;
  /** Trail status */
  status: string;
}

/**
 * System log entry
 * Maps to Prisma SystemLog table
 */
export interface SystemLogBase {
  /** Log entry identifier */
  id: string;
  /** Associated tenant ID (if applicable) */
  tenantId?: string;
  /** Log level */
  level: LogLevel;
  /** Log type/category */
  type: LogType;
  /** Log message */
  message: string;
  /** Source component/service */
  source?: string;
  /** Error code (if applicable) */
  errorCode?: string;
  /** Stack trace (for errors) */
  stackTrace?: string;
  /** Request correlation ID */
  correlationId?: string;
  /** Additional log data */
  data?: Record<string, unknown>;
  /** Log timestamp */
  timestamp: Date;
}

/**
 * Audit context for operations
 * Used to track who is performing what action
 */
export interface AuditContext {
  /** Actor performing the action */
  actorId?: string;
  /** Tenant context */
  tenantId: string;
  /** Session identifier */
  sessionId?: string;
  /** Request correlation ID */
  correlationId?: string;
  /** Client IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
  /** Action being performed */
  action?: AuditAction;
  /** Entity being modified */
  entityType?: string;
  /** Entity identifier */
  entityId?: string;
}

/**
 * Change detection result
 * Used to track what fields changed in an entity
 */
export interface ChangeDetection {
  /** Whether any changes were detected */
  hasChanges: boolean;
  /** List of changed field names */
  changedFields: string[];
  /** Old values for changed fields */
  oldValues: Record<string, unknown>;
  /** New values for changed fields */
  newValues: Record<string, unknown>;
}

/**
 * Audit query filters
 * Used for searching and filtering audit logs
 */
export interface AuditQueryFilters {
  /** Filter by tenant */
  tenantId?: string;
  /** Filter by actor */
  actorId?: string;
  /** Filter by entity type */
  entityType?: string;
  /** Filter by entity ID */
  entityId?: string;
  /** Filter by action */
  action?: AuditAction;
  /** Filter by date range start */
  startDate?: Date;
  /** Filter by date range end */
  endDate?: Date;
  /** Filter by IP address */
  ipAddress?: string;
  /** Filter by correlation ID */
  correlationId?: string;
  /** Page number for pagination */
  page?: number;
  /** Items per page */
  limit?: number;
}

/**
 * Compliance report data
 * Used for generating audit reports for compliance
 */
export interface ComplianceReportData {
  /** Report period start */
  periodStart: Date;
  /** Report period end */
  periodEnd: Date;
  /** Total audit entries */
  totalEntries: number;
  /** Entries by action type */
  entriesByAction: Record<string, number>;
  /** Entries by entity type */
  entriesByEntity: Record<string, number>;
  /** Unique actors count */
  uniqueActors: number;
  /** Failed operations count */
  failedOperations: number;
  /** Security violations count */
  securityViolations: number;
}
