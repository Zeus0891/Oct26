/**
 * Workflow Types Index
 *
 * Exports all workflow and process management types for status tracking,
 * revision control, approval flows, and task management. These types support
 * enterprise-grade business process automation with RBAC integration.
 *
 * Categories:
 * - Status Management: Lifecycle and state transition control
 * - Revision Control: Version tracking and change management
 * - Approval Flows: RBAC-integrated approval workflows
 * - Task Management: Assignment and progress tracking
 *
 * @category Workflow Types
 * @description Business process management and workflow automation types
 */

// Status lifecycle and transitions
export * from "./status.types";

// Revision and version control
export * from "./revision.types";

// Approval workflow management
export * from "./approval-flow.types";

// Task and assignment management
export * from "./task.types";
