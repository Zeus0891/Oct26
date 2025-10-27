// ============================================================================
// ROLE SELECTOR COMPONENT
// ============================================================================
// Dropdown selector for choosing user roles
// ============================================================================

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Check,
  Crown,
  Shield,
  Users,
  Eye,
  Truck,
  Search,
  X,
} from "lucide-react";
import { RoleCode, Role } from "../../types/rbac.generated";
import { useRoles } from "../../hooks/useRoles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RoleSelectorProps {
  value?: RoleCode | RoleCode[];
  onChange?: (value: RoleCode | RoleCode[]) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  searchable?: boolean;
  clearable?: boolean;
  maxSelections?: number;
}

// ============================================================================
// ROLE ICONS
// ============================================================================

const ROLE_ICONS = {
  ADMIN: Crown,
  PROJECT_MANAGER: Shield,
  WORKER: Users,
  VIEWER: Eye,
  DRIVER: Truck,
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RoleSelector({
  value,
  onChange,
  multiple = false,
  placeholder = "Select role...",
  disabled = false,
  error,
  className = "",
  size = "md",
  searchable = true,
  clearable = true,
  maxSelections,
}: RoleSelectorProps) {
  const { roles, isLoading } = useRoles();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedRoles = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value
      ? [value as RoleCode]
      : [];

  const filteredRoles = roles.filter(
    (role) =>
      searchTerm === "" ||
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isMaxSelectionsReached =
    maxSelections && selectedRoles.length >= maxSelections;

  // ============================================================================
  // SIZE VARIANTS
  // ============================================================================

  const sizeClasses = {
    sm: {
      container: "min-h-[32px] text-sm",
      padding: "px-2 py-1",
      icon: "w-3 h-3",
    },
    md: {
      container: "min-h-[40px] text-sm",
      padding: "px-3 py-2",
      icon: "w-4 h-4",
    },
    lg: {
      container: "min-h-[48px] text-base",
      padding: "px-4 py-3",
      icon: "w-5 h-5",
    },
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRoleSelect = (roleCode: RoleCode) => {
    if (disabled) return;

    if (multiple) {
      const newValue = selectedRoles.includes(roleCode)
        ? selectedRoles.filter((r) => r !== roleCode)
        : [...selectedRoles, roleCode];
      onChange?.(newValue);
    } else {
      onChange?.(roleCode);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : (undefined as any));
  };

  const handleToggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSelectedRole = (roleCode: RoleCode) => {
    const role = roles.find((r) => r.code === roleCode);
    if (!role) return null;

    const Icon = ROLE_ICONS[roleCode as keyof typeof ROLE_ICONS] || Shield;

    return (
      <div
        key={roleCode}
        className="inline-flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs"
      >
        <Icon className="w-3 h-3" />
        <span>{role.name}</span>
        {multiple && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRoleSelect(roleCode);
            }}
            className="hover:bg-primary/20 rounded ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  const renderRoleOption = (role: Role) => {
    const isSelected = selectedRoles.includes(role.code);
    const Icon = ROLE_ICONS[role.code as keyof typeof ROLE_ICONS] || Shield;
    const isDisabled = !isSelected && isMaxSelectionsReached;

    return (
      <div
        key={role.code}
        className={`
          flex items-center space-x-3 px-3 py-2 cursor-pointer transition-colors
          ${isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"}
          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onClick={() => !isDisabled && handleRoleSelect(role.code)}
      >
        <Icon className={`${sizeClasses[size].icon} text-muted-foreground`} />
        <div className="flex-1">
          <div className="font-medium">{role.name}</div>
          <div className="text-xs text-muted-foreground">
            {role.description}
          </div>
        </div>
        {isSelected && <Check className={sizeClasses[size].icon} />}
      </div>
    );
  };

  const renderPlaceholder = () => {
    if (selectedRoles.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }

    if (!multiple) {
      const role = roles.find((r) => r.code === selectedRoles[0]);
      return role ? renderSelectedRole(role.code) : null;
    }

    return (
      <div className="flex items-center space-x-1 flex-wrap gap-1">
        {selectedRoles.map(renderSelectedRole)}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div
        className={`
          neomorphic-input flex items-center justify-between cursor-pointer
          ${sizeClasses[size].container} ${sizeClasses[size].padding}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${error ? "border-red-500" : ""}
          ${isOpen ? "ring-2 ring-primary/20" : ""}
        `}
        onClick={handleToggleDropdown}
      >
        <div className="flex-1 min-w-0">{renderPlaceholder()}</div>

        <div className="flex items-center space-x-1 ml-2">
          {clearable && selectedRoles.length > 0 && (
            <button
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className={sizeClasses[size].icon} />
            </button>
          )}
          <ChevronDown
            className={`
              ${sizeClasses[size].icon} text-muted-foreground transition-transform
              ${isOpen ? "rotate-180" : ""}
            `}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
          absolute top-full left-0 right-0 mt-1 z-50
          neomorphic-card border border-border rounded-lg shadow-lg
          max-h-60 overflow-hidden
        "
        >
          {/* Search */}
          {searchable && (
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search roles..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border-0 outline-none"
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading roles...
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchTerm ? "No roles found" : "No roles available"}
              </div>
            ) : (
              filteredRoles.map(renderRoleOption)
            )}
          </div>

          {/* Footer */}
          {multiple && maxSelections && (
            <div className="px-3 py-2 border-t border-border text-xs text-muted-foreground">
              {selectedRoles.length}/{maxSelections} roles selected
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Single role selector (simplified)
 */
export function SingleRoleSelector({
  value,
  onChange,
  ...props
}: Omit<RoleSelectorProps, "multiple">) {
  return (
    <RoleSelector
      value={value}
      onChange={onChange}
      multiple={false}
      {...props}
    />
  );
}

/**
 * Multiple role selector
 */
export function MultipleRoleSelector({
  value,
  onChange,
  maxRoles = 5,
  ...props
}: Omit<RoleSelectorProps, "multiple"> & {
  maxRoles?: number;
}) {
  return (
    <RoleSelector
      value={value}
      onChange={onChange}
      multiple={true}
      maxSelections={maxRoles}
      {...props}
    />
  );
}

/**
 * Admin role selector (filtered)
 */
export function AdminRoleSelector({
  allowedRoles = ["ADMIN", "PROJECT_MANAGER"],
  ...props
}: RoleSelectorProps & {
  allowedRoles?: RoleCode[];
}) {
  // Filter roles to only show allowed ones
  // This would need to be implemented with a custom hook or prop
  return <RoleSelector {...props} placeholder="Select admin role..." />;
}

export default RoleSelector;
