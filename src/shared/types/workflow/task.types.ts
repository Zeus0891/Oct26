/**
 * Workflow Task Types
 *
 * Defines task management with member-based assignments and scope filtering.
 * These types support comprehensive task lifecycle management with RBAC integration,
 * dependency tracking, and progress monitoring.
 *
 * @description Task and assignment management for workflow coordination
 * @aligned_with Prisma tables: Task, TaskAssignment, TaskChecklistItem, TaskDependency
 * @aligned_with Prisma enums: WorkItemStatus, TaskPriority, TaskType, ImpactLevel
 */

import type {
  WorkItemStatus,
  TaskPriority,
  TaskType,
  ImpactLevel,
  RetentionPolicy,
} from "@prisma/client";

/**
 * Base task information aligned with Task table
 */
export interface TaskInfo {
  /** Task ID */
  id: string;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Task status from WorkItemStatus enum */
  status: WorkItemStatus;
  /** Task version for optimistic locking */
  version: number;
  /** Task title */
  title: string;
  /** Task description */
  description?: string;
  /** Task type from TaskType enum */
  taskType: TaskType;
  /** Task priority from TaskPriority enum */
  priority: TaskPriority;
  /** Business impact level */
  businessImpact: ImpactLevel;
  /** Due date */
  dueDate?: Date;
  /** Start date */
  startDate?: Date;
  /** Completion timestamp */
  completedAt?: Date;
  /** Estimated hours */
  estimatedHours?: number;
  /** Actual hours worked */
  actualHours?: number;
  /** Whether approval is required */
  approvalRequired: boolean;
  /** Approval timestamp */
  approvedAt?: Date;
  /** Member who approved */
  approvedById?: string;
  /** Associated project */
  projectId?: string;
  /** Associated schedule */
  scheduleId?: string;
  /** Data classification */
  dataClassification: string;
  /** Data retention policy */
  retentionPolicy?: RetentionPolicy;
}

/**
 * Task assignment aligned with TaskAssignment table
 */
export interface TaskAssignmentInfo {
  /** Assignment ID */
  id: string;
  /** Tenant ID */
  tenantId: string;
  /** Task ID */
  taskId: string;
  /** Assigned member ID */
  memberId: string;
  /** Assignment role */
  assignmentRole: string;
  /** Assignment status */
  status: WorkItemStatus;
  /** Assignment date */
  assignedAt: Date;
  /** Assignment start date */
  startedAt?: Date;
  /** Assignment completion date */
  completedAt?: Date;
  /** Hours allocated */
  allocatedHours?: number;
  /** Hours worked */
  workedHours?: number;
  /** Assignment notes */
  notes?: string;
  /** Who assigned the task */
  assignedByMemberId?: string;
}

/**
 * Task checklist item aligned with TaskChecklistItem table
 */
export interface TaskChecklistItemInfo {
  /** Checklist item ID */
  id: string;
  /** Tenant ID */
  tenantId: string;
  /** Task ID */
  taskId: string;
  /** Item title */
  title: string;
  /** Item description */
  description?: string;
  /** Item order */
  itemOrder: number;
  /** Whether item is completed */
  isCompleted: boolean;
  /** Completion timestamp */
  completedAt?: Date;
  /** Member who completed */
  completedByMemberId?: string;
  /** Whether item is required */
  isRequired: boolean;
  /** Item status */
  status: WorkItemStatus;
}

/**
 * Task dependency aligned with TaskDependency table
 */
export interface TaskDependencyInfo {
  /** Dependency ID */
  id: string;
  /** Tenant ID */
  tenantId: string;
  /** Predecessor task ID */
  predecessorId: string;
  /** Successor task ID */
  successorId: string;
  /** Dependency type */
  dependencyType:
    | "FINISH_TO_START"
    | "START_TO_START"
    | "FINISH_TO_FINISH"
    | "START_TO_FINISH";
  /** Lag time in hours */
  lagHours?: number;
  /** Lead time in hours */
  leadHours?: number;
  /** Whether dependency is critical */
  isCritical: boolean;
  /** Dependency notes */
  notes?: string;
}

/**
 * Extended task with all related information
 */
export interface TaskWithDetails extends TaskInfo {
  /** Task assignments */
  assignments: TaskAssignmentInfo[];
  /** Checklist items */
  checklistItems: TaskChecklistItemInfo[];
  /** Dependencies where this task is predecessor */
  successorDependencies: TaskDependencyInfo[];
  /** Dependencies where this task is successor */
  predecessorDependencies: TaskDependencyInfo[];
  /** Completion percentage */
  completionPercentage: number;
  /** Whether task is overdue */
  isOverdue: boolean;
  /** Whether task is blocked */
  isBlocked: boolean;
  /** Blocking reasons */
  blockingReasons?: string[];
}

/**
 * Task creation request
 */
export interface CreateTaskRequest {
  /** Task title */
  title: string;
  /** Task description */
  description?: string;
  /** Task type */
  taskType: TaskType;
  /** Task priority */
  priority: TaskPriority;
  /** Business impact */
  businessImpact?: ImpactLevel;
  /** Due date */
  dueDate?: Date;
  /** Start date */
  startDate?: Date;
  /** Estimated hours */
  estimatedHours?: number;
  /** Whether approval is required */
  approvalRequired?: boolean;
  /** Associated project */
  projectId?: string;
  /** Associated schedule */
  scheduleId?: string;
  /** Initial assignments */
  assignments?: Array<{
    memberId: string;
    assignmentRole: string;
    allocatedHours?: number;
  }>;
  /** Initial checklist items */
  checklistItems?: Array<{
    title: string;
    description?: string;
    isRequired?: boolean;
  }>;
  /** Dependencies */
  dependencies?: Array<{
    predecessorId: string;
    dependencyType: string;
    lagHours?: number;
  }>;
}

/**
 * Task update request
 */
export interface UpdateTaskRequest {
  /** Task ID */
  taskId: string;
  /** Fields to update */
  updates: Partial<TaskInfo>;
  /** Actor making update */
  actorId: string;
  /** Update reason */
  reason?: string;
}

/**
 * Task assignment request
 */
export interface AssignTaskRequest {
  /** Task ID */
  taskId: string;
  /** Member to assign */
  memberId: string;
  /** Assignment role */
  assignmentRole: string;
  /** Hours to allocate */
  allocatedHours?: number;
  /** Assignment notes */
  notes?: string;
  /** Actor making assignment */
  assignedByActorId: string;
}

/**
 * Task progress tracking
 */
export interface TaskProgress {
  /** Task ID */
  taskId: string;
  /** Overall completion percentage */
  completionPercentage: number;
  /** Hours progress */
  hoursProgress: {
    estimated: number;
    actual: number;
    remaining: number;
  };
  /** Checklist progress */
  checklistProgress: {
    total: number;
    completed: number;
    percentage: number;
  };
  /** Milestone progress */
  milestoneProgress?: {
    current: string;
    next?: string;
    percentage: number;
  };
  /** Last updated */
  lastUpdated: Date;
}

/**
 * Task worklog entry
 */
export interface TaskWorklog {
  /** Worklog ID */
  id: string;
  /** Task ID */
  taskId: string;
  /** Member who logged work */
  memberId: string;
  /** Work date */
  workDate: Date;
  /** Hours worked */
  hoursWorked: number;
  /** Work description */
  description?: string;
  /** Work type */
  workType?: string;
  /** Created timestamp */
  createdAt: Date;
}

/**
 * Task filter criteria
 */
export interface TaskFilter {
  /** Filter by status */
  statuses?: WorkItemStatus[];
  /** Filter by task types */
  taskTypes?: TaskType[];
  /** Filter by priorities */
  priorities?: TaskPriority[];
  /** Filter by assigned members */
  assignedMemberIds?: string[];
  /** Filter by projects */
  projectIds?: string[];
  /** Filter by date range */
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
    dueDateStart?: Date;
    dueDateEnd?: Date;
  };
  /** Filter overdue tasks */
  isOverdue?: boolean;
  /** Filter blocked tasks */
  isBlocked?: boolean;
  /** Text search */
  searchText?: string;
}

/**
 * Task sorting options
 */
export interface TaskSort {
  /** Sort field */
  field:
    | "title"
    | "priority"
    | "dueDate"
    | "createdAt"
    | "status"
    | "completionPercentage";
  /** Sort direction */
  direction: "ASC" | "DESC";
}

/**
 * Task metrics and analytics
 */
export interface TaskMetrics {
  /** Time period */
  periodStart: Date;
  periodEnd: Date;
  /** Filter criteria used */
  filters?: TaskFilter;
  /** Total tasks */
  totalTasks: number;
  /** Tasks by status */
  tasksByStatus: Record<string, number>;
  /** Tasks by priority */
  tasksByPriority: Record<string, number>;
  /** Tasks by type */
  tasksByType: Record<string, number>;
  /** Average completion time */
  averageCompletionTime: number;
  /** On-time completion rate */
  onTimeCompletionRate: number;
  /** Overdue tasks */
  overdueTasks: number;
  /** Blocked tasks */
  blockedTasks: number;
  /** Top performers */
  topPerformers: Array<{
    memberId: string;
    tasksCompleted: number;
    averageCompletionTime: number;
    onTimeRate: number;
  }>;
  /** Bottlenecks */
  bottlenecks: Array<{
    taskType: string;
    averageWaitTime: number;
    blockedCount: number;
  }>;
}

/**
 * Bulk task operation
 */
export interface BulkTaskOperation {
  /** Task IDs */
  taskIds: string[];
  /** Operation type */
  operation:
    | "ASSIGN"
    | "REASSIGN"
    | "UPDATE_STATUS"
    | "UPDATE_PRIORITY"
    | "DELETE";
  /** Operation parameters */
  parameters: Record<string, unknown>;
  /** Actor performing operation */
  actorId: string;
  /** Operation reason */
  reason?: string;
}

/**
 * Task template for recurring tasks
 */
export interface TaskTemplate {
  /** Template ID */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string;
  /** Task configuration */
  taskConfig: Omit<CreateTaskRequest, "projectId">;
  /** Recurrence pattern */
  recurrence?: {
    frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
    interval: number;
    endDate?: Date;
    maxOccurrences?: number;
  };
  /** Template tags */
  tags?: string[];
  /** Whether template is active */
  isActive: boolean;
}

/**
 * Task notification configuration
 */
export interface TaskNotificationConfig {
  /** Notification triggers */
  triggers: Array<
    "ASSIGNED" | "DUE_SOON" | "OVERDUE" | "COMPLETED" | "BLOCKED" | "UNBLOCKED"
  >;
  /** Notification channels */
  channels: Array<"EMAIL" | "SMS" | "IN_APP" | "WEBHOOK">;
  /** Notification timing */
  timing: {
    /** Hours before due date */
    dueSoonHours?: number;
    /** Daily digest time */
    dailyDigestTime?: string;
    /** Weekly summary day */
    weeklySummaryDay?: string;
  };
  /** Recipient configuration */
  recipients: {
    /** Include assignees */
    includeAssignees?: boolean;
    /** Include project members */
    includeProjectMembers?: boolean;
    /** Include managers */
    includeManagers?: boolean;
    /** Additional member IDs */
    additionalMembers?: string[];
  };
}
