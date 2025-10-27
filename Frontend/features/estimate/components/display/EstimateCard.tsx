// ============================================================================
// ESTIMATE CARD COMPONENT
// ============================================================================
// Reusable card component for displaying estimates in grid/list views
// ============================================================================

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Eye,
  Edit,
  MoreHorizontal,
  Calendar,
  DollarSign,
  MapPin,
} from "lucide-react";
import { EstimateEntity, EstimateStatus } from "../../types";
import { EstimateStatusBadge } from "./EstimateStatusBadge";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateCardProps {
  estimate: EstimateEntity;
  viewMode?: "grid" | "list";
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
  showActions?: boolean;
  showSelection?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateCard({
  estimate,
  viewMode = "grid",
  isSelected = false,
  onSelect,
  onView,
  onEdit,
  className = "",
  showActions = true,
  showSelection = false,
}: EstimateCardProps) {
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSelectToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(estimate.id);
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onView?.(estimate.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(estimate.id);
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const displayNumber = estimate.estimateNumber || estimate.id.slice(0, 8);
  const displayName = estimate.name || "Untitled Estimate";
  const displayAmount = Number(estimate.grandTotal || 0);
  const createdDate = new Date(estimate.createdAt);
  const validUntilDate = estimate.validUntil
    ? new Date(estimate.validUntil)
    : null;
  const isExpired = validUntilDate && validUntilDate < new Date();
  const canEdit = estimate.status === EstimateStatus.DRAFT;

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderGridView = () => (
    <div
      className={`
        neomorphic-button p-6 hover:scale-[1.01] transition-all duration-200 group
        ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {showSelection && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelectToggle}
              className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {displayNumber}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {displayName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <EstimateStatusBadge status={estimate.status} size="sm" />
          {showActions && (
            <button className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            Total Amount
          </span>
          <span
            className={`text-lg font-semibold ${isExpired ? "text-orange-600" : "text-green-600"}`}
          >
            ${displayAmount.toLocaleString()}
          </span>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Created
            </span>
            <span className="text-foreground">
              {createdDate.toLocaleDateString()}
            </span>
          </div>

          {validUntilDate && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Valid Until</span>
              <span
                className={`font-medium ${isExpired ? "text-red-600" : "text-foreground"}`}
              >
                {validUntilDate.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {estimate.serviceLocation && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{estimate.serviceLocation}</span>
          </div>
        )}

        {estimate.clientNotes && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {estimate.clientNotes}
          </p>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center space-x-2">
            <Link href={`/estimates/${estimate.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="neomorphic-button text-xs"
                onClick={handleView}
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
            </Link>
            {canEdit && (
              <Link href={`/estimates/${estimate.id}/edit`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="neomorphic-button text-xs"
                  onClick={handleEdit}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </Link>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Updated {new Date(estimate.updatedAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );

  const renderListView = () => (
    <div
      className={`
        neomorphic-button p-4 hover:scale-[1.005] transition-all duration-200 group
        ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          {showSelection && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelectToggle}
              className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {/* Main Info */}
          <div className="grid grid-cols-12 gap-4 w-full items-center">
            {/* Estimate Info - 3 cols */}
            <div className="col-span-3 min-w-0">
              <p className="font-medium text-foreground truncate">
                {displayNumber}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {displayName}
              </p>
            </div>

            {/* Status - 2 cols */}
            <div className="col-span-2">
              <EstimateStatusBadge status={estimate.status} size="sm" />
            </div>

            {/* Amount - 2 cols */}
            <div className="col-span-2 text-right">
              <p
                className={`font-medium ${isExpired ? "text-orange-600" : "text-green-600"}`}
              >
                ${displayAmount.toLocaleString()}
              </p>
            </div>

            {/* Created Date - 2 cols */}
            <div className="col-span-2 text-sm text-muted-foreground">
              {createdDate.toLocaleDateString()}
            </div>

            {/* Valid Until - 2 cols */}
            <div className="col-span-2 text-sm">
              {validUntilDate ? (
                <span
                  className={
                    isExpired
                      ? "text-red-600 font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {validUntilDate.toLocaleDateString()}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>

            {/* Actions - 1 col */}
            <div className="col-span-1 flex items-center justify-end space-x-1">
              {showActions && (
                <>
                  <Link href={`/estimates/${estimate.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="neomorphic-button w-8 h-8 p-0"
                      onClick={handleView}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  {canEdit && (
                    <Link href={`/estimates/${estimate.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="neomorphic-button w-8 h-8 p-0"
                        onClick={handleEdit}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return viewMode === "grid" ? renderGridView() : renderListView();
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Compact card for sidebars or tight spaces
 */
export function EstimateCardCompact({
  estimate,
  onView,
  className,
}: {
  estimate: EstimateEntity;
  onView?: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={`neomorphic-button p-3 hover:scale-[1.01] transition-all duration-200 cursor-pointer ${className}`}
      onClick={() => onView?.(estimate.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm text-foreground truncate">
          {estimate.estimateNumber || estimate.id.slice(0, 8)}
        </span>
        <EstimateStatusBadge
          status={estimate.status}
          size="sm"
          showIcon={false}
        />
      </div>
      <div className="text-xs text-muted-foreground truncate mb-1">
        {estimate.name}
      </div>
      <div className="text-sm font-semibold text-green-600">
        ${Number(estimate.grandTotal || 0).toLocaleString()}
      </div>
    </div>
  );
}

export default EstimateCard;
