# Lib (RLS and compatibility layer)

Last updated: 2025-10-23

This folder provides two things:

- Enterprise RLS engine used across modules for PostgreSQL Row‑Level Security
- A thin compatibility layer to the new core Prisma infrastructure during migration

Back to Architecture Index → ../../docs/architecture/README.md

## Contents

```
src/lib/
├─ index.ts              # Modernized export hub (aligns to core)
├─ prismaClient.ts       # Legacy compatibility to core Prisma (deprecated)
└─ prisma/
   ├─ withRLS.ts         # Enterprise RLS engine (authoritative)
   └─ withRLS-examples.md# Usage patterns and best practices
```

## When to use what

- Use withRLS/withTenantRLS/withSystemRLS for any DB operation that must be tenant‑isolated.
- For Prisma client access, import from core: `src/core/config/prisma.config.ts`.
- Only use prismaClient.ts where migration isn’t complete yet; new code shouldn’t import it.

## RLS engine overview (withRLS.ts)

Contract

- Input: RLSContext { tenantId: string; userId?: string; roles: string[]; correlationId?: string }
- Call: withRLS(context, async (tx) => { /_ prisma tx _/ }, options?)
- Output: { data, context, executionTime }
- Errors: RLSValidationError for bad context; RLSOperationError wraps underlying DB errors

Security and behavior

- Sets request.jwt.claims on the PostgreSQL session for RLS policies to enforce tenant isolation
- Validates UUIDs and known role set; rejects unknown roles by default
- Works inside a prisma.$transaction with configurable timeout and optional logging/metrics

Examples

```ts
import { withTenantRLS } from "../lib/prisma/withRLS";

export async function createProject(user, data) {
  return withTenantRLS(
    user.tenantId,
    user.roles,
    async (tx) => {
      return tx.project.create({ data: { ...data, tenantId: user.tenantId } });
    },
    user.id
  );
}
```

Useful utilities

- RLSUtils.getActiveContexts(), RLSUtils.getCurrentClaims(), RLSUtils.testRLSContext(ctx)

## Prisma access (core‑aligned)

Prefer importing from core:

```ts
import {
  prisma,
  initializePrisma,
  checkDatabaseHealth,
  withRLSContext,
} from "@/core/config/prisma.config";
```

Legacy shim (avoid for new code):

```ts
import { prisma as legacyPrisma } from "@/lib/prismaClient"; // deprecated
```

## Migration guide

Replace legacy imports

- From: `import { prisma } from "@/lib/prismaClient"`
- To: `import { prisma } from "@/core/config/prisma.config"`

Replace helper names

- From: `ensurePrismaConnection()` → `initializePrisma()`
- From: `withRLS(...)` (from lib/prismaClient) → `withRLSContext(...)` (core) or keep `withRLS` from lib/prisma/withRLS for explicit RLS session claims

Health endpoints

- Use `checkDatabaseHealth()` from core and compose JSON inline

Removal timeline

- prismaClient.ts is slated for removal after all services migrate (target: Q2 2026)

## Error handling patterns

- Wrap service calls with try/catch and surface sanitized messages; include correlationId in logs
- RLSOperationError: include context for diagnostics; do not log sensitive data
- For transient DB errors, rely on core retry (`connectWithRetry`) or rethrow for caller retry policies

## Cross‑references

- Core Prisma and health: ../../core/config/prisma.config.ts
- Core README: ../../core/README.md
- Canonical model ownership: ../../docs/architecture/ERP_MODULE_STRUCTURE.md
- Enums reference: ../../docs/architecture/ERP_ENUMS_REFERENCE.md

Back to Architecture Index → ../../docs/architecture/README.md
