/**
 * Project Workflow Types (DTOs)
 *
 * Enterprise-grade request DTOs and filters for Projects domain.
 * These types define the API contract for create/update operations and
 * common list filters, without duplicating Prisma models.
 */

import type { ProjectChildStatus, ProjectStatus } from "@prisma/client";

// ==========================
// Project DTOs and Filters
// ==========================

export interface CreateProjectDTO {
  name: string;
  documentGroupId: string;
  externalNumber: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string | Date;
  endDate?: string | Date;
  accountId?: string;
  locationId?: string;
}

export type UpdateProjectDTO = Partial<CreateProjectDTO>;

export interface ProjectListFilter {
  status?: ProjectStatus | ProjectStatus[];
  q?: string; // free-text search on name/number
  accountId?: string;
  locationId?: string;
}

// ==========================
// Project Task DTOs & Filters
// ==========================

export interface CreateProjectTaskDTO {
  name: string;
  projectId: string;
  description?: string;
  dueDate?: string | Date;
  phaseId?: string;
  wbsItemId?: string;
  status?: ProjectChildStatus;
  priority?: number; // domain-specific; keep numeric to avoid enum proliferation
}

export type UpdateProjectTaskDTO = Partial<Omit<CreateProjectTaskDTO, "projectId">>;

export interface ProjectTaskListFilter {
  projectId?: string;
  status?: ProjectChildStatus | ProjectChildStatus[];
}

// ==========================
// Project Member DTOs & Filters
// ==========================

export interface CreateProjectMemberDTO {
  projectId: string;
  memberId: string;
  role: string; // project-specific role label
}

export interface UpdateProjectMemberDTO {
  role?: string;
}

export interface ProjectMemberListFilter {
  projectId?: string;
  memberId?: string;
  role?: string;
}
