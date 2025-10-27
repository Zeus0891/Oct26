// ============================================================================
// FRONTEND UI TYPES
// ============================================================================
// Types specific to frontend UI components, forms, and state management
// ============================================================================

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  testId?: string;
}

export interface LoadingState {
  loading: boolean;
  error?: string | null;
}

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => React.ReactNode;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "number"
    | "date"
    | "select"
    | "textarea"
    | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  timestamp: string;
}
