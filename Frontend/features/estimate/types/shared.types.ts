// ============================================================================
// SHARED TYPES - ESTIMATE MODULE
// ============================================================================
// Common types, enums, and interfaces shared across the estimate module
// Based on Prisma schema definitions
// ============================================================================

// ============================================================================
// BASE ENUMS (From Prisma Schema)
// ============================================================================

export enum EstimateStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  VIEWED = "VIEWED",
  CLIENT_APPROVED = "CLIENT_APPROVED",
  CLIENT_DECLINED = "CLIENT_DECLINED",
  APPROVED = "APPROVED",
  DECLINED = "DECLINED",
  CONVERTED = "CONVERTED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export enum EstimateChildStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

export enum EstimateDiscountType {
  NONE = "NONE",
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  VOLUME = "VOLUME",
  EARLY_PAYMENT = "EARLY_PAYMENT",
  PROMOTIONAL = "PROMOTIONAL",
}

export enum EstimateTaxType {
  NONE = "NONE",
  SALES_TAX = "SALES_TAX",
  VAT = "VAT",
  GST = "GST",
  CUSTOM = "CUSTOM",
}

export enum EstimateTermType {
  PAYMENT = "PAYMENT",
  DELIVERY = "DELIVERY",
  WARRANTY = "WARRANTY",
  CANCELLATION = "CANCELLATION",
  SCOPE = "SCOPE",
  LIABILITY = "LIABILITY",
  COMPLIANCE = "COMPLIANCE",
}

export enum EstimateApprovalDecision {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DECLINED = "DECLINED",
  CANCELLED = "CANCELLED",
  ESCALATED = "ESCALATED",
}

export enum RetentionPolicy {
  DAYS_30 = "DAYS_30",
  DAYS_90 = "DAYS_90",
  MONTHS_6 = "MONTHS_6",
  YEAR_1 = "YEAR_1",
  YEARS_3 = "YEARS_3",
  YEARS_7 = "YEARS_7",
  YEARS_10 = "YEARS_10",
  PERMANENT = "PERMANENT",
}

// ============================================================================
// COMMON INTERFACES
// ============================================================================

export interface BaseEntityFields {
  id: string;
  status: EstimateChildStatus;
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
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface EstimateTotals {
  subtotal?: number;
  discountAmount: number;
  taxAmount: number;
  totalDue?: number;
  grandTotal?: number;
}
