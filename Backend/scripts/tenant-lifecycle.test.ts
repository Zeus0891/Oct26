/*
  Minimal tenant lifecycle integration test (idempotent, lightweight)
  - Requires server running at BASE_URL (default http://localhost:3001)
  - For protected route checks, start server with E2E=1 to bypass RBAC
*/
// Prefer global fetch in Node 18+; fallback to node-fetch
// eslint-disable-next-line @typescript-eslint/no-var-requires
const doFetch: any = (global as any).fetch || require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

function jstr(obj: any) { return JSON.stringify(obj); }

(async () => {
  const ts = Date.now();
  const tenantSlug = `acme-${ts}`;
  const tenantName = `Acme ${ts}`;
  const email = `owner+${ts}@example.com`;
  const password = `Passw0rd!${ts}`;

  const asJson = async (res: any) => ({ status: res.status, body: await res.json().catch(() => ({})) });

  // Register tenant
  let res = await doFetch(`${BASE_URL}/tenants/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: jstr({ name: tenantName, slug: tenantSlug })
  });
  let out = await asJson(res);
  if (res.status !== 201 && res.status !== 409) {
    console.error('Tenant register failed', out);
    process.exit(1);
  }
  const tenant = out.body?.data?.tenant || out.body?.data || {};
  const tenantId = tenant.id;
  if (!tenantId) {
    console.error('No tenant id', out);
    process.exit(1);
  }

  // Register user
  res = await doFetch(`${BASE_URL}/users/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: jstr({ email, password })
  });
  out = await asJson(res);
  if (res.status !== 201 && res.status !== 409) {
    console.error('User register failed', out);
    process.exit(1);
  }

  // Bootstrap full
  res = await doFetch(`${BASE_URL}/tenants/bootstrap-full`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: jstr({ tenantName, tenantSlug, userEmail: email, defaultRoleCode: 'ADMIN' })
  });
  out = await asJson(res);
  if (res.status !== 200) {
    console.error('Bootstrap-full failed', out);
    process.exit(1);
  }

  // Login
  res = await doFetch(`${BASE_URL}/users/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: jstr({ email, password, tenantId })
  });
  out = await asJson(res);
  if (res.status !== 200) {
    console.error('Login failed', out);
    process.exit(1);
  }
  const access = out.body?.data?.tokens?.accessToken;
  if (!access) {
    console.error('No access token', out);
    process.exit(1);
  }

  // Try protected endpoint (will work if server started with E2E=1)
  res = await doFetch(`${BASE_URL}/api/tenant/me`, { headers: { 'Authorization': `Bearer ${access}`, 'X-Tenant-Id': tenantId } });
  console.log(`/api/tenant/me -> ${res.status}`);

  console.log('tenant-lifecycle.test OK');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
