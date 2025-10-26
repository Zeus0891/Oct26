import { Router } from "express";
import { securityStack } from "@/middlewares";
import { PERMISSIONS } from "@/rbac/permissions";
import { tenantAuditController as controller } from "@/features/tenant/controllers/audit.controller";

const router = Router();

// Base: /api/tenant/audit
router.get(
  "/",
  ...(securityStack(PERMISSIONS.TENANTAUDITLOG_READ) as any),
  controller.list.bind(controller) as any
);

router.get(
  "/export",
  ...(securityStack(PERMISSIONS.TENANTAUDITLOG_EXPORT) as any),
  controller.export.bind(controller) as any
);

export default router;
