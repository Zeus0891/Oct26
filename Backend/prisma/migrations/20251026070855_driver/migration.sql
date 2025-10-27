-- This is an empty migration.-- ============================================================================
-- BEGIN TRANSACTION WRAPPER
-- Ensures atomic creation of all RLS policies for DRIVER
-- If any policy creation fails, the entire batch will rollback
-- ============================================================================

BEGIN;

-- ============================================================================ 
-- 🚀 START OF DRIVER POLICY CREATION 
-- ============================================================================

-- ============================================================================
-- DRIVER RLS POLICIES - Multi-Tenant Security Implementation
-- Auto-generated from RBAC.schema.v7.yml DRIVER permissions
-- Pattern: IDEMPOTENT PL/pgSQL - Safe for production deployment
-- Date: 2025-10-05
-- ============================================================================
--
-- ✨ IDEMPOTENT PATTERN: Uses pg_policies system table to check existence
-- 🚀 PRODUCTION-READY: Safe for Neon, Supabase, and repeated deployments
-- 🔒 SECURITY: app.is_driver() + tenant isolation + soft delete awareness
-- 📋 CONDITIONAL: TenantSettings toggles documented at bottom
-- 🌍 GLOBAL TABLES EXCLUDED: 34 tables without tenantId automatically skipped
--
-- DRIVER Role Check Function:
-- Uses app.is_driver() helper from 004_helpers.sql
--
-- ============================================================================

-- ============================================================================
-- CLOCKINCLOCKOUT POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_clockinclockout'
      AND schemaname = 'public'
      AND tablename = 'ClockInClockOut'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_clockinclockout';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_clockinclockout"
      ON public."ClockInClockOut"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_clockinclockout';
  END IF;
END $$;

-- INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_insert_clockinclockout'
      AND schemaname = 'public'
      AND tablename = 'ClockInClockOut'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_insert_clockinclockout';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_insert_clockinclockout"
      ON public."ClockInClockOut"
      AS RESTRICTIVE
      FOR INSERT
      TO authenticated
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_insert_clockinclockout';
  END IF;
END $$;


-- ============================================================================
-- DIRECTCHAT POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_directchat'
      AND schemaname = 'public'
      AND tablename = 'DirectChat'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_directchat';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_directchat"
      ON public."DirectChat"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_directchat';
  END IF;
END $$;

-- INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_insert_directchat'
      AND schemaname = 'public'
      AND tablename = 'DirectChat'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_insert_directchat';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_insert_directchat"
      ON public."DirectChat"
      AS RESTRICTIVE
      FOR INSERT
      TO authenticated
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_insert_directchat';
  END IF;
END $$;


-- ============================================================================
-- DIRECTMESSAGE POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_directmessage'
      AND schemaname = 'public'
      AND tablename = 'DirectMessage'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_directmessage';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_directmessage"
      ON public."DirectMessage"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_directmessage';
  END IF;
END $$;

-- INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_insert_directmessage'
      AND schemaname = 'public'
      AND tablename = 'DirectMessage'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_insert_directmessage';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_insert_directmessage"
      ON public."DirectMessage"
      AS RESTRICTIVE
      FOR INSERT
      TO authenticated
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_insert_directmessage';
  END IF;
END $$;

-- UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_update_directmessage'
      AND schemaname = 'public'
      AND tablename = 'DirectMessage'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_update_directmessage';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_update_directmessage"
      ON public."DirectMessage"
      AS RESTRICTIVE
      FOR UPDATE
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      )
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_update_directmessage';
  END IF;
END $$;

-- DELETE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_delete_directmessage'
      AND schemaname = 'public'
      AND tablename = 'DirectMessage'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_delete_directmessage';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_delete_directmessage"
      ON public."DirectMessage"
      AS RESTRICTIVE
      FOR DELETE
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_delete_directmessage';
  END IF;
END $$;


-- ============================================================================
-- EXPENSE POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_expense'
      AND schemaname = 'public'
      AND tablename = 'Expense'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_expense';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_expense"
      ON public."Expense"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_expense';
  END IF;
END $$;

-- INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_insert_expense'
      AND schemaname = 'public'
      AND tablename = 'Expense'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_insert_expense';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_insert_expense"
      ON public."Expense"
      AS RESTRICTIVE
      FOR INSERT
      TO authenticated
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_insert_expense';
  END IF;
END $$;

-- UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_update_expense'
      AND schemaname = 'public'
      AND tablename = 'Expense'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_update_expense';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_update_expense"
      ON public."Expense"
      AS RESTRICTIVE
      FOR UPDATE
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      )
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_update_expense';
  END IF;
END $$;


-- ============================================================================
-- EXPENSERECEIPT POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_expensereceipt'
      AND schemaname = 'public'
      AND tablename = 'ExpenseReceipt'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_expensereceipt';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_expensereceipt"
      ON public."ExpenseReceipt"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_expensereceipt';
  END IF;
END $$;

-- INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_insert_expensereceipt'
      AND schemaname = 'public'
      AND tablename = 'ExpenseReceipt'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_insert_expensereceipt';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_insert_expensereceipt"
      ON public."ExpenseReceipt"
      AS RESTRICTIVE
      FOR INSERT
      TO authenticated
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_insert_expensereceipt';
  END IF;
END $$;

-- UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_update_expensereceipt'
      AND schemaname = 'public'
      AND tablename = 'ExpenseReceipt'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_update_expensereceipt';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_update_expensereceipt"
      ON public."ExpenseReceipt"
      AS RESTRICTIVE
      FOR UPDATE
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      )
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_update_expensereceipt';
  END IF;
END $$;


-- ============================================================================
-- INVENTORYITEM POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_inventoryitem'
      AND schemaname = 'public'
      AND tablename = 'InventoryItem'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_inventoryitem';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_inventoryitem"
      ON public."InventoryItem"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_inventoryitem';
  END IF;
END $$;


-- ============================================================================
-- INVENTORYTRANSACTION POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_inventorytransaction'
      AND schemaname = 'public'
      AND tablename = 'InventoryTransaction'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_inventorytransaction';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_inventorytransaction"
      ON public."InventoryTransaction"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_inventorytransaction';
  END IF;
END $$;


-- ============================================================================
-- LEAVE POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_leave'
      AND schemaname = 'public'
      AND tablename = 'Leave'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_leave';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_leave"
      ON public."Leave"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_leave';
  END IF;
END $$;

-- INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_insert_leave'
      AND schemaname = 'public'
      AND tablename = 'Leave'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_insert_leave';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_insert_leave"
      ON public."Leave"
      AS RESTRICTIVE
      FOR INSERT
      TO authenticated
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_insert_leave';
  END IF;
END $$;

-- UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_update_leave'
      AND schemaname = 'public'
      AND tablename = 'Leave'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_update_leave';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_update_leave"
      ON public."Leave"
      AS RESTRICTIVE
      FOR UPDATE
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      )
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_update_leave';
  END IF;
END $$;


-- ============================================================================
-- MEMBER POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_member'
      AND schemaname = 'public'
      AND tablename = 'Member'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_member';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_member"
      ON public."Member"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_member';
  END IF;
END $$;

-- UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_update_member'
      AND schemaname = 'public'
      AND tablename = 'Member'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_update_member';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_update_member"
      ON public."Member"
      AS RESTRICTIVE
      FOR UPDATE
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      )
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_update_member';
  END IF;
END $$;


-- ============================================================================
-- MEMBERSETTINGS POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_membersettings'
      AND schemaname = 'public'
      AND tablename = 'MemberSettings'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_membersettings';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_membersettings"
      ON public."MemberSettings"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_membersettings';
  END IF;
END $$;

-- UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_update_membersettings'
      AND schemaname = 'public'
      AND tablename = 'MemberSettings'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_update_membersettings';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_update_membersettings"
      ON public."MemberSettings"
      AS RESTRICTIVE
      FOR UPDATE
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      )
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_update_membersettings';
  END IF;
END $$;


-- ============================================================================
-- NOTIFICATION POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_notification'
      AND schemaname = 'public'
      AND tablename = 'Notification'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_notification';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_notification"
      ON public."Notification"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_notification';
  END IF;
END $$;


-- ============================================================================
-- NOTIFICATIONPREFERENCE POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_notificationpreference'
      AND schemaname = 'public'
      AND tablename = 'NotificationPreference'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_notificationpreference';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_notificationpreference"
      ON public."NotificationPreference"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_notificationpreference';
  END IF;
END $$;

-- UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_update_notificationpreference'
      AND schemaname = 'public'
      AND tablename = 'NotificationPreference'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_update_notificationpreference';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_update_notificationpreference"
      ON public."NotificationPreference"
      AS RESTRICTIVE
      FOR UPDATE
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      )
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_update_notificationpreference';
  END IF;
END $$;


-- ============================================================================
-- PAYSTATEMENT POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_paystatement'
      AND schemaname = 'public'
      AND tablename = 'PayStatement'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_paystatement';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_paystatement"
      ON public."PayStatement"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_paystatement';
  END IF;
END $$;


-- ============================================================================
-- PAYROLLITEM POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_payrollitem'
      AND schemaname = 'public'
      AND tablename = 'PayrollItem'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_payrollitem';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_payrollitem"
      ON public."PayrollItem"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_payrollitem';
  END IF;
END $$;


-- ============================================================================
-- PAYROLLRUN POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_payrollrun'
      AND schemaname = 'public'
      AND tablename = 'PayrollRun'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_payrollrun';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_payrollrun"
      ON public."PayrollRun"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_payrollrun';
  END IF;
END $$;


-- ============================================================================
-- PROJECT POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_project'
      AND schemaname = 'public'
      AND tablename = 'Project'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_project';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_project"
      ON public."Project"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_project';
  END IF;
END $$;


-- ============================================================================
-- PROJECTLOCATION POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_projectlocation'
      AND schemaname = 'public'
      AND tablename = 'ProjectLocation'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_projectlocation';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_projectlocation"
      ON public."ProjectLocation"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_projectlocation';
  END IF;
END $$;


-- ============================================================================
-- PROJECTTASKASSIGNMENT POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_projecttaskassignment'
      AND schemaname = 'public'
      AND tablename = 'ProjectTaskAssignment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_projecttaskassignment';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_projecttaskassignment"
      ON public."ProjectTaskAssignment"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_projecttaskassignment';
  END IF;
END $$;


-- ============================================================================
-- SCHEDULE POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_schedule'
      AND schemaname = 'public'
      AND tablename = 'Schedule'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_schedule';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_schedule"
      ON public."Schedule"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_schedule';
  END IF;
END $$;


-- ============================================================================
-- TASK POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_task'
      AND schemaname = 'public'
      AND tablename = 'Task'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_task';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_task"
      ON public."Task"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_task';
  END IF;
END $$;

-- UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_update_task'
      AND schemaname = 'public'
      AND tablename = 'Task'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_update_task';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_update_task"
      ON public."Task"
      AS RESTRICTIVE
      FOR UPDATE
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      )
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_update_task';
  END IF;
END $$;


-- ============================================================================
-- TASKASSIGNMENT POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_taskassignment'
      AND schemaname = 'public'
      AND tablename = 'TaskAssignment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_taskassignment';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_taskassignment"
      ON public."TaskAssignment"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_taskassignment';
  END IF;
END $$;


-- ============================================================================
-- TASKATTACHMENT POLICIES (DRIVER)
-- ============================================================================

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_select_taskattachment'
      AND schemaname = 'public'
      AND tablename = 'TaskAttachment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_select_taskattachment';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_select_taskattachment"
      ON public."TaskAttachment"
      AS RESTRICTIVE
      FOR SELECT
      TO authenticated
      USING (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_select_taskattachment';
  END IF;
END $$;

-- INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'rls_driver_insert_taskattachment'
      AND schemaname = 'public'
      AND tablename = 'TaskAttachment'
  ) THEN
    RAISE NOTICE '🆕 Creating policy: rls_driver_insert_taskattachment';
    EXECUTE $policy$
      CREATE POLICY "rls_driver_insert_taskattachment"
      ON public."TaskAttachment"
      AS RESTRICTIVE
      FOR INSERT
      TO authenticated
      WITH CHECK (
        app.is_driver()
        AND "tenantId" = app.current_tenant_id()
        AND "deletedAt" IS NULL
      );
    $policy$;
  ELSE
    RAISE NOTICE '✅ Policy already exists: rls_driver_insert_taskattachment';
  END IF;
END $$;


-- ============================================================================
-- CONDITIONAL PERMISSIONS NOTES (DRIVER)
-- ============================================================================
--
-- The following permissions are conditional based on TenantSettings:
--
-- 1. allowDriverLocationTracking:
--    - ClockInClockOut.create, ClockInClockOut.update
--    - Location tracking and GPS coordinates
--
-- 2. allowDriverExpenseSubmission:
--    - Expense.create, Expense.update, Expense.submit
--    - ExpenseReceipt.create, ExpenseReceipt.update
--
-- 3. allowDriverAssetManagement:
--    - Asset.read, Asset.update (vehicles, tools)
--    - AssetAssignment.read, AssetAssignment.update
--
-- These conditions should be implemented in application logic
-- or as additional policy constraints.
--
-- ============================================================================


-- ============================================================================ 
-- ✅ END OF DRIVER POLICY CREATION 
-- ============================================================================

COMMIT;

-- ============================================================================
-- ✅ TRANSACTION COMPLETED SUCCESSFULLY
-- If you see this message, all policies were applied or skipped correctly
-- ============================================================================
