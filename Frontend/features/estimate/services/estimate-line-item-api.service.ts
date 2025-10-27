// ============================================================================
// ESTIMATE LINE ITEM API SERVICE
// ============================================================================
// API service for estimate line item operations - aligned with backend endpoints
// ============================================================================

import {
  EstimateLineItemEntity,
  CreateEstimateLineItemDTO,
  UpdateEstimateLineItemDTO,
  ApiResponse,
} from "../types";

// ============================================================================
// ESTIMATE LINE ITEM API SERVICE CLASS
// ============================================================================

export class EstimateLineItemApiService {
  /**
   * Create a new line item for an estimate
   * POST /api/estimating/estimates/:estimateId/line-items
   */
  static async create(
    estimateId: string,
    data: CreateEstimateLineItemDTO
  ): Promise<EstimateLineItemEntity> {
    const response = await fetch(
      `/api/estimating/estimates/${estimateId}/line-items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create line item: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateLineItemEntity> = await response.json();
    return result.data;
  }

  /**
   * List all line items for an estimate
   * GET /api/estimating/estimates/:estimateId/line-items
   */
  static async listByEstimate(
    estimateId: string
  ): Promise<EstimateLineItemEntity[]> {
    const response = await fetch(
      `/api/estimating/estimates/${estimateId}/line-items`
    );

    if (!response.ok) {
      throw new Error(`Failed to list line items: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateLineItemEntity[]> = await response.json();
    return result.data;
  }

  /**
   * Update a line item
   * PUT /api/estimating/estimates/:estimateId/line-items/:id
   * Note: This endpoint might exist in backend controller but not exposed in routes yet
   */
  static async update(
    estimateId: string,
    lineItemId: string,
    data: UpdateEstimateLineItemDTO
  ): Promise<EstimateLineItemEntity> {
    const response = await fetch(
      `/api/estimating/estimates/${estimateId}/line-items/${lineItemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "If-Match": data.version?.toString() || "", // Optimistic concurrency
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update line item: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateLineItemEntity> = await response.json();
    return result.data;
  }

  /**
   * Delete a line item
   * DELETE /api/estimating/estimates/:estimateId/line-items/:id
   * Note: This endpoint might exist in backend controller but not exposed in routes yet
   */
  static async delete(estimateId: string, lineItemId: string): Promise<void> {
    const response = await fetch(
      `/api/estimating/estimates/${estimateId}/line-items/${lineItemId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete line item: ${response.statusText}`);
    }
  }

  /**
   * Bulk create line items
   * POST /api/estimating/estimates/:estimateId/line-items/bulk
   * Note: This might be a future endpoint for bulk operations
   */
  static async bulkCreate(
    estimateId: string,
    items: CreateEstimateLineItemDTO[]
  ): Promise<EstimateLineItemEntity[]> {
    const response = await fetch(
      `/api/estimating/estimates/${estimateId}/line-items/bulk`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to bulk create line items: ${response.statusText}`
      );
    }

    const result: ApiResponse<EstimateLineItemEntity[]> = await response.json();
    return result.data;
  }

  /**
   * Reorder line items
   * PUT /api/estimating/estimates/:estimateId/line-items/reorder
   * Note: This might be a future endpoint for reordering
   */
  static async reorder(
    estimateId: string,
    orderedIds: string[]
  ): Promise<EstimateLineItemEntity[]> {
    const response = await fetch(
      `/api/estimating/estimates/${estimateId}/line-items/reorder`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderedIds }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to reorder line items: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateLineItemEntity[]> = await response.json();
    return result.data;
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default EstimateLineItemApiService;
