// ============================================================================
// LINE ITEMS SUMMARY COMPONENT
// ============================================================================
// Summary section showing subtotal, tax, and total calculations
// ============================================================================

import React from "react";
import { Calculator, DollarSign } from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface LineItemsSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
  taxRate?: number;
  className?: string;
  showBreakdown?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LineItemsSummary({
  subtotal,
  tax,
  total,
  taxRate = 10,
  className = "",
  showBreakdown = true,
}: LineItemsSummaryProps) {
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSummaryRow = (label: string, amount: number, isTotal = false) => (
    <div
      className={`flex items-center justify-between py-3 ${isTotal ? "border-t-2 border-primary" : "border-t border-border/30"}`}
    >
      <span
        className={`${isTotal ? "text-lg font-bold text-foreground" : "text-sm text-muted-foreground"}`}
      >
        {label}:
      </span>
      <span
        className={`${isTotal ? "text-2xl font-bold text-primary" : "text-lg font-semibold text-foreground"}`}
      >
        ${amount.toFixed(2)}
      </span>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`neomorphic-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 neomorphic-button flex items-center justify-center">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Summary</h3>
            <p className="text-sm text-muted-foreground">
              Price breakdown and totals
            </p>
          </div>
        </div>

        <div className="w-12 h-12 neomorphic-button flex items-center justify-center">
          <DollarSign className="h-6 w-6 text-green-600" />
        </div>
      </div>

      <div className="space-y-0">
        {/* Subtotal */}
        {renderSummaryRow("Subtotal", subtotal)}

        {/* Tax */}
        {renderSummaryRow(`Tax (${taxRate}%)`, tax)}

        {/* Total */}
        {renderSummaryRow("Total", total, true)}
      </div>

      {showBreakdown && (
        <div className="mt-6 p-4 bg-muted/30 neomorphic-inset rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Base Amount
              </div>
              <div className="text-sm font-medium text-foreground">
                ${subtotal.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Tax Amount
              </div>
              <div className="text-sm font-medium text-foreground">
                ${tax.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Final Total
              </div>
              <div className="text-sm font-bold text-primary">
                ${total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Compact summary for smaller spaces
 */
export function LineItemsSummaryCompact({
  subtotal: _subtotal,
  tax: _tax,
  total,
  className,
}: {
  subtotal: number;
  tax: number;
  total: number;
  className?: string;
}) {
  return (
    <div className={`neomorphic-card p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total:</span>
        <span className="text-lg font-bold text-primary">
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

/**
 * Inline summary for forms
 */
export function LineItemsSummaryInline({
  subtotal,
  tax,
  total,
  className,
}: {
  subtotal: number;
  tax: number;
  total: number;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 neomorphic-inset rounded-lg ${className}`}
    >
      <div className="flex items-center space-x-4 text-sm">
        <span className="text-muted-foreground">
          Subtotal:{" "}
          <strong className="text-foreground">${subtotal.toFixed(2)}</strong>
        </span>
        <span className="text-muted-foreground">
          Tax: <strong className="text-foreground">${tax.toFixed(2)}</strong>
        </span>
      </div>
      <div className="text-lg font-bold text-primary">
        Total: ${total.toFixed(2)}
      </div>
    </div>
  );
}

export default LineItemsSummary;
