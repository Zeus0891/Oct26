// ============================================================================
// ESTIMATE FORM - MAIN ORCHESTRATOR COMPONENT
// ============================================================================
// Complete estimate form using existing modular components
// ============================================================================

"use client";

import React, { useState, useCallback } from "react";
import { EstimateFormProvider } from "./core/EstimateFormProvider";
import { EstimateFormHeader } from "./core/EstimateFormHeader";
import { EstimateFormFooter } from "./core/EstimateFormFooter";
import { EstimateFormErrors } from "./validation/EstimateFormErrors";
import { EstimateFormAutoSave } from "./templates/EstimateFormAutoSave";
import { EstimatePreviewSection } from "./sections/EstimatePreviewSection";
import { LineItemsProvider } from "./providers/LineItemsProvider";
import { LineItemsSection } from "./sections/LineItemsSection";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, User } from "lucide-react";

// Types
import {
  CreateEstimateDTO,
  UpdateEstimateDTO,
  EstimateEntity,
} from "../../types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EstimateFormProps {
  mode?: "create" | "edit" | "duplicate";
  estimate?: EstimateEntity;
  layout?: "wizard" | "single-page" | "tabbed";
  size?: "sm" | "md" | "lg" | "xl";
  showPreview?: boolean;
  showAutoSave?: boolean;
  onSubmit?: (data: CreateEstimateDTO | UpdateEstimateDTO) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

// ============================================================================
// INTERNAL FORM COMPONENT
// ============================================================================

function EstimateFormInternal({
  mode = "create",
  estimate,
  layout = "single-page",
  size = "lg",
  showPreview = true,
  showAutoSave = true,
  onSubmit,
  onCancel,
  className = "",
}: EstimateFormProps) {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: estimate?.name || "",
    clientNotes: estimate?.clientNotes || "",
    internalNotes: estimate?.internalNotes || "",
    serviceLocation: estimate?.serviceLocation || "",
    specialRequirements: estimate?.specialRequirements || "",
    validUntil: estimate?.validUntil
      ? new Date(estimate.validUntil).toISOString().split("T")[0]
      : "",
    enablePublicView: estimate?.enablePublicView || false,
    clientAccountId: estimate?.clientAccountId || "",
    clientContactId: estimate?.clientContactId || "",
    lineItems: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const subtotal = formData.lineItems.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
  const tax = subtotal * 0.1; // 10% tax for demo
  const total = subtotal + tax;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Line items are now handled by LineItemsProvider

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "Estimate name is required";

    formData.lineItems.forEach((item, index) => {
      if (!item.description) {
        newErrors[`lineItem.${index}.description`] = "Description is required";
      }
      if (item.quantity <= 0) {
        newErrors[`lineItem.${index}.quantity`] =
          "Quantity must be greater than 0";
      }
      if (item.rate < 0) {
        newErrors[`lineItem.${index}.rate`] = "Rate cannot be negative";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        subtotal,
        tax,
        grandTotal: total,
      };

      if (mode === "create") {
        await onSubmit(submitData as CreateEstimateDTO);
      } else {
        await onSubmit({
          ...submitData,
          version: estimate?.version || 1,
        } as UpdateEstimateDTO);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData,
    subtotal,
    tax,
    total,
    onSubmit,
    mode,
    estimate?.version,
    validateForm,
  ]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBasicFields = () => (
    <div className="neomorphic-card p-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-primary" />
        Basic Information
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Estimate Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., Website Development Proposal"
            className={`neomorphic-input ${errors.name ? "border-red-500" : ""}`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Valid Until</label>
          <Input
            type="date"
            value={formData.validUntil}
            onChange={(e) => handleInputChange("validUntil", e.target.value)}
            className="neomorphic-input"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Service Location
          </label>
          <Input
            value={formData.serviceLocation}
            onChange={(e) =>
              handleInputChange("serviceLocation", e.target.value)
            }
            placeholder="123 Main St, City, State"
            className="neomorphic-input"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Special Requirements
          </label>
          <Textarea
            value={formData.specialRequirements}
            onChange={(e) =>
              handleInputChange("specialRequirements", e.target.value)
            }
            placeholder="Any special requirements or instructions..."
            className="neomorphic-input"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderClientFields = () => (
    <div className="neomorphic-card p-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <User className="w-5 h-5 mr-2 text-primary" />
        Client Information
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Client Account ID
          </label>
          <Input
            value={formData.clientAccountId}
            onChange={(e) =>
              handleInputChange("clientAccountId", e.target.value)
            }
            placeholder="Select or enter client account"
            className="neomorphic-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Client Contact ID
          </label>
          <Input
            value={formData.clientContactId}
            onChange={(e) =>
              handleInputChange("clientContactId", e.target.value)
            }
            placeholder="Select contact person"
            className="neomorphic-input"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium mb-2">
            <input
              type="checkbox"
              checked={formData.enablePublicView}
              onChange={(e) =>
                handleInputChange("enablePublicView", e.target.checked)
              }
              className="mr-2"
            />
            Enable Public View
          </label>
          <p className="text-sm text-muted-foreground">
            Allow client to view this estimate via public link
          </p>
        </div>
      </div>
    </div>
  );

  const renderLineItems = () => (
    <LineItemsProvider
      initialItems={formData.lineItems.map((item, index) => ({
        id: `item_${index}`,
        name: item.description || "",
        description: item.description || "",
        quantity: item.quantity || 1,
        rate: item.rate || 0,
        amount: item.amount || 0,
        files: [],
        sortOrder: index,
      }))}
      onItemsChange={(items) => {
        const lineItems = items.map((item) => ({
          description: item.name,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        }));
        setFormData((prev) => ({ ...prev, lineItems }));
      }}
    >
      <LineItemsSection />
    </LineItemsProvider>
  );

  const renderNotesFields = () => (
    <div className="neomorphic-card p-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-primary" />
        Notes & Terms
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Internal Notes
          </label>
          <Textarea
            value={formData.internalNotes}
            onChange={(e) => handleInputChange("internalNotes", e.target.value)}
            placeholder="Internal notes (not visible to client)..."
            className="neomorphic-input"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Client Notes</label>
          <Textarea
            value={formData.clientNotes}
            onChange={(e) => handleInputChange("clientNotes", e.target.value)}
            placeholder="Terms, conditions, and notes visible to client..."
            className="neomorphic-input"
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN LAYOUT
  // ============================================================================

  const containerClass = `
    max-w-6xl mx-auto p-6 
    ${size === "sm" ? "max-w-2xl" : ""}
    ${size === "md" ? "max-w-4xl" : ""}
    ${size === "lg" ? "max-w-6xl" : ""}
    ${size === "xl" ? "max-w-7xl" : ""}
    ${className}
  `;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className={containerClass}>
        {/* Header */}
        <EstimateFormHeader
          mode={mode}
          title={estimate ? `Edit ${estimate.name}` : "Create New Estimate"}
        />

        {/* Auto Save */}
        {showAutoSave && <EstimateFormAutoSave />}

        {/* Errors */}
        {Object.keys(errors).length > 0 && (
          <EstimateFormErrors errors={errors} />
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mt-8">
          {/* Form Content */}
          <div className="xl:col-span-3 space-y-8">
            {renderBasicFields()}
            {renderClientFields()}
            {renderLineItems()}
            {renderNotesFields()}
          </div>

          {/* Preview Sidebar */}
          {showPreview && (
            <div className="xl:col-span-1">
              <EstimatePreviewSection />
            </div>
          )}
        </div>

        {/* Footer */}
        <EstimateFormFooter
          mode={mode}
          currentStep={1}
          totalSteps={1}
          isValid={Object.keys(errors).length === 0}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={onCancel || (() => {})}
        />
      </div>
    </form>
  );
}

// ============================================================================
// MAIN EXPORT WITH PROVIDER
// ============================================================================

export function EstimateForm(props: EstimateFormProps) {
  return (
    <EstimateFormProvider>
      <EstimateFormInternal {...props} />
    </EstimateFormProvider>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Quick estimate form for simple estimates
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
      showPreview={false}
      showAutoSave={false}
      onSubmit={onSubmit}
      onCancel={onCancel}
      className={className}
    />
  );
}

/**
 * Advanced estimate form with all features
 */
export function EstimateFormAdvanced({
  estimate,
  onSubmit,
  onCancel,
  className,
}: {
  estimate?: EstimateEntity;
  onSubmit?: (data: CreateEstimateDTO | UpdateEstimateDTO) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}) {
  return (
    <EstimateForm
      mode={estimate ? "edit" : "create"}
      estimate={estimate}
      layout="single-page"
      size="xl"
      showPreview={true}
      showAutoSave={true}
      onSubmit={onSubmit}
      onCancel={onCancel}
      className={className}
    />
  );
}

/**
 * Mobile-optimized estimate form
 */
export function EstimateFormMobile({
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
      size="sm"
      showPreview={false}
      showAutoSave={false}
      onSubmit={onSubmit}
      onCancel={onCancel}
      className={className}
    />
  );
}

export default EstimateForm;
