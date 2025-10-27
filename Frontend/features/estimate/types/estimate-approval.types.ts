// ============================================================================
// ESTIMATE APPROVAL TYPES
// ============================================================================
// Types for EstimateApproval entity - approval workflow
// ============================================================================

import { BaseEntityFields, EstimateApprovalDecision } from "./shared.types";

export interface EstimateApprovalEntity extends BaseEntityFields {
  estimateId: string;
  approvalRequestId?: string;
  approverId?: string;
  decision: EstimateApprovalDecision;
  comments?: string;
  requestedAt?: string;
  decidedAt?: string;
}

export interface CreateEstimateApprovalDTO {
  estimateId: string;
  approverId?: string;
  comments?: string;
}

export interface UpdateEstimateApprovalDTO {
  decision: EstimateApprovalDecision;
  comments?: string;
  version: number;
}

export interface EstimateApprovalResponseDTO extends EstimateApprovalEntity {
  estimate?: {
    id: string;
    name: string;
    estimateNumber?: string;
  };
  approver?: {
    id: string;
    displayName: string;
  };
  approvalRequest?: {
    id: string;
    type: string;
    priority: string;
  };
}
