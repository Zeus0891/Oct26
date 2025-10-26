/**
 * Audit Utility
 *
 * Provides comprehensive audit logging and security monitoring utilities.
 * Tracks user activities, system events, and security-related operations.
 *
 * @module AuditUtils
 * @category Shared Utils - Security
 * @description Audit logging and security monitoring utilities
 * @version 1.0.0
 */

import { TypeGuards } from "../base/type-guards.util";
import { CryptoUtils } from "./crypto.util";

/**
 * Audit event types
 */
export enum AuditEventType {
  // Authentication events
  LOGIN = "login",
  LOGOUT = "logout",
  LOGIN_FAILED = "login_failed",
  PASSWORD_CHANGE = "password_change",
  PASSWORD_RESET = "password_reset",

  // Authorization events
  PERMISSION_GRANTED = "permission_granted",
  PERMISSION_DENIED = "permission_denied",
  ROLE_ASSIGNED = "role_assigned",
  ROLE_REMOVED = "role_removed",

  // Data events
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  EXPORT = "export",
  IMPORT = "import",

  // System events
  SYSTEM_START = "system_start",
  SYSTEM_STOP = "system_stop",
  CONFIG_CHANGE = "config_change",
  BACKUP_CREATED = "backup_created",
  BACKUP_RESTORED = "backup_restored",

  // Security events
  SECURITY_VIOLATION = "security_violation",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  INVALID_TOKEN = "invalid_token",
  PRIVILEGE_ESCALATION = "privilege_escalation",
}

/**
 * Audit event severity levels
 */
export enum AuditSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Audit event status
 */
export enum AuditStatus {
  SUCCESS = "success",
  FAILURE = "failure",
  WARNING = "warning",
  ERROR = "error",
}

/**
 * Audit event structure
 */
export interface AuditEvent {
  /** Unique event identifier */
  id: string;
  /** Event type */
  type: AuditEventType;
  /** Event severity */
  severity: AuditSeverity;
  /** Event status */
  status: AuditStatus;
  /** Event timestamp */
  timestamp: Date;
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
  /** Response context */
  response?: {
    status?: number;
    duration?: number;
  };
  /** Security context */
  security?: {
    riskScore?: number;
    flags?: string[];
  };
}

/**
 * Audit filter criteria
 */
export interface AuditFilter {
  /** Start date for filtering */
  startDate?: Date;
  /** End date for filtering */
  endDate?: Date;
  /** User ID filter */
  userId?: string;
  /** Event types to include */
  eventTypes?: AuditEventType[];
  /** Severity levels to include */
  severities?: AuditSeverity[];
  /** Status values to include */
  statuses?: AuditStatus[];
  /** Tenant ID filter */
  tenantId?: string;
  /** Resource type filter */
  resourceType?: string;
  /** Resource ID filter */
  resourceId?: string;
  /** Search text */
  searchText?: string;
  /** Client IP filter */
  clientIp?: string;
  /** Minimum risk score */
  minRiskScore?: number;
}

/**
 * Audit summary statistics
 */
export interface AuditSummary {
  /** Total events count */
  totalEvents: number;
  /** Events by type */
  eventsByType: Record<AuditEventType, number>;
  /** Events by severity */
  eventsBySeverity: Record<AuditSeverity, number>;
  /** Events by status */
  eventsByStatus: Record<AuditStatus, number>;
  /** Unique users count */
  uniqueUsers: number;
  /** High-risk events count */
  highRiskEvents: number;
  /** Failed login attempts */
  failedLogins: number;
  /** Security violations count */
  securityViolations: number;
}

/**
 * Security monitoring configuration
 */
export interface SecurityMonitoringConfig {
  /** Enable real-time monitoring */
  realTimeMonitoring?: boolean;
  /** Failed login threshold */
  failedLoginThreshold?: number;
  /** Rate limit monitoring */
  rateLimitMonitoring?: boolean;
  /** Suspicious activity detection */
  suspiciousActivityDetection?: boolean;
  /** Alert thresholds */
  alertThresholds?: {
    criticalEvents?: number;
    highRiskScore?: number;
    failedLogins?: number;
  };
}

/**
 * Utility class for audit logging and security monitoring.
 * Provides comprehensive event tracking, filtering, and analysis capabilities.
 *
 * @example
 * ```typescript
 * import { AuditUtils, AuditEventType, AuditSeverity } from '@/shared/utils';
 *
 * // Log an audit event
 * const event = AuditUtils.createEvent({
 *   type: AuditEventType.LOGIN,
 *   severity: AuditSeverity.LOW,
 *   userId: "user123",
 *   description: "User logged in successfully",
 *   client: { ip: "192.168.1.1", userAgent: "Mozilla/5.0..." }
 * });
 *
 * await AuditUtils.logEvent(event, logger);
 *
 * // Filter audit events
 * const events = AuditUtils.filterEvents(allEvents, {
 *   eventTypes: [AuditEventType.LOGIN, AuditEventType.LOGOUT],
 *   startDate: new Date("2023-01-01"),
 *   userId: "user123"
 * });
 *
 * // Generate audit summary
 * const summary = AuditUtils.generateSummary(events);
 * ```
 */
export class AuditUtils {
  /**
   * Creates a new audit event with proper structure and validation.
   *
   * @param eventData - Event data to create audit event from
   * @returns Structured audit event
   * @complexity O(1)
   */
  static createEvent(eventData: {
    type: AuditEventType;
    severity: AuditSeverity;
    status?: AuditStatus;
    userId?: string;
    sessionId?: string;
    tenantId?: string;
    resource?: { type: string; id?: string; name?: string };
    action?: string;
    description: string;
    metadata?: Record<string, unknown>;
    client?: { ip?: string; userAgent?: string; deviceId?: string };
    request?: {
      method?: string;
      url?: string;
      headers?: Record<string, string>;
      params?: Record<string, unknown>;
    };
    response?: { status?: number; duration?: number };
  }): AuditEvent {
    if (!Object.values(AuditEventType).includes(eventData.type)) {
      throw new Error("Invalid audit event type");
    }

    if (!Object.values(AuditSeverity).includes(eventData.severity)) {
      throw new Error("Invalid audit event severity");
    }

    if (
      !TypeGuards.isString(eventData.description) ||
      eventData.description.trim().length === 0
    ) {
      throw new Error("Event description is required");
    }

    const event: AuditEvent = {
      id: CryptoUtils.generateUuid(),
      type: eventData.type,
      severity: eventData.severity,
      status: eventData.status || this.getDefaultStatus(eventData.type),
      timestamp: new Date(),
      userId: eventData.userId,
      sessionId: eventData.sessionId,
      tenantId: eventData.tenantId,
      resource: eventData.resource,
      action: eventData.action,
      description: eventData.description.trim(),
      metadata: eventData.metadata,
      client: eventData.client,
      request: eventData.request,
      response: eventData.response,
      security: {
        riskScore: this.calculateRiskScore(eventData),
        flags: this.identifySecurityFlags(eventData),
      },
    };

    return event;
  }

  /**
   * Gets default status for event type.
   */
  private static getDefaultStatus(type: AuditEventType): AuditStatus {
    const failureTypes = [
      AuditEventType.LOGIN_FAILED,
      AuditEventType.PERMISSION_DENIED,
      AuditEventType.SECURITY_VIOLATION,
      AuditEventType.INVALID_TOKEN,
    ];

    return failureTypes.includes(type)
      ? AuditStatus.FAILURE
      : AuditStatus.SUCCESS;
  }

  /**
   * Calculates risk score for an event.
   *
   * @param eventData - Event data
   * @returns Risk score (0-100)
   * @complexity O(1)
   */
  private static calculateRiskScore(eventData: {
    type: AuditEventType;
    severity: AuditSeverity;
    client?: { ip?: string };
    metadata?: Record<string, unknown>;
  }): number {
    let score = 0;

    // Base score from event type
    const typeScores: Partial<Record<AuditEventType, number>> = {
      [AuditEventType.LOGIN_FAILED]: 20,
      [AuditEventType.PERMISSION_DENIED]: 15,
      [AuditEventType.SECURITY_VIOLATION]: 50,
      [AuditEventType.SUSPICIOUS_ACTIVITY]: 40,
      [AuditEventType.PRIVILEGE_ESCALATION]: 60,
      [AuditEventType.INVALID_TOKEN]: 25,
      [AuditEventType.RATE_LIMIT_EXCEEDED]: 30,
    };

    score += typeScores[eventData.type] || 0;

    // Severity modifier
    const severityModifiers = {
      [AuditSeverity.LOW]: 1.0,
      [AuditSeverity.MEDIUM]: 1.5,
      [AuditSeverity.HIGH]: 2.0,
      [AuditSeverity.CRITICAL]: 3.0,
    };

    score *= severityModifiers[eventData.severity];

    // Additional risk factors
    if (eventData.client?.ip && this.isUnknownIpAddress(eventData.client.ip)) {
      score += 10;
    }

    if (eventData.metadata?.multipleFailures) {
      score += 15;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Identifies security flags for an event.
   */
  private static identifySecurityFlags(eventData: {
    type: AuditEventType;
    client?: { ip?: string; userAgent?: string };
    metadata?: Record<string, unknown>;
  }): string[] {
    const flags: string[] = [];

    // High-risk event types
    const highRiskTypes = [
      AuditEventType.SECURITY_VIOLATION,
      AuditEventType.PRIVILEGE_ESCALATION,
      AuditEventType.SUSPICIOUS_ACTIVITY,
    ];

    if (highRiskTypes.includes(eventData.type)) {
      flags.push("high_risk");
    }

    // Failed authentication
    if (eventData.type === AuditEventType.LOGIN_FAILED) {
      flags.push("auth_failure");
    }

    // Unknown IP address
    if (eventData.client?.ip && this.isUnknownIpAddress(eventData.client?.ip)) {
      flags.push("unknown_ip");
    }

    // Suspicious user agent
    if (
      eventData.client?.userAgent &&
      this.isSuspiciousUserAgent(eventData.client.userAgent)
    ) {
      flags.push("suspicious_agent");
    }

    // Multiple failures
    if (eventData.metadata?.multipleFailures) {
      flags.push("multiple_failures");
    }

    return flags;
  }

  /**
   * Checks if IP address is unknown/suspicious.
   */
  private static isUnknownIpAddress(ip: string): boolean {
    // Simplified check - in production, this would check against known IP ranges
    const localRanges = [
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    ];

    return !localRanges.some((range) => range.test(ip));
  }

  /**
   * Checks if user agent is suspicious.
   */
  private static isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scanner/i,
      /curl/i,
      /wget/i,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
  }

  /**
   * Logs an audit event using provided logger function.
   *
   * @param event - Audit event to log
   * @param logger - Logger function
   * @returns Promise resolving when logged
   * @complexity O(1)
   */
  static async logEvent(
    event: AuditEvent,
    logger: (event: AuditEvent) => Promise<void>
  ): Promise<void> {
    try {
      await logger(event);
    } catch (error) {
      // If primary logging fails, attempt to log to console
      console.error("Audit logging failed:", error);
      console.log("Failed audit event:", JSON.stringify(event, null, 2));
    }
  }

  /**
   * Creates authentication event loggers.
   *
   * @param logger - Base logger function
   * @returns Authentication event loggers
   * @complexity O(1)
   */
  static createAuthEventLoggers(logger: (event: AuditEvent) => Promise<void>) {
    return {
      loginSuccess: (
        userId: string,
        sessionId: string,
        client?: { ip?: string; userAgent?: string }
      ) => {
        const event = this.createEvent({
          type: AuditEventType.LOGIN,
          severity: AuditSeverity.LOW,
          userId,
          sessionId,
          description: "User logged in successfully",
          client,
        });
        return this.logEvent(event, logger);
      },

      loginFailure: (
        userId?: string,
        reason?: string,
        client?: { ip?: string; userAgent?: string }
      ) => {
        const event = this.createEvent({
          type: AuditEventType.LOGIN_FAILED,
          severity: AuditSeverity.MEDIUM,
          status: AuditStatus.FAILURE,
          userId,
          description: `Login failed: ${reason || "Invalid credentials"}`,
          client,
        });
        return this.logEvent(event, logger);
      },

      logout: (userId: string, sessionId: string) => {
        const event = this.createEvent({
          type: AuditEventType.LOGOUT,
          severity: AuditSeverity.LOW,
          userId,
          sessionId,
          description: "User logged out",
        });
        return this.logEvent(event, logger);
      },

      passwordChange: (userId: string, sessionId: string) => {
        const event = this.createEvent({
          type: AuditEventType.PASSWORD_CHANGE,
          severity: AuditSeverity.MEDIUM,
          userId,
          sessionId,
          description: "User changed password",
        });
        return this.logEvent(event, logger);
      },
    };
  }

  /**
   * Creates data access event loggers.
   *
   * @param logger - Base logger function
   * @returns Data access event loggers
   * @complexity O(1)
   */
  static createDataEventLoggers(logger: (event: AuditEvent) => Promise<void>) {
    return {
      create: (
        userId: string,
        resource: { type: string; id?: string; name?: string },
        sessionId?: string,
        tenantId?: string
      ) => {
        const event = this.createEvent({
          type: AuditEventType.CREATE,
          severity: AuditSeverity.LOW,
          userId,
          sessionId,
          tenantId,
          resource,
          description: `Created ${resource.type} ${
            resource.name || resource.id || ""
          }`,
        });
        return this.logEvent(event, logger);
      },

      update: (
        userId: string,
        resource: { type: string; id?: string; name?: string },
        changes?: Record<string, unknown>,
        sessionId?: string,
        tenantId?: string
      ) => {
        const event = this.createEvent({
          type: AuditEventType.UPDATE,
          severity: AuditSeverity.LOW,
          userId,
          sessionId,
          tenantId,
          resource,
          description: `Updated ${resource.type} ${
            resource.name || resource.id || ""
          }`,
          metadata: { changes },
        });
        return this.logEvent(event, logger);
      },

      delete: (
        userId: string,
        resource: { type: string; id?: string; name?: string },
        sessionId?: string,
        tenantId?: string
      ) => {
        const event = this.createEvent({
          type: AuditEventType.DELETE,
          severity: AuditSeverity.MEDIUM,
          userId,
          sessionId,
          tenantId,
          resource,
          description: `Deleted ${resource.type} ${
            resource.name || resource.id || ""
          }`,
        });
        return this.logEvent(event, logger);
      },

      read: (
        userId: string,
        resource: { type: string; id?: string; name?: string },
        sessionId?: string,
        tenantId?: string
      ) => {
        const event = this.createEvent({
          type: AuditEventType.READ,
          severity: AuditSeverity.LOW,
          userId,
          sessionId,
          tenantId,
          resource,
          description: `Accessed ${resource.type} ${
            resource.name || resource.id || ""
          }`,
        });
        return this.logEvent(event, logger);
      },
    };
  }

  /**
   * Filters audit events based on criteria.
   *
   * @param events - Array of audit events
   * @param filter - Filter criteria
   * @returns Filtered array of events
   * @complexity O(n) where n is number of events
   */
  static filterEvents(events: AuditEvent[], filter: AuditFilter): AuditEvent[] {
    return events.filter((event) => {
      // Date range filter
      if (filter.startDate && event.timestamp < filter.startDate) return false;
      if (filter.endDate && event.timestamp > filter.endDate) return false;

      // User filter
      if (filter.userId && event.userId !== filter.userId) return false;

      // Event types filter
      if (filter.eventTypes && !filter.eventTypes.includes(event.type))
        return false;

      // Severity filter
      if (filter.severities && !filter.severities.includes(event.severity))
        return false;

      // Status filter
      if (filter.statuses && !filter.statuses.includes(event.status))
        return false;

      // Tenant filter
      if (filter.tenantId && event.tenantId !== filter.tenantId) return false;

      // Resource filters
      if (filter.resourceType && event.resource?.type !== filter.resourceType)
        return false;
      if (filter.resourceId && event.resource?.id !== filter.resourceId)
        return false;

      // Search text filter
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const searchableText = [
          event.description,
          event.resource?.name,
          event.resource?.type,
          event.action,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(searchLower)) return false;
      }

      // Client IP filter
      if (filter.clientIp && event.client?.ip !== filter.clientIp) return false;

      // Risk score filter
      if (
        filter.minRiskScore &&
        (event.security?.riskScore || 0) < filter.minRiskScore
      )
        return false;

      return true;
    });
  }

  /**
   * Generates audit summary statistics.
   *
   * @param events - Array of audit events
   * @returns Summary statistics
   * @complexity O(n) where n is number of events
   */
  static generateSummary(events: AuditEvent[]): AuditSummary {
    const summary: AuditSummary = {
      totalEvents: events.length,
      eventsByType: {} as Record<AuditEventType, number>,
      eventsBySeverity: {} as Record<AuditSeverity, number>,
      eventsByStatus: {} as Record<AuditStatus, number>,
      uniqueUsers: 0,
      highRiskEvents: 0,
      failedLogins: 0,
      securityViolations: 0,
    };

    // Initialize counters
    Object.values(AuditEventType).forEach((type) => {
      summary.eventsByType[type] = 0;
    });

    Object.values(AuditSeverity).forEach((severity) => {
      summary.eventsBySeverity[severity] = 0;
    });

    Object.values(AuditStatus).forEach((status) => {
      summary.eventsByStatus[status] = 0;
    });

    const uniqueUserIds = new Set<string>();

    // Process events
    for (const event of events) {
      // Count by type
      summary.eventsByType[event.type]++;

      // Count by severity
      summary.eventsBySeverity[event.severity]++;

      // Count by status
      summary.eventsByStatus[event.status]++;

      // Track unique users
      if (event.userId) {
        uniqueUserIds.add(event.userId);
      }

      // Count high-risk events
      if ((event.security?.riskScore || 0) >= 50) {
        summary.highRiskEvents++;
      }

      // Count failed logins
      if (event.type === AuditEventType.LOGIN_FAILED) {
        summary.failedLogins++;
      }

      // Count security violations
      if (event.type === AuditEventType.SECURITY_VIOLATION) {
        summary.securityViolations++;
      }
    }

    summary.uniqueUsers = uniqueUserIds.size;

    return summary;
  }

  /**
   * Detects suspicious activity patterns in audit events.
   *
   * @param events - Array of audit events
   * @param config - Security monitoring configuration
   * @returns Array of detected anomalies
   * @complexity O(n) where n is number of events
   */
  static detectSuspiciousActivity(
    events: AuditEvent[],
    config: SecurityMonitoringConfig = {}
  ): Array<{
    type: string;
    description: string;
    events: AuditEvent[];
    riskScore: number;
  }> {
    const {
      failedLoginThreshold = 5,
      alertThresholds = {
        criticalEvents: 10,
        highRiskScore: 70,
        failedLogins: 10,
      },
    } = config;

    const anomalies: Array<{
      type: string;
      description: string;
      events: AuditEvent[];
      riskScore: number;
    }> = [];

    // Group events by user
    const eventsByUser = new Map<string, AuditEvent[]>();
    const eventsByIp = new Map<string, AuditEvent[]>();

    for (const event of events) {
      if (event.userId) {
        if (!eventsByUser.has(event.userId)) {
          eventsByUser.set(event.userId, []);
        }
        eventsByUser.get(event.userId)!.push(event);
      }

      if (event.client?.ip) {
        if (!eventsByIp.has(event.client.ip)) {
          eventsByIp.set(event.client.ip, []);
        }
        eventsByIp.get(event.client.ip)!.push(event);
      }
    }

    // Check for multiple failed logins per user
    for (const [userId, userEvents] of eventsByUser) {
      const failedLogins = userEvents.filter(
        (e) => e.type === AuditEventType.LOGIN_FAILED
      );
      if (failedLogins.length >= failedLoginThreshold) {
        anomalies.push({
          type: "multiple_failed_logins",
          description: `User ${userId} has ${failedLogins.length} failed login attempts`,
          events: failedLogins,
          riskScore: Math.min(100, failedLogins.length * 10),
        });
      }
    }

    // Check for suspicious IP activity
    for (const [ip, ipEvents] of eventsByIp) {
      const failedLogins = ipEvents.filter(
        (e) => e.type === AuditEventType.LOGIN_FAILED
      );
      if (failedLogins.length >= failedLoginThreshold) {
        anomalies.push({
          type: "suspicious_ip_activity",
          description: `IP ${ip} has ${failedLogins.length} failed login attempts`,
          events: failedLogins,
          riskScore: Math.min(100, failedLogins.length * 15),
        });
      }
    }

    // Check for high-risk events clustering
    const highRiskEvents = events.filter(
      (e) => (e.security?.riskScore || 0) >= alertThresholds.highRiskScore!
    );
    if (highRiskEvents.length >= alertThresholds.criticalEvents!) {
      anomalies.push({
        type: "high_risk_event_cluster",
        description: `${highRiskEvents.length} high-risk events detected`,
        events: highRiskEvents,
        riskScore: 90,
      });
    }

    return anomalies;
  }

  /**
   * Creates an audit event aggregation report.
   *
   * @param events - Array of audit events
   * @param groupBy - Field to group by
   * @returns Aggregated report
   * @complexity O(n) where n is number of events
   */
  static createAggregationReport(
    events: AuditEvent[],
    groupBy: "type" | "severity" | "userId" | "resourceType" | "hour" | "day"
  ): Record<string, { count: number; events: AuditEvent[] }> {
    const report: Record<string, { count: number; events: AuditEvent[] }> = {};

    for (const event of events) {
      let key: string;

      switch (groupBy) {
        case "type":
          key = event.type;
          break;
        case "severity":
          key = event.severity;
          break;
        case "userId":
          key = event.userId || "unknown";
          break;
        case "resourceType":
          key = event.resource?.type || "unknown";
          break;
        case "hour":
          key = event.timestamp.toISOString().substring(0, 13);
          break;
        case "day":
          key = event.timestamp.toISOString().substring(0, 10);
          break;
        default:
          key = "unknown";
      }

      if (!report[key]) {
        report[key] = { count: 0, events: [] };
      }

      report[key].count++;
      report[key].events.push(event);
    }

    return report;
  }

  /**
   * 🧩 PLATINUM ENHANCEMENT: Determines severity level based on event type and context
   *
   * Provides intelligent severity categorization for enterprise-grade monitoring,
   * supporting custom rules, compliance requirements, and alerting thresholds.
   *
   * @example
   * ```typescript
   * const severity = AuditUtils.determineEventSeverity(
   *   AuditEventType.LOGIN_FAILED,
   *   { consecutiveFailures: 5 }
   * );
   * console.log(severity); // AuditSeverity.HIGH
   *
   * // Custom severity rules
   * const customRules = {
   *   [AuditEventType.DELETE]: (context) =>
   *     context.isSystemData ? AuditSeverity.CRITICAL : AuditSeverity.MEDIUM
   * };
   * const severity2 = AuditUtils.determineEventSeverity(
   *   AuditEventType.DELETE,
   *   { isSystemData: true },
   *   customRules
   * );
   * ```
   */
  static determineEventSeverity(
    eventType: AuditEventType,
    context: Record<string, any> = {},
    customRules: Partial<
      Record<AuditEventType, (context: any) => AuditSeverity>
    > = {}
  ): AuditSeverity {
    // Apply custom rule if available
    if (customRules[eventType]) {
      return customRules[eventType](context);
    }

    // Default severity mapping with context awareness
    switch (eventType) {
      // Critical security events
      case AuditEventType.SECURITY_VIOLATION:
      case AuditEventType.SUSPICIOUS_ACTIVITY:
        return AuditSeverity.CRITICAL;

      // High severity events
      case AuditEventType.LOGIN_FAILED:
        // Escalate based on consecutive failures
        const failures = context.consecutiveFailures || 0;
        if (failures >= 5) return AuditSeverity.CRITICAL;
        if (failures >= 3) return AuditSeverity.HIGH;
        return AuditSeverity.MEDIUM;

      case AuditEventType.PERMISSION_DENIED:
        // Escalate if repeated attempts
        const deniedAttempts = context.consecutiveDenials || 0;
        return deniedAttempts >= 3 ? AuditSeverity.HIGH : AuditSeverity.MEDIUM;

      case AuditEventType.DELETE:
        // Critical for system data, high for user data
        return context.isSystemData
          ? AuditSeverity.CRITICAL
          : AuditSeverity.HIGH;

      case AuditEventType.EXPORT:
        // High for sensitive data
        return context.isSensitiveData
          ? AuditSeverity.HIGH
          : AuditSeverity.MEDIUM;

      // Medium severity events
      case AuditEventType.PASSWORD_CHANGE:
      case AuditEventType.PASSWORD_RESET:
      case AuditEventType.ROLE_ASSIGNED:
      case AuditEventType.ROLE_REMOVED:
      case AuditEventType.UPDATE:
      case AuditEventType.CONFIG_CHANGE:
        return AuditSeverity.MEDIUM;

      // Low severity events
      case AuditEventType.LOGIN:
      case AuditEventType.LOGOUT:
      case AuditEventType.READ:
      case AuditEventType.CREATE:
      case AuditEventType.PERMISSION_GRANTED:
        return AuditSeverity.LOW;

      // System events vary by context
      case AuditEventType.SYSTEM_START:
      case AuditEventType.SYSTEM_STOP:
        return context.isUnplanned ? AuditSeverity.HIGH : AuditSeverity.LOW;

      default:
        return AuditSeverity.LOW;
    }
  }

  /**
   * 🧩 PLATINUM ENHANCEMENT: Categorizes events by severity levels with analytics
   *
   * Groups audit events by severity with detailed categorization metrics,
   * supporting compliance reporting and security analytics dashboards.
   *
   * @example
   * ```typescript
   * const events = await getAuditEvents();
   * const categorization = AuditUtils.categorizeEventsBySeverity(events, {
   *   includeMetrics: true,
   *   timeWindow: { hours: 24 }
   * });
   *
   * console.log('Critical events:', categorization.critical.length);
   * console.log('Threat level:', categorization.metrics.threatLevel);
   * console.log('Compliance score:', categorization.metrics.complianceScore);
   * ```
   */
  static categorizeEventsBySeverity(
    events: AuditEvent[],
    options: {
      /** Include detailed metrics */
      includeMetrics?: boolean;
      /** Time window for trend analysis */
      timeWindow?: { hours?: number; days?: number };
      /** Custom severity rules */
      customRules?: Partial<
        Record<AuditEventType, (context: any) => AuditSeverity>
      >;
    } = {}
  ): {
    critical: AuditEvent[];
    high: AuditEvent[];
    medium: AuditEvent[];
    low: AuditEvent[];
    metrics?: {
      threatLevel: "low" | "moderate" | "high" | "critical";
      complianceScore: number; // 0-100
      trendsInTimeWindow: {
        criticalTrend: "increasing" | "stable" | "decreasing";
        totalEventsChange: number; // percentage
      };
      severityDistribution: Record<AuditSeverity, number>;
    };
  } {
    const categorized = {
      critical: [] as AuditEvent[],
      high: [] as AuditEvent[],
      medium: [] as AuditEvent[],
      low: [] as AuditEvent[],
    };

    // Categorize events by determined severity
    for (const event of events) {
      const severity = this.determineEventSeverity(
        event.type,
        event.metadata || {},
        options.customRules
      );

      switch (severity) {
        case AuditSeverity.CRITICAL:
          categorized.critical.push(event);
          break;
        case AuditSeverity.HIGH:
          categorized.high.push(event);
          break;
        case AuditSeverity.MEDIUM:
          categorized.medium.push(event);
          break;
        case AuditSeverity.LOW:
          categorized.low.push(event);
          break;
      }
    }

    // Generate metrics if requested
    let metrics;
    if (options.includeMetrics) {
      const totalEvents = events.length;
      const criticalCount = categorized.critical.length;
      const highCount = categorized.high.length;

      // Determine threat level
      let threatLevel: "low" | "moderate" | "high" | "critical";
      const criticalRatio = criticalCount / totalEvents;
      const highRatio = (criticalCount + highCount) / totalEvents;

      if (criticalRatio > 0.1) threatLevel = "critical";
      else if (criticalRatio > 0.05 || highRatio > 0.3) threatLevel = "high";
      else if (highRatio > 0.1) threatLevel = "moderate";
      else threatLevel = "low";

      // Calculate compliance score (higher is better)
      const complianceScore = Math.max(
        0,
        100 - (criticalCount * 20 + highCount * 5)
      );

      // Analyze trends if time window specified
      const trendsInTimeWindow: {
        criticalTrend: "increasing" | "stable" | "decreasing";
        totalEventsChange: number;
      } = {
        criticalTrend: "stable",
        totalEventsChange: 0,
      };

      if (options.timeWindow) {
        const windowMs =
          (options.timeWindow.hours || 0) * 3600000 +
          (options.timeWindow.days || 0) * 86400000;
        const cutoff = new Date(Date.now() - windowMs);

        const recentEvents = events.filter(
          (e) => new Date(e.timestamp) >= cutoff
        );
        const olderEvents = events.filter(
          (e) => new Date(e.timestamp) < cutoff
        );

        const recentCritical = recentEvents.filter(
          (e) =>
            this.determineEventSeverity(
              e.type,
              e.metadata || {},
              options.customRules
            ) === AuditSeverity.CRITICAL
        ).length;
        const olderCritical = olderEvents.filter(
          (e) =>
            this.determineEventSeverity(
              e.type,
              e.metadata || {},
              options.customRules
            ) === AuditSeverity.CRITICAL
        ).length;

        // Determine trend
        if (recentCritical > olderCritical * 1.5)
          trendsInTimeWindow.criticalTrend = "increasing";
        else if (recentCritical < olderCritical * 0.5)
          trendsInTimeWindow.criticalTrend = "decreasing";

        // Calculate total events change
        trendsInTimeWindow.totalEventsChange =
          olderEvents.length > 0
            ? ((recentEvents.length - olderEvents.length) /
                olderEvents.length) *
              100
            : 0;
      }

      metrics = {
        threatLevel,
        complianceScore,
        trendsInTimeWindow,
        severityDistribution: {
          [AuditSeverity.CRITICAL]: categorized.critical.length,
          [AuditSeverity.HIGH]: categorized.high.length,
          [AuditSeverity.MEDIUM]: categorized.medium.length,
          [AuditSeverity.LOW]: categorized.low.length,
        },
      };
    }

    return { ...categorized, ...(metrics && { metrics }) };
  }

  /**
   * 🧩 PLATINUM ENHANCEMENT: Creates severity-based alerting system
   *
   * Generates intelligent alerts based on severity thresholds, patterns,
   * and enterprise security policies for real-time monitoring.
   *
   * @example
   * ```typescript
   * const alerts = AuditUtils.generateSeverityAlerts(events, {
   *   thresholds: {
   *     critical: 1,    // Alert on any critical event
   *     high: 5,        // Alert when 5+ high severity events
   *     medium: 20      // Alert when 20+ medium severity events
   *   },
   *   timeWindow: { minutes: 15 },
   *   includePatternDetection: true
   * });
   *
   * for (const alert of alerts) {
   *   await sendSecurityAlert(alert);
   * }
   * ```
   */
  static generateSeverityAlerts(
    events: AuditEvent[],
    options: {
      /** Alert thresholds per severity */
      thresholds?: Partial<Record<AuditSeverity, number>>;
      /** Time window for threshold evaluation */
      timeWindow?: { minutes?: number; hours?: number };
      /** Enable pattern detection */
      includePatternDetection?: boolean;
      /** Custom alert rules */
      customAlertRules?: Array<{
        name: string;
        condition: (events: AuditEvent[]) => boolean;
        severity: AuditSeverity;
        message: string;
      }>;
    } = {}
  ): Array<{
    id: string;
    severity: AuditSeverity;
    type: "threshold" | "pattern" | "custom";
    title: string;
    message: string;
    eventCount: number;
    affectedEvents: AuditEvent[];
    timestamp: Date;
    metadata: Record<string, any>;
  }> {
    const alerts: Array<{
      id: string;
      severity: AuditSeverity;
      type: "threshold" | "pattern" | "custom";
      title: string;
      message: string;
      eventCount: number;
      affectedEvents: AuditEvent[];
      timestamp: Date;
      metadata: Record<string, any>;
    }> = [];

    // Filter events by time window
    let relevantEvents = events;
    if (options.timeWindow) {
      const windowMs =
        (options.timeWindow.minutes || 0) * 60000 +
        (options.timeWindow.hours || 0) * 3600000;
      const cutoff = new Date(Date.now() - windowMs);
      relevantEvents = events.filter((e) => new Date(e.timestamp) >= cutoff);
    }

    // Categorize events by severity
    const categorized = this.categorizeEventsBySeverity(relevantEvents);

    // Check threshold alerts
    const defaultThresholds = {
      [AuditSeverity.CRITICAL]: 1,
      [AuditSeverity.HIGH]: 3,
      [AuditSeverity.MEDIUM]: 10,
      [AuditSeverity.LOW]: 100,
    };
    const thresholds = { ...defaultThresholds, ...options.thresholds };

    for (const [severity, threshold] of Object.entries(thresholds)) {
      const severityKey = severity as AuditSeverity;
      const eventsForSeverity = categorized[severityKey] || [];

      if (eventsForSeverity.length >= threshold) {
        alerts.push({
          id: CryptoUtils.generateUuid(),
          severity: severityKey,
          type: "threshold",
          title: `${severityKey.toUpperCase()} Severity Threshold Exceeded`,
          message: `${eventsForSeverity.length} ${severityKey} severity events detected (threshold: ${threshold})`,
          eventCount: eventsForSeverity.length,
          affectedEvents: eventsForSeverity,
          timestamp: new Date(),
          metadata: {
            threshold,
            timeWindow: options.timeWindow,
          },
        });
      }
    }

    // Pattern detection alerts
    if (options.includePatternDetection) {
      // Detect rapid authentication failures
      const failedLogins = relevantEvents.filter(
        (e) => e.type === AuditEventType.LOGIN_FAILED
      );
      if (failedLogins.length >= 3) {
        // Group by user/IP to detect targeted attempts
        const attemptsByTarget = new Map<string, AuditEvent[]>();
        for (const event of failedLogins) {
          const key = `${event.userId || "unknown"}-${
            event.client?.ip || "unknown"
          }`;
          if (!attemptsByTarget.has(key)) attemptsByTarget.set(key, []);
          attemptsByTarget.get(key)!.push(event);
        }

        for (const [target, attempts] of attemptsByTarget) {
          if (attempts.length >= 3) {
            alerts.push({
              id: CryptoUtils.generateUuid(),
              severity: AuditSeverity.HIGH,
              type: "pattern",
              title: "Brute Force Attack Pattern Detected",
              message: `${attempts.length} consecutive login failures detected for target: ${target}`,
              eventCount: attempts.length,
              affectedEvents: attempts,
              timestamp: new Date(),
              metadata: {
                pattern: "brute_force",
                target,
              },
            });
          }
        }
      }

      // Detect privilege escalation patterns
      const roleChanges = relevantEvents.filter(
        (e) =>
          e.type === AuditEventType.ROLE_ASSIGNED ||
          e.type === AuditEventType.PERMISSION_GRANTED
      );
      if (roleChanges.length >= 5) {
        alerts.push({
          id: CryptoUtils.generateUuid(),
          severity: AuditSeverity.MEDIUM,
          type: "pattern",
          title: "Unusual Privilege Activity Detected",
          message: `${roleChanges.length} privilege changes detected in time window`,
          eventCount: roleChanges.length,
          affectedEvents: roleChanges,
          timestamp: new Date(),
          metadata: {
            pattern: "privilege_escalation",
          },
        });
      }
    }

    // Custom alert rules
    if (options.customAlertRules) {
      for (const rule of options.customAlertRules) {
        if (rule.condition(relevantEvents)) {
          alerts.push({
            id: CryptoUtils.generateUuid(),
            severity: rule.severity,
            type: "custom",
            title: rule.name,
            message: rule.message,
            eventCount: relevantEvents.length,
            affectedEvents: relevantEvents,
            timestamp: new Date(),
            metadata: {
              customRule: rule.name,
            },
          });
        }
      }
    }

    // Sort alerts by severity (critical first)
    const severityOrder = {
      [AuditSeverity.CRITICAL]: 4,
      [AuditSeverity.HIGH]: 3,
      [AuditSeverity.MEDIUM]: 2,
      [AuditSeverity.LOW]: 1,
    };

    return alerts.sort(
      (a, b) => severityOrder[b.severity] - severityOrder[a.severity]
    );
  }

  /**
   * Compatibility instance method: log create event
   */
  async logCreate(
    resourceType: string,
    resourceId: string,
    actor: { id: string; type?: string },
    tenantId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const event = AuditUtils.createEvent({
      type: AuditEventType.CREATE,
      severity: AuditSeverity.LOW,
      userId: actor.id,
      tenantId,
      resource: { type: resourceType, id: resourceId },
      description: `Created ${resourceType} ${resourceId}`,
      metadata,
    });
    await AuditUtils.logEvent(event, async () => Promise.resolve());
  }

  /**
   * Compatibility instance method: log update event
   */
  async logUpdate(
    resourceType: string,
    resourceId: string,
    changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>,
    actor: { id: string; type?: string },
    tenantId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const event = AuditUtils.createEvent({
      type: AuditEventType.UPDATE,
      severity: AuditSeverity.LOW,
      userId: actor.id,
      tenantId,
      resource: { type: resourceType, id: resourceId },
      description: `Updated ${resourceType} ${resourceId}`,
      metadata: { changes, ...(metadata || {}) },
    });
    await AuditUtils.logEvent(event, async () => Promise.resolve());
  }

  /**
   * Compatibility instance method: log delete event
   */
  async logDelete(
    resourceType: string,
    resourceId: string,
    actor: { id: string; type?: string },
    tenantId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const event = AuditUtils.createEvent({
      type: AuditEventType.DELETE,
      severity: AuditSeverity.MEDIUM,
      userId: actor.id,
      tenantId,
      resource: { type: resourceType, id: resourceId },
      description: `Deleted ${resourceType} ${resourceId}`,
      metadata,
    });
    await AuditUtils.logEvent(event, async () => Promise.resolve());
  }
}
