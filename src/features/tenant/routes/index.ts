import { Router } from "express";
import featureFlagsRoutes from "@/features/tenant/routes/feature-flags.routes";
import settingsRoutes from "@/features/tenant/routes/settings.routes";
import metricsRoutes from "@/features/tenant/routes/metrics.routes";
import usageRoutes from "@/features/tenant/routes/usage.routes";
import numberingRoutes from "@/features/tenant/routes/numbering.routes";
import auditRoutes from "@/features/tenant/routes/audit.routes";
import documentsRoutes from "@/features/tenant/routes/documents.routes";
import templatesRoutes from "@/features/tenant/routes/templates.routes";
import eventsRoutes from "@/features/tenant/routes/events.routes";
import lifecycleRoutes from "@/features/tenant/routes/lifecycle.routes";
import tenantRoutes from "@/features/tenant/routes/tenant.routes";

const tenantRouter = Router();

// Mount sub-routers under /api/tenant
tenantRouter.use("/", tenantRoutes); // Tenant profile operations (admin)
tenantRouter.use("/feature-flags", featureFlagsRoutes);
tenantRouter.use("/settings", settingsRoutes);
tenantRouter.use("/metrics", metricsRoutes);
tenantRouter.use("/usage", usageRoutes);
tenantRouter.use("/number-sequences", numberingRoutes);
tenantRouter.use("/audit", auditRoutes);
tenantRouter.use("/document-groups", documentsRoutes);
tenantRouter.use("/templates", templatesRoutes);
tenantRouter.use("/events", eventsRoutes);
tenantRouter.use("/lifecycle", lifecycleRoutes);

export default tenantRouter;
