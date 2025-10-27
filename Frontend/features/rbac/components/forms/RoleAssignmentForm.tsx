// ============================================================================
// ROLE ASSIGNMENT FORM COMPONENT
// ============================================================================
// Simplified form for quick role assignments
// ============================================================================

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  UserPlus,
  Shield,
  Crown,
  Users,
  Search,
  CheckCircle,
  X,
  Save,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useRoles } from "../../hooks/useRoles";
import { RoleCode, Role } from "../../types/rbac.generated";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RoleAssignmentFormProps {
  onSubmit?: (data: QuickRoleAssignment) => Promise<void>;
  onCancel?: () => void;
  className?: string;
  preselectedRole?: RoleCode;
  multiple?: boolean;
}

export interface QuickRoleAssignment {
  userEmail: string;
  roles: RoleCode[];
  reason?: string;
  sendInvite?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RoleAssignmentForm({
  onSubmit,
  onCancel,
  className = "",
  preselectedRole,
  multiple = true,
}: RoleAssignmentFormProps) {
  const { roles, isLoading: rolesLoading } = useRoles();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [userEmail, setUserEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<RoleCode[]>(
    preselectedRole ? [preselectedRole] : []
  );
  const [reason, setReason] = useState("");
  const [sendInvite, setSendInvite] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid =
    userEmail && isValidEmail(userEmail) && selectedRoles.length > 0;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRoleToggle = (roleCode: RoleCode) => {
    if (!multiple) {
      setSelectedRoles([roleCode]);
      return;
    }

    setSelectedRoles((prev) =>
      prev.includes(roleCode)
        ? prev.filter((r) => r !== roleCode)
        : [...prev, roleCode]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit || !isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        userEmail: userEmail.trim(),
        roles: selectedRoles,
        reason: reason.trim() || undefined,
        sendInvite,
      });

      // Reset form on success
      setUserEmail("");
      setSelectedRoles(preselectedRole ? [preselectedRole] : []);
      setReason("");
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

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderRoleCard = (role: Role) => {
    const isSelected = selectedRoles.includes(role.code);

    return (
      <div
        key={role.code}
        className={`
          neomorphic-button p-4 cursor-pointer transition-all duration-200
          ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}
        `}
        onClick={() => handleRoleToggle(role.code)}
      >
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
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">{role.name}</h4>
              {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground">{role.description}</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {role.code}
            </p>
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
      <div className="text-center">
        <div className="w-16 h-16 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Assign Role{multiple ? "s" : ""}
        </h2>
        <p className="text-sm text-muted-foreground">
          {multiple
            ? "Assign one or more roles to a user"
            : "Assign a role to a user"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Email */}
        <div className="neomorphic-card p-6">
          <label className="block text-sm font-medium text-foreground mb-3">
            User Email
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="user@example.com"
              className={`neomorphic-input pl-10 ${
                userEmail && !isValidEmail(userEmail) ? "border-red-500" : ""
              }`}
              required
            />
          </div>
          {userEmail && !isValidEmail(userEmail) && (
            <p className="text-red-500 text-sm mt-1">
              Please enter a valid email address
            </p>
          )}
        </div>

        {/* Role Selection */}
        <div className="neomorphic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-foreground">
              Select Role{multiple ? "s" : ""}
            </label>
            <span className="text-xs text-muted-foreground">
              {selectedRoles.length} selected
            </span>
          </div>

          {/* Role Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search roles..."
              className="neomorphic-input pl-10"
            />
          </div>

          {/* Roles Grid */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
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
              filteredRoles.map(renderRoleCard)
            )}
          </div>
        </div>

        {/* Additional Options */}
        <div className="neomorphic-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Reason (optional)
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for role assignment..."
              className="neomorphic-input"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="sendInvite"
              checked={sendInvite}
              onChange={(e) => setSendInvite(e.target.checked)}
              className="neomorphic-checkbox"
            />
            <label htmlFor="sendInvite" className="text-sm text-foreground">
              Send invitation email to user
            </label>
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
        <div className="flex items-center justify-between pt-6">
          <div className="text-sm text-muted-foreground">
            {selectedRoles.length > 0 && <>Roles: {selectedRoles.join(", ")}</>}
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
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="neomorphic-primary"
            >
              {isSubmitting ? (
                <Clock className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSubmitting
                ? "Assigning..."
                : `Assign Role${multiple ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Single role assignment (simplified)
 */
export function SingleRoleAssignment({
  roleCode,
  onComplete,
  className,
}: {
  roleCode: RoleCode;
  onComplete?: (email: string) => void;
  className?: string;
}) {
  return (
    <RoleAssignmentForm
      preselectedRole={roleCode}
      multiple={false}
      onSubmit={async (data) => {
        console.log("Single role assignment:", data);
        onComplete?.(data.userEmail);
      }}
      className={className}
    />
  );
}

/**
 * Admin role assignment (quick action)
 */
export function AdminRoleAssignment({
  onComplete,
  className,
}: {
  onComplete?: () => void;
  className?: string;
}) {
  return (
    <SingleRoleAssignment
      roleCode="ADMIN"
      onComplete={() => onComplete?.()}
      className={className}
    />
  );
}

export default RoleAssignmentForm;
