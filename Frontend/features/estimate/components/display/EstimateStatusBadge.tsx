// ============================================================================
// ESTIMATE STATUS BADGE COMPONENT
// ============================================================================
// Reusable status badge with colors, icons and sizes
// ============================================================================

import React from "react";
import {
  Edit,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Archive,
  FileText,
} from "lucide-react";
import { EstimateStatus } from "../../types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateStatusBadgeProps {
  status: EstimateStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const STATUS_CONFIG = {
  [EstimateStatus.DRAFT]: {
    label: "Draft",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    darkColor: "dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
    icon: Edit,
    description: "Being prepared",
  },
  [EstimateStatus.SENT]: {
    label: "Sent",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    darkColor: "dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600",
    icon: Send,
    description: "Awaiting response",
  },
  [EstimateStatus.VIEWED]: {
    label: "Viewed",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    darkColor:
      "dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600",
    icon: Eye,
    description: "Client has viewed",
  },
  [EstimateStatus.CLIENT_APPROVED]: {
    label: "Client Approved",
    color: "bg-green-100 text-green-700 border-green-200",
    darkColor: "dark:bg-green-900/30 dark:text-green-300 dark:border-green-600",
    icon: CheckCircle,
    description: "Approved by client",
  },
  [EstimateStatus.CLIENT_DECLINED]: {
    label: "Client Declined",
    color: "bg-red-100 text-red-700 border-red-200",
    darkColor: "dark:bg-red-900/30 dark:text-red-300 dark:border-red-600",
    icon: XCircle,
    description: "Declined by client",
  },
  [EstimateStatus.APPROVED]: {
    label: "Approved",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    darkColor:
      "dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600",
    icon: CheckCircle,
    description: "Internally approved",
  },
  [EstimateStatus.DECLINED]: {
    label: "Declined",
    color: "bg-red-100 text-red-700 border-red-200",
    darkColor: "dark:bg-red-900/30 dark:text-red-300 dark:border-red-600",
    icon: XCircle,
    description: "Internally declined",
  },
  [EstimateStatus.CONVERTED]: {
    label: "Converted",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    darkColor:
      "dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-600",
    icon: TrendingUp,
    description: "Converted to project",
  },
  [EstimateStatus.EXPIRED]: {
    label: "Expired",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    darkColor:
      "dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-600",
    icon: Clock,
    description: "Past due date",
  },
  [EstimateStatus.CANCELLED]: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    darkColor: "dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600",
    icon: Archive,
    description: "Cancelled",
  },
} as const;

// ============================================================================
// SIZE CONFIGURATION
// ============================================================================

const SIZE_CONFIG = {
  sm: {
    badge: "px-2 py-0.5 text-xs",
    icon: "w-3 h-3",
    spacing: "mr-1",
  },
  md: {
    badge: "px-2.5 py-0.5 text-sm",
    icon: "w-4 h-4",
    spacing: "mr-1.5",
  },
  lg: {
    badge: "px-3 py-1 text-sm",
    icon: "w-4 h-4",
    spacing: "mr-2",
  },
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateStatusBadge({
  status,
  size = "md",
  showIcon = true,
  className = "",
}: EstimateStatusBadgeProps) {
  // Get configuration for this status
  const config = STATUS_CONFIG[status] || {
    label: "Unknown",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    darkColor: "dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
    icon: FileText,
    description: "Unknown status",
  };

  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${sizeConfig.badge}
        ${config.color}
        ${config.darkColor}
        transition-colors duration-200
        ${className}
      `}
      title={config.description}
    >
      {showIcon && (
        <Icon
          className={`${sizeConfig.icon} ${sizeConfig.spacing} flex-shrink-0`}
        />
      )}
      <span className="truncate">{config.label}</span>
    </span>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status configuration for external use
 */
export function getStatusConfig(status: EstimateStatus) {
  return STATUS_CONFIG[status] || STATUS_CONFIG[EstimateStatus.DRAFT];
}

/**
 * Get status color class for external styling
 */
export function getStatusColorClass(status: EstimateStatus, darkMode = false) {
  const config = getStatusConfig(status);
  return darkMode ? config.darkColor : config.color;
}

/**
 * Get status icon component
 */
export function getStatusIcon(status: EstimateStatus) {
  return getStatusConfig(status).icon;
}

// ============================================================================
// VARIANTS FOR SPECIFIC USE CASES
// ============================================================================

/**
 * Compact badge for tight spaces
 */
export function EstimateStatusBadgeCompact({
  status,
  className,
}: {
  status: EstimateStatus;
  className?: string;
}) {
  return (
    <EstimateStatusBadge
      status={status}
      size="sm"
      showIcon={false}
      className={className}
    />
  );
}

/**
 * Badge with tooltip for detailed info
 */
export function EstimateStatusBadgeWithTooltip({
  status,
  className,
}: {
  status: EstimateStatus;
  className?: string;
}) {
  const config = getStatusConfig(status);

  return (
    <div className="group relative">
      <EstimateStatusBadge status={status} className={className} />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {config.description}
      </div>
    </div>
  );
}

export default EstimateStatusBadge;
