/**
 * MembersScreen - Enterprise tenant members management screen
 * Comprehensive member management with status control, role assignment, and bulk operations
 */

"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Settings,
  Filter,
  Download,
  UserCheck,
  UserMinus,
  UserX,
  Shield,
} from "lucide-react";
import { useMembers } from "../hooks/useMembers";
import { useTenantContext } from "../hooks/useTenantContext";
import type { TenantMember } from "../services/members.service";
import MemberStatusManager from "../components/forms/MemberStatusManager";
import MemberRoleManager from "../components/forms/MemberRoleManager";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface MembersScreenProps {
  className?: string;
}

type FilterOption = "all" | "active" | "inactive" | "pending" | "suspended";

interface MemberFilters {
  status: FilterOption;
  roles: string[];
  searchQuery: string;
}

// Union type for members (real TenantMember or mock data)
type MemberData = {
  userId: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  status: "active" | "suspended" | "pending" | "inactive";
  roles?: string[];
  joinedAt?: string;
  lastAccessAt?: string;
  department?: string;
  title?: string;
};

interface SelectedMember {
  member: MemberData;
  action: "status" | "roles" | "settings";
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MembersScreen({ className = "" }: MembersScreenProps) {
  const router = useRouter();
  const { currentTenant, isLoading: tenantLoading } = useTenantContext();
  const { members: realMembers, isLoading, refreshMembers } = useMembers();

  // State management
  const [filters, setFilters] = useState<MemberFilters>({
    status: "all",
    roles: [],
    searchQuery: "",
  });

  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const [currentMember, setCurrentMember] = useState<SelectedMember | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

  // =============================================================================
  // MOCK DATA FOR DEVELOPMENT
  // =============================================================================
  const mockMembers = [
    {
      userId: "user-1",
      email: "admin@company.com",
      displayName: "Admin User",
      firstName: "Admin",
      lastName: "User",
      status: "active" as const,
      roles: ["ADMIN"],
      joinedAt: "2024-01-15",
      lastAccessAt: "2024-10-17",
      department: "IT",
      title: "System Administrator",
    },
    {
      userId: "user-2",
      email: "john.doe@company.com",
      displayName: "John Doe",
      firstName: "John",
      lastName: "Doe",
      status: "active" as const,
      roles: ["PROJECT_MANAGER"],
      joinedAt: "2024-02-01",
      lastAccessAt: "2024-10-16",
      department: "Operations",
      title: "Project Manager",
    },
    {
      userId: "user-3",
      email: "jane.smith@company.com",
      displayName: "Jane Smith",
      firstName: "Jane",
      lastName: "Smith",
      status: "suspended" as const,
      roles: ["WORKER"],
      joinedAt: "2024-02-15",
      lastAccessAt: "2024-10-10",
      department: "Field",
      title: "Field Worker",
    },
    {
      userId: "user-4",
      email: "bob.wilson@company.com",
      displayName: "Bob Wilson",
      firstName: "Bob",
      lastName: "Wilson",
      status: "pending" as const,
      roles: ["VIEWER"],
      joinedAt: "2024-03-01",
      lastAccessAt: null,
      department: "Finance",
      title: "Financial Analyst",
    },
  ];

  // Use mock data if no real members, otherwise use real data
  const members = realMembers.length > 0 ? realMembers : mockMembers;

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const filteredMembers = useMemo(() => {
    let filtered = members as MemberData[];

    // Filter by search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (member: MemberData) =>
          member.displayName?.toLowerCase().includes(query) ||
          member.email?.toLowerCase().includes(query) ||
          member.firstName?.toLowerCase().includes(query) ||
          member.lastName?.toLowerCase().includes(query) ||
          member.department?.toLowerCase().includes(query) ||
          member.title?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (member: MemberData) => member.status === filters.status
      );
    }

    // Filter by roles
    if (filters.roles.length > 0) {
      filtered = filtered.filter((member: MemberData) =>
        member.roles?.some((role: string) => filters.roles.includes(role))
      );
    }

    return filtered;
  }, [members, filters]);

  const memberStats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.status === "active").length;
    const suspended = members.filter((m) => m.status === "suspended").length;
    const pending = members.filter((m) => m.status === "pending").length;
    const inactive = total - active;
    const admins = members.filter((m) => m.roles?.includes("ADMIN")).length;

    return { total, active, suspended, pending, inactive, admins };
  }, [members]);

  const hasSelection = selectedMembers.size > 0;
  const allSelected = selectedMembers.size === filteredMembers.length;

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleInviteMember = () => {
    router.push("/modals/rbac/member-invite");
  };

  const handleMemberAction = (
    member: MemberData,
    action: "status" | "roles" | "settings"
  ) => {
    setCurrentMember({ member, action });
  };

  const handleRefresh = async () => {
    await refreshMembers();
  };

  const handleSelectMember = (userId: string, selected: boolean) => {
    setSelectedMembers((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedMembers(new Set(filteredMembers.map((m) => m.userId)));
    } else {
      setSelectedMembers(new Set());
    }
  };

  const handleBulkExport = () => {
    const selectedData = filteredMembers
      .filter((m) => selectedMembers.has(m.userId))
      .map((m) => ({
        email: m.email,
        name: m.displayName,
        status: m.status,
        roles: m.roles?.join(", "),
        department: m.department,
        joinedAt: m.joinedAt,
      }));

    const csv = [
      "Email,Name,Status,Roles,Department,Joined",
      ...selectedData.map(
        (row) =>
          `${row.email},${row.name},${row.status},${row.roles},${row.department},${row.joinedAt}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFilterChange = (
    key: keyof MemberFilters,
    value: string | string[]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { color: "text-green-700", bg: "bg-green-100", icon: UserCheck },
      suspended: {
        color: "text-yellow-700",
        bg: "bg-yellow-100",
        icon: UserMinus,
      },
      pending: { color: "text-blue-700", bg: "bg-blue-100", icon: UserPlus },
      inactive: { color: "text-red-700", bg: "bg-red-100", icon: UserX },
    };
    return configs[status as keyof typeof configs] || configs.inactive;
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => (
    <div className="rounded-2xl border border-border/40 shadow-inner bg-muted/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
            <p className="text-muted-foreground">
              {currentTenant?.name || "Current Tenant"} • {memberStats.total}{" "}
              members
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            className="rounded-xl shadow-inner bg-muted/40 hover:bg-muted/60 transition-colors"
            size="sm"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            onClick={handleInviteMember}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-background/50 p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {memberStats.total}
          </div>
          <div className="text-sm text-muted-foreground">Total Members</div>
        </div>
        <div className="rounded-xl bg-background/50 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {memberStats.active}
          </div>
          <div className="text-sm text-muted-foreground">Active</div>
        </div>
        <div className="rounded-xl bg-background/50 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {memberStats.inactive}
          </div>
          <div className="text-sm text-muted-foreground">Inactive</div>
        </div>
        <div className="rounded-xl bg-background/50 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {memberStats.admins}
          </div>
          <div className="text-sm text-muted-foreground">Admins</div>
        </div>
      </div>
    </div>
  );

  const renderSearchBar = () => (
    <div className="rounded-2xl border border-border/40 shadow-inner bg-muted/30 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
          placeholder="Search members by name, email, department..."
          className="pl-10 rounded-xl bg-background/50 border-border/30"
        />
      </div>
    </div>
  );

  const renderFiltersBar = () => {
    if (!showFilters) return null;

    return (
      <div className="rounded-2xl border border-border/40 shadow-inner bg-muted/30 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Status Filter
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                handleFilterChange("status", e.target.value as FilterOption)
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Department
            </label>
            <select className="w-full rounded-xl border border-border bg-background px-3 py-2">
              <option value="">All Departments</option>
              <option value="IT">IT</option>
              <option value="Operations">Operations</option>
              <option value="Field">Field</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() =>
                setFilters({ status: "all", roles: [], searchQuery: "" })
              }
              className="rounded-xl"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderMembersList = () => (
    <div className="rounded-2xl border border-border/40 shadow-inner bg-muted/30 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Team Members ({filteredMembers.length})
          </h3>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-xl bg-muted/40 hover:bg-muted/60"
              size="sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>

            {hasSelection && (
              <Button
                onClick={handleBulkExport}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export ({selectedMembers.size})
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading members...</span>
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">
              {filters.searchQuery ? "No members found" : "No members yet"}
            </h4>
            <p className="text-muted-foreground mb-6">
              {filters.searchQuery
                ? "Try adjusting your search terms or filters"
                : "Invite your first team member to get started"}
            </p>
            {!filters.searchQuery && (
              <Button
                onClick={handleInviteMember}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite First Member
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Bulk selection header */}
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-background/50 border border-border/30">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm text-muted-foreground">
                {hasSelection
                  ? `${selectedMembers.size} of ${filteredMembers.length} selected`
                  : "Select all members"}
              </span>
            </div>

            {/* Member list */}
            {filteredMembers.map((member) => {
              const statusConfig = getStatusConfig(member.status);
              const StatusIcon = statusConfig.icon;
              const isSelected = selectedMembers.has(member.userId);

              return (
                <div
                  key={member.userId}
                  className={`rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-blue-300 bg-blue-50"
                      : "border-border/30 bg-background/50 hover:bg-background/70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          handleSelectMember(member.userId, e.target.checked)
                        }
                        className="rounded border-border"
                      />

                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                        {member.displayName?.[0] ||
                          member.email[0].toUpperCase()}
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground">
                          {member.displayName || member.email}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                        {(member as MemberData).department && (
                          <p className="text-xs text-muted-foreground">
                            {(member as MemberData).department} •{" "}
                            {(member as MemberData).title}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Roles */}
                      <div className="flex items-center space-x-1">
                        {member.roles?.slice(0, 2).map((role: string) => (
                          <span
                            key={role}
                            className="px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium"
                          >
                            {role}
                          </span>
                        ))}
                        {member.roles && member.roles.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{member.roles.length - 2} more
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center space-x-1">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1 ${statusConfig.bg} ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{member.status}</span>
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => handleMemberAction(member, "status")}
                          className="rounded-lg w-8 h-8 p-0 bg-muted/50 hover:bg-muted/80"
                          size="sm"
                          title="Manage Status"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleMemberAction(member, "roles")}
                          className="rounded-lg w-8 h-8 p-0 bg-muted/50 hover:bg-muted/80"
                          size="sm"
                          title="Manage Roles"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleMemberAction(member, "settings")}
                          className="rounded-lg w-8 h-8 p-0 bg-muted/50 hover:bg-muted/80"
                          size="sm"
                          title="Member Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-2xl border border-border/40 shadow-inner bg-muted/30 p-8">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span className="text-foreground">Loading tenant context...</span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div
        className={`min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 space-y-6 ${className}`}
      >
        {renderHeader()}
        {renderSearchBar()}
        {renderFiltersBar()}
        {renderMembersList()}
      </div>

      {/* Modals */}
      {currentMember?.action === "status" && (
        <MemberStatusManager
          member={currentMember.member as unknown as TenantMember}
          isOpen={true}
          onClose={() => setCurrentMember(null)}
          onStatusUpdate={(member) => {
            console.log("Status updated for:", member);
            handleRefresh();
          }}
        />
      )}

      {currentMember?.action === "roles" && (
        <MemberRoleManager
          member={currentMember.member as unknown as TenantMember}
          isOpen={true}
          onClose={() => setCurrentMember(null)}
          onRolesUpdate={(member, roles) => {
            console.log("Roles updated for:", member, roles);
            handleRefresh();
          }}
        />
      )}

      {currentMember?.action === "settings" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Member Settings</h3>
            <p className="text-muted-foreground mb-4">
              Settings for{" "}
              {currentMember.member.displayName || currentMember.member.email}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              This would redirect to the full member settings page.
            </p>
            <div className="flex space-x-3">
              <Button onClick={() => setCurrentMember(null)} className="flex-1">
                Close
              </Button>
              <Button
                onClick={() => {
                  router.push(
                    `/modals/rbac/member-settings?id=${currentMember.member.userId}`
                  );
                  setCurrentMember(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Open Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Compact members screen for smaller spaces
 */
export function MembersScreenCompact({ className }: { className?: string }) {
  return <MembersScreen className={`p-4 space-y-4 ${className}`} />;
}

export default MembersScreen;
