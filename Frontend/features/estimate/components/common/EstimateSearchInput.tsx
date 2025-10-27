// ============================================================================
// ESTIMATE SEARCH INPUT COMPONENT
// ============================================================================
// Enhanced search input with suggestions and keyboard shortcuts
// ============================================================================

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Search, X, Command } from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  showShortcuts?: boolean;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateSearchInput({
  value,
  onChange,
  placeholder = "Search estimates...",
  onClear,
  suggestions = [],
  onSuggestionSelect,
  showShortcuts = true,
  className = "",
}: EstimateSearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    if (showShortcuts) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showShortcuts]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setActiveSuggestionIndex(-1);
    setShowSuggestions(newValue.length > 0 && suggestions.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[activeSuggestionIndex]);
        }
        break;

      case "Escape":
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const handleClear = () => {
    onChange("");
    onClear?.();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (value.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 150);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1 neomorphic-card border border-border/20 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            className={`
              w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors
              ${index === activeSuggestionIndex ? "bg-accent" : ""}
              ${index === 0 ? "rounded-t-lg" : ""}
              ${index === suggestions.length - 1 ? "rounded-b-lg" : ""}
            `}
          >
            <span className="flex items-center">
              <Search className="w-4 h-4 mr-2 text-muted-foreground" />
              {suggestion}
            </span>
          </button>
        ))}
      </div>
    );
  };

  const renderShortcutHint = () => {
    if (!showShortcuts || value) return null;

    return (
      <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-muted-foreground">
        <Command className="w-3 h-3" />
        <span className="text-xs">K</span>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />

        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="neomorphic-input pl-12 pr-20 h-12"
        />

        {renderShortcutHint()}

        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {renderSuggestions()}
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Simple search input without suggestions
 */
export function EstimateSearchInputSimple({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="neomorphic-input pl-10"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Compact search for mobile
 */
export function EstimateSearchInputCompact({
  value,
  onChange,
  onFocus,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={onFocus}
        className="w-full neomorphic-button p-3 text-left text-muted-foreground"
      >
        <Search className="w-4 h-4 inline mr-2" />
        {value || "Search estimates..."}
      </button>
    </div>
  );
}

export default EstimateSearchInput;
