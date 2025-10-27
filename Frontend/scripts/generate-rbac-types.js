#!/usr/bin/env node

/**
 * RBAC Types Generator
 * Generates TypeScript types from RBAC.schema.v7.yml
 * Keeps frontend synchronized with backend permissions
 *
 * Usage: node scripts/generate-rbac-types.js
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// =============================================================================
// CONFIGURATION
// =============================================================================
const SCHEMA_FILE = path.join(__dirname, "../RBAC.schema.v7.yml");
const OUTPUT_FILE = path.join(
  __dirname,
  "../features/rbac/types/rbac.generated.ts"
);
const BACKUP_SCHEMA = path.join(__dirname, "../../Backend/RBAC.schema.v7.yml");

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
function loadSchemaFile() {
  let schemaPath = SCHEMA_FILE;

  // Try frontend location first
  if (!fs.existsSync(schemaPath)) {
    console.log("Schema not found in frontend, trying backend location...");
    schemaPath = BACKUP_SCHEMA;
  }

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`RBAC schema file not found at ${schemaPath}`);
  }

  console.log(`📖 Loading schema from: ${schemaPath}`);
  return yaml.load(fs.readFileSync(schemaPath, "utf8"));
}

function formatRoleConstant(roleCode) {
  return roleCode.toUpperCase();
}

function formatPermissionFromSchema(domain, model, action) {
  return `${model}.${action}`;
}

function extractPermissionsFromSchema(schema) {
  const allPermissions = new Set();

  // Extract from role permissions
  Object.entries(schema.permissions || {}).forEach(([roleName, rolePerms]) => {
    Object.entries(rolePerms).forEach(([domain, permissions]) => {
      if (Array.isArray(permissions)) {
        permissions.forEach((perm) => allPermissions.add(perm));
      } else if (typeof permissions === "object") {
        Object.entries(permissions).forEach(([model, actions]) => {
          if (Array.isArray(actions)) {
            actions.forEach((action) => {
              allPermissions.add(`${model}.${action}`);
            });
          }
        });
      }
    });
  });

  return Array.from(allPermissions).sort();
}

// =============================================================================
// TYPE GENERATORS
// =============================================================================
function generateRoleTypes(schema) {
  const roles = schema.roles || [];

  const roleEnum = roles
    .map((role) => `  ${formatRoleConstant(role.code)} = "${role.code}"`)
    .join(",\n");

  const roleDefinitions = roles
    .map(
      (role) => `
  [Role.${formatRoleConstant(role.code)}]: {
    code: Role.${formatRoleConstant(role.code)},
    name: "${role.name}",
    description: "${role.description}",
    scope: "${role.scope}"
  }`
    )
    .join(",");

  return `
// =============================================================================
// ROLES (Generated from RBAC.schema.v${schema.version})
// =============================================================================
export enum Role {
${roleEnum}
}

export interface RoleDefinition {
  code: Role;
  name: string;
  description: string;
  scope: string;
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {${roleDefinitions}
};`;
}

function generateDomainTypes(schema) {
  const domains = schema.domains || [];

  const domainEnum = domains
    .map((domain) => `  ${domain.toUpperCase()} = "${domain}"`)
    .join(",\n");

  return `
// =============================================================================
// DOMAINS (Generated from schema)
// =============================================================================
export enum Domain {
${domainEnum}
}`;
}

function generateActionTypes(schema) {
  const actions = schema.actions || [];

  const actionEnum = actions
    .map((action) => `  ${action.toUpperCase()} = "${action}"`)
    .join(",\n");

  return `
// =============================================================================
// ACTIONS (Generated from schema)
// =============================================================================
export enum Action {
${actionEnum}
}`;
}

function generatePermissionTypes(schema) {
  const permissions = extractPermissionsFromSchema(schema);

  // Generate permission literals for better type safety
  const permissionLiterals = permissions.map((perm) => `"${perm}"`).join(" | ");

  return `
// =============================================================================
// PERMISSIONS (Generated from role definitions)
// =============================================================================
export type Permission = ${permissionLiterals};

export const ALL_PERMISSIONS: Permission[] = [
${permissions.map((perm) => `  "${perm}"`).join(",\n")}
];`;
}

function generateRolePermissionMappings(schema) {
  const mappings = [];

  Object.entries(schema.permissions || {}).forEach(([roleName, domains]) => {
    const permissions = [];

    Object.entries(domains).forEach(([domain, domainPerms]) => {
      if (Array.isArray(domainPerms)) {
        permissions.push(...domainPerms);
      } else if (typeof domainPerms === "object") {
        Object.entries(domainPerms).forEach(([model, actions]) => {
          if (Array.isArray(actions)) {
            actions.forEach((action) => {
              permissions.push(`${model}.${action}`);
            });
          }
        });
      }
    });

    const roleConstant = formatRoleConstant(roleName);
    const permissionArray = [...new Set(permissions)]
      .sort()
      .map((perm) => `    "${perm}"`)
      .join(",\n");

    mappings.push(`  [Role.${roleConstant}]: [
${permissionArray}
  ]`);
  });

  return `
// =============================================================================
// ROLE PERMISSION MAPPINGS (Generated from schema)
// =============================================================================
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
${mappings.join(",\n\n")}
};`;
}

function generateUtilityTypes() {
  return `
// =============================================================================
// UTILITY TYPES
// =============================================================================
export interface UserRoles {
  roles: Role[];
  permissions: Permission[];
  tenantId: string;
  isSandbox?: boolean;
}

export interface GuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export interface RoleGuardProps extends GuardProps {
  roles: Role | Role[];
  requireAll?: boolean;
}

export interface PermissionGuardProps extends GuardProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
export const hasRole = (userRoles: Role[], requiredRoles: Role | Role[], requireAll = false): boolean => {
  const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  if (requireAll) {
    return rolesToCheck.every(role => userRoles.includes(role));
  } else {
    return rolesToCheck.some(role => userRoles.includes(role));
  }
};

export const hasPermission = (userPermissions: Permission[], requiredPermissions: Permission | Permission[], requireAll = false): boolean => {
  const permsToCheck = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  
  if (requireAll) {
    return permsToCheck.every(perm => userPermissions.includes(perm));
  } else {
    return permsToCheck.some(perm => userPermissions.includes(perm));
  }
};

export const getRolePermissions = (role: Role): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

export const getUserEffectivePermissions = (userRoles: Role[]): Permission[] => {
  const allPermissions = new Set<Permission>();
  
  userRoles.forEach(role => {
    const rolePerms = getRolePermissions(role);
    rolePerms.forEach(perm => allPermissions.add(perm));
  });
  
  return Array.from(allPermissions);
};`;
}

function generateFileHeader(schema) {
  const timestamp = new Date().toISOString();

  return `/**
 * RBAC Types - AUTO-GENERATED
 * 
 * Generated from: RBAC.schema.v${schema.version}
 * Generated on: ${timestamp}
 * 
 * ⚠️  DO NOT EDIT MANUALLY ⚠️
 * This file is auto-generated from the RBAC schema.
 * To update, modify RBAC.schema.v${schema.version}.yml and run:
 * npm run generate:rbac
 */

import React from 'react';`;
}

// =============================================================================
// MAIN GENERATION FUNCTION
// =============================================================================
function generateRbacTypes() {
  try {
    console.log("🚀 Starting RBAC types generation...");

    // Load schema
    const schema = loadSchemaFile();
    console.log(
      `✅ Schema loaded: v${schema.version} with ${schema.roles?.length || 0} roles`
    );

    // Generate all type sections
    const sections = [
      generateFileHeader(schema),
      generateRoleTypes(schema),
      generateDomainTypes(schema),
      generateActionTypes(schema),
      generatePermissionTypes(schema),
      generateRolePermissionMappings(schema),
      generateUtilityTypes(),
    ];

    // Combine and format
    const output = sections.join("\n");

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created directory: ${outputDir}`);
    }

    // Write output file
    fs.writeFileSync(OUTPUT_FILE, output, "utf8");

    console.log(`✅ Generated RBAC types: ${OUTPUT_FILE}`);
    console.log(
      `📊 Generated ${schema.roles?.length || 0} roles and ${extractPermissionsFromSchema(schema).length} permissions`
    );

    // Generate summary
    const summary = {
      version: schema.version,
      generatedAt: new Date().toISOString(),
      roles: schema.roles?.map((r) => r.code) || [],
      domains: schema.domains || [],
      permissionCount: extractPermissionsFromSchema(schema).length,
    };

    const summaryFile = path.join(outputDir, "rbac.generation.json");
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    console.log(`📋 Generation summary saved: ${summaryFile}`);

    return true;
  } catch (error) {
    console.error("❌ Error generating RBAC types:", error.message);
    process.exit(1);
  }
}

// =============================================================================
// CLI EXECUTION
// =============================================================================
if (require.main === module) {
  generateRbacTypes();
}

module.exports = { generateRbacTypes };
