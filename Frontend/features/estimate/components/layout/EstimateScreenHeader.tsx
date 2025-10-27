// ============================================================================
// ESTIMATE SCREEN HEADER COMPONENT
// ============================================================================
// Main header for the estimate screen with title, actions and view controls
// ============================================================================

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Plus,
  RefreshCw,
  Filter,
  Grid,
  List,
  Download,
  Settings,
  Search,
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateScreenHeaderProps {
  totalCount?: number;
  onRefresh?: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  isLoading?: boolean;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  onExport?: () => void;
  onCreateNew?: () => void;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateScreenHeader({
  totalCount = 0,
  onRefresh,
  viewMode,
  onViewModeChange,
  isLoading = false,
  showFilters = false,
  onToggleFilters,
  onExport,
  onCreateNew,
  className = "",
}: EstimateScreenHeaderProps) {
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRefresh = () => {
    onRefresh?.();
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    onViewModeChange(mode);
  };

  const handleToggleFilters = () => {
    onToggleFilters?.();
  };

  const handleExport = () => {
    onExport?.();
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderTitle = () => (
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 neomorphic-button flex items-center justify-center">
        <FileText className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Estimates
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your project estimates and proposals
          {totalCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-muted rounded-full text-xs font-medium">
              {totalCount}
            </span>
          )}
        </p>
      </div>
    </div>
  );

  const renderViewModeToggle = () => (
    <div className="flex items-center border border-border/20 rounded-lg neomorphic-inset overflow-hidden">
      <button
        onClick={() => handleViewModeChange("grid")}
        className={`
          p-2 transition-all duration-200
          ${
            viewMode === "grid"
              ? "neomorphic-primary text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }
        `}
        title="Grid view"
      >
        <Grid className="h-4 w-4" />
      </button>
      <div className="w-px h-6 bg-border/30" />
      <button
        onClick={() => handleViewModeChange("list")}
        className={`
          p-2 transition-all duration-200
          ${
            viewMode === "list"
              ? "neomorphic-primary text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }
        `}
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );

  const renderActionButtons = () => (
    <div className="flex items-center space-x-3">
      {/* Filters Toggle */}
      {onToggleFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleFilters}
          className={`
            neomorphic-button
            ${showFilters ? "neomorphic-primary text-primary" : ""}
          `}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      )}

      {/* Export */}
      {onExport && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          className="neomorphic-button"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      )}

      {/* Refresh */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        disabled={isLoading}
        className="neomorphic-button"
      >
        <RefreshCw
          className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
        />
        Refresh
      </Button>

      {/* View Mode Toggle */}
      {renderViewModeToggle()}

      {/* Settings */}
      <Button variant="ghost" size="sm" className="neomorphic-button">
        <Settings className="h-4 w-4" />
      </Button>

      {/* Create New */}
      <Button className="neomorphic-primary" onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        New Estimate
      </Button>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`neomorphic-card p-6 ${className}`}>
      <div className="flex items-center justify-between">
        {renderTitle()}
        {renderActionButtons()}
      </div>
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Compact header for smaller screens
 */
export function EstimateScreenHeaderCompact({
  totalCount,
  viewMode,
  onViewModeChange,
  onRefresh,
  onCreateNew,
  className,
}: {
  totalCount?: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onRefresh?: () => void;
  onCreateNew?: () => void;
  className?: string;
}) {
  return (
    <div className={`neomorphic-card p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 neomorphic-button flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Estimates</h1>
            {totalCount !== undefined && (
              <p className="text-xs text-muted-foreground">
                {totalCount} items
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="neomorphic-button p-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center border border-border/20 rounded neomorphic-inset">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 ${viewMode === "grid" ? "text-primary" : "text-muted-foreground"}`}
            >
              <Grid className="h-3 w-3" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 ${viewMode === "list" ? "text-primary" : "text-muted-foreground"}`}
            >
              <List className="h-3 w-3" />
            </button>
          </div>

          <Button
            size="sm"
            className="neomorphic-primary"
            onClick={onCreateNew}
          >
            <Plus className="h-3 w-3 mr-1" />
            New
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile-optimized header
 */
export function EstimateScreenHeaderMobile({
  totalCount,
  onRefresh,
  onCreateNew,
  className,
}: {
  totalCount?: number;
  onRefresh?: () => void;
  onCreateNew?: () => void;
  className?: string;
}) {
  return (
    <div className={`neomorphic-card p-4 ${className}`}>
      {/* Main row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 neomorphic-button flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Estimates</h1>
        </div>

        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="neomorphic-button p-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Secondary row */}
      <div className="flex items-center justify-between">
        {totalCount !== undefined && (
          <p className="text-sm text-muted-foreground">
            {totalCount} estimates
          </p>
        )}

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="neomorphic-button">
            <Search className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="neomorphic-primary"
            onClick={onCreateNew}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EstimateScreenHeader;
