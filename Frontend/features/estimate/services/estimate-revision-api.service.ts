// ============================================================================
// ESTIMATE REVISION API SERVICE
// ============================================================================
// API service for estimate revision operations - aligned with backend endpoints
// ============================================================================

import { EstimateRevisionEntity, ApiResponse } from "../types";

// Temporary type until CreateEstimateRevisionDTO is properly defined
interface CreateEstimateRevisionDTO {
  reason?: string;
  notes?: string;
}

// ============================================================================
// ESTIMATE REVISION API SERVICE CLASS
// ============================================================================

export class EstimateRevisionApiService {
  /**
   * List all revisions for an estimate
   * GET /api/estimating/estimates/:estimateId/revisions
   */
  static async listByEstimate(
    estimateId: string
  ): Promise<EstimateRevisionEntity[]> {
    const response = await fetch(
      `/api/estimating/estimates/${estimateId}/revisions`
    );

    if (!response.ok) {
      throw new Error(`Failed to list revisions: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateRevisionEntity[]> = await response.json();
    return result.data;
  }

  /**
   * Get revision by ID
   * GET /api/estimating/estimates/:estimateId/revisions/:id
   */
  static async getById(
    estimateId: string,
    revisionId: string
  ): Promise<EstimateRevisionEntity> {
    const response = await fetch(
      `/api/estimating/estimates/${estimateId}/revisions/${revisionId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get revision: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateRevisionEntity> = await response.json();
    return result.data;
  }

  /**
   * Create a new revision (manual versioning)
   * POST /api/estimating/estimates/:estimateId/revisions
   * Note: This might be automatic in backend when estimate changes
   */
  static async create(
    estimateId: string,
    data: CreateEstimateRevisionDTO
  ): Promise<EstimateRevisionEntity> {
    const response = await fetch(
      `/api/estimating/estimates/${estimateId}/revisions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create revision: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateRevisionEntity> = await response.json();
    return result.data;
  }

  /**
   * Compare two revisions
   * GET /api/estimating/estimates/:estimateId/revisions/:id1/compare/:id2
   * Note: This might be a future endpoint for revision comparison
   */
  static async compare(
    estimateId: string,
    revision1Id: string,
    revision2Id: string
  ): Promise<{
    differences: Array<{
      field: string;
      oldValue: unknown;
      newValue: unknown;
      changeType: "added" | "modified" | "removed";
    }>;
  }> {
    const response = await fetch(
      `/api/estimating/estimates/${estimateId}/revisions/${revision1Id}/compare/${revision2Id}`
    );

    if (!response.ok) {
      throw new Error(`Failed to compare revisions: ${response.statusText}`);
    }

    const result: ApiResponse<{
      differences: Array<{
        field: string;
        oldValue: unknown;
        newValue: unknown;
        changeType: "added" | "modified" | "removed";
      }>;
    }> = await response.json();
    return result.data;
  }

  /**
   * Restore to a specific revision
   * POST /api/estimating/estimates/:estimateId/revisions/:id/restore
   * Note: This might be a future endpoint
   */
  static async restore(
    estimateId: string,
    revisionId: string
  ): Promise<EstimateRevisionEntity> {
    const response = await fetch(
      `/api/estimating/estimates/${estimateId}/revisions/${revisionId}/restore`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to restore revision: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateRevisionEntity> = await response.json();
    return result.data;
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default EstimateRevisionApiService;
