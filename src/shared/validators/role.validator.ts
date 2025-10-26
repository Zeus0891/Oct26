/**
 * =====================================================================
 *  ENTERPRISE ROLE VALIDATOR — RBAC Role Management Validation
 * =====================================================================
 *  Purpose:
 *   Validates role creation, updates, assignments, and RBAC-related
 *   operations within the enterprise multitenant system.
 *
 *  Features:
 *   - Role creation and modification validation
 *   - Tenant-scoped role uniqueness
 *   - Role hierarchy validation
 *   - Permission inheritance rules
 *   - System vs custom role restrictions
 *   - Role assignment validation
 *
 *  Usage:
 *   Used by RBAC controllers and services to validate all role-related
 *   operations and ensure proper access control setup.
 * =====================================================================
 */

import { z, ZodSchema } from "zod";
import { AsyncValidator } from "./async.validator";
import {
  ValidationResult,
  ValidationIssue,
  ValidationContext,
  ValidationFactory,
  ValidationSeverity,
  AsyncValidationResult,
} from "./validation.types";
import {
  isUUID,
  isValidLength,
  isAlphanumericWithSpecial,
  normalizeTenantCode,
} from "./validation.utils";

/**
 * Role type enumeration (from Prisma schema).
 */
export type RoleType = "SYSTEM" | "CUSTOM" | "INHERITED";

/**
 * Role validation schemas.
 */
export class RoleSchemas {
  /**
   * Role code validation (must be unique within tenant).
   */
  static readonly roleCode = z
    .string()
    .min(3, "Role code must be at least 3 characters")
    .max(50, "Role code must not exceed 50 characters")
    .refine(
      (code) => isAlphanumericWithSpecial(code.toUpperCase(), ["-", "_"]),
      {
        message:
          "Role code can only contain letters, numbers, hyphens, and underscores",
      }
    );

  /**
   * Role name validation.
   */
  static readonly roleName = z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name must not exceed 100 characters")
    .refine((name) => isValidLength(name.trim(), 1, 100), {
      message: "Role name cannot be empty or only whitespace",
    });

  /**
   * Role type validation.
   */
  static readonly roleType = z.enum(["SYSTEM", "CUSTOM", "INHERITED"] as const);

  /**
   * Role description validation.
   */
  static readonly description = z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional();

  /**
   * Role priority validation (for hierarchy).
   */
  static readonly priority = z
    .number()
    .int("Priority must be an integer")
    .min(0, "Priority must be non-negative")
    .max(999, "Priority must not exceed 999");
}

/**
 * Role creation validator.
 */
export class RoleCreationValidator extends AsyncValidator<{
  code: string;
  name: string;
  description?: string;
  roleType: RoleType;
  isDefault?: boolean;
  priority?: number;
  parentRoleId?: string;
  tenantId: string;
  permissions?: string[];
}> {
  schema = z.object({
    code: RoleSchemas.roleCode,
    name: RoleSchemas.roleName,
    description: RoleSchemas.description,
    roleType: RoleSchemas.roleType,
    isDefault: z.boolean().optional().default(false),
    priority: RoleSchemas.priority.optional().default(100),
    parentRoleId: z.string().uuid().optional(),
    tenantId: z.string().uuid("Invalid tenant ID format"),
    permissions: z.array(z.string().uuid()).optional(),
  });

  protected async performAsyncValidation(
    data: {
      code: string;
      name: string;
      description?: string;
      roleType: RoleType;
      isDefault?: boolean;
      priority?: number;
      parentRoleId?: string;
      tenantId: string;
      permissions?: string[];
    },
    context: ValidationContext
  ): Promise<
    AsyncValidationResult<{
      code: string;
      name: string;
      description?: string;
      roleType: RoleType;
      isDefault?: boolean;
      priority?: number;
      parentRoleId?: string;
      tenantId: string;
      permissions?: string[];
    }>
  > {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // Validate role code uniqueness within tenant
    const codeUniquenessIssue = await this.validateUniqueness(
      "code",
      data.code,
      { ...context, tenantId: data.tenantId }
    );
    if (codeUniquenessIssue) {
      errors.push(codeUniquenessIssue);
    }

    // Validate role name uniqueness within tenant
    const nameUniquenessIssue = await this.validateUniqueness(
      "name",
      data.name,
      { ...context, tenantId: data.tenantId }
    );
    if (nameUniquenessIssue) {
      errors.push(nameUniquenessIssue);
    }

    // Validate system role restrictions
    if (data.roleType === "SYSTEM") {
      if (data.isDefault && data.tenantId !== "system") {
        errors.push({
          field: "isDefault",
          message: "Only system roles in system tenant can be default",
          code: "INVALID_SYSTEM_ROLE_DEFAULT",
          severity: "ERROR" as ValidationSeverity,
          context,
        });
      }

      if (data.parentRoleId) {
        errors.push({
          field: "parentRoleId",
          message: "System roles cannot have parent roles",
          code: "SYSTEM_ROLE_NO_PARENT",
          severity: "ERROR" as ValidationSeverity,
          context,
        });
      }
    }

    // Validate inherited role requirements
    if (data.roleType === "INHERITED") {
      if (!data.parentRoleId) {
        errors.push({
          field: "parentRoleId",
          message: "Inherited roles must have a parent role",
          code: "INHERITED_ROLE_REQUIRES_PARENT",
          severity: "ERROR" as ValidationSeverity,
          context,
        });
      }

      if (data.permissions && data.permissions.length > 0) {
        warnings.push({
          field: "permissions",
          message: "Inherited roles should inherit permissions from parent",
          code: "INHERITED_ROLE_PERMISSIONS_WARNING",
          severity: "WARNING" as ValidationSeverity,
          context,
        });
      }
    }

    // Validate parent role exists and belongs to tenant
    if (data.parentRoleId) {
      const parentOwnershipIssue = await this.validateTenantOwnership(
        "Role",
        data.parentRoleId,
        data.tenantId,
        context
      );
      if (parentOwnershipIssue) {
        errors.push(parentOwnershipIssue);
      }
    }

    // Validate permission references
    if (data.permissions && data.permissions.length > 0) {
      const permissionReferences = data.permissions.map((permId) => ({
        type: "Permission",
        id: permId,
        field: "permissions",
      }));

      const permissionIssues = await this.validateEntityReferences(
        permissionReferences,
        context
      );
      errors.push(...permissionIssues);
    }

    // Business rule validations
    if (data.priority && data.priority < 10) {
      warnings.push({
        field: "priority",
        message:
          "Low priority roles may have limited access to system functions",
        code: "LOW_PRIORITY_WARNING",
        severity: "WARNING" as ValidationSeverity,
        context,
        meta: { priority: data.priority },
      });
    }

    if (data.code.includes("ADMIN") && data.roleType !== "SYSTEM") {
      warnings.push({
        field: "code",
        message: "Admin roles should typically be SYSTEM type for security",
        code: "ADMIN_ROLE_TYPE_WARNING",
        severity: "WARNING" as ValidationSeverity,
        context,
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        durationMs: 0,
        async: true,
      };
    }

    return {
      success: true,
      data,
      warnings: warnings.length > 0 ? warnings : undefined,
      durationMs: 0,
      async: true,
    };
  }
}

/**
 * Role update validator.
 */
export class RoleUpdateValidator extends AsyncValidator<{
  id: string;
  code?: string;
  name?: string;
  description?: string;
  isDefault?: boolean;
  priority?: number;
  tenantId: string;
}> {
  schema = z.object({
    id: z.string().uuid("Invalid role ID format"),
    code: RoleSchemas.roleCode.optional(),
    name: RoleSchemas.roleName.optional(),
    description: RoleSchemas.description,
    isDefault: z.boolean().optional(),
    priority: RoleSchemas.priority.optional(),
    tenantId: z.string().uuid("Invalid tenant ID format"),
  });

  protected async performAsyncValidation(
    data: {
      id: string;
      code?: string;
      name?: string;
      description?: string;
      isDefault?: boolean;
      priority?: number;
      tenantId: string;
    },
    context: ValidationContext
  ): Promise<
    AsyncValidationResult<{
      id: string;
      code?: string;
      name?: string;
      description?: string;
      isDefault?: boolean;
      priority?: number;
      tenantId: string;
    }>
  > {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // Validate role ownership
    const ownershipIssue = await this.validateTenantOwnership(
      "Role",
      data.id,
      data.tenantId,
      context
    );
    if (ownershipIssue) {
      errors.push(ownershipIssue);
    }

    // Validate uniqueness for updated fields
    if (data.code) {
      const codeUniquenessIssue = await this.validateUniqueness(
        "code",
        data.code,
        { ...context, tenantId: data.tenantId },
        data.id // Exclude current role from uniqueness check
      );
      if (codeUniquenessIssue) {
        errors.push(codeUniquenessIssue);
      }
    }

    if (data.name) {
      const nameUniquenessIssue = await this.validateUniqueness(
        "name",
        data.name,
        { ...context, tenantId: data.tenantId },
        data.id // Exclude current role from uniqueness check
      );
      if (nameUniquenessIssue) {
        errors.push(nameUniquenessIssue);
      }
    }

    // System role protection warnings
    if (data.code && data.code.includes("SYSTEM")) {
      warnings.push({
        field: "code",
        message: "Modifying system roles may affect application security",
        code: "SYSTEM_ROLE_MODIFICATION_WARNING",
        severity: "WARNING" as ValidationSeverity,
        context,
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        durationMs: 0,
        async: true,
      };
    }

    return {
      success: true,
      data,
      warnings: warnings.length > 0 ? warnings : undefined,
      durationMs: 0,
      async: true,
    };
  }
}

/**
 * Role assignment validator.
 */
export class RoleAssignmentValidator extends AsyncValidator<{
  roleId: string;
  memberId: string;
  assignedBy: string;
  tenantId: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}> {
  schema = z.object({
    roleId: z.string().uuid("Invalid role ID format"),
    memberId: z.string().uuid("Invalid member ID format"),
    assignedBy: z.string().uuid("Invalid assignedBy ID format"),
    tenantId: z.string().uuid("Invalid tenant ID format"),
    expiresAt: z.string().datetime().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  });

  protected async performAsyncValidation(
    data: {
      roleId: string;
      memberId: string;
      assignedBy: string;
      tenantId: string;
      expiresAt?: string;
      metadata?: Record<string, unknown>;
    },
    context: ValidationContext
  ): Promise<
    AsyncValidationResult<{
      roleId: string;
      memberId: string;
      assignedBy: string;
      tenantId: string;
      expiresAt?: string;
      metadata?: Record<string, unknown>;
    }>
  > {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // Validate all entities belong to the tenant
    const entityReferences = [
      { type: "Role", id: data.roleId, field: "roleId" },
      { type: "Member", id: data.memberId, field: "memberId" },
      { type: "Member", id: data.assignedBy, field: "assignedBy" },
    ];

    for (const ref of entityReferences) {
      const ownershipIssue = await this.validateTenantOwnership(
        ref.type,
        ref.id,
        data.tenantId,
        context
      );
      if (ownershipIssue) {
        errors.push({
          ...ownershipIssue,
          field: ref.field,
        });
      }
    }

    // Validate expiration date
    if (data.expiresAt) {
      const expirationDate = new Date(data.expiresAt);
      const now = new Date();

      if (expirationDate <= now) {
        errors.push({
          field: "expiresAt",
          message: "Role assignment cannot expire in the past",
          code: "PAST_EXPIRATION_DATE",
          severity: "ERROR" as ValidationSeverity,
          context,
        });
      } else {
        // Warn if expiration is very far in the future (more than 2 years)
        const twoYears = 2 * 365 * 24 * 60 * 60 * 1000;
        if (expirationDate.getTime() - now.getTime() > twoYears) {
          warnings.push({
            field: "expiresAt",
            message: "Role assignment expires more than 2 years in the future",
            code: "LONG_TERM_ASSIGNMENT_WARNING",
            severity: "WARNING" as ValidationSeverity,
            context,
            meta: {
              expiresAt: data.expiresAt,
              yearsFromNow: Math.round(
                (expirationDate.getTime() - now.getTime()) /
                  (365 * 24 * 60 * 60 * 1000)
              ),
            },
          });
        }
      }
    }

    // Self-assignment warning
    if (data.memberId === data.assignedBy) {
      warnings.push({
        field: "assignedBy",
        message: "Member is assigning role to themselves",
        code: "SELF_ASSIGNMENT_WARNING",
        severity: "WARNING" as ValidationSeverity,
        context,
        meta: {
          requiresApproval: true,
        },
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        durationMs: 0,
        async: true,
      };
    }

    return {
      success: true,
      data,
      warnings: warnings.length > 0 ? warnings : undefined,
      durationMs: 0,
      async: true,
    };
  }
}

/**
 * Role hierarchy validator.
 */
export class RoleHierarchyValidator extends AsyncValidator<{
  roleId: string;
  parentRoleId: string;
  tenantId: string;
}> {
  schema = z.object({
    roleId: z.string().uuid("Invalid role ID format"),
    parentRoleId: z.string().uuid("Invalid parent role ID format"),
    tenantId: z.string().uuid("Invalid tenant ID format"),
  });

  protected async performAsyncValidation(
    data: {
      roleId: string;
      parentRoleId: string;
      tenantId: string;
    },
    context: ValidationContext
  ): Promise<
    AsyncValidationResult<{
      roleId: string;
      parentRoleId: string;
      tenantId: string;
    }>
  > {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // Prevent self-reference
    if (data.roleId === data.parentRoleId) {
      errors.push({
        field: "parentRoleId",
        message: "Role cannot be its own parent",
        code: "CIRCULAR_ROLE_REFERENCE",
        severity: "ERROR" as ValidationSeverity,
        context,
      });
    }

    // Validate both roles belong to tenant
    const entityReferences = [
      { type: "Role", id: data.roleId, field: "roleId" },
      { type: "Role", id: data.parentRoleId, field: "parentRoleId" },
    ];

    for (const ref of entityReferences) {
      const ownershipIssue = await this.validateTenantOwnership(
        ref.type,
        ref.id,
        data.tenantId,
        context
      );
      if (ownershipIssue) {
        errors.push({
          ...ownershipIssue,
          field: ref.field,
        });
      }
    }

    // TODO: Add circular dependency detection
    // This would require recursive checking of parent-child relationships
    // to ensure no circular hierarchies are created

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        durationMs: 0,
        async: true,
      };
    }

    return {
      success: true,
      data,
      warnings: warnings.length > 0 ? warnings : undefined,
      durationMs: 0,
      async: true,
    };
  }
}

/**
 * Role deletion validator.
 */
export class RoleDeletionValidator extends AsyncValidator<{
  roleId: string;
  tenantId: string;
  force?: boolean;
}> {
  schema = z.object({
    roleId: z.string().uuid("Invalid role ID format"),
    tenantId: z.string().uuid("Invalid tenant ID format"),
    force: z.boolean().optional().default(false),
  });

  protected async performAsyncValidation(
    data: {
      roleId: string;
      tenantId: string;
      force?: boolean;
    },
    context: ValidationContext
  ): Promise<
    AsyncValidationResult<{
      roleId: string;
      tenantId: string;
      force?: boolean;
    }>
  > {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // Validate role ownership
    const ownershipIssue = await this.validateTenantOwnership(
      "Role",
      data.roleId,
      data.tenantId,
      context
    );
    if (ownershipIssue) {
      errors.push(ownershipIssue);
    }

    // TODO: Check for active assignments
    // In a real implementation, this would query for active role assignments
    const hasActiveAssignments = false; // Placeholder

    if (hasActiveAssignments && !data.force) {
      errors.push({
        field: "roleId",
        message:
          "Cannot delete role with active assignments. Use force=true to override.",
        code: "ROLE_HAS_ACTIVE_ASSIGNMENTS",
        severity: "ERROR" as ValidationSeverity,
        context,
        meta: {
          suggestedAction: "Remove assignments or use force deletion",
        },
      });
    }

    // TODO: Check if role is referenced as parent
    const hasChildRoles = false; // Placeholder

    if (hasChildRoles) {
      warnings.push({
        field: "roleId",
        message: "Deleting role will affect child roles that inherit from it",
        code: "ROLE_HAS_CHILDREN_WARNING",
        severity: "WARNING" as ValidationSeverity,
        context,
        meta: {
          impact: "Child roles will lose inheritance",
        },
      });
    }

    if (data.force) {
      warnings.push({
        field: "force",
        message: "Force deletion may cause data inconsistencies",
        code: "FORCE_DELETION_WARNING",
        severity: "WARNING" as ValidationSeverity,
        context,
        meta: {
          requiresAudit: true,
        },
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        durationMs: 0,
        async: true,
      };
    }

    return {
      success: true,
      data,
      warnings: warnings.length > 0 ? warnings : undefined,
      durationMs: 0,
      async: true,
    };
  }
}
