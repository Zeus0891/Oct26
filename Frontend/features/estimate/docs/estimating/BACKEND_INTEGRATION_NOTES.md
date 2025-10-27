# Backend Integration Notes (Estimating Frontend)

Version: 0.1

## Table of Contents

1. Overview
2. Auth Flow & Token Handling
3. Required Headers & Propagation
4. CORS & Security Context
5. Rate Limiting & Throttling
6. File Uploads (Attachments)
7. Timeouts & Resilience
8. Status Transitions & Allowed Actions
9. Revisions & Concurrency
10. Approvals Workflow Nuances
11. Bids & Invitations
12. RBAC Handling (Advisory Only in Frontend)
13. Environment & Configuration
14. Logging, Telemetry, Correlation IDs
15. Error Handling Strategy
16. Performance Considerations
17. Future Enhancements (Suggested)
18. Assumptions & Open Questions

---

## 1. Overview

This document captures critical backend integration details for implementing the Estimating frontend. It ensures alignment on headers, workflows, and constraints. All authoritative logic lives server-side; the frontend consumes and reflects state.

## 2. Auth Flow & Token Handling

- Users authenticate via existing login (assumed OAuth2 / JWT issuance by backend Auth service).
- Access token stored in memory (React state) + httpOnly cookie OR secure storage mechanism already standardized in project (follow existing `AuthContext`). Avoid localStorage if possible for security; if already using, document risk.
- Token refresh: if backend supports refresh tokens, implement silent refresh before expiry (check existing auth module). If not, redirect to login on 401.
- Frontend injects token in `Authorization: Bearer <token>` for every API call.

## 3. Required Headers & Propagation

| Header              | Purpose                | Source                          |
| ------------------- | ---------------------- | ------------------------------- |
| Authorization       | AuthN context          | Auth provider                   |
| x-tenant-id         | Tenant scoping         | Session / user profile          |
| x-correlation-id    | Trace linking          | Generated per request (uuid v4) |
| Content-Type        | JSON or multipart      | Axios auto / manual             |
| If-Match (optional) | Optimistic concurrency | Stored ETag from prior GET      |

Propagation strategy: Axios request interceptor merges base headers. Correlation ID new per request (NOT per page), enabling granular tracing.

## 4. CORS & Security Context

- CORS: Ensure backend allows origin of production frontend domain(s). Preflight required for custom headers (x-tenant-id, x-correlation-id).
- Cookies (if used) must set `SameSite=None; Secure` for cross-origin; else rely purely on Authorization header.
- No direct presigned upload URLs yet (multipart direct POST to API).

## 5. Rate Limiting & Throttling

- Expect 429 with optional `Retry-After` seconds header. Client: show toast "Temporarily throttled, retry in N seconds." Do not auto-spam retry except for idempotent safe operations with exponential backoff (cap at 2 retries for GETs).

## 6. File Uploads (Attachments)

- Endpoint: `POST /api/estimates/:id/attachments` multipart/form-data: field `file` + optional `label`.
- Progress: Use Axios `onUploadProgress` to display percentage.
- Max size & accepted MIME types: (Assumption) 25 MB, restricted to pdf, image/\*, docx, xlsx, txt. Need confirmation.
- Large file strategy future: switch to presigned uploads (S3/GCS) returning metadata record creation endpoint.

## 7. Timeouts & Resilience

- Axios global timeout: 15s (GET) / 60s (upload). Adjustable via config.
- If network fails mid-mutation, user gets retry prompt; avoid automatic re-submit for non-idempotent actions (send, convert, cancel).
- Use abort controllers for in-flight GETs when switching tabs to prevent race conditions overwriting state.

## 8. Status Transitions & Allowed Actions

| From            | Action          | To                               | Notes                                                           |
| --------------- | --------------- | -------------------------------- | --------------------------------------------------------------- | ------ | -------------------------- |
| DRAFT           | send            | SENT                             | Backend sets `sentAt` & triggers notification dispatch          |
| DRAFT           | requestApproval | DRAFT (pending approval entries) | Estimate status stays DRAFT until approved? (Assumed)           |
| SENT            | viewedByClient  | VIEWED                           | Server event triggered on client portal view (webhook / beacon) |
| (DRAFT          | SENT            | VIEWED)                          | requestApproval                                                 | (same) | Creates approval record(s) |
| VIEWED          | clientApprove   | CLIENT_APPROVED                  | Client portal action                                            |
| VIEWED          | clientDecline   | CLIENT_DECLINED                  | Includes reason maybe                                           |
| CLIENT_APPROVED | internalApprove | APPROVED                         | All internal approvals satisfied                                |
| CLIENT_APPROVED | internalDecline | DECLINED                         |                                                                 |
| APPROVED        | convert         | CONVERTED                        | Links to project creation (projectId returned)                  |
| \*              | expireJob       | EXPIRED                          | Background scheduler (cron)                                     |
| \*              | cancel          | CANCELLED                        | Manual cancellation                                             |

Invalid transitions return 409/422 with error code (e.g., `INVALID_STATE_TRANSITION`).

## 9. Revisions & Concurrency

- Revision created automatically on significant mutating operations (line item changes, pricing changes). Server attaches `latestRevisionNumber` in detail.
- Manual force revision endpoint available for explicit snapshot (optional).
- Concurrency: ETag header on GET; include `If-Match` on PATCH/PUT to detect stale updates. If mismatch → 412 Precondition Failed (preferred) or 409 Conflict.
- Diff endpoint computes canonical changes; frontend must not attempt to reconstruct independently for authoritative record.

## 10. Approvals Workflow Nuances

- Multiple parallel approvals? (Assumption: single-lane sequential; escalate generates ESCALATED record then new PENDING).
- Decline requires `reason` (assumption) enforced server-side.
- Cancellation of approval possible only while PENDING.
- Internal vs client approvals distinct (client actions produce CLIENT_APPROVED status separate from internal APPROVED).

## 11. Bids & Invitations

- Bids logically attached to Estimate (One-to-many). Invitation triggers email with unique token (vendor side future).
- Submission updates aggregated `BidStatus` (OPEN -> CLOSED via scheduling or manual close after deadline).
- Award action (not yet specified) would set BidStatus=AWARDED (future endpoint maybe `/api/estimates/:id/bids/:bidId/award`). Not required for MVP UI, but placeholder could be hidden.

## 12. RBAC Handling (Advisory Only in Frontend)

- Frontend uses permission keys to hide actions; never blocks route or form submission.
- Even if button is visible due to stale cache, backend will enforce with 403.
- Permission list loaded at auth bootstrap; stored in memory store; `RoleGuard` subscribes.

## 13. Environment & Configuration

| Variable                 | Purpose                                |
| ------------------------ | -------------------------------------- |
| NEXT_PUBLIC_API_URL      | Base API URL (prod)                    |
| NEXT_PUBLIC_BUILD_ENV    | Display build context in UI (optional) |
| NEXT_PUBLIC_SENTRY_DSN   | Telemetry (if used)                    |
| NEXT_PUBLIC_FEATURE_BIDS | Toggle bids UI (progressive rollout)   |

No localhost fallback in production build; preview deployments must set API URL explicitly.

## 14. Logging, Telemetry, Correlation IDs

- Each request includes unique `x-correlation-id` => backend logs include it.
- On error, UI surfaces correlationId in a collapsible debug panel for support.
- Optionally add `x-client-version` with semantic version from build (helps trace regressions).

## 15. Error Handling Strategy

- Central Axios interceptor unwraps `error.response.data.error` and normalizes.
- User facing mapping: technical codes -> friendly messages (table maintained in `utils/errors.ts`).
- Validation details displayed inline (forms) when `details` is object mapping field names -> messages.
- Retries only for network / 5xx (max 2) on idempotent GET endpoints.

## 16. Performance Considerations

- Batch line item adds rather than multiple sequential POSTs.
- Avoid fetching all large child collections on list view; list endpoint returns summarized counts (assumption future: maybe `lineItemCount`, `revisionCount`).
- Conditional tab prefetch: after loading detail, prefetch revisions metadata & approvals in background.
- Caching TTL (Zustand or SWR pattern) ~2 minutes for list data; detail refreshed on tab focus via `visibilitychange` listener.

## 17. Future Enhancements (Suggested)

- Idempotency-Key support for action endpoints.
- WebSocket / SSE events for status transitions (client view → VIEWED, approvals updates).
- Presigned S3 uploads reducing backend load.
- Fine-grained partial updates for bulk line item operations (PATCH semantics with JSON Patch?).
- Role-based field-level UI hints (read-only fields annotated by backend meta).

## 18. Assumptions & Open Questions

**Assumptions**

- Backend supports ETag; if not, we'll omit optimistic concurrency initially.
- Expiration handled server cron; frontend does not poll specifically—status updates shown after navigation or manual refresh.
- Attachments served through secure URLs valid for at least 5 minutes.
- No PII constraints requiring client-side redaction.

**Open Questions**

- Clarify max attachment size + MIME whitelist.
- Confirm if multi-approver sequence required (parallel vs serial?).
- Will we expose a vendor bid submission endpoint in MVP? (If no, hide submission form.)
- Do we need audit trail endpoint separate from revisions/activity? (Potential `/api/estimates/:id/activity`).
- Is there a project creation payload customization when converting? (Currently assumed minimal.)

---

_End of BACKEND_INTEGRATION_NOTES.md_
