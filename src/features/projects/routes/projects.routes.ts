import { Router } from "express";
import { PERMISSIONS } from "../../../rbac/permissions";
import { MiddlewareChains } from "../../../shared/routes/middleware-chain.builder";
import { ProjectsController } from "../controllers/projects.controller";

const router = Router();

router.get("/", ...MiddlewareChains.protected(PERMISSIONS.PROJECT_READ), ProjectsController.list);
router.get("/:id", ...MiddlewareChains.protected(PERMISSIONS.PROJECT_READ), ProjectsController.get);
router.post("/", ...MiddlewareChains.protected(PERMISSIONS.PROJECT_CREATE), ProjectsController.create);
router.patch("/:id", ...MiddlewareChains.protected(PERMISSIONS.PROJECT_UPDATE), ProjectsController.update);
router.delete("/:id", ...MiddlewareChains.protected(PERMISSIONS.PROJECT_SOFT_DELETE), ProjectsController.remove);

export default router;
