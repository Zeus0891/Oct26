// ============================================================================
// ESTIMATE TABLE HEADER COMPONENT
// ============================================================================
// Table header with selection, sorting and column management
// ============================================================================

import React from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  allSelected?: boolean;
  onSelectAll?: () => void;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  showSelection?: boolean;
  className?: string;
}

interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

// ============================================================================
// COLUMN CONFIGURATION
// ============================================================================

const COLUMNS: ColumnConfig[] = [
  {
    key: "estimate",
    label: "Estimate",
    sortable: true,
    width: "col-span-3",
    align: "left",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    width: "col-span-2",
    align: "left",
  },
  {
    key: "amount",
    label: "Amount",
    sortable: true,
    width: "col-span-2",
    align: "right",
  },
  {
    key: "createdAt",
    label: "Created",
    sortable: true,
    width: "col-span-2",
    align: "left",
  },
  {
    key: "validUntil",
    label: "Valid Until",
    sortable: true,
    width: "col-span-2",
    align: "left",
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    width: "col-span-1",
    align: "center",
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateTableHeader({
  selectedCount,
  totalCount,
  allSelected = false,
  onSelectAll,
  sortField,
  sortOrder,
  onSort,
  showSelection = false,
  className = "",
}: EstimateTableHeaderProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasSelection = selectedCount > 0;
  const isIndeterminate = hasSelection && !allSelected;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSort = (field: string) => {
    onSort?.(field);
  };

  const handleSelectAll = () => {
    onSelectAll?.();
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSortIcon = (columnKey: string) => {
    if (!onSort) return null;

    const isActive = sortField === columnKey;

    if (!isActive) {
      return <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />;
    }

    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 text-primary" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary" />
    );
  };

  const renderColumnHeader = (column: ColumnConfig) => {
    const isActive = sortField === column.key;
    const canSort = column.sortable && onSort;

    const alignClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[column.align || "left"];

    return (
      <div
        key={column.key}
        className={`
          ${column.width} ${alignClass}
          ${canSort ? "cursor-pointer hover:text-foreground" : ""}
          ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}
          transition-colors duration-150
        `}
        onClick={canSort ? () => handleSort(column.key) : undefined}
      >
        <div className="flex items-center space-x-1 justify-start">
          <span className="text-sm font-medium">{column.label}</span>
          {canSort && renderSortIcon(column.key)}
        </div>
      </div>
    );
  };

  const renderSelectionCheckbox = () => {
    if (!showSelection || !onSelectAll) return null;

    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={allSelected}
          ref={(input) => {
            if (input) input.indeterminate = isIndeterminate;
          }}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
        />
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`neomorphic-inset rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Selection */}
        {showSelection && renderSelectionCheckbox()}

        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-4 w-full items-center">
          {COLUMNS.map(renderColumnHeader)}
        </div>
      </div>

      {/* Selection Summary */}
      {hasSelection && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-primary font-medium">
              {selectedCount} of {totalCount} estimates selected
            </span>

            <button
              onClick={() => onSelectAll?.()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Compact table header for smaller containers
 */
export function EstimateTableHeaderCompact({
  selectedCount,
  totalCount,
  onSelectAll,
  className,
}: {
  selectedCount: number;
  totalCount: number;
  onSelectAll?: () => void;
  className?: string;
}) {
  const hasSelection = selectedCount > 0;
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div
      className={`flex items-center justify-between p-3 border-b border-border/50 ${className}`}
    >
      <div className="flex items-center space-x-3">
        {onSelectAll && (
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = hasSelection && !allSelected;
            }}
            onChange={onSelectAll}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
        )}
        <span className="text-sm text-muted-foreground">
          {hasSelection
            ? `${selectedCount} selected`
            : `${totalCount} estimates`}
        </span>
      </div>

      {hasSelection && (
        <button
          onClick={onSelectAll}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      )}
    </div>
  );
}

/**
 * Simple header without sorting
 */
export function EstimateTableHeaderSimple({
  columns,
  className,
}: {
  columns: string[];
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-${columns.length} gap-4 p-3 border-b border-border/50 ${className}`}
    >
      {columns.map((column, index) => (
        <div key={index} className="text-sm font-medium text-muted-foreground">
          {column}
        </div>
      ))}
    </div>
  );
}

export default EstimateTableHeader;
