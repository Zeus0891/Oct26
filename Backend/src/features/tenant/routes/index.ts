import auditRoutes from "@/features/tenant/routes/audit.routes";
import documentsRoutes from "@/features/tenant/routes/documents.routes";
import eventsRoutes from "@/features/tenant/routes/events.routes";
import featureFlagsRoutes from "@/features/tenant/routes/feature-flags.routes";
import lifecycleRoutes from "@/features/tenant/routes/lifecycle.routes";
import membersRoutes from "@/features/tenant/routes/members.routes";
import metricsRoutes from "@/features/tenant/routes/metrics.routes";
import numberingRoutes from "@/features/tenant/routes/numbering.routes";
import settingsRoutes from "@/features/tenant/routes/settings.routes";
import templatesRoutes from "@/features/tenant/routes/templates.routes";
import tenantRoutes from "@/features/tenant/routes/tenant.routes";
import usageRoutes from "@/features/tenant/routes/usage.routes";
import { Router } from "express";

const tenantRouter = Router();

// Mount sub-routers under /api/tenant
// IMPORTANT: Mount specific paths BEFORE the catch-all tenant routes to avoid shadowing (e.g., "/:id")
tenantRouter.use("/members", membersRoutes);
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
// Keep base tenant routes last (contains generic patterns like "/:id")
tenantRouter.use("/", tenantRoutes); // Tenant profile operations (admin)

export default tenantRouter;
