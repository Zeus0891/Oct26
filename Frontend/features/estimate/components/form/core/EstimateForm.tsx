// ============================================================================
// ESTIMATE FORM COMPONENT
// ============================================================================
// Main estimate form component with wizard interface and advanced features
// ============================================================================

import React from "react";
import { EstimateFormProvider, useEstimateForm } from "./EstimateFormProvider";
import { EstimateFormHeader } from "./EstimateFormHeader";
import { EstimateFormFooter } from "./EstimateFormFooter";
import { EstimateFormToolbar } from "./EstimateFormToolbar";
import { EstimateFormWizard } from "../wizards/EstimateFormWizard";
import { EstimateFormErrors } from "../validation/EstimateFormErrors";
import { EstimateFormAutoSave } from "../templates/EstimateFormAutoSave";
import { EstimatePreviewSection } from "../sections/EstimatePreviewSection";
import {
  EstimateEntity,
  CreateEstimateDTO,
  UpdateEstimateDTO,
} from "../../../types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EstimateFormProps {
  // Data
  initialData?: EstimateEntity;
  mode?: "create" | "edit" | "duplicate";

  // Callbacks
  onSubmit?: (data: CreateEstimateDTO | UpdateEstimateDTO) => Promise<void>;
  onSave?: (data: CreateEstimateDTO | UpdateEstimateDTO) => Promise<void>;
  onCancel?: () => void;
  onAutoSave?: (data: CreateEstimateDTO | UpdateEstimateDTO) => Promise<void>;

  // Configuration
  showWizard?: boolean;
  showPreview?: boolean;
  showTemplates?: boolean;
  autoSaveEnabled?: boolean;

  // Layout
  layout?: "wizard" | "tabbed" | "single-page";
  size?: "sm" | "md" | "lg" | "xl";

  // Customization
  className?: string;
  title?: string;
  description?: string;
}

// ============================================================================
// INTERNAL FORM COMPONENT (WRAPPED BY PROVIDER)
// ============================================================================

function EstimateFormInternal({
  mode = "create",
  onSubmit,
  onSave,
  onCancel,
  showWizard = true,
  showPreview = false,
  showTemplates = true,
  layout = "wizard",
  size = "lg",
  className = "",
  title,
  description,
}: Omit<EstimateFormProps, "initialData" | "onAutoSave" | "autoSaveEnabled">) {
  const {
    formData,
    currentStep,
    totalSteps,
    isDirty,
    isSubmitting,
    isAutoSaving,
    errors,
    isValid,
    showPreview: contextShowPreview,
    validateForm,
    getCreateDTO,
    getUpdateDTO,
    resetForm,
  } = useEstimateForm();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const data = mode === "create" ? getCreateDTO() : getUpdateDTO();
      await onSubmit?.(data);
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const data = mode === "create" ? getCreateDTO() : getUpdateDTO();
      await onSave?.(data);
    } catch (error) {
      console.error("Form save failed:", error);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to cancel?"
        )
      ) {
        resetForm();
        onCancel?.();
      }
    } else {
      onCancel?.();
    }
  };

  // ============================================================================
  // LAYOUT CONFIGURATION
  // ============================================================================

  const containerClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
  };

  const layoutConfig = {
    wizard: {
      showSteps: true,
      showProgress: true,
      allowNavigation: true,
    },
    tabbed: {
      showSteps: false,
      showProgress: false,
      allowNavigation: true,
    },
    "single-page": {
      showSteps: false,
      showProgress: false,
      allowNavigation: false,
    },
  };

  const config = layoutConfig[layout];

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderFormHeader = () => (
    <EstimateFormHeader
      title={
        title || (mode === "create" ? "Create New Estimate" : "Edit Estimate")
      }
      description={
        description || "Fill in the details below to create your estimate"
      }
      mode={mode}
      currentStep={currentStep}
      totalSteps={totalSteps}
      showProgress={config.showProgress}
      isDirty={isDirty}
      isAutoSaving={isAutoSaving}
    />
  );

  const renderToolbar = () => (
    <EstimateFormToolbar
      showTemplates={showTemplates}
      showPreview={showPreview}
      layout={layout}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );

  const renderFormContent = () => {
    if (layout === "wizard" && showWizard) {
      return (
        <EstimateFormWizard
          allowNavigation={config.allowNavigation}
          showSteps={config.showSteps}
        />
      );
    }

    // For non-wizard layouts, render all sections
    return (
      <div className="space-y-8">
        <EstimateFormWizard
          showAllSections={true}
          allowNavigation={false}
          showSteps={false}
        />
      </div>
    );
  };

  const renderPreview = () => {
    if (!contextShowPreview && !showPreview) return null;

    return (
      <div className="lg:col-span-1">
        <EstimatePreviewSection />
      </div>
    );
  };

  const renderFormFooter = () => (
    <EstimateFormFooter
      mode={mode}
      currentStep={currentStep}
      totalSteps={totalSteps}
      isValid={isValid}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onSave={handleSave}
      onCancel={handleCancel}
      layout={layout}
    />
  );

  const renderErrors = () => {
    if (Object.keys(errors).length === 0) return null;

    return <EstimateFormErrors errors={errors} className="mb-6" />;
  };

  // ============================================================================
  // MAIN LAYOUT RENDER
  // ============================================================================

  const shouldShowPreview = contextShowPreview || showPreview;
  const gridCols = shouldShowPreview ? "lg:grid-cols-3" : "lg:grid-cols-1";

  return (
    <div className={`estimate-form ${className}`}>
      {/* Auto Save Component */}
      <EstimateFormAutoSave />

      {/* Main Container */}
      <div
        className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 ${containerClasses[size]}`}
      >
        <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
          {/* Main Form Column */}
          <div
            className={shouldShowPreview ? "lg:col-span-2" : "lg:col-span-1"}
          >
            <div className="space-y-6">
              {/* Header */}
              {renderFormHeader()}

              {/* Toolbar */}
              {renderToolbar()}

              {/* Errors */}
              {renderErrors()}

              {/* Form Content */}
              <div className="neomorphic-card">{renderFormContent()}</div>

              {/* Footer */}
              {renderFormFooter()}
            </div>
          </div>

          {/* Preview Column */}
          {renderPreview()}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT WITH PROVIDER
// ============================================================================

export function EstimateForm({
  initialData,
  onAutoSave,
  autoSaveEnabled = true,
  ...props
}: EstimateFormProps) {
  return (
    <EstimateFormProvider initialData={initialData} onAutoSave={onAutoSave}>
      <EstimateFormInternal {...props} />
    </EstimateFormProvider>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Quick create form for simple estimates
 */
export function EstimateFormQuick({
  onSubmit,
  onCancel,
  className,
}: {
  onSubmit?: (data: CreateEstimateDTO | UpdateEstimateDTO) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}) {
  return (
    <EstimateForm
      mode="create"
      layout="single-page"
      size="md"
      showWizard={false}
      showPreview={false}
      showTemplates={true}
      onSubmit={onSubmit}
      onCancel={onCancel}
      title="Quick Estimate"
      description="Create a simple estimate quickly"
      className={className}
    />
  );
}

/**
 * Full-featured form for complex estimates
 */
export function EstimateFormAdvanced({
  initialData,
  onSubmit,
  onSave,
  onCancel,
  onAutoSave,
  className,
}: {
  initialData?: EstimateEntity;
  onSubmit?: (data: CreateEstimateDTO | UpdateEstimateDTO) => Promise<void>;
  onSave?: (data: CreateEstimateDTO | UpdateEstimateDTO) => Promise<void>;
  onCancel?: () => void;
  onAutoSave?: (data: CreateEstimateDTO | UpdateEstimateDTO) => Promise<void>;
  className?: string;
}) {
  return (
    <EstimateForm
      initialData={initialData}
      mode={initialData ? "edit" : "create"}
      layout="wizard"
      size="xl"
      showWizard={true}
      showPreview={true}
      showTemplates={true}
      autoSaveEnabled={true}
      onSubmit={onSubmit}
      onSave={onSave}
      onCancel={onCancel}
      onAutoSave={onAutoSave}
      title={initialData ? "Edit Estimate" : "Create New Estimate"}
      description="Complete estimate with all advanced features"
      className={className}
    />
  );
}

/**
 * Mobile-optimized form
 */
export function EstimateFormMobile({
  initialData,
  onSubmit,
  onCancel,
  className,
}: {
  initialData?: EstimateEntity;
  onSubmit?: (data: CreateEstimateDTO | UpdateEstimateDTO) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}) {
  return (
    <EstimateForm
      initialData={initialData}
      mode={initialData ? "edit" : "create"}
      layout="wizard"
      size="sm"
      showWizard={true}
      showPreview={false}
      showTemplates={false}
      onSubmit={onSubmit}
      onCancel={onCancel}
      className={className}
    />
  );
}

export default EstimateForm;
