// ============================================================================
// BID TYPES
// ============================================================================
// Types for Bid, BidInvitation, BidSubmission, BidComparison entities
// ============================================================================

import { BaseEntityFields, RetentionPolicy } from "./shared.types";

// ============================================================================
// ENUMS
// ============================================================================

export enum BidStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  AWARDED = "AWARDED",
  CANCELLED = "CANCELLED",
}

export enum BidInvitationStatus {
  SENT = "SENT",
  VIEWED = "VIEWED",
  RESPONDED = "RESPONDED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export enum BidSubmissionStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
  EXPIRED = "EXPIRED",
}

// ============================================================================
// ENTITIES
// ============================================================================

export interface BidEntity {
  id: string;
  status: BidStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  deletedAt?: string;
  deletedByActorId?: string;
  createdByActorId?: string;
  updatedByActorId?: string;
  auditCorrelationId?: string;
  dataClassification: string;
  retentionPolicy?: RetentionPolicy;
  estimateId?: string;
  opportunityId?: string;
  name: string;
  description?: string;
  dueDate?: string;
}

export interface BidInvitationEntity extends Omit<BaseEntityFields, "status"> {
  status: BidInvitationStatus;
  bidId: string;
  inviteeName: string;
  inviteeEmail: string;
  sentAt?: string;
  respondedAt?: string;
}

export interface BidSubmissionEntity extends Omit<BaseEntityFields, "status"> {
  status: BidSubmissionStatus;
  invitationId: string;
  bidId: string;
  submittedAt?: string;
  amount?: number;
  notes?: string;
  attachmentUrl?: string;
}

export interface BidComparisonEntity extends BaseEntityFields {
  bidId: string;
  criterion: string;
  value?: string;
  ranking?: number;
  recommendation?: string;
}

// ============================================================================
// DTOs
// ============================================================================

export interface CreateBidDTO {
  estimateId?: string;
  opportunityId?: string;
  name: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateBidDTO {
  name?: string;
  description?: string;
  dueDate?: string;
  version: number;
}

export interface BidResponseDTO extends BidEntity {
  estimate?: {
    id: string;
    name: string;
    estimateNumber?: string;
  };
}
