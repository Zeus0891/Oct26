/**
 * Permission Utils
 * Utility functions for permission management and validation
 * Aligned with backend permission architecture
 */

import { Permission } from "../types/rbac.generated";

// =============================================================================
// PERMISSION PARSING UTILS
// =============================================================================

/**
 * Parse permission string into components
 */
export const parsePermission = (
  permission: Permission
): {
  model: string;
  action: string;
  isValid: boolean;
} => {
  const parts = permission.split(".");

  if (parts.length !== 2) {
    return {
      model: "",
      action: "",
      isValid: false,
    };
  }

  return {
    model: parts[0],
    action: parts[1],
    isValid: true,
  };
};

/**
 * Create permission string from components
 */
export const createPermission = (model: string, action: string): Permission => {
  return `${model}.${action}` as Permission;
};

/**
 * Validate permission format
 */
export const isValidPermissionFormat = (
  permission: string
): permission is Permission => {
  const { isValid } = parsePermission(permission as Permission);
  return isValid;
};

/**
 * Get model name from permission
 */
export const getPermissionModel = (permission: Permission): string => {
  const { model } = parsePermission(permission);
  return model;
};

/**
 * Get action from permission
 */
export const getPermissionAction = (permission: Permission): string => {
  const { action } = parsePermission(permission);
  return action;
};

// =============================================================================
// PERMISSION GROUPING UTILS
// =============================================================================

/**
 * Group permissions by model
 */
export const groupPermissionsByModel = (
  permissions: Permission[]
): Record<string, Permission[]> => {
  const grouped: Record<string, Permission[]> = {};

  permissions.forEach((permission) => {
    const model = getPermissionModel(permission);
    if (!grouped[model]) {
      grouped[model] = [];
    }
    grouped[model].push(permission);
  });

  return grouped;
};

/**
 * Group permissions by action
 */
export const groupPermissionsByAction = (
  permissions: Permission[]
): Record<string, Permission[]> => {
  const grouped: Record<string, Permission[]> = {};

  permissions.forEach((permission) => {
    const action = getPermissionAction(permission);
    if (!grouped[action]) {
      grouped[action] = [];
    }
    grouped[action].push(permission);
  });

  return grouped;
};

/**
 * Get unique models from permissions
 */
export const getUniqueModels = (permissions: Permission[]): string[] => {
  const models = permissions.map((permission) =>
    getPermissionModel(permission)
  );
  return [...new Set(models)].sort();
};

/**
 * Get unique actions from permissions
 */
export const getUniqueActions = (permissions: Permission[]): string[] => {
  const actions = permissions.map((permission) =>
    getPermissionAction(permission)
  );
  return [...new Set(actions)].sort();
};

/**
 * Get all permissions for a specific model
 */
export const getModelPermissions = (
  permissions: Permission[],
  model: string
): Permission[] => {
  return permissions.filter(
    (permission) => getPermissionModel(permission) === model
  );
};

/**
 * Get all permissions for a specific action
 */
export const getActionPermissions = (
  permissions: Permission[],
  action: string
): Permission[] => {
  return permissions.filter(
    (permission) => getPermissionAction(permission) === action
  );
};

// =============================================================================
// PERMISSION FILTERING UTILS
// =============================================================================

/**
 * Filter permissions by pattern
 */
export const filterPermissions = (
  permissions: Permission[],
  pattern: string
): Permission[] => {
  const regex = new RegExp(pattern, "i");
  return permissions.filter((permission) => regex.test(permission));
};

/**
 * Filter permissions by models
 */
export const filterPermissionsByModels = (
  permissions: Permission[],
  models: string[]
): Permission[] => {
  return permissions.filter((permission) =>
    models.includes(getPermissionModel(permission))
  );
};

/**
 * Filter permissions by actions
 */
export const filterPermissionsByActions = (
  permissions: Permission[],
  actions: string[]
): Permission[] => {
  return permissions.filter((permission) =>
    actions.includes(getPermissionAction(permission))
  );
};

/**
 * Get read permissions only
 */
export const getReadPermissions = (permissions: Permission[]): Permission[] => {
  return filterPermissionsByActions(permissions, ["read", "list", "export"]);
};

/**
 * Get write permissions only
 */
export const getWritePermissions = (
  permissions: Permission[]
): Permission[] => {
  return filterPermissionsByActions(permissions, [
    "create",
    "update",
    "duplicate",
  ]);
};

/**
 * Get delete permissions only
 */
export const getDeletePermissions = (
  permissions: Permission[]
): Permission[] => {
  return filterPermissionsByActions(permissions, [
    "soft_delete",
    "hard_delete",
    "archive",
  ]);
};

/**
 * Get admin permissions only
 */
export const getAdminPermissions = (
  permissions: Permission[]
): Permission[] => {
  return filterPermissionsByActions(permissions, [
    "activate",
    "deactivate",
    "assign",
    "unassign",
    "approve",
    "reject",
  ]);
};

// =============================================================================
// PERMISSION ANALYSIS UTILS
// =============================================================================

/**
 * Calculate permission coverage for a model
 */
export const calculateModelCoverage = (
  userPermissions: Permission[],
  allModelPermissions: Permission[]
): {
  model: string;
  coverage: number;
  hasRead: boolean;
  hasWrite: boolean;
  hasDelete: boolean;
  hasAdmin: boolean;
  missingPermissions: Permission[];
} => {
  const model =
    allModelPermissions.length > 0
      ? getPermissionModel(allModelPermissions[0])
      : "Unknown";

  const userModelPermissions = getModelPermissions(userPermissions, model);
  const coverage =
    allModelPermissions.length > 0
      ? (userModelPermissions.length / allModelPermissions.length) * 100
      : 0;

  const hasRead = userModelPermissions.some((p) =>
    ["read", "list", "export"].includes(getPermissionAction(p))
  );
  const hasWrite = userModelPermissions.some((p) =>
    ["create", "update", "duplicate"].includes(getPermissionAction(p))
  );
  const hasDelete = userModelPermissions.some((p) =>
    ["soft_delete", "hard_delete", "archive"].includes(getPermissionAction(p))
  );
  const hasAdmin = userModelPermissions.some((p) =>
    ["activate", "deactivate", "assign", "unassign"].includes(
      getPermissionAction(p)
    )
  );

  const missingPermissions = allModelPermissions.filter(
    (p) => !userModelPermissions.includes(p)
  );

  return {
    model,
    coverage: Math.round(coverage),
    hasRead,
    hasWrite,
    hasDelete,
    hasAdmin,
    missingPermissions,
  };
};

/**
 * Get permission statistics
 */
export const getPermissionStatistics = (permissions: Permission[]) => {
  const byModel = groupPermissionsByModel(permissions);
  const byAction = groupPermissionsByAction(permissions);

  const models = Object.keys(byModel);
  const actions = Object.keys(byAction);

  const readPermissions = getReadPermissions(permissions);
  const writePermissions = getWritePermissions(permissions);
  const deletePermissions = getDeletePermissions(permissions);
  const adminPermissions = getAdminPermissions(permissions);

  return {
    total: permissions.length,
    models: {
      count: models.length,
      list: models,
      distribution: Object.entries(byModel).map(([model, perms]) => ({
        model,
        count: perms.length,
        percentage: Math.round((perms.length / permissions.length) * 100),
      })),
    },
    actions: {
      count: actions.length,
      list: actions,
      distribution: Object.entries(byAction).map(([action, perms]) => ({
        action,
        count: perms.length,
        percentage: Math.round((perms.length / permissions.length) * 100),
      })),
    },
    categories: {
      read: {
        count: readPermissions.length,
        percentage: Math.round(
          (readPermissions.length / permissions.length) * 100
        ),
      },
      write: {
        count: writePermissions.length,
        percentage: Math.round(
          (writePermissions.length / permissions.length) * 100
        ),
      },
      delete: {
        count: deletePermissions.length,
        percentage: Math.round(
          (deletePermissions.length / permissions.length) * 100
        ),
      },
      admin: {
        count: adminPermissions.length,
        percentage: Math.round(
          (adminPermissions.length / permissions.length) * 100
        ),
      },
    },
  };
};

// =============================================================================
// PERMISSION SUGGESTION UTILS
// =============================================================================

/**
 * Suggest missing permissions based on current permissions
 */
export const suggestMissingPermissions = (
  currentPermissions: Permission[],
  availablePermissions: Permission[]
): {
  suggestions: Permission[];
  reasoning: string[];
} => {
  const suggestions: Permission[] = [];
  const reasoning: string[] = [];
  const models = getUniqueModels(currentPermissions);

  models.forEach((model) => {
    const userModelPerms = getModelPermissions(currentPermissions, model);
    const availableModelPerms = getModelPermissions(
      availablePermissions,
      model
    );

    const hasRead = userModelPerms.some(
      (p) => getPermissionAction(p) === "read"
    );
    const hasCreate = userModelPerms.some(
      (p) => getPermissionAction(p) === "create"
    );
    const hasUpdate = userModelPerms.some(
      (p) => getPermissionAction(p) === "update"
    );

    // Suggest read if user has create/update but no read
    if ((hasCreate || hasUpdate) && !hasRead) {
      const readPerm = availableModelPerms.find(
        (p) => getPermissionAction(p) === "read"
      );
      if (readPerm && !suggestions.includes(readPerm)) {
        suggestions.push(readPerm);
        reasoning.push(
          `Added ${readPerm} - typically needed when you can create/update ${model}`
        );
      }
    }

    // Suggest list if user has read
    if (hasRead) {
      const listPerm = availableModelPerms.find(
        (p) => getPermissionAction(p) === "list"
      );
      if (
        listPerm &&
        !userModelPerms.includes(listPerm) &&
        !suggestions.includes(listPerm)
      ) {
        suggestions.push(listPerm);
        reasoning.push(`Added ${listPerm} - commonly paired with read access`);
      }
    }

    // Suggest update if user has create
    if (hasCreate && !hasUpdate) {
      const updatePerm = availableModelPerms.find(
        (p) => getPermissionAction(p) === "update"
      );
      if (updatePerm && !suggestions.includes(updatePerm)) {
        suggestions.push(updatePerm);
        reasoning.push(
          `Added ${updatePerm} - often needed together with create access`
        );
      }
    }
  });

  return { suggestions, reasoning };
};

/**
 * Get permission recommendations based on role
 */
export const getPermissionRecommendations = (
  role: string,
  availablePermissions: Permission[]
): Permission[] => {
  const roleRecommendations: Record<string, string[]> = {
    ADMIN: [
      "read",
      "list",
      "create",
      "update",
      "soft_delete",
      "restore",
      "activate",
      "deactivate",
    ],
    PROJECT_MANAGER: ["read", "list", "create", "update", "assign", "unassign"],
    WORKER: ["read", "list", "update"],
    VIEWER: ["read", "list", "export"],
    DRIVER: ["read", "list"],
  };

  const recommendedActions = roleRecommendations[role] || ["read"];

  return availablePermissions.filter((permission) =>
    recommendedActions.includes(getPermissionAction(permission))
  );
};

// =============================================================================
// PERMISSION DISPLAY UTILS
// =============================================================================

/**
 * Format permission for display
 */
export const formatPermissionForDisplay = (
  permission: Permission
): {
  model: string;
  action: string;
  displayName: string;
  description: string;
  category: "read" | "write" | "delete" | "admin";
} => {
  const { model, action } = parsePermission(permission);

  const actionDisplayNames: Record<string, string> = {
    read: "View",
    list: "List",
    export: "Export",
    create: "Create",
    update: "Edit",
    duplicate: "Duplicate",
    soft_delete: "Delete",
    hard_delete: "Permanently Delete",
    archive: "Archive",
    restore: "Restore",
    activate: "Activate",
    deactivate: "Deactivate",
    assign: "Assign",
    unassign: "Unassign",
    approve: "Approve",
    reject: "Reject",
  };

  const category = getPermissionCategory(action);
  const displayName = `${actionDisplayNames[action] || action} ${model}`;
  const description = `Allows user to ${action.toLowerCase()} ${model.toLowerCase()} records`;

  return {
    model,
    action,
    displayName,
    description,
    category,
  };
};

/**
 * Get permission category
 */
export const getPermissionCategory = (
  action: string
): "read" | "write" | "delete" | "admin" => {
  if (["read", "list", "export"].includes(action)) return "read";
  if (["create", "update", "duplicate"].includes(action)) return "write";
  if (["soft_delete", "hard_delete", "archive"].includes(action))
    return "delete";
  return "admin";
};

/**
 * Sort permissions by model and action
 */
export const sortPermissions = (permissions: Permission[]): Permission[] => {
  return [...permissions].sort((a, b) => {
    const aModel = getPermissionModel(a);
    const bModel = getPermissionModel(b);

    if (aModel !== bModel) {
      return aModel.localeCompare(bModel);
    }

    const aAction = getPermissionAction(a);
    const bAction = getPermissionAction(b);
    return aAction.localeCompare(bAction);
  });
};

/**
 * Create permission tree structure for UI
 */
export const createPermissionTree = (permissions: Permission[]) => {
  const tree = groupPermissionsByModel(permissions);

  return Object.entries(tree).map(([model, modelPermissions]) => ({
    model,
    permissions: modelPermissions.map((permission) => ({
      permission,
      ...formatPermissionForDisplay(permission),
    })),
    categories: {
      read: modelPermissions.filter(
        (p) => getPermissionCategory(getPermissionAction(p)) === "read"
      ),
      write: modelPermissions.filter(
        (p) => getPermissionCategory(getPermissionAction(p)) === "write"
      ),
      delete: modelPermissions.filter(
        (p) => getPermissionCategory(getPermissionAction(p)) === "delete"
      ),
      admin: modelPermissions.filter(
        (p) => getPermissionCategory(getPermissionAction(p)) === "admin"
      ),
    },
  }));
};
