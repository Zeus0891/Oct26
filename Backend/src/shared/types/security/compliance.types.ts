/**
 * Compliance Types - Privacy/compliance types with audit correlation
 *
 * Depends on Prisma Tables: DataAccessRequest, DataErasureRequest, LegalHold, AuditRule
 * Depends on Prisma Enums: ComplianceEventType, DataClassification, RetentionPolicyStatus
 *
 * Purpose: Privacy/compliance types with audit correlation for RBAC permission usage tracking
 */

/**
 * Compliance event type enumeration
 * Types of compliance events that can occur
 */
export type ComplianceEventType =
  | "DATA_ACCESS"
  | "DATA_MODIFICATION"
  | "DATA_DELETION"
  | "CONSENT_GRANTED"
  | "CONSENT_WITHDRAWN"
  | "BREACH_DETECTED"
  | "AUDIT_PERFORMED"
  | "POLICY_VIOLATION";

/**
 * Data classification levels
 * Classification of data sensitivity
 */
export type DataClassificationLevel =
  | "PUBLIC"
  | "INTERNAL"
  | "CONFIDENTIAL"
  | "RESTRICTED"
  | "SECRET";

/**
 * Retention policy status enumeration
 * Status of data retention policies
 */
export type RetentionPolicyStatusType =
  | "ACTIVE"
  | "SUSPENDED"
  | "EXPIRED"
  | "ARCHIVED"
  | "DELETED";

/**
 * Data access request
 * Maps to Prisma DataAccessRequest table
 */
export interface DataAccessRequestBase {
  /** Request identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Data subject identifier */
  dataSubjectId: string;
  /** Request type */
  requestType:
    | "ACCESS"
    | "PORTABILITY"
    | "RECTIFICATION"
    | "ERASURE"
    | "RESTRICTION";
  /** Request status */
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "CANCELLED";
  /** Requested by member ID */
  requestedById: string;
  /** Request timestamp */
  requestedAt: Date;
  /** Request description */
  description?: string;
  /** Data categories requested */
  dataCategories: string[];
  /** Processing purpose */
  purpose?: string;
  /** Legal basis for processing */
  legalBasis?: string;
  /** Request deadline */
  deadline?: Date;
  /** Response provided at */
  respondedAt?: Date;
  /** Response provided by */
  respondedById?: string;
  /** Response details */
  responseDetails?: string;
  /** Request metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Data erasure request
 * Maps to Prisma DataErasureRequest table
 */
export interface DataErasureRequestBase {
  /** Request identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Data subject identifier */
  dataSubjectId: string;
  /** Erasure reason */
  reason:
    | "CONSENT_WITHDRAWN"
    | "PURPOSE_FULFILLED"
    | "UNLAWFUL_PROCESSING"
    | "RIGHT_TO_ERASURE"
    | "OTHER";
  /** Request status */
  status:
    | "PENDING"
    | "APPROVED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "REJECTED"
    | "CANCELLED";
  /** Requested by member ID */
  requestedById: string;
  /** Request timestamp */
  requestedAt: Date;
  /** Data categories to erase */
  dataCategories: string[];
  /** Specific data items */
  dataItems?: string[];
  /** Approval required */
  requiresApproval: boolean;
  /** Approved by member ID */
  approvedById?: string;
  /** Approval timestamp */
  approvedAt?: Date;
  /** Erasure executed at */
  executedAt?: Date;
  /** Erasure executed by */
  executedById?: string;
  /** Verification status */
  verificationStatus?: "PENDING" | "VERIFIED" | "FAILED";
  /** Request metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Legal hold definition
 * Maps to Prisma LegalHold table
 */
export interface LegalHoldBase {
  /** Hold identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Hold name */
  name: string;
  /** Hold description */
  description?: string;
  /** Hold type */
  type: "LITIGATION" | "INVESTIGATION" | "AUDIT" | "REGULATORY" | "OTHER";
  /** Hold status */
  status: "ACTIVE" | "RELEASED" | "EXPIRED" | "CANCELLED";
  /** Hold custodian */
  custodianId: string;
  /** Hold start date */
  startDate: Date;
  /** Hold end date */
  endDate?: Date;
  /** Data scope covered */
  dataScope: string[];
  /** Affected systems */
  affectedSystems: string[];
  /** Hold instructions */
  instructions?: string;
  /** Release authorization required */
  releaseAuthorizationRequired: boolean;
  /** Released by member ID */
  releasedById?: string;
  /** Release timestamp */
  releasedAt?: Date;
  /** Hold metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Audit rule definition
 * Maps to Prisma AuditRule table
 */
export interface AuditRuleBase {
  /** Rule identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Rule type */
  type:
    | "ACCESS_CONTROL"
    | "DATA_MODIFICATION"
    | "SYSTEM_EVENT"
    | "COMPLIANCE_EVENT"
    | "SECURITY_EVENT";
  /** Rule status */
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  /** Target entities */
  targetEntities: string[];
  /** Monitored actions */
  monitoredActions: string[];
  /** Rule conditions */
  conditions?: AuditRuleCondition[];
  /** Alert thresholds */
  alertThresholds?: AuditAlertThreshold[];
  /** Notification recipients */
  notificationRecipients: string[];
  /** Rule metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Audit rule condition
 * Condition for audit rule triggering
 */
export interface AuditRuleCondition {
  /** Condition field */
  field: string;
  /** Condition operator */
  operator:
    | "EQUALS"
    | "NOT_EQUALS"
    | "CONTAINS"
    | "GREATER_THAN"
    | "LESS_THAN"
    | "IN"
    | "NOT_IN";
  /** Condition value */
  value: unknown;
  /** Logical connector */
  connector?: "AND" | "OR";
}

/**
 * Audit alert threshold
 * Threshold for generating audit alerts
 */
export interface AuditAlertThreshold {
  /** Threshold name */
  name: string;
  /** Threshold metric */
  metric: string;
  /** Threshold value */
  value: number;
  /** Threshold operator */
  operator: "GREATER_THAN" | "LESS_THAN" | "EQUALS";
  /** Time window (minutes) */
  timeWindow: number;
  /** Alert severity */
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

/**
 * Compliance event
 * Event for compliance tracking and reporting
 */
export interface ComplianceEvent {
  /** Event identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Event type */
  eventType: ComplianceEventType;
  /** Event timestamp */
  timestamp: Date;
  /** Actor who triggered the event */
  actorId?: string;
  /** Data subject affected */
  dataSubjectId?: string;
  /** Affected entity type */
  entityType?: string;
  /** Affected entity ID */
  entityId?: string;
  /** Event description */
  description: string;
  /** Data classification */
  dataClassification?: DataClassificationLevel;
  /** Legal basis */
  legalBasis?: string;
  /** Processing purpose */
  purpose?: string;
  /** Event severity */
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** Event metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Data subject information
 * Information about data subjects for compliance
 */
export interface DataSubject {
  /** Data subject identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Subject type */
  subjectType: "CUSTOMER" | "EMPLOYEE" | "CONTRACTOR" | "VENDOR" | "OTHER";
  /** Subject identifier (email, employee ID, etc.) */
  subjectIdentifier: string;
  /** Subject name */
  name?: string;
  /** Consent records */
  consents: ConsentRecord[];
  /** Data categories */
  dataCategories: string[];
  /** Retention periods */
  retentionPeriods: RetentionPeriod[];
  /** Active legal holds */
  activeLegalHolds: string[];
  /** Subject metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Consent record
 * Record of consent given by data subject
 */
export interface ConsentRecord {
  /** Consent identifier */
  id: string;
  /** Consent type */
  consentType: string;
  /** Consent status */
  status: "GIVEN" | "WITHDRAWN" | "EXPIRED" | "PENDING";
  /** Consent given at */
  givenAt?: Date;
  /** Consent withdrawn at */
  withdrawnAt?: Date;
  /** Consent expiry date */
  expiryDate?: Date;
  /** Processing purposes */
  purposes: string[];
  /** Data categories */
  dataCategories: string[];
  /** Consent version */
  version: string;
  /** Legal basis */
  legalBasis?: string;
  /** Consent metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Retention period definition
 * Defines how long data should be retained
 */
export interface RetentionPeriod {
  /** Data category */
  dataCategory: string;
  /** Retention period (days) */
  retentionDays: number;
  /** Retention basis */
  retentionBasis:
    | "LEGAL_REQUIREMENT"
    | "BUSINESS_PURPOSE"
    | "CONSENT"
    | "CONTRACT"
    | "OTHER";
  /** Retention status */
  status: RetentionPolicyStatusType;
  /** Period start date */
  startDate: Date;
  /** Period end date */
  endDate?: Date;
  /** Disposal method */
  disposalMethod?: "DELETE" | "ANONYMIZE" | "ARCHIVE" | "SECURE_DELETE";
}

/**
 * Compliance report
 * Report for compliance monitoring and auditing
 */
export interface ComplianceReport {
  /** Report identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Report type */
  reportType:
    | "DATA_INVENTORY"
    | "ACCESS_LOG"
    | "BREACH_REPORT"
    | "CONSENT_REPORT"
    | "RETENTION_REPORT";
  /** Report period start */
  periodStart: Date;
  /** Report period end */
  periodEnd: Date;
  /** Report data */
  reportData: Record<string, unknown>;
  /** Report summary */
  summary: ComplianceReportSummary;
  /** Generated by member ID */
  generatedById: string;
  /** Report generation timestamp */
  generatedAt: Date;
  /** Report metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Compliance report summary
 * Summary information for compliance reports
 */
export interface ComplianceReportSummary {
  /** Total events */
  totalEvents: number;
  /** Events by type */
  eventsByType: Record<string, number>;
  /** Events by severity */
  eventsBySeverity: Record<string, number>;
  /** Data subjects affected */
  dataSubjectsAffected: number;
  /** Active consents */
  activeConsents: number;
  /** Expired consents */
  expiredConsents: number;
  /** Active legal holds */
  activeLegalHolds: number;
  /** Violations detected */
  violationsDetected: number;
  /** Compliance score */
  complianceScore?: number;
}
