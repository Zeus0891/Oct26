import { Router } from "express";
import { securityStack } from "@/middlewares";
import { PERMISSIONS } from "@/rbac/permissions";
import { tenantMetricsController as controller } from "@/features/tenant/controllers/metrics.controller";

const router = Router();

// Base: /api/tenant/metrics
router.get(
  "/",
  ...(securityStack(PERMISSIONS.TENANTMETRICS_READ) as any),
  controller.list.bind(controller) as any
);

router.get(
  "/export",
  ...(securityStack(PERMISSIONS.TENANTMETRICS_EXPORT) as any),
  controller.export.bind(controller) as any
);

export default router;
