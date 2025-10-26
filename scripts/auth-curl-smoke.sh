#!/usr/bin/env bash
set -euo pipefail

# Disable history expansion to avoid issues with '!' in some shells
set +H || true

BASE_URL=${BASE_URL:-http://localhost:3001}
TENANT_ID=${TENANT_ID:-019a1e43-2c07-7c71-863f-f0d74caf5012}
EMAIL=${EMAIL:-"smoke+$(date +%s)@demo.com"}
PASSWORD=${PASSWORD:-"Passw0rd123"}

TMP_DIR=$(mktemp -d -t authsmoke.XXXXXX)
trap 'rm -rf "$TMP_DIR"' EXIT

RED=$(tput setaf 1 2>/dev/null || true)
GREEN=$(tput setaf 2 2>/dev/null || true)
YELLOW=$(tput setaf 3 2>/dev/null || true)
BLUE=$(tput setaf 4 2>/dev/null || true)
RESET=$(tput sgr0 2>/dev/null || true)

info() { echo -e "${BLUE}➡ ${*}${RESET}"; }
ok() { echo -e "${GREEN}✅ ${*}${RESET}"; }
warn() { echo -e "${YELLOW}⚠ ${*}${RESET}"; }
err() { echo -e "${RED}❌ ${*}${RESET}"; }

info "Auth smoke starting against ${BASE_URL}"
info "Tenant: ${TENANT_ID}"
info "Email:  ${EMAIL}"

# 1) Register
info "Registering user"
REGISTER_BODY=$(cat <<JSON
{ "email": "${EMAIL}", "password": "${PASSWORD}", "firstName": "Smoke", "lastName": "Test" }
JSON
)

REGISTER_CODE=$(curl -sS -X POST "${BASE_URL}/users/register" \
  -H "Content-Type: application/json" \
  -d "${REGISTER_BODY}" \
  -o "${TMP_DIR}/register.json" -w "%{http_code}") || REGISTER_CODE=$?

if [[ "${REGISTER_CODE}" == "201" ]]; then
  ok "Registered user"
elif [[ "${REGISTER_CODE}" == "409" ]]; then
  warn "User already exists, continuing"
else
  err "Register failed (HTTP ${REGISTER_CODE})"
  cat "${TMP_DIR}/register.json" || true
  exit 1
fi

# 2) Login
info "Logging in"
LOGIN_BODY=$(cat <<JSON
{ "email": "${EMAIL}", "password": "${PASSWORD}", "tenantId": "${TENANT_ID}" }
JSON
)

LOGIN_CODE=$(curl -sS -X POST "${BASE_URL}/users/login" \
  -H "Content-Type: application/json" \
  -d "${LOGIN_BODY}" \
  -o "${TMP_DIR}/login.json" -w "%{http_code}") || LOGIN_CODE=$?

if [[ "${LOGIN_CODE}" != "200" ]]; then
  err "Login failed (HTTP ${LOGIN_CODE})"
  cat "${TMP_DIR}/login.json" || true
  exit 1
fi

ACCESS=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(j.data.tokens.accessToken)" "${TMP_DIR}/login.json")
REFRESH=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(j.data.tokens.refreshToken)" "${TMP_DIR}/login.json")
ok "Login ok (access=${#ACCESS}, refresh=${#REFRESH})"

# 3) Profile
info "Fetching profile"
PROFILE_CODE=$(curl -sS -H "Authorization: Bearer ${ACCESS}" \
  "${BASE_URL}/users/profile" \
  -o "${TMP_DIR}/profile.json" -w "%{http_code}") || PROFILE_CODE=$?

if [[ "${PROFILE_CODE}" != "200" ]]; then
  err "Profile failed (HTTP ${PROFILE_CODE})"
  cat "${TMP_DIR}/profile.json" || true
  exit 1
fi
ok "Profile ok"

# 4) Refresh
info "Refreshing token"
REFRESH_BODY=$(cat <<JSON
{ "refreshToken": "${REFRESH}" }
JSON
)

REFRESH_CODE=$(curl -sS -X POST "${BASE_URL}/users/refresh" \
  -H "Content-Type: application/json" \
  -d "${REFRESH_BODY}" \
  -o "${TMP_DIR}/refresh.json" -w "%{http_code}") || REFRESH_CODE=$?

if [[ "${REFRESH_CODE}" != "200" ]]; then
  err "Refresh failed (HTTP ${REFRESH_CODE})"
  cat "${TMP_DIR}/refresh.json" || true
  exit 1
fi

NEW_ACCESS=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(j.data.accessToken || j.data.tokens?.accessToken || '')" "${TMP_DIR}/refresh.json")
NEW_REFRESH=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(j.data.refreshToken || j.data.tokens?.refreshToken || '')" "${TMP_DIR}/refresh.json")
ok "Refresh ok (access=${#NEW_ACCESS}, refresh=${#NEW_REFRESH})"

ok "Auth smoke completed successfully"