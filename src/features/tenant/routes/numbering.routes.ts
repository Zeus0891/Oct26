import { Router } from "express";
import { securityStack, adminStack } from "@/middlewares";
import { PERMISSIONS } from "@/rbac/permissions";
import { tenantNumberSequenceController as controller } from "@/features/tenant/controllers/numbering.controller";

const router = Router();

// Base: /api/tenant/number-sequences
router.get(
  "/",
  ...(securityStack(PERMISSIONS.NUMBERSEQUENCE_READ) as any),
  controller.list.bind(controller) as any
);

router.post(
  "/",
  ...(securityStack(PERMISSIONS.NUMBERSEQUENCE_CREATE) as any),
  controller.create.bind(controller) as any
);

router.get(
  "/:id",
  ...(securityStack(PERMISSIONS.NUMBERSEQUENCE_READ) as any),
  controller.getById.bind(controller) as any
);

router.put(
  "/:id",
  ...(securityStack(PERMISSIONS.NUMBERSEQUENCE_UPDATE) as any),
  controller.update.bind(controller) as any
);

router.delete(
  "/:id",
  ...(securityStack(PERMISSIONS.NUMBERSEQUENCE_UPDATE) as any),
  controller.remove.bind(controller) as any
);

// Critical endpoints
router.post(
  "/:id/next",
  ...(securityStack(PERMISSIONS.NUMBERSEQUENCE_UPDATE) as any),
  controller.next.bind(controller) as any
);

router.post(
  "/:id/generate",
  ...(securityStack(PERMISSIONS.NUMBERSEQUENCE_UPDATE) as any),
  controller.generate.bind(controller) as any
);

// Admin-only reset
router.post(
  "/:id/reset",
  ...(adminStack() as any),
  controller.reset.bind(controller) as any
);

export default router;
