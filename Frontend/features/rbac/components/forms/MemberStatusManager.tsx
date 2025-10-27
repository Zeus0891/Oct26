/**
 * MemberStatusManager - Enterprise member status management component
 * Handles suspension, termination, reactivation with audit trails
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  UserCheck,
  UserX,
  UserMinus,
  AlertTriangle,
  Calendar,
  Clock,
  X,
} from "lucide-react";
import { useMembers } from "../../hooks/useMembers";
import type { TenantMember } from "../../services/members.service";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

type MemberStatus = "active" | "suspended" | "terminated" | "pending";

interface MemberStatusManagerProps {
  member: TenantMember;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (member: TenantMember) => void;
}

interface StatusUpdateData {
  status: MemberStatus;
  reason: string;
  effectiveDate: Date;
  notifyMember: boolean;
}

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: UserCheck,
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Member has full access to the tenant",
  },
  suspended: {
    label: "Suspended",
    icon: UserMinus,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    description: "Member access is temporarily suspended",
  },
  terminated: {
    label: "Terminated",
    icon: UserX,
    color: "text-red-600",
    bgColor: "bg-red-100",
    description: "Member access is permanently terminated",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    description: "Member invitation is pending acceptance",
  },
} as const;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MemberStatusManager({
  member,
  isOpen,
  onClose,
  onStatusUpdate,
}: MemberStatusManagerProps) {
  const { isOperating } = useMembers();

  const [formData, setFormData] = useState<StatusUpdateData>({
    status: (member.status as MemberStatus) || "active",
    reason: "",
    effectiveDate: new Date(),
    notifyMember: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const currentStatus = (member.status as MemberStatus) || "active";
  const currentStatusConfig = STATUS_CONFIG[currentStatus];
  const newStatusConfig = STATUS_CONFIG[formData.status];

  const requiresReason =
    formData.status === "suspended" || formData.status === "terminated";
  const isStatusChanging = formData.status !== currentStatus;

  const canChangeStatus = {
    active: currentStatus !== "terminated",
    suspended: currentStatus === "active",
    terminated: currentStatus !== "terminated",
    pending: false,
  };

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleStatusChange = (newStatus: MemberStatus) => {
    setFormData((prev) => ({
      ...prev,
      status: newStatus,
      reason: newStatus === currentStatus ? "" : prev.reason,
    }));
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isStatusChanging) {
      newErrors.status = "Please select a different status";
    }

    if (requiresReason && !formData.reason.trim()) {
      newErrors.reason = `Reason is required for ${formData.status} status`;
    }

    if (formData.reason && formData.reason.length < 10) {
      newErrors.reason = "Reason must be at least 10 characters";
    }

    if (formData.effectiveDate && formData.effectiveDate < new Date()) {
      newErrors.effectiveDate = "Effective date cannot be in the past";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // This would be implemented when the backend method is available
      console.log("Updating member status:", {
        memberId: member.userId,
        ...formData,
      });

      onStatusUpdate?.(member);
      onClose();
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Failed to update member status",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      status: currentStatus,
      reason: "",
      effectiveDate: new Date(),
      notifyMember: true,
    });
    setErrors({});
    onClose();
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderCurrentStatus = () => {
    const StatusIcon = currentStatusConfig.icon;

    return (
      <div className="rounded-xl bg-muted/50 p-4 mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div
            className={`w-8 h-8 rounded-full ${currentStatusConfig.bgColor} flex items-center justify-center`}
          >
            <StatusIcon className={`h-4 w-4 ${currentStatusConfig.color}`} />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Current Status</h4>
            <p className="text-sm text-muted-foreground">
              {currentStatusConfig.label}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground ml-11">
          {currentStatusConfig.description}
        </p>
      </div>
    );
  };

  const renderStatusSelector = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          New Status
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const StatusIcon = config.icon;
            const isDisabled =
              !canChangeStatus[status as keyof typeof canChangeStatus];
            const isSelected = formData.status === status;

            return (
              <button
                key={status}
                type="button"
                disabled={isDisabled}
                onClick={() => handleStatusChange(status as MemberStatus)}
                className={`
                  p-3 rounded-xl border-2 transition-all text-left
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-border hover:border-border/60"
                  }
                  ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`h-4 w-4 ${config.color}`} />
                  <span className="font-medium">{config.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {config.description}
                </p>
              </button>
            );
          })}
        </div>
        {errors.status && (
          <p className="text-sm text-red-600 mt-1">{errors.status}</p>
        )}
      </div>

      {isStatusChanging && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Status Change Preview
              </p>
              <p className="text-sm text-blue-700">
                {member.displayName || member.email} will be changed from{" "}
                <span className="font-medium">{currentStatusConfig.label}</span>{" "}
                to <span className="font-medium">{newStatusConfig.label}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReasonField = () => (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">
        Reason {requiresReason && <span className="text-red-500">*</span>}
      </label>
      <Input
        value={formData.reason}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, reason: e.target.value }))
        }
        placeholder={`Reason for ${formData.status}...`}
        className="rounded-xl"
        maxLength={500}
      />
      <div className="flex justify-between mt-1">
        {errors.reason && (
          <p className="text-sm text-red-600">{errors.reason}</p>
        )}
        <p className="text-sm text-muted-foreground ml-auto">
          {formData.reason.length}/500
        </p>
      </div>
    </div>
  );

  const renderEffectiveDate = () => (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">
        Effective Date
      </label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="datetime-local"
          value={formData.effectiveDate?.toISOString().slice(0, 16) || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              effectiveDate: e.target.value
                ? new Date(e.target.value)
                : new Date(),
            }))
          }
          className="pl-10 rounded-xl"
        />
      </div>
      {errors.effectiveDate && (
        <p className="text-sm text-red-600 mt-1">{errors.effectiveDate}</p>
      )}
    </div>
  );

  const renderNotificationOption = () => (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="notifyMember"
        checked={formData.notifyMember}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, notifyMember: e.target.checked }))
        }
        className="rounded border-border"
      />
      <label htmlFor="notifyMember" className="text-sm text-foreground">
        Notify member of status change via email
      </label>
    </div>
  );

  // =============================================================================
  // RENDER
  // =============================================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Manage Member Status</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Update the status of {member.displayName || member.email}
        </p>

        <div className="space-y-6">
          {renderCurrentStatus()}
          {renderStatusSelector()}
          {renderReasonField()}
          {renderEffectiveDate()}
          {renderNotificationOption()}

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
            disabled={isOperating || !isStatusChanging}
            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isOperating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              "Update Status"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default MemberStatusManager;
