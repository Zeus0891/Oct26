import { Router } from "express";
import { securityStack } from "@/middlewares";
import { PERMISSIONS } from "@/rbac/permissions";
import { documentGroupsController as controller } from "@/features/tenant/controllers/documents.controller";

const router = Router();

// Base: /api/tenant/document-groups
// List document groups
router.get(
  "/",
  ...(securityStack(PERMISSIONS.DOCUMENTGROUP_READ) as any),
  controller.list.bind(controller) as any
);

// Get by id
router.get(
  "/:id",
  ...(securityStack(PERMISSIONS.DOCUMENTGROUP_READ) as any),
  controller.getById.bind(controller) as any
);

// Soft delete
router.delete(
  "/:id",
  ...(securityStack(PERMISSIONS.DOCUMENTGROUP_SOFT_DELETE) as any),
  controller.remove.bind(controller) as any
);

// Restore
router.post(
  "/:id/restore",
  ...(securityStack(PERMISSIONS.DOCUMENTGROUP_RESTORE) as any),
  controller.restore.bind(controller) as any
);

export default router;
