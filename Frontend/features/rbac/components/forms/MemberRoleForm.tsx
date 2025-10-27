// ============================================================================
// MEMBER ROLE FORM COMPONENT
// ============================================================================
// Enterprise form for assigning/unassigning roles to members
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Users,
  Shield,
  Plus,
  Minus,
  Save,
  X,
  Search,
  Crown,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useRoles } from "../../hooks/useRoles";
import { useMembers } from "../../hooks/useMembers";
import { RoleCode, Role } from "../../types/rbac.generated";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MemberRoleFormProps {
  userId?: string;
  currentRoles?: RoleCode[];
  onSubmit?: (data: MemberRoleAssignment) => Promise<void>;
  onCancel?: () => void;
  className?: string;
  mode?: "assign" | "unassign" | "edit";
}

export interface MemberRoleAssignment {
  userId: string;
  rolesToAssign: RoleCode[];
  rolesToUnassign: RoleCode[];
  reason?: string;
  expiresAt?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MemberRoleForm({
  userId,
  currentRoles = [],
  onSubmit,
  onCancel,
  className = "",
  mode = "edit",
}: MemberRoleFormProps) {
  const { roles, isLoading: rolesLoading } = useRoles();
  const { members, getMember } = useMembers();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [selectedUserId, setSelectedUserId] = useState(userId || "");
  const [selectedRoles, setSelectedRoles] = useState<RoleCode[]>(currentRoles);
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberInfo, setMemberInfo] = useState<any>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (selectedUserId && getMember) {
      getMember(selectedUserId).then(setMemberInfo).catch(console.error);
    }
  }, [selectedUserId, getMember]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRoleToggle = (roleCode: RoleCode) => {
    setSelectedRoles((prev) =>
      prev.includes(roleCode)
        ? prev.filter((r) => r !== roleCode)
        : [...prev, roleCode]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit || !selectedUserId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const rolesToAssign = selectedRoles.filter(
        (role) => !currentRoles.includes(role)
      );
      const rolesToUnassign = currentRoles.filter(
        (role) => !selectedRoles.includes(role)
      );

      await onSubmit({
        userId: selectedUserId,
        rolesToAssign,
        rolesToUnassign,
        reason: reason.trim() || undefined,
        expiresAt: expiresAt || undefined,
      });

      // Reset form on success
      setReason("");
      setExpiresAt("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Assignment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasChanges =
    JSON.stringify(selectedRoles.sort()) !==
    JSON.stringify(currentRoles.sort());

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderMemberInfo = () => {
    if (!memberInfo) return null;

    return (
      <div className="neomorphic-card p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 neomorphic-button rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground">
              {memberInfo.displayName ||
                `${memberInfo.firstName} ${memberInfo.lastName}`}
            </h4>
            <p className="text-sm text-muted-foreground">{memberInfo.email}</p>
            <p className="text-xs text-muted-foreground">
              Current roles:{" "}
              {currentRoles.length > 0 ? currentRoles.join(", ") : "None"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderRoleItem = (role: Role) => {
    const isSelected = selectedRoles.includes(role.code);
    const isCurrentRole = currentRoles.includes(role.code);
    const willBeAssigned = isSelected && !isCurrentRole;
    const willBeUnassigned = !isSelected && isCurrentRole;

    return (
      <div
        key={role.code}
        className={`
          neomorphic-button p-4 cursor-pointer transition-all duration-200
          ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}
          ${willBeAssigned ? "border-green-300 bg-green-50" : ""}
          ${willBeUnassigned ? "border-red-300 bg-red-50" : ""}
        `}
        onClick={() => handleRoleToggle(role.code)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${isSelected ? "neomorphic-primary" : "neomorphic-inset"}
            `}
            >
              {role.code === "ADMIN" ? (
                <Crown className="h-5 w-5" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
            </div>
            <div>
              <h5 className="font-medium text-foreground">{role.name}</h5>
              <p className="text-sm text-muted-foreground">
                {role.description}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {role.code}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {willBeAssigned && (
              <div className="flex items-center text-green-600 text-sm">
                <Plus className="w-4 h-4 mr-1" />
                Assign
              </div>
            )}
            {willBeUnassigned && (
              <div className="flex items-center text-red-600 text-sm">
                <Minus className="w-4 h-4 mr-1" />
                Remove
              </div>
            )}
            {isCurrentRole && isSelected && (
              <div className="flex items-center text-blue-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Current
              </div>
            )}
          </div>
        </div>
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
            {mode === "assign"
              ? "Assign Roles"
              : mode === "unassign"
                ? "Remove Roles"
                : "Manage Member Roles"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Assign or remove roles for tenant members
          </p>
        </div>
      </div>

      {/* Member Info */}
      {renderMemberInfo()}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search roles..."
          className="neomorphic-input pl-10"
        />
      </div>

      {/* Roles List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {rolesLoading ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-spin" />
            <p className="text-muted-foreground">Loading roles...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No roles found</p>
          </div>
        ) : (
          filteredRoles.map(renderRoleItem)
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
            placeholder="Reason for role changes..."
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
          {selectedRoles.length} role{selectedRoles.length !== 1 ? "s" : ""}{" "}
          selected
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
            disabled={!hasChanges || isSubmitting || !selectedUserId}
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

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Quick role assignment for single role
 */
export function QuickRoleAssign({
  userId,
  roleCode,
  onComplete,
  className,
}: {
  userId: string;
  roleCode: RoleCode;
  onComplete?: () => void;
  className?: string;
}) {
  return (
    <MemberRoleForm
      userId={userId}
      currentRoles={[]}
      mode="assign"
      onSubmit={async (data) => {
        // Simple assignment logic here
        console.log("Quick assign:", data);
        onComplete?.();
      }}
      className={className}
    />
  );
}

export default MemberRoleForm;
