// ============================================================================
// ROLE BADGE COMPONENT
// ============================================================================
// Visual badge component for displaying user roles
// ============================================================================

"use client";

import React from "react";
import {
  Crown,
  Shield,
  Users,
  Eye,
  Truck,
  Star,
  Settings,
  Lock,
} from "lucide-react";
import { RoleCode, Role } from "../../types/rbac.generated";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RoleBadgeProps {
  role: RoleCode | Role;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "outline" | "solid" | "gradient";
  showIcon?: boolean;
  showDescription?: boolean;
  className?: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

// ============================================================================
// ROLE CONFIGURATION
// ============================================================================

const ROLE_CONFIG = {
  ADMIN: {
    name: "Admin",
    icon: Crown,
    color: "red",
    description: "Full administrative access",
  },
  PROJECT_MANAGER: {
    name: "Project Manager",
    icon: Shield,
    color: "blue",
    description: "Project and team management",
  },
  WORKER: {
    name: "Worker",
    icon: Users,
    color: "green",
    description: "Field worker with task access",
  },
  VIEWER: {
    name: "Viewer",
    icon: Eye,
    color: "gray",
    description: "Read-only access",
  },
  DRIVER: {
    name: "Driver",
    icon: Truck,
    color: "orange",
    description: "Delivery and transportation",
  },
} as const;

// ============================================================================
// STYLE VARIANTS
// ============================================================================

const sizeClasses = {
  xs: {
    container: "px-2 py-1 text-xs",
    icon: "w-3 h-3",
    text: "text-xs",
  },
  sm: {
    container: "px-2.5 py-1.5 text-xs",
    icon: "w-3.5 h-3.5",
    text: "text-xs",
  },
  md: {
    container: "px-3 py-1.5 text-sm",
    icon: "w-4 h-4",
    text: "text-sm",
  },
  lg: {
    container: "px-4 py-2 text-sm",
    icon: "w-5 h-5",
    text: "text-sm",
  },
};

const getColorClasses = (color: string, variant: string) => {
  const colorMap = {
    red: {
      default: "bg-red-50 text-red-700 border-red-200",
      outline: "border-red-300 text-red-600 hover:bg-red-50",
      solid: "bg-red-600 text-white",
      gradient: "bg-gradient-to-r from-red-500 to-red-600 text-white",
    },
    blue: {
      default: "bg-blue-50 text-blue-700 border-blue-200",
      outline: "border-blue-300 text-blue-600 hover:bg-blue-50",
      solid: "bg-blue-600 text-white",
      gradient: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    },
    green: {
      default: "bg-green-50 text-green-700 border-green-200",
      outline: "border-green-300 text-green-600 hover:bg-green-50",
      solid: "bg-green-600 text-white",
      gradient: "bg-gradient-to-r from-green-500 to-green-600 text-white",
    },
    gray: {
      default: "bg-gray-50 text-gray-700 border-gray-200",
      outline: "border-gray-300 text-gray-600 hover:bg-gray-50",
      solid: "bg-gray-600 text-white",
      gradient: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
    },
    orange: {
      default: "bg-orange-50 text-orange-700 border-orange-200",
      outline: "border-orange-300 text-orange-600 hover:bg-orange-50",
      solid: "bg-orange-600 text-white",
      gradient: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
    },
  };

  return (
    colorMap[color as keyof typeof colorMap]?.[
      variant as keyof typeof colorMap.red
    ] || colorMap.gray[variant as keyof typeof colorMap.red]
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RoleBadge({
  role,
  size = "md",
  variant = "default",
  showIcon = true,
  showDescription = false,
  className = "",
  onClick,
  removable = false,
  onRemove,
}: RoleBadgeProps) {
  // ============================================================================
  // ROLE DATA EXTRACTION
  // ============================================================================

  const roleCode = typeof role === "string" ? role : role.code;
  const roleData = ROLE_CONFIG[roleCode as keyof typeof ROLE_CONFIG];

  if (!roleData) {
    return (
      <span
        className={`
        inline-flex items-center rounded-full border
        ${sizeClasses[size].container}
        bg-gray-50 text-gray-600 border-gray-200
        ${className}
      `}
      >
        <Lock className={`${sizeClasses[size].icon} mr-1`} />
        {roleCode}
      </span>
    );
  }

  const { name, icon: Icon, color, description } = roleData;

  // ============================================================================
  // STYLE CLASSES
  // ============================================================================

  const baseClasses = `
    inline-flex items-center rounded-full border font-medium
    transition-all duration-200 select-none
    ${sizeClasses[size].container}
    ${getColorClasses(color, variant)}
    ${onClick ? "cursor-pointer hover:scale-105" : ""}
    ${className}
  `;

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderContent = () => (
    <>
      {showIcon && (
        <Icon
          className={`${sizeClasses[size].icon} ${showDescription ? "mr-1" : "mr-1.5"}`}
        />
      )}
      <span className={sizeClasses[size].text}>{name}</span>
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`
            ml-1.5 hover:bg-black/10 rounded-full p-0.5
            transition-colors duration-200
          `}
        >
          ×
        </button>
      )}
    </>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (showDescription) {
    return (
      <div className="inline-flex flex-col items-start">
        <div className={baseClasses} onClick={onClick}>
          {renderContent()}
        </div>
        {showDescription && (
          <p className="text-xs text-muted-foreground mt-1 ml-2">
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <span className={baseClasses} onClick={onClick}>
      {renderContent()}
    </span>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Admin role badge with special styling
 */
export function AdminBadge({
  className,
  ...props
}: Omit<RoleBadgeProps, "role">) {
  return (
    <RoleBadge
      role="ADMIN"
      variant="gradient"
      className={`ring-2 ring-red-200 ${className}`}
      {...props}
    />
  );
}

/**
 * Role badge group for displaying multiple roles
 */
export function RoleBadgeGroup({
  roles,
  maxVisible = 3,
  size = "sm",
  className = "",
}: {
  roles: (RoleCode | Role)[];
  maxVisible?: number;
  size?: RoleBadgeProps["size"];
  className?: string;
}) {
  const visibleRoles = roles.slice(0, maxVisible);
  const hiddenCount = roles.length - maxVisible;

  return (
    <div className={`flex items-center space-x-1 flex-wrap ${className}`}>
      {visibleRoles.map((role, index) => {
        const roleCode = typeof role === "string" ? role : role.code;
        return <RoleBadge key={roleCode} role={role} size={size} />;
      })}
      {hiddenCount > 0 && (
        <span
          className={`
          inline-flex items-center rounded-full
          ${sizeClasses[size].container}
          bg-gray-100 text-gray-600 border border-gray-200
        `}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}

/**
 * Interactive role badge with actions
 */
export function InteractiveRoleBadge({
  role,
  onEdit,
  onRemove,
  ...props
}: RoleBadgeProps & {
  onEdit?: () => void;
}) {
  return (
    <div className="inline-flex items-center space-x-1">
      <RoleBadge role={role} {...props} />
      {onEdit && (
        <button
          onClick={onEdit}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/**
 * Role badge with tooltip
 */
export function RoleBadgeWithTooltip({
  role,
  showTooltip = true,
  ...props
}: RoleBadgeProps & {
  showTooltip?: boolean;
}) {
  const roleCode = typeof role === "string" ? role : role.code;
  const roleData = ROLE_CONFIG[roleCode as keyof typeof ROLE_CONFIG];

  return (
    <div className="relative group">
      <RoleBadge role={role} {...props} />
      {showTooltip && roleData && (
        <div
          className="
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
          px-2 py-1 bg-black text-white text-xs rounded
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none whitespace-nowrap z-50
        "
        >
          {roleData.description}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 
                          border-2 border-transparent border-t-black"
          ></div>
        </div>
      )}
    </div>
  );
}

export default RoleBadge;
