// ============================================================================
// MEMBER INVITE MODAL
// ============================================================================
// Modal para invitar nuevos miembros al tenant
// ============================================================================

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, UserPlus, Mail, Shield, Send } from "lucide-react";
import { useRoles } from "../../hooks";
import type { RoleCode } from "../../types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface InviteMemberData {
  email: string;
  roles: RoleCode[];
  message?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MemberInviteModal() {
  const router = useRouter();
  const { roles } = useRoles();

  const [formData, setFormData] = useState<InviteMemberData>({
    email: "",
    roles: [],
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (formData.roles.length === 0) {
      newErrors.roles = "At least one role must be selected";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Integrar con el servicio de invitación
      console.log("Inviting member:", formData);

      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Cerrar modal y volver
      router.back();
    } catch (error) {
      console.error("Error inviting member:", error);
      setErrors({ submit: "Failed to send invitation. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleInputChange = (
    field: keyof InviteMemberData,
    value: string | RoleCode[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => (
    <div className="flex items-center justify-between p-6 border-b border-border/50">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 neomorphic-button flex items-center justify-center">
          <UserPlus className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Invite New Member
          </h2>
          <p className="text-sm text-muted-foreground">
            Send an invitation to join your tenant
          </p>
        </div>
      </div>

      <Button
        onClick={handleCancel}
        className="neomorphic-button w-8 h-8 p-0"
        disabled={isLoading}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Email Input */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-foreground">
          <Mail className="w-4 h-4 mr-2 text-primary" />
          Email Address
        </label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="Enter email address"
          className={`neomorphic-input ${errors.email ? "border-red-500" : ""}`}
          disabled={isLoading}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-foreground">
          <Shield className="w-4 h-4 mr-2 text-primary" />
          Assign Roles
        </label>
        <div className="neomorphic-inset p-4 rounded-lg">
          <div className="grid grid-cols-1 gap-3">
            {roles.map((role) => (
              <label
                key={role.code}
                className="flex items-center space-x-3 p-2 rounded hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.roles.includes(role.code)}
                  onChange={(e) => {
                    const newRoles = e.target.checked
                      ? [...formData.roles, role.code]
                      : formData.roles.filter((r) => r !== role.code);
                    handleInputChange("roles", newRoles);
                  }}
                  className="rounded border-border"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground">
                    {role.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {role.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
        {errors.roles && <p className="text-red-500 text-sm">{errors.roles}</p>}
      </div>

      {/* Optional Message */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Personal Message (Optional)
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => handleInputChange("message", e.target.value)}
          placeholder="Add a personal message to the invitation..."
          rows={3}
          className="w-full neomorphic-input resize-none"
          disabled={isLoading}
        />
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}
    </form>
  );

  const renderFooter = () => (
    <div className="flex items-center justify-end space-x-3 p-6 border-t border-border/50">
      <Button
        type="button"
        onClick={handleCancel}
        className="neomorphic-button"
        disabled={isLoading}
      >
        Cancel
      </Button>

      <Button
        type="submit"
        onClick={handleSubmit}
        className="neomorphic-primary"
        disabled={isLoading || !formData.email || formData.roles.length === 0}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl neomorphic-card rounded-2xl overflow-hidden">
        {renderHeader()}
        {renderForm()}
        {renderFooter()}
      </div>
    </div>
  );
}

export default MemberInviteModal;
