import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../../middlewares/types";
import { ProjectsService } from "../services/projects.service";
import {
    createProjectSchema,
    listProjectsSchema,
    updateProjectSchema,
} from "../validators/projects.validator";

function getCtx(req: AuthenticatedRequest) {
  const tenantId = req.tenant?.id as string;
  const userId = req.user?.id as string | undefined;
  const roles = (req.user?.roles || []) as string[];
  return { tenantId, userId, roles };
}

export const ProjectsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = getCtx(req as AuthenticatedRequest);
      const query = listProjectsSchema.parse(req.query || {});
      const items = await ProjectsService.list(ctx, query);
      return res.json({ success: true, data: items });
    } catch (err) {
      return next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = getCtx(req as AuthenticatedRequest);
      const { id } = req.params;
      const item = await ProjectsService.getById(ctx, id);
      if (!item) return res.status(404).json({ success: false, error: "NOT_FOUND" });
      return res.json({ success: true, data: item });
    } catch (err) {
      return next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = getCtx(req as AuthenticatedRequest);
      const body = createProjectSchema.parse(req.body || {});
      const created = await ProjectsService.create(ctx, body);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      return next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = getCtx(req as AuthenticatedRequest);
      const { id } = req.params;
      const body = updateProjectSchema.parse(req.body || {});
      const updated = await ProjectsService.update(ctx, id, body);
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
      const deleted = await ProjectsService.softDelete(ctx, id);
      return res.json({ success: true, data: deleted });
    } catch (err: any) {
      if (err?.code === "P2025") {
        return res.status(404).json({ success: false, error: "NOT_FOUND" });
      }
      return next(err);
    }
  },
};
