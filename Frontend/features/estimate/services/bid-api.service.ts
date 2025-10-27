// ============================================================================
// BID API SERVICE
// ============================================================================
// API service for bid operations - aligned with backend endpoints
// ============================================================================

import {
  BidEntity,
  CreateBidDTO,
  UpdateBidDTO,
  BidStatus,
  ApiResponse,
  ApiPaginatedResponse,
  PaginationParams,
} from "../types";

// Temporary type until BidFilterDTO is properly defined
interface BidFilterDTO {
  status?: BidStatus[];
  estimateId?: string;
  opportunityId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Base URL - should be configured via environment
const API_BASE = "/api/estimating/bids";

// ============================================================================
// BID API SERVICE CLASS
// ============================================================================

export class BidApiService {
  // ============================================================================
  // CRUD OPERATIONS (aligned with backend endpoints)
  // ============================================================================

  /**
   * Create a new bid
   * POST /api/estimating/bids
   */
  static async create(data: CreateBidDTO): Promise<BidEntity> {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create bid: ${response.statusText}`);
    }

    const result: ApiResponse<BidEntity> = await response.json();
    return result.data;
  }

  /**
   * List bids with filters and pagination
   * GET /api/estimating/bids
   */
  static async list(
    filters?: BidFilterDTO,
    pagination?: PaginationParams
  ): Promise<{
    data: BidEntity[];
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
    if (filters?.estimateId) queryParams.set("estimateId", filters.estimateId);
    if (filters?.opportunityId)
      queryParams.set("opportunityId", filters.opportunityId);
    if (filters?.dateFrom) queryParams.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) queryParams.set("dateTo", filters.dateTo);
    if (filters?.search) queryParams.set("search", filters.search);

    const url = queryParams.toString()
      ? `${API_BASE}?${queryParams}`
      : API_BASE;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to list bids: ${response.statusText}`);
    }

    const result: ApiPaginatedResponse<BidEntity> = await response.json();
    return result.data;
  }

  /**
   * Get bid by ID
   * GET /api/estimating/bids/:id
   * Note: This endpoint should exist in backend controller
   */
  static async getById(id: string): Promise<BidEntity> {
    const response = await fetch(`${API_BASE}/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to get bid: ${response.statusText}`);
    }

    const result: ApiResponse<BidEntity> = await response.json();
    return result.data;
  }

  /**
   * Update a bid
   * PUT /api/estimating/bids/:id
   * Note: This endpoint should exist in backend controller
   */
  static async update(id: string, data: UpdateBidDTO): Promise<BidEntity> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "If-Match": data.version?.toString() || "", // Optimistic concurrency
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update bid: ${response.statusText}`);
    }

    const result: ApiResponse<BidEntity> = await response.json();
    return result.data;
  }

  /**
   * Delete a bid
   * DELETE /api/estimating/bids/:id
   * Note: This endpoint should exist in backend controller
   */
  static async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete bid: ${response.statusText}`);
    }
  }

  // ============================================================================
  // BID STATE TRANSITIONS
  // ============================================================================

  /**
   * Open bid for submissions
   * POST /api/estimating/bids/:id/open
   * Note: This endpoint might exist in backend controller
   */
  static async open(id: string): Promise<BidEntity> {
    const response = await fetch(`${API_BASE}/${id}/open`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to open bid: ${response.statusText}`);
    }

    const result: ApiResponse<BidEntity> = await response.json();
    return result.data;
  }

  /**
   * Close bid
   * POST /api/estimating/bids/:id/close
   * Note: This endpoint might exist in backend controller
   */
  static async close(id: string): Promise<BidEntity> {
    const response = await fetch(`${API_BASE}/${id}/close`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to close bid: ${response.statusText}`);
    }

    const result: ApiResponse<BidEntity> = await response.json();
    return result.data;
  }

  /**
   * Award bid to a specific submission
   * POST /api/estimating/bids/:id/award
   * Note: This endpoint might exist in backend controller
   */
  static async award(
    id: string,
    data: { submissionId: string; reason?: string }
  ): Promise<BidEntity> {
    const response = await fetch(`${API_BASE}/${id}/award`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to award bid: ${response.statusText}`);
    }

    const result: ApiResponse<BidEntity> = await response.json();
    return result.data;
  }

  /**
   * Cancel bid
   * POST /api/estimating/bids/:id/cancel
   * Note: This endpoint might exist in backend controller
   */
  static async cancel(
    id: string,
    data: { reason: string }
  ): Promise<BidEntity> {
    const response = await fetch(`${API_BASE}/${id}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel bid: ${response.statusText}`);
    }

    const result: ApiResponse<BidEntity> = await response.json();
    return result.data;
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default BidApiService;
