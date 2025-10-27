// ============================================================================
// ESTIMATE LINE ITEM TYPES
// ============================================================================
// Types for EstimateLineItem entity - line items within estimates
// ============================================================================

import { BaseEntityFields } from "./shared.types";

export interface EstimateLineItemEntity extends BaseEntityFields {
  estimateId: string;
  taskId?: string;
  purchaseOrderLineId?: string;
  priceListItemId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sortOrder: number;
}

export interface CreateEstimateLineItemDTO {
  estimateId: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taskId?: string;
  priceListItemId?: string;
  sortOrder?: number;
}

export interface UpdateEstimateLineItemDTO {
  name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  taskId?: string;
  priceListItemId?: string;
  sortOrder?: number;
  version: number;
}

export interface EstimateLineItemResponseDTO extends EstimateLineItemEntity {
  task?: {
    id: string;
    name: string;
    description?: string;
  };
  priceListItem?: {
    id: string;
    name: string;
    basePrice: number;
  };
}

export interface LineItemFormData {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taskId?: string;
  priceListItemId?: string;
}
