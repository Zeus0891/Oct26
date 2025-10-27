// ============================================================================
// ESTIMATE SERVICE (SINGLETON)
// ============================================================================
// Singleton service instance for estimate operations
// ============================================================================

import { EstimateApiService } from "./estimate-api.service";
import {
  EstimateEntity,
  CreateEstimateDTO,
  UpdateEstimateDTO,
  EstimateStatus,
  PaginationParams,
} from "../types";

// ============================================================================
// ESTIMATE SERVICE CLASS
// ============================================================================

class EstimateService {
  private apiService = EstimateApiService;

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new estimate
   */
  async create(data: CreateEstimateDTO): Promise<EstimateEntity> {
    return this.apiService.create(data);
  }

  /**
   * Get estimate by ID
   */
  async getById(id: string): Promise<EstimateEntity> {
    return this.apiService.getById(id);
  }

  /**
   * Update estimate
   */
  async update(id: string, data: UpdateEstimateDTO): Promise<EstimateEntity> {
    return this.apiService.update(id, data);
  }

  /**
   * Delete estimate
   */
  async delete(id: string): Promise<void> {
    return this.apiService.delete(id);
  }

  /**
   * Get paginated estimates with filters
   */
  async list(
    filters: {
      status?: EstimateStatus[];
      customerId?: string;
      dateFrom?: string;
      dateTo?: string;
      minAmount?: number;
      maxAmount?: number;
      search?: string;
    } = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ) {
    return this.apiService.list(filters, pagination);
  }

  // ============================================================================
  // STATUS OPERATIONS
  // ============================================================================

  /**
   * Submit estimate for approval
   */
  async submit(id: string): Promise<EstimateEntity> {
    return this.apiService.submit(id);
  }

  /**
   * Approve estimate
   */
  async approve(id: string): Promise<EstimateEntity> {
    return this.apiService.approve(id);
  }

  /**
   * Decline estimate
   */
  async decline(
    id: string,
    reason: string = "Declined"
  ): Promise<EstimateEntity> {
    return this.apiService.reject(id, { reason });
  }

  // ============================================================================
  // UTILITY OPERATIONS
  // ============================================================================

  /**
   * Duplicate estimate
   */
  async duplicate(id: string): Promise<EstimateEntity> {
    return this.apiService.duplicate(id);
  }

  /**
   * Export estimates
   */
  async export(
    format: "pdf" | "csv" | "excel" = "pdf",
    filters?: {
      status?: EstimateStatus[];
      customerId?: string;
      dateFrom?: string;
      dateTo?: string;
      minAmount?: number;
      maxAmount?: number;
      search?: string;
    }
  ): Promise<Blob> {
    return this.apiService.export(format as "csv" | "pdf" | "excel", filters);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const estimateService = new EstimateService();

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default estimateService;
