#!/usr/bin/env node
/**
 * Projects Module Smoke Test Helper
 * Provides utilities to provision a tenant and users, login to obtain tenant-scoped JWTs,
 * and perform authorized HTTP requests with RLS headers.
 */
const fetch = require("node-fetch");
const crypto = require("crypto");

const BASE_URL = (process.env.BASE_URL || process.env.AUTH_BASE_URL || "http://localhost:3001").replace(/\/$/, "");
const AUTH_PREFIX = process.env.AUTH_PREFIX || "/users";
const AUTH_URL = `${BASE_URL}${AUTH_PREFIX}`;
const API_BASE = `${BASE_URL}/api`;

function log(step, data) {
  console.log(`\n=== ${step} ===`);
  if (data !== undefined) console.log(data);
}

async function asJson(res) {
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function request(method, url, body, opts = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      ...(opts.tenantId ? { "X-Tenant-Id": String(opts.tenantId) } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function ensureTenantAndUsers() {
  // Create isolated tenant slug for this run
  const ts = Date.now();
  const tenantSlug = `proj-e2e-${ts}`;
  const tenantName = `Proj E2E ${ts}`;

  // Create three users
  const users = {
    admin: { email: `admin+${ts}@e2e.local`, password: `Passw0rd!${ts}` },
    manager: { email: `pm+${ts}@e2e.local`, password: `Passw0rd!${ts}` },
    viewer: { email: `viewer+${ts}@e2e.local`, password: `Passw0rd!${ts}` },
  };

  // We'll let bootstrap-full create the tenant if it doesn't exist
  // We'll resolve tenantId after first bootstrap call below
  let tenantId;

  // 2) Register users
  const registerUser = async (u) => {
    const r = await fetch(`${AUTH_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: u.email, password: u.password }),
    });
    const j = await asJson(r);
    if (![201, 409].includes(j.status)) {
      throw new Error(`User register failed ${u.email}: ${j.status}`);
    }
    return j;
  };
  await registerUser(users.admin);
  await registerUser(users.manager);
  await registerUser(users.viewer);

  // 3) Bootstrap tenant with each user + role (creates tenant if not present)
  const bootstrap = async (email, role) => {
    const r = await fetch(`${BASE_URL}/tenants/bootstrap-full`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantName, tenantSlug, userEmail: email, defaultRoleCode: role }),
    });
    const j = await asJson(r);
    if (j.status !== 200) throw new Error(`Bootstrap-full failed for ${email}/${role}: ${j.status}`);
    if (!tenantId) tenantId = j.body?.data?.tenant?.id;
    return j;
  };
  await bootstrap(users.admin.email, "ADMIN");
  await bootstrap(users.manager.email, "PROJECT_MANAGER");
  await bootstrap(users.viewer.email, "VIEWER");

  // 4) Login for tokens
  const deviceFingerprint = crypto.randomUUID();
  const login = async (u) => {
    const r = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: u.email, password: u.password, deviceFingerprint, tenantId }),
    });
    const j = await asJson(r);
    if (j.status !== 200) throw new Error(`Login failed for ${u.email}: ${j.status}`);
    const access = j.body?.data?.tokens?.accessToken;
    if (!access) throw new Error(`No access token for ${u.email}`);
    return access;
  };

  const tokens = {
    admin: await login(users.admin),
    manager: await login(users.manager),
    viewer: await login(users.viewer),
  };

  return { tenantId, users, tokens };
}

async function listDocumentGroups(token, tenantId) {
  const res = await fetch(`${API_BASE}/tenant/document-groups`, {
    headers: { Authorization: `Bearer ${token}`, "X-Tenant-Id": String(tenantId) },
  });
  const out = await asJson(res);
  if (out.status !== 200) throw new Error(`Document groups list failed: ${out.status} ${JSON.stringify(out.body)}`);
  const items = out.body?.data?.items || out.body?.data || [];
  return Array.isArray(items) ? items : [];
}

async function listMembers(token, tenantId) {
  const res = await fetch(`${API_BASE}/tenant/members`, {
    headers: { Authorization: `Bearer ${token}`, "X-Tenant-Id": String(tenantId) },
  });
  const out = await asJson(res);
  if (out.status !== 200) throw new Error(`Members list failed: ${out.status}`);
  const items = out.body?.data?.items || out.body?.data || [];
  return Array.isArray(items) ? items : [];
}

async function getRolePermissionChecker(token, tenantId) {
  // Build a function can(roleCode, permissionCode) -> boolean by consulting /api/access
  const rolesRes = await request("GET", `${API_BASE}/access/roles`, null, { token, tenantId });
  if (rolesRes.status !== 200 || !Array.isArray(rolesRes.json?.data)) {
    return { can: () => null }; // unknown
  }
  const roleByCode = {};
  for (const r of rolesRes.json.data) roleByCode[r.code] = r;

  async function permsFor(roleCode) {
    const role = roleByCode[roleCode];
    if (!role?.id) return [];
    const rp = await request(
      "GET",
      `${API_BASE}/access/role-permissions?roleId=${encodeURIComponent(role.id)}`,
      null,
      { token, tenantId }
    );
    const items = Array.isArray(rp.json?.data) ? rp.json.data : [];
    return items.map((x) => x.permission?.code || x.code).filter(Boolean);
  }

  const cache = {};
  async function can(roleCode, permissionCode) {
    if (!cache[roleCode]) cache[roleCode] = await permsFor(roleCode);
    return cache[roleCode].includes(permissionCode);
  }

  return { can };
}

module.exports = {
  BASE_URL,
  AUTH_URL,
  API_BASE,
  log,
  request,
  ensureTenantAndUsers,
  listDocumentGroups,
  listMembers,
  getRolePermissionChecker,
};
