/**
 * Audit Service - Centralized audit logging and compliance tracking
 *
 * Provides transversal audit logging capabilities for all operations,
 * supporting compliance requirements and security monitoring.
 *
 * @module AuditService
 * @category Shared Services - Audit Infrastructure
 * @description Centralized audit logging and compliance service
 * @version 1.0.0
 */

import { PrismaClient } from "@prisma/client";
import type { RequestContext } from "../base/context.service";
import { withTenantRLS } from "../../../lib/prisma/withRLS";
import { ErrorUtils } from "../../utils/base/error.util";

/**
 * Audit event types
 */
export enum AuditEventType {
  // Authentication events
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  LOGIN_FAILED = "LOGIN_FAILED",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  PASSWORD_RESET = "PASSWORD_RESET",

  // Authorization events
  PERMISSION_GRANTED = "PERMISSION_GRANTED",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  ROLE_ASSIGNED = "ROLE_ASSIGNED",
  ROLE_REMOVED = "ROLE_REMOVED",

  // Data events
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LIST = "LIST",
  SEARCH = "SEARCH",
  EXPORT = "EXPORT",
  IMPORT = "IMPORT",

  // System events
  SYSTEM_START = "SYSTEM_START",
  SYSTEM_STOP = "SYSTEM_STOP",
  CONFIG_CHANGE = "CONFIG_CHANGE",
  BACKUP_CREATED = "BACKUP_CREATED",
  BACKUP_RESTORED = "BACKUP_RESTORED",

  // Security events
  SECURITY_VIOLATION = "SECURITY_VIOLATION",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  ACCESS_DENIED = "ACCESS_DENIED",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

/**
 * Audit event severity levels
 */
export enum AuditSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * Audit event status
 */
export enum AuditStatus {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

/**
 * Audit event structure
 */
export interface AuditEvent {
  /** Unique event identifier */
  id?: string;
  /** Event type */
  type: AuditEventType | string;
  /** Event severity */
  severity: AuditSeverity;
  /** Event status */
  status?: AuditStatus;
  /** Event timestamp */
  timestamp?: Date;
  /** User who performed the action */
  userId?: string;
  /** User's session ID */
  sessionId?: string;
  /** Tenant context */
  tenantId?: string;
  /** Resource affected */
  resource?: {
    type: string;
    id?: string;
    name?: string;
  };
  /** Action performed */
  action?: string;
  /** Event description */
  description: string;
  /** Additional event metadata */
  metadata?: Record<string, unknown>;
  /** Client information */
  client?: {
    ip?: string;
    userAgent?: string;
    deviceId?: string;
  };
  /** Request context */
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
  };
  /** Security flags */
  securityFlags?: {
    isSuspicious?: boolean;
    riskScore?: number;
    isAnonymous?: boolean;
    requiresReview?: boolean;
  };
  /** Changes made (for data modification events) */
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    fields?: string[];
  };
  /** Performance metrics */
  performance?: {
    duration?: number;
    queryCount?: number;
    memoryUsed?: number;
  };
}

/**
 * Audit filter options
 */
export interface AuditFilter {
  /** Event types to include */
  eventTypes?: AuditEventType[];
  /** Severity levels to include */
  severities?: AuditSeverity[];
  /** User ID filter */
  userId?: string;
  /** Tenant ID filter */
  tenantId?: string;
  /** Date range filter */
  dateRange?: {
    from: Date;
    to: Date;
  };
  /** Resource type filter */
  resourceType?: string;
  /** Resource ID filter */
  resourceId?: string;
  /** Search text in descriptions */
  searchText?: string;
  /** Include security flagged events only */
  securityFlagged?: boolean;
}

/**
 * Audit summary statistics
 */
export interface AuditSummary {
  /** Total events */
  totalEvents: number;
  /** Events by type */
  eventsByType: Record<AuditEventType, number>;
  /** Events by severity */
  eventsBySeverity: Record<AuditSeverity, number>;
  /** Events by status */
  eventsByStatus: Record<AuditStatus, number>;
  /** Most active users */
  topUsers: Array<{
    userId: string;
    eventCount: number;
  }>;
  /** Most accessed resources */
  topResources: Array<{
    resourceType: string;
    resourceId: string;
    accessCount: number;
  }>;
  /** Security alerts */
  securityAlerts: {
    suspiciousEvents: number;
    highRiskEvents: number;
    criticalEvents: number;
  };
  /** Performance metrics */
  performance: {
    averageDuration: number;
    slowestOperations: Array<{
      type: string;
      duration: number;
    }>;
  };
}

/**
 * Centralized audit service
 *
 * Provides comprehensive audit logging capabilities for all operations
 * with support for compliance requirements and security monitoring.
 *
 * @example
 * ```typescript
 * const auditService = new AuditService(prisma);
 *
 * // Log a simple event
 * await auditService.logEvent({
 *   type: AuditEventType.CREATE,
 *   severity: AuditSeverity.LOW,
 *   description: 'Project created',
 *   userId: 'user-123',
 *   tenantId: 'tenant-456',
 *   resource: { type: 'Project', id: 'proj-789' }
 * });
 *
 * // Log with change tracking
 * await auditService.logDataChange(
 *   ctx,
 *   'Project',
 *   'proj-123',
 *   oldData,
 *   newData,
 *   AuditEventType.UPDATE
 * );
 * ```
 */
export class AuditService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Log audit event with enterprise error handling and RLS compliance
   *
   * Records an audit event with full context, metadata, and comprehensive
   * error handling. Supports RLS for tenant isolation and enterprise logging patterns.
   *
   * @param event - Audit event to log
   * @returns Promise that resolves when event is logged
   */
  async logEvent(event: AuditEvent): Promise<void> {
    const startTime = Date.now();
    let enrichedEvent: AuditEvent | undefined;

    try {
      // Validate audit event
      const validation = this.validateAuditEvent(event);
      if (!validation.success) {
        console.error(
          `[AuditService] Invalid audit event: ${validation.error}`
        );
        // Attempt to log validation error without recursive calls
        await this.logValidationError(
          event,
          validation.error || "Unknown validation error"
        );
        return;
      }

      // Enrich event with enterprise metadata
      enrichedEvent = {
        ...event,
        id: event.id || this.generateEventId(),
        timestamp: event.timestamp || new Date(),
        status: event.status || AuditStatus.SUCCESS,
        securityFlags: {
          isSuspicious: false,
          riskScore: 0,
          isAnonymous: !event.userId,
          requiresReview: event.severity === AuditSeverity.CRITICAL,
          ...event.securityFlags,
        },
        metadata: {
          ...event.metadata,
          auditServiceVersion: "1.0.0",
          auditTimestamp: new Date().toISOString(),
          auditSource: "AuditService",
          executionTimeMs: Date.now() - startTime,
        },
      };

      // Calculate risk score if not provided
      if (
        enrichedEvent.securityFlags &&
        !enrichedEvent.securityFlags.riskScore
      ) {
        enrichedEvent.securityFlags.riskScore =
          this.calculateRiskScore(enrichedEvent);
      }

      // Store in database using RLS for tenant isolation
      if (event.tenantId) {
        await withTenantRLS(
          event.tenantId,
          ["AUDIT_LOGGER"], // Special audit role
          async (tx) => await this.storeAuditEvent(enrichedEvent!)
        );
      } else {
        // System-level events without tenant context
        await this.storeAuditEvent(enrichedEvent);
      }

      // Send to external monitoring if high risk
      if (enrichedEvent.securityFlags!.riskScore! > 70) {
        await this.sendSecurityAlert(enrichedEvent);
      }

      // Track audit service performance metrics
      const executionTime = Date.now() - startTime;
      if (executionTime > 1000) {
        // Log slow audit operations
        console.warn(
          `[AuditService] Slow audit operation: ${executionTime}ms for event ${enrichedEvent.type}`
        );
      }
    } catch (error) {
      // Comprehensive error handling for audit failures
      const executionTime = Date.now() - startTime;

      console.error("[AuditService] Failed to log audit event:", {
        error: error instanceof Error ? error.message : String(error),
        eventType: event.type,
        tenantId: event.tenantId,
        userId: event.userId,
        executionTimeMs: executionTime,
        timestamp: new Date().toISOString(),
      });

      // Attempt to store the audit failure in a separate failure log
      await this.logAuditFailure(event, error, executionTime);

      // Don't throw - audit failures shouldn't break business operations
      // But we should monitor these failures closely
    }
  }

  /**
   * Validate audit event structure and required fields
   *
   * @param event - Audit event to validate
   * @returns Validation result
   */
  private validateAuditEvent(event: AuditEvent): {
    success: boolean;
    error?: string;
  } {
    if (!event.type) {
      return { success: false, error: "Event type is required" };
    }

    if (!event.severity) {
      return { success: false, error: "Event severity is required" };
    }

    if (
      !Object.values(AuditEventType).includes(event.type as AuditEventType) &&
      typeof event.type !== "string"
    ) {
      return { success: false, error: "Invalid event type" };
    }

    if (!Object.values(AuditSeverity).includes(event.severity)) {
      return { success: false, error: "Invalid event severity" };
    }

    return { success: true };
  }

  /**
   * Log validation errors for audit events
   *
   * @param originalEvent - The original event that failed validation
   * @param validationError - The validation error message
   */
  private async logValidationError(
    originalEvent: AuditEvent,
    validationError: string
  ): Promise<void> {
    try {
      // Create a minimal validation error event to avoid recursion
      await this.storeAuditEvent({
        id: this.generateEventId(),
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        timestamp: new Date(),
        status: AuditStatus.ERROR,
        description: `Audit event validation failed: ${validationError}`,
        tenantId: originalEvent.tenantId,
        userId: originalEvent.userId,
        metadata: {
          validationError,
          originalEventType: originalEvent.type,
          auditSource: "AuditService",
        },
      });
    } catch (error) {
      // If even the validation error fails to log, just console log it
      console.error("[AuditService] Failed to log validation error:", error);
    }
  }

  /**
   * Log audit operation failures
   *
   * @param originalEvent - The original event that failed to log
   * @param error - The error that occurred
   * @param executionTime - Time taken before failure
   */
  private async logAuditFailure(
    originalEvent: AuditEvent,
    error: unknown,
    executionTime: number
  ): Promise<void> {
    try {
      // Store audit failure in a separate, simplified table or log system
      console.error("[AuditService] AUDIT_FAILURE", {
        originalEventType: originalEvent.type,
        tenantId: originalEvent.tenantId,
        userId: originalEvent.userId,
        error: error instanceof Error ? error.message : String(error),
        executionTimeMs: executionTime,
        timestamp: new Date().toISOString(),
        correlationId: originalEvent.metadata?.correlationId,
      });

      // In a production system, this might write to a separate failure log or external monitoring system
    } catch (secondaryError) {
      // If even the failure logging fails, there's a serious system issue
      console.error(
        "[AuditService] CRITICAL: Failed to log audit failure:",
        secondaryError
      );
    }
  }

  /**
   * Log data change event
   *
   * Records data modification with before/after states.
   *
   * @param ctx - Request context
   * @param entityType - Type of entity being modified
   * @param entityId - ID of entity being modified
   * @param oldData - Data before change
   * @param newData - Data after change
   * @param eventType - Type of change event
   */
  async logDataChange(
    ctx: RequestContext,
    entityType: string,
    entityId: string,
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    eventType: AuditEventType = AuditEventType.UPDATE
  ): Promise<void> {
    const changes = this.calculateChanges(oldData, newData);

    await this.logEvent({
      type: eventType,
      severity: this.determineSeverityByChanges(changes),
      description: `${entityType} ${eventType.toLowerCase()}d`,
      userId: ctx.actor?.userId,
      sessionId: ctx.actor?.sessionId,
      tenantId: ctx.tenant?.tenantId,
      resource: {
        type: entityType,
        id: entityId,
      },
      client: {
        ip: ctx.request?.ip,
        userAgent: ctx.request?.userAgent,
      },
      request: {
        method: ctx.request?.method,
        url: ctx.request?.url,
      },
      changes,
      metadata: {
        correlationId: ctx.correlationId,
        changeCount: changes.fields?.length || 0,
      },
    });
  }

  /**
   * Log authentication event
   *
   * Records authentication-related events with security context.
   *
   * @param ctx - Request context
   * @param eventType - Authentication event type
   * @param success - Whether authentication was successful
   * @param details - Additional authentication details
   */
  async logAuthEvent(
    ctx: RequestContext,
    eventType: AuditEventType,
    success: boolean,
    details?: Record<string, unknown>
  ): Promise<void> {
    await this.logEvent({
      type: eventType,
      severity: success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
      status: success ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
      description: `Authentication ${eventType.toLowerCase()}: ${
        success ? "success" : "failure"
      }`,
      userId: ctx.actor?.userId,
      sessionId: ctx.actor?.sessionId,
      tenantId: ctx.tenant?.tenantId,
      client: {
        ip: ctx.request?.ip,
        userAgent: ctx.request?.userAgent,
      },
      securityFlags: {
        isSuspicious: !success,
        riskScore: success ? 10 : 50,
        requiresReview: !success,
      },
      metadata: {
        correlationId: ctx.correlationId,
        ...details,
      },
    });
  }

  /**
   * Get audit trail for entity
   *
   * Retrieves complete audit history for a specific entity.
   *
   * @param entityType - Type of entity
   * @param entityId - ID of entity
   * @param filter - Additional filter options
   * @returns Array of audit events for the entity
   */
  async getAuditTrail(
    entityType: string,
    entityId: string,
    filter?: Partial<AuditFilter>
  ): Promise<AuditEvent[]> {
    try {
      // Determine tenant from filter or require it
      const tenantId = filter?.tenantId;
      if (!tenantId) {
        console.warn("[AuditService] Tenant ID required for audit trail");
        return [];
      }

      return await withTenantRLS(
        tenantId,
        ["AUDIT_READER"], // Role for reading audit data
        async (tx: any) => {
          const auditLogs =
            (await tx.tenantAuditLog?.findMany({
              where: {
                tenantId: tenantId,
                resourceType: entityType,
                resourceId: entityId,
                ...(filter?.eventTypes && {
                  eventType: { in: filter.eventTypes },
                }),
                ...(filter?.severities && {
                  severity: { in: filter.severities },
                }),
                ...(filter?.dateRange && {
                  timestamp: {
                    gte: filter.dateRange.from,
                    lte: filter.dateRange.to,
                  },
                }),
              },
              orderBy: { timestamp: "desc" },
            })) || [];

          return auditLogs.map((log: any) => ({
            id: log.id,
            type: log.eventType,
            severity: log.severity,
            status: log.status,
            description: log.description,
            userId: log.userId,
            sessionId: log.sessionId,
            tenantId: log.tenantId,
            resource: {
              type: log.resourceType,
              id: log.resourceId,
            },
            client: {
              ip: log.clientIp,
              userAgent: log.userAgent,
            },
            request: {
              method: log.requestMethod,
              url: log.requestUrl,
            },
            metadata: log.metadata,
            changes: log.changes,
            securityFlags: log.securityFlags,
            performance: log.performance,
            timestamp: log.timestamp,
          }));
        },
        filter?.userId
      );
    } catch (error) {
      console.error("[AuditService] Failed to get audit trail:", error);
      return [];
    }
  }

  /**
   * Filter audit events
   *
   * Retrieves audit events based on filter criteria.
   *
   * @param filter - Filter criteria
   * @returns Filtered audit events
   */
  async filterEvents(filter: AuditFilter): Promise<AuditEvent[]> {
    try {
      // In real implementation, this would build and execute query
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error("[AuditService] Failed to filter events:", error);
      return [];
    }
  }

  /**
   * Generate audit summary
   *
   * Creates statistical summary of audit events.
   *
   * @param filter - Filter criteria for summary
   * @returns Audit summary statistics
   */
  async generateSummary(filter?: Partial<AuditFilter>): Promise<AuditSummary> {
    try {
      // In real implementation, this would aggregate audit data
      return {
        totalEvents: 0,
        eventsByType: {} as Record<AuditEventType, number>,
        eventsBySeverity: {} as Record<AuditSeverity, number>,
        eventsByStatus: {} as Record<AuditStatus, number>,
        topUsers: [],
        topResources: [],
        securityAlerts: {
          suspiciousEvents: 0,
          highRiskEvents: 0,
          criticalEvents: 0,
        },
        performance: {
          averageDuration: 0,
          slowestOperations: [],
        },
      };
    } catch (error) {
      console.error("[AuditService] Failed to generate summary:", error);
      throw error;
    }
  }

  /**
   * Detect suspicious activity
   *
   * Analyzes audit events to identify potential security threats.
   *
   * @param filter - Filter criteria for analysis
   * @returns Array of suspicious events
   */
  async detectSuspiciousActivity(
    filter?: Partial<AuditFilter>
  ): Promise<AuditEvent[]> {
    try {
      // In real implementation, this would use ML/rules to detect threats
      return [];
    } catch (error) {
      console.error(
        "[AuditService] Failed to detect suspicious activity:",
        error
      );
      return [];
    }
  }

  /**
   * Store audit event in database
   *
   * Persists audit event to database with proper indexing.
   *
   * @param event - Audit event to store
   */
  private async storeAuditEvent(event: AuditEvent): Promise<void> {
    // In real implementation, this would use Prisma to store in TenantAuditLog
    // For now, just log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[AuditService] Audit Event:", {
        type: event.type,
        severity: event.severity,
        description: event.description,
        userId: event.userId,
        tenantId: event.tenantId,
        timestamp: event.timestamp,
      });
    }

    // Store audit event with RLS protection
    if (event.tenantId) {
      try {
        await withTenantRLS(
          event.tenantId,
          ["AUDIT_WRITER"], // Special role for audit operations
          async (tx: any) => {
            return await tx.tenantAuditLog?.create({
              data: {
                id: event.id,
                tenantId: event.tenantId!,
                eventType: event.type,
                severity: event.severity,
                status: event.status!,
                description: event.description,
                userId: event.userId,
                sessionId: event.sessionId,
                resourceType: event.resource?.type,
                resourceId: event.resource?.id,
                clientIp: event.client?.ip,
                userAgent: event.client?.userAgent,
                requestMethod: event.request?.method,
                requestUrl: event.request?.url,
                metadata: event.metadata as any,
                changes: event.changes as any,
                securityFlags: event.securityFlags as any,
                performance: event.performance as any,
                timestamp: event.timestamp!,
              },
            });
          },
          event.userId
        );
      } catch (error) {
        console.error("[AuditService] Failed to store audit event:", error);
        // Don't throw - audit failures shouldn't break business operations
      }
    }
  }

  /**
   * Calculate changes between old and new data
   *
   * Identifies what fields changed during a data modification.
   *
   * @param oldData - Data before change
   * @param newData - Data after change
   * @returns Change information
   */
  private calculateChanges(
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>
  ): {
    before: Record<string, unknown>;
    after: Record<string, unknown>;
    fields: string[];
  } {
    const changedFields: string[] = [];
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};

    // Find changed fields
    const allFields = new Set([
      ...Object.keys(oldData),
      ...Object.keys(newData),
    ]);

    for (const field of allFields) {
      if (JSON.stringify(oldData[field]) !== JSON.stringify(newData[field])) {
        changedFields.push(field);
        before[field] = oldData[field];
        after[field] = newData[field];
      }
    }

    return {
      before,
      after,
      fields: changedFields,
    };
  }

  /**
   * Calculate risk score for audit event
   *
   * Determines risk level based on event characteristics.
   *
   * @param event - Audit event
   * @returns Risk score (0-100)
   */
  private calculateRiskScore(event: AuditEvent): number {
    let score = 0;

    // Base score by event type
    switch (event.type) {
      case AuditEventType.DELETE:
        score += 30;
        break;
      case AuditEventType.SECURITY_VIOLATION:
      case AuditEventType.SUSPICIOUS_ACTIVITY:
        score += 80;
        break;
      case AuditEventType.LOGIN_FAILED:
        score += 20;
        break;
      case AuditEventType.PERMISSION_DENIED:
        score += 15;
        break;
      default:
        score += 5;
    }

    // Severity modifier
    switch (event.severity) {
      case AuditSeverity.CRITICAL:
        score += 50;
        break;
      case AuditSeverity.HIGH:
        score += 30;
        break;
      case AuditSeverity.MEDIUM:
        score += 15;
        break;
      case AuditSeverity.LOW:
        score += 5;
        break;
    }

    // Anonymous user modifier
    if (!event.userId) {
      score += 25;
    }

    // Status modifier
    if (
      event.status === AuditStatus.FAILURE ||
      event.status === AuditStatus.ERROR
    ) {
      score += 20;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determine severity based on data changes
   *
   * Calculates appropriate severity level based on what changed.
   *
   * @param changes - Change information
   * @returns Appropriate severity level
   */
  private determineSeverityByChanges(changes: {
    fields: string[];
  }): AuditSeverity {
    const sensitiveFields = [
      "password",
      "email",
      "permissions",
      "roles",
      "tenantId",
    ];

    const hasSensitiveChanges = changes.fields.some((field) =>
      sensitiveFields.some((sensitive) =>
        field.toLowerCase().includes(sensitive)
      )
    );

    if (hasSensitiveChanges) {
      return AuditSeverity.HIGH;
    }

    if (changes.fields.length > 5) {
      return AuditSeverity.MEDIUM;
    }

    return AuditSeverity.LOW;
  }

  /**
   * Send security alert for high-risk events
   *
   * Notifies security monitoring systems of high-risk events.
   *
   * @param event - High-risk audit event
   */
  private async sendSecurityAlert(event: AuditEvent): Promise<void> {
    // In real implementation, this would integrate with security monitoring
    // (SIEM, notification systems, etc.)
    console.warn("[SECURITY ALERT]", {
      type: event.type,
      severity: event.severity,
      riskScore: event.securityFlags?.riskScore,
      description: event.description,
      userId: event.userId,
      tenantId: event.tenantId,
      timestamp: event.timestamp,
    });
  }

  /**
   * Generate unique event ID
   *
   * Creates a unique identifier for audit events.
   *
   * @returns Unique event ID
   */
  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
