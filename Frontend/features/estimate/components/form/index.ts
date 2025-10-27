// ============================================================================
// ESTIMATE FORM SYSTEM - BARREL EXPORTS
// ============================================================================
// Central export file for all estimate form components
// ============================================================================

// ============================================================================
// CORE COMPONENTS
// ============================================================================
export {
  EstimateForm,
  EstimateFormQuick,
  EstimateFormAdvanced,
  EstimateFormMobile,
} from "./EstimateForm";
export {
  EstimateFormProvider,
  useEstimateForm,
} from "./core/EstimateFormProvider";
export { EstimateFormHeader } from "./core/EstimateFormHeader";
export { EstimateFormFooter } from "./core/EstimateFormFooter";
export { EstimateFormToolbar } from "./core/EstimateFormToolbar";

// ============================================================================
// WIZARDS & STEPS
// ============================================================================
export { EstimateFormWizard } from "./wizards/EstimateFormWizard";

// ============================================================================
// VALIDATION
// ============================================================================
// ============================================================================
// VALIDATION COMPONENTS
// ============================================================================
export { EstimateFormErrors } from "./validation/EstimateFormErrors";

// ============================================================================
// PROVIDERS
// ============================================================================
export { LineItemsProvider, useLineItems } from "./providers/LineItemsProvider";

// ============================================================================
// SECTIONS
// ============================================================================
export {
  LineItemsSection,
  LineItemsSectionCompact,
  LineItemsSectionReadOnly,
} from "./sections/LineItemsSection";
export { LineItemRow } from "./sections/LineItemRow";
export {
  LineItemsSummary,
  LineItemsSummaryCompact,
  LineItemsSummaryInline,
} from "./sections/LineItemsSummary";

// ============================================================================
// TYPES
// ============================================================================
export type {
  EnhancedLineItemData,
  LineItemFile,
  LineItemFormData,
  LineItemsContextType,
} from "./types/lineitem.types";

// ============================================================================
// SECTIONS & TEMPLATES
// ============================================================================
export { EstimatePreviewSection } from "./sections/EstimatePreviewSection";
export { EstimateFormAutoSave } from "./templates/EstimateFormAutoSave";

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type {
  EstimateFormState,
  EstimateLineItem,
  EstimateQuickPreset,
  EstimateFormAction,
  EstimateFormContextValue,
} from "./core/EstimateFormProvider";

export type { EstimateFormProps } from "./core/EstimateForm";
