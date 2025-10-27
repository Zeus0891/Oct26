// ============================================================================
// ESTIMATE TAX TYPES
// ============================================================================
// Types for EstimateTax entity - tax calculations
// ============================================================================

import { BaseEntityFields, EstimateTaxType } from "./shared.types";

export interface EstimateTaxEntity extends BaseEntityFields {
  estimateId: string;
  taxType: EstimateTaxType;
  rate: number;
  amount: number;
}

export interface CreateEstimateTaxDTO {
  estimateId: string;
  taxType: EstimateTaxType;
  rate: number;
  amount: number;
}

export interface UpdateEstimateTaxDTO {
  taxType?: EstimateTaxType;
  rate?: number;
  amount?: number;
  version: number;
}

export interface EstimateTaxResponseDTO extends EstimateTaxEntity {
  estimate?: {
    id: string;
    name: string;
  };
}
