#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:3001}
TS=$(date +%s)
TENANT_SLUG="acme-$TS"
TENANT_NAME="Acme $TS"
USER_EMAIL="owner+$TS@example.com"
USER_PASSWORD="Passw0rd!$TS"

info() { echo "[INFO] $*"; }
err() { echo "[ERROR] $*" >&2; }

info "Register tenant $TENANT_SLUG"
TENANT_JSON=$(curl -sS -X POST "$BASE_URL/tenants/register" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"$TENANT_NAME\",\"slug\":\"$TENANT_SLUG\"}")
TENANT_ID=$(echo "$TENANT_JSON" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const j=JSON.parse(d);console.log(j?.data?.tenant?.id||"")}catch(e){}});' || true)
if [ -z "$TENANT_ID" ]; then err "Tenant registration failed: $TENANT_JSON"; exit 1; fi
info "Tenant id: $TENANT_ID"

info "Register user $USER_EMAIL"
USER_JSON=$(curl -sS -X POST "$BASE_URL/users/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}")
USER_ID=$(echo "$USER_JSON" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const j=JSON.parse(d);console.log(j?.data?.user?.id||"")}catch(e){}});' || true)
if [ -z "$USER_ID" ]; then err "User registration failed: $USER_JSON"; exit 1; fi
info "User id: $USER_ID"

info "Bootstrap full (provision + membership + admin baseline)"
BOOT_JSON=$(curl -sS -X POST "$BASE_URL/tenants/bootstrap-full" \
  -H 'Content-Type: application/json' \
  -d "{\"tenantName\":\"$TENANT_NAME\",\"tenantSlug\":\"$TENANT_SLUG\",\"userEmail\":\"$USER_EMAIL\",\"defaultRoleCode\":\"ADMIN\"}")
ROLE_ASSIGNED=$(echo "$BOOT_JSON" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const j=JSON.parse(d);console.log(j?.data?.roleAssigned||"")}catch(e){}});' || true)
if [ "$ROLE_ASSIGNED" != "ADMIN" ]; then err "Bootstrap-full did not assign ADMIN: $BOOT_JSON"; exit 1; fi
info "Bootstrap-full OK (role=$ROLE_ASSIGNED)"

info "Login user"
LOGIN_JSON=$(curl -sS -X POST "$BASE_URL/users/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\",\"tenantId\":\"$TENANT_ID\"}")
ACCESS=$(echo "$LOGIN_JSON" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const j=JSON.parse(d);console.log(j?.data?.tokens?.accessToken||"")}catch(e){}});' || true)
if [ -z "$ACCESS" ]; then err "Login failed: $LOGIN_JSON"; exit 1; fi
info "Login OK"

info "Optionally try protected /api/tenant/me (may require server E2E=1 to succeed)"
ME_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/tenant/me" \
  -H "Authorization: Bearer $ACCESS" -H "X-Tenant-Id: $TENANT_ID" )
info "/api/tenant/me status: $ME_STATUS"

echo "SMOKE OK"

# Emit env exports for reuse in other scripts (auth-smoke-test)
echo "EXPORTS:"
echo "TENANT_ID=$TENANT_ID"
echo "AUTH_EMAIL=$USER_EMAIL"
echo "AUTH_PASSWORD=$USER_PASSWORD"
