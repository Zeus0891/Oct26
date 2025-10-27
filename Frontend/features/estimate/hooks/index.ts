// ============================================================================
// ESTIMATE HOOKS INDEX
// ============================================================================
// Central export point for all estimate hooks
// ============================================================================

// Main estimate hooks
export * from "./useEstimate";
export * from "./useEstimateLineItems";
export * from "./useBid";
export * from "./useEstimateRevisions";

// Combined/composite hooks
export * from "./useEstimateDetail";

// Re-export for convenience
export { useEstimate as useEstimateById } from "./useEstimate";
export { useEstimates as useEstimatesList } from "./useEstimate";
export { useEstimateLineItems as useLineItemsList } from "./useEstimateLineItems";
export { useBids as useBidsList } from "./useBid";
export { useEstimateRevisions as useRevisionsList } from "./useEstimateRevisions";

// Default exports
export { default as useEstimateDetail } from "./useEstimateDetail";
