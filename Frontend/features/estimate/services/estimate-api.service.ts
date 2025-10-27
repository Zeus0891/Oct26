// ============================================================================
// ESTIMATE API SERVICE
// ============================================================================
// API service for estimate operations - aligned with backend endpoints
// ============================================================================

import {
  EstimateEntity,
  CreateEstimateDTO,
  UpdateEstimateDTO,
  EstimateStatus,
  ApiResponse,
  ApiPaginatedResponse,
  PaginationParams,
} from "../types";

// Temporary type until EstimateFilterDTO is properly defined
interface EstimateFilterDTO {
  status?: EstimateStatus[];
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

// Base URL - should be configured via environment
const API_BASE = "/api/estimating/estimates";

// ============================================================================
// ESTIMATE API SERVICE CLASS
// ============================================================================

export class EstimateApiService {
  // ============================================================================
  // CRUD OPERATIONS (aligned with backend endpoints)
  // ============================================================================

  /**
   * Create a new estimate
   * POST /api/estimating/estimates
   */
  static async create(data: CreateEstimateDTO): Promise<EstimateEntity> {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create estimate: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateEntity> = await response.json();
    return result.data;
  }

  /**
   * Get estimate by ID
   * GET /api/estimating/estimates/:id
   */
  static async getById(id: string): Promise<EstimateEntity> {
    const response = await fetch(`${API_BASE}/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to get estimate: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateEntity> = await response.json();
    return result.data;
  }

  /**
   * List estimates with filters and pagination
   * GET /api/estimating/estimates
   */
  static async list(
    filters?: EstimateFilterDTO,
    pagination?: PaginationParams
  ): Promise<{
    data: EstimateEntity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();

    // Add pagination params
    if (pagination?.page) queryParams.set("page", pagination.page.toString());
    if (pagination?.limit)
      queryParams.set("limit", pagination.limit.toString());

    // Add filter params
    if (filters?.status?.length) {
      filters.status.forEach((status) => queryParams.append("status", status));
    }
    if (filters?.customerId) queryParams.set("customerId", filters.customerId);
    if (filters?.dateFrom) queryParams.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) queryParams.set("dateTo", filters.dateTo);
    if (filters?.minAmount)
      queryParams.set("minAmount", filters.minAmount.toString());
    if (filters?.maxAmount)
      queryParams.set("maxAmount", filters.maxAmount.toString());
    if (filters?.search) queryParams.set("search", filters.search);

    const url = queryParams.toString()
      ? `${API_BASE}?${queryParams}`
      : API_BASE;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to list estimates: ${response.statusText}`);
    }

    const result: ApiPaginatedResponse<EstimateEntity> = await response.json();
    return result.data;
  }

  /**
   * Update an estimate (only DRAFT status)
   * PUT /api/estimating/estimates/:id
   */
  static async update(
    id: string,
    data: UpdateEstimateDTO
  ): Promise<EstimateEntity> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "If-Match": data.version?.toString() || "", // Optimistic concurrency
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update estimate: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateEntity> = await response.json();
    return result.data;
  }

  /**
   * Soft delete estimate
   * DELETE /api/estimating/estimates/:id
   */
  static async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete estimate: ${response.statusText}`);
    }
  }

  // ============================================================================
  // STATE TRANSITIONS (aligned with backend endpoints)
  // ============================================================================

  /**
   * Submit estimate for approval
   * POST /api/estimating/estimates/:id/submit
   */
  static async submit(id: string): Promise<EstimateEntity> {
    const response = await fetch(`${API_BASE}/${id}/submit`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to submit estimate: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateEntity> = await response.json();
    return result.data;
  }

  /**
   * Approve estimate
   * POST /api/estimating/estimates/:id/approve
   */
  static async approve(
    id: string,
    data?: { reason?: string }
  ): Promise<EstimateEntity> {
    const response = await fetch(`${API_BASE}/${id}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data || {}),
    });

    if (!response.ok) {
      throw new Error(`Failed to approve estimate: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateEntity> = await response.json();
    return result.data;
  }

  /**
   * Reject estimate
   * POST /api/estimating/estimates/:id/reject
   */
  static async reject(
    id: string,
    data: { reason: string }
  ): Promise<EstimateEntity> {
    const response = await fetch(`${API_BASE}/${id}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to reject estimate: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateEntity> = await response.json();
    return result.data;
  }

  // ============================================================================
  // BUSINESS OPERATIONS (aligned with backend endpoints)
  // ============================================================================

  /**
   * Duplicate estimate
   * POST /api/estimating/estimates/:id/duplicate
   */
  static async duplicate(id: string): Promise<EstimateEntity> {
    const response = await fetch(`${API_BASE}/${id}/duplicate`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to duplicate estimate: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateEntity> = await response.json();
    return result.data;
  }

  /**
   * Convert estimate to project
   * POST /api/estimating/estimates/:id/convert-to-project
   */
  static async convertToProject(id: string): Promise<{ projectId: string }> {
    const response = await fetch(`${API_BASE}/${id}/convert-to-project`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to convert estimate: ${response.statusText}`);
    }

    const result: ApiResponse<{ projectId: string }> = await response.json();
    return result.data;
  }

  /**
   * Restore soft deleted estimate
   * POST /api/estimating/estimates/:id/restore
   */
  static async restore(id: string): Promise<EstimateEntity> {
    const response = await fetch(`${API_BASE}/${id}/restore`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to restore estimate: ${response.statusText}`);
    }

    const result: ApiResponse<EstimateEntity> = await response.json();
    return result.data;
  }

  /**
   * Export estimates to various formats
   * GET /api/estimating/estimates/export
   */
  static async export(
    format: "csv" | "pdf" | "excel" = "csv",
    filters?: EstimateFilterDTO
  ): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.set("format", format);

    // Add filter params for export
    if (filters?.status?.length) {
      filters.status.forEach((status) => queryParams.append("status", status));
    }
    if (filters?.customerId) queryParams.set("customerId", filters.customerId);
    if (filters?.dateFrom) queryParams.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) queryParams.set("dateTo", filters.dateTo);

    const response = await fetch(`${API_BASE}/export?${queryParams}`);

    if (!response.ok) {
      throw new Error(`Failed to export estimates: ${response.statusText}`);
    }

    return response.blob();
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default EstimateApiService;
