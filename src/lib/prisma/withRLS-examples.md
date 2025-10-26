# withRLS Usage Examples

## 🚀 **Enterprise RLS Engine - Production Examples**

> **Migration Notice**: This documentation covers both legacy patterns and the new core infrastructure integration. For new code, prefer the core infrastructure patterns.

---

## 📋 **Quick Migration Guide**

### **Legacy Pattern (Still Supported)**

```typescript
import { withTenantRLS } from "../lib/prisma/withRLS";
```

### **✅ Recommended: Core Infrastructure Pattern**

```typescript
import { withRLSContext } from "../core/config/prisma.config";
import { withTenantRLS } from "../lib/prisma/withRLS"; // For complex operations
```

---

## 🚀 **Practical Examples for Production Use**

### **1. Service Layer Integration**

#### **`projects.service.ts`**

```typescript
import { withRLS, withTenantRLS } from "../lib/prisma/withRLS";
import { AuthenticatedUser } from "../types";

export class ProjectService {
  /**
   * Create new project with RLS context
   */
  static async createProject(user: AuthenticatedUser, data: any) {
    return withTenantRLS(
      user.tenantId,
      user.roles,
      async (tx) => {
        return tx.project.create({
          data: {
            ...data,
            tenantId: user.tenantId,
            createdBy: user.id,
            status: "ACTIVE",
          },
        });
      },
      user.id
    );
  }

  /**
   * Get projects for current tenant
   */
  static async getProjects(user: AuthenticatedUser, filters?: any) {
    return withTenantRLS(
      user.tenantId,
      user.roles,
      async (tx) => {
        return tx.project.findMany({
          where: {
            ...filters,
            // tenantId is automatically filtered by RLS
          },
          include: {
            createdByUser: true,
            assignments: true,
          },
        });
      },
      user.id
    );
  }

  /**
   * Update project (only if user has permission)
   */
  static async updateProject(
    user: AuthenticatedUser,
    projectId: string,
    data: any
  ) {
    return withTenantRLS(
      user.tenantId,
      user.roles,
      async (tx) => {
        // RLS will ensure user can only update projects they have access to
        return tx.project.update({
          where: { id: projectId },
          data,
        });
      },
      user.id
    );
  }
}
```

#### **`invoices.service.ts`**

```typescript
import { withRLS, withTenantRLS } from "../lib/prisma/withRLS";

export class InvoiceService {
  /**
   * Create invoice with automatic tenant isolation
   */
  static async createInvoice(user: AuthenticatedUser, invoiceData: any) {
    return withTenantRLS(
      user.tenantId,
      user.roles,
      async (tx) => {
        // Create invoice
        const invoice = await tx.invoice.create({
          data: {
            ...invoiceData,
            tenantId: user.tenantId,
            createdBy: user.id,
            status: "DRAFT",
          },
        });

        // Create invoice items in same transaction
        if (invoiceData.items) {
          await tx.invoiceItem.createMany({
            data: invoiceData.items.map((item: any) => ({
              ...item,
              invoiceId: invoice.id,
              tenantId: user.tenantId,
            })),
          });
        }

        return invoice;
      },
      user.id
    );
  }

  /**
   * Generate financial report (admin only)
   */
  static async generateFinancialReport(
    user: AuthenticatedUser,
    dateRange: any
  ) {
    // Validate admin role
    if (!user.roles.includes("TENANT_ADMIN")) {
      throw new Error("Insufficient permissions for financial reports");
    }

    return withRLS(
      {
        tenantId: user.tenantId,
        userId: user.id,
        roles: user.roles,
        correlationId: `financial_report_${Date.now()}`,
      },
      async (tx) => {
        // Complex financial aggregations
        const invoices = await tx.invoice.findMany({
          where: {
            createdAt: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
            status: "PAID",
          },
          include: {
            items: true,
          },
        });

        // Calculate totals
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const invoiceCount = invoices.length;

        return {
          invoices,
          summary: {
            totalRevenue,
            invoiceCount,
            averageInvoice: totalRevenue / invoiceCount,
            period: dateRange,
          },
        };
      }
    );
  }
}
```

### **2. Controller Integration**

#### **`projects.controller.ts`**

```typescript
import { Request, Response } from "express";
import { ProjectService } from "../services/projects.service";
import { AuthenticatedRequest } from "../middlewares/types";

export class ProjectController {
  /**
   * Create project endpoint
   */
  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const project = await ProjectService.createProject(req.user!, req.body);

      // Trigger integrations
      req.eventBus?.publish("BUSINESS_EVENT", "project.created", project);
      req.notifications?.sendInApp(
        req.user!.id,
        "Project Created",
        `Project "${project.name}" has been created successfully`
      );

      res.status(201).json({
        success: true,
        project,
        message: "Project created successfully",
      });
    } catch (error: any) {
      console.error("[PROJECT_CONTROLLER] Create failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to create project",
      });
    }
  }

  /**
   * Get projects with caching
   */
  static async list(req: AuthenticatedRequest, res: Response) {
    try {
      // Check cache first
      const cacheKey = `projects:${req.user!.tenantId}:${JSON.stringify(
        req.query
      )}`;
      let projects = await req.cache?.get(cacheKey);

      if (!projects) {
        projects = await ProjectService.getProjects(req.user!, req.query);

        // Cache for 5 minutes
        await req.cache?.set(cacheKey, projects, {
          ttl: 300,
          tags: [`tenant:${req.user!.tenantId}`, "projects"],
        });
      }

      res.json({
        success: true,
        projects,
        fromCache: !!projects,
        total: projects.length,
      });
    } catch (error: any) {
      console.error("[PROJECT_CONTROLLER] List failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch projects",
      });
    }
  }
}
```

### **3. Advanced RLS Patterns**

#### **Cross-Tenant System Operations**

```typescript
import { withSystemRLS, withRLS } from "../lib/prisma/withRLS";

export class SystemService {
  /**
   * System-wide cleanup (bypasses tenant restrictions)
   */
  static async cleanupExpiredData() {
    return withSystemRLS(async (tx) => {
      // Delete expired sessions across all tenants
      const deletedSessions = await tx.userSession.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      // Archive old invoices (90+ days)
      const archivedInvoices = await tx.invoice.updateMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
          status: "PAID",
        },
        data: {
          archived: true,
        },
      });

      return {
        deletedSessions: deletedSessions.count,
        archivedInvoices: archivedInvoices.count,
      };
    }, `system_cleanup_${Date.now()}`);
  }

  /**
   * Multi-tenant analytics (admin only)
   */
  static async getTenantAnalytics(adminUser: AuthenticatedUser) {
    if (!adminUser.roles.includes("SYSTEM_ADMIN")) {
      throw new Error("System admin access required");
    }

    return withSystemRLS(async (tx) => {
      // Get analytics across all tenants
      const tenantStats = await tx.tenant.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              users: true,
              projects: true,
              invoices: true,
            },
          },
        },
      });

      return tenantStats.map((tenant) => ({
        tenantId: tenant.id,
        tenantName: tenant.name,
        userCount: tenant._count.users,
        projectCount: tenant._count.projects,
        invoiceCount: tenant._count.invoices,
      }));
    }, `analytics_${adminUser.id}_${Date.now()}`);
  }
}
```

#### **Batch Operations with RLS**

```typescript
export class BatchService {
  /**
   * Process multiple tenant operations
   */
  static async processBulkInvoices(
    user: AuthenticatedUser,
    invoiceIds: string[]
  ) {
    return withRLS(
      {
        tenantId: user.tenantId,
        userId: user.id,
        roles: user.roles,
        correlationId: `bulk_invoice_${Date.now()}`,
        sessionMetadata: {
          operation: "bulk_process",
          itemCount: invoiceIds.length,
        },
      },
      async (tx) => {
        const results = [];

        for (const invoiceId of invoiceIds) {
          try {
            const invoice = await tx.invoice.update({
              where: { id: invoiceId },
              data: {
                status: "PROCESSED",
                processedAt: new Date(),
                processedBy: user.id,
              },
            });
            results.push({ invoiceId, success: true, invoice });
          } catch (error) {
            results.push({
              invoiceId,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        return {
          total: invoiceIds.length,
          successful: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
          results,
        };
      }
    );
  }
}
```

### **4. Testing with RLS**

#### **`projects.test.ts`**

```typescript
import { withRLS, RLSUtils } from "../lib/prisma/withRLS";
import { createTestUser, createTestTenant } from "./test-helpers";

describe("Project Service with RLS", () => {
  let tenant1: any, tenant2: any;
  let user1: any, user2: any;

  beforeAll(async () => {
    // Create test tenants and users
    tenant1 = await createTestTenant("tenant-1");
    tenant2 = await createTestTenant("tenant-2");

    user1 = await createTestUser(tenant1.id, ["PROJECT_MANAGER"]);
    user2 = await createTestUser(tenant2.id, ["WORKER"]);
  });

  test("should isolate projects by tenant", async () => {
    // Create project for tenant 1
    const project1 = await withRLS(
      {
        tenantId: tenant1.id,
        userId: user1.id,
        roles: ["PROJECT_MANAGER"],
        correlationId: "test_project_1",
      },
      async (tx) => {
        return tx.project.create({
          data: {
            name: "Tenant 1 Project",
            description: "Project for tenant 1",
            tenantId: tenant1.id,
          },
        });
      }
    );

    // Try to access from tenant 2 (should not see it)
    const tenant2Projects = await withRLS(
      {
        tenantId: tenant2.id,
        userId: user2.id,
        roles: ["WORKER"],
        correlationId: "test_project_2",
      },
      async (tx) => {
        return tx.project.findMany();
      }
    );

    expect(project1.data.name).toBe("Tenant 1 Project");
    expect(tenant2Projects.data).toHaveLength(0); // Should not see tenant 1's project
  });

  test("should validate RLS context", async () => {
    await expect(
      withRLS(
        {
          tenantId: "", // Invalid tenant ID
          roles: ["PROJECT_MANAGER"],
          correlationId: "test_invalid",
        },
        async (tx) => tx.project.findMany()
      )
    ).rejects.toThrow("tenantId is required");
  });

  test("should track active contexts", async () => {
    const contextsBefore = RLSUtils.getActiveContexts().size;

    const promise = withRLS(
      {
        tenantId: tenant1.id,
        roles: ["PROJECT_MANAGER"],
        correlationId: "test_tracking",
      },
      async (tx) => {
        // Check if context is active during operation
        const activeContexts = RLSUtils.getActiveContexts();
        expect(activeContexts.has("test_tracking")).toBe(true);

        return tx.project.findMany();
      }
    );

    await promise;

    // Context should be cleaned up after operation
    const contextsAfter = RLSUtils.getActiveContexts().size;
    expect(contextsAfter).toBe(contextsBefore);
  });
});
```

### **5. Migration Integration**

#### **Using withRLS for data migration**

```typescript
import { withSystemRLS } from "../lib/prisma/withRLS";

export class MigrationService {
  /**
   * Migrate data with proper RLS context
   */
  static async migrateTenantData(fromTenantId: string, toTenantId: string) {
    return withSystemRLS(async (tx) => {
      // First, get data from source tenant
      const sourceData = await tx.project.findMany({
        where: { tenantId: fromTenantId },
        include: { assignments: true },
      });

      // Create new records in target tenant
      const migratedProjects = [];

      for (const project of sourceData) {
        const newProject = await tx.project.create({
          data: {
            ...project,
            id: undefined, // Let DB generate new ID
            tenantId: toTenantId,
            migratedFrom: project.id,
            migratedAt: new Date(),
          },
        });

        migratedProjects.push(newProject);
      }

      return {
        migratedCount: migratedProjects.length,
        sourceCount: sourceData.length,
        projects: migratedProjects,
      };
    }, `migration_${fromTenantId}_to_${toTenantId}`);
  }
}
```

---

## 🎯 **Key Benefits Realized**

1. **🔒 Security**: Automatic tenant isolation at database level
2. **🧹 Clean Code**: No more scattered `SET request.jwt.claims` calls
3. **🧪 Testability**: Easy to test with different tenant contexts
4. **📊 Monitoring**: Built-in context tracking and logging
5. **🛡️ Error Handling**: Proper cleanup and error reporting
6. **⚡ Performance**: Transaction-scoped context for efficiency

This implementation is **production-ready** and follows enterprise best practices for multi-tenant SaaS applications.
