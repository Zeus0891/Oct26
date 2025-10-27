// ============================================================================
// ESTIMATE MODULE TYPES INDEX
// ============================================================================
// Central export point for all estimate module types
// ============================================================================

// ============================================================================
// SHARED TYPES AND ENUMS
// ============================================================================
export * from "./shared.types";

// ============================================================================
// CORE ESTIMATE TYPES
// ============================================================================
export * from "./estimate.types";
export * from "./estimate-line-item.types";
export * from "./estimate-revision.types";

// ============================================================================
// ESTIMATE CHILD ENTITIES
// ============================================================================
export * from "./estimate-approval.types";
export * from "./estimate-attachment.types";
export * from "./estimate-tax.types";
export * from "./estimate-discount.types";
export * from "./estimate-term.types";
export * from "./estimate-comment.types";
export * from "./estimate-history.types";

// ============================================================================
// BID ENTITIES
// ============================================================================
export * from "./bid.types";

// ============================================================================
// API AND UI TYPES
// ============================================================================
export * from "./api.types";
export * from "./ui.types";

// ============================================================================
// CONVENIENCE RE-EXPORTS
// ============================================================================

// Main entities
export type { EstimateEntity as Estimate } from "./estimate.types";

export type { EstimateLineItemEntity as EstimateLineItem } from "./estimate-line-item.types";

export type { EstimateApprovalEntity as EstimateApproval } from "./estimate-approval.types";

export type { EstimateAttachmentEntity as EstimateAttachment } from "./estimate-attachment.types";

export type { EstimateTaxEntity as EstimateTax } from "./estimate-tax.types";

export type { EstimateDiscountEntity as EstimateDiscount } from "./estimate-discount.types";

export type { EstimateTermEntity as EstimateTerm } from "./estimate-term.types";

export type { EstimateCommentEntity as EstimateComment } from "./estimate-comment.types";

export type { EstimateRevisionEntity as EstimateRevision } from "./estimate-revision.types";

export type { EstimateHistoryEventEntity as EstimateHistoryEvent } from "./estimate-history.types";

// Bid entities
export type {
  BidEntity as Bid,
  BidInvitationEntity as BidInvitation,
  BidSubmissionEntity as BidSubmission,
  BidComparisonEntity as BidComparison,
} from "./bid.types";

// Main DTOs
export type {
  CreateEstimateDTO,
  UpdateEstimateDTO,
  EstimateResponseDTO,
} from "./estimate.types";

export type {
  CreateEstimateLineItemDTO,
  UpdateEstimateLineItemDTO,
  EstimateLineItemResponseDTO,
} from "./estimate-line-item.types";
