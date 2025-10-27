#!/usr/bin/env node
/**
 * Auth Module Smoke Test
 * Runs a minimal happy-path flow against a deployed environment (Railway or local).
 * Steps:
 * 1. Register user
 * 2. Login
 * 3. Refresh token
 * 4. Get profile (if endpoint protected & implemented)
 * 5. Logout
 *
 * Environment variables:
 *   AUTH_BASE_URL (REQUIRED in deployment; no localhost fallback)
 *   AUTH_EMAIL (optional override)
 *   AUTH_PASSWORD (optional override)
 */
const fetch = require("node-fetch");
const crypto = require("crypto");

const BASE_URL = process.env.AUTH_BASE_URL;
if (!BASE_URL) {
  console.error(
    "[config] AUTH_BASE_URL env var is required. Example: https://your-service.up.railway.app"
  );
  process.exit(1);
}

// Allow overriding the auth prefix (default to /users for this repo's Identity module)
const AUTH_PREFIX = process.env.AUTH_PREFIX || "/users";
const AUTH_URL = `${BASE_URL.replace(/\/$/, "")}${AUTH_PREFIX}`;

// Allow skipping register step when not implemented in current environment
const SKIP_REGISTER = ["1", "true", "yes"].includes(
  String(process.env.SKIP_REGISTER || "").toLowerCase()
);

// Generate unique test user each run unless overridden
const email =
  process.env.AUTH_EMAIL ||
  `smoke_${Date.now()}_${Math.random().toString(16).slice(2)}@test.local`;
const password = process.env.AUTH_PASSWORD || "SmokeTest1!";
const deviceFingerprint = crypto.randomUUID();

function log(step, data) {
  console.log(`\n=== ${step} ===`);
  if (data) console.log(data);
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

(async () => {
  const summary = { steps: [], success: true };
  try {
    log("CONFIG", {
      BASE_URL,
      AUTH_PREFIX,
      AUTH_URL,
      email,
      nodeEnv: process.env.NODE_ENV,
    });
    if (/localhost|127\.0\.0\.1/.test(BASE_URL)) {
      console.warn(
        "[warn] BASE_URL apunta a localhost; en Railway deberías pasar la URL pública."
      );
    }

    // 1. REGISTER (optional)
    let regRes;
    if (SKIP_REGISTER) {
      summary.steps.push({ step: "register", skipped: true });
      log("REGISTER SKIPPED", {
        reason: "SKIP_REGISTER env var enabled",
      });
    } else {
      const registerPayload = {
        email,
        password,
        confirmPassword: password,
        firstName: "Smoke",
        lastName: "Test",
        organization: "Smoke Org",
        acceptTerms: true,
      };
      regRes = await request("POST", `${AUTH_URL}/register`, registerPayload);
      summary.steps.push({ step: "register", status: regRes.status });
      log("REGISTER RESPONSE", regRes);
      // If register is not implemented in this environment, treat 404/405/501 as skip
      if ([404, 405, 501].includes(regRes.status)) {
        summary.steps.push({
          step: "register-skip",
          reason: `status ${regRes.status}`,
        });
      } else if (regRes.status >= 400) {
        throw new Error("Register failed");
      }
    }

    // Prepare tokens
    let accessToken;
    let refreshToken;
    // Extract tokens if returned on register
    if (!SKIP_REGISTER && regRes) {
      const tokens =
        regRes.json?.data?.tokens ||
        regRes.json?.data?.user?.tokens ||
        regRes.json?.data?.tokens;
      accessToken = tokens?.accessToken;
      refreshToken = tokens?.refreshToken;
    }

    // 2. LOGIN (in case registration didn’t return full tokens or to validate login endpoint)
    const tenantId = process.env.TENANT_ID || process.env.tenantId;
    const loginPayload = {
      email,
      password,
      deviceFingerprint,
      rememberMe: true,
      tenantId,
    };
  const login = await request("POST", `${AUTH_URL}/login`, loginPayload);
    summary.steps.push({ step: "login", status: login.status });
    log("LOGIN RESPONSE", login);
    if (login.status >= 400) throw new Error("Login failed");
    accessToken = login.json?.data?.tokens?.accessToken || accessToken;
    refreshToken = login.json?.data?.tokens?.refreshToken || refreshToken;

    if (!accessToken) throw new Error("Missing access token after login");

    // 3. REFRESH
    if (refreshToken) {
      const refresh = await request("POST", `${AUTH_URL}/refresh`, {
        refreshToken,
        deviceFingerprint,
      });
      summary.steps.push({ step: "refresh", status: refresh.status });
      log("REFRESH RESPONSE", refresh);
      if (refresh.status < 400 && refresh.json?.data?.tokens?.accessToken) {
        accessToken = refresh.json.data.tokens.accessToken;
      }
    } else {
      summary.steps.push({ step: "refresh", skipped: true });
    }

    // 4. PROFILE (optional). Try /profile; if not found, try /me
    let profile = await request("GET", `${AUTH_URL}/profile`, null, {
      token: accessToken,
    });
    if (profile.status === 404) {
      profile = await request("GET", `${AUTH_URL}/me`, null, { token: accessToken });
    }
    summary.steps.push({ step: "profile", status: profile.status });
    log("PROFILE RESPONSE", profile);

    // 5. RBAC ACCESS PERMISSIONS SMOKE
    // Verify ADMIN token can access /api/access endpoints
    const API_ACCESS_BASE = `${BASE_URL.replace(/\/$/, "")}/api/access`;
    // Permissions catalog
    const permsList = await request("GET", `${API_ACCESS_BASE}/permissions`, null, {
      token: accessToken,
      tenantId,
    });
    summary.steps.push({ step: "access-permissions-list", status: permsList.status, count: Array.isArray(permsList.json?.data) ? permsList.json.data.length : undefined });
    log("ACCESS /permissions", { status: permsList.status, length: permsList.json?.data?.length });
    if (permsList.status !== 200 || !Array.isArray(permsList.json?.data)) {
      throw new Error("Access permissions listing failed");
    }
    if (permsList.json.data.length < 10) {
      console.warn("[warn] Permissions list is small (", permsList.json.data.length, ") but proceeding");
    }

    // Roles list
  const rolesList = await request("GET", `${API_ACCESS_BASE}/roles`, null, {
      token: accessToken,
      tenantId,
    });
    summary.steps.push({ step: "access-roles-list", status: rolesList.status, count: Array.isArray(rolesList.json?.data) ? rolesList.json.data.length : undefined });
    log("ACCESS /roles", { status: rolesList.status, length: rolesList.json?.data?.length, body: rolesList.json });
    if (rolesList.status !== 200) throw new Error("Access roles list failed");

    // Create a role (to verify ROLE_CREATE)
    const uniq = Math.random().toString(36).slice(2, 10).toUpperCase();
    const roleCode = `SMOKE_${uniq}`;
    const createRole = await request(
      "POST",
      `${API_ACCESS_BASE}/roles`,
      { code: roleCode, name: `Smoke ${uniq}`, description: "Smoke test role", roleType: "CUSTOM", isDefault: false, priority: 0 },
      { token: accessToken, tenantId }
    );
    summary.steps.push({ step: "access-role-create", status: createRole.status });
    log("ACCESS create role", createRole);
    if (createRole.status !== 201) throw new Error("Role create failed");
    const roleId = createRole.json?.data?.id;

    // Grant a permission to that role (ROLEPERMISSION_CREATE)
    const permissionCodeToGrant = Array.isArray(permsList.json?.data) && permsList.json.data.length > 0
      ? permsList.json.data[0].code
      : "Permission.read";
    const grant = await request(
      "POST",
      `${API_ACCESS_BASE}/role-permissions/grant`,
      { roleId, permissionCode: permissionCodeToGrant },
      { token: accessToken, tenantId }
    );
    summary.steps.push({ step: "access-roleperm-grant", status: grant.status });
    log("ACCESS grant role-permission", grant);
    if (grant.status !== 201) throw new Error("Role-permission grant failed");

    // Fetch role-permissions for created role
    const rpList = await request(
      "GET",
      `${API_ACCESS_BASE}/role-permissions?roleId=${encodeURIComponent(roleId)}`,
      null,
      { token: accessToken, tenantId }
    );
    summary.steps.push({ step: "access-roleperm-list", status: rpList.status, count: Array.isArray(rpList.json?.data) ? rpList.json.data.length : undefined });
    log("ACCESS list role-permissions", { status: rpList.status, length: rpList.json?.data?.length });
    if (rpList.status !== 200 || !Array.isArray(rpList.json?.data) || rpList.json.data.length < 1) {
      throw new Error("Role-permissions list failed");
    }

    // 6. LOGOUT (optional if implemented)
    const logout = await request("POST", `${AUTH_URL}/logout`, {}, { token: accessToken });
    summary.steps.push({ step: "logout", status: logout.status });
    log("LOGOUT RESPONSE", logout);
  } catch (err) {
    summary.success = false;
    summary.error = err.message;
  } finally {
    console.log("\n=== SUMMARY ===");
  console.table(summary.steps);
    if (!summary.success) {
      console.error("Smoke test FAILED:", summary.error);
      process.exit(1);
    } else {
      console.log("Smoke test PASSED");
    }
  }
})();
