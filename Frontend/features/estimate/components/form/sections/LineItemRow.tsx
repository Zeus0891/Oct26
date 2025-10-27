// ============================================================================
// LINE ITEM ROW COMPONENT - NEW GLASSMORPHIC DESIGN
// ============================================================================
// Individual line item row with new glassmorphic design layout
// ============================================================================

import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Upload, X, AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useLineItems } from "../providers/LineItemsProvider";
import {
  EnhancedLineItemData,
  LineItemFile,
  MAX_FILES_PER_ITEM,
  FILE_TYPE_ICONS,
} from "../types/lineitem.types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface LineItemRowProps {
  item: EnhancedLineItemData;
  index: number;
  allowRemove?: boolean;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LineItemRow({
  item,
  allowRemove = true,
  className = "",
}: LineItemRowProps) {
  const { updateItem, removeItem, uploadFile, removeFile } = useLineItems();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleInputChange = (
    field: keyof EnhancedLineItemData,
    value: string | number
  ) => {
    updateItem(item.id!, { [field]: value });
  };

  const handleRemove = () => {
    if (item.id) {
      removeItem(item.id);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        if (item.files.length >= MAX_FILES_PER_ITEM) {
          alert(`Maximum ${MAX_FILES_PER_ITEM} files allowed per item`);
          break;
        }
        await uploadFile(item.id!, file);
      }
    } catch (error) {
      console.error("File upload error:", error);
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = (fileId: string) => {
    if (item.id) {
      removeFile(item.id, fileId);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderFilePreview = (file: LineItemFile) => {
    const isImage = file.type.startsWith("image/");
    const isUploading =
      file.uploadProgress !== undefined && file.uploadProgress < 100;
    const hasError = !!file.error;

    return (
      <div
        key={file.id}
        className={`
          relative p-2 bg-white/60 rounded-lg border border-white/30 group
          ${hasError ? "border-red-300 bg-red-50/80" : ""}
          ${isUploading ? "opacity-60" : ""}
        `}
      >
        <div className="flex items-center space-x-2">
          {/* File Icon/Preview */}
          <div className="w-8 h-8 flex items-center justify-center bg-white/80 rounded">
            {isImage && file.preview ? (
              <Image
                src={file.preview}
                alt={file.name}
                width={24}
                height={24}
                className="object-cover rounded"
              />
            ) : (
              <span className="text-sm">
                {FILE_TYPE_ICONS[file.type as keyof typeof FILE_TYPE_ICONS] ||
                  "📄"}
              </span>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>

          {/* Status/Actions */}
          <div className="flex items-center space-x-1">
            {isUploading && (
              <div className="text-xs text-blue-600">
                {file.uploadProgress}%
              </div>
            )}

            {hasError && (
              <div title={file.error}>
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
            )}

            {!isUploading && !hasError && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}

            <button
              onClick={() => handleRemoveFile(file.id)}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
              disabled={isUploading}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${file.uploadProgress || 0}%` }}
            />
          </div>
        )}

        {/* Error Message */}
        {hasError && (
          <div className="mt-1 text-xs text-red-600">{file.error}</div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`relative ${className}`}>
      {/* Main Card Container with Glassmorphic Style */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
        {/* Top Row: Qty, Unit Price, Total, Delete Button */}
        <div className="flex items-center gap-4 mb-4">
          {/* Quantity */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Qty
            </label>
            <div className="relative bg-white/60 rounded-xl p-3 shadow-inner border border-white/30">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.quantity}
                onChange={(e) =>
                  handleInputChange("quantity", parseFloat(e.target.value) || 0)
                }
                className="w-full bg-transparent border-0 text-center text-lg font-medium focus:ring-0 focus:outline-0 p-0"
                placeholder="1"
              />
            </div>
          </div>

          {/* Unit Price */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Unit Price
            </label>
            <div className="relative bg-white/60 rounded-xl p-3 shadow-inner border border-white/30">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.rate}
                onChange={(e) =>
                  handleInputChange("rate", parseFloat(e.target.value) || 0)
                }
                className="w-full bg-transparent border-0 text-center text-lg font-medium focus:ring-0 focus:outline-0 p-0"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Total */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Total
            </label>
            <div className="relative bg-white/60 rounded-xl p-3 shadow-inner border border-white/30">
              <div className="text-center text-lg font-semibold text-gray-800">
                ${item.amount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Delete Button */}
          {allowRemove && (
            <div className="flex-shrink-0 mt-7">
              <button
                type="button"
                onClick={handleRemove}
                className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                title="Remove item"
              >
                <span className="text-white text-xl font-bold">−</span>
              </button>
            </div>
          )}
        </div>

        {/* Name Item Row */}
        <div className="mb-4">
          <div className="relative bg-white/60 rounded-xl p-4 shadow-inner border border-white/30">
            <Input
              value={item.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Name Item"
              className="w-full bg-transparent border-0 text-lg font-medium focus:ring-0 focus:outline-0 placeholder-gray-400 p-0"
            />
          </div>
        </div>

        {/* Description Row */}
        <div className="mb-4">
          <div className="relative bg-white/60 rounded-xl p-4 shadow-inner border border-white/30">
            <Input
              value={item.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Description"
              className="w-full bg-transparent border-0 text-lg font-medium focus:ring-0 focus:outline-0 placeholder-gray-400 p-0"
            />
          </div>
        </div>

        {/* Choose File Row */}
        <div className="mb-2">
          <div
            className="relative bg-gray-100/80 rounded-xl p-4 shadow-inner border border-gray-200/50 cursor-pointer hover:bg-gray-200/80 transition-colors duration-200"
            onClick={handleFileSelect}
          >
            <div className="flex items-center justify-center space-x-2">
              <Upload className="w-5 h-5 text-gray-500" />
              <span className="text-lg font-medium text-gray-500">
                {item.files.length > 0
                  ? `${item.files.length} file${item.files.length > 1 ? "s" : ""} selected`
                  : "Choose File"}
              </span>
            </div>
          </div>
        </div>

        {/* File Previews */}
        {item.files.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {item.files.slice(0, 3).map(renderFilePreview)}
            {item.files.length > 3 && (
              <div className="bg-gray-100/80 rounded-lg p-3 flex items-center justify-center border border-gray-200/50">
                <span className="text-sm text-gray-500">
                  +{item.files.length - 3} more
                </span>
              </div>
            )}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default LineItemRow;
