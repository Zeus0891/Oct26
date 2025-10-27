// ============================================================================
// ESTIMATE HOOKS
// ============================================================================
// React hooks for estimate operations using React Query/SWR pattern
// ============================================================================

import { useState, useCallback } from "react";
import { EstimateApiService } from "../services";
import {
  EstimateEntity,
  CreateEstimateDTO,
  UpdateEstimateDTO,
  EstimateStatus,
  PaginationParams,
} from "../types";

// Temporary filter type until properly defined in types
interface EstimateFilters {
  status?: EstimateStatus[];
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

// ============================================================================
// ESTIMATE QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch a single estimate by ID
 */
export function useEstimate(id: string | null) {
  const [data, setData] = useState<EstimateEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstimate = useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const estimate = await EstimateApiService.getById(id);
      setData(estimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch estimate");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    data,
    loading,
    error,
    refetch: fetchEstimate,
  };
}

/**
 * Hook to fetch estimates list with filters and pagination
 */
export function useEstimates(
  filters?: EstimateFilters,
  pagination?: PaginationParams
) {
  const [data, setData] = useState<EstimateEntity[]>([]);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await EstimateApiService.list(filters, pagination);
      setData(result.data);
      setPaginationData(result.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch estimates"
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  return {
    data,
    pagination: paginationData,
    loading,
    error,
    refetch: fetchEstimates,
  };
}

// ============================================================================
// ESTIMATE MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new estimate
 */
export function useCreateEstimate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEstimate = useCallback(
    async (data: CreateEstimateDTO): Promise<EstimateEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const estimate = await EstimateApiService.create(data);
        return estimate;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create estimate"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createEstimate,
    loading,
    error,
  };
}

/**
 * Hook to update an estimate
 */
export function useUpdateEstimate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEstimate = useCallback(
    async (
      id: string,
      data: UpdateEstimateDTO
    ): Promise<EstimateEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const estimate = await EstimateApiService.update(id, data);
        return estimate;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update estimate"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updateEstimate,
    loading,
    error,
  };
}

/**
 * Hook to delete an estimate
 */
export function useDeleteEstimate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteEstimate = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await EstimateApiService.delete(id);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete estimate"
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteEstimate,
    loading,
    error,
  };
}

// ============================================================================
// ESTIMATE STATE TRANSITION HOOKS
// ============================================================================

/**
 * Hook to submit an estimate for approval
 */
export function useSubmitEstimate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitEstimate = useCallback(
    async (id: string): Promise<EstimateEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const estimate = await EstimateApiService.submit(id);
        return estimate;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to submit estimate"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    submitEstimate,
    loading,
    error,
  };
}

/**
 * Hook to approve an estimate
 */
export function useApproveEstimate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveEstimate = useCallback(
    async (id: string, reason?: string): Promise<EstimateEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const estimate = await EstimateApiService.approve(id, { reason });
        return estimate;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to approve estimate"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    approveEstimate,
    loading,
    error,
  };
}

/**
 * Hook to reject an estimate
 */
export function useRejectEstimate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rejectEstimate = useCallback(
    async (id: string, reason: string): Promise<EstimateEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const estimate = await EstimateApiService.reject(id, { reason });
        return estimate;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to reject estimate"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    rejectEstimate,
    loading,
    error,
  };
}

// ============================================================================
// ESTIMATE BUSINESS OPERATION HOOKS
// ============================================================================

/**
 * Hook to duplicate an estimate
 */
export function useDuplicateEstimate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const duplicateEstimate = useCallback(
    async (id: string): Promise<EstimateEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const estimate = await EstimateApiService.duplicate(id);
        return estimate;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to duplicate estimate"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    duplicateEstimate,
    loading,
    error,
  };
}

/**
 * Hook to convert estimate to project
 */
export function useConvertEstimateToProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertToProject = useCallback(
    async (id: string): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await EstimateApiService.convertToProject(id);
        return result.projectId;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to convert estimate"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    convertToProject,
    loading,
    error,
  };
}

/**
 * Hook to export estimates
 */
export function useExportEstimates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportEstimates = useCallback(
    async (
      format: "csv" | "pdf" | "excel" = "csv",
      filters?: EstimateFilters
    ): Promise<Blob | null> => {
      setLoading(true);
      setError(null);

      try {
        const blob = await EstimateApiService.export(format, filters);
        return blob;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to export estimates"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    exportEstimates,
    loading,
    error,
  };
}
