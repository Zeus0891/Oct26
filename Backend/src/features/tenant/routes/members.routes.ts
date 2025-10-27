import { tenantMembersController as controller } from "@/features/tenant/controllers/members.controller";
import { securityStack } from "@/middlewares";
import { PERMISSIONS } from "@/rbac/permissions";
import { Router } from "express";

const router = Router();

// Base: /api/tenant/members
router.get(
  "/",
  ...(securityStack(PERMISSIONS.MEMBER_READ) as any),
  controller.list.bind(controller) as any
);

router.post(
  "/",
  ...(securityStack(PERMISSIONS.MEMBER_CREATE) as any),
  controller.create.bind(controller) as any
);

router.get(
  "/:id",
  ...(securityStack(PERMISSIONS.MEMBER_READ) as any),
  controller.getById.bind(controller) as any
);

router.post(
  "/:id/roles",
  ...(securityStack(PERMISSIONS.MEMBERROLE_ASSIGN) as any),
  controller.assignRole.bind(controller) as any
);

router.delete(
  "/:id/roles/:roleId",
  ...(securityStack(PERMISSIONS.MEMBERROLE_UNASSIGN) as any),
  controller.removeRole.bind(controller) as any
);

router.post(
  "/:id/activate",
  ...(securityStack(PERMISSIONS.MEMBER_ACTIVATE) as any),
  controller.activate.bind(controller) as any
);

router.post(
  "/:id/deactivate",
  ...(securityStack(PERMISSIONS.MEMBER_DEACTIVATE) as any),
  controller.deactivate.bind(controller) as any
);

export default router;
