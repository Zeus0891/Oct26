-- ============================================================================
-- Missing RLS policies for ADMIN and PROJECT_MANAGER (full access) on tables
-- identified by the integrity test as lacking policies. This migration adds
-- SELECT/INSERT/UPDATE/DELETE policies for both roles.
-- Pattern mirrors existing migrations:
--   - ADMIN: app.is_admin() + tenant isolation; USING includes deletedAt IS NULL
--            for SELECT/UPDATE when present; INSERT/DELETE omit deletedAt check
--   - PROJECT_MANAGER: app.is_project_manager() + tenant isolation; USING and
--            WITH CHECK include deletedAt IS NULL when present
-- All policies are RESTRICTIVE and target the 'authenticated' role.
-- ============================================================================

BEGIN;

-- ============================================================================
-- Helper: policy creation for a tenant-scoped, soft-delete table
-- Tables covered:
--   AccountInsurance, CommissionRule, CustomerSegment, QuoteApproval, Territory
--   RoomAnnotation, RoomExport, RoomMeasurement, RoomModel, RoomObject,
--   RoomPlanPreset, RoomProcessingJob, RoomScanFile, RoomScanSession, RoomSurface
-- ============================================================================

-- =========================
-- AccountInsurance
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_accountinsurance" ON public."AccountInsurance";
CREATE POLICY "rls_admin_select_accountinsurance"
ON public."AccountInsurance"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_accountinsurance" ON public."AccountInsurance";
CREATE POLICY "rls_admin_insert_accountinsurance"
ON public."AccountInsurance"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_accountinsurance" ON public."AccountInsurance";
CREATE POLICY "rls_admin_update_accountinsurance"
ON public."AccountInsurance"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_accountinsurance" ON public."AccountInsurance";
CREATE POLICY "rls_admin_delete_accountinsurance"
ON public."AccountInsurance"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_accountinsurance" ON public."AccountInsurance";
CREATE POLICY "rls_project_manager_select_accountinsurance"
ON public."AccountInsurance"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_accountinsurance" ON public."AccountInsurance";
CREATE POLICY "rls_project_manager_insert_accountinsurance"
ON public."AccountInsurance"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_accountinsurance" ON public."AccountInsurance";
CREATE POLICY "rls_project_manager_update_accountinsurance"
ON public."AccountInsurance"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_accountinsurance" ON public."AccountInsurance";
CREATE POLICY "rls_project_manager_delete_accountinsurance"
ON public."AccountInsurance"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- CommissionRule
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_commissionrule" ON public."CommissionRule";
CREATE POLICY "rls_admin_select_commissionrule"
ON public."CommissionRule"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_commissionrule" ON public."CommissionRule";
CREATE POLICY "rls_admin_insert_commissionrule"
ON public."CommissionRule"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_commissionrule" ON public."CommissionRule";
CREATE POLICY "rls_admin_update_commissionrule"
ON public."CommissionRule"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_commissionrule" ON public."CommissionRule";
CREATE POLICY "rls_admin_delete_commissionrule"
ON public."CommissionRule"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_commissionrule" ON public."CommissionRule";
CREATE POLICY "rls_project_manager_select_commissionrule"
ON public."CommissionRule"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_commissionrule" ON public."CommissionRule";
CREATE POLICY "rls_project_manager_insert_commissionrule"
ON public."CommissionRule"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_commissionrule" ON public."CommissionRule";
CREATE POLICY "rls_project_manager_update_commissionrule"
ON public."CommissionRule"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_commissionrule" ON public."CommissionRule";
CREATE POLICY "rls_project_manager_delete_commissionrule"
ON public."CommissionRule"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- CustomerSegment
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_customersegment" ON public."CustomerSegment";
CREATE POLICY "rls_admin_select_customersegment"
ON public."CustomerSegment"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_customersegment" ON public."CustomerSegment";
CREATE POLICY "rls_admin_insert_customersegment"
ON public."CustomerSegment"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_customersegment" ON public."CustomerSegment";
CREATE POLICY "rls_admin_update_customersegment"
ON public."CustomerSegment"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_customersegment" ON public."CustomerSegment";
CREATE POLICY "rls_admin_delete_customersegment"
ON public."CustomerSegment"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_customersegment" ON public."CustomerSegment";
CREATE POLICY "rls_project_manager_select_customersegment"
ON public."CustomerSegment"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_customersegment" ON public."CustomerSegment";
CREATE POLICY "rls_project_manager_insert_customersegment"
ON public."CustomerSegment"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_customersegment" ON public."CustomerSegment";
CREATE POLICY "rls_project_manager_update_customersegment"
ON public."CustomerSegment"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_customersegment" ON public."CustomerSegment";
CREATE POLICY "rls_project_manager_delete_customersegment"
ON public."CustomerSegment"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- QuoteApproval
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_quoteapproval" ON public."QuoteApproval";
CREATE POLICY "rls_admin_select_quoteapproval"
ON public."QuoteApproval"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_quoteapproval" ON public."QuoteApproval";
CREATE POLICY "rls_admin_insert_quoteapproval"
ON public."QuoteApproval"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_quoteapproval" ON public."QuoteApproval";
CREATE POLICY "rls_admin_update_quoteapproval"
ON public."QuoteApproval"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_quoteapproval" ON public."QuoteApproval";
CREATE POLICY "rls_admin_delete_quoteapproval"
ON public."QuoteApproval"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_quoteapproval" ON public."QuoteApproval";
CREATE POLICY "rls_project_manager_select_quoteapproval"
ON public."QuoteApproval"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_quoteapproval" ON public."QuoteApproval";
CREATE POLICY "rls_project_manager_insert_quoteapproval"
ON public."QuoteApproval"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_quoteapproval" ON public."QuoteApproval";
CREATE POLICY "rls_project_manager_update_quoteapproval"
ON public."QuoteApproval"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_quoteapproval" ON public."QuoteApproval";
CREATE POLICY "rls_project_manager_delete_quoteapproval"
ON public."QuoteApproval"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- Territory
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_territory" ON public."Territory";
CREATE POLICY "rls_admin_select_territory"
ON public."Territory"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_territory" ON public."Territory";
CREATE POLICY "rls_admin_insert_territory"
ON public."Territory"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_territory" ON public."Territory";
CREATE POLICY "rls_admin_update_territory"
ON public."Territory"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_territory" ON public."Territory";
CREATE POLICY "rls_admin_delete_territory"
ON public."Territory"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_territory" ON public."Territory";
CREATE POLICY "rls_project_manager_select_territory"
ON public."Territory"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_territory" ON public."Territory";
CREATE POLICY "rls_project_manager_insert_territory"
ON public."Territory"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_territory" ON public."Territory";
CREATE POLICY "rls_project_manager_update_territory"
ON public."Territory"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_territory" ON public."Territory";
CREATE POLICY "rls_project_manager_delete_territory"
ON public."Territory"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- RoomAnnotation
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_roomannotation" ON public."RoomAnnotation";
CREATE POLICY "rls_admin_select_roomannotation"
ON public."RoomAnnotation"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_roomannotation" ON public."RoomAnnotation";
CREATE POLICY "rls_admin_insert_roomannotation"
ON public."RoomAnnotation"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_roomannotation" ON public."RoomAnnotation";
CREATE POLICY "rls_admin_update_roomannotation"
ON public."RoomAnnotation"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_roomannotation" ON public."RoomAnnotation";
CREATE POLICY "rls_admin_delete_roomannotation"
ON public."RoomAnnotation"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_roomannotation" ON public."RoomAnnotation";
CREATE POLICY "rls_project_manager_select_roomannotation"
ON public."RoomAnnotation"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_roomannotation" ON public."RoomAnnotation";
CREATE POLICY "rls_project_manager_insert_roomannotation"
ON public."RoomAnnotation"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_roomannotation" ON public."RoomAnnotation";
CREATE POLICY "rls_project_manager_update_roomannotation"
ON public."RoomAnnotation"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_roomannotation" ON public."RoomAnnotation";
CREATE POLICY "rls_project_manager_delete_roomannotation"
ON public."RoomAnnotation"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- RoomExport
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_roomexport" ON public."RoomExport";
CREATE POLICY "rls_admin_select_roomexport"
ON public."RoomExport"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_roomexport" ON public."RoomExport";
CREATE POLICY "rls_admin_insert_roomexport"
ON public."RoomExport"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_roomexport" ON public."RoomExport";
CREATE POLICY "rls_admin_update_roomexport"
ON public."RoomExport"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_roomexport" ON public."RoomExport";
CREATE POLICY "rls_admin_delete_roomexport"
ON public."RoomExport"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_roomexport" ON public."RoomExport";
CREATE POLICY "rls_project_manager_select_roomexport"
ON public."RoomExport"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_roomexport" ON public."RoomExport";
CREATE POLICY "rls_project_manager_insert_roomexport"
ON public."RoomExport"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_roomexport" ON public."RoomExport";
CREATE POLICY "rls_project_manager_update_roomexport"
ON public."RoomExport"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_roomexport" ON public."RoomExport";
CREATE POLICY "rls_project_manager_delete_roomexport"
ON public."RoomExport"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- RoomMeasurement
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_roommeasurement" ON public."RoomMeasurement";
CREATE POLICY "rls_admin_select_roommeasurement"
ON public."RoomMeasurement"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_roommeasurement" ON public."RoomMeasurement";
CREATE POLICY "rls_admin_insert_roommeasurement"
ON public."RoomMeasurement"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_roommeasurement" ON public."RoomMeasurement";
CREATE POLICY "rls_admin_update_roommeasurement"
ON public."RoomMeasurement"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_roommeasurement" ON public."RoomMeasurement";
CREATE POLICY "rls_admin_delete_roommeasurement"
ON public."RoomMeasurement"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_roommeasurement" ON public."RoomMeasurement";
CREATE POLICY "rls_project_manager_select_roommeasurement"
ON public."RoomMeasurement"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_roommeasurement" ON public."RoomMeasurement";
CREATE POLICY "rls_project_manager_insert_roommeasurement"
ON public."RoomMeasurement"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_roommeasurement" ON public."RoomMeasurement";
CREATE POLICY "rls_project_manager_update_roommeasurement"
ON public."RoomMeasurement"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_roommeasurement" ON public."RoomMeasurement";
CREATE POLICY "rls_project_manager_delete_roommeasurement"
ON public."RoomMeasurement"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- RoomModel
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_roommodel" ON public."RoomModel";
CREATE POLICY "rls_admin_select_roommodel"
ON public."RoomModel"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_roommodel" ON public."RoomModel";
CREATE POLICY "rls_admin_insert_roommodel"
ON public."RoomModel"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_roommodel" ON public."RoomModel";
CREATE POLICY "rls_admin_update_roommodel"
ON public."RoomModel"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_roommodel" ON public."RoomModel";
CREATE POLICY "rls_admin_delete_roommodel"
ON public."RoomModel"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_roommodel" ON public."RoomModel";
CREATE POLICY "rls_project_manager_select_roommodel"
ON public."RoomModel"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_roommodel" ON public."RoomModel";
CREATE POLICY "rls_project_manager_insert_roommodel"
ON public."RoomModel"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_roommodel" ON public."RoomModel";
CREATE POLICY "rls_project_manager_update_roommodel"
ON public."RoomModel"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_roommodel" ON public."RoomModel";
CREATE POLICY "rls_project_manager_delete_roommodel"
ON public."RoomModel"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- RoomObject
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_roomobject" ON public."RoomObject";
CREATE POLICY "rls_admin_select_roomobject"
ON public."RoomObject"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_roomobject" ON public."RoomObject";
CREATE POLICY "rls_admin_insert_roomobject"
ON public."RoomObject"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_roomobject" ON public."RoomObject";
CREATE POLICY "rls_admin_update_roomobject"
ON public."RoomObject"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_roomobject" ON public."RoomObject";
CREATE POLICY "rls_admin_delete_roomobject"
ON public."RoomObject"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_roomobject" ON public."RoomObject";
CREATE POLICY "rls_project_manager_select_roomobject"
ON public."RoomObject"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_roomobject" ON public."RoomObject";
CREATE POLICY "rls_project_manager_insert_roomobject"
ON public."RoomObject"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_roomobject" ON public."RoomObject";
CREATE POLICY "rls_project_manager_update_roomobject"
ON public."RoomObject"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_roomobject" ON public."RoomObject";
CREATE POLICY "rls_project_manager_delete_roomobject"
ON public."RoomObject"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- RoomPlanPreset
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_roomplanpreset" ON public."RoomPlanPreset";
CREATE POLICY "rls_admin_select_roomplanpreset"
ON public."RoomPlanPreset"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_roomplanpreset" ON public."RoomPlanPreset";
CREATE POLICY "rls_admin_insert_roomplanpreset"
ON public."RoomPlanPreset"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_roomplanpreset" ON public."RoomPlanPreset";
CREATE POLICY "rls_admin_update_roomplanpreset"
ON public."RoomPlanPreset"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_roomplanpreset" ON public."RoomPlanPreset";
CREATE POLICY "rls_admin_delete_roomplanpreset"
ON public."RoomPlanPreset"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_roomplanpreset" ON public."RoomPlanPreset";
CREATE POLICY "rls_project_manager_select_roomplanpreset"
ON public."RoomPlanPreset"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_roomplanpreset" ON public."RoomPlanPreset";
CREATE POLICY "rls_project_manager_insert_roomplanpreset"
ON public."RoomPlanPreset"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_roomplanpreset" ON public."RoomPlanPreset";
CREATE POLICY "rls_project_manager_update_roomplanpreset"
ON public."RoomPlanPreset"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_roomplanpreset" ON public."RoomPlanPreset";
CREATE POLICY "rls_project_manager_delete_roomplanpreset"
ON public."RoomPlanPreset"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- RoomProcessingJob
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_roomprocessingjob" ON public."RoomProcessingJob";
CREATE POLICY "rls_admin_select_roomprocessingjob"
ON public."RoomProcessingJob"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_roomprocessingjob" ON public."RoomProcessingJob";
CREATE POLICY "rls_admin_insert_roomprocessingjob"
ON public."RoomProcessingJob"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_roomprocessingjob" ON public."RoomProcessingJob";
CREATE POLICY "rls_admin_update_roomprocessingjob"
ON public."RoomProcessingJob"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_roomprocessingjob" ON public."RoomProcessingJob";
CREATE POLICY "rls_admin_delete_roomprocessingjob"
ON public."RoomProcessingJob"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_roomprocessingjob" ON public."RoomProcessingJob";
CREATE POLICY "rls_project_manager_select_roomprocessingjob"
ON public."RoomProcessingJob"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_roomprocessingjob" ON public."RoomProcessingJob";
CREATE POLICY "rls_project_manager_insert_roomprocessingjob"
ON public."RoomProcessingJob"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_roomprocessingjob" ON public."RoomProcessingJob";
CREATE POLICY "rls_project_manager_update_roomprocessingjob"
ON public."RoomProcessingJob"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_roomprocessingjob" ON public."RoomProcessingJob";
CREATE POLICY "rls_project_manager_delete_roomprocessingjob"
ON public."RoomProcessingJob"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- RoomScanFile
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_roomscanfile" ON public."RoomScanFile";
CREATE POLICY "rls_admin_select_roomscanfile"
ON public."RoomScanFile"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_roomscanfile" ON public."RoomScanFile";
CREATE POLICY "rls_admin_insert_roomscanfile"
ON public."RoomScanFile"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_roomscanfile" ON public."RoomScanFile";
CREATE POLICY "rls_admin_update_roomscanfile"
ON public."RoomScanFile"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_roomscanfile" ON public."RoomScanFile";
CREATE POLICY "rls_admin_delete_roomscanfile"
ON public."RoomScanFile"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_roomscanfile" ON public."RoomScanFile";
CREATE POLICY "rls_project_manager_select_roomscanfile"
ON public."RoomScanFile"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_roomscanfile" ON public."RoomScanFile";
CREATE POLICY "rls_project_manager_insert_roomscanfile"
ON public."RoomScanFile"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_roomscanfile" ON public."RoomScanFile";
CREATE POLICY "rls_project_manager_update_roomscanfile"
ON public."RoomScanFile"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_roomscanfile" ON public."RoomScanFile";
CREATE POLICY "rls_project_manager_delete_roomscanfile"
ON public."RoomScanFile"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- RoomScanSession
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_roomscansession" ON public."RoomScanSession";
CREATE POLICY "rls_admin_select_roomscansession"
ON public."RoomScanSession"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_roomscansession" ON public."RoomScanSession";
CREATE POLICY "rls_admin_insert_roomscansession"
ON public."RoomScanSession"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_roomscansession" ON public."RoomScanSession";
CREATE POLICY "rls_admin_update_roomscansession"
ON public."RoomScanSession"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_roomscansession" ON public."RoomScanSession";
CREATE POLICY "rls_admin_delete_roomscansession"
ON public."RoomScanSession"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_roomscansession" ON public."RoomScanSession";
CREATE POLICY "rls_project_manager_select_roomscansession"
ON public."RoomScanSession"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_roomscansession" ON public."RoomScanSession";
CREATE POLICY "rls_project_manager_insert_roomscansession"
ON public."RoomScanSession"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_roomscansession" ON public."RoomScanSession";
CREATE POLICY "rls_project_manager_update_roomscansession"
ON public."RoomScanSession"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_roomscansession" ON public."RoomScanSession";
CREATE POLICY "rls_project_manager_delete_roomscansession"
ON public."RoomScanSession"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

-- =========================
-- RoomSurface
-- =========================
-- ADMIN
DROP POLICY IF EXISTS "rls_admin_select_roomsurface" ON public."RoomSurface";
CREATE POLICY "rls_admin_select_roomsurface"
ON public."RoomSurface"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_admin_insert_roomsurface" ON public."RoomSurface";
CREATE POLICY "rls_admin_insert_roomsurface"
ON public."RoomSurface"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_update_roomsurface" ON public."RoomSurface";
CREATE POLICY "rls_admin_update_roomsurface"
ON public."RoomSurface"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

DROP POLICY IF EXISTS "rls_admin_delete_roomsurface" ON public."RoomSurface";
CREATE POLICY "rls_admin_delete_roomsurface"
ON public."RoomSurface"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_admin()
	AND "tenantId" = app.current_tenant_id()
);

-- PROJECT_MANAGER
DROP POLICY IF EXISTS "rls_project_manager_select_roomsurface" ON public."RoomSurface";
CREATE POLICY "rls_project_manager_select_roomsurface"
ON public."RoomSurface"
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_insert_roomsurface" ON public."RoomSurface";
CREATE POLICY "rls_project_manager_insert_roomsurface"
ON public."RoomSurface"
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_update_roomsurface" ON public."RoomSurface";
CREATE POLICY "rls_project_manager_update_roomsurface"
ON public."RoomSurface"
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
)
WITH CHECK (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
	AND "deletedAt" IS NULL
);

DROP POLICY IF EXISTS "rls_project_manager_delete_roomsurface" ON public."RoomSurface";
CREATE POLICY "rls_project_manager_delete_roomsurface"
ON public."RoomSurface"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
	app.is_project_manager()
	AND "tenantId" = app.current_tenant_id()
);

COMMIT;
