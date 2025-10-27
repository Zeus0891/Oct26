/**
 * MemberRoleManager - Enterprise role assignment and management component
 * Handles multiple role assignments with effective dates and bulk operations
 */

"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Shield, Plus, Minus, AlertTriangle, Users, X } from "lucide-react";
import { useRoles } from "../../hooks/useRoles";
import { useMembers } from "../../hooks/useMembers";
import type { TenantMember } from "../../services/members.service";
import type { RoleCode } from "../../types/rbac.generated";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface RoleAssignment {
  roleCode: RoleCode;
  effectiveFrom?: Date;
  effectiveUntil?: Date;
  assignedReason?: string;
  isNew?: boolean;
  isRemoved?: boolean;
}

interface MemberRoleManagerProps {
  member: TenantMember;
  isOpen: boolean;
  onClose: () => void;
  onRolesUpdate?: (member: TenantMember, roles: RoleAssignment[]) => void;
}

const ROLE_PRIORITY = {
  ADMIN: 1,
  PROJECT_MANAGER: 2,
  ESTIMATOR: 3,
  FIELD_SUPERVISOR: 4,
  WORKER: 5,
  VIEWER: 6,
} as const;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MemberRoleManager({
  member,
  isOpen,
  onClose,
  onRolesUpdate,
}: MemberRoleManagerProps) {
  const { roles: availableRoles } = useRoles();
  const { isOperating } = useMembers();

  // Initialize role assignments from member's current roles
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>(
    () => {
      return (member.roles || []).map((roleCode) => ({
        roleCode: roleCode as RoleCode,
        effectiveFrom: new Date(),
        assignedReason: "Existing assignment",
      }));
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bulkOperation, setBulkOperation] = useState<{
    effectiveFrom?: Date;
    effectiveUntil?: Date;
    reason?: string;
  }>({});

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const currentRoleCodes = useMemo(
    () => new Set((member.roles || []).map((r) => r as RoleCode)),
    [member.roles]
  );

  const assignedRoleCodes = useMemo(
    () =>
      new Set(
        roleAssignments.filter((ra) => !ra.isRemoved).map((ra) => ra.roleCode)
      ),
    [roleAssignments]
  );

  const availableToAdd = useMemo(
    () =>
      availableRoles.filter(
        (role) => !assignedRoleCodes.has(role.code as RoleCode)
      ),
    [availableRoles, assignedRoleCodes]
  );

  const hasChanges = useMemo(() => {
    const currentSet = currentRoleCodes;
    const newSet = assignedRoleCodes;

    if (currentSet.size !== newSet.size) return true;

    for (const roleCode of newSet) {
      if (!currentSet.has(roleCode)) return true;
    }

    return false;
  }, [currentRoleCodes, assignedRoleCodes]);

  const sortedAssignments = useMemo(
    () =>
      [...roleAssignments]
        .filter((ra) => !ra.isRemoved)
        .sort((a, b) => {
          const priorityA =
            ROLE_PRIORITY[a.roleCode as keyof typeof ROLE_PRIORITY] || 999;
          const priorityB =
            ROLE_PRIORITY[b.roleCode as keyof typeof ROLE_PRIORITY] || 999;
          return priorityA - priorityB;
        }),
    [roleAssignments]
  );

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const addRole = (roleCode: RoleCode) => {
    const newAssignment: RoleAssignment = {
      roleCode,
      effectiveFrom: bulkOperation.effectiveFrom || new Date(),
      effectiveUntil: bulkOperation.effectiveUntil,
      assignedReason: bulkOperation.reason || "Manual assignment",
      isNew: true,
    };

    setRoleAssignments((prev) => [...prev, newAssignment]);
    setErrors({});
  };

  const removeRole = (roleCode: RoleCode) => {
    setRoleAssignments((prev) =>
      prev.map((ra) =>
        ra.roleCode === roleCode ? { ...ra, isRemoved: true } : ra
      )
    );
    setErrors({});
  };

  const updateRoleAssignment = (
    roleCode: RoleCode,
    updates: Partial<RoleAssignment>
  ) => {
    setRoleAssignments((prev) =>
      prev.map((ra) => (ra.roleCode === roleCode ? { ...ra, ...updates } : ra))
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Check if at least one role is assigned
    if (assignedRoleCodes.size === 0) {
      newErrors.roles = "At least one role must be assigned";
    }

    // Validate date ranges
    roleAssignments.forEach((ra) => {
      if (
        ra.effectiveFrom &&
        ra.effectiveUntil &&
        ra.effectiveFrom >= ra.effectiveUntil
      ) {
        newErrors[`${ra.roleCode}_dates`] =
          "Effective until must be after effective from";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const finalAssignments = roleAssignments.filter((ra) => !ra.isRemoved);

      // This would call the actual API
      console.log("Updating member roles:", {
        memberId: member.userId,
        roles: finalAssignments,
      });

      onRolesUpdate?.(member, finalAssignments);
      onClose();
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Failed to update member roles",
      });
    }
  };

  const handleCancel = () => {
    // Reset to original state
    setRoleAssignments(
      (member.roles || []).map((roleCode) => ({
        roleCode: roleCode as RoleCode,
        effectiveFrom: new Date(),
        assignedReason: "Existing assignment",
      }))
    );
    setErrors({});
    setBulkOperation({});
    onClose();
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderCurrentRoles = () => (
    <div className="rounded-xl bg-muted/50 p-4 mb-6">
      <h4 className="font-medium text-foreground mb-3 flex items-center">
        <Shield className="h-4 w-4 mr-2" />
        Current Roles ({currentRoleCodes.size})
      </h4>
      {currentRoleCodes.size === 0 ? (
        <p className="text-sm text-muted-foreground">No roles assigned</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {Array.from(currentRoleCodes).map((roleCode) => (
            <span
              key={roleCode}
              className="px-2 py-1 rounded-lg bg-blue-100 text-blue-800 text-sm font-medium"
            >
              {roleCode}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderBulkOperations = () => (
    <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-6">
      <h4 className="font-medium text-blue-800 mb-3 flex items-center">
        <Users className="h-4 w-4 mr-2" />
        Bulk Assignment Settings
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-blue-700 mb-1 block">
            Default Effective From
          </label>
          <Input
            type="datetime-local"
            value={
              bulkOperation.effectiveFrom?.toISOString().slice(0, 16) || ""
            }
            onChange={(e) =>
              setBulkOperation((prev) => ({
                ...prev,
                effectiveFrom: e.target.value
                  ? new Date(e.target.value)
                  : undefined,
              }))
            }
            className="text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-blue-700 mb-1 block">
            Default Effective Until
          </label>
          <Input
            type="datetime-local"
            value={
              bulkOperation.effectiveUntil?.toISOString().slice(0, 16) || ""
            }
            onChange={(e) =>
              setBulkOperation((prev) => ({
                ...prev,
                effectiveUntil: e.target.value
                  ? new Date(e.target.value)
                  : undefined,
              }))
            }
            className="text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-blue-700 mb-1 block">
            Default Reason
          </label>
          <Input
            value={bulkOperation.reason || ""}
            onChange={(e) =>
              setBulkOperation((prev) => ({ ...prev, reason: e.target.value }))
            }
            placeholder="Reason for role assignments..."
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderRoleAssignments = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-foreground flex items-center justify-between">
        <span>Role Assignments ({sortedAssignments.length})</span>
        {hasChanges && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-md">
            Changes pending
          </span>
        )}
      </h4>

      {errors.roles && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{errors.roles}</p>
        </div>
      )}

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {sortedAssignments.map((assignment) => {
          const isNew = assignment.isNew;
          const hasDateError = errors[`${assignment.roleCode}_dates`];

          return (
            <div
              key={assignment.roleCode}
              className={`rounded-lg border p-3 ${
                isNew
                  ? "border-green-200 bg-green-50"
                  : "border-border bg-background"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-md text-sm font-medium ${
                      isNew
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {assignment.roleCode}
                  </span>
                  {isNew && (
                    <span className="text-xs text-green-600 font-medium">
                      NEW
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeRole(assignment.roleCode)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">
                    Effective From
                  </label>
                  <Input
                    type="datetime-local"
                    value={
                      assignment.effectiveFrom?.toISOString().slice(0, 16) || ""
                    }
                    onChange={(e) =>
                      updateRoleAssignment(assignment.roleCode, {
                        effectiveFrom: e.target.value
                          ? new Date(e.target.value)
                          : undefined,
                      })
                    }
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Effective Until
                  </label>
                  <Input
                    type="datetime-local"
                    value={
                      assignment.effectiveUntil?.toISOString().slice(0, 16) ||
                      ""
                    }
                    onChange={(e) =>
                      updateRoleAssignment(assignment.roleCode, {
                        effectiveUntil: e.target.value
                          ? new Date(e.target.value)
                          : undefined,
                      })
                    }
                    className="text-xs"
                  />
                </div>
              </div>

              {hasDateError && (
                <p className="text-xs text-red-600 mt-1">{hasDateError}</p>
              )}

              <div className="mt-2">
                <label className="text-xs text-muted-foreground">
                  Assignment Reason
                </label>
                <Input
                  value={assignment.assignedReason || ""}
                  onChange={(e) =>
                    updateRoleAssignment(assignment.roleCode, {
                      assignedReason: e.target.value,
                    })
                  }
                  placeholder="Reason for this role..."
                  className="text-xs"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAvailableRoles = () => (
    <div className="space-y-3">
      <h4 className="font-medium text-foreground">
        Available Roles ({availableToAdd.length})
      </h4>
      {availableToAdd.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          All available roles are assigned
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {availableToAdd.map((role) => (
            <button
              key={role.code}
              onClick={() => addRole(role.code as RoleCode)}
              className="flex items-center justify-between p-2 rounded-lg border border-border hover:border-blue-300 hover:bg-blue-50 text-left transition-colors"
            >
              <div>
                <span className="font-medium text-sm">{role.code}</span>
                <p className="text-xs text-muted-foreground">{role.name}</p>
              </div>
              <Plus className="h-4 w-4 text-blue-600" />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // =============================================================================
  // RENDER
  // =============================================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Manage Member Roles</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Manage roles for {member.displayName || member.email}
        </p>

        <div className="space-y-6">
          {renderCurrentRoles()}
          {renderBulkOperations()}
          {renderRoleAssignments()}
          {renderAvailableRoles()}

          {errors.submit && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            onClick={handleCancel}
            disabled={isOperating}
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isOperating || !hasChanges}
            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isOperating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              `Update Roles (${sortedAssignments.length})`
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default MemberRoleManager;
