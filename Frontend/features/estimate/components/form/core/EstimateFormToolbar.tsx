// ============================================================================
// ESTIMATE FORM TOOLBAR COMPONENT
// ============================================================================
// Toolbar with quick actions and settings
// ============================================================================

import React from "react";
import { Button } from "@/components/ui/Button";
import { Eye, FileText, Save, Settings, Download } from "lucide-react";

interface EstimateFormToolbarProps {
  showTemplates?: boolean;
  showPreview?: boolean;
  layout: string;
  onSave?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function EstimateFormToolbar({
  showTemplates = true,
  showPreview = true,
  onSave,
  className = "",
}: EstimateFormToolbarProps) {
  return (
    <div className={`neomorphic-card p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showTemplates && (
            <Button variant="ghost" size="sm" className="neomorphic-button">
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>
          )}

          {showPreview && (
            <Button variant="ghost" size="sm" className="neomorphic-button">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="neomorphic-button">
            <Download className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm" className="neomorphic-button">
            <Settings className="w-4 h-4" />
          </Button>

          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              className="neomorphic-button"
            >
              <Save className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EstimateFormToolbar;
