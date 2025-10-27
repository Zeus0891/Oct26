# 🤖 Auto-Generated RBAC System

## 🎯 **Overview**

Este sistema genera automáticamente los tipos TypeScript del frontend a partir del `RBAC.schema.v7.yml`, garantizando **sincronización perfecta** entre backend y frontend.

## ⚙️ **Setup**

```bash
# 1. Install dependencies
npm run setup:rbac

# 2. Generate types (one-time)
npm run generate:rbac

# 3. Watch for schema changes (development)
npm run watch:rbac
```

## 📁 **Generated Files**

```
features/rbac/types/
├── rbac.generated.ts      # 🤖 AUTO-GENERATED (do not edit)
├── rbac.generation.json   # 📊 Generation metadata
└── rbac.types.ts          # ✍️  Manual types (extend as needed)
```

## 🔄 **Auto-Generation Workflow**

### **Development Mode:**

```bash
npm run watch:rbac
# 👀 Watches RBAC.schema.v7.yml for changes
# 🔄 Auto-regenerates types on file save
# ✅ Instant feedback in VS Code
```

### **CI/CD Pipeline:**

```yaml
# .github/workflows/frontend.yml
- name: Generate RBAC Types
  run: |
    npm run generate:rbac
    git diff --exit-code features/rbac/types/rbac.generated.ts || (
      echo "❌ RBAC types out of sync! Run 'npm run generate:rbac'"
      exit 1
    )
```

## 🧩 **Usage Examples**

### **Generated Types:**

```typescript
// Auto-generated from schema v7
export enum Role {
  ADMIN = "ADMIN",
  PROJECT_MANAGER = "PROJECT_MANAGER",
  FINANCE_MANAGER = "FINANCE_MANAGER",
  WORKER = "WORKER",
  VIEWER = "VIEWER",
}

export type Permission =
  | "Tenant.read"
  | "Tenant.update"
  | "User.create"
  | "Project.assign"
  | "Invoice.approve";
// ... 300+ permissions from schema
```

### **In Components:**

```tsx
import { Role, Permission, ROLE_PERMISSIONS } from '@/features/rbac/types/rbac.generated';

// Type-safe roles
<RoleGuard roles={Role.ADMIN}>
  <AdminPanel />
</RoleGuard>

// Type-safe permissions
<PermissionGuard permission="User.create">
  <CreateUserButton />
</PermissionGuard>

// Auto-completion works perfectly!
const adminPermissions = ROLE_PERMISSIONS[Role.ADMIN];
```

## 🔍 **Schema to Types Mapping**

| Schema Element              | Generated Type     | Example                        |
| --------------------------- | ------------------ | ------------------------------ |
| `roles[].code`              | `Role` enum        | `Role.ADMIN`                   |
| `domains[]`                 | `Domain` enum      | `Domain.PROJECT_MANAGEMENT`    |
| `actions[]`                 | `Action` enum      | `Action.CREATE`                |
| `permissions[role][domain]` | `Permission` type  | `"User.create"`                |
| Role permission mappings    | `ROLE_PERMISSIONS` | `ROLE_PERMISSIONS[Role.ADMIN]` |

## 🛠 **Customization**

### **Extending Generated Types:**

```typescript
// features/rbac/types/rbac.types.ts (manual)
import { Role, Permission } from "./rbac.generated";

// Add custom business logic
export interface UserWithRoles {
  user: User;
  roles: Role[];
  effectivePermissions: Permission[];
  tenantContext: TenantContext;
}

// Add domain-specific helpers
export const ProjectPermissions = {
  canCreate: (userPerms: Permission[]) => userPerms.includes("Project.create"),
  canAssign: (userPerms: Permission[]) => userPerms.includes("Task.assign"),
} as const;
```

### **Custom Guard Logic:**

```typescript
// Custom business rule guards
export function ProjectOwnerGuard({ projectId, children }: {
  projectId: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { hasPermission } = useRbac();

  // Combine generated types with business logic
  const canAccess = hasPermission("Project.read") &&
                   (user.id === project.ownerId || hasRole(Role.ADMIN));

  return canAccess ? <>{children}</> : null;
}
```

## 🚀 **Benefits**

### ✅ **Type Safety:**

- **Auto-completion** en VS Code
- **Compile-time errors** si usas permisos inexistentes
- **Refactoring safety** cuando cambias el schema

### ✅ **Consistency:**

- **Single source of truth** (RBAC.schema.v7.yml)
- **Backend-frontend sync** garantizado
- **No drift** entre permisos definidos y usados

### ✅ **Developer Experience:**

- **Instant feedback** con watcher
- **Zero configuration** después del setup inicial
- **CI/CD validation** previene inconsistencias

## 🔧 **Troubleshooting**

### **Schema not found:**

```bash
# Copy schema from backend to frontend
cp ../Backend/RBAC.schema.v7.yml ./RBAC.schema.v7.yml
npm run generate:rbac
```

### **Types out of sync:**

```bash
# Force regeneration
npm run generate:rbac

# Check what changed
git diff features/rbac/types/rbac.generated.ts
```

### **Watcher not working:**

```bash
# Check file permissions
ls -la RBAC.schema.v7.yml

# Restart watcher
npm run watch:rbac
```

## 📊 **Generation Stats**

El generador produce estadísticas completas:

```json
{
  "version": 7,
  "generatedAt": "2025-10-12T20:30:00.000Z",
  "roles": ["ADMIN", "PROJECT_MANAGER", "FINANCE_MANAGER", "WORKER", "VIEWER"],
  "domains": ["tenant_management", "identity_access", "project_management"],
  "permissionCount": 342
}
```

## 🎯 **Next Steps**

1. ✅ **Setup complete** - Types auto-generated from schema v7
2. 🔄 **CI/CD integration** - Validation pipeline ready
3. 🎨 **Use in components** - Type-safe guards available
4. 🔍 **Monitor changes** - Watcher keeps everything in sync

**¡Tu frontend RBAC está completamente sincronizado con el backend!** 🚀
