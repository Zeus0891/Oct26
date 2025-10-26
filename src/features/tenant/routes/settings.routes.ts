import { Router } from "express";
import { securityStack } from "@/middlewares";
import { PERMISSIONS } from "@/rbac/permissions";
import { tenantSettingsController as controller } from "@/features/tenant/controllers/settings.controller";

const router = Router();

// Base: /api/tenant/settings
router.get(
  "/",
  ...(securityStack(PERMISSIONS.TENANTSETTINGS_READ) as any),
  controller.get.bind(controller) as any
);

router.put(
  "/",
  ...(securityStack(PERMISSIONS.TENANTSETTINGS_UPDATE) as any),
  controller.update.bind(controller) as any
);

router.post(
  "/activate",
  ...(securityStack(PERMISSIONS.TENANTSETTINGS_ACTIVATE) as any),
  controller.activate.bind(controller) as any
);

router.post(
  "/deactivate",
  ...(securityStack(PERMISSIONS.TENANTSETTINGS_DEACTIVATE) as any),
  controller.deactivate.bind(controller) as any
);

export default router;
