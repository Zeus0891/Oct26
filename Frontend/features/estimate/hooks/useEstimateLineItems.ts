// ============================================================================
// ESTIMATE LINE ITEM HOOKS
// ============================================================================
// React hooks for estimate line item operations
// ============================================================================

import { useState, useCallback } from "react";
import { EstimateLineItemApiService } from "../services";
import {
  EstimateLineItemEntity,
  CreateEstimateLineItemDTO,
  UpdateEstimateLineItemDTO,
} from "../types";

// ============================================================================
// LINE ITEM QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch line items for an estimate
 */
export function useEstimateLineItems(estimateId: string | null) {
  const [data, setData] = useState<EstimateLineItemEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLineItems = useCallback(async () => {
    if (!estimateId) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const lineItems =
        await EstimateLineItemApiService.listByEstimate(estimateId);
      setData(lineItems);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch line items"
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [estimateId]);

  return {
    data,
    loading,
    error,
    refetch: fetchLineItems,
  };
}

// ============================================================================
// LINE ITEM MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new line item
 */
export function useCreateLineItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLineItem = useCallback(
    async (
      estimateId: string,
      data: CreateEstimateLineItemDTO
    ): Promise<EstimateLineItemEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const lineItem = await EstimateLineItemApiService.create(
          estimateId,
          data
        );
        return lineItem;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create line item"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createLineItem,
    loading,
    error,
  };
}

/**
 * Hook to update a line item
 */
export function useUpdateLineItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLineItem = useCallback(
    async (
      estimateId: string,
      lineItemId: string,
      data: UpdateEstimateLineItemDTO
    ): Promise<EstimateLineItemEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const lineItem = await EstimateLineItemApiService.update(
          estimateId,
          lineItemId,
          data
        );
        return lineItem;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update line item"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updateLineItem,
    loading,
    error,
  };
}

/**
 * Hook to delete a line item
 */
export function useDeleteLineItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteLineItem = useCallback(
    async (estimateId: string, lineItemId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await EstimateLineItemApiService.delete(estimateId, lineItemId);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete line item"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    deleteLineItem,
    loading,
    error,
  };
}

/**
 * Hook to bulk create line items
 */
export function useBulkCreateLineItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkCreateLineItems = useCallback(
    async (
      estimateId: string,
      items: CreateEstimateLineItemDTO[]
    ): Promise<EstimateLineItemEntity[] | null> => {
      setLoading(true);
      setError(null);

      try {
        const lineItems = await EstimateLineItemApiService.bulkCreate(
          estimateId,
          items
        );
        return lineItems;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to bulk create line items"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    bulkCreateLineItems,
    loading,
    error,
  };
}

/**
 * Hook to reorder line items
 */
export function useReorderLineItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reorderLineItems = useCallback(
    async (
      estimateId: string,
      orderedIds: string[]
    ): Promise<EstimateLineItemEntity[] | null> => {
      setLoading(true);
      setError(null);

      try {
        const lineItems = await EstimateLineItemApiService.reorder(
          estimateId,
          orderedIds
        );
        return lineItems;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to reorder line items"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    reorderLineItems,
    loading,
    error,
  };
}

// ============================================================================
// COMBINED HOOKS FOR COMMON PATTERNS
// ============================================================================

/**
 * Hook that combines line items fetching with CRUD operations
 * Useful for estimate detail pages
 */
export function useEstimateLineItemsManager(estimateId: string | null) {
  const {
    data: lineItems,
    loading: fetchLoading,
    error: fetchError,
    refetch,
  } = useEstimateLineItems(estimateId);

  const {
    createLineItem,
    loading: createLoading,
    error: createError,
  } = useCreateLineItem();

  const {
    updateLineItem,
    loading: updateLoading,
    error: updateError,
  } = useUpdateLineItem();

  const {
    deleteLineItem,
    loading: deleteLoading,
    error: deleteError,
  } = useDeleteLineItem();

  const {
    reorderLineItems,
    loading: reorderLoading,
    error: reorderError,
  } = useReorderLineItems();

  // Combined loading state
  const loading =
    fetchLoading ||
    createLoading ||
    updateLoading ||
    deleteLoading ||
    reorderLoading;

  // Combined error state
  const error =
    fetchError || createError || updateError || deleteError || reorderError;

  // Enhanced create with auto-refetch
  const createAndRefresh = useCallback(
    async (data: CreateEstimateLineItemDTO) => {
      if (!estimateId) return null;

      const result = await createLineItem(estimateId, data);
      if (result) {
        await refetch();
      }
      return result;
    },
    [estimateId, createLineItem, refetch]
  );

  // Enhanced update with auto-refetch
  const updateAndRefresh = useCallback(
    async (lineItemId: string, data: UpdateEstimateLineItemDTO) => {
      if (!estimateId) return null;

      const result = await updateLineItem(estimateId, lineItemId, data);
      if (result) {
        await refetch();
      }
      return result;
    },
    [estimateId, updateLineItem, refetch]
  );

  // Enhanced delete with auto-refetch
  const deleteAndRefresh = useCallback(
    async (lineItemId: string) => {
      if (!estimateId) return false;

      const success = await deleteLineItem(estimateId, lineItemId);
      if (success) {
        await refetch();
      }
      return success;
    },
    [estimateId, deleteLineItem, refetch]
  );

  // Enhanced reorder with auto-refetch
  const reorderAndRefresh = useCallback(
    async (orderedIds: string[]) => {
      if (!estimateId) return null;

      const result = await reorderLineItems(estimateId, orderedIds);
      if (result) {
        await refetch();
      }
      return result;
    },
    [estimateId, reorderLineItems, refetch]
  );

  return {
    // Data
    lineItems,
    loading,
    error,

    // Actions with auto-refresh
    createLineItem: createAndRefresh,
    updateLineItem: updateAndRefresh,
    deleteLineItem: deleteAndRefresh,
    reorderLineItems: reorderAndRefresh,

    // Manual refresh
    refetch,
  };
}
