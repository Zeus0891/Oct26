// ============================================================================
// ESTIMATE FILTERS BAR COMPONENT
// ============================================================================
// Comprehensive filters bar with search, quick filters, and export options
// ============================================================================

import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Search,
  Filter,
  Download,
  X,
  Calendar,
  DollarSign,
} from "lucide-react";
import { EstimateStatus } from "../../types";
import { EstimateQuickFilters } from "../actions/EstimateQuickFilters";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FilterState {
  search: string;
  status: EstimateStatus[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface EstimateFiltersBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onExport?: (format: "csv" | "pdf" | "excel") => void;
  exportLoading?: boolean;
  totalCount?: number;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateFiltersBar({
  filters,
  onFiltersChange,
  onExport,
  exportLoading = false,
  totalCount = 0,
  className = "",
}: EstimateFiltersBarProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasActiveFilters =
    filters.search ||
    filters.status.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.minAmount ||
    filters.maxAmount;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (status: EstimateStatus[]) => {
    onFiltersChange({ ...filters, status });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      status: [],
      dateFrom: undefined,
      dateTo: undefined,
      minAmount: undefined,
      maxAmount: undefined,
    });
  };

  const handleExport = (format: "csv" | "pdf" | "excel") => {
    onExport?.(format);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSearchInput = () => (
    <div className="flex-1 max-w-lg">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder="Search estimates..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="neomorphic-input pl-12 h-12"
        />
        {filters.search && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  const renderQuickFilters = () => (
    <EstimateQuickFilters
      activeFilter={filters.status}
      onFilterChange={handleStatusChange}
    />
  );

  const renderAdvancedFilters = () => (
    <div className="flex items-center space-x-3">
      {/* Date Range Filter */}
      <div className="flex items-center space-x-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <Input
          type="date"
          placeholder="From"
          value={filters.dateFrom || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              dateFrom: e.target.value || undefined,
            })
          }
          className="neomorphic-input w-32 text-sm"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <Input
          type="date"
          placeholder="To"
          value={filters.dateTo || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, dateTo: e.target.value || undefined })
          }
          className="neomorphic-input w-32 text-sm"
        />
      </div>

      {/* Amount Range Filter */}
      <div className="flex items-center space-x-2">
        <DollarSign className="w-4 h-4 text-muted-foreground" />
        <Input
          type="number"
          placeholder="Min amount"
          value={filters.minAmount || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              minAmount: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="neomorphic-input w-28 text-sm"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <Input
          type="number"
          placeholder="Max amount"
          value={filters.maxAmount || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              maxAmount: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="neomorphic-input w-28 text-sm"
        />
      </div>
    </div>
  );

  const renderExportOptions = () => {
    if (!onExport) return null;

    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleExport("csv")}
          disabled={exportLoading}
          className="neomorphic-button"
        >
          <Download className="w-4 h-4 mr-2" />
          CSV
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleExport("pdf")}
          disabled={exportLoading}
          className="neomorphic-button"
        >
          <Download className="w-4 h-4 mr-2" />
          PDF
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleExport("excel")}
          disabled={exportLoading}
          className="neomorphic-button"
        >
          <Download className="w-4 h-4 mr-2" />
          Excel
        </Button>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`neomorphic-card p-6 space-y-4 ${className}`}>
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        {renderSearchInput()}
        {renderQuickFilters()}

        <div className="flex items-center space-x-2">
          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="neomorphic-button text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}

          {/* Export Options */}
          {renderExportOptions()}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="border-t border-border/50 pt-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {renderAdvancedFilters()}

          {/* Results Summary */}
          <div className="text-sm text-muted-foreground">
            {totalCount} estimate{totalCount !== 1 ? "s" : ""} found
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Filtered
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Compact filters bar for smaller spaces
 */
export function EstimateFiltersBarCompact({
  filters,
  onFiltersChange,
  onExport,
  className,
}: {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onExport?: (format: "csv" | "pdf" | "excel") => void;
  className?: string;
}) {
  return (
    <div className={`neomorphic-card p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              className="neomorphic-input pl-10 h-10 text-sm"
            />
          </div>
        </div>

        <Button variant="ghost" size="sm" className="neomorphic-button">
          <Filter className="w-4 h-4" />
        </Button>

        {onExport && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExport("csv")}
            className="neomorphic-button"
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Simple search-only filter
 */
export function EstimateFiltersBarSimple({
  search,
  onSearchChange,
  placeholder = "Search estimates...",
  className,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="neomorphic-input pl-10"
      />
      {search && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default EstimateFiltersBar;
