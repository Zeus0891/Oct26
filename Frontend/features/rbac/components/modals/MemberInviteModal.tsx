/**
 * MemberInviteModal - Modal for inviting new members to tenant
 * Part of RBAC module for enterprise member management
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  UserPlus,
  X,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import { useMembers } from "../../hooks/useMembers";
import { useTenantContext } from "../../hooks/useTenantContext";
import { RoleSelector } from "../ui/RoleSelector";
import type { RoleCode } from "../../types/rbac.generated";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface InviteFormData {
  email: string;
  roles: RoleCode[];
  message?: string;
}

interface MemberInviteModalProps {
  className?: string;
  onClose?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MemberInviteModal({
  className = "",
  onClose,
}: MemberInviteModalProps) {
  const router = useRouter();
  const { currentTenant } = useTenantContext();
  const { refreshMembers } = useMembers();

  const [formData, setFormData] = useState<InviteFormData>({
    email: "",
    roles: [],
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleInputChange = (
    field: keyof InviteFormData,
    value: string | RoleCode[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (formData.roles.length === 0) {
      setError("At least one role must be selected");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Replace with actual invite service call
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      setSuccess(true);
      await refreshMembers();

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send invitation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => (
    <div className="flex items-center justify-between p-6 border-b border-border/30">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <UserPlus className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Invite Team Member
          </h2>
          <p className="text-sm text-muted-foreground">
            Add a new member to {currentTenant?.name || "your team"}
          </p>
        </div>
      </div>

      <Button
        onClick={handleClose}
        variant="ghost"
        size="sm"
        className="rounded-xl h-8 w-8 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Email Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email address"
            className="pl-10 rounded-xl"
            required
          />
        </div>
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Assign Roles *
        </label>
        <RoleSelector
          value={formData.roles}
          onChange={(roles) => handleInputChange("roles", roles as RoleCode[])}
          multiple={true}
          placeholder="Select roles for this member"
          searchable={true}
          className="rounded-xl"
        />
        <p className="text-xs text-muted-foreground">
          Select one or more roles for this member
        </p>
      </div>

      {/* Optional Message */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Welcome Message (Optional)
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => handleInputChange("message", e.target.value)}
          placeholder="Add a personal welcome message..."
          className="w-full rounded-xl border border-border/30 bg-background/50 p-3 text-sm resize-none"
          rows={3}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm text-green-700">
            Invitation sent successfully! Closing modal...
          </span>
        </div>
      )}
    </form>
  );

  const renderFooter = () => (
    <div className="flex items-center justify-end space-x-3 p-6 border-t border-border/30 bg-muted/20">
      <Button
        type="button"
        onClick={handleClose}
        variant="ghost"
        disabled={isSubmitting}
        className="rounded-xl"
      >
        Cancel
      </Button>

      <Button
        type="submit"
        form="invite-form"
        disabled={isSubmitting || success}
        className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
      >
        {isSubmitting ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Sending Invitation...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Send Invitation
          </>
        )}
      </Button>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="rounded-2xl border border-border/40 shadow-2xl bg-background overflow-hidden">
        {renderHeader()}

        <form id="invite-form" onSubmit={handleSubmit}>
          {renderForm()}
        </form>

        {renderFooter()}
      </div>
    </div>
  );
}

export default MemberInviteModal;
