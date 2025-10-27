// ============================================================================
// ESTIMATE DISCOUNT TYPES
// ============================================================================
// Types for EstimateDiscount entity - discount calculations
// ============================================================================

import { BaseEntityFields, EstimateDiscountType } from "./shared.types";

export interface EstimateDiscountEntity extends BaseEntityFields {
  estimateId: string;
  type: EstimateDiscountType;
  value?: number;
  amount: number;
  reason?: string;
}

export interface CreateEstimateDiscountDTO {
  estimateId: string;
  type: EstimateDiscountType;
  value?: number;
  amount: number;
  reason?: string;
}

export interface UpdateEstimateDiscountDTO {
  type?: EstimateDiscountType;
  value?: number;
  amount?: number;
  reason?: string;
  version: number;
}

export interface EstimateDiscountResponseDTO extends EstimateDiscountEntity {
  estimate?: {
    id: string;
    name: string;
  };
}
