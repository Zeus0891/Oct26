// ============================================================================
// ESTIMATE CORE TYPES
// ============================================================================
// Core types for Estimate entity - main estimation functionality
// ============================================================================

import {
  EstimateStatus,
  EstimateDiscountType,
  EstimateTaxType,
  RetentionPolicy,
} from "./shared.types";

// ============================================================================
// CORE ESTIMATE ENTITY
// ============================================================================

export interface EstimateEntity {
  id: string;
  status: EstimateStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  deletedAt?: string;
  deletedByActorId?: string;
  createdByActorId?: string;
  updatedByActorId?: string;
  globalId: string;
  auditCorrelationId?: string;
  dataClassification: string;
  retentionPolicy?: RetentionPolicy;

  // Client and relationships
  clientAccountId?: string;
  clientContactId?: string;
  contractTemplateId?: string;
  termsTemplateId?: string;
  documentGroupId?: string;

  // Estimate details
  estimateNumber?: string;
  name: string;
  clientNotes?: string;
  internalNotes?: string;
  serviceLocation?: string;
  specialRequirements?: string;

  // Status timestamps
  sentAt?: string;
  viewedAt?: string;
  clientApprovedAt?: string;
  clientDeclinedAt?: string;
  declinedAt?: string;
  clientDecisionNote?: string;

  // Public access
  enablePublicView: boolean;
  approvalTokenHash?: string;
  publicViewTokenHash?: string;

  // Approval tracking
  approvedByMemberId?: string;
  approvedAt?: string;
  finalApprovedByMemberId?: string;
  finalApprovedAt?: string;
  declineReason?: string;

  // Conversion tracking
  approvedProjectId?: string;
  approvedInvoiceId?: string;

  // Financial totals
  subtotal?: number;
  discountType: EstimateDiscountType;
  discountValue?: number;
  discountAmount: number;
  taxType: EstimateTaxType;
  taxRate?: number;
  taxAmount: number;
  totalDue?: number;
  grandTotal?: number;
  validUntil?: string;
}

// ============================================================================
// DTOs FOR API COMMUNICATION
// ============================================================================

export interface CreateEstimateDTO {
  name: string;
  clientAccountId?: string;
  clientContactId?: string;
  clientNotes?: string;
  internalNotes?: string;
  serviceLocation?: string;
  specialRequirements?: string;
  contractTemplateId?: string;
  termsTemplateId?: string;
  validUntil?: string;
  enablePublicView?: boolean;
}

export interface UpdateEstimateDTO {
  name?: string;
  clientAccountId?: string;
  clientContactId?: string;
  clientNotes?: string;
  internalNotes?: string;
  serviceLocation?: string;
  specialRequirements?: string;
  contractTemplateId?: string;
  termsTemplateId?: string;
  validUntil?: string;
  enablePublicView?: boolean;
  version: number;
}

export interface EstimateResponseDTO extends EstimateEntity {
  clientAccount?: {
    id: string;
    name: string;
    email?: string;
  };
  clientContact?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  approvedByMember?: {
    id: string;
    displayName: string;
  };
}

// ============================================================================
// FILTERS AND UI TYPES
// ============================================================================

export interface EstimateFilters {
  status?: EstimateStatus[];
  clientAccountId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface EstimateFormData {
  name: string;
  clientAccountId: string;
  clientContactId?: string;
  clientNotes?: string;
  internalNotes?: string;
  serviceLocation?: string;
  validUntil?: string;
  enablePublicView: boolean;
}
