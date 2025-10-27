// ============================================================================
// PERMISSION FORM COMPONENT
// ============================================================================
// Enterprise form for granting/revoking specific permissions
// ============================================================================

"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Key,
  Search,
  Filter,
  Plus,
  Minus,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Lock,
  Unlock,
} from "lucide-react";
import { usePermissions } from "../../hooks/usePermissions";
import { Permission } from "../../types/rbac.generated";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PermissionFormProps {
  userId?: string;
  currentPermissions?: Permission[];
  onSubmit?: (data: PermissionGrant) => Promise<void>;
  onCancel?: () => void;
  className?: string;
  mode?: "grant" | "revoke" | "edit";
  groupByDomain?: boolean;
}

export interface PermissionGrant {
  userId: string;
  permissionsToGrant: Permission[];
  permissionsToRevoke: Permission[];
  reason?: string;
  expiresAt?: string;
  resourceContext?: Record<string, unknown>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PermissionForm({
  userId,
  currentPermissions = [],
  onSubmit,
  onCancel,
  className = "",
  mode = "edit",
  groupByDomain = true,
}: PermissionFormProps) {
  const { availablePermissions, permissionsByDomain, isLoading } =
    usePermissions();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [selectedPermissions, setSelectedPermissions] =
    useState<Permission[]>(currentPermissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredPermissions = useMemo(() => {
    let permissions = availablePermissions || [];

    // Filter by search term
    if (searchTerm) {
      permissions = permissions.filter((permission) =>
        permission.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by domain
    if (selectedDomain) {
      permissions = permissions.filter((permission) =>
        permission.startsWith(selectedDomain)
      );
    }

    return permissions;
  }, [availablePermissions, searchTerm, selectedDomain]);

  const groupedPermissions = useMemo(() => {
    if (!groupByDomain) return { "All Permissions": filteredPermissions };

    const groups: Record<string, Permission[]> = {};
    filteredPermissions.forEach((permission) => {
      const domain = permission.split(".")[0] || "Other";
      if (!groups[domain]) groups[domain] = [];
      groups[domain].push(permission);
    });

    return groups;
  }, [filteredPermissions, groupByDomain]);

  const domains = Object.keys(permissionsByDomain || {});
  const hasChanges =
    JSON.stringify(selectedPermissions.sort()) !==
    JSON.stringify(currentPermissions.sort());

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePermissionToggle = (permission: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSelectAllInGroup = (permissions: Permission[]) => {
    const allSelected = permissions.every((p) =>
      selectedPermissions.includes(p)
    );

    if (allSelected) {
      // Deselect all in group
      setSelectedPermissions((prev) =>
        prev.filter((p) => !permissions.includes(p))
      );
    } else {
      // Select all in group
      setSelectedPermissions((prev) => {
        const newSelection = [...prev];
        permissions.forEach((p) => {
          if (!newSelection.includes(p)) {
            newSelection.push(p);
          }
        });
        return newSelection;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit || !userId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const permissionsToGrant = selectedPermissions.filter(
        (p) => !currentPermissions.includes(p)
      );
      const permissionsToRevoke = currentPermissions.filter(
        (p) => !selectedPermissions.includes(p)
      );

      await onSubmit({
        userId,
        permissionsToGrant,
        permissionsToRevoke,
        reason: reason.trim() || undefined,
        expiresAt: expiresAt || undefined,
      });

      setReason("");
      setExpiresAt("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Permission grant failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderPermissionItem = (permission: Permission) => {
    const isSelected = selectedPermissions.includes(permission);
    const isCurrentPermission = currentPermissions.includes(permission);
    const willBeGranted = isSelected && !isCurrentPermission;
    const willBeRevoked = !isSelected && isCurrentPermission;

    const [domain, action] = permission.split(".");

    return (
      <div
        key={permission}
        className={`
          neomorphic-button p-3 cursor-pointer transition-all duration-200 text-left
          ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}
          ${willBeGranted ? "border-green-300 bg-green-50" : ""}
          ${willBeRevoked ? "border-red-300 bg-red-50" : ""}
        `}
        onClick={() => handlePermissionToggle(permission)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`
              w-8 h-8 rounded flex items-center justify-center text-xs
              ${isSelected ? "neomorphic-primary" : "neomorphic-inset"}
            `}
            >
              {isSelected ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-primary">{domain}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-sm font-medium text-foreground">
                  {action}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {permission}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            {willBeGranted && (
              <div className="flex items-center text-green-600">
                <Plus className="w-3 h-3 mr-1" />
                Grant
              </div>
            )}
            {willBeRevoked && (
              <div className="flex items-center text-red-600">
                <Minus className="w-3 h-3 mr-1" />
                Revoke
              </div>
            )}
            {isCurrentPermission && isSelected && (
              <div className="flex items-center text-blue-600">
                <Shield className="w-3 h-3 mr-1" />
                Current
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPermissionGroup = (domain: string, permissions: Permission[]) => {
    const selectedInGroup = permissions.filter((p) =>
      selectedPermissions.includes(p)
    ).length;
    const totalInGroup = permissions.length;
    const allSelected = selectedInGroup === totalInGroup;

    return (
      <div key={domain} className="neomorphic-card p-4">
        {/* Group Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 neomorphic-button rounded flex items-center justify-center">
              <Key className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">{domain}</h4>
              <p className="text-xs text-muted-foreground">
                {selectedInGroup}/{totalInGroup} selected
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => handleSelectAllInGroup(permissions)}
            className="neomorphic-button text-xs"
            size="sm"
          >
            {allSelected ? (
              <>
                <Unlock className="w-3 h-3 mr-1" />
                Deselect All
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 mr-1" />
                Select All
              </>
            )}
          </Button>
        </div>

        {/* Permissions in Group */}
        <div className="space-y-2">{permissions.map(renderPermissionItem)}</div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {mode === "grant"
              ? "Grant Permissions"
              : mode === "revoke"
                ? "Revoke Permissions"
                : "Manage Permissions"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Grant or revoke specific permissions for this user
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search permissions..."
            className="neomorphic-input pl-10"
          />
        </div>

        {/* Domain Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="neomorphic-input pl-10 w-full"
          >
            <option value="">All domains</option>
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Permissions List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-spin" />
            <p className="text-muted-foreground">Loading permissions...</p>
          </div>
        ) : Object.keys(groupedPermissions).length === 0 ? (
          <div className="text-center py-8">
            <Key className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No permissions found</p>
          </div>
        ) : (
          Object.entries(groupedPermissions).map(([domain, permissions]) =>
            renderPermissionGroup(domain, permissions)
          )
        )}
      </div>

      {/* Additional Options */}
      <div className="neomorphic-card p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Reason (optional)
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for permission changes..."
            className="neomorphic-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Expires At (optional)
          </label>
          <Input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="neomorphic-input"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="neomorphic-card p-4 border border-red-300 bg-red-50">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {selectedPermissions.length} permission
          {selectedPermissions.length !== 1 ? "s" : ""} selected
          {hasChanges && (
            <span className="text-primary ml-2 font-medium">
              • Changes pending
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="neomorphic-button"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!hasChanges || isSubmitting || !userId}
            className="neomorphic-primary"
          >
            {isSubmitting ? (
              <Clock className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PermissionForm;
