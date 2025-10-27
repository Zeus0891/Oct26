// ============================================================================
// LINE ITEMS CONTEXT PROVIDER
// ============================================================================
// Context for managing line items state and operations
// ============================================================================

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  EnhancedLineItemData,
  LineItemsContextType,
  LineItemFile,
  MAX_FILES_PER_ITEM,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from "../types/lineitem.types";

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================

const LineItemsContext = createContext<LineItemsContextType | null>(null);

// ============================================================================
// HOOK FOR CONSUMING CONTEXT
// ============================================================================

export function useLineItems() {
  const context = useContext(LineItemsContext);
  if (!context) {
    throw new Error("useLineItems must be used within LineItemsProvider");
  }
  return context;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface LineItemsProviderProps {
  children: React.ReactNode;
  initialItems?: EnhancedLineItemData[];
  onItemsChange?: (items: EnhancedLineItemData[]) => void;
}

export function LineItemsProvider({
  children,
  initialItems = [],
  onItemsChange,
}: LineItemsProviderProps) {
  const [items, setItems] = useState<EnhancedLineItemData[]>(initialItems);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const generateId = () =>
    `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const generateFileId = () =>
    `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const calculateAmount = (quantity: number, rate: number): number => {
    return Math.round(quantity * rate * 100) / 100;
  };

  // ============================================================================
  // ITEM OPERATIONS
  // ============================================================================

  const addItem = useCallback(() => {
    const newItem: EnhancedLineItemData = {
      id: generateId(),
      name: "",
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
      files: [],
      sortOrder: items.length,
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onItemsChange?.(updatedItems);
  }, [items, onItemsChange]);

  const updateItem = useCallback(
    (id: string, updates: Partial<EnhancedLineItemData>) => {
      const updatedItems = items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates };

          // Recalculate amount if quantity or rate changed
          if ("quantity" in updates || "rate" in updates) {
            updatedItem.amount = calculateAmount(
              updatedItem.quantity,
              updatedItem.rate
            );
          }

          return updatedItem;
        }
        return item;
      });

      setItems(updatedItems);
      onItemsChange?.(updatedItems);
    },
    [items, onItemsChange]
  );

  const removeItem = useCallback(
    (id: string) => {
      const updatedItems = items.filter((item) => item.id !== id);
      setItems(updatedItems);
      onItemsChange?.(updatedItems);
    },
    [items, onItemsChange]
  );

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `File type ${file.type} is not allowed. Please use images, PDFs, or documents.`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`;
    }

    return null;
  };

  const uploadFile = useCallback(
    async (itemId: string, file: File): Promise<void> => {
      const item = items.find((i) => i.id === itemId);
      if (!item) {
        throw new Error("Item not found");
      }

      if (item.files.length >= MAX_FILES_PER_ITEM) {
        throw new Error(`Maximum ${MAX_FILES_PER_ITEM} files allowed per item`);
      }

      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const fileId = generateFileId();
      const newFile: LineItemFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
      };

      // Add file with progress
      updateItem(itemId, {
        files: [...item.files, newFile],
      });

      try {
        // Simulate file upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));

          updateItem(itemId, {
            files: item.files.map((f) =>
              f.id === fileId ? { ...f, uploadProgress: progress } : f
            ),
          });
        }

        // Create preview URL for images
        let preview: string | undefined;
        if (file.type.startsWith("image/")) {
          preview = URL.createObjectURL(file);
        }

        // Mark as completed
        updateItem(itemId, {
          files: item.files.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  uploadProgress: 100,
                  url: `uploaded/${file.name}`, // In real app, this would come from server
                  preview,
                }
              : f
          ),
        });
      } catch (error) {
        // Handle upload error
        updateItem(itemId, {
          files: item.files.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : f
          ),
        });
        throw error;
      }
    },
    [items, updateItem]
  );

  const removeFile = useCallback(
    (itemId: string, fileId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const file = item.files.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }

      updateItem(itemId, {
        files: item.files.filter((f) => f.id !== fileId),
      });
    },
    [items, updateItem]
  );

  // ============================================================================
  // CALCULATION FUNCTIONS
  // ============================================================================

  const calculateTotals = useCallback(() => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1; // 10% tax rate - should be configurable
    const total = subtotal + tax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }, [items]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: LineItemsContextType = {
    items,
    addItem,
    updateItem,
    removeItem,
    uploadFile,
    removeFile,
    calculateTotals,
  };

  return (
    <LineItemsContext.Provider value={contextValue}>
      {children}
    </LineItemsContext.Provider>
  );
}

export default LineItemsProvider;
