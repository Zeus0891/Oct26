// ============================================================================
// ESTIMATE FORM WIZARD COMPONENT
// ============================================================================
// Multi-step wizard for creating estimates with validation and navigation
// ============================================================================

interface EstimateFormWizardProps {
  showAllSections?: boolean;
  allowNavigation?: boolean;
  showSteps?: boolean;
  className?: string;
}

export function EstimateFormWizard({
  showAllSections = false,
  allowNavigation = true,
  showSteps = true,
  className = "",
}: EstimateFormWizardProps) {
  return (
    <div className={`p-8 text-center text-muted-foreground ${className}`}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Estimate Form Wizard</h3>
        <p>Advanced multi-step wizard component</p>
        <div className="text-sm space-y-2">
          <div>Show All Sections: {showAllSections ? "Yes" : "No"}</div>
          <div>Allow Navigation: {allowNavigation ? "Yes" : "No"}</div>
          <div>Show Steps: {showSteps ? "Yes" : "No"}</div>
        </div>
        <p className="text-xs text-muted-foreground">
          Full implementation coming soon...
        </p>
      </div>
    </div>
  );
}

export default EstimateFormWizard;
