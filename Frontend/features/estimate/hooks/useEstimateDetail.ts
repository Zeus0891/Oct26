// ============================================================================
// ESTIMATE DETAIL HOOK
// ============================================================================
// Combined hook for complete estimate management - includes all related data
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useEstimate } from "./useEstimate";
import { useEstimateLineItemsManager } from "./useEstimateLineItems";
import { useRevisionManager } from "./useEstimateRevisions";
import {
  useSubmitEstimate,
  useApproveEstimate,
  useRejectEstimate,
  useDuplicateEstimate,
  useConvertEstimateToProject,
} from "./useEstimate";
import {
  EstimateEntity,
  EstimateLineItemEntity,
  EstimateRevisionEntity,
} from "../types";

export interface EstimateDetailState {
  estimate: EstimateEntity | null;
  loading: boolean;
  error: string | null;

  // Sub-entities
  lineItems: EstimateLineItemEntity[];
  revisions: EstimateRevisionEntity[];

  // Actions available based on current state
  availableActions: EstimateAction[];
}

export interface EstimateAction {
  key: string;
  label: string;
  variant: "primary" | "secondary" | "success" | "warning" | "danger";
  disabled: boolean;
  loading: boolean;
  onClick: () => Promise<void>;
}

/**
 * Comprehensive hook for estimate detail management
 * Combines all estimate-related functionality
 */
export function useEstimateDetail(estimateId: string | null) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Core estimate data
  const {
    data: estimate,
    loading: estimateLoading,
    error: estimateError,
    refetch: refetchEstimate,
  } = useEstimate(estimateId);

  // Line items management
  const {
    lineItems,
    loading: lineItemsLoading,
    error: lineItemsError,
    createLineItem,
    updateLineItem,
    deleteLineItem,
    reorderLineItems,
    refetch: refetchLineItems,
  } = useEstimateLineItemsManager(estimateId);

  // Revisions management
  const {
    revisions,
    latestRevision,
    loading: revisionsLoading,
    error: revisionsError,
    createRevision,
    restoreRevision,
    compareRevisions,
    refetch: refetchRevisions,
  } = useRevisionManager(estimateId);

  // State transition hooks
  const {
    submitEstimate,
    loading: submitLoading,
    error: submitError,
  } = useSubmitEstimate();

  const {
    approveEstimate,
    loading: approveLoading,
    error: approveError,
  } = useApproveEstimate();

  const {
    rejectEstimate,
    loading: rejectLoading,
    error: rejectError,
  } = useRejectEstimate();

  const {
    duplicateEstimate,
    loading: duplicateLoading,
    error: duplicateError,
  } = useDuplicateEstimate();

  const {
    convertToProject,
    loading: convertLoading,
    error: convertError,
  } = useConvertEstimateToProject();

  // Combined loading and error states
  const loading =
    estimateLoading ||
    lineItemsLoading ||
    revisionsLoading ||
    submitLoading ||
    approveLoading ||
    rejectLoading ||
    duplicateLoading ||
    convertLoading;

  const error =
    estimateError ||
    lineItemsError ||
    revisionsError ||
    submitError ||
    approveError ||
    rejectError ||
    duplicateError ||
    convertError;

  // Auto-fetch related data when estimate changes
  useEffect(() => {
    if (estimateId && estimate) {
      refetchLineItems();
      refetchRevisions();
    }
  }, [estimateId, estimate, refetchLineItems, refetchRevisions]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refetchEstimate(),
      refetchLineItems(),
      refetchRevisions(),
    ]);
  }, [refetchEstimate, refetchLineItems, refetchRevisions]);

  // Enhanced actions with refresh
  const submitAndRefresh = useCallback(async (): Promise<void> => {
    if (!estimateId) return;

    const result = await submitEstimate(estimateId);
    if (result) {
      await refreshAll();
    }
  }, [estimateId, submitEstimate, refreshAll]);

  const approveAndRefresh = useCallback(
    async (reason?: string): Promise<void> => {
      if (!estimateId) return;

      const result = await approveEstimate(estimateId, reason);
      if (result) {
        await refreshAll();
      }
    },
    [estimateId, approveEstimate, refreshAll]
  );

  const rejectAndRefresh = useCallback(
    async (reason: string): Promise<void> => {
      if (!estimateId) return;

      const result = await rejectEstimate(estimateId, reason);
      if (result) {
        await refreshAll();
      }
    },
    [estimateId, rejectEstimate, refreshAll]
  );

  const duplicateAndRefresh =
    useCallback(async (): Promise<EstimateEntity | null> => {
      if (!estimateId) return null;

      const result = await duplicateEstimate(estimateId);
      if (result) {
        // Don't refresh current, return new estimate
      }
      return result;
    }, [estimateId, duplicateEstimate]);

  const convertAndRefresh = useCallback(async (): Promise<string | null> => {
    if (!estimateId) return null;

    const projectId = await convertToProject(estimateId);
    if (projectId) {
      await refreshAll();
    }
    return projectId;
  }, [estimateId, convertToProject, refreshAll]);

  // Determine available actions based on current state
  const availableActions: EstimateAction[] = [];

  if (estimate) {
    switch (estimate.status) {
      case "DRAFT":
        availableActions.push(
          {
            key: "submit",
            label: "Submit for Approval",
            variant: "primary",
            disabled: lineItems.length === 0,
            loading: submitLoading,
            onClick: submitAndRefresh,
          },
          {
            key: "duplicate",
            label: "Duplicate",
            variant: "secondary",
            disabled: false,
            loading: duplicateLoading,
            onClick: async () => {
              await duplicateAndRefresh();
            },
          }
        );
        break;

      case "SENT":
        availableActions.push(
          {
            key: "approve",
            label: "Approve",
            variant: "success",
            disabled: false,
            loading: approveLoading,
            onClick: async () => {
              await approveAndRefresh();
            },
          },
          {
            key: "reject",
            label: "Reject",
            variant: "danger",
            disabled: false,
            loading: rejectLoading,
            onClick: async () => {
              await rejectAndRefresh("Rejected by user");
            },
          }
        );
        break;

      case "APPROVED":
        availableActions.push(
          {
            key: "convert",
            label: "Convert to Project",
            variant: "success",
            disabled: false,
            loading: convertLoading,
            onClick: async () => {
              await convertAndRefresh();
            },
          },
          {
            key: "duplicate",
            label: "Duplicate",
            variant: "secondary",
            disabled: false,
            loading: duplicateLoading,
            onClick: async () => {
              await duplicateAndRefresh();
            },
          }
        );
        break;
    }
  }

  // Calculate totals (could be moved to a separate hook)
  const totals = lineItems.reduce(
    (
      acc: { subtotal: number; totalItems: number },
      item: EstimateLineItemEntity
    ) => ({
      subtotal: acc.subtotal + Number(item.quantity) * Number(item.unitPrice),
      totalItems: acc.totalItems + 1,
    }),
    { subtotal: 0, totalItems: 0 }
  );

  return {
    // Core data
    estimate,
    lineItems,
    revisions,
    latestRevision,
    totals,

    // UI state
    activeTab,
    setActiveTab,
    availableActions,

    // Loading and error states
    loading,
    error,

    // Line item operations
    createLineItem,
    updateLineItem,
    deleteLineItem,
    reorderLineItems,

    // Revision operations
    createRevision,
    restoreRevision,
    compareRevisions,

    // State transitions
    submitEstimate: submitAndRefresh,
    approveEstimate: approveAndRefresh,
    rejectEstimate: rejectAndRefresh,
    duplicateEstimate: duplicateAndRefresh,
    convertToProject: convertAndRefresh,

    // Manual refresh
    refreshAll,
  };
}

export default useEstimateDetail;
