// ============================================================================
// ESTIMATE BULK ACTIONS COMPONENT
// ============================================================================
// Bulk actions toolbar for managing multiple selected estimates
// ============================================================================

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  Download,
  Archive,
  Trash2,
  Send,
  Eye,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateBulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onBulkExport?: (format: "csv" | "pdf" | "excel") => void;
  onBulkArchive?: () => void;
  onBulkDelete?: () => void;
  onBulkSend?: () => void;
  onBulkApprove?: () => void;
  onBulkDecline?: () => void;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateBulkActions({
  selectedIds,
  onClearSelection,
  onBulkExport,
  onBulkArchive,
  onBulkDelete,
  onBulkSend,
  onBulkApprove,
  onBulkDecline,
  className = "",
}: EstimateBulkActionsProps) {
  const selectedCount = selectedIds.length;

  if (selectedCount === 0) return null;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className={`neomorphic-card p-4 border-l-4 border-primary ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-primary">
            {selectedCount} estimate{selectedCount !== 1 ? "s" : ""} selected
          </span>

          <button
            onClick={onClearSelection}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Clear selection
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export */}
          {onBulkExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBulkExport("csv")}
              className="neomorphic-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}

          {/* Send */}
          {onBulkSend && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBulkSend}
              className="neomorphic-button"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          )}

          {/* Approve */}
          {onBulkApprove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBulkApprove}
              className="neomorphic-button text-green-600 hover:text-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          )}

          {/* Decline */}
          {onBulkDecline && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBulkDecline}
              className="neomorphic-button text-red-600 hover:text-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
          )}

          {/* Archive */}
          {onBulkArchive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBulkArchive}
              className="neomorphic-button"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          )}

          {/* Delete */}
          {onBulkDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBulkDelete}
              className="neomorphic-button text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EstimateBulkActions;
