import { Router } from "express";
import { adminStack } from "@/middlewares";
import { tenantEventsController as controller } from "@/features/tenant/controllers/events.controller";

const router = Router();

// Base: /api/tenant/events (read-only event sourcing queries, admin/read role)
// List events
router.get(
  "/",
  ...(adminStack() as any),
  controller.listEvents.bind(controller) as any
);

// List projections
router.get(
  "/projections",
  ...(adminStack() as any),
  controller.listProjections.bind(controller) as any
);

// List snapshots
router.get(
  "/snapshots",
  ...(adminStack() as any),
  controller.listSnapshots.bind(controller) as any
);

export default router;
