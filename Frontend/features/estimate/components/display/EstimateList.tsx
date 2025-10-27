// ============================================================================
// ESTIMATE LIST COMPONENT
// ============================================================================
// Container component for displaying estimates in grid or list view
// ============================================================================

import React from "react";
import { EstimateEntity } from "../../types";
import { EstimateCard } from "./EstimateCard";
import { EstimateTableHeader } from "./EstimateTableHeader";
import { EstimateEmptyState } from "../states/EstimateEmptyState";
import { EstimateLoadingState } from "../states/EstimateLoadingState";
import { EstimateErrorState } from "../states/EstimateErrorState";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateListProps {
  estimates: EstimateEntity[];
  viewMode: "grid" | "list";
  isLoading?: boolean;
  error?: string | null;
  selectedIds?: string[];
  hasFilters?: boolean;
  searchTerm?: string;
  onSelectEstimate?: (id: string) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onClearFilters?: () => void;
  onRetry?: () => void;
  onCreateNew?: () => void;
  className?: string;
  showSelection?: boolean;
  showTableHeader?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateList({
  estimates,
  viewMode,
  isLoading = false,
  error = null,
  selectedIds = [],
  hasFilters = false,
  searchTerm = "",
  onSelectEstimate,
  onSelectAll,
  onClearSelection,
  onClearFilters,
  onRetry,
  onCreateNew,
  className = "",
  showSelection = false,
  showTableHeader = true,
}: EstimateListProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasEstimates = estimates.length > 0;
  const hasSelectedItems = selectedIds.length > 0;
  const allSelected = hasEstimates && selectedIds.length === estimates.length;
  const hasSearchOrFilters = hasFilters || searchTerm.length > 0;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSelectAll = () => {
    if (allSelected) {
      onClearSelection?.();
    } else {
      onSelectAll?.();
    }
  };

  const handleEstimateSelect = (id: string) => {
    onSelectEstimate?.(id);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderTableHeader = () => {
    if (!showTableHeader || viewMode !== "list" || !hasEstimates) {
      return null;
    }

    return (
      <EstimateTableHeader
        selectedCount={selectedIds.length}
        totalCount={estimates.length}
        allSelected={allSelected}
        onSelectAll={handleSelectAll}
        showSelection={showSelection}
      />
    );
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {estimates.map((estimate) => (
        <EstimateCard
          key={estimate.id}
          estimate={estimate}
          viewMode="grid"
          isSelected={selectedIds.includes(estimate.id)}
          onSelect={showSelection ? handleEstimateSelect : undefined}
          showSelection={showSelection}
          className="h-full"
        />
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {renderTableHeader()}
      <div className="space-y-2">
        {estimates.map((estimate) => (
          <EstimateCard
            key={estimate.id}
            estimate={estimate}
            viewMode="list"
            isSelected={selectedIds.includes(estimate.id)}
            onSelect={showSelection ? handleEstimateSelect : undefined}
            showSelection={showSelection}
          />
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    // Loading state
    if (isLoading) {
      return <EstimateLoadingState />;
    }

    // Error state
    if (error) {
      return <EstimateErrorState error={error} onRetry={onRetry} />;
    }

    // Empty state
    if (!hasEstimates) {
      return (
        <EstimateEmptyState
          type={hasSearchOrFilters ? "no-results" : "no-estimates"}
          hasFilters={hasFilters}
          searchTerm={searchTerm}
          onCreateNew={onCreateNew}
          onClearFilters={onClearFilters}
        />
      );
    }

    // Render estimates based on view mode
    return viewMode === "grid" ? renderGridView() : renderListView();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Selection Summary */}
      {hasSelectedItems && (
        <div className="neomorphic-card p-4 border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-primary">
                {selectedIds.length} estimate
                {selectedIds.length !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={onClearSelection}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear selection
              </button>
            </div>

            {/* Quick actions for selected items */}
            <div className="flex items-center space-x-2">
              <button className="neomorphic-button px-3 py-1 text-sm">
                Export Selected
              </button>
              <button className="neomorphic-button px-3 py-1 text-sm">
                Archive Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List Content */}
      <div className="neomorphic-card">
        {hasEstimates && (
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {hasSearchOrFilters ? "Search Results" : "Recent Estimates"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {estimates.length} estimate{estimates.length !== 1 ? "s" : ""}{" "}
                  found
                </p>
              </div>

              {hasSearchOrFilters && (
                <button
                  onClick={onClearFilters}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        <div className={hasEstimates ? "p-6" : ""}>{renderContent()}</div>
      </div>
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Compact list for sidebars or small containers
 */
export function EstimateListCompact({
  estimates,
  onView,
  className,
}: {
  estimates: EstimateEntity[];
  onView?: (id: string) => void;
  className?: string;
}) {
  if (estimates.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-sm text-muted-foreground">No estimates</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {estimates.map((estimate) => (
        <div
          key={estimate.id}
          className="neomorphic-button p-3 hover:scale-[1.01] transition-all duration-200 cursor-pointer"
          onClick={() => onView?.(estimate.id)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm text-foreground truncate">
              {estimate.estimateNumber || estimate.id.slice(0, 8)}
            </span>
            <span className="text-xs text-green-600 font-medium">
              ${Number(estimate.grandTotal || 0).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {estimate.name}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Simple list without container styling
 */
export function EstimateListSimple({
  estimates,
  viewMode = "grid",
  className,
}: {
  estimates: EstimateEntity[];
  viewMode?: "grid" | "list";
  className?: string;
}) {
  if (estimates.length === 0) {
    return null;
  }

  const containerClass =
    viewMode === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      : "space-y-2";

  return (
    <div className={`${containerClass} ${className}`}>
      {estimates.map((estimate) => (
        <EstimateCard
          key={estimate.id}
          estimate={estimate}
          viewMode={viewMode}
          showActions={false}
          className="hover:scale-[1.01]"
        />
      ))}
    </div>
  );
}

export default EstimateList;
