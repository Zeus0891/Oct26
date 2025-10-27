// ============================================================================
// ESTIMATE FORM PROVIDER COMPONENT
// ============================================================================
// Central context provider for estimate form state management
// ============================================================================

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import {
  EstimateEntity,
  EstimateFormData,
  CreateEstimateDTO,
  UpdateEstimateDTO,
} from "../../../types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EstimateFormState {
  // Form data
  formData: EstimateFormData;
  originalData?: EstimateEntity;

  // UI state
  currentStep: number;
  totalSteps: number;
  isDirty: boolean;
  isSubmitting: boolean;
  isAutoSaving: boolean;

  // Validation
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;

  // Line items
  lineItems: EstimateLineItem[];

  // Templates & presets
  selectedTemplate?: string;
  quickPresets: EstimateQuickPreset[];

  // Advanced features
  showPreview: boolean;
  showAdvanced: boolean;
  autoSaveEnabled: boolean;
  lastSavedAt?: Date;
}

export interface EstimateLineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taskId?: string;
  sortOrder: number;
}

export interface EstimateQuickPreset {
  id: string;
  name: string;
  description?: string;
  icon: string;
  formData: Partial<EstimateFormData>;
  lineItems?: Partial<EstimateLineItem>[];
}

export type EstimateFormAction =
  | { type: "SET_FORM_DATA"; payload: Partial<EstimateFormData> }
  | { type: "SET_LINE_ITEMS"; payload: EstimateLineItem[] }
  | { type: "ADD_LINE_ITEM"; payload: EstimateLineItem }
  | {
      type: "UPDATE_LINE_ITEM";
      payload: { id: string; data: Partial<EstimateLineItem> };
    }
  | { type: "REMOVE_LINE_ITEM"; payload: string }
  | { type: "SET_ERRORS"; payload: Record<string, string> }
  | { type: "SET_TOUCHED"; payload: Record<string, boolean> }
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_AUTO_SAVING"; payload: boolean }
  | { type: "SET_SHOW_PREVIEW"; payload: boolean }
  | { type: "SET_SHOW_ADVANCED"; payload: boolean }
  | { type: "APPLY_TEMPLATE"; payload: EstimateQuickPreset }
  | { type: "RESET_FORM" }
  | { type: "MARK_SAVED"; payload: Date }
  | { type: "SET_DIRTY"; payload: boolean };

export interface EstimateFormContextValue extends EstimateFormState {
  // Actions
  updateFormData: (data: Partial<EstimateFormData>) => void;
  updateLineItem: (id: string, data: Partial<EstimateLineItem>) => void;
  addLineItem: (item?: Partial<EstimateLineItem>) => void;
  removeLineItem: (id: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  setTouched: (touched: Record<string, boolean>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  togglePreview: () => void;
  toggleAdvanced: () => void;
  applyTemplate: (preset: EstimateQuickPreset) => void;
  resetForm: () => void;

  // Validation
  validateField: (field: string, value: unknown) => string | null;
  validateForm: () => boolean;

  // Data operations
  getCreateDTO: () => CreateEstimateDTO;
  getUpdateDTO: () => UpdateEstimateDTO;
  calculateTotals: () => { subtotal: number; tax: number; total: number };
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialFormData: EstimateFormData = {
  name: "",
  clientAccountId: "",
  clientContactId: "",
  clientNotes: "",
  internalNotes: "",
  serviceLocation: "",
  validUntil: "",
  enablePublicView: false,
};

const initialState: EstimateFormState = {
  formData: initialFormData,
  currentStep: 0,
  totalSteps: 4,
  isDirty: false,
  isSubmitting: false,
  isAutoSaving: false,
  errors: {},
  touched: {},
  isValid: false,
  lineItems: [],
  quickPresets: [],
  showPreview: false,
  showAdvanced: false,
  autoSaveEnabled: true,
};

// ============================================================================
// REDUCER
// ============================================================================

function estimateFormReducer(
  state: EstimateFormState,
  action: EstimateFormAction
): EstimateFormState {
  switch (action.type) {
    case "SET_FORM_DATA":
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
        isDirty: true,
      };

    case "SET_LINE_ITEMS":
      return {
        ...state,
        lineItems: action.payload,
        isDirty: true,
      };

    case "ADD_LINE_ITEM":
      return {
        ...state,
        lineItems: [...state.lineItems, action.payload],
        isDirty: true,
      };

    case "UPDATE_LINE_ITEM":
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.data }
            : item
        ),
        isDirty: true,
      };

    case "REMOVE_LINE_ITEM":
      return {
        ...state,
        lineItems: state.lineItems.filter((item) => item.id !== action.payload),
        isDirty: true,
      };

    case "SET_ERRORS":
      return {
        ...state,
        errors: action.payload,
        isValid: Object.keys(action.payload).length === 0,
      };

    case "SET_TOUCHED":
      return {
        ...state,
        touched: { ...state.touched, ...action.payload },
      };

    case "SET_CURRENT_STEP":
      return {
        ...state,
        currentStep: Math.max(
          0,
          Math.min(action.payload, state.totalSteps - 1)
        ),
      };

    case "SET_SUBMITTING":
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case "SET_AUTO_SAVING":
      return {
        ...state,
        isAutoSaving: action.payload,
      };

    case "SET_SHOW_PREVIEW":
      return {
        ...state,
        showPreview: action.payload,
      };

    case "SET_SHOW_ADVANCED":
      return {
        ...state,
        showAdvanced: action.payload,
      };

    case "APPLY_TEMPLATE":
      return {
        ...state,
        formData: { ...state.formData, ...action.payload.formData },
        lineItems:
          action.payload.lineItems?.map((item, index) => ({
            id: `temp-${Date.now()}-${index}`,
            name: item.name || "",
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            total: (item.quantity || 1) * (item.unitPrice || 0),
            taskId: item.taskId,
            sortOrder: index,
          })) || state.lineItems,
        selectedTemplate: action.payload.id,
        isDirty: true,
      };

    case "RESET_FORM":
      return {
        ...initialState,
        quickPresets: state.quickPresets,
      };

    case "MARK_SAVED":
      return {
        ...state,
        isDirty: false,
        lastSavedAt: action.payload,
      };

    case "SET_DIRTY":
      return {
        ...state,
        isDirty: action.payload,
      };

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

const EstimateFormContext = createContext<EstimateFormContextValue | undefined>(
  undefined
);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface EstimateFormProviderProps {
  children: React.ReactNode;
  initialData?: EstimateEntity;
  onAutoSave?: (data: CreateEstimateDTO | UpdateEstimateDTO) => Promise<void>;
  onSubmit?: (data: CreateEstimateDTO | UpdateEstimateDTO) => Promise<void>;
}

export function EstimateFormProvider({
  children,
  initialData,
  onAutoSave,
  onSubmit,
}: EstimateFormProviderProps) {
  const [state, dispatch] = useReducer(estimateFormReducer, {
    ...initialState,
    formData: initialData
      ? {
          name: initialData.name,
          clientAccountId: initialData.clientAccountId || "",
          clientContactId: initialData.clientContactId,
          clientNotes: initialData.clientNotes,
          internalNotes: initialData.internalNotes,
          serviceLocation: initialData.serviceLocation,
          validUntil: initialData.validUntil,
          enablePublicView: initialData.enablePublicView,
        }
      : initialFormData,
    originalData: initialData,
  });

  // ============================================================================
  // AUTO SAVE FUNCTIONALITY
  // ============================================================================

  useEffect(() => {
    if (!state.autoSaveEnabled || !state.isDirty || state.isSubmitting) return;

    const autoSaveTimer = setTimeout(async () => {
      if (onAutoSave && state.isDirty) {
        try {
          dispatch({ type: "SET_AUTO_SAVING", payload: true });
          const data = initialData ? getUpdateDTO() : getCreateDTO();
          await onAutoSave(data);
          dispatch({ type: "MARK_SAVED", payload: new Date() });
        } catch (error) {
          console.error("Auto-save failed:", error);
        } finally {
          dispatch({ type: "SET_AUTO_SAVING", payload: false });
        }
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [state.formData, state.lineItems, state.isDirty, onAutoSave]);

  // ============================================================================
  // FORM ACTIONS
  // ============================================================================

  const updateFormData = useCallback((data: Partial<EstimateFormData>) => {
    dispatch({ type: "SET_FORM_DATA", payload: data });
  }, []);

  const updateLineItem = useCallback(
    (id: string, data: Partial<EstimateLineItem>) => {
      const updatedData = { ...data };
      if (
        updatedData.quantity !== undefined ||
        updatedData.unitPrice !== undefined
      ) {
        updatedData.total =
          (updatedData.quantity ?? 0) * (updatedData.unitPrice ?? 0);
      }
      dispatch({
        type: "UPDATE_LINE_ITEM",
        payload: { id, data: updatedData },
      });
    },
    []
  );

  const addLineItem = useCallback(
    (item?: Partial<EstimateLineItem>) => {
      const newItem: EstimateLineItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        name: item?.name || "",
        description: item?.description,
        quantity: item?.quantity || 1,
        unitPrice: item?.unitPrice || 0,
        total: (item?.quantity || 1) * (item?.unitPrice || 0),
        taskId: item?.taskId,
        sortOrder: state.lineItems.length,
      };
      dispatch({ type: "ADD_LINE_ITEM", payload: newItem });
    },
    [state.lineItems.length]
  );

  const removeLineItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_LINE_ITEM", payload: id });
  }, []);

  const setErrors = useCallback((errors: Record<string, string>) => {
    dispatch({ type: "SET_ERRORS", payload: errors });
  }, []);

  const setTouched = useCallback((touched: Record<string, boolean>) => {
    dispatch({ type: "SET_TOUCHED", payload: touched });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: "SET_CURRENT_STEP", payload: state.currentStep + 1 });
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    dispatch({ type: "SET_CURRENT_STEP", payload: state.currentStep - 1 });
  }, [state.currentStep]);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: "SET_CURRENT_STEP", payload: step });
  }, []);

  const togglePreview = useCallback(() => {
    dispatch({ type: "SET_SHOW_PREVIEW", payload: !state.showPreview });
  }, [state.showPreview]);

  const toggleAdvanced = useCallback(() => {
    dispatch({ type: "SET_SHOW_ADVANCED", payload: !state.showAdvanced });
  }, [state.showAdvanced]);

  const applyTemplate = useCallback((preset: EstimateQuickPreset) => {
    dispatch({ type: "APPLY_TEMPLATE", payload: preset });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
  }, []);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateField = useCallback(
    (field: string, value: unknown): string | null => {
      switch (field) {
        case "name":
          if (!value || typeof value !== "string" || value.trim().length === 0)
            return "Estimate name is required";
          if (value.length < 3)
            return "Estimate name must be at least 3 characters";
          return null;

        case "clientAccountId":
          if (!value || typeof value !== "string")
            return "Client account is required";
          return null;

        case "validUntil":
          if (
            value &&
            typeof value === "string" &&
            new Date(value) < new Date()
          )
            return "Valid until date must be in the future";
          return null;

        default:
          return null;
      }
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Validate required fields
    Object.entries(state.formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) errors[key] = error;
    });

    // Validate line items
    if (state.lineItems.length === 0) {
      errors.lineItems = "At least one line item is required";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  }, [state.formData, state.lineItems, validateField, setErrors]);

  // ============================================================================
  // DATA TRANSFORMATION
  // ============================================================================

  const getCreateDTO = useCallback((): CreateEstimateDTO => {
    const { clientAccountId, ...rest } = state.formData;
    return {
      ...rest,
      clientAccountId: clientAccountId || undefined,
    };
  }, [state.formData]);

  const getUpdateDTO = useCallback((): UpdateEstimateDTO => {
    const { clientAccountId, ...rest } = state.formData;
    return {
      ...rest,
      clientAccountId: clientAccountId || undefined,
      version: state.originalData?.version || 1,
    };
  }, [state.formData, state.originalData]);

  const calculateTotals = useCallback(() => {
    const subtotal = state.lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax rate - should come from form data
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }, [state.lineItems]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: EstimateFormContextValue = {
    ...state,
    updateFormData,
    updateLineItem,
    addLineItem,
    removeLineItem,
    setErrors,
    setTouched,
    nextStep,
    prevStep,
    goToStep,
    togglePreview,
    toggleAdvanced,
    applyTemplate,
    resetForm,
    validateField,
    validateForm,
    getCreateDTO,
    getUpdateDTO,
    calculateTotals,
  };

  return (
    <EstimateFormContext.Provider value={contextValue}>
      {children}
    </EstimateFormContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useEstimateForm(): EstimateFormContextValue {
  const context = useContext(EstimateFormContext);
  if (!context) {
    throw new Error("useEstimateForm must be used within EstimateFormProvider");
  }
  return context;
}

export default EstimateFormProvider;
