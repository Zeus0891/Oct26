// ============================================================================
// LINE ITEM ROW COMPONENT
// ============================================================================
// Individual line item row with file upload capabilities
// ============================================================================

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Trash2,
  Paperclip,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
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
  index: _index,
  allowRemove = true,
  className = "",
}: LineItemRowProps) {
  const { updateItem, removeItem, uploadFile, removeFile } = useLineItems();
  const [isUploading, setIsUploading] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
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
          relative p-2 neomorphic-button rounded-lg group
          ${hasError ? "border border-red-300 bg-red-50" : ""}
          ${isUploading ? "opacity-60" : ""}
        `}
      >
        <div className="flex items-center space-x-2">
          {/* File Icon/Preview */}
          <div className="w-8 h-8 flex items-center justify-center neomorphic-inset rounded">
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
            <p className="text-xs font-medium text-foreground truncate">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>

          {/* Status/Actions */}
          <div className="flex items-center space-x-1">
            {isUploading && (
              <div className="text-xs text-primary">{file.uploadProgress}%</div>
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
          <div className="mt-2 w-full bg-muted rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-300"
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

  const renderFileSection = () => {
    if (!showFiles && item.files.length === 0) return null;

    return (
      <div className="col-span-12 mt-3 p-4 bg-muted/20 neomorphic-inset rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-foreground">
            Attachments ({item.files.length}/{MAX_FILES_PER_ITEM})
          </h4>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              onClick={handleFileSelect}
              disabled={isUploading || item.files.length >= MAX_FILES_PER_ITEM}
              className="neomorphic-button text-xs"
              size="sm"
            >
              <Upload className="w-3 h-3 mr-1" />
              {isUploading ? "Uploading..." : "Add Files"}
            </Button>

            {item.files.length > 0 && (
              <button
                onClick={() => setShowFiles(!showFiles)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showFiles ? "Hide" : "Show"} Files
              </button>
            )}
          </div>
        </div>

        {showFiles && item.files.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {item.files.map(renderFilePreview)}
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
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className={`neomorphic-button p-4 group hover:scale-[1.005] transition-all duration-200 ${className}`}
    >
      <div className="grid grid-cols-12 gap-4 items-start">
        {/* Item Name */}
        <div className="col-span-3">
          <Input
            value={item.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Service or product name"
            className="neomorphic-input text-sm"
          />
        </div>

        {/* Description */}
        <div className="col-span-3">
          <Input
            value={item.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Service or product description"
            className="neomorphic-input text-sm"
          />
        </div>

        {/* Quantity */}
        <div className="col-span-1">
          <div className="flex items-center space-x-1">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.quantity}
              onChange={(e) =>
                handleInputChange("quantity", parseFloat(e.target.value) || 0)
              }
              className="neomorphic-input text-sm text-center"
            />
            <div className="flex flex-col space-y-1">
              <button
                type="button"
                onClick={() => handleInputChange("quantity", item.quantity + 1)}
                className="w-6 h-3 neomorphic-button text-xs flex items-center justify-center"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() =>
                  handleInputChange("quantity", Math.max(0, item.quantity - 1))
                }
                className="w-6 h-3 neomorphic-button text-xs flex items-center justify-center"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* Rate */}
        <div className="col-span-2">
          <div className="flex items-center space-x-1">
            <span className="text-muted-foreground">$</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.rate}
              onChange={(e) =>
                handleInputChange("rate", parseFloat(e.target.value) || 0)
              }
              className="neomorphic-input text-sm text-right"
            />
            <div className="flex flex-col space-y-1">
              <button
                type="button"
                onClick={() => handleInputChange("rate", item.rate + 1)}
                className="w-6 h-3 neomorphic-button text-xs flex items-center justify-center"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() =>
                  handleInputChange("rate", Math.max(0, item.rate - 1))
                }
                className="w-6 h-3 neomorphic-button text-xs flex items-center justify-center"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="col-span-2">
          <div className="neomorphic-inset p-2 rounded text-right">
            <span className="text-lg font-semibold text-green-600">
              ${item.amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-1 flex items-center justify-center space-x-1">
          <Button
            type="button"
            onClick={() => setShowFiles(!showFiles)}
            className={`neomorphic-button w-8 h-8 p-0 ${item.files.length > 0 ? "text-primary" : ""}`}
            title={`Files (${item.files.length})`}
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {allowRemove && (
            <Button
              type="button"
              onClick={handleRemove}
              className="neomorphic-button w-8 h-8 p-0 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* File Section */}
        {renderFileSection()}
      </div>
    </div>
  );
}

export default LineItemRow;
