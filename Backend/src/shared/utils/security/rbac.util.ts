/**
 * RBAC Utility
 *
 * Provides Role-Based Access Control utilities for permissions and authorization.
 * Integrates with existing RBAC system and provides flexible permission checking.
 *
 * @module RbacUtils
 * @category Shared Utils - Security
 * @description Role-based access control and permission utilities
 * @version 1.0.0
 */

import { TypeGuards } from "../base/type-guards.util";

/**
 * Permission action types
 */
export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  MANAGE = "manage",
  EXECUTE = "execute",
  APPROVE = "approve",
  REJECT = "reject",
}

/**
 * Permission resource types
 */
export enum PermissionResource {
  USER = "user",
  ROLE = "role",
  PERMISSION = "permission",
  TENANT = "tenant",
  PROJECT = "project",
  ESTIMATE = "estimate",
  INVOICE = "invoice",
  CLIENT = "client",
  TASK = "task",
  REPORT = "report",
  SETTING = "setting",
  AUDIT_LOG = "audit_log",
}

/**
 * Permission scope levels
 */
export enum PermissionScope {
  GLOBAL = "global",
  TENANT = "tenant",
  PROJECT = "project",
  TEAM = "team",
  PERSONAL = "personal",
}

/**
 * Permission structure
 */
export interface Permission {
  /** Permission identifier */
  id: string;
  /** Action being performed */
  action: PermissionAction;
  /** Resource being accessed */
  resource: PermissionResource;
  /** Scope of the permission */
  scope: PermissionScope;
  /** Conditions for permission */
  conditions?: Record<string, unknown>;
  /** Whether permission is granted */
  granted: boolean;
}

/**
 * Role structure
 */
export interface Role {
  /** Role identifier */
  id: string;
  /** Role name */
  name: string;
  /** Role description */
  description?: string;
  /** Role permissions */
  permissions: Permission[];
  /** Parent roles (inheritance) */
  parentRoles?: string[];
  /** Role scope */
  scope: PermissionScope;
  /** Role metadata */
  metadata?: Record<string, unknown>;
}

/**
 * User context for permission checking
 */
export interface UserContext {
  /** User identifier */
  userId: string;
  /** User roles */
  roles: Role[];
  /** User tenant ID */
  tenantId?: string;
  /** User team IDs */
  teamIds?: string[];
  /** User project IDs */
  projectIds?: string[];
  /** Additional context data */
  context?: Record<string, unknown>;
}

/**
 * Resource context for permission checking
 */
export interface ResourceContext {
  /** Resource type */
  type: PermissionResource;
  /** Resource ID */
  id?: string;
  /** Resource owner ID */
  ownerId?: string;
  /** Resource tenant ID */
  tenantId?: string;
  /** Resource team ID */
  teamId?: string;
  /** Resource project ID */
  projectId?: string;
  /** Resource attributes */
  attributes?: Record<string, unknown>;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  /** Whether permission is granted */
  granted: boolean;
  /** Reason for denial (if not granted) */
  reason?: string;
  /** Matching permissions */
  matchingPermissions: Permission[];
  /** Applied conditions */
  appliedConditions?: Record<string, unknown>;
}

/**
 * Policy evaluation context
 */
export interface PolicyContext {
  /** User context */
  user: UserContext;
  /** Resource context */
  resource: ResourceContext;
  /** Action being performed */
  action: PermissionAction;
  /** Environment context */
  environment?: Record<string, unknown>;
}

/**
 * Utility class for Role-Based Access Control operations.
 * Provides permission checking, role management, and policy evaluation.
 *
 * @example
 * ```typescript
 * import { RbacUtils, PermissionAction, PermissionResource } from '@/shared/utils';
 *
 * // Check permission
 * const canEdit = RbacUtils.checkPermission(
 *   userContext,
 *   PermissionAction.UPDATE,
 *   { type: PermissionResource.PROJECT, id: "proj-123" }
 * );
 *
 * // Check multiple permissions
 * const permissions = RbacUtils.checkMultiplePermissions(
 *   userContext,
 *   [
 *     { action: PermissionAction.READ, resource: { type: PermissionResource.PROJECT } },
 *     { action: PermissionAction.UPDATE, resource: { type: PermissionResource.PROJECT } }
 *   ]
 * );
 *
 * // Filter accessible resources
 * const accessible = RbacUtils.filterAccessibleResources(
 *   userContext,
 *   resources,
 *   PermissionAction.READ
 * );
 * ```
 */
export class RbacUtils {
  /**
   * Checks if user has permission to perform action on resource.
   *
   * @param user - User context
   * @param action - Action to perform
   * @param resource - Resource context
   * @returns Permission check result
   * @complexity O(n * m) where n is roles and m is permissions per role
   */
  static checkPermission(
    user: UserContext,
    action: PermissionAction,
    resource: ResourceContext
  ): PermissionCheckResult {
    if (!TypeGuards.isObject(user) || !user.userId) {
      return {
        granted: false,
        reason: "Invalid user context",
        matchingPermissions: [],
      };
    }

    if (!Object.values(PermissionAction).includes(action)) {
      return {
        granted: false,
        reason: "Invalid action",
        matchingPermissions: [],
      };
    }

    if (
      !TypeGuards.isObject(resource) ||
      !Object.values(PermissionResource).includes(resource.type)
    ) {
      return {
        granted: false,
        reason: "Invalid resource context",
        matchingPermissions: [],
      };
    }

    const matchingPermissions: Permission[] = [];
    let granted = false;

    // Check all user roles
    for (const role of user.roles || []) {
      const rolePermissions = this.evaluateRolePermissions(
        role,
        action,
        resource,
        user
      );
      matchingPermissions.push(...rolePermissions);

      if (rolePermissions.some((p) => p.granted)) {
        granted = true;
      }
    }

    // Check for explicit deny permissions
    const explicitDeny = matchingPermissions.some(
      (p) => p.action === action && p.resource === resource.type && !p.granted
    );

    if (explicitDeny) {
      granted = false;
    }

    return {
      granted,
      reason: granted
        ? undefined
        : this.getPermissionDeniedReason(action, resource),
      matchingPermissions,
    };
  }

  /**
   * Evaluates role permissions for specific action and resource.
   *
   * @param role - Role to evaluate
   * @param action - Action to check
   * @param resource - Resource context
   * @param user - User context for condition evaluation
   * @returns Matching permissions
   * @complexity O(n) where n is permissions in role
   */
  private static evaluateRolePermissions(
    role: Role,
    action: PermissionAction,
    resource: ResourceContext,
    user: UserContext
  ): Permission[] {
    const matchingPermissions: Permission[] = [];

    for (const permission of role.permissions || []) {
      if (this.doesPermissionMatch(permission, action, resource)) {
        // Evaluate conditions if present
        if (permission.conditions) {
          const conditionsMet = this.evaluateConditions(permission.conditions, {
            user,
            resource,
            action,
          });
          if (!conditionsMet) continue;
        }

        // Check scope compatibility
        if (
          this.isScopeCompatible(permission.scope, role.scope, user, resource)
        ) {
          matchingPermissions.push(permission);
        }
      }
    }

    return matchingPermissions;
  }

  /**
   * Checks if permission matches action and resource.
   *
   * @param permission - Permission to check
   * @param action - Requested action
   * @param resource - Resource context
   * @returns True if permission matches
   * @complexity O(1)
   */
  private static doesPermissionMatch(
    permission: Permission,
    action: PermissionAction,
    resource: ResourceContext
  ): boolean {
    // Check resource type match
    if (permission.resource !== resource.type) return false;

    // Check action match or wildcard permissions
    if (permission.action === action) return true;
    if (permission.action === PermissionAction.MANAGE) return true;

    // Check hierarchical actions (manage > create/read/update/delete)
    const actionHierarchy: Partial<
      Record<PermissionAction, PermissionAction[]>
    > = {
      [PermissionAction.MANAGE]: [
        PermissionAction.CREATE,
        PermissionAction.READ,
        PermissionAction.UPDATE,
        PermissionAction.DELETE,
        PermissionAction.LIST,
        PermissionAction.EXECUTE,
        PermissionAction.APPROVE,
        PermissionAction.REJECT,
      ],
      [PermissionAction.UPDATE]: [PermissionAction.READ],
      [PermissionAction.DELETE]: [PermissionAction.READ],
      [PermissionAction.LIST]: [PermissionAction.READ],
      [PermissionAction.APPROVE]: [PermissionAction.READ],
      [PermissionAction.REJECT]: [PermissionAction.READ],
    };

    const allowedActions = actionHierarchy[permission.action] || [];
    return allowedActions.includes(action);
  }

  /**
   * Checks if permission scope is compatible with context.
   *
   * @param permissionScope - Permission scope
   * @param roleScope - Role scope
   * @param user - User context
   * @param resource - Resource context
   * @returns True if scope is compatible
   * @complexity O(1)
   */
  private static isScopeCompatible(
    permissionScope: PermissionScope,
    roleScope: PermissionScope,
    user: UserContext,
    resource: ResourceContext
  ): boolean {
    // Permission scope cannot exceed role scope
    const scopeHierarchy = [
      PermissionScope.PERSONAL,
      PermissionScope.TEAM,
      PermissionScope.PROJECT,
      PermissionScope.TENANT,
      PermissionScope.GLOBAL,
    ];

    const permissionLevel = scopeHierarchy.indexOf(permissionScope);
    const roleLevel = scopeHierarchy.indexOf(roleScope);

    if (permissionLevel > roleLevel) return false;

    // Check scope-specific conditions
    switch (permissionScope) {
      case PermissionScope.PERSONAL:
        return resource.ownerId === user.userId;

      case PermissionScope.TEAM:
        return !!(resource.teamId && user.teamIds?.includes(resource.teamId));

      case PermissionScope.PROJECT:
        return !!(
          resource.projectId && user.projectIds?.includes(resource.projectId)
        );

      case PermissionScope.TENANT:
        return resource.tenantId === user.tenantId;

      case PermissionScope.GLOBAL:
        return true;

      default:
        return false;
    }
  }

  /**
   * Evaluates permission conditions.
   *
   * @param conditions - Conditions to evaluate
   * @param context - Evaluation context
   * @returns True if all conditions are met
   * @complexity O(n) where n is number of conditions
   */
  private static evaluateConditions(
    conditions: Record<string, unknown>,
    context: PolicyContext
  ): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case "timeOfDay":
          if (!this.evaluateTimeCondition(value, new Date())) return false;
          break;

        case "ipWhitelist":
          if (!this.evaluateIpCondition(value, context.environment?.clientIp))
            return false;
          break;

        case "userAttributes":
          if (!this.evaluateUserAttributeCondition(value, context.user))
            return false;
          break;

        case "resourceAttributes":
          if (!this.evaluateResourceAttributeCondition(value, context.resource))
            return false;
          break;

        default:
          // Custom condition evaluation can be added here
          break;
      }
    }

    return true;
  }

  /**
   * Evaluates time-based condition.
   */
  private static evaluateTimeCondition(
    condition: unknown,
    currentTime: Date
  ): boolean {
    if (!TypeGuards.isObject(condition)) return false;

    const { start, end } = condition as { start?: string; end?: string };
    if (!start || !end) return true;

    const currentHour = currentTime.getHours();
    const startHour = parseInt(start, 10);
    const endHour = parseInt(end, 10);

    return currentHour >= startHour && currentHour <= endHour;
  }

  /**
   * Evaluates IP whitelist condition.
   */
  private static evaluateIpCondition(
    condition: unknown,
    clientIp?: unknown
  ): boolean {
    if (!TypeGuards.isArray(condition) || !TypeGuards.isString(clientIp))
      return true;

    const whitelist = condition as string[];
    return whitelist.includes(clientIp);
  }

  /**
   * Evaluates user attribute condition.
   */
  private static evaluateUserAttributeCondition(
    condition: unknown,
    user: UserContext
  ): boolean {
    if (!TypeGuards.isObject(condition)) return false;

    const attributes = condition as Record<string, unknown>;
    const userContext = user.context || {};

    for (const [key, value] of Object.entries(attributes)) {
      if (userContext[key] !== value) return false;
    }

    return true;
  }

  /**
   * Evaluates resource attribute condition.
   */
  private static evaluateResourceAttributeCondition(
    condition: unknown,
    resource: ResourceContext
  ): boolean {
    if (!TypeGuards.isObject(condition)) return false;

    const attributes = condition as Record<string, unknown>;
    const resourceAttrs = resource.attributes || {};

    for (const [key, value] of Object.entries(attributes)) {
      if (resourceAttrs[key] !== value) return false;
    }

    return true;
  }

  /**
   * Gets reason for permission denial.
   */
  private static getPermissionDeniedReason(
    action: PermissionAction,
    resource: ResourceContext
  ): string {
    return `Access denied: insufficient permissions to ${action} ${resource.type}`;
  }

  /**
   * Checks multiple permissions at once.
   *
   * @param user - User context
   * @param checks - Array of permission checks
   * @returns Map of permission results
   * @complexity O(n * m * p) where n is checks, m is roles, p is permissions
   */
  static checkMultiplePermissions(
    user: UserContext,
    checks: Array<{ action: PermissionAction; resource: ResourceContext }>
  ): Map<string, PermissionCheckResult> {
    const results = new Map<string, PermissionCheckResult>();

    for (const check of checks) {
      const key = `${check.action}:${check.resource.type}:${
        check.resource.id || "*"
      }`;
      const result = this.checkPermission(user, check.action, check.resource);
      results.set(key, result);
    }

    return results;
  }

  /**
   * Filters resources based on user permissions.
   *
   * @param user - User context
   * @param resources - Array of resources
   * @param action - Required action
   * @returns Filtered array of accessible resources
   * @complexity O(n * m * p) where n is resources, m is roles, p is permissions
   */
  static filterAccessibleResources<
    T extends { id: string; type: PermissionResource },
  >(user: UserContext, resources: T[], action: PermissionAction): T[] {
    return resources.filter((resource) => {
      const resourceContext: ResourceContext = {
        type: resource.type,
        id: resource.id,
        ...(resource as any), // Include other properties
      };

      const result = this.checkPermission(user, action, resourceContext);
      return result.granted;
    });
  }

  /**
   * Gets all permissions for a user across all roles.
   *
   * @param user - User context
   * @returns Array of all user permissions
   * @complexity O(n * m) where n is roles and m is permissions per role
   */
  static getUserPermissions(user: UserContext): Permission[] {
    const permissions: Permission[] = [];
    const seen = new Set<string>();

    for (const role of user.roles || []) {
      for (const permission of role.permissions || []) {
        const key = `${permission.action}:${permission.resource}:${permission.scope}`;
        if (!seen.has(key)) {
          seen.add(key);
          permissions.push(permission);
        }
      }
    }

    return permissions;
  }

  /**
   * Checks if user has any of the specified roles.
   *
   * @param user - User context
   * @param roleNames - Array of role names to check
   * @returns True if user has any of the roles
   * @complexity O(n * m) where n is user roles and m is role names
   */
  static hasAnyRole(user: UserContext, roleNames: string[]): boolean {
    if (!user.roles || user.roles.length === 0) return false;

    const userRoleNames = user.roles.map((role) => role.name);
    return roleNames.some((roleName) => userRoleNames.includes(roleName));
  }

  /**
   * Checks if user has all specified roles.
   *
   * @param user - User context
   * @param roleNames - Array of role names to check
   * @returns True if user has all roles
   * @complexity O(n * m) where n is user roles and m is role names
   */
  static hasAllRoles(user: UserContext, roleNames: string[]): boolean {
    if (!user.roles || user.roles.length === 0) return false;

    const userRoleNames = user.roles.map((role) => role.name);
    return roleNames.every((roleName) => userRoleNames.includes(roleName));
  }

  /**
   * Gets the highest scope level for a user.
   *
   * @param user - User context
   * @returns Highest permission scope
   * @complexity O(n) where n is user roles
   */
  static getHighestScope(user: UserContext): PermissionScope {
    const scopeHierarchy = [
      PermissionScope.PERSONAL,
      PermissionScope.TEAM,
      PermissionScope.PROJECT,
      PermissionScope.TENANT,
      PermissionScope.GLOBAL,
    ];

    let highestLevel = -1;

    for (const role of user.roles || []) {
      const level = scopeHierarchy.indexOf(role.scope);
      if (level > highestLevel) {
        highestLevel = level;
      }
    }

    return highestLevel >= 0
      ? scopeHierarchy[highestLevel]
      : PermissionScope.PERSONAL;
  }

  /**
   * Creates a permission check middleware function.
   *
   * @param action - Required action
   * @param resourceType - Resource type
   * @param options - Additional options
   * @returns Middleware function
   * @complexity O(1) creation
   */
  static createPermissionChecker(
    action: PermissionAction,
    resourceType: PermissionResource,
    options: {
      resourceIdKey?: string;
      onDenied?: (reason: string) => void;
    } = {}
  ) {
    const { resourceIdKey = "id", onDenied } = options;

    return (user: UserContext, resourceId?: string) => {
      const resource: ResourceContext = {
        type: resourceType,
        id: resourceId,
      };

      const result = this.checkPermission(user, action, resource);

      if (!result.granted && onDenied) {
        onDenied(result.reason || "Access denied");
      }

      return result.granted;
    };
  }

  /**
   * Validates role hierarchy for circular dependencies.
   *
   * @param roles - Array of roles to validate
   * @returns Validation result
   * @complexity O(n^2) where n is number of roles
   */
  static validateRoleHierarchy(roles: Role[]): {
    isValid: boolean;
    errors: string[];
    circularDependencies?: string[][];
  } {
    const errors: string[] = [];
    const circularDependencies: string[][] = [];

    const roleMap = new Map(roles.map((role) => [role.id, role]));

    for (const role of roles) {
      const visited = new Set<string>();
      const path: string[] = [];

      if (this.hasCircularDependency(role.id, roleMap, visited, path)) {
        circularDependencies.push([...path]);
        errors.push(
          `Circular dependency detected in role hierarchy: ${path.join(" -> ")}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      circularDependencies:
        circularDependencies.length > 0 ? circularDependencies : undefined,
    };
  }

  /**
   * Checks for circular dependencies in role hierarchy.
   */
  private static hasCircularDependency(
    roleId: string,
    roleMap: Map<string, Role>,
    visited: Set<string>,
    path: string[]
  ): boolean {
    if (path.includes(roleId)) return true;
    if (visited.has(roleId)) return false;

    visited.add(roleId);
    path.push(roleId);

    const role = roleMap.get(roleId);
    if (role?.parentRoles) {
      for (const parentId of role.parentRoles) {
        if (this.hasCircularDependency(parentId, roleMap, visited, [...path])) {
          return true;
        }
      }
    }

    path.pop();
    return false;
  }

  /**
   * 🧩 PLATINUM ENHANCEMENT: Resolves effective permissions through role hierarchy
   *
   * Traverses the role inheritance tree to compute all effective permissions,
   * supporting complex hierarchies, permission overrides, and conflict resolution.
   *
   * @example
   * ```typescript
   * const roles = [
   *   { id: 'admin', permissions: [adminPerms], parentRoles: ['manager'] },
   *   { id: 'manager', permissions: [managerPerms], parentRoles: ['user'] },
   *   { id: 'user', permissions: [userPerms], parentRoles: [] }
   * ];
   *
   * const effectivePerms = RbacUtils.resolveEffectivePermissions('admin', roles, {
   *   conflictResolution: 'most-permissive',
   *   maxDepth: 5,
   *   includeInheritancePath: true
   * });
   *
   * console.log('Total permissions:', effectivePerms.permissions.length);
   * console.log('Inheritance path:', effectivePerms.inheritancePath);
   * ```
   */
  static resolveEffectivePermissions(
    roleId: string,
    roles: Role[],
    options: {
      /** How to resolve permission conflicts */
      conflictResolution?:
        | "most-permissive"
        | "least-permissive"
        | "explicit-only";
      /** Maximum inheritance depth to prevent infinite recursion */
      maxDepth?: number;
      /** Include detailed inheritance path */
      includeInheritancePath?: boolean;
      /** Custom conflict resolver */
      customResolver?: (
        perms: Permission[],
        context: { roleId: string; depth: number }
      ) => Permission[];
    } = {}
  ): {
    permissions: Permission[];
    inheritancePath?: Array<{
      roleId: string;
      roleName: string;
      depth: number;
      permissionsAdded: number;
    }>;
    conflictsResolved?: Array<{
      resource: string;
      action: string;
      finalDecision: boolean;
      conflictingRoles: string[];
    }>;
  } {
    const {
      conflictResolution = "most-permissive",
      maxDepth = 10,
      includeInheritancePath = false,
      customResolver,
    } = options;

    const roleMap = new Map(roles.map((role) => [role.id, role]));
    const visited = new Set<string>();
    const inheritancePath: Array<{
      roleId: string;
      roleName: string;
      depth: number;
      permissionsAdded: number;
    }> = [];
    const conflictsResolved: Array<{
      resource: string;
      action: string;
      finalDecision: boolean;
      conflictingRoles: string[];
    }> = [];

    // Collect all permissions through the hierarchy
    const allPermissions: Array<{
      permission: Permission;
      sourceRole: string;
      depth: number;
    }> = [];

    const collectPermissions = (currentRoleId: string, depth: number): void => {
      if (depth > maxDepth || visited.has(currentRoleId)) return;

      visited.add(currentRoleId);
      const role = roleMap.get(currentRoleId);
      if (!role) return;

      // Add direct permissions
      const permissionsBefore = allPermissions.length;
      role.permissions.forEach((permission) => {
        allPermissions.push({
          permission,
          sourceRole: currentRoleId,
          depth,
        });
      });

      if (includeInheritancePath) {
        inheritancePath.push({
          roleId: currentRoleId,
          roleName: role.name,
          depth,
          permissionsAdded: allPermissions.length - permissionsBefore,
        });
      }

      // Recursively collect from parent roles
      if (role.parentRoles) {
        for (const parentRoleId of role.parentRoles) {
          collectPermissions(parentRoleId, depth + 1);
        }
      }
    };

    collectPermissions(roleId, 0);

    // Resolve conflicts and create final permission set
    const permissionMap = new Map<
      string,
      {
        permission: Permission;
        sources: string[];
        hasConflict: boolean;
      }
    >();

    // Group permissions by resource+action key
    for (const { permission, sourceRole } of allPermissions) {
      const key = `${permission.resource}:${permission.action}:${
        permission.scope || "default"
      }`;

      if (!permissionMap.has(key)) {
        permissionMap.set(key, {
          permission,
          sources: [sourceRole],
          hasConflict: false,
        });
      } else {
        const existing = permissionMap.get(key)!;
        existing.sources.push(sourceRole);
        existing.hasConflict = true;
      }
    }

    // Resolve conflicts and build final permissions
    const finalPermissions: Permission[] = [];

    for (const [key, { permission, sources, hasConflict }] of permissionMap) {
      if (!hasConflict) {
        finalPermissions.push(permission);
        continue;
      }

      // Handle conflicts
      if (customResolver) {
        const resolved = customResolver([permission], {
          roleId,
          depth: 0,
        });
        finalPermissions.push(...resolved);
      } else {
        // Built-in conflict resolution
        let finalPermission = permission;

        switch (conflictResolution) {
          case "most-permissive":
            // Keep the permission (allowing access is most permissive)
            finalPermission = permission;
            break;
          case "least-permissive":
            // This would need more complex logic to determine "least permissive"
            // For now, we'll use explicit-only behavior
            continue; // Skip conflicted permissions
          case "explicit-only":
            // Only allow if the target role has explicit permission
            if (!sources.includes(roleId)) continue;
            break;
        }

        finalPermissions.push(finalPermission);
        conflictsResolved.push({
          resource: permission.resource,
          action: permission.action,
          finalDecision: true,
          conflictingRoles: sources,
        });
      }
    }

    return {
      permissions: finalPermissions,
      ...(includeInheritancePath && { inheritancePath }),
      ...(conflictsResolved.length > 0 && { conflictsResolved }),
    };
  }

  /**
   * 🧩 PLATINUM ENHANCEMENT: Analyzes role hierarchy structure and relationships
   *
   * Provides comprehensive analysis of role hierarchies including depth metrics,
   * inheritance patterns, and optimization recommendations for enterprise RBAC.
   *
   * @example
   * ```typescript
   * const analysis = RbacUtils.analyzeRoleHierarchy(roles, {
   *   includeMetrics: true,
   *   detectAntipatterns: true,
   *   suggestOptimizations: true
   * });
   *
   * console.log('Max hierarchy depth:', analysis.metrics.maxDepth);
   * console.log('Orphaned roles:', analysis.metrics.orphanedRoles);
   * console.log('Optimization suggestions:', analysis.optimizations);
   * ```
   */
  static analyzeRoleHierarchy(
    roles: Role[],
    options: {
      /** Include detailed metrics */
      includeMetrics?: boolean;
      /** Detect common anti-patterns */
      detectAntipatterns?: boolean;
      /** Suggest hierarchy optimizations */
      suggestOptimizations?: boolean;
    } = {}
  ): {
    isValid: boolean;
    errors: string[];
    metrics?: {
      totalRoles: number;
      maxDepth: number;
      averageDepth: number;
      rootRoles: string[]; // Roles with no parents
      leafRoles: string[]; // Roles with no children
      orphanedRoles: string[]; // Roles not referenced by others
      mostInheritedRole: { roleId: string; inheritanceCount: number };
      complexityScore: number; // 0-100, higher = more complex
    };
    antipatterns?: Array<{
      type:
        | "deep-hierarchy"
        | "role-explosion"
        | "god-role"
        | "duplicate-permissions";
      severity: "low" | "medium" | "high";
      description: string;
      affectedRoles: string[];
      suggestion: string;
    }>;
    optimizations?: Array<{
      type: "consolidate" | "flatten" | "split" | "reorder";
      description: string;
      estimatedImprovement: string;
      steps: string[];
    }>;
  } {
    const {
      includeMetrics = false,
      detectAntipatterns = false,
      suggestOptimizations = false,
    } = options;

    // First validate the hierarchy
    const validation = this.validateRoleHierarchy(roles);
    if (!validation.isValid) {
      return {
        isValid: false,
        errors: validation.errors,
      };
    }

    const roleMap = new Map(roles.map((role) => [role.id, role]));
    const childrenMap = new Map<string, string[]>(); // roleId -> child role IDs

    // Build children map
    for (const role of roles) {
      if (role.parentRoles) {
        for (const parentId of role.parentRoles) {
          if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
          childrenMap.get(parentId)!.push(role.id);
        }
      }
    }

    // Calculate role depths (needed for both metrics and antipatterns)
    const roleDepths = new Map<string, number>();

    const calculateDepth = (
      roleId: string,
      visited = new Set<string>()
    ): number => {
      if (visited.has(roleId)) return 0; // Prevent infinite recursion
      if (roleDepths.has(roleId)) return roleDepths.get(roleId)!;

      visited.add(roleId);
      const role = roleMap.get(roleId);
      if (!role || !role.parentRoles || role.parentRoles.length === 0) {
        roleDepths.set(roleId, 0);
        return 0;
      }

      const maxParentDepth = Math.max(
        ...role.parentRoles.map((parentId) => calculateDepth(parentId, visited))
      );
      const depth = maxParentDepth + 1;
      roleDepths.set(roleId, depth);
      return depth;
    };

    // Calculate depths for all roles
    roles.forEach((role) => calculateDepth(role.id));

    let metrics;
    if (includeMetrics) {
      // Calculate depth for each role
      const roleDepths = new Map<string, number>();

      const calculateDepth = (
        roleId: string,
        visited = new Set<string>()
      ): number => {
        if (visited.has(roleId)) return 0; // Prevent infinite recursion
        if (roleDepths.has(roleId)) return roleDepths.get(roleId)!;

        visited.add(roleId);
        const role = roleMap.get(roleId);
        if (!role || !role.parentRoles || role.parentRoles.length === 0) {
          roleDepths.set(roleId, 0);
          return 0;
        }

        const maxParentDepth = Math.max(
          ...role.parentRoles.map((parentId) =>
            calculateDepth(parentId, visited)
          )
        );
        const depth = maxParentDepth + 1;
        roleDepths.set(roleId, depth);
        return depth;
      };

      // Calculate depths for all roles
      roles.forEach((role) => calculateDepth(role.id));

      const depths = Array.from(roleDepths.values());
      const maxDepth = Math.max(...depths, 0);
      const averageDepth =
        depths.length > 0
          ? depths.reduce((a, b) => a + b, 0) / depths.length
          : 0;

      // Find root roles (no parents)
      const rootRoles = roles
        .filter((role) => !role.parentRoles || role.parentRoles.length === 0)
        .map((role) => role.id);

      // Find leaf roles (no children)
      const leafRoles = roles
        .filter(
          (role) =>
            !childrenMap.has(role.id) || childrenMap.get(role.id)!.length === 0
        )
        .map((role) => role.id);

      // Find orphaned roles (not referenced by others and have no children)
      const referencedRoles = new Set(
        roles.flatMap((role) => role.parentRoles || [])
      );
      const orphanedRoles = roles
        .filter(
          (role) =>
            !referencedRoles.has(role.id) && role.parentRoles?.length === 0
        )
        .map((role) => role.id);

      // Find most inherited role
      const inheritanceCounts = new Map<string, number>();
      roles.forEach((role) => {
        (role.parentRoles || []).forEach((parentId) => {
          inheritanceCounts.set(
            parentId,
            (inheritanceCounts.get(parentId) || 0) + 1
          );
        });
      });

      const mostInheritedEntry = Array.from(inheritanceCounts.entries()).reduce(
        (max, current) => (current[1] > max[1] ? current : max),
        ["", 0]
      );

      // Calculate complexity score
      const complexityFactors = {
        depthPenalty: Math.min(maxDepth * 10, 40), // Up to 40 points for depth
        breadthPenalty: Math.min(roles.length * 2, 30), // Up to 30 points for role count
        inheritancePenalty: Math.min(inheritanceCounts.size * 5, 30), // Up to 30 points for inheritance complexity
      };
      const complexityScore = Math.min(
        complexityFactors.depthPenalty +
          complexityFactors.breadthPenalty +
          complexityFactors.inheritancePenalty,
        100
      );

      metrics = {
        totalRoles: roles.length,
        maxDepth,
        averageDepth: Number(averageDepth.toFixed(2)),
        rootRoles,
        leafRoles,
        orphanedRoles,
        mostInheritedRole: {
          roleId: mostInheritedEntry[0],
          inheritanceCount: mostInheritedEntry[1],
        },
        complexityScore,
      };
    }

    let antipatterns;
    if (detectAntipatterns && metrics) {
      antipatterns = [];

      // Deep hierarchy anti-pattern
      if (metrics.maxDepth > 5) {
        antipatterns.push({
          type: "deep-hierarchy" as const,
          severity:
            metrics.maxDepth > 8 ? ("high" as const) : ("medium" as const),
          description: `Role hierarchy is ${metrics.maxDepth} levels deep, which can impact performance and maintainability`,
          affectedRoles: roles
            .filter((role) => roleDepths?.get(role.id)! > 5)
            .map((role) => role.id),
          suggestion:
            "Consider flattening the hierarchy by consolidating intermediate roles",
        });
      }

      // Role explosion anti-pattern
      if (metrics.totalRoles > 50) {
        antipatterns.push({
          type: "role-explosion" as const,
          severity:
            metrics.totalRoles > 100 ? ("high" as const) : ("medium" as const),
          description: `Large number of roles (${metrics.totalRoles}) can be difficult to manage`,
          affectedRoles: [],
          suggestion:
            "Consider consolidating similar roles or using parameterized permissions",
        });
      }

      // God role anti-pattern (role with too many permissions)
      const godRoles = roles.filter((role) => role.permissions.length > 20);
      if (godRoles.length > 0) {
        antipatterns.push({
          type: "god-role" as const,
          severity: "high" as const,
          description:
            "Some roles have excessive permissions, violating principle of least privilege",
          affectedRoles: godRoles.map((role) => role.id),
          suggestion:
            "Split overprivileged roles into more specific, focused roles",
        });
      }

      // Duplicate permissions anti-pattern
      const permissionSets = new Map<string, string[]>();
      roles.forEach((role) => {
        const permissionKey = role.permissions
          .map((p) => `${p.resource}:${p.action}:${p.scope}`)
          .sort()
          .join("|");

        if (!permissionSets.has(permissionKey))
          permissionSets.set(permissionKey, []);
        permissionSets.get(permissionKey)!.push(role.id);
      });

      const duplicateGroups = Array.from(permissionSets.entries()).filter(
        ([, roleIds]) => roleIds.length > 1
      );

      if (duplicateGroups.length > 0) {
        antipatterns.push({
          type: "duplicate-permissions" as const,
          severity: "medium" as const,
          description: "Multiple roles have identical permission sets",
          affectedRoles: duplicateGroups.flatMap(([, roleIds]) => roleIds),
          suggestion:
            "Consolidate roles with identical permissions or establish inheritance relationships",
        });
      }
    }

    let optimizations;
    if (suggestOptimizations && metrics && antipatterns) {
      optimizations = [];

      // Suggest consolidation if there are duplicate permissions
      const duplicateAntipattern = antipatterns.find(
        (ap) => ap.type === "duplicate-permissions"
      );
      if (duplicateAntipattern) {
        optimizations.push({
          type: "consolidate" as const,
          description: "Merge roles with identical permission sets",
          estimatedImprovement: `Reduce role count by ~${Math.floor(
            duplicateAntipattern.affectedRoles.length / 2
          )} roles`,
          steps: [
            "Identify roles with identical permissions",
            "Create single consolidated role with merged metadata",
            "Update user assignments to use consolidated role",
            "Remove duplicate roles",
          ],
        });
      }

      // Suggest flattening for deep hierarchies
      if (metrics.maxDepth > 6) {
        optimizations.push({
          type: "flatten" as const,
          description:
            "Reduce hierarchy depth by eliminating intermediate roles",
          estimatedImprovement: `Reduce max depth to 3-4 levels, improving query performance by ~${Math.floor(
            (metrics.maxDepth - 4) * 15
          )}%`,
          steps: [
            "Identify intermediate roles that only inherit and delegate permissions",
            "Merge permissions directly into child roles",
            "Remove unnecessary intermediate roles",
            "Update role assignments",
          ],
        });
      }

      // Suggest splitting god roles
      const godAntipattern = antipatterns.find((ap) => ap.type === "god-role");
      if (godAntipattern) {
        optimizations.push({
          type: "split" as const,
          description:
            "Break down overprivileged roles into focused, specific roles",
          estimatedImprovement:
            "Improve security posture and reduce blast radius of privilege escalation",
          steps: [
            "Analyze permission usage patterns for overprivileged roles",
            "Group related permissions into focused role categories",
            "Create new specific roles with targeted permissions",
            "Establish inheritance relationships where appropriate",
            "Migrate users to appropriate specific roles",
          ],
        });
      }
    }

    return {
      isValid: true,
      errors: [],
      ...(metrics && { metrics }),
      ...(antipatterns && { antipatterns }),
      ...(optimizations && { optimizations }),
    };
  }

  /**
   * 🧩 PLATINUM ENHANCEMENT: Visualizes role hierarchy as tree structure
   *
   * Generates ASCII or structured tree representation of the role hierarchy
   * for documentation, debugging, and organizational understanding.
   *
   * @example
   * ```typescript
   * const tree = RbacUtils.visualizeRoleHierarchy(roles, {
   *   format: 'ascii',
   *   includePermissionCount: true,
   *   maxDepth: 5
   * });
   *
   * console.log(tree.ascii);
   * // Output:
   * // ├── Admin (15 perms)
   * // │   ├── Manager (8 perms)
   * // │   │   └── User (3 perms)
   * // └── Guest (1 perm)
   * ```
   */
  static visualizeRoleHierarchy(
    roles: Role[],
    options: {
      /** Output format */
      format?: "ascii" | "structured" | "both";
      /** Include permission count in visualization */
      includePermissionCount?: boolean;
      /** Maximum depth to visualize */
      maxDepth?: number;
      /** Custom role display formatter */
      roleFormatter?: (role: Role, depth: number) => string;
    } = {}
  ): {
    ascii?: string;
    structured?: Array<{
      roleId: string;
      roleName: string;
      depth: number;
      children: string[];
      permissionCount: number;
      path: string[];
    }>;
  } {
    const {
      format = "ascii",
      includePermissionCount = false,
      maxDepth = 10,
      roleFormatter,
    } = options;

    const roleMap = new Map(roles.map((role) => [role.id, role]));
    const childrenMap = new Map<string, string[]>();

    // Build children map
    for (const role of roles) {
      if (role.parentRoles) {
        for (const parentId of role.parentRoles) {
          if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
          childrenMap.get(parentId)!.push(role.id);
        }
      }
    }

    // Find root roles (roles with no parents)
    const rootRoles = roles.filter(
      (role) => !role.parentRoles || role.parentRoles.length === 0
    );

    const structured: Array<{
      roleId: string;
      roleName: string;
      depth: number;
      children: string[];
      permissionCount: number;
      path: string[];
    }> = [];

    let ascii = "";

    const buildVisualization = (
      roleId: string,
      depth: number,
      path: string[],
      prefix: string = "",
      isLast: boolean = true
    ): void => {
      if (depth > maxDepth) return;

      const role = roleMap.get(roleId);
      if (!role) return;

      const children = childrenMap.get(roleId) || [];
      const permissionText = includePermissionCount
        ? ` (${role.permissions.length} perms)`
        : "";

      // Custom formatter or default
      const displayText = roleFormatter
        ? roleFormatter(role, depth)
        : `${role.name}${permissionText}`;

      // Add to structured output
      if (format === "structured" || format === "both") {
        structured.push({
          roleId: role.id,
          roleName: role.name,
          depth,
          children: children.map(
            (childId) => roleMap.get(childId)?.name || childId
          ),
          permissionCount: role.permissions.length,
          path: [...path],
        });
      }

      // Add to ASCII output
      if (format === "ascii" || format === "both") {
        const connector = isLast ? "└── " : "├── ";
        ascii += prefix + connector + displayText + "\n";
      }

      // Process children
      children.forEach((childId, index) => {
        const isLastChild = index === children.length - 1;
        const childPrefix = prefix + (isLast ? "    " : "│   ");
        buildVisualization(
          childId,
          depth + 1,
          [...path, roleId],
          childPrefix,
          isLastChild
        );
      });
    };

    // Build visualization starting from root roles
    if (format === "ascii" || format === "both") {
      ascii = "Role Hierarchy:\n";
    }

    rootRoles.forEach((role, index) => {
      const isLastRoot = index === rootRoles.length - 1;
      buildVisualization(role.id, 0, [], "", isLastRoot);
    });

    const result: {
      ascii?: string;
      structured?: Array<{
        roleId: string;
        roleName: string;
        depth: number;
        children: string[];
        permissionCount: number;
        path: string[];
      }>;
    } = {};

    if (format === "ascii" || format === "both") {
      result.ascii = ascii;
    }
    if (format === "structured" || format === "both") {
      result.structured = structured;
    }

    return result;
  }
}
