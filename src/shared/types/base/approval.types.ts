/**
 * Approval Types - Workflow approval and decision management
 *
 * Depends on Prisma Tables: ApprovalRequest, ApprovalDecision, ApprovalWorkflow, ApprovalRule
 * Depends on Prisma Enums: ApprovalRequestStatus, ApprovalDecisionStatus, ApprovalDecisionType, ApprovalEntityType
 *
 * Purpose: Approval workflows, decision tracking, and business process approvals across all modules
 */

import type {
  ApprovalRequestStatus,
  ApprovalDecisionStatus,
  ApprovalDecisionType,
  ApprovalEntityType,
} from "@prisma/client";

/**
 * Base approval request information
 * Maps to Prisma ApprovalRequest table core fields
 */
export interface ApprovalRequestBase {
  /** Approval request identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Entity type being approved */
  entityType: ApprovalEntityType;
  /** Entity identifier being approved */
  entityId: string;
  /** Request status */
  status: ApprovalRequestStatus;
  /** Member who submitted the request */
  submittedById: string;
  /** Submission timestamp */
  submittedAt: Date;
  /** Request title/summary */
  title: string;
  /** Request description */
  description?: string;
  /** Request priority level */
  priority: number;
  /** Amount being approved (if applicable) */
  amount?: number;
  /** Currency code */
  currency?: string;
  /** Current approver ID */
  currentApproverId?: string;
  /** Required approval level */
  requiredLevel: number;
  /** Current approval level reached */
  currentLevel: number;
  /** Due date for approval */
  dueDate?: Date;
  /** Final decision timestamp */
  finalDecisionAt?: Date;
  /** Final decision by member ID */
  finalDecisionById?: string;
  /** Request metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Approval decision information
 * Maps to Prisma ApprovalDecision table
 */
export interface ApprovalDecisionBase {
  /** Decision identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Approval request ID */
  requestId: string;
  /** Approver member ID */
  approverId: string;
  /** Decision type */
  decisionType: ApprovalDecisionType;
  /** Decision status */
  status: ApprovalDecisionStatus;
  /** Decision timestamp */
  decidedAt: Date;
  /** Decision comments */
  comments?: string;
  /** Approval level this decision represents */
  approvalLevel: number;
  /** Whether this was delegated */
  isDelegated: boolean;
  /** Original approver (if delegated) */
  delegatedFromId?: string;
  /** Decision metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Approval workflow configuration
 * Defines how approvals should be processed
 */
export interface ApprovalWorkflowBase {
  /** Workflow identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Workflow name */
  name: string;
  /** Entity type this workflow applies to */
  entityType: ApprovalEntityType;
  /** Workflow description */
  description?: string;
  /** Approval levels/steps */
  levels: ApprovalLevel[];
  /** Whether workflow is active */
  isActive: boolean;
  /** Workflow conditions */
  conditions?: ApprovalCondition[];
  /** Default due date (days) */
  defaultDueDays?: number;
  /** Escalation rules */
  escalationRules?: EscalationRule[];
}

/**
 * Approval level configuration
 * Defines a single level in an approval workflow
 */
export interface ApprovalLevel {
  /** Level number (1, 2, 3, etc.) */
  level: number;
  /** Level name/title */
  name: string;
  /** Required approvers for this level */
  requiredApprovers: string[];
  /** Number of approvers required */
  requiredCount: number;
  /** Whether all approvers must approve */
  requiresAll: boolean;
  /** Approval criteria */
  criteria?: ApprovalCriteria;
  /** Level timeout (hours) */
  timeoutHours?: number;
  /** Auto-approval conditions */
  autoApprovalConditions?: Record<string, unknown>;
}

/**
 * Approval criteria
 * Defines criteria that must be met for approval
 */
export interface ApprovalCriteria {
  /** Minimum amount threshold */
  minAmount?: number;
  /** Maximum amount threshold */
  maxAmount?: number;
  /** Required approval reason */
  requiresReason?: boolean;
  /** Minimum approver level */
  minApproverLevel?: string;
  /** Excluded approvers */
  excludedApprovers?: string[];
  /** Required supporting documents */
  requiredDocuments?: string[];
}

/**
 * Approval condition
 * Conditions that determine if workflow applies
 */
export interface ApprovalCondition {
  /** Condition field */
  field: string;
  /** Condition operator (EQUALS, GREATER_THAN, etc.) */
  operator: string;
  /** Condition value */
  value: unknown;
  /** Logical connector (AND, OR) */
  connector?: string;
}

/**
 * Escalation rule
 * Defines how to escalate overdue approvals
 */
export interface EscalationRule {
  /** Trigger delay (hours) */
  triggerAfterHours: number;
  /** Escalation target (approver ID) */
  escalateTo: string;
  /** Whether to notify original approver */
  notifyOriginal: boolean;
  /** Escalation message template */
  messageTemplate?: string;
}

/**
 * Approval context for operations
 * Context information for approval processes
 */
export interface ApprovalContext {
  /** Associated tenant ID */
  tenantId: string;
  /** Current member making request */
  requestorId: string;
  /** Entity being approved */
  entityType: ApprovalEntityType;
  /** Entity identifier */
  entityId: string;
  /** Request amount (if applicable) */
  amount?: number;
  /** Currency code */
  currency?: string;
  /** Business context */
  businessContext?: Record<string, unknown>;
  /** Urgency level */
  urgency?: string;
}

/**
 * Approval routing result
 * Result of determining approval workflow
 */
export interface ApprovalRoutingResult {
  /** Workflow to use */
  workflow: ApprovalWorkflowBase;
  /** Initial approvers */
  initialApprovers: string[];
  /** Required approval levels */
  requiredLevels: number;
  /** Estimated completion time */
  estimatedDays?: number;
  /** Auto-approval eligible */
  autoApprovalEligible: boolean;
  /** Routing reason */
  reason?: string;
}

/**
 * Approval notification
 * Information for approval notifications
 */
export interface ApprovalNotification {
  /** Notification type */
  type: string;
  /** Recipient member ID */
  recipientId: string;
  /** Approval request ID */
  requestId: string;
  /** Subject line */
  subject: string;
  /** Message content */
  message: string;
  /** Due date */
  dueDate?: Date;
  /** Priority level */
  priority: string;
  /** Notification channels */
  channels: string[];
}

/**
 * Approval metrics
 * Metrics for approval process monitoring
 */
export interface ApprovalMetrics {
  /** Associated tenant ID */
  tenantId: string;
  /** Time period start */
  periodStart: Date;
  /** Time period end */
  periodEnd: Date;
  /** Total requests processed */
  totalRequests: number;
  /** Approved requests count */
  approvedCount: number;
  /** Rejected requests count */
  rejectedCount: number;
  /** Pending requests count */
  pendingCount: number;
  /** Average approval time (hours) */
  avgApprovalTime: number;
  /** Overdue requests count */
  overdueCount: number;
  /** Auto-approved count */
  autoApprovedCount: number;
  /** Escalated requests count */
  escalatedCount: number;
}
