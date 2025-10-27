// ============================================================================
// ESTIMATE TERM TYPES
// ============================================================================
// Types for EstimateTerm entity - terms and conditions
// ============================================================================

import { BaseEntityFields, EstimateTermType } from "./shared.types";

export interface EstimateTermEntity extends BaseEntityFields {
  estimateId: string;
  termType: EstimateTermType;
  body: string;
  sortOrder: number;
}

export interface CreateEstimateTermDTO {
  estimateId: string;
  termType: EstimateTermType;
  body: string;
  sortOrder?: number;
}

export interface UpdateEstimateTermDTO {
  termType?: EstimateTermType;
  body?: string;
  sortOrder?: number;
  version: number;
}

export interface EstimateTermResponseDTO extends EstimateTermEntity {
  estimate?: {
    id: string;
    name: string;
  };
}
