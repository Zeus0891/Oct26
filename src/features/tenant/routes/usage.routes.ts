import { Router } from "express";
import { securityStack } from "@/middlewares";
import { PERMISSIONS } from "@/rbac/permissions";
import { tenantUsageController as controller } from "@/features/tenant/controllers/usage.controller";

const router = Router();

// Base: /api/tenant/usage
router.get(
  "/",
  ...(securityStack(PERMISSIONS.TENANTUSAGERECORD_READ) as any),
  controller.list.bind(controller) as any
);

router.get(
  "/export",
  ...(securityStack(PERMISSIONS.TENANTUSAGERECORD_EXPORT) as any),
  controller.export.bind(controller) as any
);

export default router;
