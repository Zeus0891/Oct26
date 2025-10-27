import { Router } from "express";
import { PERMISSIONS } from "../../../rbac/permissions";
import { MiddlewareChains } from "../../../shared/routes/middleware-chain.builder";
import { ProjectMembersController } from "../controllers/project-members.controller";

const router = Router();

router.get("/", ...MiddlewareChains.protected(PERMISSIONS.PROJECTMEMBER_READ), ProjectMembersController.list);
router.get("/:id", ...MiddlewareChains.protected(PERMISSIONS.PROJECTMEMBER_READ), ProjectMembersController.get);
router.post("/", ...MiddlewareChains.protected(PERMISSIONS.PROJECTMEMBER_CREATE), ProjectMembersController.create);
router.patch("/:id", ...MiddlewareChains.protected(PERMISSIONS.PROJECTMEMBER_UPDATE), ProjectMembersController.update);
router.delete("/:id", ...MiddlewareChains.protected(PERMISSIONS.PROJECTMEMBER_SOFT_DELETE), ProjectMembersController.remove);

export default router;
