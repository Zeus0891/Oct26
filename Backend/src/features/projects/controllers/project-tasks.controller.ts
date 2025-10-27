import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../../middlewares/types";
import { ProjectTasksService } from "../services/project-tasks.service";
import {
    createProjectTaskSchema,
    listProjectTasksSchema,
    updateProjectTaskSchema,
} from "../validators/project-tasks.validator";

function getCtx(req: AuthenticatedRequest) {
  const tenantId = req.tenant?.id as string;
  const userId = req.user?.id as string | undefined;
  const roles = (req.user?.roles || []) as string[];
  return { tenantId, userId, roles };
}

export const ProjectTasksController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = getCtx(req as AuthenticatedRequest);
      const query = listProjectTasksSchema.parse(req.query || {});
      const items = await ProjectTasksService.list(ctx, query);
      return res.json({ success: true, data: items });
    } catch (err) {
      return next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = getCtx(req as AuthenticatedRequest);
      const { id } = req.params;
      const item = await ProjectTasksService.getById(ctx, id);
      if (!item) return res.status(404).json({ success: false, error: "NOT_FOUND" });
      return res.json({ success: true, data: item });
    } catch (err) {
      return next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = getCtx(req as AuthenticatedRequest);
      const body = createProjectTaskSchema.parse(req.body || {});
      const created = await ProjectTasksService.create(ctx, body);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      return next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = getCtx(req as AuthenticatedRequest);
      const { id } = req.params;
      const body = updateProjectTaskSchema.parse(req.body || {});
      const updated = await ProjectTasksService.update(ctx, id, body);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      if (err?.code === "P2025") {
        return res.status(404).json({ success: false, error: "NOT_FOUND" });
      }
      return next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = getCtx(req as AuthenticatedRequest);
      const { id } = req.params;
      const deleted = await ProjectTasksService.softDelete(ctx, id);
      return res.json({ success: true, data: deleted });
    } catch (err: any) {
      if (err?.code === "P2025") {
        return res.status(404).json({ success: false, error: "NOT_FOUND" });
      }
      return next(err);
    }
  },
};
