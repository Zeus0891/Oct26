// ============================================================================
// ESTIMATE STATS GRID COMPONENT
// ============================================================================
// Statistics grid showing estimate metrics with hover effects and animations
// ============================================================================

import React from "react";
import {
  FileText,
  DollarSign,
  BarChart3,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateStats {
  totalEstimates: number;
  totalValue: number;
  avgValue: number;
  conversionRate: number;
  thisMonthCount?: number;
  thisMonthValue?: number;
  pendingCount?: number;
  approvedCount?: number;
}

interface EstimateStatsGridProps {
  stats: EstimateStats;
  isLoading?: boolean;
  className?: string;
  variant?: "default" | "compact" | "detailed";
}

interface StatCardConfig {
  key: keyof EstimateStats;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  format?: (value: number) => string;
  description?: string;
  trend?: number;
}

// ============================================================================
// STAT CARD CONFIGURATION
// ============================================================================

const STAT_CARDS: StatCardConfig[] = [
  {
    key: "totalEstimates",
    label: "Total Estimates",
    icon: FileText,
    color: "text-blue-600",
    borderColor: "border-blue-500",
    description: "All estimates created",
  },
  {
    key: "totalValue",
    label: "Total Value",
    icon: DollarSign,
    color: "text-green-600",
    borderColor: "border-green-500",
    format: (value) => `$${value.toLocaleString()}`,
    description: "Combined value of all estimates",
  },
  {
    key: "avgValue",
    label: "Average Value",
    icon: BarChart3,
    color: "text-purple-600",
    borderColor: "border-purple-500",
    format: (value) => `$${Math.round(value).toLocaleString()}`,
    description: "Average estimate value",
  },
  {
    key: "conversionRate",
    label: "Conversion Rate",
    icon: TrendingUp,
    color: "text-orange-600",
    borderColor: "border-orange-500",
    format: (value) => `${Math.round(value)}%`,
    description: "Estimates converted to projects",
  },
];

const DETAILED_STAT_CARDS: StatCardConfig[] = [
  ...STAT_CARDS,
  {
    key: "thisMonthCount",
    label: "This Month",
    icon: Calendar,
    color: "text-indigo-600",
    borderColor: "border-indigo-500",
    description: "Estimates created this month",
  },
  {
    key: "approvedCount",
    label: "Approved",
    icon: CheckCircle,
    color: "text-emerald-600",
    borderColor: "border-emerald-500",
    description: "Approved estimates",
  },
  {
    key: "pendingCount",
    label: "Pending",
    icon: Clock,
    color: "text-amber-600",
    borderColor: "border-amber-500",
    description: "Awaiting approval",
  },
];

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

const StatCardSkeleton = ({
  variant,
}: {
  variant: "default" | "compact" | "detailed";
}) => (
  <div
    className={`neomorphic-stats p-6 group cursor-pointer border-l-4 border-gray-300 animate-pulse`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 neomorphic-button flex items-center justify-center bg-gray-200 rounded-full">
        <div className="w-6 h-6 bg-gray-300 rounded" />
      </div>
      <div className="text-right space-y-2">
        <div className="h-8 w-16 bg-gray-200 rounded" />
        {variant !== "compact" && (
          <div className="h-3 w-12 bg-gray-200 rounded" />
        )}
      </div>
    </div>
    <div className="h-4 w-24 bg-gray-200 rounded" />
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateStatsGrid({
  stats,
  isLoading = false,
  className = "",
  variant = "default",
}: EstimateStatsGridProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const statCards = variant === "detailed" ? DETAILED_STAT_CARDS : STAT_CARDS;
  const gridCols =
    variant === "compact"
      ? "grid-cols-2 md:grid-cols-4"
      : variant === "detailed"
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStatCard = (config: StatCardConfig, index: number) => {
    const Icon = config.icon;
    const value = stats[config.key] as number;
    const displayValue = config.format
      ? config.format(value)
      : value?.toLocaleString() || "0";

    // Animation delay for staggered entrance
    const animationDelay = `${index * 100}ms`;

    return (
      <div
        key={config.key}
        className={`
          neomorphic-stats p-6 group cursor-pointer border-l-4 ${config.borderColor}
          hover:scale-[1.02] transition-all duration-300
          animate-fade-in
        `}
        style={{ animationDelay }}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className={`
            w-12 h-12 neomorphic-button flex items-center justify-center 
            group-hover:scale-110 transition-transform duration-200
          `}
          >
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>

          <div className="text-right">
            <div
              className={`text-2xl font-bold ${config.color} transition-colors duration-200`}
            >
              {displayValue}
            </div>
            {variant !== "compact" && (
              <p className="text-xs text-muted-foreground mt-1">
                {config.description || "This period"}
              </p>
            )}
          </div>
        </div>

        <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200">
          {config.label}
        </div>

        {/* Trend indicator (if available) */}
        {config.trend !== undefined && variant === "detailed" && (
          <div className="mt-2 flex items-center text-xs">
            <TrendingUp
              className={`w-3 h-3 mr-1 ${config.trend >= 0 ? "text-green-600" : "text-red-600"}`}
            />
            <span
              className={config.trend >= 0 ? "text-green-600" : "text-red-600"}
            >
              {config.trend >= 0 ? "+" : ""}
              {config.trend}%
            </span>
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className={`grid ${gridCols} gap-6 ${className}`}>
        {statCards.map((_, index) => (
          <StatCardSkeleton key={index} variant={variant} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-6 ${className}`}>
      {statCards.map((config, index) => renderStatCard(config, index))}
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Compact stats for smaller spaces
 */
export function EstimateStatsGridCompact({
  stats,
  isLoading,
  className,
}: {
  stats: EstimateStats;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <EstimateStatsGrid
      stats={stats}
      isLoading={isLoading}
      variant="compact"
      className={className}
    />
  );
}

/**
 * Detailed stats with trends
 */
export function EstimateStatsGridDetailed({
  stats,
  isLoading,
  className,
}: {
  stats: EstimateStats;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <EstimateStatsGrid
      stats={stats}
      isLoading={isLoading}
      variant="detailed"
      className={className}
    />
  );
}

/**
 * Single row stats for headers
 */
export function EstimateStatsRow({
  stats,
  isLoading,
  className,
}: {
  stats: EstimateStats;
  isLoading?: boolean;
  className?: string;
}) {
  const quickStats = [
    { label: "Total", value: stats.totalEstimates, color: "text-blue-600" },
    {
      label: "Value",
      value: `$${stats.totalValue.toLocaleString()}`,
      color: "text-green-600",
    },
    {
      label: "Avg",
      value: `$${Math.round(stats.avgValue).toLocaleString()}`,
      color: "text-purple-600",
    },
    {
      label: "Conversion",
      value: `${Math.round(stats.conversionRate)}%`,
      color: "text-orange-600",
    },
  ];

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-6 ${className}`}>
        {quickStats.map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-4 w-12 bg-gray-200 rounded mb-1" />
            <div className="h-6 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-6 ${className}`}>
      {quickStats.map((stat, index) => (
        <div key={index} className="text-center">
          <p className="text-xs text-muted-foreground font-medium">
            {stat.label}
          </p>
          <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export default EstimateStatsGrid;
