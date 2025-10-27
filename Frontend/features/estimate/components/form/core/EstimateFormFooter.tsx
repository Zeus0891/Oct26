// ============================================================================
// ESTIMATE FORM FOOTER COMPONENT
// ============================================================================
// Footer with navigation and action buttons
// ============================================================================

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateFormFooterProps {
  mode: "create" | "edit" | "duplicate";
  currentStep: number;
  totalSteps: number;
  isValid: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onSave?: () => void;
  onCancel: () => void;
  layout?: "wizard" | "tabbed" | "single-page";
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateFormFooter({
  mode,
  currentStep,
  totalSteps,
  isValid,
  isSubmitting,
  onSubmit,
  onSave,
  onCancel,
  layout = "wizard",
  className = "",
}: EstimateFormFooterProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const showNavigation = layout === "wizard";

  const submitText = {
    create: isLastStep ? "Create Estimate" : "Next",
    edit: isLastStep ? "Update Estimate" : "Next",
    duplicate: isLastStep ? "Duplicate Estimate" : "Next",
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderNavigationButtons = () => {
    if (!showNavigation) return null;

    return (
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          onClick={() => {
            /* Previous step logic will be handled by form context */
          }}
          disabled={isFirstStep || isSubmitting}
          className="neomorphic-button"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {!isLastStep && (
          <Button
            onClick={() => {
              /* Next step logic will be handled by form context */
            }}
            disabled={isSubmitting}
            className="neomorphic-primary"
          >
            Next
            <ChevronRight className="w-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    );
  };

  const renderActionButtons = () => (
    <div className="flex items-center space-x-3">
      {/* Save Draft (for create/edit) */}
      {onSave && !isLastStep && (
        <Button
          variant="ghost"
          onClick={onSave}
          disabled={isSubmitting}
          className="neomorphic-button"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
      )}

      {/* Cancel */}
      <Button
        variant="ghost"
        onClick={onCancel}
        disabled={isSubmitting}
        className="neomorphic-button text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>

      {/* Submit/Complete */}
      {(isLastStep || layout === "single-page") && (
        <Button
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className={`neomorphic-primary min-w-[140px] ${
            isSubmitting ? "animate-pulse" : ""
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {submitText[mode]}
            </>
          )}
        </Button>
      )}
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`neomorphic-card p-4 ${className}`}>
      <div className="flex items-center justify-between">
        {renderNavigationButtons()}
        {renderActionButtons()}
      </div>

      {/* Help Text */}
      <div className="mt-3 text-xs text-muted-foreground text-center">
        {isSubmitting && <p>Please wait while we process your estimate...</p>}
        {!isValid && !isSubmitting && (
          <p>Please complete all required fields before proceeding</p>
        )}
        {layout === "wizard" && !isLastStep && (
          <p>You can save as draft and continue later</p>
        )}
      </div>
    </div>
  );
}

export default EstimateFormFooter;
