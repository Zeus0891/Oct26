// ============================================================================
// ESTIMATE LINE ITEM ENHANCED TYPES
// ============================================================================
// Extended types for enhanced line items with file attachments
// ============================================================================

// Import types from the main types directory if needed

// ============================================================================
// ENHANCED LINE ITEM TYPES WITH FILES
// ============================================================================

export interface LineItemFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  uploadProgress?: number;
  error?: string;
}

export interface EnhancedLineItemData {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  files: LineItemFile[];
  sortOrder?: number;
}

export type LineItemFormData = EnhancedLineItemData;

export interface LineItemsContextType {
  items: EnhancedLineItemData[];
  addItem: () => void;
  updateItem: (id: string, data: Partial<EnhancedLineItemData>) => void;
  removeItem: (id: string) => void;
  uploadFile: (itemId: string, file: File) => Promise<void>;
  removeFile: (itemId: string, fileId: string) => void;
  calculateTotals: () => {
    subtotal: number;
    tax: number;
    total: number;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const MAX_FILES_PER_ITEM = 10;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const FILE_TYPE_ICONS = {
  "image/jpeg": "🖼️",
  "image/jpg": "🖼️",
  "image/png": "🖼️",
  "image/gif": "🖼️",
  "image/webp": "🖼️",
  "application/pdf": "📄",
  "text/plain": "📝",
  "application/msword": "📘",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "📘",
} as const;
