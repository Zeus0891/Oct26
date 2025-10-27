// ============================================================================
// LINE ITEMS SECTION COMPONENT
// ============================================================================
// Enhanced line items section with file uploads and advanced features
// ============================================================================

import React from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Calculator, FileText } from "lucide-react";
import { useLineItems } from "../providers/LineItemsProvider";
import { LineItemRow } from "./LineItemRow";
import { LineItemsSummary } from "./LineItemsSummary";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface LineItemsSectionProps {
  className?: string;
  showSummary?: boolean;
  allowAddRemove?: boolean;
  title?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LineItemsSection({
  className = "",
  showSummary = true,
  allowAddRemove = true,
  title = "Line Items & Pricing",
}: LineItemsSectionProps) {
  const { items, addItem, calculateTotals } = useLineItems();
  const totals = calculateTotals();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleAddItem = () => {
    addItem();
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 neomorphic-button flex items-center justify-center">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""} • Subtotal: $
            {totals.subtotal.toFixed(2)}
          </p>
        </div>
      </div>

      {allowAddRemove && (
        <Button
          type="button"
          onClick={handleAddItem}
          className="neomorphic-primary"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      )}
    </div>
  );

  // Table header removed for new glassmorphic design

  const renderItems = () => {
    if (items.length === 0) {
      return (
        <div className="neomorphic-card p-8 text-center">
          <div className="w-16 h-16 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-medium text-foreground mb-2">
            No line items yet
          </h4>
          <p className="text-muted-foreground mb-6">
            Add line items to build your estimate pricing
          </p>
          {allowAddRemove && (
            <Button
              type="button"
              onClick={handleAddItem}
              className="neomorphic-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {items.map((item, index) => (
            <LineItemRow
              key={item.id}
              item={item}
              index={index}
              allowRemove={allowAddRemove}
            />
          ))}
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-6">
        {renderHeader()}
        {renderItems()}

        {/* Add Line Item Button */}
        {allowAddRemove && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full max-w-2xl bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center space-x-3"
            >
              <Plus className="w-6 h-6" />
              <span>Add Line Item</span>
            </button>
          </div>
        )}
      </div>

      {showSummary && items.length > 0 && (
        <LineItemsSummary
          subtotal={totals.subtotal}
          tax={totals.tax}
          total={totals.total}
        />
      )}
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Compact line items for smaller spaces
 */
export function LineItemsSectionCompact({ className }: { className?: string }) {
  return (
    <LineItemsSection className={className} showSummary={false} title="Items" />
  );
}

/**
 * Read-only line items display
 */
export function LineItemsSectionReadOnly({
  className,
}: {
  className?: string;
}) {
  return <LineItemsSection className={className} allowAddRemove={false} />;
}

export default LineItemsSection;
