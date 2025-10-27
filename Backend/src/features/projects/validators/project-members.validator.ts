import { z } from "zod";
import type { CreateProjectMemberDTO, UpdateProjectMemberDTO, ProjectMemberListFilter } from "../../../shared/types";

export const createProjectMemberSchema = z.object({
  projectId: z.string().uuid(),
  memberId: z.string().uuid(),
  role: z.string().min(1).max(100),
});

export const updateProjectMemberSchema = z.object({ role: z.string().min(1).max(100) });

export const listProjectMembersSchema = z.object({
  projectId: z.string().uuid().optional(),
  memberId: z.string().uuid().optional(),
  role: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

export type CreateProjectMemberInput = z.infer<typeof createProjectMemberSchema> & CreateProjectMemberDTO;
export type UpdateProjectMemberInput = z.infer<typeof updateProjectMemberSchema> & UpdateProjectMemberDTO;
export type ListProjectMembersInput = z.infer<typeof listProjectMembersSchema> & ProjectMemberListFilter;

export function validateCreateProjectMember(body: unknown): { valid: boolean; message?: string } {
  const result = createProjectMemberSchema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    return { valid: false, message: first?.message || "Validation failed" };
  }
  return { valid: true };
}
