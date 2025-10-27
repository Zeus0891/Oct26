/**
 * Enhanced RBAC Types Generator
 * Parses RBAC.schema.v7.yml and generates comprehensive TypeScript types
 * Extracts all roles and permissions for compile-time safety
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  schemaPath: path.resolve(__dirname, "../../../RBAC.schema.v7.yml"),
  outputPath: path.resolve(__dirname, "../types/rbac.generated.ts"),
  metadataPath: path.resolve(__dirname, "../types/rbac.generation.json"),
};

// =============================================================================
// ENHANCED SCHEMA PARSER
// =============================================================================

class EnhancedRbacSchemaParser {
  constructor(schemaPath) {
    this.schemaPath = schemaPath;
    this.schema = null;
  }

  loadSchema() {
    try {
      console.log(`📖 Loading RBAC schema from: ${this.schemaPath}`);
      const schemaContent = fs.readFileSync(this.schemaPath, "utf8");
      this.schema = yaml.load(schemaContent);
      console.log(`✅ Loaded RBAC schema v${this.schema.version}`);
      return this.schema;
    } catch (error) {
      throw new Error(`Failed to load RBAC schema: ${error.message}`);
    }
  }

  extractRoles() {
    if (!this.schema?.roles) {
      throw new Error("No roles found in schema");
    }

    const roles = this.schema.roles.map((role) => ({
      code: role.code,
      name: role.name,
      description: role.description,
      scope: role.scope,
    }));

    console.log(
      `📋 Extracted ${roles.length} roles:`,
      roles.map((r) => r.code)
    );
    return roles;
  }

  extractDomains() {
    if (!this.schema?.domains) {
      console.log("⚠️  No domains found in schema");
      return [];
    }

    console.log(
      `🏛️  Extracted ${this.schema.domains.length} domains:`,
      this.schema.domains.slice(0, 5)
    );
    return this.schema.domains;
  }

  extractActions() {
    if (!this.schema?.actions) {
      console.log("⚠️  No actions found in schema");
      return [];
    }

    console.log(
      `⚡ Extracted ${this.schema.actions.length} actions:`,
      this.schema.actions.slice(0, 10)
    );
    return this.schema.actions;
  }

  validateRoleConsistency() {
    // Get defined roles
    const definedRoles = new Set(
      this.schema.roles?.map((role) => role.code) || []
    );

    // Get roles used in permissions
    const usedRoles = new Set(Object.keys(this.schema.permissions || {}));

    // Find missing role definitions
    const undefinedRoles = [...usedRoles].filter(
      (role) => !definedRoles.has(role)
    );
    const unusedRoles = [...definedRoles].filter(
      (role) => !usedRoles.has(role)
    );

    if (undefinedRoles.length > 0) {
      console.warn(
        `⚠️  WARNING: Roles used in permissions but not defined in roles section:`,
        undefinedRoles
      );
    }

    if (unusedRoles.length > 0) {
      console.warn(
        `⚠️  WARNING: Roles defined but not used in permissions:`,
        unusedRoles
      );
    }

    console.log(
      `✅ Role consistency check: ${definedRoles.size} defined, ${usedRoles.size} used`
    );
  }

  extractAllPermissions() {
    if (!this.schema?.permissions) {
      throw new Error("No permissions found in schema");
    }

    const allPermissions = new Set();
    const rolePermissions = {};

    // Validate role consistency
    this.validateRoleConsistency();

    // Extract permissions from each role
    Object.entries(this.schema.permissions).forEach(([roleCode, roleData]) => {
      if (!roleData || typeof roleData !== "object") return;

      const rolePerms = [];

      // Iterate through domains for this role
      Object.entries(roleData).forEach(([domainKey, domainPerms]) => {
        if (Array.isArray(domainPerms)) {
          // Direct array of permissions
          domainPerms.forEach((perm) => {
            allPermissions.add(perm);
            rolePerms.push(perm);
          });
        } else if (typeof domainPerms === "object" && domainPerms !== null) {
          // Nested object with permission arrays
          Object.entries(domainPerms).forEach(([subDomain, subPerms]) => {
            if (Array.isArray(subPerms)) {
              subPerms.forEach((perm) => {
                allPermissions.add(perm);
                rolePerms.push(perm);
              });
            }
          });
        }
      });

      rolePermissions[roleCode] = rolePerms;
    });

    const permissionsArray = Array.from(allPermissions).sort();
    console.log(`🔐 Extracted ${permissionsArray.length} unique permissions`);
    console.log(`📊 Sample permissions:`, permissionsArray.slice(0, 10));

    return { permissions: permissionsArray, rolePermissions };
  }

  generateMetadata() {
    const roles = this.extractRoles();
    const domains = this.extractDomains();
    const actions = this.extractActions();
    const { permissions, rolePermissions } = this.extractAllPermissions();

    return {
      version: this.schema.version,
      generatedAt: new Date().toISOString(),
      generatedDate: this.schema.generated_date,
      schemaSync: this.schema.schema_sync,
      summary: {
        roleCount: roles.length,
        permissionCount: permissions.length,
        domainCount: domains.length,
        actionCount: actions.length,
      },
      roles: roles.map((r) => r.code),
      domains,
      actions,
      rolePermissions,
      samplePermissions: permissions.slice(0, 20),
    };
  }
}

// =============================================================================
// TYPESCRIPT GENERATOR
// =============================================================================

class TypeScriptGenerator {
  constructor(parser) {
    this.parser = parser;
  }

  generateRoleTypes(roles) {
    const roleList = roles.map((role) => `  | '${role.code}'`).join("\n");

    return `
/**
 * Role Types
 * Generated from RBAC.schema.v7.yml
 */
export type RoleCode = 
${roleList};

export interface Role {
  code: RoleCode;
  name: string;
  description: string;
  scope: 'TENANT' | 'SYSTEM';
}

export const ROLES: Record<RoleCode, Role> = {
${roles
  .map(
    (role) => `  '${role.code}': {
    code: '${role.code}',
    name: '${role.name}',
    description: '${role.description}',
    scope: '${role.scope}',
  }`
  )
  .join(",\n")}
} as const;`;
  }

  generatePermissionTypes(permissions) {
    if (permissions.length === 0) {
      return `
/**
 * Permission Types
 * Generated from RBAC.schema.v7.yml
 */
export type Permission = string;

export const PERMISSIONS: Permission[] = [];`;
    }

    const permissionList = permissions
      .map((perm) => `  | '${perm}'`)
      .join("\n");

    return `
/**
 * Permission Types
 * Generated from RBAC.schema.v7.yml
 */
export type Permission = 
${permissionList};

export const PERMISSIONS: Permission[] = [
${permissions.map((perm) => `  '${perm}'`).join(",\n")}
] as const;`;
  }

  generateDomainTypes(domains) {
    if (!domains || domains.length === 0) {
      return `
/**
 * Domain Types
 * Generated from RBAC.schema.v7.yml
 */
export type Domain = string;
export const DOMAINS: Domain[] = [];`;
    }

    const domainList = domains.map((domain) => `  | '${domain}'`).join("\n");

    return `
/**
 * Domain Types
 * Generated from RBAC.schema.v7.yml
 */
export type Domain = 
${domainList};

export const DOMAINS: Domain[] = [
${domains.map((domain) => `  '${domain}'`).join(",\n")}
] as const;`;
  }

  generateActionTypes(actions) {
    if (!actions || actions.length === 0) {
      return `
/**
 * Action Types
 * Generated from RBAC.schema.v7.yml
 */
export type Action = string;
export const ACTIONS: Action[] = [];`;
    }

    const actionList = actions.map((action) => `  | '${action}'`).join("\n");

    return `
/**
 * Action Types
 * Generated from RBAC.schema.v7.yml
 */
export type Action = 
${actionList};

export const ACTIONS: Action[] = [
${actions.map((action) => `  '${action}'`).join(",\n")}
] as const;`;
  }

  generateRolePermissionMappings(rolePermissions) {
    return `
/**
 * Role Permission Mappings
 * Generated from RBAC.schema.v7.yml
 */
export const ROLE_PERMISSIONS: Record<RoleCode, Permission[]> = {
${Object.entries(rolePermissions)
  .map(
    ([role, perms]) =>
      `  '${role}': [
${perms.map((perm) => `    '${perm}'`).join(",\n")}
  ]`
  )
  .join(",\n")}
} as const;`;
  }

  generateUtilityTypes() {
    return `
/**
 * Utility Types and Interfaces
 * Generated from RBAC.schema.v7.yml
 */

export interface RbacContext {
  roles: RoleCode[];
  permissions: Permission[];
  tenantId: string | null;
  userId: string;
}

export interface RbacCheck {
  hasRole(role: RoleCode | RoleCode[]): boolean;
  hasPermission(permission: Permission | Permission[]): boolean;
  hasAnyRole(roles: RoleCode[]): boolean;
  hasAnyPermission(permissions: Permission[]): boolean;
  hasAllRoles(roles: RoleCode[]): boolean;
  hasAllPermissions(permissions: Permission[]): boolean;
}

export interface MemberProfile {
  id: string;
  userId: string;
  tenantId: string;
  roles: RoleCode[];
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionGuardProps {
  permissions: Permission | Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export interface RoleGuardProps {
  roles: RoleCode | RoleCode[];
  fallback?: React.ReactNode; 
  children: React.ReactNode;
}`;
  }

  generateFullTypeScript() {
    const roles = this.parser.extractRoles();
    const domains = this.parser.extractDomains();
    const actions = this.parser.extractActions();
    const { permissions, rolePermissions } =
      this.parser.extractAllPermissions();

    const header = `/**
 * RBAC Generated Types
 * 
 * This file is auto-generated from RBAC.schema.v7.yml
 * DO NOT EDIT MANUALLY - Run 'npm run generate:rbac' to regenerate
 * 
 * Generated: ${new Date().toISOString()}
 * Schema Version: ${this.parser.schema.version}
 * Roles: ${roles.length}
 * Permissions: ${permissions.length}
 * Domains: ${domains.length}
 */

import React from 'react';`;

    return [
      header,
      this.generateRoleTypes(roles),
      this.generatePermissionTypes(permissions),
      this.generateDomainTypes(domains),
      this.generateActionTypes(actions),
      this.generateRolePermissionMappings(rolePermissions),
      this.generateUtilityTypes(),
    ].join("\n\n");
  }
}

// =============================================================================
// MAIN GENERATOR FUNCTION
// =============================================================================

function generateRbacTypes() {
  try {
    console.log("🚀 Starting RBAC types generation...\n");

    // Initialize parser
    const parser = new EnhancedRbacSchemaParser(CONFIG.schemaPath);
    parser.loadSchema();

    // Generate TypeScript code
    const generator = new TypeScriptGenerator(parser);
    const typeScriptCode = generator.generateFullTypeScript();

    // Generate metadata
    const metadata = parser.generateMetadata();

    // Ensure output directory exists
    const outputDir = path.dirname(CONFIG.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write TypeScript file
    fs.writeFileSync(CONFIG.outputPath, typeScriptCode, "utf8");
    console.log(`✅ Generated TypeScript types: ${CONFIG.outputPath}`);

    // Write metadata file
    fs.writeFileSync(
      CONFIG.metadataPath,
      JSON.stringify(metadata, null, 2),
      "utf8"
    );
    console.log(`✅ Generated metadata: ${CONFIG.metadataPath}`);

    console.log("\n📊 Generation Summary:");
    console.log(`   Roles: ${metadata.summary.roleCount}`);
    console.log(`   Permissions: ${metadata.summary.permissionCount}`);
    console.log(`   Domains: ${metadata.summary.domainCount}`);
    console.log(`   Actions: ${metadata.summary.actionCount}`);

    return { success: true, metadata };
  } catch (error) {
    console.error("❌ RBAC types generation failed:");
    console.error(error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

// =============================================================================
// EXECUTION
// =============================================================================

if (require.main === module) {
  generateRbacTypes();
}

module.exports = {
  generateRbacTypes,
  EnhancedRbacSchemaParser,
  TypeScriptGenerator,
};
