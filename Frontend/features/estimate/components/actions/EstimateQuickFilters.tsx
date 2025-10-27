// ============================================================================
// ESTIMATE QUICK FILTERS COMPONENT
// ============================================================================
// Quick filter buttons for common estimate status filters
// ============================================================================

import React from "react";
import { Button } from "@/components/ui/Button";
import { EstimateStatus } from "../../types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateQuickFiltersProps {
  activeFilter: EstimateStatus[];
  onFilterChange: (status: EstimateStatus[]) => void;
  counts?: Record<string, number>;
  className?: string;
}

interface QuickFilter {
  label: string;
  value: EstimateStatus[];
  color?: string;
}

// ============================================================================
// FILTER CONFIGURATION
// ============================================================================

const QUICK_FILTERS: QuickFilter[] = [
  { label: "All", value: [] },
  { label: "Draft", value: [EstimateStatus.DRAFT], color: "text-gray-600" },
  { label: "Sent", value: [EstimateStatus.SENT], color: "text-blue-600" },
  {
    label: "Approved",
    value: [EstimateStatus.APPROVED, EstimateStatus.CLIENT_APPROVED],
    color: "text-green-600",
  },
  {
    label: "Pending",
    value: [EstimateStatus.SENT, EstimateStatus.VIEWED],
    color: "text-orange-600",
  },
  {
    label: "Converted",
    value: [EstimateStatus.CONVERTED],
    color: "text-indigo-600",
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateQuickFilters({
  activeFilter,
  onFilterChange,
  counts,
  className = "",
}: EstimateQuickFiltersProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isActiveFilter = (filterValue: EstimateStatus[]) => {
    if (filterValue.length === 0 && activeFilter.length === 0) return true;
    if (filterValue.length !== activeFilter.length) return false;
    return filterValue.every((status) => activeFilter.includes(status));
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFilterClick = (filterValue: EstimateStatus[]) => {
    onFilterChange(filterValue);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderFilterButton = (filter: QuickFilter) => {
    const isActive = isActiveFilter(filter.value);
    const count = counts?.[filter.label.toLowerCase()];

    return (
      <Button
        key={filter.label}
        variant="ghost"
        size="sm"
        onClick={() => handleFilterClick(filter.value)}
        className={`
          neomorphic-button transition-all duration-200
          ${isActive ? "neomorphic-primary" : ""}
          ${filter.color ? `hover:${filter.color}` : ""}
        `}
      >
        <span className={isActive ? "text-primary font-medium" : ""}>
          {filter.label}
        </span>
        {count !== undefined && (
          <span
            className={`
            ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-medium
            ${
              isActive
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }
          `}
          >
            {count}
          </span>
        )}
      </Button>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {QUICK_FILTERS.map(renderFilterButton)}
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Compact quick filters for smaller spaces
 */
export function EstimateQuickFiltersCompact({
  activeFilter,
  onFilterChange,
  className,
}: {
  activeFilter: EstimateStatus[];
  onFilterChange: (status: EstimateStatus[]) => void;
  className?: string;
}) {
  const compactFilters = QUICK_FILTERS.slice(0, 4); // Show only first 4 filters

  return (
    <div className={`flex gap-1 ${className}`}>
      {compactFilters.map((filter) => (
        <Button
          key={filter.label}
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className={`
            neomorphic-button px-2 py-1 text-xs
            ${JSON.stringify(activeFilter) === JSON.stringify(filter.value) ? "neomorphic-primary" : ""}
          `}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

/**
 * Pills-style filters
 */
export function EstimateQuickFiltersPills({
  activeFilter,
  onFilterChange,
  className,
}: {
  activeFilter: EstimateStatus[];
  onFilterChange: (status: EstimateStatus[]) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {QUICK_FILTERS.map((filter) => {
        const isActive =
          JSON.stringify(activeFilter) === JSON.stringify(filter.value);

        return (
          <button
            key={filter.label}
            onClick={() => onFilterChange(filter.value)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }
            `}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

export default EstimateQuickFilters;
