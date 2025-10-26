/**
 * Workflow Approval Flow Types
 *
 * Defines RBAC-integrated approval workflows with role-based routing rules.
 * These types support enterprise-grade approval processes with multi-level
 * approval chains, delegation, and comprehensive audit trails.
 *
 * @description Approval workflow management with RBAC integration
 * @aligned_with Prisma tables: ApprovalRule, ApprovalRequest, ApprovalDecision
 * @aligned_with Prisma enums: ApprovalDecisionStatus, ApprovalRequestStatus, ApprovalRuleScope, ApprovalRuleType, ApprovalEntityType
 */

import type {
  ApprovalDecisionStatus,
  ApprovalDecisionType,
  ApprovalEntityType,
  ApprovalRequestPriority,
  ApprovalRequestSource,
  ApprovalRequestStatus,
  ApprovalRuleScope,
  ApprovalRuleStatus,
  ApprovalRuleType,
  ApprovalStatus,
} from "@prisma/client";

/**
 * Base interface for approval-aware entities
 */
export interface ApprovalTrackingBase {
  /** Whether entity requires approval */
  requiresApproval: boolean;
  /** Current approval status */
  approvalStatus?: ApprovalStatus;
  /** Timestamp when approved */
  approvedAt?: Date;
  /** Actor who approved */
  approvedById?: string;
  /** Approval signature event ID */
  approvalSignatureEventId?: string;
}

/**
 * Approval rule definition aligned with ApprovalRule table
 */
export interface ApprovalRuleDefinition {
  /** Rule ID */
  id: string;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Rule type from ApprovalRuleType enum */
  ruleType: ApprovalRuleType;
  /** Rule scope from ApprovalRuleScope enum */
  scope: ApprovalRuleScope;
  /** Rule status from ApprovalRuleStatus enum */
  status: ApprovalRuleStatus;
  /** Entity type this rule applies to */
  entityType: ApprovalEntityType;
  /** Conditions that trigger this rule */
  conditions: ApprovalCondition[];
  /** Approval steps in order */
  approvalSteps: ApprovalStep[];
  /** Rule priority (lower number = higher priority) */
  priority: number;
  /** Whether rule is active */
  isActive: boolean;
}

/**
 * Condition that triggers approval requirement
 */
export interface ApprovalCondition {
  /** Condition ID */
  id: string;
  /** Field path to evaluate */
  fieldPath: string;
  /** Comparison operator */
  operator:
    | "EQUALS"
    | "NOT_EQUALS"
    | "GREATER_THAN"
    | "LESS_THAN"
    | "CONTAINS"
    | "IN"
    | "NOT_IN";
  /** Value to compare against */
  value: unknown;
  /** Logical operator with next condition */
  logicalOperator?: "AND" | "OR";
}

/**
 * Individual step in approval workflow
 */
export interface ApprovalStep {
  /** Step ID */
  id: string;
  /** Step order (1-based) */
  stepOrder: number;
  /** Step name */
  name: string;
  /** Step description */
  description?: string;
  /** Required approvers (roles or specific members) */
  requiredApprovers: ApprovalApprover[];
  /** Minimum number of approvals required */
  minimumApprovals: number;
  /** Whether all approvers must approve */
  requiresUnanimous: boolean;
  /** Whether step can be delegated */
  allowsDelegation: boolean;
  /** Auto-approval conditions */
  autoApprovalConditions?: ApprovalCondition[];
  /** Step timeout in hours */
  timeoutHours?: number;
}

/**
 * Approver definition (role-based or member-specific)
 */
export interface ApprovalApprover {
  /** Approver ID */
  id: string;
  /** Approver type */
  approverType: "ROLE" | "MEMBER" | "MEMBER_GROUP" | "DYNAMIC_ROLE";
  /** Role ID (if role-based) */
  roleId?: string;
  /** Member ID (if member-specific) */
  memberId?: string;
  /** Member group ID (if group-based) */
  memberGroupId?: string;
  /** Dynamic role expression (if dynamic) */
  dynamicRoleExpression?: string;
  /** Whether this approver is required */
  isRequired: boolean;
  /** Order within step */
  approverOrder: number;
}

/**
 * Approval request aligned with ApprovalRequest table
 */
export interface ApprovalRequestInfo {
  /** Request ID */
  id: string;
  /** Tenant ID */
  tenantId: string;
  /** Entity being approved */
  entityId: string;
  /** Entity type from ApprovalEntityType enum */
  entityType: ApprovalEntityType;
  /** Request status from ApprovalRequestStatus enum */
  status: ApprovalRequestStatus;
  /** Request priority from ApprovalRequestPriority enum */
  priority: ApprovalRequestPriority;
  /** Request source from ApprovalRequestSource enum */
  source: ApprovalRequestSource;
  /** Member who requested approval */
  requestedByMemberId: string;
  /** When request was created */
  requestedAt: Date;
  /** Request title */
  title: string;
  /** Request description */
  description?: string;
  /** Approval rule used */
  approvalRuleId: string;
  /** Current step in workflow */
  currentStepId?: string;
  /** Due date for approval */
  dueDate?: Date;
  /** Completed date */
  completedAt?: Date;
  /** Request metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Approval decision aligned with ApprovalDecision table
 */
export interface ApprovalDecisionInfo {
  /** Decision ID */
  id: string;
  /** Tenant ID */
  tenantId: string;
  /** Approval request ID */
  approvalRequestId: string;
  /** Step ID this decision applies to */
  stepId: string;
  /** Decision status from ApprovalDecisionStatus enum */
  status: ApprovalDecisionStatus;
  /** Decision type from ApprovalDecisionType enum */
  decisionType: ApprovalDecisionType;
  /** Member who made decision */
  decidedByMemberId: string;
  /** Decision timestamp */
  decidedAt: Date;
  /** Decision comments */
  comments?: string;
  /** Decision reasoning */
  reasoning?: string;
  /** Signature event ID */
  signatureEventId?: string;
  /** Whether decision was delegated */
  isDelegated: boolean;
  /** Original approver (if delegated) */
  delegatedFromMemberId?: string;
}

/**
 * Approval workflow instance
 */
export interface ApprovalWorkflowInstance {
  /** Instance ID */
  id: string;
  /** Approval request */
  request: ApprovalRequestInfo;
  /** Workflow definition used */
  workflowDefinition: ApprovalRuleDefinition;
  /** Current state */
  currentState: ApprovalWorkflowState;
  /** Step instances */
  stepInstances: ApprovalStepInstance[];
  /** Workflow history */
  history: ApprovalWorkflowEvent[];
}

/**
 * Current state of approval workflow
 */
export interface ApprovalWorkflowState {
  /** Current step index */
  currentStepIndex: number;
  /** Overall status */
  status:
    | "PENDING"
    | "IN_PROGRESS"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED"
    | "EXPIRED";
  /** Progress percentage */
  progressPercent: number;
  /** Pending approvers */
  pendingApprovers: string[];
  /** Next action required */
  nextAction?: string;
  /** Time remaining (if timeout set) */
  timeRemaining?: number;
}

/**
 * Step instance in workflow execution
 */
export interface ApprovalStepInstance {
  /** Instance ID */
  id: string;
  /** Step definition */
  stepDefinition: ApprovalStep;
  /** Step status */
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "FAILED";
  /** Started timestamp */
  startedAt?: Date;
  /** Completed timestamp */
  completedAt?: Date;
  /** Decisions made for this step */
  decisions: ApprovalDecisionInfo[];
  /** Current approvers */
  currentApprovers: string[];
  /** Required approvals remaining */
  approvalsRemaining: number;
}

/**
 * Workflow event for audit trail
 */
export interface ApprovalWorkflowEvent {
  /** Event ID */
  id: string;
  /** Event type */
  eventType:
    | "STARTED"
    | "STEP_ENTERED"
    | "DECISION_MADE"
    | "DELEGATED"
    | "ESCALATED"
    | "COMPLETED"
    | "CANCELLED";
  /** Event timestamp */
  timestamp: Date;
  /** Actor who triggered event */
  actorId: string;
  /** Step involved (if applicable) */
  stepId?: string;
  /** Event description */
  description: string;
  /** Event metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Approval delegation request
 */
export interface ApprovalDelegationRequest {
  /** Original approver */
  fromMemberId: string;
  /** Delegate approver */
  toMemberId: string;
  /** Approval request ID */
  approvalRequestId: string;
  /** Step ID */
  stepId: string;
  /** Delegation reason */
  reason: string;
  /** Delegation expiry */
  expiresAt?: Date;
  /** Whether delegation is temporary */
  isTemporary: boolean;
}

/**
 * Approval escalation configuration
 */
export interface ApprovalEscalation {
  /** Escalation ID */
  id: string;
  /** Step this applies to */
  stepId: string;
  /** Escalation trigger conditions */
  triggerConditions: {
    /** Timeout in hours */
    timeoutHours?: number;
    /** Inactivity period */
    inactivityHours?: number;
    /** Custom conditions */
    customConditions?: ApprovalCondition[];
  };
  /** Escalation actions */
  actions: {
    /** Notify these members */
    notifyMembers?: string[];
    /** Auto-approve */
    autoApprove?: boolean;
    /** Reassign to these members */
    reassignToMembers?: string[];
    /** Skip step */
    skipStep?: boolean;
  };
}

/**
 * Approval analytics and metrics
 */
export interface ApprovalMetrics {
  /** Time period */
  periodStart: Date;
  periodEnd: Date;
  /** Entity type */
  entityType?: ApprovalEntityType;
  /** Total requests */
  totalRequests: number;
  /** Requests by status */
  requestsByStatus: Record<string, number>;
  /** Average approval time */
  averageApprovalTime: number;
  /** Approval rate */
  approvalRate: number;
  /** Bottleneck analysis */
  bottlenecks: Array<{
    stepId: string;
    averageTime: number;
    requestCount: number;
  }>;
  /** Top approvers */
  topApprovers: Array<{
    memberId: string;
    approvalCount: number;
    averageResponseTime: number;
  }>;
}

/**
 * Bulk approval operation
 */
export interface BulkApprovalOperation {
  /** Request IDs to approve/reject */
  requestIds: string[];
  /** Decision type */
  decision: "APPROVE" | "REJECT";
  /** Actor performing bulk operation */
  actorId: string;
  /** Bulk operation reason */
  reason: string;
  /** Whether to skip individual validations */
  skipValidations?: boolean;
}

/**
 * Approval notification configuration
 */
export interface ApprovalNotificationConfig {
  /** When to send notifications */
  triggers: Array<
    | "REQUEST_CREATED"
    | "APPROVAL_NEEDED"
    | "DECISION_MADE"
    | "ESCALATION"
    | "COMPLETION"
  >;
  /** Notification channels */
  channels: Array<"EMAIL" | "SMS" | "IN_APP" | "WEBHOOK">;
  /** Recipient rules */
  recipients: {
    /** Include requestor */
    includeRequestor?: boolean;
    /** Include current approvers */
    includeCurrentApprovers?: boolean;
    /** Include all stakeholders */
    includeStakeholders?: boolean;
    /** Additional member IDs */
    additionalMembers?: string[];
  };
  /** Notification template */
  template?: string;
}
