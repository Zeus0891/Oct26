import { z } from "zod";
import { ProjectChildStatus } from "@prisma/client";
import type { CreateProjectTaskDTO, UpdateProjectTaskDTO, ProjectTaskListFilter } from "../../../shared/types";

export const createProjectTaskSchema = z.object({
  name: z.string().min(1).max(200),
  projectId: z.string().uuid(),
  description: z.string().max(2000).optional(),
  dueDate: z.coerce.date().optional(),
  phaseId: z.string().uuid().optional(),
  wbsItemId: z.string().uuid().optional(),
  status: z.nativeEnum(ProjectChildStatus).optional(),
  priority: z.coerce.number().int().min(0).max(100).optional(),
});

export const updateProjectTaskSchema = createProjectTaskSchema.partial();

export const listProjectTasksSchema = z.object({
  projectId: z.string().uuid().optional(),
  status: z.union([z.nativeEnum(ProjectChildStatus), z.array(z.nativeEnum(ProjectChildStatus))]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

export type CreateProjectTaskInput = z.infer<typeof createProjectTaskSchema> & CreateProjectTaskDTO;
export type UpdateProjectTaskInput = z.infer<typeof updateProjectTaskSchema> & UpdateProjectTaskDTO;
export type ListProjectTasksInput = z.infer<typeof listProjectTasksSchema> & ProjectTaskListFilter;

export function validateCreateProjectTask(body: unknown): { valid: boolean; message?: string } {
  const result = createProjectTaskSchema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    return { valid: false, message: first?.message || "Validation failed" };
  }
  return { valid: true };
}
