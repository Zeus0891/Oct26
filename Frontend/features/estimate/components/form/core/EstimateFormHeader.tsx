// ============================================================================
// ESTIMATE FORM HEADER COMPONENT
// ============================================================================
// Header with title, progress, and status indicators
// ============================================================================

import React from "react";
import { FileText, Save, Clock, CheckCircle } from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateFormHeaderProps {
  title: string;
  description?: string;
  mode: "create" | "edit" | "duplicate";
  currentStep?: number;
  totalSteps?: number;
  showProgress?: boolean;
  isDirty?: boolean;
  isAutoSaving?: boolean;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateFormHeader({
  title,
  description,
  mode,
  currentStep = 0,
  totalSteps = 4,
  showProgress = true,
  isDirty = false,
  isAutoSaving = false,
  className = "",
}: EstimateFormHeaderProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const progressPercentage =
    totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const statusConfig = {
    create: { icon: FileText, color: "text-blue-600", label: "Creating" },
    edit: { icon: FileText, color: "text-green-600", label: "Editing" },
    duplicate: {
      icon: FileText,
      color: "text-purple-600",
      label: "Duplicating",
    },
  };

  const config = statusConfig[mode];
  const StatusIcon = config.icon;

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderProgress = () => {
    if (!showProgress) return null;

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    );
  };

  const renderStatus = () => (
    <div className="flex items-center space-x-3 text-sm">
      {/* Mode Status */}
      <div className={`flex items-center space-x-1 ${config.color}`}>
        <StatusIcon className="w-4 h-4" />
        <span className="font-medium">{config.label}</span>
      </div>

      {/* Save Status */}
      {isAutoSaving && (
        <div className="flex items-center space-x-1 text-orange-600">
          <Clock className="w-4 h-4 animate-spin" />
          <span>Auto-saving...</span>
        </div>
      )}

      {isDirty && !isAutoSaving && (
        <div className="flex items-center space-x-1 text-amber-600">
          <Save className="w-4 h-4" />
          <span>Unsaved changes</span>
        </div>
      )}

      {!isDirty && !isAutoSaving && (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Saved</span>
        </div>
      )}
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`neomorphic-card p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 neomorphic-button flex items-center justify-center">
              <StatusIcon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>

          {renderProgress()}
        </div>

        <div className="ml-4">{renderStatus()}</div>
      </div>
    </div>
  );
}

export default EstimateFormHeader;
