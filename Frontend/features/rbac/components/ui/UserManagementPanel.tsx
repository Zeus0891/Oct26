// ============================================================================
// USER MANAGEMENT PANEL
// ============================================================================
// Enterprise user management with roles, permissions, and security features
// ============================================================================

"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Key,
  Eye,
  Ban,
  CheckCircle,
  AlertCircle,
  Clock,
  Crown,
  Settings,
} from "lucide-react";
import { useRbac } from "../../hooks";
import { useIdentity } from "../../../identity/hooks";
import { MemberSettingsModal } from "../modals/MemberSettingsModal";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  status: "active" | "inactive" | "suspended" | "pending";
  roles: string[];
  lastLoginAt?: string;
  createdAt: string;
  avatarUrl?: string;
}

interface UserManagementPanelProps {
  className?: string;
  onUserSelect?: (user: User) => void;
  onUserCreate?: () => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (user: User) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UserManagementPanel({
  className = "",
  onUserSelect,
  onUserCreate,
  onUserEdit,
  onUserDelete,
}: UserManagementPanelProps) {
  const { hasPermission } = useRbac();
  const { user: currentUser } = useIdentity();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      email: "admin@company.com",
      firstName: "John",
      lastName: "Admin",
      displayName: "John Admin",
      status: "active",
      roles: ["admin", "manager"],
      lastLoginAt: "2024-01-15T10:30:00Z",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      email: "manager@company.com",
      firstName: "Jane",
      lastName: "Manager",
      displayName: "Jane Manager",
      status: "active",
      roles: ["manager"],
      lastLoginAt: "2024-01-14T14:20:00Z",
      createdAt: "2024-01-02T00:00:00Z",
    },
    {
      id: "3",
      email: "user@company.com",
      firstName: "Bob",
      lastName: "User",
      displayName: "Bob User",
      status: "inactive",
      roles: ["user"],
      createdAt: "2024-01-03T00:00:00Z",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showMemberSettings, setShowMemberSettings] = useState(false);
  const [selectedMemberForSettings, setSelectedMemberForSettings] = useState<
    string | undefined
  >();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      const matchesRole =
        roleFilter === "all" || user.roles.includes(roleFilter);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const inactive = users.filter((u) => u.status === "inactive").length;
    const suspended = users.filter((u) => u.status === "suspended").length;
    const pending = users.filter((u) => u.status === "pending").length;

    return { total, active, inactive, suspended, pending };
  }, [users]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const handleStatusChange = (userId: string, newStatus: User["status"]) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
  };

  const handleOpenMemberSettings = (memberId?: string) => {
    setSelectedMemberForSettings(memberId);
    setShowMemberSettings(true);
  };

  const handleCloseMemberSettings = () => {
    setShowMemberSettings(false);
    setSelectedMemberForSettings(undefined);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getStatusIcon = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "inactive":
        return <Ban className="w-4 h-4 text-gray-600" />;
      case "suspended":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return <Crown className="w-3 h-3 text-purple-600" />;
      case "manager":
        return <Shield className="w-3 h-3 text-blue-600" />;
      case "user":
        return <Users className="w-3 h-3 text-gray-600" />;
      default:
        return <Key className="w-3 h-3 text-gray-600" />;
    }
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="neomorphic-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <Users className="w-8 h-8 text-primary" />
        </div>
      </div>

      <div className="neomorphic-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <div className="neomorphic-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
          </div>
          <Ban className="w-8 h-8 text-gray-600" />
        </div>
      </div>

      <div className="neomorphic-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Suspended</p>
            <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <div className="neomorphic-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
          <Clock className="w-8 h-8 text-yellow-600" />
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
              placeholder="Search users..."
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
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Role Filter */}
        <div className="lg:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full neomorphic-input"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Add User Button */}
        <Button onClick={onUserCreate} className="neomorphic-primary lg:w-auto">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>
    </div>
  );

  const renderUserTable = () => (
    <div className="neomorphic-card overflow-hidden">
      {/* Table Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Users ({filteredUsers.length})
          </h3>

          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedUsers.length} selected
              </span>
              <Button size="sm" variant="ghost" className="neomorphic-button">
                Bulk Actions
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={
                    selectedUsers.length === filteredUsers.length &&
                    filteredUsers.length > 0
                  }
                  onChange={handleSelectAll}
                  className="neomorphic-checkbox"
                />
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                User
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                Roles
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                Last Login
              </th>
              <th className="text-right p-4 font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-t border-border/30 hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => onUserSelect?.(user)}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserToggle(user.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="neomorphic-checkbox"
                  />
                </td>

                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 neomorphic-button rounded-full flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {user.displayName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <span
                    className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}
                  >
                    {getStatusIcon(user.status)}
                    <span className="capitalize">{user.status}</span>
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {getRoleIcon(role)}
                        <span className="capitalize">{role}</span>
                      </span>
                    ))}
                  </div>
                </td>

                <td className="p-4">
                  <div className="text-sm text-muted-foreground">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : "Never"}
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUserEdit?.(user);
                      }}
                      className="neomorphic-button w-8 h-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle view details
                      }}
                      className="neomorphic-button w-8 h-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUserDelete?.(user);
                      }}
                      className="neomorphic-button w-8 h-8 p-0 text-red-600 hover:text-red-700"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">
              No users found
            </h4>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || roleFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : "Get started by creating your first user"}
            </p>
            {!searchTerm && statusFilter === "all" && roleFilter === "all" && (
              <Button onClick={onUserCreate} className="neomorphic-primary">
                <UserPlus className="w-4 h-4 mr-2" />
                Add First User
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across your organization
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => handleOpenMemberSettings()}
            className="neomorphic-button"
          >
            <Settings className="w-4 h-4 mr-2" />
            Member Settings
          </Button>
          <Button onClick={onUserCreate} className="neomorphic-primary">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Filters */}
      {renderFilters()}

      {/* User Table */}
      {renderUserTable()}

      {/* Member Settings Modal */}
      <MemberSettingsModal
        isOpen={showMemberSettings}
        onClose={handleCloseMemberSettings}
        memberId={selectedMemberForSettings}
        title="Member Settings"
      />
    </div>
  );
}

export default UserManagementPanel;
