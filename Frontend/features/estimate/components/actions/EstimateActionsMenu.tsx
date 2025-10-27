// ============================================================================
// ESTIMATE ACTIONS MENU COMPONENT
// ============================================================================
// Dropdown menu with contextual actions for individual estimates
// ============================================================================

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  Eye,
  Edit,
  Copy,
  Send,
  CheckCircle,
  XCircle,
  Archive,
  Trash2,
  Download,
  MoreHorizontal,
} from "lucide-react";
import { EstimateEntity, EstimateStatus } from "../../types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateActionsMenuProps {
  estimate: EstimateEntity;
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onSend?: () => void;
  onApprove?: () => void;
  onDecline?: () => void;
  onArchive?: () => void;
  onDownload?: () => void;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateActionsMenu({
  estimate,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onSend,
  onApprove,
  onDecline,
  onArchive,
  onDownload,
  className = "",
}: EstimateActionsMenuProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const canEdit = estimate.status === EstimateStatus.DRAFT;
  const canSend = estimate.status === EstimateStatus.DRAFT;
  const canApprove = [EstimateStatus.SENT, EstimateStatus.VIEWED].includes(
    estimate.status
  );
  const canDecline = [EstimateStatus.SENT, EstimateStatus.VIEWED].includes(
    estimate.status
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Primary Actions */}
      {onView && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onView}
          className="neomorphic-button"
          title="View estimate"
        >
          <Eye className="w-4 h-4" />
        </Button>
      )}

      {canEdit && onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="neomorphic-button"
          title="Edit estimate"
        >
          <Edit className="w-4 h-4" />
        </Button>
      )}

      {/* Secondary Actions Dropdown */}
      <div className="relative group">
        <Button
          variant="ghost"
          size="sm"
          className="neomorphic-button"
          title="More actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>

        {/* Dropdown Menu */}
        <div
          className="
          absolute right-0 top-full mt-1 w-48 neomorphic-card border border-border/20 rounded-lg shadow-lg
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 z-50
        "
        >
          <div className="py-1">
            {/* Duplicate */}
            {onDuplicate && (
              <button
                onClick={onDuplicate}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </button>
            )}

            {/* Send */}
            {canSend && onSend && (
              <button
                onClick={onSend}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to client
              </button>
            )}

            {/* Approve */}
            {canApprove && onApprove && (
              <button
                onClick={onApprove}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center text-green-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </button>
            )}

            {/* Decline */}
            {canDecline && onDecline && (
              <button
                onClick={onDecline}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center text-red-600"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline
              </button>
            )}

            {/* Download */}
            {onDownload && (
              <button
                onClick={onDownload}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            )}

            <div className="border-t border-border/50 my-1" />

            {/* Archive */}
            {onArchive && (
              <button
                onClick={onArchive}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </button>
            )}

            {/* Delete */}
            {onDelete && (
              <button
                onClick={onDelete}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EstimateActionsMenu;
