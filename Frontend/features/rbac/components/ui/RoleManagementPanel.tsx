// ============================================================================
// ROLE MANAGEMENT PANEL
// ============================================================================
// Enterprise role management with permissions and hierarchical structures
// ============================================================================

"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Shield,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  Users,
  Crown,
  Settings,
  Lock,
  Unlock,
  Copy,
  Eye,
} from "lucide-react";
import { useRbac } from "../../hooks";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
}

interface RoleManagementPanelProps {
  className?: string;
  onRoleSelect?: (role: Role) => void;
  onRoleCreate?: () => void;
  onRoleEdit?: (role: Role) => void;
  onRoleDelete?: (role: Role) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RoleManagementPanel({
  className = "",
  onRoleSelect,
  onRoleCreate,
  onRoleEdit,
  onRoleDelete,
}: RoleManagementPanelProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      code: "ADMIN",
      name: "Administrator",
      description: "Full system access with all permissions",
      permissions: ["*"],
      userCount: 2,
      isSystem: true,
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      code: "MANAGER",
      name: "Manager",
      description: "Management access with team oversight permissions",
      permissions: ["estimate:*", "project:*", "user:read", "report:*"],
      userCount: 5,
      isSystem: false,
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "3",
      code: "USER",
      name: "Standard User",
      description: "Basic user access with limited permissions",
      permissions: ["estimate:read", "project:read", "profile:*"],
      userCount: 15,
      isSystem: false,
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-10T14:00:00Z",
    },
    {
      id: "4",
      code: "VIEWER",
      name: "Viewer",
      description: "Read-only access to most resources",
      permissions: ["estimate:read", "project:read", "report:read"],
      userCount: 8,
      isSystem: false,
      isActive: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-12T09:00:00Z",
    },
  ]);

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "1",
      code: "estimate:create",
      name: "Create Estimates",
      description: "Create new estimates",
      category: "Estimates",
    },
    {
      id: "2",
      code: "estimate:read",
      name: "Read Estimates",
      description: "View estimates",
      category: "Estimates",
    },
    {
      id: "3",
      code: "estimate:update",
      name: "Update Estimates",
      description: "Modify existing estimates",
      category: "Estimates",
    },
    {
      id: "4",
      code: "estimate:delete",
      name: "Delete Estimates",
      description: "Remove estimates",
      category: "Estimates",
    },
    {
      id: "5",
      code: "project:create",
      name: "Create Projects",
      description: "Create new projects",
      category: "Projects",
    },
    {
      id: "6",
      code: "project:read",
      name: "Read Projects",
      description: "View projects",
      category: "Projects",
    },
    {
      id: "7",
      code: "user:read",
      name: "View Users",
      description: "View user information",
      category: "Users",
    },
    {
      id: "8",
      code: "user:manage",
      name: "Manage Users",
      description: "Create, edit, and delete users",
      category: "Users",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && role.isActive) ||
        (statusFilter === "inactive" && !role.isActive) ||
        (statusFilter === "system" && role.isSystem);

      return matchesSearch && matchesStatus;
    });
  }, [roles, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = roles.length;
    const active = roles.filter((r) => r.isActive).length;
    const inactive = roles.filter((r) => !r.isActive).length;
    const system = roles.filter((r) => r.isSystem).length;
    const custom = roles.filter((r) => !r.isSystem).length;

    return { total, active, inactive, system, custom };
  }, [roles]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRoles.length === filteredRoles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(filteredRoles.map((r) => r.id));
    }
  };

  const handleRoleStatusToggle = (roleId: string) => {
    setRoles((prev) =>
      prev.map((role) =>
        role.id === roleId ? { ...role, isActive: !role.isActive } : role
      )
    );
  };

  const handleDuplicateRole = (role: Role) => {
    const newRole: Role = {
      ...role,
      id: `${Date.now()}`,
      code: `${role.code}_COPY`,
      name: `${role.name} (Copy)`,
      isSystem: false,
      userCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRoles((prev) => [...prev, newRole]);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getRoleIcon = (role: Role) => {
    if (role.isSystem) {
      return <Crown className="w-4 h-4 text-purple-600" />;
    }

    switch (role.code) {
      case "ADMIN":
        return <Crown className="w-4 h-4 text-purple-600" />;
      case "MANAGER":
        return <Shield className="w-4 h-4 text-blue-600" />;
      case "USER":
        return <Users className="w-4 h-4 text-gray-600" />;
      default:
        return <Key className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPermissionsByCategory = (permissionCodes: string[]) => {
    if (permissionCodes.includes("*")) {
      return { "All Categories": ["Full Access"] };
    }

    const categoryMap: Record<string, string[]> = {};

    permissionCodes.forEach((code) => {
      const permission = permissions.find((p) => p.code === code);
      if (permission) {
        if (!categoryMap[permission.category]) {
          categoryMap[permission.category] = [];
        }
        categoryMap[permission.category].push(permission.name);
      }
    });

    return categoryMap;
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="neomorphic-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Roles</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <Shield className="w-8 h-8 text-primary" />
        </div>
      </div>

      <div className="neomorphic-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <Unlock className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <div className="neomorphic-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
          </div>
          <Lock className="w-8 h-8 text-gray-600" />
        </div>
      </div>

      <div className="neomorphic-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">System</p>
            <p className="text-2xl font-bold text-purple-600">{stats.system}</p>
          </div>
          <Crown className="w-8 h-8 text-purple-600" />
        </div>
      </div>

      <div className="neomorphic-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Custom</p>
            <p className="text-2xl font-bold text-blue-600">{stats.custom}</p>
          </div>
          <Key className="w-8 h-8 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="neomorphic-card p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neomorphic-input pl-9"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="lg:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full neomorphic-input"
          >
            <option value="all">All Roles</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="system">System Roles</option>
            <option value="custom">Custom Roles</option>
          </select>
        </div>

        {/* Add Role Button */}
        <Button onClick={onRoleCreate} className="neomorphic-primary lg:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </Button>
      </div>
    </div>
  );

  const renderRoleCard = (role: Role) => {
    const permissionsByCategory = getPermissionsByCategory(role.permissions);
    const isExpanded = expandedRole === role.id;

    return (
      <div key={role.id} className="neomorphic-card overflow-hidden">
        <div className="p-6">
          {/* Role Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 neomorphic-button rounded-full flex items-center justify-center">
                {getRoleIcon(role)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {role.name}
                  </h3>
                  {role.isSystem && (
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                      System
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${
                      role.isActive
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }`}
                  >
                    {role.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {role.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    {role.code}
                  </code>
                  {" • "}
                  {role.userCount} user{role.userCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                className="neomorphic-button w-8 h-8 p-0"
              >
                <Eye className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDuplicateRole(role)}
                className="neomorphic-button w-8 h-8 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRoleEdit?.(role)}
                className="neomorphic-button w-8 h-8 p-0"
                disabled={role.isSystem}
              >
                <Edit className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRoleStatusToggle(role.id)}
                className="neomorphic-button w-8 h-8 p-0"
                disabled={role.isSystem}
              >
                {role.isActive ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRoleDelete?.(role)}
                className="neomorphic-button w-8 h-8 p-0 text-red-600 hover:text-red-700"
                disabled={role.isSystem || role.userCount > 0}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="neomorphic-button w-8 h-8 p-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Permissions Summary */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              Permissions:
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(permissionsByCategory)
                .slice(0, isExpanded ? undefined : 3)
                .map(([category, perms]) => (
                  <div
                    key={category}
                    className="neomorphic-inset px-3 py-2 rounded-lg"
                  >
                    <div className="text-xs font-medium text-foreground">
                      {category}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {perms.length > 2 && !isExpanded
                        ? `${perms.slice(0, 2).join(", ")} +${perms.length - 2} more`
                        : perms.join(", ")}
                    </div>
                  </div>
                ))}
              {Object.keys(permissionsByCategory).length > 3 && !isExpanded && (
                <button
                  onClick={() => setExpandedRole(role.id)}
                  className="neomorphic-button px-3 py-2 rounded-lg text-xs text-primary hover:text-primary/80"
                >
                  +{Object.keys(permissionsByCategory).length - 3} more
                </button>
              )}
            </div>
          </div>

          {/* Expanded Permissions */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <h4 className="text-sm font-medium text-foreground mb-3">
                All Permissions:
              </h4>
              <div className="space-y-3">
                {Object.entries(permissionsByCategory).map(
                  ([category, perms]) => (
                    <div
                      key={category}
                      className="neomorphic-inset p-3 rounded-lg"
                    >
                      <div className="text-sm font-medium text-foreground mb-2">
                        {category}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {perms.map((perm) => (
                          <div
                            key={perm}
                            className="text-xs text-muted-foreground flex items-center space-x-1"
                          >
                            <Key className="w-3 h-3" />
                            <span>{perm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Role Management
          </h1>
          <p className="text-muted-foreground">
            Configure roles and permissions for your organization
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" className="neomorphic-button">
            <Settings className="w-4 h-4 mr-2" />
            Permissions
          </Button>
          <Button onClick={onRoleCreate} className="neomorphic-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Filters */}
      {renderFilters()}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRoles.map(renderRoleCard)}
      </div>

      {/* Empty State */}
      {filteredRoles.length === 0 && (
        <div className="neomorphic-card p-8 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">
            No roles found
          </h4>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters or search terms"
              : "Get started by creating your first custom role"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button onClick={onRoleCreate} className="neomorphic-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default RoleManagementPanel;
