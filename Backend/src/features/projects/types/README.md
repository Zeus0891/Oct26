# Projects Module Types

This folder holds module-scoped type aliases or unions specific to the Projects feature.

Guidelines:
- Prefer using shared DTOs from `src/shared/types` for request/response contracts.
- Only add local types when they are strictly module-specific and not reusable across modules.
- Keep names consistent: Create<Entity>DTO, Update<Entity>DTO, <Entity>ListFilter, <Entity>Summary.
- Zod is the source of truth — keep DTO types aligned with schemas via `z.infer<typeof schema>`.
