#!/usr/bin/env node
const { API_BASE, ensureTenantAndUsers, request } = require('./project-smoke-test.cjs');

(async () => {
  try {
    const { tenantId, tokens } = await ensureTenantAndUsers();
    const res = await request('GET', `${API_BASE}/tenant/document-groups`, null, { token: tokens.admin, tenantId });
    console.log('doc-groups status:', res.status);
    console.log('doc-groups body keys:', Object.keys(res.json || {}));
    if (res.status !== 200) process.exit(1);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
