// ============================================================================
// ESTIMATE COMPONENTS - BARREL EXPORTS
// ============================================================================
// Central export file for all estimate components
// ============================================================================

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================
export { EstimateScreenHeader } from "./layout/EstimateScreenHeader";
export { EstimateStatsGrid } from "./layout/EstimateStatsGrid";
export { EstimateFiltersBar } from "./layout/EstimateFiltersBar";

// ============================================================================
// DISPLAY COMPONENTS
// ============================================================================
export { EstimateCard } from "./display/EstimateCard";
export { EstimateList } from "./display/EstimateList";
export { EstimateStatusBadge } from "./display/EstimateStatusBadge";
export { EstimateTableHeader } from "./display/EstimateTableHeader";

// ============================================================================
// STATE COMPONENTS
// ============================================================================
export { EstimateEmptyState } from "./states/EstimateEmptyState";
export { EstimateErrorState } from "./states/EstimateErrorState";
export { EstimateLoadingState } from "./states/EstimateLoadingState";

// ============================================================================
// ACTION COMPONENTS
// ============================================================================
export { EstimateQuickFilters } from "./actions/EstimateQuickFilters";
export { EstimateBulkActions } from "./actions/EstimateBulkActions";
export { EstimateActionsMenu } from "./actions/EstimateActionsMenu";

// ============================================================================
// COMMON COMPONENTS
// ============================================================================
export { EstimateSearchInput } from "./common/EstimateSearchInput";
export { ViewModeToggle } from "./common/ViewModeToggle";

// ============================================================================
// RE-EXPORT SPECIALIZED VARIANTS
// ============================================================================

// Status Badge variants
export {
  EstimateStatusBadgeCompact,
  EstimateStatusBadgeWithTooltip,
  getStatusConfig,
  getStatusColorClass,
  getStatusIcon,
} from "./display/EstimateStatusBadge";

// Card variants
export { EstimateCardCompact } from "./display/EstimateCard";

// List variants
export {
  EstimateListCompact,
  EstimateListSimple,
} from "./display/EstimateList";

// Empty State variants
export {
  EstimateEmptyStateSimple,
  EstimateEmptyStateInline,
} from "./states/EstimateEmptyState";

// Error State variants
export {
  EstimateErrorStateInline,
  EstimateErrorStateCompact,
} from "./states/EstimateErrorState";

// Loading State variants
export {
  EstimateLoadingStateList,
  EstimateLoadingStateGrid,
  EstimateLoadingStateCompact,
  EstimateLoadingOverlay,
} from "./states/EstimateLoadingState";

// Stats Grid variants
export {
  EstimateStatsGridCompact,
  EstimateStatsGridDetailed,
  EstimateStatsRow,
} from "./layout/EstimateStatsGrid";

// Header variants
export {
  EstimateScreenHeaderCompact,
  EstimateScreenHeaderMobile,
} from "./layout/EstimateScreenHeader";

// Filter variants
export {
  EstimateFiltersBarCompact,
  EstimateFiltersBarSimple,
} from "./layout/EstimateFiltersBar";

// Quick Filter variants
export {
  EstimateQuickFiltersCompact,
  EstimateQuickFiltersPills,
} from "./actions/EstimateQuickFilters";

// Search Input variants
export {
  EstimateSearchInputSimple,
  EstimateSearchInputCompact,
} from "./common/EstimateSearchInput";

// Table Header variants
export {
  EstimateTableHeaderCompact,
  EstimateTableHeaderSimple,
} from "./display/EstimateTableHeader";

// ============================================================================
// TYPE EXPORTS
// ============================================================================
// Export commonly used types and interfaces for external use

export type { EstimateEntity, EstimateStatus } from "../types";

// ============================================================================
// UTILITY EXPORTS
// ============================================================================
// Export utility functions that might be useful externally

export { getStatusConfig as getEstimateStatusConfig } from "./display/EstimateStatusBadge";
