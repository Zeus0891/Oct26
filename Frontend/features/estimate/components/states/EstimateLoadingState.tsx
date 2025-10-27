// ============================================================================
// ESTIMATE LOADING STATE COMPONENT
// ============================================================================
// Loading state with skeleton placeholders and animations
// ============================================================================

import React from "react";
import { Loader2, FileText } from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateLoadingStateProps {
  message?: string;
  type?: "full" | "cards" | "simple";
  count?: number;
  className?: string;
}

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

const SkeletonCard = () => (
  <div className="neomorphic-button p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3 flex-1">
        <div className="w-4 h-4 bg-muted rounded"></div>
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
      <div className="w-16 h-6 bg-muted rounded-full"></div>
    </div>

    <div className="space-y-3 mb-4">
      <div className="flex justify-between">
        <div className="w-20 h-4 bg-muted rounded"></div>
        <div className="w-24 h-5 bg-muted rounded"></div>
      </div>
      <div className="flex justify-between">
        <div className="w-16 h-4 bg-muted rounded"></div>
        <div className="w-20 h-4 bg-muted rounded"></div>
      </div>
    </div>

    <div className="flex justify-between pt-4 border-t border-border/20">
      <div className="flex space-x-2">
        <div className="w-12 h-7 bg-muted rounded"></div>
        <div className="w-12 h-7 bg-muted rounded"></div>
      </div>
      <div className="w-20 h-4 bg-muted rounded"></div>
    </div>
  </div>
);

const SkeletonListItem = () => (
  <div className="neomorphic-button p-4 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="w-4 h-4 bg-muted rounded"></div>
      <div className="grid grid-cols-12 gap-4 w-full">
        <div className="col-span-3 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
        <div className="col-span-2">
          <div className="w-16 h-6 bg-muted rounded-full"></div>
        </div>
        <div className="col-span-2">
          <div className="h-4 bg-muted rounded w-full"></div>
        </div>
        <div className="col-span-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
        <div className="col-span-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
        <div className="col-span-1 flex space-x-1">
          <div className="w-6 h-6 bg-muted rounded"></div>
          <div className="w-6 h-6 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateLoadingState({
  message = "Loading estimates...",
  type = "full",
  count = 6,
  className = "",
}: EstimateLoadingStateProps) {
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderFullLoading = () => (
    <div className="neomorphic-card p-8">
      <div className="text-center">
        <div className="w-16 h-16 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />

          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse" />
        </div>

        <h3 className="text-lg font-medium text-foreground mb-2">
          Loading Estimates
        </h3>
        <p className="text-muted-foreground">{message}</p>

        {/* Progress indicator */}
        <div className="mt-6 max-w-xs mx-auto">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse w-2/3 transition-all duration-1000" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCardSkeletons = () => (
    <div className="neomorphic-card p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );

  const renderListSkeletons = () => (
    <div className="neomorphic-card p-6">
      <div className="space-y-3">
        {Array.from({ length: count }, (_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    </div>
  );

  const renderSimpleLoading = () => (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="text-muted-foreground">{message}</span>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  const renderContent = () => {
    switch (type) {
      case "cards":
        return renderCardSkeletons();
      case "simple":
        return renderSimpleLoading();
      default:
        return renderFullLoading();
    }
  };

  return <div className={className}>{renderContent()}</div>;
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Loading state for table/list view
 */
export function EstimateLoadingStateList({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonListItem key={i} />
      ))}
    </div>
  );
}

/**
 * Loading state for grid view
 */
export function EstimateLoadingStateGrid({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Compact loading for small spaces
 */
export function EstimateLoadingStateCompact({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center py-6 ${className}`}>
      <div className="flex items-center space-x-2">
        <FileText className="w-5 h-5 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">
          {message || "Loading..."}
        </span>
      </div>
    </div>
  );
}

/**
 * Loading overlay for existing content
 */
export function EstimateLoadingOverlay({
  isVisible,
  message,
  className,
}: {
  isVisible: boolean;
  message?: string;
  className?: string;
}) {
  if (!isVisible) return null;

  return (
    <div
      className={`
      absolute inset-0 bg-background/80 backdrop-blur-sm 
      flex items-center justify-center z-10
      ${className}
    `}
    >
      <div className="neomorphic-card p-6 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          {message || "Loading estimates..."}
        </p>
      </div>
    </div>
  );
}

export default EstimateLoadingState;
