// ============================================================================
// VIEW MODE TOGGLE COMPONENT
// ============================================================================
// Toggle component for switching between grid and list views
// ============================================================================

import React from "react";
import { Grid, List } from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ViewModeToggleProps {
  mode: "grid" | "list";
  onChange: (mode: "grid" | "list") => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ViewModeToggle({
  mode,
  onChange,
  size = "md",
  className = "",
}: ViewModeToggleProps) {
  // ============================================================================
  // SIZE CONFIGURATION
  // ============================================================================

  const sizeConfig = {
    sm: { button: "p-1.5", icon: "w-3 h-3" },
    md: { button: "p-2", icon: "w-4 h-4" },
    lg: { button: "p-3", icon: "w-5 h-5" },
  };

  const config = sizeConfig[size];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className={`flex items-center border border-border/20 rounded-lg neomorphic-inset overflow-hidden ${className}`}
    >
      <button
        onClick={() => onChange("grid")}
        className={`
          ${config.button} transition-all duration-200
          ${
            mode === "grid"
              ? "neomorphic-primary text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }
        `}
        title="Grid view"
        aria-label="Switch to grid view"
      >
        <Grid className={config.icon} />
      </button>

      <div className="w-px h-6 bg-border/30" />

      <button
        onClick={() => onChange("list")}
        className={`
          ${config.button} transition-all duration-200
          ${
            mode === "list"
              ? "neomorphic-primary text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }
        `}
        title="List view"
        aria-label="Switch to list view"
      >
        <List className={config.icon} />
      </button>
    </div>
  );
}

export default ViewModeToggle;
