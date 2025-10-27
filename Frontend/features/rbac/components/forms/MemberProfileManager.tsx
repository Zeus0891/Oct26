/**
 * MemberProfileManager - Enterprise member profile management
 * Complete member information management aligned with backend MemberProfile interface
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { User, Building, Mail, DollarSign, Save, X, Edit } from "lucide-react";
import type { TenantMember } from "../../services/members.service";

// =============================================================================
// TYPES & INTERFACES (Aligned with Backend MemberProfile)
// =============================================================================

export interface ExtendedMemberProfile {
  // Basic Info
  userId: string;
  memberNumber?: string;
  displayName?: string;
  title?: string;
  department?: string;

  // Contact Info
  workEmail?: string;
  workPhone?: string;
  mobilePhone?: string;

  // Employment Info
  employeeId?: string;
  hireDate?: Date;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  accessLevel: string;

  // Timeline Info
  lastAccessAt?: Date;
  invitedAt?: Date;
  invitedByMemberId?: string;
  acceptedAt?: Date;
  onboardedAt?: Date;
  suspendedAt?: Date;
  suspendedReason?: string;
  terminatedAt?: Date;
  terminationReason?: string;
  terminatedByMemberId?: string;

  // Financial Info
  costCenter?: string;
  billableRate?: number;
  currency: string;

  // Metadata
  metadata?: Record<string, unknown>;
  tags: string[];
}

interface MemberProfileManagerProps {
  member: TenantMember;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (profile: ExtendedMemberProfile) => void;
  mode?: "view" | "edit";
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MemberProfileManager({
  member,
  isOpen,
  onClose,
  onUpdate,
  mode: initialMode = "view",
}: MemberProfileManagerProps) {
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize profile data with extended fields
  const [profile, setProfile] = useState<ExtendedMemberProfile>({
    userId: member.userId,
    memberNumber: `MBR-${member.userId.slice(-6).toUpperCase()}`,
    displayName: member.displayName || "",
    title: (member as { title?: string })?.title || "",
    department: (member as { department?: string })?.department || "",
    workEmail: member.email,
    workPhone: "",
    mobilePhone: "",
    employeeId: `EMP-${member.userId.slice(-4)}`,
    hireDate: new Date(member.joinedAt || new Date()),
    startDate: new Date(member.joinedAt || new Date()),
    isActive: member.status === "active",
    accessLevel: member.roles?.[0] || "VIEWER",
    lastAccessAt: (member as unknown as { lastAccessAt?: string })?.lastAccessAt
      ? new Date((member as unknown as { lastAccessAt: string }).lastAccessAt)
      : new Date(),
    invitedAt: new Date(member.joinedAt || new Date()),
    costCenter: "CC-001",
    billableRate: 75,
    currency: "USD",
    metadata: {},
    tags: [],
  });

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const canEdit = member.status === "active" || member.status === "suspended";

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const updateProfile = (updates: Partial<ExtendedMemberProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    setErrors({});
  };

  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profile.displayName?.trim()) {
      newErrors.displayName = "Display name is required";
    }

    if (!profile.workEmail?.trim()) {
      newErrors.workEmail = "Work email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.workEmail)) {
      newErrors.workEmail = "Invalid email format";
    }

    if (profile.billableRate && profile.billableRate < 0) {
      newErrors.billableRate = "Billable rate cannot be negative";
    }

    if (profile.workPhone && !/^\+?[\d\s\-\(\)]+$/.test(profile.workPhone)) {
      newErrors.workPhone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateProfile()) return;

    setIsLoading(true);
    try {
      // This would call the actual API
      console.log("Saving member profile:", profile);

      onUpdate?.(profile);
      setMode("view");
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setMode("view");
    setErrors({});
    // Reset profile to original state if needed
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderBasicInfo = () => (
    <Card className="p-4">
      <h3 className="font-medium text-foreground mb-4 flex items-center">
        <User className="w-4 h-4 mr-2" />
        Basic Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Display Name *
          </label>
          {mode === "edit" ? (
            <Input
              value={profile.displayName || ""}
              onChange={(e) => updateProfile({ displayName: e.target.value })}
              className="rounded-xl"
              placeholder="Full display name"
            />
          ) : (
            <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
              {profile.displayName || "Not set"}
            </p>
          )}
          {errors.displayName && (
            <p className="text-sm text-red-600 mt-1">{errors.displayName}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Member Number
          </label>
          <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
            {profile.memberNumber}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Job Title
          </label>
          {mode === "edit" ? (
            <Input
              value={profile.title || ""}
              onChange={(e) => updateProfile({ title: e.target.value })}
              className="rounded-xl"
              placeholder="Job title"
            />
          ) : (
            <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
              {profile.title || "Not set"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Department
          </label>
          {mode === "edit" ? (
            <select
              value={profile.department || ""}
              onChange={(e) => updateProfile({ department: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="">Select department</option>
              <option value="IT">Information Technology</option>
              <option value="Operations">Operations</option>
              <option value="Field">Field Operations</option>
              <option value="Finance">Finance & Accounting</option>
              <option value="HR">Human Resources</option>
              <option value="Sales">Sales & Marketing</option>
            </select>
          ) : (
            <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
              {profile.department || "Not set"}
            </p>
          )}
        </div>
      </div>
    </Card>
  );

  const renderContactInfo = () => (
    <Card className="p-4">
      <h3 className="font-medium text-foreground mb-4 flex items-center">
        <Mail className="w-4 h-4 mr-2" />
        Contact Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Work Email *
          </label>
          {mode === "edit" ? (
            <Input
              type="email"
              value={profile.workEmail || ""}
              onChange={(e) => updateProfile({ workEmail: e.target.value })}
              className="rounded-xl"
              placeholder="work@company.com"
            />
          ) : (
            <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
              {profile.workEmail}
            </p>
          )}
          {errors.workEmail && (
            <p className="text-sm text-red-600 mt-1">{errors.workEmail}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Work Phone
          </label>
          {mode === "edit" ? (
            <Input
              type="tel"
              value={profile.workPhone || ""}
              onChange={(e) => updateProfile({ workPhone: e.target.value })}
              className="rounded-xl"
              placeholder="+1 (555) 123-4567"
            />
          ) : (
            <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
              {profile.workPhone || "Not set"}
            </p>
          )}
          {errors.workPhone && (
            <p className="text-sm text-red-600 mt-1">{errors.workPhone}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Mobile Phone
          </label>
          {mode === "edit" ? (
            <Input
              type="tel"
              value={profile.mobilePhone || ""}
              onChange={(e) => updateProfile({ mobilePhone: e.target.value })}
              className="rounded-xl"
              placeholder="+1 (555) 987-6543"
            />
          ) : (
            <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
              {profile.mobilePhone || "Not set"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Access Level
          </label>
          <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
            {profile.accessLevel}
          </p>
        </div>
      </div>
    </Card>
  );

  const renderEmploymentInfo = () => (
    <Card className="p-4">
      <h3 className="font-medium text-foreground mb-4 flex items-center">
        <Building className="w-4 h-4 mr-2" />
        Employment Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Employee ID
          </label>
          <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
            {profile.employeeId}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Hire Date
          </label>
          {mode === "edit" ? (
            <Input
              type="date"
              value={profile.hireDate?.toISOString().split("T")[0] || ""}
              onChange={(e) =>
                updateProfile({
                  hireDate: e.target.value
                    ? new Date(e.target.value)
                    : undefined,
                })
              }
              className="rounded-xl"
            />
          ) : (
            <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
              {profile.hireDate?.toLocaleDateString() || "Not set"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Start Date
          </label>
          {mode === "edit" ? (
            <Input
              type="date"
              value={profile.startDate?.toISOString().split("T")[0] || ""}
              onChange={(e) =>
                updateProfile({
                  startDate: e.target.value
                    ? new Date(e.target.value)
                    : undefined,
                })
              }
              className="rounded-xl"
            />
          ) : (
            <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
              {profile.startDate?.toLocaleDateString() || "Not set"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Last Access
          </label>
          <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
            {profile.lastAccessAt?.toLocaleString() || "Never"}
          </p>
        </div>
      </div>
    </Card>
  );

  const renderFinancialInfo = () => (
    <Card className="p-4">
      <h3 className="font-medium text-foreground mb-4 flex items-center">
        <DollarSign className="w-4 h-4 mr-2" />
        Financial Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Cost Center
          </label>
          {mode === "edit" ? (
            <Input
              value={profile.costCenter || ""}
              onChange={(e) => updateProfile({ costCenter: e.target.value })}
              className="rounded-xl"
              placeholder="CC-001"
            />
          ) : (
            <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
              {profile.costCenter || "Not set"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Billable Rate ({profile.currency})
          </label>
          {mode === "edit" ? (
            <Input
              type="number"
              min="0"
              step="0.01"
              value={profile.billableRate || ""}
              onChange={(e) =>
                updateProfile({
                  billableRate: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              className="rounded-xl"
              placeholder="75.00"
            />
          ) : (
            <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
              {profile.billableRate
                ? `${profile.currency} ${profile.billableRate}/hour`
                : "Not set"}
            </p>
          )}
          {errors.billableRate && (
            <p className="text-sm text-red-600 mt-1">{errors.billableRate}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Currency
          </label>
          {mode === "edit" ? (
            <select
              value={profile.currency}
              onChange={(e) => updateProfile({ currency: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          ) : (
            <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-xl">
              {profile.currency}
            </p>
          )}
        </div>
      </div>
    </Card>
  );

  // =============================================================================
  // RENDER
  // =============================================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Member Profile</h2>
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                profile.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {profile.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {mode === "view" && canEdit && (
              <Button
                onClick={() => setMode("edit")}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {renderBasicInfo()}
          {renderContactInfo()}
          {renderEmploymentInfo()}
          {renderFinancialInfo()}

          {errors.submit && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}
        </div>

        {mode === "edit" && (
          <div className="flex space-x-3 mt-6 pt-6 border-t border-border">
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default MemberProfileManager;
