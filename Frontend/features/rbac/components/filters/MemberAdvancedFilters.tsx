/**
 * MemberAdvancedFilters - Enterprise member filtering system
 * Advanced filtering capabilities aligned with backend search functionality
 */

"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Filter, X, Calendar, Search, RotateCcw, Save } from "lucide-react";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface MemberFilterOptions {
  status: string[];
  roles: string[];
  departments: string[];
  joinDateRange: {
    from?: Date;
    to?: Date;
  };
  lastAccessRange: {
    from?: Date;
    to?: Date;
  };
  searchQuery: string;
  tags: string[];
  includeInactive: boolean;
}

interface MemberAdvancedFiltersProps {
  isOpen: boolean;
  filters: MemberFilterOptions;
  onFiltersChange: (filters: MemberFilterOptions) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

const DEFAULT_FILTERS: MemberFilterOptions = {
  status: [],
  roles: [],
  departments: [],
  joinDateRange: {},
  lastAccessRange: {},
  searchQuery: "",
  tags: [],
  includeInactive: false,
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
  {
    value: "suspended",
    label: "Suspended",
    color: "bg-yellow-100 text-yellow-800",
  },
  { value: "pending", label: "Pending", color: "bg-blue-100 text-blue-800" },
  {
    value: "terminated",
    label: "Terminated",
    color: "bg-red-100 text-red-800",
  },
];

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrator" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "ESTIMATOR", label: "Estimator" },
  { value: "FIELD_SUPERVISOR", label: "Field Supervisor" },
  { value: "WORKER", label: "Worker" },
  { value: "VIEWER", label: "Viewer" },
];

const DEPARTMENT_OPTIONS = [
  { value: "IT", label: "Information Technology" },
  { value: "Operations", label: "Operations" },
  { value: "Field", label: "Field Operations" },
  { value: "Finance", label: "Finance & Accounting" },
  { value: "HR", label: "Human Resources" },
  { value: "Sales", label: "Sales & Marketing" },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MemberAdvancedFilters({
  isOpen,
  filters,
  onFiltersChange,
  onClose,
  onApply,
  onClear,
}: MemberAdvancedFiltersProps) {
  const [localFilters, setLocalFilters] =
    useState<MemberFilterOptions>(filters);
  const [savedFilters, setSavedFilters] = useState<
    { name: string; filters: MemberFilterOptions }[]
  >([]);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const hasActiveFilters = Object.values(localFilters).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some((v) => v !== undefined);
    }
    if (typeof value === "string") return value.trim() !== "";
    if (typeof value === "boolean") return value;
    return false;
  });

  const filterCount = [
    localFilters.status.length,
    localFilters.roles.length,
    localFilters.departments.length,
    localFilters.tags.length,
    localFilters.searchQuery ? 1 : 0,
    Object.keys(localFilters.joinDateRange).length,
    Object.keys(localFilters.lastAccessRange).length,
  ].reduce((sum, count) => sum + count, 0);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const updateFilters = useCallback((updates: Partial<MemberFilterOptions>) => {
    setLocalFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
  };

  const handleClear = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onFiltersChange(DEFAULT_FILTERS);
    onClear();
  };

  const handleSaveFilter = () => {
    const name = prompt("Enter a name for this filter preset:");
    if (name?.trim()) {
      setSavedFilters((prev) => [
        ...prev,
        { name: name.trim(), filters: localFilters },
      ]);
    }
  };

  const loadSavedFilter = (filterPreset: {
    name: string;
    filters: MemberFilterOptions;
  }) => {
    setLocalFilters(filterPreset.filters);
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderMultiSelect = (
    title: string,
    options: { value: string; label: string; color?: string }[],
    selected: string[],
    onChange: (values: string[]) => void
  ) => (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">
        {title}
      </label>
      <div className="border border-border rounded-xl p-3 max-h-32 overflow-y-auto">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-2 py-1 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selected, option.value]);
                } else {
                  onChange(selected.filter((v) => v !== option.value));
                }
              }}
              className="rounded border-border"
            />
            <span className="text-sm">{option.label}</span>
            {option.color && (
              <span className={`px-2 py-0.5 rounded text-xs ${option.color}`}>
                {option.value}
              </span>
            )}
          </label>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selected.map((value) => (
            <span
              key={value}
              className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
            >
              <span>
                {options.find((o) => o.value === value)?.label || value}
              </span>
              <button
                onClick={() => onChange(selected.filter((v) => v !== value))}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderDateRange = (
    title: string,
    range: { from?: Date; to?: Date },
    onChange: (range: { from?: Date; to?: Date }) => void
  ) => (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block flex items-center">
        <Calendar className="w-4 h-4 mr-2" />
        {title}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <Input
            type="date"
            value={range.from?.toISOString().split("T")[0] || ""}
            onChange={(e) =>
              onChange({
                ...range,
                from: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
            className="text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <Input
            type="date"
            value={range.to?.toISOString().split("T")[0] || ""}
            onChange={(e) =>
              onChange({
                ...range,
                to: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Advanced Member Filters</h2>
            {filterCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                {filterCount} filters
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search & Text Filters */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Search Query
              </label>
              <Input
                value={localFilters.searchQuery}
                onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                placeholder="Search by name, email, employee ID..."
                className="rounded-xl"
              />
            </div>

            {renderMultiSelect(
              "Member Status",
              STATUS_OPTIONS,
              localFilters.status,
              (status) => updateFilters({ status })
            )}

            {renderMultiSelect(
              "Assigned Roles",
              ROLE_OPTIONS,
              localFilters.roles,
              (roles) => updateFilters({ roles })
            )}
          </div>

          {/* Organizational & Date Filters */}
          <div className="space-y-4">
            {renderMultiSelect(
              "Departments",
              DEPARTMENT_OPTIONS,
              localFilters.departments,
              (departments) => updateFilters({ departments })
            )}

            {renderDateRange(
              "Join Date Range",
              localFilters.joinDateRange,
              (joinDateRange) => updateFilters({ joinDateRange })
            )}

            {renderDateRange(
              "Last Access Range",
              localFilters.lastAccessRange,
              (lastAccessRange) => updateFilters({ lastAccessRange })
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeInactive"
                checked={localFilters.includeInactive}
                onChange={(e) =>
                  updateFilters({ includeInactive: e.target.checked })
                }
                className="rounded border-border"
              />
              <label
                htmlFor="includeInactive"
                className="text-sm text-foreground"
              >
                Include inactive members in results
              </label>
            </div>
          </div>
        </div>

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <h4 className="font-medium text-foreground mb-2">
              Saved Filter Presets
            </h4>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => loadSavedFilter(preset)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSaveFilter}
              disabled={!hasActiveFilters}
              className="rounded-xl bg-muted hover:bg-muted/80"
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Preset
            </Button>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleClear}
              disabled={!hasActiveFilters}
              className="rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters ({filterCount})
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default MemberAdvancedFilters;
