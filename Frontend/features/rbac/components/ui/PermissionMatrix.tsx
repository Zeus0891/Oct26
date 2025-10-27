// ============================================================================
// PERMISSION MATRIX COMPONENT
// ============================================================================
// Visual matrix showing permissions across roles and users
// ============================================================================

"use client";

import React, { useState, useMemo } from "react";
import {
  Grid,
  Users,
  Shield,
  Key,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  Crown,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Permission, RoleCode, Role } from "../../types/rbac.generated";
import { usePermissions } from "../../hooks/usePermissions";
import { useRoles } from "../../hooks/useRoles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PermissionMatrixProps {
  className?: string;
  showUsers?: boolean;
  showRoles?: boolean;
  exportable?: boolean;
  editable?: boolean;
  onPermissionChange?: (
    target: string,
    targetType: "role" | "user",
    permission: Permission,
    granted: boolean
  ) => void;
}

interface MatrixCell {
  targetId: string;
  targetType: "role" | "user";
  targetName: string;
  permission: Permission;
  granted: boolean;
  inherited: boolean;
  source?: string;
}

interface MatrixRow {
  permission: Permission;
  domain: string;
  action: string;
  cells: MatrixCell[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PermissionMatrix({
  className = "",
  showUsers = false,
  showRoles = true,
  exportable = false,
  editable = false,
  onPermissionChange,
}: PermissionMatrixProps) {
  const { availablePermissions, permissionMatrix, isLoading } =
    usePermissions();
  const { roles } = useRoles();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [showInheritedOnly, setShowInheritedOnly] = useState(false);
  const [compactView, setCompactView] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const domains = useMemo(() => {
    const domainSet = new Set<string>();
    (availablePermissions || []).forEach((permission) => {
      const domain = permission.split(".")[0];
      if (domain) domainSet.add(domain);
    });
    return Array.from(domainSet).sort();
  }, [availablePermissions]);

  const targets = useMemo(() => {
    const targetList: Array<{
      id: string;
      name: string;
      type: "role" | "user";
      icon: React.ComponentType<any>;
    }> = [];

    if (showRoles) {
      roles.forEach((role) => {
        targetList.push({
          id: role.code,
          name: role.name,
          type: "role",
          icon: role.code === "ADMIN" ? Crown : Shield,
        });
      });
    }

    // Users would be added here if showUsers is true
    // This would require user data from a users hook

    return targetList;
  }, [roles, showRoles, showUsers]);

  const filteredPermissions = useMemo(() => {
    let filtered = availablePermissions || [];

    if (searchTerm) {
      filtered = filtered.filter((permission) =>
        permission.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDomain) {
      filtered = filtered.filter((permission) =>
        permission.startsWith(selectedDomain)
      );
    }

    return filtered;
  }, [availablePermissions, searchTerm, selectedDomain]);

  const matrixData = useMemo(() => {
    return filteredPermissions.map((permission) => {
      const [domain, action] = permission.split(".");

      const cells: MatrixCell[] = targets.map((target) => {
        // This would normally check actual permission data
        // For now, using mock data based on role hierarchy
        let granted = false;
        let inherited = false;
        let source: string | undefined;

        if (target.type === "role") {
          // Mock permission logic - in real app this would come from permissionMatrix
          if (target.id === "ADMIN") {
            granted = true;
            inherited = false;
          } else if (target.id === "PROJECT_MANAGER") {
            granted =
              !permission.includes("User.delete") &&
              !permission.includes("Tenant.");
            inherited = false;
          } else if (target.id === "WORKER") {
            granted =
              permission.includes("Task.") ||
              permission.includes("Estimate.read");
            inherited = true;
            source = "PROJECT_MANAGER";
          }
        }

        return {
          targetId: target.id,
          targetType: target.type,
          targetName: target.name,
          permission,
          granted,
          inherited,
          source,
        };
      });

      return {
        permission,
        domain,
        action,
        cells,
      };
    });
  }, [filteredPermissions, targets]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCellClick = (cell: MatrixCell) => {
    if (!editable || !onPermissionChange || cell.inherited) return;

    onPermissionChange(
      cell.targetId,
      cell.targetType,
      cell.permission,
      !cell.granted
    );
  };

  const handleExport = () => {
    if (!exportable) return;

    // Create CSV data
    const headers = [
      "Permission",
      "Domain",
      "Action",
      ...targets.map((t) => t.name),
    ];
    const rows = matrixData.map((row) => [
      row.permission,
      row.domain,
      row.action,
      ...row.cells.map((cell) => (cell.granted ? "Yes" : "No")),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "permission-matrix.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderMatrixCell = (cell: MatrixCell) => {
    const isGranted = cell.granted;
    const isInherited = cell.inherited;
    const isEditable = editable && !isInherited;

    return (
      <div
        key={`${cell.targetId}-${cell.permission}`}
        className={`
          w-8 h-8 flex items-center justify-center rounded cursor-pointer
          transition-all duration-200 text-xs font-medium
          ${
            isGranted
              ? isInherited
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-green-100 text-green-700 border border-green-200"
              : "bg-gray-50 text-gray-400 border border-gray-200"
          }
          ${isEditable ? "hover:scale-110" : "cursor-not-allowed"}
          ${compactView ? "w-6 h-6" : "w-8 h-8"}
        `}
        onClick={() => handleCellClick(cell)}
        title={`
          ${cell.permission} for ${cell.targetName}
          Status: ${isGranted ? "Granted" : "Denied"}
          ${isInherited ? `Inherited from: ${cell.source}` : ""}
          ${isEditable ? "Click to toggle" : ""}
        `}
      >
        {isGranted ? (
          <CheckCircle className={compactView ? "w-3 h-3" : "w-4 h-4"} />
        ) : (
          <X className={compactView ? "w-2 h-2" : "w-3 h-3"} />
        )}
      </div>
    );
  };

  const renderMatrixRow = (row: MatrixRow) => (
    <div
      key={row.permission}
      className="flex items-center space-x-2 py-2 border-b border-border/30 hover:bg-muted/30 transition-colors"
    >
      {/* Permission Info */}
      <div className="w-64 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 neomorphic-inset rounded flex items-center justify-center">
            <Key className="w-3 h-3 text-primary" />
          </div>
          <div>
            <div className="text-sm font-mono text-primary">{row.domain}</div>
            <div className="text-xs text-muted-foreground">{row.action}</div>
          </div>
        </div>
      </div>

      {/* Matrix Cells */}
      <div className="flex items-center space-x-1">
        {row.cells.map(renderMatrixCell)}
      </div>
    </div>
  );

  const renderTargetHeaders = () => (
    <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-border">
      <div className="w-64 flex-shrink-0">
        <h4 className="text-sm font-semibold text-foreground">Permissions</h4>
      </div>

      <div className="flex items-center space-x-1">
        {targets.map((target) => {
          const Icon = target.icon;
          return (
            <div
              key={target.id}
              className={`
                flex flex-col items-center justify-center text-center
                ${compactView ? "w-6" : "w-8"}
              `}
              title={target.name}
            >
              <Icon
                className={`${compactView ? "w-3 h-3" : "w-4 h-4"} text-primary mb-1`}
              />
              <span
                className={`${compactView ? "text-xs" : "text-xs"} text-muted-foreground font-medium`}
              >
                {target.name.slice(0, compactView ? 4 : 6)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 neomorphic-button rounded-full flex items-center justify-center">
            <Grid className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Permission Matrix
            </h2>
            <p className="text-sm text-muted-foreground">
              {matrixData.length} permissions across {targets.length}{" "}
              {showRoles && showUsers
                ? "targets"
                : showRoles
                  ? "roles"
                  : "users"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            onClick={() => setCompactView(!compactView)}
            className="neomorphic-button text-sm"
            size="sm"
          >
            {compactView ? (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Expand
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                Compact
              </>
            )}
          </Button>

          {exportable && (
            <Button
              type="button"
              onClick={handleExport}
              className="neomorphic-button text-sm"
              size="sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="neomorphic-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Options */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showInheritedOnly}
                onChange={(e) => setShowInheritedOnly(e.target.checked)}
                className="neomorphic-checkbox"
              />
              <span>Inherited only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div className="neomorphic-card p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Grid className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
            <p className="text-muted-foreground">Loading matrix...</p>
          </div>
        ) : matrixData.length === 0 ? (
          <div className="text-center py-8">
            <Grid className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No permissions found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {renderTargetHeaders()}

            <div className="max-h-96 overflow-y-auto">
              {matrixData.map(renderMatrixRow)}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="neomorphic-card p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Legend</h4>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-green-700" />
            </div>
            <span className="text-muted-foreground">Direct Permission</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-blue-700" />
            </div>
            <span className="text-muted-foreground">Inherited Permission</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
              <X className="w-2 h-2 text-gray-400" />
            </div>
            <span className="text-muted-foreground">No Permission</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Role-only permission matrix
 */
export function RolePermissionMatrix({ className }: { className?: string }) {
  return (
    <PermissionMatrix
      showRoles={true}
      showUsers={false}
      exportable={true}
      className={className}
    />
  );
}

/**
 * Editable permission matrix for admin
 */
export function EditablePermissionMatrix({
  onPermissionChange,
  className,
}: {
  onPermissionChange?: (
    target: string,
    targetType: "role" | "user",
    permission: Permission,
    granted: boolean
  ) => void;
  className?: string;
}) {
  return (
    <PermissionMatrix
      showRoles={true}
      showUsers={true}
      editable={true}
      exportable={true}
      onPermissionChange={onPermissionChange}
      className={className}
    />
  );
}

export default PermissionMatrix;
