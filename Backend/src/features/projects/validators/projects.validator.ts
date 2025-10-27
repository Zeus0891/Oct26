import { z } from "zod";
import { ProjectStatus } from "@prisma/client";
import type { CreateProjectDTO, UpdateProjectDTO, ProjectListFilter } from "../../../shared/types";

// Zod schemas (source of truth)
export const createProjectSchema = z
  .object({
    name: z.string().min(1).max(200),
    documentGroupId: z.string().uuid(),
    externalNumber: z.string().min(1).max(64),
    description: z.string().max(1000).optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    accountId: z.string().uuid().optional(),
    locationId: z.string().uuid().optional(),
  })
  .refine(
    (v) => {
      if (v.startDate && v.endDate) {
        return v.startDate <= v.endDate;
      }
      return true;
    },
    { message: "startDate must be before or equal to endDate", path: ["endDate"] }
  );

export const updateProjectSchema = createProjectSchema.partial();

export const listProjectsSchema = z.object({
  status: z.union([z.nativeEnum(ProjectStatus), z.array(z.nativeEnum(ProjectStatus))]).optional(),
  q: z.string().max(200).optional(),
  accountId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

// Inferred types (used across controllers/services)
export type CreateProjectInput = z.infer<typeof createProjectSchema> & CreateProjectDTO;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema> & UpdateProjectDTO;
export type ListProjectsInput = z.infer<typeof listProjectsSchema> & ProjectListFilter;

// Back-compat shim for existing controller usage (can be removed after refactor)
export function validateCreateProject(body: unknown): { valid: boolean; message?: string } {
  const result = createProjectSchema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    return { valid: false, message: first?.message || "Validation failed" };
  }
  return { valid: true };
}
