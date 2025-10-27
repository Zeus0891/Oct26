import { Router } from "express";
import { adminStack } from "@/middlewares";
import { tenantLifecycleController as controller } from "@/features/tenant/controllers/lifecycle.controller";

const router = Router();

// Base: /api/tenant/lifecycle (admin-only tenant provisioning and deactivation)
// Provision a new tenant
router.post(
  "/provision",
  ...(adminStack() as any),
  controller.provision.bind(controller) as any
);

// Deactivate a tenant
router.post(
  "/:id/deactivate",
  ...(adminStack() as any),
  controller.deactivate.bind(controller) as any
);

export default router;
