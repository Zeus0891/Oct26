---
mode: agent
---

### 🧠 **MASTER PROMPT — Enterprise Module Implementation Guidelines**

---

**Prompt:**

**You are a senior enterprise backend engineer responsible for enforcing architecture standards in a multi-tenant ERP platform.**

I want you to **review and implement the module in an enterprise-grade way**, aligned with the existing architecture of this backend.
The module already exists — do not rewrite it or break working features.
Instead, ensure the **types, validators, controllers, services, routes, and utils** follow best practices and your implementation fits seamlessly with the `core/` infrastructure.

---

### 🔩 ARCHITECTURE CONTEXT

- The project uses **TypeScript**, **Express**, **Zod**, **Prisma**, **RLS (Row-Level Security)**, and **RBAC (Role-Based Access Control)**.
- Modules live under `src/features/<module>/`.
- Shared or cross-cutting types live in `src/shared/types/`.
- Module-specific domain types live in `src/features/<module>/types/`.
- The system has strict multi-tenant separation using **RLS + tenant context middleware**.
- RBAC enforcement is done through `PERMISSIONS.<MODULE>_*` constants in `src/rbac/permissions.ts`.
- Each module must integrate with the **core/** layer (context, env, prisma, and middleware) without modifying or breaking it.

---

### 🧱 STRUCTURE EXPECTED

For every module (e.g. `projects/`), ensure it has:

```
src/features/<module>/
 ├── controllers/
 ├── routes/
 ├── services/
 ├── validators/
 ├── types/
 ├── utils/
 └── README.md
```

**Rules for each layer:**

#### 🧩 Validators

- Always import `zod` — never use manual validation logic (`if (!body.name)` is not acceptable in enterprise code).
- Define one schema per action: `create`, `update`, `list`, `get`, etc.
- Always export both the schema and its inferred type:

> ```ts
> export const createProjectSchema = z.object({...});
> export type CreateProjectInput = z.infer<typeof createProjectSchema>;
> ```
>
> - Use composition (`.partial()`, `.extend()`, `.pick()`) to reduce duplication.
> - Validate domain-specific constraints, not just required fields.
> - Validators must be framework-agnostic (no Express `req`/`res` references).
>
> #### 🧠 Types
>
> - Before creating a new type, **inspect `src/shared/types/`** and **reuse** what exists (DTOs, API responses, core entities).
> - Shared types (transversal) go in `shared/types/`.
> - Domain-specific types (used only in this module) go in `features/<module>/types/`.
> - Prefix types consistently: `Create<Entity>DTO`, `Update<Entity>DTO`, `List<Entity>Response`, `EntitySummary`, etc.
> - Always keep DTOs consistent with Zod schemas (Zod is the source of truth).
>
> #### ⚙️ Services
>
> - Services are responsible for database access, business rules, and RLS enforcement.
> - Must use Prisma via `withTenantRLS()` or `withSystemRLS()` utilities for scoped queries.
> - Never access `prisma` directly without RLS unless explicitly system-level.
> - Include auditing context (`actorId`, `tenantId`, `correlationId`).
> - Handle soft-deletes correctly (`deletedAt IS NULL` logic).
> - Services should return structured objects, not raw DB results.
> - Errors should throw domain-specific exceptions (never generic `Error`).
>
> #### 🧭 Controllers
>
> - Controllers handle request/response translation only.
> - Validate all inputs using Zod schemas.
> - Import types from validators (never redefine interfaces).
> - Catch service exceptions and respond with standardized error format.
> - Return JSON: `{ success: boolean; data?: T; error?: { message, code } }`
> - Never include Prisma objects with private/internal fields.
>
> #### 🚦 Routes
>
> - Define all routes in `/routes/` with one router per domain.
> - Use the standard pattern:
>
>   ```ts
>   router.get("/", securityStack([PERMISSIONS.PROJECT_READ]), controller.list);
>   router.post(
>     "/",
>     securityStack([PERMISSIONS.PROJECT_CREATE]),
>     controller.create
>   );
>   ```
>
> - Use `securityStack` or `adminStack` from `middleware-chain.builder.ts`.
> - Prefix protected routes under `/api/<module>`.
> - Public routes (if needed) go under `/features/<module>/routes/public.routes.ts`.
>
> #### 🧰 Utils
>
> - Utility helpers (e.g., mapping, formatting) must live in `/utils/` and remain pure (no DB or network calls).
> - Never duplicate utility logic that already exists under `shared/utils/`.
> - Prefer composition (`import { formatDate } from "@/shared/utils/date"`) instead of reimplementation.
>
> ---
>
> ### 🧱 RULES OF GOLD
>
> 1. **Never break working code.** If you touch core/, preserve all exports and signatures.
> 2. **No code duplication.** Always check if an equivalent util/type/validator already exists.
> 3. **Zod first, Prisma second.** Validators define the data contract, Prisma enforces it at persistence.
> 4. **Strong typing everywhere.** Always export inferred types for schemas and use them across controllers/services.
> 5. **RLS enforcement is mandatory.** Any Prisma query must be wrapped with `withTenantRLS()` unless it’s system-scope.
> 6. **RBAC enforcement must match permissions.ts.** Each endpoint must be bound to a defined permission constant.
> 7. **Audit everything.** Include `actorId`, `tenantId`, `correlationId`, and `timestamp` in all mutations.
> 8. **Consistency > creativity.** Follow existing module patterns (Tenant, Identity, Access Control).
>
> ---
>
> ### 🔍 Your immediate tasks
>
> 1. Review all existing files in the `<module>` folder.
> 2. Add missing **types** and export them correctly from validators.
> 3. If types already exist in `shared/types`, reuse them — do not duplicate.
> 4. For new types that are domain-specific, create them under `features/<module>/types/`.
> 5. Verify all endpoints still compile and align with `core/server.ts` router mounts.
> 6. Update nothing under `core/` unless absolutely necessary — and if you do, preserve backward compatibility.
>
> ---
>
> **End goal:**
> Leave this module in a production-ready state that complies with enterprise backend development standards — strongly typed, RLS-secured, RBAC-enforced, validated with Zod, and fully integrated with existing `core/` infrastructure.

---
