import { Router } from "express";
import { securityStack } from "@/middlewares";
import { PERMISSIONS } from "@/rbac/permissions";
import {
  termsTemplatesController,
  contractTemplatesController,
} from "@/features/tenant/controllers/templates.controller";

const router = Router();

// Base: /api/tenant/templates

// TermsTemplate routes under /terms
const termsRouter = Router();
termsRouter.get(
  "/",
  ...(securityStack(PERMISSIONS.TERMSTEMPLATE_READ) as any),
  termsTemplatesController.list.bind(termsTemplatesController) as any
);
termsRouter.post(
  "/",
  ...(securityStack(PERMISSIONS.TERMSTEMPLATE_CREATE) as any),
  termsTemplatesController.create.bind(termsTemplatesController) as any
);
termsRouter.get(
  "/:id",
  ...(securityStack(PERMISSIONS.TERMSTEMPLATE_READ) as any),
  termsTemplatesController.getById.bind(termsTemplatesController) as any
);
termsRouter.patch(
  "/:id",
  ...(securityStack(PERMISSIONS.TERMSTEMPLATE_UPDATE) as any),
  termsTemplatesController.update.bind(termsTemplatesController) as any
);
termsRouter.delete(
  "/:id",
  ...(securityStack(PERMISSIONS.TERMSTEMPLATE_SOFT_DELETE) as any),
  termsTemplatesController.remove.bind(termsTemplatesController) as any
);
termsRouter.post(
  "/:id/restore",
  ...(securityStack(PERMISSIONS.TERMSTEMPLATE_RESTORE) as any),
  termsTemplatesController.restore.bind(termsTemplatesController) as any
);

// ContractTemplate routes under /contracts
const contractsRouter = Router();
contractsRouter.get(
  "/",
  ...(securityStack(PERMISSIONS.CONTRACTTEMPLATE_READ) as any),
  contractTemplatesController.list.bind(contractTemplatesController) as any
);
contractsRouter.post(
  "/",
  ...(securityStack(PERMISSIONS.CONTRACTTEMPLATE_CREATE) as any),
  contractTemplatesController.create.bind(contractTemplatesController) as any
);
contractsRouter.get(
  "/:id",
  ...(securityStack(PERMISSIONS.CONTRACTTEMPLATE_READ) as any),
  contractTemplatesController.getById.bind(contractTemplatesController) as any
);
contractsRouter.patch(
  "/:id",
  ...(securityStack(PERMISSIONS.CONTRACTTEMPLATE_UPDATE) as any),
  contractTemplatesController.update.bind(contractTemplatesController) as any
);
contractsRouter.delete(
  "/:id",
  ...(securityStack(PERMISSIONS.CONTRACTTEMPLATE_SOFT_DELETE) as any),
  contractTemplatesController.remove.bind(contractTemplatesController) as any
);
contractsRouter.post(
  "/:id/restore",
  ...(securityStack(PERMISSIONS.CONTRACTTEMPLATE_RESTORE) as any),
  contractTemplatesController.restore.bind(contractTemplatesController) as any
);

router.use("/terms", termsRouter);
router.use("/contracts", contractsRouter);

export default router;
