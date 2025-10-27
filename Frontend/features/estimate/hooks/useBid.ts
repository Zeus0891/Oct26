// ============================================================================
// BID HOOKS
// ============================================================================
// React hooks for bid operations
// ============================================================================

import { useState, useCallback } from "react";
import { BidApiService } from "../services";
import {
  BidEntity,
  CreateBidDTO,
  UpdateBidDTO,
  BidStatus,
  PaginationParams,
} from "../types";

// Temporary filter type until properly defined
interface BidFilters {
  status?: BidStatus[];
  estimateId?: string;
  opportunityId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// ============================================================================
// BID QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch a single bid by ID
 */
export function useBid(id: string | null) {
  const [data, setData] = useState<BidEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBid = useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bid = await BidApiService.getById(id);
      setData(bid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bid");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    data,
    loading,
    error,
    refetch: fetchBid,
  };
}

/**
 * Hook to fetch bids list with filters and pagination
 */
export function useBids(filters?: BidFilters, pagination?: PaginationParams) {
  const [data, setData] = useState<BidEntity[]>([]);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBids = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await BidApiService.list(filters, pagination);
      setData(result.data);
      setPaginationData(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bids");
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
    refetch: fetchBids,
  };
}

// ============================================================================
// BID MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new bid
 */
export function useCreateBid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBid = useCallback(
    async (data: CreateBidDTO): Promise<BidEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const bid = await BidApiService.create(data);
        return bid;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create bid");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createBid,
    loading,
    error,
  };
}

/**
 * Hook to update a bid
 */
export function useUpdateBid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBid = useCallback(
    async (id: string, data: UpdateBidDTO): Promise<BidEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const bid = await BidApiService.update(id, data);
        return bid;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update bid");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updateBid,
    loading,
    error,
  };
}

/**
 * Hook to delete a bid
 */
export function useDeleteBid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBid = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await BidApiService.delete(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete bid");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteBid,
    loading,
    error,
  };
}

// ============================================================================
// BID STATE TRANSITION HOOKS
// ============================================================================

/**
 * Hook to open a bid for submissions
 */
export function useOpenBid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openBid = useCallback(async (id: string): Promise<BidEntity | null> => {
    setLoading(true);
    setError(null);

    try {
      const bid = await BidApiService.open(id);
      return bid;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open bid");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    openBid,
    loading,
    error,
  };
}

/**
 * Hook to close a bid
 */
export function useCloseBid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeBid = useCallback(
    async (id: string): Promise<BidEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const bid = await BidApiService.close(id);
        return bid;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to close bid");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    closeBid,
    loading,
    error,
  };
}

/**
 * Hook to award a bid to a specific submission
 */
export function useAwardBid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const awardBid = useCallback(
    async (
      id: string,
      submissionId: string,
      reason?: string
    ): Promise<BidEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const bid = await BidApiService.award(id, { submissionId, reason });
        return bid;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to award bid");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    awardBid,
    loading,
    error,
  };
}

/**
 * Hook to cancel a bid
 */
export function useCancelBid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelBid = useCallback(
    async (id: string, reason: string): Promise<BidEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const bid = await BidApiService.cancel(id, { reason });
        return bid;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to cancel bid");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    cancelBid,
    loading,
    error,
  };
}

// ============================================================================
// COMBINED BID MANAGEMENT HOOK
// ============================================================================

/**
 * Hook that combines bid fetching with all operations
 * Useful for bid detail pages
 */
export function useBidManager(id: string | null) {
  const {
    data: bid,
    loading: fetchLoading,
    error: fetchError,
    refetch,
  } = useBid(id);

  const {
    updateBid,
    loading: updateLoading,
    error: updateError,
  } = useUpdateBid();

  const {
    deleteBid,
    loading: deleteLoading,
    error: deleteError,
  } = useDeleteBid();

  const { openBid, loading: openLoading, error: openError } = useOpenBid();

  const { closeBid, loading: closeLoading, error: closeError } = useCloseBid();

  const { awardBid, loading: awardLoading, error: awardError } = useAwardBid();

  const {
    cancelBid,
    loading: cancelLoading,
    error: cancelError,
  } = useCancelBid();

  // Combined loading state
  const loading =
    fetchLoading ||
    updateLoading ||
    deleteLoading ||
    openLoading ||
    closeLoading ||
    awardLoading ||
    cancelLoading;

  // Combined error state
  const error =
    fetchError ||
    updateError ||
    deleteError ||
    openError ||
    closeError ||
    awardError ||
    cancelError;

  // Enhanced operations with auto-refetch
  const updateAndRefresh = useCallback(
    async (data: UpdateBidDTO) => {
      if (!id) return null;

      const result = await updateBid(id, data);
      if (result) {
        await refetch();
      }
      return result;
    },
    [id, updateBid, refetch]
  );

  const openAndRefresh = useCallback(async () => {
    if (!id) return null;

    const result = await openBid(id);
    if (result) {
      await refetch();
    }
    return result;
  }, [id, openBid, refetch]);

  const closeAndRefresh = useCallback(async () => {
    if (!id) return null;

    const result = await closeBid(id);
    if (result) {
      await refetch();
    }
    return result;
  }, [id, closeBid, refetch]);

  const awardAndRefresh = useCallback(
    async (submissionId: string, reason?: string) => {
      if (!id) return null;

      const result = await awardBid(id, submissionId, reason);
      if (result) {
        await refetch();
      }
      return result;
    },
    [id, awardBid, refetch]
  );

  const cancelAndRefresh = useCallback(
    async (reason: string) => {
      if (!id) return null;

      const result = await cancelBid(id, reason);
      if (result) {
        await refetch();
      }
      return result;
    },
    [id, cancelBid, refetch]
  );

  return {
    // Data
    bid,
    loading,
    error,

    // Actions with auto-refresh
    updateBid: updateAndRefresh,
    openBid: openAndRefresh,
    closeBid: closeAndRefresh,
    awardBid: awardAndRefresh,
    cancelBid: cancelAndRefresh,
    deleteBid,

    // Manual refresh
    refetch,
  };
}
