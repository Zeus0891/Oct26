// ============================================================================
// PERMISSION LIST COMPONENT
// ============================================================================
// Organized list component for displaying permissions by domain
// ============================================================================

"use client";

import React, { useState, useMemo } from "react";
import {
  Key,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  Circle,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Permission } from "../../types/rbac.generated";
import { usePermissions } from "../../hooks/usePermissions";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PermissionListProps {
  permissions?: Permission[];
  selectedPermissions?: Permission[];
  onPermissionToggle?: (permission: Permission) => void;
  onSelectAll?: (permissions: Permission[]) => void;
  groupByDomain?: boolean;
  searchable?: boolean;
  selectable?: boolean;
  readonly?: boolean;
  showDescription?: boolean;
  className?: string;
  maxHeight?: string;
}

interface PermissionGroup {
  domain: string;
  permissions: Permission[];
  selected: number;
  total: number;
  expanded: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PermissionList({
  permissions: propPermissions,
  selectedPermissions = [],
  onPermissionToggle,
  onSelectAll,
  groupByDomain = true,
  searchable = true,
  selectable = true,
  readonly = false,
  showDescription = true,
  className = "",
  maxHeight = "max-h-96",
}: PermissionListProps) {
  const { availablePermissions, isLoading } = usePermissions();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set()
  );
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  // Use prop permissions or fetch from hook
  const allPermissions = propPermissions || availablePermissions || [];

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredPermissions = useMemo(() => {
    let filtered = allPermissions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((permission) =>
        permission.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected only
    if (showOnlySelected) {
      filtered = filtered.filter((permission) =>
        selectedPermissions.includes(permission)
      );
    }

    return filtered;
  }, [allPermissions, searchTerm, showOnlySelected, selectedPermissions]);

  const permissionGroups = useMemo(() => {
    if (!groupByDomain) {
      return [
        {
          domain: "All Permissions",
          permissions: filteredPermissions,
          selected: filteredPermissions.filter((p) =>
            selectedPermissions.includes(p)
          ).length,
          total: filteredPermissions.length,
          expanded: true,
        },
      ];
    }

    const groups: Record<string, PermissionGroup> = {};

    filteredPermissions.forEach((permission) => {
      const domain = permission.split(".")[0] || "Other";

      if (!groups[domain]) {
        groups[domain] = {
          domain,
          permissions: [],
          selected: 0,
          total: 0,
          expanded: expandedDomains.has(domain),
        };
      }

      groups[domain].permissions.push(permission);
      groups[domain].total++;

      if (selectedPermissions.includes(permission)) {
        groups[domain].selected++;
      }
    });

    return Object.values(groups).sort((a, b) =>
      a.domain.localeCompare(b.domain)
    );
  }, [
    filteredPermissions,
    selectedPermissions,
    groupByDomain,
    expandedDomains,
  ]);

  const totalSelected = selectedPermissions.length;
  const totalAvailable = allPermissions.length;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleDomainToggle = (domain: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domain)) {
      newExpanded.delete(domain);
    } else {
      newExpanded.add(domain);
    }
    setExpandedDomains(newExpanded);
  };

  const handleSelectAllInDomain = (permissions: Permission[]) => {
    if (!onSelectAll) return;
    onSelectAll(permissions);
  };

  const handlePermissionClick = (permission: Permission) => {
    if (readonly || !onPermissionToggle) return;
    onPermissionToggle(permission);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderPermissionItem = (permission: Permission) => {
    const isSelected = selectedPermissions.includes(permission);
    const [domain, action] = permission.split(".");

    return (
      <div
        key={permission}
        className={`
          flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
          ${selectable && !readonly ? "cursor-pointer hover:bg-muted" : ""}
          ${isSelected ? "bg-primary/5 border border-primary/20" : "border border-transparent"}
        `}
        onClick={() => handlePermissionClick(permission)}
      >
        {/* Selection Indicator */}
        {selectable && (
          <div className="flex-shrink-0">
            {isSelected ? (
              <CheckCircle className="w-5 h-5 text-primary" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        )}

        {/* Permission Icon */}
        <div
          className={`
          w-8 h-8 rounded flex items-center justify-center flex-shrink-0
          ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
        `}
        >
          {isSelected ? (
            <Unlock className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
        </div>

        {/* Permission Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-mono text-primary font-medium">
              {domain}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-sm font-semibold text-foreground">
              {action}
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {permission}
          </div>
          {showDescription && (
            <div className="text-xs text-muted-foreground mt-1">
              Allows {action.toLowerCase()} operations on {domain.toLowerCase()}{" "}
              resources
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0">
          {isSelected ? (
            <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
              Granted
            </div>
          ) : (
            <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              Not granted
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDomainGroup = (group: PermissionGroup) => {
    const allSelected = group.selected === group.total && group.total > 0;
    const someSelected = group.selected > 0 && group.selected < group.total;

    return (
      <div key={group.domain} className="neomorphic-card">
        {/* Domain Header */}
        <div
          className={`
            flex items-center justify-between p-4 cursor-pointer
            ${groupByDomain ? "hover:bg-muted/50" : ""}
          `}
          onClick={() => groupByDomain && handleDomainToggle(group.domain)}
        >
          <div className="flex items-center space-x-3">
            {groupByDomain && (
              <div className="text-muted-foreground">
                {group.expanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            )}

            <div className="w-10 h-10 neomorphic-button rounded-full flex items-center justify-center">
              <Key className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h4 className="font-semibold text-foreground">{group.domain}</h4>
              <p className="text-sm text-muted-foreground">
                {group.selected}/{group.total} permissions
                {group.selected > 0 && (
                  <span className="text-primary ml-1">
                    • {group.selected} granted
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Selection Status */}
            <div className="flex items-center space-x-1">
              {allSelected ? (
                <Shield className="w-4 h-4 text-green-600" />
              ) : someSelected ? (
                <Shield className="w-4 h-4 text-yellow-600" />
              ) : (
                <Shield className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Select All Button */}
            {selectable && !readonly && onSelectAll && (
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAllInDomain(group.permissions);
                }}
                className="neomorphic-button text-xs"
                size="sm"
              >
                {allSelected ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Select All
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Permissions List */}
        {(!groupByDomain || group.expanded) && (
          <div className="border-t border-border">
            <div className="p-2 space-y-1">
              {group.permissions.map(renderPermissionItem)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Permissions</h3>
          <p className="text-sm text-muted-foreground">
            {totalSelected}/{totalAvailable} permissions selected
          </p>
        </div>

        {selectable && (
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              onClick={() => setShowOnlySelected(!showOnlySelected)}
              className={`neomorphic-button text-sm ${showOnlySelected ? "bg-primary/10 text-primary" : ""}`}
              size="sm"
            >
              {showOnlySelected ? (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Show All
                </>
              ) : (
                <>
                  <Filter className="w-4 h-4 mr-1" />
                  Show Selected
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search permissions..."
            className="neomorphic-input pl-10"
          />
        </div>
      )}

      {/* Permissions List */}
      <div className={`space-y-3 overflow-y-auto ${maxHeight}`}>
        {isLoading ? (
          <div className="text-center py-8">
            <Key className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
            <p className="text-muted-foreground">Loading permissions...</p>
          </div>
        ) : permissionGroups.length === 0 ? (
          <div className="text-center py-8">
            <Key className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {searchTerm ? "No permissions found" : "No permissions available"}
            </p>
          </div>
        ) : (
          permissionGroups.map(renderDomainGroup)
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Read-only permission list
 */
export function ReadOnlyPermissionList({
  permissions,
  className,
}: {
  permissions: Permission[];
  className?: string;
}) {
  return (
    <PermissionList
      permissions={permissions}
      selectedPermissions={permissions}
      readonly={true}
      selectable={false}
      className={className}
    />
  );
}

/**
 * Permission picker for forms
 */
export function PermissionPicker({
  value = [],
  onChange,
  className,
}: {
  value?: Permission[];
  onChange?: (permissions: Permission[]) => void;
  className?: string;
}) {
  const handleToggle = (permission: Permission) => {
    const newValue = value.includes(permission)
      ? value.filter((p) => p !== permission)
      : [...value, permission];
    onChange?.(newValue);
  };

  const handleSelectAll = (permissions: Permission[]) => {
    const allSelected = permissions.every((p) => value.includes(p));
    const newValue = allSelected
      ? value.filter((p) => !permissions.includes(p))
      : [...new Set([...value, ...permissions])];
    onChange?.(newValue);
  };

  return (
    <PermissionList
      selectedPermissions={value}
      onPermissionToggle={handleToggle}
      onSelectAll={handleSelectAll}
      className={className}
    />
  );
}

export default PermissionList;
