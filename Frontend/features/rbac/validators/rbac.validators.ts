/**
 * RBAC Validators
 * Validation schemas for Role-Based Access Control operations
 * Aligned with backend RBAC API and security requirements
 */

import { z } from "zod";
import { RoleCode } from "../types/rbac.generated";

// =============================================================================
// ROLE MANAGEMENT VALIDATORS
// =============================================================================

/**
 * Role creation validation schema
 */
export const roleCreateSchema = z.object({
  code: z
    .string()
    .min(1, "Role code is required")
    .max(50, "Role code is too long")
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      "Role code must be uppercase letters, numbers, and underscores only"
    )
    .refine(
      (code) => !["SYSTEM", "ROOT", "SUPER", "GOD"].includes(code),
      "Reserved role codes are not allowed"
    ),

  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name is too long")
    .trim(),

  description: z
    .string()
    .min(1, "Role description is required")
    .max(500, "Role description is too long")
    .trim(),

  scope: z.enum(["TENANT", "SYSTEM"]).default("TENANT"),

  isActive: z.boolean().default(true),
});

export type RoleCreateData = z.infer<typeof roleCreateSchema>;

/**
 * Role update validation schema
 */
export const roleUpdateSchema = z.object({
  id: z.string().uuid("Invalid role ID format"),

  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name is too long")
    .trim()
    .optional(),

  description: z
    .string()
    .min(1, "Role description is required")
    .max(500, "Role description is too long")
    .trim()
    .optional(),

  isActive: z.boolean().optional(),
});

export type RoleUpdateData = z.infer<typeof roleUpdateSchema>;

/**
 * Role assignment validation schema
 */
export const roleAssignmentSchema = z.object({
  memberUserId: z.string().uuid("Invalid member user ID"),

  roleCode: z
    .enum(["ADMIN", "PROJECT_MANAGER", "WORKER", "VIEWER", "DRIVER"] as const)
    .describe("Role to assign to the member"),

  tenantId: z.string().uuid("Invalid tenant ID"),

  assignedBy: z.string().uuid("Invalid assigner user ID"),

  expiresAt: z.string().datetime("Invalid expiration date format").optional(),

  reason: z.string().max(200, "Assignment reason is too long").optional(),
});

export type RoleAssignmentData = z.infer<typeof roleAssignmentSchema>;

/**
 * Bulk role assignment validation schema
 */
export const bulkRoleAssignmentSchema = z.object({
  assignments: z
    .array(roleAssignmentSchema.omit({ assignedBy: true }))
    .min(1, "At least one role assignment is required")
    .max(100, "Too many role assignments (max 100)"),

  assignedBy: z.string().uuid("Invalid assigner user ID"),

  tenantId: z.string().uuid("Invalid tenant ID"),
});

export type BulkRoleAssignmentData = z.infer<typeof bulkRoleAssignmentSchema>;

// =============================================================================
// PERMISSION VALIDATORS
// =============================================================================

/**
 * Permission validation schema
 */
export const permissionSchema = z.object({
  code: z
    .string()
    .min(1, "Permission code is required")
    .regex(
      /^[A-Za-z][A-Za-z0-9_]*\.[a-z_]+$/,
      'Permission must follow "Model.action" format'
    )
    .refine((permission) => {
      const [, action] = permission.split(".");
      const validActions = [
        "read",
        "list",
        "export",
        "create",
        "update",
        "duplicate",
        "soft_delete",
        "restore",
        "hard_delete",
        "archive",
        "activate",
        "deactivate",
        "assign",
        "unassign",
        "transfer",
        "submit",
        "approve",
        "reject",
        "review",
        "send",
        "publish",
        "lock",
        "unlock",
      ];
      return validActions.includes(action);
    }, "Invalid action in permission"),

  name: z
    .string()
    .min(1, "Permission name is required")
    .max(100, "Permission name is too long"),

  description: z
    .string()
    .max(500, "Permission description is too long")
    .optional(),

  resource: z
    .string()
    .min(1, "Resource is required")
    .max(50, "Resource name is too long"),

  action: z
    .string()
    .min(1, "Action is required")
    .max(20, "Action name is too long"),

  scope: z
    .enum([
      "GLOBAL",
      "TENANT",
      "PROJECT",
      "ESTIMATE",
      "INVOICE",
      "TASK",
      "INVENTORY",
    ])
    .default("TENANT"),
});

export type PermissionData = z.infer<typeof permissionSchema>;

/**
 * Role permission assignment validation schema
 */
export const rolePermissionAssignmentSchema = z.object({
  roleId: z.string().uuid("Invalid role ID"),

  permissions: z
    .array(z.string().min(1, "Permission code is required"))
    .min(1, "At least one permission is required")
    .max(500, "Too many permissions (max 500)")
    .refine((permissions) => {
      const uniquePermissions = new Set(permissions);
      return uniquePermissions.size === permissions.length;
    }, "Duplicate permissions are not allowed"),

  tenantId: z.string().uuid("Invalid tenant ID"),

  assignedBy: z.string().uuid("Invalid assigner user ID"),
});

export type RolePermissionAssignmentData = z.infer<
  typeof rolePermissionAssignmentSchema
>;

// =============================================================================
// RBAC SECURITY VALIDATORS
// =============================================================================

/**
 * RBAC security context validation
 */
export const rbacSecurityContextSchema = z.object({
  performerUserId: z.string().uuid("Invalid performer user ID"),

  performerRoles: z
    .array(
      z.enum([
        "ADMIN",
        "PROJECT_MANAGER",
        "WORKER",
        "VIEWER",
        "DRIVER",
      ] as const)
    )
    .min(1, "Performer must have at least one role"),

  targetUserId: z.string().uuid("Invalid target user ID").optional(),

  targetRoles: z
    .array(
      z.enum([
        "ADMIN",
        "PROJECT_MANAGER",
        "WORKER",
        "VIEWER",
        "DRIVER",
      ] as const)
    )
    .optional(),

  tenantId: z.string().uuid("Invalid tenant ID"),

  operation: z.enum(["assign", "unassign", "update", "delete", "create"]),

  resourceType: z.enum(["role", "permission", "member", "assignment"]),
});

export type RBACSecurityContext = z.infer<typeof rbacSecurityContextSchema>;

/**
 * Permission check validation schema
 */
export const permissionCheckSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),

  permissions: z
    .array(z.string().min(1, "Permission cannot be empty"))
    .min(1, "At least one permission is required")
    .max(50, "Too many permissions to check (max 50)"),

  tenantId: z.string().uuid("Invalid tenant ID"),

  requireAll: z
    .boolean()
    .default(false)
    .describe(
      "If true, user must have ALL permissions. If false, user must have ANY permission"
    ),

  resourceContext: z
    .record(z.string(), z.any())
    .optional()
    .describe("Additional context for permission evaluation"),
});

export type PermissionCheckData = z.infer<typeof permissionCheckSchema>;

/**
 * Role check validation schema
 */
export const roleCheckSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),

  roles: z
    .array(
      z.enum([
        "ADMIN",
        "PROJECT_MANAGER",
        "WORKER",
        "VIEWER",
        "DRIVER",
      ] as const)
    )
    .min(1, "At least one role is required"),

  tenantId: z.string().uuid("Invalid tenant ID"),

  requireAll: z
    .boolean()
    .default(false)
    .describe(
      "If true, user must have ALL roles. If false, user must have ANY role"
    ),
});

export type RoleCheckData = z.infer<typeof roleCheckSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate role code format and restrictions
 */
export const validateRoleCode = (
  roleCode: string
): {
  isValid: boolean;
  message?: string;
  formatted?: string;
} => {
  if (!roleCode) {
    return { isValid: false, message: "Role code is required" };
  }

  const trimmed = roleCode.trim().toUpperCase();

  // Basic format validation
  if (!/^[A-Z][A-Z0-9_]*$/.test(trimmed)) {
    return {
      isValid: false,
      message:
        "Role code must start with a letter and contain only uppercase letters, numbers, and underscores",
    };
  }

  // Length validation
  if (trimmed.length < 2) {
    return {
      isValid: false,
      message: "Role code must be at least 2 characters long",
    };
  }

  if (trimmed.length > 50) {
    return {
      isValid: false,
      message: "Role code is too long (max 50 characters)",
    };
  }

  // Reserved words check
  const reservedWords = ["SYSTEM", "ROOT", "SUPER", "GOD", "NULL", "UNDEFINED"];
  if (reservedWords.includes(trimmed)) {
    return {
      isValid: false,
      message: "This role code is reserved and cannot be used",
    };
  }

  return { isValid: true, formatted: trimmed };
};

/**
 * Validate permission format
 */
export const validatePermissionFormat = (
  permission: string
): {
  isValid: boolean;
  message?: string;
  model?: string;
  action?: string;
} => {
  if (!permission) {
    return { isValid: false, message: "Permission is required" };
  }

  const trimmed = permission.trim();

  // Check basic format
  if (!/^[A-Za-z][A-Za-z0-9_]*\.[a-z_]+$/.test(trimmed)) {
    return {
      isValid: false,
      message:
        'Permission must follow "Model.action" format (e.g., "Project.read")',
    };
  }

  const [model, action] = trimmed.split(".");

  // Validate model name
  if (!model || model.length < 2) {
    return {
      isValid: false,
      message: "Model name must be at least 2 characters",
    };
  }

  if (model.length > 50) {
    return {
      isValid: false,
      message: "Model name is too long (max 50 characters)",
    };
  }

  // Validate action
  const validActions = [
    "read",
    "list",
    "export",
    "create",
    "update",
    "duplicate",
    "soft_delete",
    "restore",
    "hard_delete",
    "archive",
    "activate",
    "deactivate",
    "assign",
    "unassign",
    "transfer",
    "submit",
    "approve",
    "reject",
    "review",
    "send",
    "publish",
    "lock",
    "unlock",
  ];

  if (!validActions.includes(action)) {
    return {
      isValid: false,
      message: `Invalid action "${action}". Must be one of: ${validActions.join(", ")}`,
    };
  }

  return { isValid: true, model, action };
};

/**
 * Validate role hierarchy and escalation prevention
 */
export const validateRoleEscalation = (
  performerRoles: RoleCode[],
  targetRoles: RoleCode[]
): {
  isValid: boolean;
  message?: string;
} => {
  // Role hierarchy (from highest to lowest)
  const roleHierarchy: Record<RoleCode, number> = {
    ADMIN: 100,
    PROJECT_MANAGER: 75,
    WORKER: 50,
    VIEWER: 25,
    DRIVER: 25,
  };

  // Get highest role level of performer
  const performerMaxLevel = Math.max(
    ...performerRoles.map((role) => roleHierarchy[role] || 0)
  );

  // Get highest role level being assigned
  const targetMaxLevel = Math.max(
    ...targetRoles.map((role) => roleHierarchy[role] || 0)
  );

  // Prevent role escalation (can't assign roles higher than your own)
  if (targetMaxLevel > performerMaxLevel) {
    return {
      isValid: false,
      message: "Cannot assign roles with higher privileges than your own",
    };
  }

  // Admins can assign any role
  if (performerRoles.includes("ADMIN")) {
    return { isValid: true };
  }

  // Project managers can assign worker and below
  if (performerRoles.includes("PROJECT_MANAGER")) {
    const forbiddenRoles = targetRoles.filter((role) =>
      ["ADMIN", "PROJECT_MANAGER"].includes(role)
    );

    if (forbiddenRoles.length > 0) {
      return {
        isValid: false,
        message:
          "Project managers cannot assign admin or project manager roles",
      };
    }
  }

  return { isValid: true };
};

/**
 * Validate tenant context for RBAC operations
 */
export const validateTenantContext = (
  performerTenantId: string,
  targetTenantId: string,
  _operation?: string
): {
  isValid: boolean;
  message?: string;
} => {
  if (!performerTenantId || !targetTenantId) {
    return {
      isValid: false,
      message: "Both performer and target tenant IDs are required",
    };
  }

  // Prevent cross-tenant operations
  if (performerTenantId !== targetTenantId) {
    return {
      isValid: false,
      message: "Cannot perform RBAC operations across different tenants",
    };
  }

  return { isValid: true };
};

/**
 * Form validation helper for RBAC forms
 */
export const validateRBACFormField = (
  fieldName: string,
  value: unknown
): string | null => {
  switch (fieldName) {
    case "roleCode":
      const roleResult = validateRoleCode(String(value || ""));
      return roleResult.isValid
        ? null
        : roleResult.message || "Invalid role code";

    case "permission":
      const permResult = validatePermissionFormat(String(value || ""));
      return permResult.isValid
        ? null
        : permResult.message || "Invalid permission format";

    case "memberUserId":
    case "targetUserId":
    case "performerUserId":
    case "tenantId":
      try {
        z.string().uuid().parse(value);
        return null;
      } catch {
        return "Must be a valid UUID";
      }

    case "roleName":
      try {
        z.string().min(1).max(100).parse(value);
        return null;
      } catch {
        return "Role name must be 1-100 characters";
      }

    case "roleDescription":
      try {
        z.string().max(500).parse(value);
        return null;
      } catch {
        return "Role description must be less than 500 characters";
      }

    case "permissions":
      if (!Array.isArray(value)) {
        return "Permissions must be an array";
      }
      if (value.length === 0) {
        return "At least one permission is required";
      }
      if (value.length > 500) {
        return "Too many permissions (max 500)";
      }

      const invalidPermissions = value.filter(
        (p) => !validatePermissionFormat(p).isValid
      );
      if (invalidPermissions.length > 0) {
        return `Invalid permissions: ${invalidPermissions.slice(0, 3).join(", ")}`;
      }
      return null;

    default:
      return null;
  }
};

// =============================================================================
// EXPORT DEFAULT VALIDATORS
// =============================================================================

const RBACValidators = {
  // Schemas
  roleCreateSchema,
  roleUpdateSchema,
  roleAssignmentSchema,
  bulkRoleAssignmentSchema,
  permissionSchema,
  rolePermissionAssignmentSchema,
  rbacSecurityContextSchema,
  permissionCheckSchema,
  roleCheckSchema,

  // Validation helpers
  validateRoleCode,
  validatePermissionFormat,
  validateRoleEscalation,
  validateTenantContext,
  validateRBACFormField,
};

export default RBACValidators;
