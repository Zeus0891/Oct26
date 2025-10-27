#!/usr/bin/env tsx
/**
 * 🚀 ERP Multi-tenant RLS Policy Generator
 * 
 * Generates role-based Row Level Security policies for all tables
 * Reads table list from enable_rls migration
 * Creates policies matching the helper functions
 */

import * as fs from 'fs';
import * as path from 'path';

// Configuration
const ROLES = [
  { name: 'admin', helper: 'app.is_admin()' },
  { name: 'project_manager', helper: 'app.is_project_manager()' },
  { name: 'worker', helper: 'app.is_worker()' },
  { name: 'driver', helper: 'app.is_driver()' },
  { name: 'viewer', helper: 'app.is_viewer()' }
];

interface TableInfo {
  name: string;
  hasSoftDelete: boolean;
  schema: string;
}

/**
 * Extract tables from enable_rls migration
 */
function extractTablesFromRLSMigration(migrationPath: string): TableInfo[] {
  const content = fs.readFileSync(migrationPath, 'utf-8');
  const tables: TableInfo[] = [];
  
  // Match: ALTER TABLE public."TableName" ENABLE ROW LEVEL SECURITY;
  const regex = /ALTER TABLE\s+(public)\."([^"]+)"\s+ENABLE ROW LEVEL SECURITY;/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const schema = match[1] || 'public';
    const tableName = match[2] || '';
    if (tableName) {
      tables.push({
        name: tableName,
        schema,
        hasSoftDelete: false // Will be detected from schema
      });
    }
  }
  
  return tables;
}

/**
 * Detect if table has soft delete from Prisma schema
 */
function detectSoftDelete(tables: TableInfo[], schemaPath: string): TableInfo[] {
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  
  return tables.map(table => {
    // Look for model definition and check for deletedAt field
    const modelRegex = new RegExp(`model\\s+${table.name}\\s*\\{([^}]+)\\}`, 's');
    const modelMatch = schemaContent.match(modelRegex);
    
    if (modelMatch) {
      const modelBody = modelMatch[1];
      const hasSoftDelete = /deletedAt\s+DateTime\?/.test(modelBody);
      return { ...table, hasSoftDelete };
    }
    
    return table;
  });
}

/**
 * Generate policy SQL for a single table and role
 */
function generatePolicyForRole(
  table: TableInfo,
  role: { name: string; helper: string },
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
): string {
  const policyName = `rls_${role.name}_${operation.toLowerCase()}_${table.name.toLowerCase()}`;
  const tableFQN = `${table.schema}."${table.name}"`;
  
  let sql = `-- ${operation}\n`;
  sql += `DROP POLICY IF EXISTS "${policyName}" ON ${tableFQN};\n\n`;
  sql += `CREATE POLICY "${policyName}"\n`;
  sql += `ON ${tableFQN}\n`;
  sql += `AS RESTRICTIVE\n`;
  sql += `FOR ${operation}\n`;
  sql += `TO authenticated\n`;
  
  // Build conditions based on operation and soft delete
  const baseCond = `${role.helper}\n  AND "tenantId" = app.current_tenant_id()`;
  const softDeleteCond = table.hasSoftDelete ? `\n  AND "deletedAt" IS NULL` : '';
  
  switch (operation) {
    case 'SELECT':
      sql += `USING (\n  ${baseCond}${softDeleteCond}\n);\n`;
      break;
      
    case 'INSERT':
      // INSERT should NOT validate deletedAt
      sql += `WITH CHECK (\n  ${baseCond}\n);\n`;
      break;
      
    case 'UPDATE':
      // USING checks existing row (with deletedAt for soft delete tables)
      // WITH CHECK allows updating deletedAt field
      sql += `USING (\n  ${baseCond}${softDeleteCond}\n)\n`;
      sql += `WITH CHECK (\n  ${baseCond}\n);\n`;
      break;
      
    case 'DELETE':
      // DELETE should NOT validate deletedAt (allow purging soft-deleted records)
      sql += `USING (\n  ${baseCond}\n);\n`;
      break;
  }
  
  return sql;
}

/**
 * Generate all policies for a table
 */
function generatePoliciesForTable(
  table: TableInfo,
  role: { name: string; helper: string }
): string {
  const operations: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE')[] = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
  
  let sql = `-- ================================================================================\n\n`;
  sql += `-- Note: ${table.name} ${table.hasSoftDelete ? 'uses' : 'does not use'} soft delete (deletedAt)\n`;
  sql += `-- Role: ${role.name.toUpperCase()}\n\n`;
  
  for (const operation of operations) {
    sql += generatePolicyForRole(table, role, operation);
    sql += '\n';
  }
  
  return sql;
}

/**
 * Generate migration file for a specific role
 */
function generateRoleMigration(
  tables: TableInfo[],
  role: { name: string; helper: string },
  outputDir: string
): void {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const filename = `${timestamp}_${role.name}_policies.sql`;
  const filepath = path.join(outputDir, filename);
  
  let sql = `-- ${role.name.toUpperCase()} policies for all tables with tenantId\n`;
  sql += `-- Generated automatically\n`;
  sql += `-- Tables with soft delete include deletedAt condition in SELECT/UPDATE USING\n`;
  sql += `-- INSERT and DELETE do NOT validate deletedAt\n\n`;
  
  for (const table of tables) {
    sql += generatePoliciesForTable(table, role);
  }
  
  fs.writeFileSync(filepath, sql, 'utf-8');
  console.log(`✅ Generated: ${filename} (${tables.length} tables)`);
}

/**
 * Generate policy template documentation
 */
function generatePolicyDocumentation(outputDir: string): void {
  const doc = `# RLS Policy Pattern

## Policy Structure

### SELECT Policy
- ✅ Validates: role, tenantId, deletedAt (if soft delete)
- Used for: Reading data

### INSERT Policy
- ✅ Validates: role, tenantId
- ❌ Does NOT validate: deletedAt
- Reason: New records don't have deletedAt set yet

### UPDATE Policy
- ✅ USING validates: role, tenantId, deletedAt (if soft delete)
- ✅ WITH CHECK validates: role, tenantId
- ❌ WITH CHECK does NOT validate: deletedAt
- Reason: Allows updating deletedAt field (soft delete operation)

### DELETE Policy
- ✅ Validates: role, tenantId
- ❌ Does NOT validate: deletedAt
- Reason: Allows purging soft-deleted records

## Roles

${ROLES.map(r => `- ${r.name}: \`${r.helper}\``).join('\n')}

## Soft Delete Tables

Tables with \`deletedAt\` field use soft delete pattern:
- SELECT: Only shows non-deleted records
- UPDATE USING: Can only update non-deleted records
- UPDATE WITH CHECK: Can set deletedAt (soft delete)
- INSERT: No deletedAt validation
- DELETE: Can delete any record (purge operation)
`;

  fs.writeFileSync(path.join(outputDir, 'POLICY_PATTERN.md'), doc, 'utf-8');
  console.log('📝 Generated: POLICY_PATTERN.md');
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 RLS Policy Generator\n');
  
  // Paths
  const projectRoot = process.cwd();
  const migrationsDir = path.join(projectRoot, 'prisma', 'migrations');
  const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');
  const rlsMigrationPath = path.join(migrationsDir, '20251026054613_enable_rls', 'migration.sql');
  const outputDir = path.join(migrationsDir, 'generated_policies');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Extract tables
  console.log('📋 Extracting tables from RLS migration...');
  let tables = extractTablesFromRLSMigration(rlsMigrationPath);
  console.log(`   Found ${tables.length} tables\n`);
  
  // Detect soft delete
  console.log('🔍 Detecting soft delete patterns...');
  tables = detectSoftDelete(tables, schemaPath);
  const softDeleteCount = tables.filter(t => t.hasSoftDelete).length;
  console.log(`   ${softDeleteCount} tables with soft delete\n`);
  
  // Generate policies for each role
  console.log('⚙️  Generating policies...\n');
  for (const role of ROLES) {
    generateRoleMigration(tables, role, outputDir);
  }
  
  // Generate documentation
  console.log('\n📚 Generating documentation...');
  generatePolicyDocumentation(outputDir);
  
  console.log('\n✨ Done! Check prisma/migrations/generated_policies/\n');
}

// Run
main();
