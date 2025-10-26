import { Router } from "express";
import { adminStack, securityStack } from "@/middlewares";
import { PERMISSIONS } from "@/rbac/permissions";
import { tenantController as controller } from "@/features/tenant/controllers/tenant.controller";

const router = Router();

// Base: /api/tenant (global tenant profile operations, admin-only)
// Current tenant context
router.get(
  "/me",
  ...(securityStack(PERMISSIONS.TENANT_READ) as any),
  controller.getMe.bind(controller) as any
);

// Get tenant profile by ID
router.get(
  "/:id",
  ...(adminStack() as any),
  controller.getById.bind(controller) as any
);

// Update tenant profile (limited fields)
router.patch(
  "/:id",
  ...(adminStack() as any),
  controller.update.bind(controller) as any
);

// Deactivate tenant
router.post(
  "/:id/deactivate",
  ...(adminStack() as any),
  controller.deactivate.bind(controller) as any
);

export default router;
