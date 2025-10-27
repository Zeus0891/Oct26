// ============================================================================
// PASSWORD STRENGTH METER COMPONENT
// ============================================================================
// Visual indicator of password strength with validation feedback
// ============================================================================

"use client";

import React, { useMemo } from "react";
import { CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
  minLength?: number;
  className?: string;
}

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

type StrengthLevel = "weak" | "fair" | "good" | "strong" | "excellent";

interface StrengthResult {
  score: number;
  level: StrengthLevel;
  color: string;
  percentage: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PasswordStrengthMeter({
  password,
  showRequirements = true,
  minLength = 8,
  className = "",
}: PasswordStrengthMeterProps) {
  // ============================================================================
  // PASSWORD ANALYSIS
  // ============================================================================

  const requirements: PasswordRequirement[] = useMemo(
    () => [
      {
        id: "length",
        label: `At least ${minLength} characters`,
        test: (pwd) => pwd.length >= minLength,
        met: password.length >= minLength,
      },
      {
        id: "lowercase",
        label: "Contains lowercase letter",
        test: (pwd) => /[a-z]/.test(pwd),
        met: /[a-z]/.test(password),
      },
      {
        id: "uppercase",
        label: "Contains uppercase letter",
        test: (pwd) => /[A-Z]/.test(pwd),
        met: /[A-Z]/.test(password),
      },
      {
        id: "number",
        label: "Contains a number",
        test: (pwd) => /\d/.test(pwd),
        met: /\d/.test(password),
      },
      {
        id: "special",
        label: "Contains special character",
        test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(pwd),
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password),
      },
    ],
    [password, minLength]
  );

  const strengthResult: StrengthResult = useMemo(() => {
    if (!password) {
      return { score: 0, level: "weak", color: "bg-gray-300", percentage: 0 };
    }

    const metRequirements = requirements.filter((req) => req.met).length;
    const score = metRequirements;
    const percentage = (score / requirements.length) * 100;

    let level: StrengthLevel = "weak";
    let color = "bg-red-500";

    if (score >= 5) {
      level = "excellent";
      color = "bg-green-500";
    } else if (score >= 4) {
      level = "strong";
      color = "bg-blue-500";
    } else if (score >= 3) {
      level = "good";
      color = "bg-yellow-500";
    } else if (score >= 2) {
      level = "fair";
      color = "bg-orange-500";
    }

    return { score, level, color, percentage };
  }, [password, requirements]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStrengthBar = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Password Strength
        </span>
        <span
          className={`text-sm font-medium capitalize ${getStrengthTextColor()}`}
        >
          {strengthResult.level}
        </span>
      </div>

      <div className="w-full bg-muted neomorphic-inset rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${strengthResult.color}`}
          style={{ width: `${strengthResult.percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Weak</span>
        <span>Strong</span>
      </div>
    </div>
  );

  const renderRequirements = () => {
    if (!showRequirements) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Requirements</h4>
        <div className="space-y-2">
          {requirements.map((requirement) => (
            <div key={requirement.id} className="flex items-center space-x-2">
              {requirement.met ? (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  requirement.met ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                {requirement.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStrengthIcon = () => {
    const iconProps = { className: "w-5 h-5 mr-2" };

    switch (strengthResult.level) {
      case "excellent":
        return (
          <Shield {...iconProps} className="w-5 h-5 mr-2 text-green-500" />
        );
      case "strong":
        return (
          <CheckCircle {...iconProps} className="w-5 h-5 mr-2 text-blue-500" />
        );
      case "good":
        return (
          <AlertCircle
            {...iconProps}
            className="w-5 h-5 mr-2 text-yellow-500"
          />
        );
      case "fair":
        return (
          <AlertCircle
            {...iconProps}
            className="w-5 h-5 mr-2 text-orange-500"
          />
        );
      default:
        return <XCircle {...iconProps} className="w-5 h-5 mr-2 text-red-500" />;
    }
  };

  const getStrengthTextColor = () => {
    switch (strengthResult.level) {
      case "excellent":
        return "text-green-600";
      case "strong":
        return "text-blue-600";
      case "good":
        return "text-yellow-600";
      case "fair":
        return "text-orange-600";
      default:
        return "text-red-600";
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`neomorphic-card p-4 space-y-4 ${className}`}>
      <div className="flex items-center">
        {renderStrengthIcon()}
        <span className={`font-medium capitalize ${getStrengthTextColor()}`}>
          {strengthResult.level} Password
        </span>
      </div>

      {renderStrengthBar()}
      {renderRequirements()}

      {strengthResult.level === "excellent" && (
        <div className="neomorphic-inset p-3 rounded-lg bg-green-50">
          <div className="flex items-center text-green-700">
            <Shield className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              Excellent! Your password is very secure.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordStrengthMeter;
