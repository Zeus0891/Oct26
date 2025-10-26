-- This is an empty migration.-- ============================================================================
-- BEGIN TRANSACTION WRAPPER
-- Ensures atomic creation of all RLS policies for VIEWER
-- If any policy creation fails, the entire batch will rollback
-- ============================================================================

BEGIN;

-- ============================================================================ 
-- 🚀 START OF VIEWER POLICY CREATION 
-- ============================================================================

-- ============================================================================
-- VIEWER RLS POLICIES - Multi-Tenant Security Implementation
-- Auto-generated from RBAC.schema.v7.yml VIEWER permissions
-- Pattern: IDEMPOTENT PL/pgSQL - Safe for production deployment
-- Date: 2025-10-05
-- ============================================================================
--
-- ✨ IDEMPOTENT PATTERN: Uses pg_policies system table to check existence
-- 🚀 PRODUCTION-READY: Safe for Neon, Supabase, and repeated deployments
-- 🔒 SECURITY: app.is_viewer() + tenant isolation + soft delete awareness
-- 📋 READ-ONLY: VIEWER role typically only has SELECT permissions
-- 🌍 GLOBAL TABLES EXCLUDED: 34 tables without tenantId automatically skipped
--
-- VIEWER Role Check Function:
-- Uses app.is_viewer() helper from 004_helpers.sql
--
-- ============================================================================

-- ============================================================================
-- AIACTION POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_aiaction'
      AND schemaname = 'public'
      AND tablename = 'AIAction'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_aiaction';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_aiaction"
      ON public."AIAction"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_aiaction';
  END IF;
END $$;


-- ============================================================================
-- AIACTIONRUN POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_aiactionrun'
      AND schemaname = 'public'
      AND tablename = 'AIActionRun'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_aiactionrun';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_aiactionrun"
      ON public."AIActionRun"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_aiactionrun';
  END IF;
END $$;


-- ============================================================================
-- AIINSIGHT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_aiinsight'
      AND schemaname = 'public'
      AND tablename = 'AIInsight'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_aiinsight';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_aiinsight"
      ON public."AIInsight"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_aiinsight';
  END IF;
END $$;


-- ============================================================================
-- AIINSIGHTFEEDBACK POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_aiinsightfeedback'
      AND schemaname = 'public'
      AND tablename = 'AIInsightFeedback'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_aiinsightfeedback';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_aiinsightfeedback"
      ON public."AIInsightFeedback"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_aiinsightfeedback';
  END IF;
END $$;


-- ============================================================================
-- AIJOB POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_aijob'
      AND schemaname = 'public'
      AND tablename = 'AIJob'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_aijob';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_aijob"
      ON public."AIJob"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_aijob';
  END IF;
END $$;


-- ============================================================================
-- AIJOBARTIFACT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_aijobartifact'
      AND schemaname = 'public'
      AND tablename = 'AIJobArtifact'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_aijobartifact';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_aijobartifact"
      ON public."AIJobArtifact"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_aijobartifact';
  END IF;
END $$;


-- ============================================================================
-- ACCOUNT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_account'
      AND schemaname = 'public'
      AND tablename = 'Account'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_account';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_account"
      ON public."Account"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_account';
  END IF;
END $$;


-- ============================================================================
-- ACCOUNTADDRESS POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_accountaddress'
      AND schemaname = 'public'
      AND tablename = 'AccountAddress'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_accountaddress';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_accountaddress"
      ON public."AccountAddress"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_accountaddress';
  END IF;
END $$;


-- ============================================================================
-- APPROVALDECISION POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_approvaldecision'
      AND schemaname = 'public'
      AND tablename = 'ApprovalDecision'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_approvaldecision';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_approvaldecision"
      ON public."ApprovalDecision"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_approvaldecision';
  END IF;
END $$;


-- ============================================================================
-- APPROVALREQUEST POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_approvalrequest'
      AND schemaname = 'public'
      AND tablename = 'ApprovalRequest'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_approvalrequest';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_approvalrequest"
      ON public."ApprovalRequest"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_approvalrequest';
  END IF;
END $$;


-- ============================================================================
-- APPROVALRULE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_approvalrule'
      AND schemaname = 'public'
      AND tablename = 'ApprovalRule'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_approvalrule';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_approvalrule"
      ON public."ApprovalRule"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_approvalrule';
  END IF;
END $$;


-- ============================================================================
-- ASSET POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_asset'
      AND schemaname = 'public'
      AND tablename = 'Asset'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_asset';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_asset"
      ON public."Asset"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_asset';
  END IF;
END $$;


-- ============================================================================
-- ASSETASSIGNMENT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_assetassignment'
      AND schemaname = 'public'
      AND tablename = 'AssetAssignment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_assetassignment';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_assetassignment"
      ON public."AssetAssignment"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_assetassignment';
  END IF;
END $$;


-- ============================================================================
-- ATTACHMENT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_attachment'
      AND schemaname = 'public'
      AND tablename = 'Attachment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_attachment';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_attachment"
      ON public."Attachment"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_attachment';
  END IF;
END $$;


-- ============================================================================
-- BID POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_bid'
      AND schemaname = 'public'
      AND tablename = 'Bid'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_bid';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_bid"
      ON public."Bid"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_bid';
  END IF;
END $$;


-- ============================================================================
-- CHANGEORDER POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_changeorder'
      AND schemaname = 'public'
      AND tablename = 'ChangeOrder'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_changeorder';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_changeorder"
      ON public."ChangeOrder"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_changeorder';
  END IF;
END $$;


-- ============================================================================
-- CHANGEORDERAPPROVAL POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_changeorderapproval'
      AND schemaname = 'public'
      AND tablename = 'ChangeOrderApproval'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_changeorderapproval';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_changeorderapproval"
      ON public."ChangeOrderApproval"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_changeorderapproval';
  END IF;
END $$;


-- ============================================================================
-- CHANGEORDERLINE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_changeorderline'
      AND schemaname = 'public'
      AND tablename = 'ChangeOrderLine'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_changeorderline';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_changeorderline"
      ON public."ChangeOrderLine"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_changeorderline';
  END IF;
END $$;


-- ============================================================================
-- CHANNEL POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_channel'
      AND schemaname = 'public'
      AND tablename = 'Channel'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_channel';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_channel"
      ON public."Channel"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_channel';
  END IF;
END $$;


-- ============================================================================
-- CHANNELMEMBER POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_channelmember'
      AND schemaname = 'public'
      AND tablename = 'ChannelMember'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_channelmember';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_channelmember"
      ON public."ChannelMember"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_channelmember';
  END IF;
END $$;


-- ============================================================================
-- CLOCKINCLOCKOUT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_clockinclockout'
      AND schemaname = 'public'
      AND tablename = 'ClockInClockOut'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_clockinclockout';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_clockinclockout"
      ON public."ClockInClockOut"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_clockinclockout';
  END IF;
END $$;


-- ============================================================================
-- CONTACT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_contact'
      AND schemaname = 'public'
      AND tablename = 'Contact'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_contact';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_contact"
      ON public."Contact"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_contact';
  END IF;
END $$;


-- ============================================================================
-- CONTRACT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_contract'
      AND schemaname = 'public'
      AND tablename = 'Contract'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_contract';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_contract"
      ON public."Contract"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_contract';
  END IF;
END $$;


-- ============================================================================
-- CONTRACTTEMPLATE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_contracttemplate'
      AND schemaname = 'public'
      AND tablename = 'ContractTemplate'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_contracttemplate';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_contracttemplate"
      ON public."ContractTemplate"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_contracttemplate';
  END IF;
END $$;


-- ============================================================================
-- COSTCENTER POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_costcenter'
      AND schemaname = 'public'
      AND tablename = 'CostCenter'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_costcenter';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_costcenter"
      ON public."CostCenter"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_costcenter';
  END IF;
END $$;


-- ============================================================================
-- DASHBOARDDEFINITION POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_dashboarddefinition'
      AND schemaname = 'public'
      AND tablename = 'DashboardDefinition'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_dashboarddefinition';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_dashboarddefinition"
      ON public."DashboardDefinition"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_dashboarddefinition';
  END IF;
END $$;


-- ============================================================================
-- DIRECTCHAT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_directchat'
      AND schemaname = 'public'
      AND tablename = 'DirectChat'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_directchat';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_directchat"
      ON public."DirectChat"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_directchat';
  END IF;
END $$;


-- ============================================================================
-- DIRECTMESSAGE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_directmessage'
      AND schemaname = 'public'
      AND tablename = 'DirectMessage'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_directmessage';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_directmessage"
      ON public."DirectMessage"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_directmessage';
  END IF;
END $$;


-- ============================================================================
-- ESTIMATE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_estimate'
      AND schemaname = 'public'
      AND tablename = 'Estimate'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_estimate';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_estimate"
      ON public."Estimate"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_estimate';
  END IF;
END $$;


-- ============================================================================
-- ESTIMATEAPPROVAL POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_estimateapproval'
      AND schemaname = 'public'
      AND tablename = 'EstimateApproval'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_estimateapproval';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_estimateapproval"
      ON public."EstimateApproval"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_estimateapproval';
  END IF;
END $$;


-- ============================================================================
-- ESTIMATEATTACHMENT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_estimateattachment'
      AND schemaname = 'public'
      AND tablename = 'EstimateAttachment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_estimateattachment';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_estimateattachment"
      ON public."EstimateAttachment"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_estimateattachment';
  END IF;
END $$;


-- ============================================================================
-- ESTIMATECOMMENT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_estimatecomment'
      AND schemaname = 'public'
      AND tablename = 'EstimateComment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_estimatecomment';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_estimatecomment"
      ON public."EstimateComment"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_estimatecomment';
  END IF;
END $$;


-- ============================================================================
-- ESTIMATEDISCOUNT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_estimatediscount'
      AND schemaname = 'public'
      AND tablename = 'EstimateDiscount'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_estimatediscount';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_estimatediscount"
      ON public."EstimateDiscount"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_estimatediscount';
  END IF;
END $$;


-- ============================================================================
-- ESTIMATEHISTORYEVENT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_estimatehistoryevent'
      AND schemaname = 'public'
      AND tablename = 'EstimateHistoryEvent'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_estimatehistoryevent';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_estimatehistoryevent"
      ON public."EstimateHistoryEvent"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_estimatehistoryevent';
  END IF;
END $$;


-- ============================================================================
-- ESTIMATELINEITEM POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_estimatelineitem'
      AND schemaname = 'public'
      AND tablename = 'EstimateLineItem'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_estimatelineitem';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_estimatelineitem"
      ON public."EstimateLineItem"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_estimatelineitem';
  END IF;
END $$;


-- ============================================================================
-- ESTIMATEREVISION POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_estimaterevision'
      AND schemaname = 'public'
      AND tablename = 'EstimateRevision'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_estimaterevision';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_estimaterevision"
      ON public."EstimateRevision"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_estimaterevision';
  END IF;
END $$;


-- ============================================================================
-- ESTIMATETAX POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_estimatetax'
      AND schemaname = 'public'
      AND tablename = 'EstimateTax'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_estimatetax';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_estimatetax"
      ON public."EstimateTax"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_estimatetax';
  END IF;
END $$;


-- ============================================================================
-- ESTIMATETERM POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_estimateterm'
      AND schemaname = 'public'
      AND tablename = 'EstimateTerm'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_estimateterm';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_estimateterm"
      ON public."EstimateTerm"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_estimateterm';
  END IF;
END $$;


-- ============================================================================
-- EXPENSE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_expense'
      AND schemaname = 'public'
      AND tablename = 'Expense'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_expense';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_expense"
      ON public."Expense"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_expense';
  END IF;
END $$;


-- ============================================================================
-- EXPENSELINE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_expenseline'
      AND schemaname = 'public'
      AND tablename = 'ExpenseLine'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_expenseline';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_expenseline"
      ON public."ExpenseLine"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_expenseline';
  END IF;
END $$;


-- ============================================================================
-- EXPENSERECEIPT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_expensereceipt'
      AND schemaname = 'public'
      AND tablename = 'ExpenseReceipt'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_expensereceipt';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_expensereceipt"
      ON public."ExpenseReceipt"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_expensereceipt';
  END IF;
END $$;


-- ============================================================================
-- EXPORTJOB POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_exportjob'
      AND schemaname = 'public'
      AND tablename = 'ExportJob'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_exportjob';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_exportjob"
      ON public."ExportJob"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_exportjob';
  END IF;
END $$;


-- ============================================================================
-- FILEOBJECT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_fileobject'
      AND schemaname = 'public'
      AND tablename = 'FileObject'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_fileobject';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_fileobject"
      ON public."FileObject"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_fileobject';
  END IF;
END $$;


-- ============================================================================
-- INVENTORYADJUSTMENT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_inventoryadjustment'
      AND schemaname = 'public'
      AND tablename = 'InventoryAdjustment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_inventoryadjustment';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_inventoryadjustment"
      ON public."InventoryAdjustment"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_inventoryadjustment';
  END IF;
END $$;


-- ============================================================================
-- INVENTORYITEM POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_inventoryitem'
      AND schemaname = 'public'
      AND tablename = 'InventoryItem'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_inventoryitem';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_inventoryitem"
      ON public."InventoryItem"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_inventoryitem';
  END IF;
END $$;


-- ============================================================================
-- INVENTORYTRANSACTION POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_inventorytransaction'
      AND schemaname = 'public'
      AND tablename = 'InventoryTransaction'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_inventorytransaction';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_inventorytransaction"
      ON public."InventoryTransaction"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_inventorytransaction';
  END IF;
END $$;


-- ============================================================================
-- INVOICE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_invoice'
      AND schemaname = 'public'
      AND tablename = 'Invoice'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_invoice';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_invoice"
      ON public."Invoice"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_invoice';
  END IF;
END $$;


-- ============================================================================
-- INVOICELINEITEM POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_invoicelineitem'
      AND schemaname = 'public'
      AND tablename = 'InvoiceLineItem'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_invoicelineitem';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_invoicelineitem"
      ON public."InvoiceLineItem"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_invoicelineitem';
  END IF;
END $$;


-- ============================================================================
-- LEAD POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_lead'
      AND schemaname = 'public'
      AND tablename = 'Lead'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_lead';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_lead"
      ON public."Lead"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_lead';
  END IF;
END $$;


-- ============================================================================
-- LEADACTIVITY POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_leadactivity'
      AND schemaname = 'public'
      AND tablename = 'LeadActivity'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_leadactivity';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_leadactivity"
      ON public."LeadActivity"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_leadactivity';
  END IF;
END $$;


-- ============================================================================
-- LEAVE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_leave'
      AND schemaname = 'public'
      AND tablename = 'Leave'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_leave';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_leave"
      ON public."Leave"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_leave';
  END IF;
END $$;


-- ============================================================================
-- LOCATION POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_location'
      AND schemaname = 'public'
      AND tablename = 'Location'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_location';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_location"
      ON public."Location"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_location';
  END IF;
END $$;


-- ============================================================================
-- MEMBER POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_member'
      AND schemaname = 'public'
      AND tablename = 'Member'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_member';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_member"
      ON public."Member"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_member';
  END IF;
END $$;


-- ============================================================================
-- MEMBERDOCUMENT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_memberdocument'
      AND schemaname = 'public'
      AND tablename = 'MemberDocument'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_memberdocument';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_memberdocument"
      ON public."MemberDocument"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_memberdocument';
  END IF;
END $$;


-- ============================================================================
-- MEMBERSETTINGS POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_membersettings'
      AND schemaname = 'public'
      AND tablename = 'MemberSettings'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_membersettings';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_membersettings"
      ON public."MemberSettings"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_membersettings';
  END IF;
END $$;


-- ============================================================================
-- NOTIFICATION POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_notification'
      AND schemaname = 'public'
      AND tablename = 'Notification'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_notification';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_notification"
      ON public."Notification"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_notification';
  END IF;
END $$;


-- ============================================================================
-- NOTIFICATIONPREFERENCE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_notificationpreference'
      AND schemaname = 'public'
      AND tablename = 'NotificationPreference'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_notificationpreference';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_notificationpreference"
      ON public."NotificationPreference"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_notificationpreference';
  END IF;
END $$;


-- ============================================================================
-- OPPORTUNITY POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_opportunity'
      AND schemaname = 'public'
      AND tablename = 'Opportunity'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_opportunity';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_opportunity"
      ON public."Opportunity"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_opportunity';
  END IF;
END $$;


-- ============================================================================
-- OPPORTUNITYLINEITEM POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_opportunitylineitem'
      AND schemaname = 'public'
      AND tablename = 'OpportunityLineItem'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_opportunitylineitem';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_opportunitylineitem"
      ON public."OpportunityLineItem"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_opportunitylineitem';
  END IF;
END $$;


-- ============================================================================
-- OPPORTUNITYSTAGE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_opportunitystage'
      AND schemaname = 'public'
      AND tablename = 'OpportunityStage'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_opportunitystage';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_opportunitystage"
      ON public."OpportunityStage"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_opportunitystage';
  END IF;
END $$;


-- ============================================================================
-- PAYMENT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_payment'
      AND schemaname = 'public'
      AND tablename = 'Payment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_payment';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_payment"
      ON public."Payment"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_payment';
  END IF;
END $$;


-- ============================================================================
-- PAYROLLITEM POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_payrollitem'
      AND schemaname = 'public'
      AND tablename = 'PayrollItem'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_payrollitem';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_payrollitem"
      ON public."PayrollItem"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_payrollitem';
  END IF;
END $$;


-- ============================================================================
-- PAYROLLRUN POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_payrollrun'
      AND schemaname = 'public'
      AND tablename = 'PayrollRun'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_payrollrun';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_payrollrun"
      ON public."PayrollRun"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_payrollrun';
  END IF;
END $$;


-- ============================================================================
-- PROJECT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_project'
      AND schemaname = 'public'
      AND tablename = 'Project'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_project';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_project"
      ON public."Project"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_project';
  END IF;
END $$;


-- ============================================================================
-- PROJECTBUDGETLINE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_projectbudgetline'
      AND schemaname = 'public'
      AND tablename = 'ProjectBudgetLine'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_projectbudgetline';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_projectbudgetline"
      ON public."ProjectBudgetLine"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_projectbudgetline';
  END IF;
END $$;


-- ============================================================================
-- PROJECTFINANCIALSNAPSHOT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_projectfinancialsnapshot'
      AND schemaname = 'public'
      AND tablename = 'ProjectFinancialSnapshot'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_projectfinancialsnapshot';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_projectfinancialsnapshot"
      ON public."ProjectFinancialSnapshot"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_projectfinancialsnapshot';
  END IF;
END $$;


-- ============================================================================
-- PROJECTMEMBER POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_projectmember'
      AND schemaname = 'public'
      AND tablename = 'ProjectMember'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_projectmember';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_projectmember"
      ON public."ProjectMember"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_projectmember';
  END IF;
END $$;


-- ============================================================================
-- PROJECTNOTE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_projectnote'
      AND schemaname = 'public'
      AND tablename = 'ProjectNote'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_projectnote';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_projectnote"
      ON public."ProjectNote"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_projectnote';
  END IF;
END $$;


-- ============================================================================
-- PROJECTREPORT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_projectreport'
      AND schemaname = 'public'
      AND tablename = 'ProjectReport'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_projectreport';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_projectreport"
      ON public."ProjectReport"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_projectreport';
  END IF;
END $$;


-- ============================================================================
-- PROJECTTASK POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_projecttask'
      AND schemaname = 'public'
      AND tablename = 'ProjectTask'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_projecttask';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_projecttask"
      ON public."ProjectTask"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_projecttask';
  END IF;
END $$;


-- ============================================================================
-- PROJECTTASKASSIGNMENT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_projecttaskassignment'
      AND schemaname = 'public'
      AND tablename = 'ProjectTaskAssignment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_projecttaskassignment';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_projecttaskassignment"
      ON public."ProjectTaskAssignment"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_projecttaskassignment';
  END IF;
END $$;


-- ============================================================================
-- PROJECTTASKCOMMENT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_projecttaskcomment'
      AND schemaname = 'public'
      AND tablename = 'ProjectTaskComment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_projecttaskcomment';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_projecttaskcomment"
      ON public."ProjectTaskComment"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_projecttaskcomment';
  END IF;
END $$;


-- ============================================================================
-- PURCHASEORDER POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_purchaseorder'
      AND schemaname = 'public'
      AND tablename = 'PurchaseOrder'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_purchaseorder';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_purchaseorder"
      ON public."PurchaseOrder"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_purchaseorder';
  END IF;
END $$;


-- ============================================================================
-- PURCHASEORDERLINE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_purchaseorderline'
      AND schemaname = 'public'
      AND tablename = 'PurchaseOrderLine'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_purchaseorderline';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_purchaseorderline"
      ON public."PurchaseOrderLine"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_purchaseorderline';
  END IF;
END $$;


-- ============================================================================
-- QUOTE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_quote'
      AND schemaname = 'public'
      AND tablename = 'Quote'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_quote';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_quote"
      ON public."Quote"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_quote';
  END IF;
END $$;


-- ============================================================================
-- QUOTELINEITEM POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_quotelineitem'
      AND schemaname = 'public'
      AND tablename = 'QuoteLineItem'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_quotelineitem';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_quotelineitem"
      ON public."QuoteLineItem"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_quotelineitem';
  END IF;
END $$;


-- ============================================================================
-- RFQLINE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_rfqline'
      AND schemaname = 'public'
      AND tablename = 'RFQLine'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_rfqline';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_rfqline"
      ON public."RFQLine"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_rfqline';
  END IF;
END $$;


-- ============================================================================
-- REPORTDEFINITION POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_reportdefinition'
      AND schemaname = 'public'
      AND tablename = 'ReportDefinition'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_reportdefinition';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_reportdefinition"
      ON public."ReportDefinition"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_reportdefinition';
  END IF;
END $$;


-- ============================================================================
-- REQUESTFORQUOTE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_requestforquote'
      AND schemaname = 'public'
      AND tablename = 'RequestForQuote'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_requestforquote';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_requestforquote"
      ON public."RequestForQuote"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_requestforquote';
  END IF;
END $$;


-- ============================================================================
-- ROLE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_role'
      AND schemaname = 'public'
      AND tablename = 'Role'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_role';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_role"
      ON public."Role"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_role';
  END IF;
END $$;


-- ============================================================================
-- ROLEPERMISSION POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_rolepermission'
      AND schemaname = 'public'
      AND tablename = 'RolePermission'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_rolepermission';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_rolepermission"
      ON public."RolePermission"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_rolepermission';
  END IF;
END $$;


-- ============================================================================
-- SCHEDULE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_schedule'
      AND schemaname = 'public'
      AND tablename = 'Schedule'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_schedule';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_schedule"
      ON public."Schedule"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_schedule';
  END IF;
END $$;


-- ============================================================================
-- SCHEDULEEXCEPTION POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_scheduleexception'
      AND schemaname = 'public'
      AND tablename = 'ScheduleException'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_scheduleexception';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_scheduleexception"
      ON public."ScheduleException"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_scheduleexception';
  END IF;
END $$;


-- ============================================================================
-- TASK POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_task'
      AND schemaname = 'public'
      AND tablename = 'Task'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_task';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_task"
      ON public."Task"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_task';
  END IF;
END $$;


-- ============================================================================
-- TASKASSIGNMENT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_taskassignment'
      AND schemaname = 'public'
      AND tablename = 'TaskAssignment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_taskassignment';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_taskassignment"
      ON public."TaskAssignment"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_taskassignment';
  END IF;
END $$;


-- ============================================================================
-- TASKATTACHMENT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_taskattachment'
      AND schemaname = 'public'
      AND tablename = 'TaskAttachment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_taskattachment';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_taskattachment"
      ON public."TaskAttachment"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_taskattachment';
  END IF;
END $$;


-- ============================================================================
-- TASKCHECKLISTITEM POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_taskchecklistitem'
      AND schemaname = 'public'
      AND tablename = 'TaskChecklistItem'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_taskchecklistitem';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_taskchecklistitem"
      ON public."TaskChecklistItem"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_taskchecklistitem';
  END IF;
END $$;


-- ============================================================================
-- TASKDEPENDENCY POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_taskdependency'
      AND schemaname = 'public'
      AND tablename = 'TaskDependency'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_taskdependency';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_taskdependency"
      ON public."TaskDependency"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_taskdependency';
  END IF;
END $$;


-- ============================================================================
-- TENANTAUDITLOG POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_tenantauditlog'
      AND schemaname = 'public'
      AND tablename = 'TenantAuditLog'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_tenantauditlog';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_tenantauditlog"
      ON public."TenantAuditLog"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_tenantauditlog';
  END IF;
END $$;


-- ============================================================================
-- TENANTFEATUREFLAG POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_tenantfeatureflag'
      AND schemaname = 'public'
      AND tablename = 'TenantFeatureFlag'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_tenantfeatureflag';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_tenantfeatureflag"
      ON public."TenantFeatureFlag"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_tenantfeatureflag';
  END IF;
END $$;


-- ============================================================================
-- TENANTMETRICS POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_tenantmetrics'
      AND schemaname = 'public'
      AND tablename = 'TenantMetrics'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_tenantmetrics';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_tenantmetrics"
      ON public."TenantMetrics"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_tenantmetrics';
  END IF;
END $$;


-- ============================================================================
-- TENANTSETTINGS POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_tenantsettings'
      AND schemaname = 'public'
      AND tablename = 'TenantSettings'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_tenantsettings';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_tenantsettings"
      ON public."TenantSettings"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_tenantsettings';
  END IF;
END $$;


-- ============================================================================
-- TENANTUSAGERECORD POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_tenantusagerecord'
      AND schemaname = 'public'
      AND tablename = 'TenantUsageRecord'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_tenantusagerecord';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_tenantusagerecord"
      ON public."TenantUsageRecord"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_tenantusagerecord';
  END IF;
END $$;


-- ============================================================================
-- TERMSTEMPLATE POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_termstemplate'
      AND schemaname = 'public'
      AND tablename = 'TermsTemplate'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_termstemplate';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_termstemplate"
      ON public."TermsTemplate"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_termstemplate';
  END IF;
END $$;


-- ============================================================================
-- TIMESHEET POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_timesheet'
      AND schemaname = 'public'
      AND tablename = 'Timesheet'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_timesheet';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_timesheet"
      ON public."Timesheet"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_timesheet';
  END IF;
END $$;


-- ============================================================================
-- TIMESHEETENTRY POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_timesheetentry'
      AND schemaname = 'public'
      AND tablename = 'TimesheetEntry'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_timesheetentry';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_timesheetentry"
      ON public."TimesheetEntry"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_timesheetentry';
  END IF;
END $$;


-- ============================================================================
-- VENDOR POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_vendor'
      AND schemaname = 'public'
      AND tablename = 'Vendor'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_vendor';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_vendor"
      ON public."Vendor"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_vendor';
  END IF;
END $$;


-- ============================================================================
-- VENDORCONTACT POLICIES (VIEWER)
-- ============================================================================

-- SELECT (Read-Only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_viewer_select_vendorcontact'
      AND schemaname = 'public'
      AND tablename = 'VendorContact'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_viewer_select_vendorcontact';
    EXECUTE $policy$
      CREATE POLICY "rls_viewer_select_vendorcontact"
      ON public."VendorContact"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_viewer()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_viewer_select_vendorcontact';
  END IF;
END $$;


-- ============================================================================
-- CONDITIONAL PERMISSIONS NOTES (VIEWER)
-- ============================================================================
--
-- The following permissions are conditional based on TenantSettings:
--
-- 1. allowViewerReports:
--    - ProjectReport.read, ProjectReport.export
--    - ReportDefinition.read
--    - DashboardDefinition.read
--
-- 2. allowViewerFinancials:
--    - Invoice.read, Estimate.read
--    - ProjectFinancialSnapshot.read, ProjectFinancialSnapshot.export
--
-- 3. allowViewerTimeTracking:
--    - Timesheet.read, TimesheetEntry.read
--    - Leave.read, LeaveOfAbsence.read
--
-- VIEWER role is read-only by design for security and data integrity.
-- All write operations are explicitly excluded.
--
-- ============================================================================


-- ============================================================================ 
-- ✅ END OF VIEWER POLICY CREATION 
-- ============================================================================

COMMIT;

-- ============================================================================
-- ✅ TRANSACTION COMPLETED SUCCESSFULLY
-- If you see this message, all policies were applied or skipped correctly
-- ============================================================================
