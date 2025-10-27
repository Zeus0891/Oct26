import { Router } from "express";
import { PERMISSIONS } from "../../../rbac/permissions";
import { MiddlewareChains } from "../../../shared/routes/middleware-chain.builder";
import { ProjectTasksController } from "../controllers/project-tasks.controller";

const router = Router();

router.get("/", ...MiddlewareChains.protected(PERMISSIONS.PROJECTTASK_READ), ProjectTasksController.list);
router.get("/:id", ...MiddlewareChains.protected(PERMISSIONS.PROJECTTASK_READ), ProjectTasksController.get);
router.post("/", ...MiddlewareChains.protected(PERMISSIONS.PROJECTTASK_CREATE), ProjectTasksController.create);
router.patch("/:id", ...MiddlewareChains.protected(PERMISSIONS.PROJECTTASK_UPDATE), ProjectTasksController.update);
router.delete("/:id", ...MiddlewareChains.protected(PERMISSIONS.PROJECTTASK_SOFT_DELETE), ProjectTasksController.remove);

export default router;
