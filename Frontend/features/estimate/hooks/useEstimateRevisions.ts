// ============================================================================
// ESTIMATE REVISION HOOKS
// ============================================================================
// React hooks for estimate revision operations
// ============================================================================

import { useState, useCallback } from "react";
import { EstimateRevisionApiService } from "../services";
import { EstimateRevisionEntity } from "../types";

// ============================================================================
// REVISION QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch revisions for an estimate
 */
export function useEstimateRevisions(estimateId: string | null) {
  const [data, setData] = useState<EstimateRevisionEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevisions = useCallback(async () => {
    if (!estimateId) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const revisions =
        await EstimateRevisionApiService.listByEstimate(estimateId);
      setData(revisions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch revisions"
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
    refetch: fetchRevisions,
  };
}

/**
 * Hook to fetch a single revision by ID
 */
export function useEstimateRevision(
  estimateId: string | null,
  revisionId: string | null
) {
  const [data, setData] = useState<EstimateRevisionEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevision = useCallback(async () => {
    if (!estimateId || !revisionId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const revision = await EstimateRevisionApiService.getById(
        estimateId,
        revisionId
      );
      setData(revision);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch revision");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [estimateId, revisionId]);

  return {
    data,
    loading,
    error,
    refetch: fetchRevision,
  };
}

// ============================================================================
// REVISION COMPARISON HOOKS
// ============================================================================

/**
 * Hook to compare two revisions
 */
export function useRevisionComparison() {
  const [data, setData] = useState<{
    differences: Array<{
      field: string;
      oldValue: unknown;
      newValue: unknown;
      changeType: "added" | "modified" | "removed";
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compareRevisions = useCallback(
    async (estimateId: string, revision1Id: string, revision2Id: string) => {
      setLoading(true);
      setError(null);

      try {
        const comparison = await EstimateRevisionApiService.compare(
          estimateId,
          revision1Id,
          revision2Id
        );
        setData(comparison);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to compare revisions"
        );
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    loading,
    error,
    compareRevisions,
  };
}

// ============================================================================
// REVISION OPERATIONS HOOKS
// ============================================================================

/**
 * Hook to create a manual revision
 */
export function useCreateRevision() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRevision = useCallback(
    async (
      estimateId: string,
      data: { reason?: string; notes?: string }
    ): Promise<EstimateRevisionEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const revision = await EstimateRevisionApiService.create(
          estimateId,
          data
        );
        return revision;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create revision"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createRevision,
    loading,
    error,
  };
}

/**
 * Hook to restore to a specific revision
 */
export function useRestoreRevision() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restoreRevision = useCallback(
    async (
      estimateId: string,
      revisionId: string
    ): Promise<EstimateRevisionEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const revision = await EstimateRevisionApiService.restore(
          estimateId,
          revisionId
        );
        return revision;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to restore revision"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    restoreRevision,
    loading,
    error,
  };
}

// ============================================================================
// COMBINED REVISION MANAGEMENT HOOK
// ============================================================================

/**
 * Hook that combines all revision functionality
 * Useful for revision management interfaces
 */
export function useRevisionManager(estimateId: string | null) {
  const {
    data: revisions,
    loading: fetchLoading,
    error: fetchError,
    refetch,
  } = useEstimateRevisions(estimateId);

  const {
    createRevision,
    loading: createLoading,
    error: createError,
  } = useCreateRevision();

  const {
    restoreRevision,
    loading: restoreLoading,
    error: restoreError,
  } = useRestoreRevision();

  const {
    data: comparison,
    loading: compareLoading,
    error: compareError,
    compareRevisions,
  } = useRevisionComparison();

  // Combined loading state
  const loading =
    fetchLoading || createLoading || restoreLoading || compareLoading;

  // Combined error state
  const error = fetchError || createError || restoreError || compareError;

  // Enhanced create with auto-refetch
  const createAndRefresh = useCallback(
    async (data: { reason?: string; notes?: string }) => {
      if (!estimateId) return null;

      const result = await createRevision(estimateId, data);
      if (result) {
        await refetch();
      }
      return result;
    },
    [estimateId, createRevision, refetch]
  );

  // Enhanced restore with auto-refetch
  const restoreAndRefresh = useCallback(
    async (revisionId: string) => {
      if (!estimateId) return null;

      const result = await restoreRevision(estimateId, revisionId);
      if (result) {
        await refetch();
      }
      return result;
    },
    [estimateId, restoreRevision, refetch]
  );

  // Helper to get latest revision
  const latestRevision =
    revisions.length > 0
      ? revisions.reduce((latest, current) =>
          current.revisionNumber > latest.revisionNumber ? current : latest
        )
      : null;

  // Helper to get revision history sorted by number
  const sortedRevisions = [...revisions].sort(
    (a, b) => b.revisionNumber - a.revisionNumber
  );

  return {
    // Data
    revisions,
    sortedRevisions,
    latestRevision,
    comparison,
    loading,
    error,

    // Actions with auto-refresh
    createRevision: createAndRefresh,
    restoreRevision: restoreAndRefresh,
    compareRevisions,

    // Manual refresh
    refetch,
  };
}
