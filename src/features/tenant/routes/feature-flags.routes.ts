import { Router } from "express";
import { securityStack } from "@/middlewares";
import { PERMISSIONS } from "@/rbac/permissions";
import { tenantFeatureFlagsController as controller } from "@/features/tenant/controllers/feature-flags.controller";
// (no route base import needed here; mounting handled by feature index)

const router = Router();

// Base: /api/tenant/feature-flags
// List
router.get(
  "/",
  ...(securityStack(PERMISSIONS.TENANTFEATUREFLAG_READ) as any),
  controller.list.bind(controller) as any
);

// Create
router.post(
  "/",
  ...(securityStack(PERMISSIONS.TENANTFEATUREFLAG_CREATE) as any),
  controller.create.bind(controller) as any
);

// Read by ID
router.get(
  "/:id",
  ...(securityStack(PERMISSIONS.TENANTFEATUREFLAG_READ) as any),
  controller.getById.bind(controller) as any
);

// Update by ID
router.patch(
  "/:id",
  ...(securityStack(PERMISSIONS.TENANTFEATUREFLAG_UPDATE) as any),
  controller.update.bind(controller) as any
);

// Activate
router.post(
  "/:id/activate",
  ...(securityStack(PERMISSIONS.TENANTFEATUREFLAG_ACTIVATE) as any),
  controller.activate.bind(controller) as any
);

// Deactivate
router.post(
  "/:id/deactivate",
  ...(securityStack(PERMISSIONS.TENANTFEATUREFLAG_DEACTIVATE) as any),
  controller.deactivate.bind(controller) as any
);

export default router;
