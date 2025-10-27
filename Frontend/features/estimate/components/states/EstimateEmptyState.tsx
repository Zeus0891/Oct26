// ============================================================================
// ESTIMATE EMPTY STATE COMPONENT
// ============================================================================
// Empty state component with different contexts and actions
// ============================================================================

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Search,
  Plus,
  Filter,
  RefreshCw,
  Inbox,
  AlertCircle,
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateEmptyStateProps {
  type?: "no-estimates" | "no-results" | "error" | "loading-failed";
  hasFilters?: boolean;
  searchTerm?: string;
  onCreateNew?: () => void;
  onClearFilters?: () => void;
  onRetry?: () => void;
  className?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const EMPTY_STATE_CONFIG = {
  "no-estimates": {
    icon: FileText,
    title: "No estimates found",
    description: "Get started by creating your first estimate",
    primaryAction: {
      label: "Create Estimate",
      icon: Plus,
    },
    illustration: "📋",
  },
  "no-results": {
    icon: Search,
    title: "No estimates match your search",
    description: "Try adjusting your search criteria or filters",
    primaryAction: {
      label: "Clear Filters",
      icon: Filter,
    },
    secondaryAction: {
      label: "Create New Estimate",
      icon: Plus,
    },
    illustration: "🔍",
  },
  error: {
    icon: AlertCircle,
    title: "Unable to load estimates",
    description:
      "There was a problem loading your estimates. Please try again.",
    primaryAction: {
      label: "Retry",
      icon: RefreshCw,
    },
    illustration: "⚠️",
  },
  "loading-failed": {
    icon: Inbox,
    title: "Loading failed",
    description: "We couldn't load your estimates at this time",
    primaryAction: {
      label: "Try Again",
      icon: RefreshCw,
    },
    illustration: "📪",
  },
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateEmptyState({
  type = "no-estimates",
  hasFilters = false,
  searchTerm = "",
  onCreateNew,
  onClearFilters,
  onRetry,
  className = "",
}: EstimateEmptyStateProps) {
  // Determine the appropriate type based on context
  const actualType = React.useMemo(() => {
    if (hasFilters || searchTerm) {
      return "no-results";
    }
    return type;
  }, [type, hasFilters, searchTerm]);

  const config = EMPTY_STATE_CONFIG[actualType];
  const Icon = config.icon;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handlePrimaryAction = () => {
    switch (actualType) {
      case "no-estimates":
        onCreateNew?.();
        break;
      case "no-results":
        onClearFilters?.();
        break;
      case "error":
      case "loading-failed":
        onRetry?.();
        break;
    }
  };

  const handleSecondaryAction = () => {
    if (actualType === "no-results") {
      onCreateNew?.();
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderDescription = () => {
    if (actualType === "no-results" && searchTerm) {
      return (
        <p className="text-muted-foreground mb-6 max-w-md">
          No estimates found for &ldquo;{searchTerm}&rdquo;. Try a different
          search term or{" "}
          {hasFilters ? "clear your filters" : "create a new estimate"}.
        </p>
      );
    }

    if (actualType === "no-results" && hasFilters) {
      return (
        <p className="text-muted-foreground mb-6 max-w-md">
          No estimates match your current filters. Try adjusting your search
          criteria or create a new estimate.
        </p>
      );
    }

    return (
      <p className="text-muted-foreground mb-6 max-w-md">
        {config.description}
      </p>
    );
  };

  const renderActions = () => (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {/* Primary Action */}
      {config.primaryAction && (
        <Button
          onClick={handlePrimaryAction}
          className="neomorphic-primary min-w-[140px]"
          size="lg"
        >
          <config.primaryAction.icon className="w-5 h-5 mr-2" />
          {config.primaryAction.label}
        </Button>
      )}

      {/* Secondary Action */}
      {actualType === "no-results" && (
        <Button
          variant="ghost"
          onClick={handleSecondaryAction}
          className="neomorphic-button min-w-[140px]"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Estimate
        </Button>
      )}

      {/* Alternative action for no-estimates */}
      {actualType === "no-estimates" && (
        <Button variant="ghost" className="neomorphic-button" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Learn about estimates
        </Button>
      )}
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`neomorphic-card p-8 ${className}`}>
      <div className="text-center max-w-lg mx-auto">
        {/* Illustration */}
        <div className="mb-6">
          <div className="w-24 h-24 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
            <Icon className="w-12 h-12 text-muted-foreground" />

            {/* Animated background for loading states */}
            {(actualType === "loading-failed" || actualType === "error") && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-transparent animate-pulse" />
            )}
          </div>

          {/* Emoji illustration */}
          <div className="text-4xl mb-2" role="img" aria-label="Illustration">
            {config.illustration}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            {config.title}
          </h3>

          {renderDescription()}

          {renderActions()}
        </div>

        {/* Additional Context */}
        {actualType === "no-estimates" && (
          <div className="mt-8 p-4 neomorphic-inset rounded-xl">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">💡 Quick tip:</p>
              <p>
                Estimates help you provide accurate project quotes to clients.
                Start by creating your first estimate template.
              </p>
            </div>
          </div>
        )}

        {/* Error details */}
        {actualType === "error" && (
          <div className="mt-6 text-xs text-muted-foreground">
            <details className="cursor-pointer">
              <summary className="hover:text-foreground transition-colors">
                Show technical details
              </summary>
              <div className="mt-2 p-3 neomorphic-inset rounded text-left font-mono text-xs">
                Failed to fetch estimates data. Check your network connection
                and try again.
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Simple empty state for small containers
 */
export function EstimateEmptyStateSimple({
  onCreateNew,
  className,
}: {
  onCreateNew?: () => void;
  className?: string;
}) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">No estimates</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Create your first estimate
      </p>
      <Button onClick={onCreateNew} size="sm" className="neomorphic-primary">
        <Plus className="w-4 h-4 mr-1" />
        New Estimate
      </Button>
    </div>
  );
}

/**
 * Inline empty state for lists
 */
export function EstimateEmptyStateInline({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="text-center">
        <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {message || "No estimates to display"}
        </p>
      </div>
    </div>
  );
}

export default EstimateEmptyState;
