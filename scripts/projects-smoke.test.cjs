#!/usr/bin/env node
/**
 * Projects Module E2E Smoke Test
 * Covers CRUD and basic permission checks for:
 * - /api/projects/projects and /api/projects/projects/:id
 * - /api/projects/tasks
 * - /api/projects/members
 * Uses tenant-scoped JWTs and X-Tenant-Id for RLS.
 */
const {
  BASE_URL,
  API_BASE,
  log,
  request,
  ensureTenantAndUsers,
  listDocumentGroups,
  listMembers,
  getRolePermissionChecker,
} = require("./project-smoke-test.cjs");

function expectOrThrow(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  const summary = { steps: [], success: true };
  try {
    log("CONFIG", { BASE_URL, API_BASE });

    // 0) Provision tenant + users (ADMIN, PROJECT_MANAGER, VIEWER) and get tokens
    const { tenantId, users, tokens } = await ensureTenantAndUsers();
    summary.steps.push({ step: "provision", status: "ok", tenantId });

    // 1) Fetch a valid DocumentGroup for project creation
    const docGroups = await listDocumentGroups(tokens.admin, tenantId);
    summary.steps.push({ step: "document-groups", count: docGroups.length });
    let documentGroupId;
    if (docGroups.length === 0) {
      // Create one via API then re-fetch
      const created = await request("POST", `${API_BASE}/tenant/document-groups`, {}, { token: tokens.admin, tenantId });
      expectOrThrow(created.status === 201, `Failed to create DocumentGroup: ${created.status}`);
      documentGroupId = created.json?.data?.id;
      expectOrThrow(!!documentGroupId, "No id from created DocumentGroup");
    } else {
      documentGroupId = docGroups[0].id;
    }

    // 2) Permission awareness
    const permChecker = await getRolePermissionChecker(tokens.admin, tenantId);

    // Helper endpoints
    const projectsBase = `${API_BASE}/projects/projects`;
    const tasksBase = `${API_BASE}/projects/tasks`;
    const membersBase = `${API_BASE}/projects/members`;

    // 3) Projects CRUD with validation and role checks
    log("PROJECTS: create (ADMIN)");
    const projPayload = {
      name: `E2E Project ${Date.now()}`,
      documentGroupId,
      externalNumber: `E2E-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      description: "Smoke test project",
    };
    let res = await request("POST", projectsBase, projPayload, { token: tokens.admin, tenantId });
    summary.steps.push({ step: "project-create-admin", status: res.status });
    if (res.status !== 201) {
      console.error("Project create error body:", res.json);
    }
    expectOrThrow(res.status === 201, `Project create (ADMIN) failed: ${res.status}`);
    const projectId = res.json?.data?.id;
    expectOrThrow(!!projectId, "No project id returned");

    // Invalid payload (missing documentGroupId) -> 400
    log("PROJECTS: create invalid payload (ADMIN)");
    res = await request("POST", projectsBase, { name: "Bad", externalNumber: "BAD-1" }, { token: tokens.admin, tenantId });
    summary.steps.push({ step: "project-create-invalid", status: res.status });
    expectOrThrow(res.status === 400, `Expected 400 on invalid project payload, got ${res.status}`);

    // Read by id
    log("PROJECTS: get by id (ADMIN)");
    res = await request("GET", `${projectsBase}/${projectId}`, null, { token: tokens.admin, tenantId });
    summary.steps.push({ step: "project-get", status: res.status });
    expectOrThrow(res.status === 200, `Project get failed: ${res.status}`);

    // List
    log("PROJECTS: list (ADMIN)");
    res = await request("GET", `${projectsBase}?limit=5`, null, { token: tokens.admin, tenantId });
    summary.steps.push({ step: "project-list", status: res.status });
    expectOrThrow(res.status === 200 && Array.isArray(res.json?.data), `Project list failed: ${res.status}`);

    // Update (PROJECT_MANAGER)
    log("PROJECTS: update (PROJECT_MANAGER)");
    res = await request(
      "PATCH",
      `${projectsBase}/${projectId}`,
      { description: "Updated by PM" },
      { token: tokens.manager, tenantId }
    );
    summary.steps.push({ step: "project-update-pm", status: res.status });
    expectOrThrow(res.status === 200, `Project update (PM) failed: ${res.status}`);

    // Viewer create attempt: adapt expectation from RBAC mapping
    const viewerCanCreate = await permChecker.can("VIEWER", "Project.create");
    log("PROJECTS: create (VIEWER), expected", { viewerCanCreate });
    const viewerCreate = await request("POST", projectsBase, {
      name: `Viewer Proj ${Date.now()}`,
      documentGroupId,
      externalNumber: `V-${Math.random().toString(36).slice(2, 8)}`,
    }, { token: tokens.viewer, tenantId });
    summary.steps.push({ step: "project-create-viewer", status: viewerCreate.status, expectedAllowed: viewerCanCreate });
    if (viewerCanCreate === true) {
      expectOrThrow(viewerCreate.status === 201, `Viewer should create (per RBAC), got ${viewerCreate.status}`);
    } else if (viewerCanCreate === false) {
      expectOrThrow(viewerCreate.status === 403 || viewerCreate.status === 401, `Viewer create expected forbidden, got ${viewerCreate.status}`);
    }

    // Soft delete (ADMIN)
    log("PROJECTS: soft delete (ADMIN)");
    res = await request("DELETE", `${projectsBase}/${projectId}`, null, { token: tokens.admin, tenantId });
    summary.steps.push({ step: "project-delete", status: res.status });
    expectOrThrow(res.status === 200, `Project delete failed: ${res.status}`);

    // Confirm deleted -> 404
    res = await request("GET", `${projectsBase}/${projectId}`, null, { token: tokens.admin, tenantId });
    summary.steps.push({ step: "project-get-after-delete", status: res.status });
    expectOrThrow(res.status === 404, `Expected 404 after delete, got ${res.status}`);

    // 4) Project Tasks CRUD
    // First, create a fresh project again for task tests
    const proj2 = await request("POST", projectsBase, {
      name: `E2E Project 2 ${Date.now()}`,
      documentGroupId,
      externalNumber: `E2E2-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    }, { token: tokens.admin, tenantId });
    expectOrThrow(proj2.status === 201, `Project create for tasks failed: ${proj2.status}`);
    const projectId2 = proj2.json?.data?.id;

    // Create task (PM)
    log("TASKS: create (PROJECT_MANAGER)");
    let tRes = await request("POST", tasksBase, { name: "Task A", projectId: projectId2 }, { token: tokens.manager, tenantId });
    summary.steps.push({ step: "task-create", status: tRes.status });
    expectOrThrow(tRes.status === 201, `Task create failed: ${tRes.status}`);
    const taskId = tRes.json?.data?.id;

    // Invalid task payload (missing name)
    tRes = await request("POST", tasksBase, { projectId: projectId2 }, { token: tokens.manager, tenantId });
    summary.steps.push({ step: "task-create-invalid", status: tRes.status });
    expectOrThrow(tRes.status === 400, `Expected 400 on invalid task, got ${tRes.status}`);

    // List tasks (viewer should at least read)
    tRes = await request("GET", `${tasksBase}?projectId=${encodeURIComponent(projectId2)}`, null, { token: tokens.viewer, tenantId });
    summary.steps.push({ step: "task-list", status: tRes.status });
    expectOrThrow(tRes.status === 200, `Task list failed: ${tRes.status}`);

    // Update task (PM)
    tRes = await request("PATCH", `${tasksBase}/${taskId}`, { description: "updated" }, { token: tokens.manager, tenantId });
    summary.steps.push({ step: "task-update", status: tRes.status });
    expectOrThrow(tRes.status === 200, `Task update failed: ${tRes.status}`);

    // Soft delete task (ADMIN)
    tRes = await request("DELETE", `${tasksBase}/${taskId}`, null, { token: tokens.admin, tenantId });
    summary.steps.push({ step: "task-delete", status: tRes.status });
    expectOrThrow(tRes.status === 200, `Task delete failed: ${tRes.status}`);

    // 5) Project Members CRUD
    // Find a member to add: use the viewer member
    log("MEMBERS: list and pick viewer");
    const members = await listMembers(tokens.admin, tenantId);
    const viewerMember = members.find((m) => (m.user?.email || m.email || "").toLowerCase() === users.viewer.email.toLowerCase()) || members[0];
    expectOrThrow(!!viewerMember, "No tenant member found to add");

    // Create project member (ADMIN)
    log("MEMBERS: create (ADMIN)");
    let mRes = await request("POST", membersBase, { projectId: projectId2, memberId: viewerMember.id, role: "VIEWER" }, { token: tokens.admin, tenantId });
    summary.steps.push({ step: "member-create", status: mRes.status });
    expectOrThrow(mRes.status === 201, `Member create failed: ${mRes.status}`);
    const projectMemberId = mRes.json?.data?.id;

    // Invalid member payload (missing memberId)
    mRes = await request("POST", membersBase, { projectId: projectId2, role: "VIEWER" }, { token: tokens.admin, tenantId });
    summary.steps.push({ step: "member-create-invalid", status: mRes.status });
    expectOrThrow(mRes.status === 400, `Expected 400 on invalid member, got ${mRes.status}`);

    // List members
    mRes = await request("GET", `${membersBase}?projectId=${encodeURIComponent(projectId2)}`, null, { token: tokens.admin, tenantId });
    summary.steps.push({ step: "member-list", status: mRes.status });
    expectOrThrow(mRes.status === 200, `Member list failed: ${mRes.status}`);

    // Update member (PM)
    mRes = await request("PATCH", `${membersBase}/${projectMemberId}`, { role: "CONTRIBUTOR" }, { token: tokens.manager, tenantId });
    summary.steps.push({ step: "member-update", status: mRes.status });
    expectOrThrow(mRes.status === 200, `Member update failed: ${mRes.status}`);

    // Soft delete member (ADMIN)
    mRes = await request("DELETE", `${membersBase}/${projectMemberId}`, null, { token: tokens.admin, tenantId });
    summary.steps.push({ step: "member-delete", status: mRes.status });
    expectOrThrow(mRes.status === 200, `Member delete failed: ${mRes.status}`);

    // 6) Minimal cross-role read validations
    // Ensure each role can read projects list in-tenant
    const rolesToCheck = [
      { code: "ADMIN", token: tokens.admin },
      { code: "PROJECT_MANAGER", token: tokens.manager },
      { code: "VIEWER", token: tokens.viewer },
    ];
    for (const r of rolesToCheck) {
      const rRes = await request("GET", `${projectsBase}?limit=1`, null, { token: r.token, tenantId });
      summary.steps.push({ step: `project-list-${r.code.toLowerCase()}`, status: rRes.status });
      expectOrThrow(rRes.status === 200, `Role ${r.code} failed to read projects: ${rRes.status}`);
    }
  } catch (err) {
    summary.success = false;
    summary.error = err?.message || String(err);
  } finally {
    console.log("\n=== SUMMARY ===");
    console.table(summary.steps);
    if (!summary.success) {
      console.error("Projects smoke test FAILED:", summary.error);
      process.exit(1);
    } else {
      console.log("Projects smoke test PASSED");
    }
  }
}

run();
