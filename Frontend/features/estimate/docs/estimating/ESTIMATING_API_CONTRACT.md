# Estimating API Contract (Frontend Consumption)

Version: 0.1
Base URL (prod): `https://oct3newschema-production.up.railway.app`

## Table of Contents

1. Principles
2. Headers & Tenancy
3. Error Model
4. Pagination & Filtering
5. Endpoints Overview Table
6. Detailed Endpoint Specs & DTOs
7. Service Method Signatures (TypeScript)
8. cURL & Axios Examples
9. Retry & Idempotency Guidance
10. Assumptions & Open Questions

---

## 1. Principles

- RESTful, resource-oriented, JSON.
- Backend is authoritative for security, validation, and state transitions.
- All monetary totals returned by server (avoid client recalculation divergence).
- Consistent error envelope.
- Correlation IDs propagate for observability.

## 2. Headers & Tenancy

Mandatory on all requests (unless public vendor endpoint decided later):

- `Authorization: Bearer <jwt>`
- `x-tenant-id: <tenant UUID>`
- `x-correlation-id: <uuid>` (frontend generates if absent)
- `Content-Type: application/json` (except multipart uploads)

Optional / conditional headers:

- `If-Match: <etag>` for optimistic concurrency (proposed for critical mutating endpoints).
- `Accept: application/json`

## 3. Error Model

```ts
interface ApiErrorEnvelope {
  error: {
    code: string; // MACHINE_CODE e.g., ESTIMATE_NOT_FOUND, VALIDATION_FAILED, CONFLICT, UNAUTHORIZED
    message: string; // Human readable (safe to display or map)
    details?: any; // Field-level validation errors, etc.
    retryable?: boolean; // Hint for client
    correlationId?: string;
  };
}
```

HTTP codes mapping:

- 400 Validation / malformed
- 401 Auth invalid
- 403 Forbidden (RBAC / tenant violation)
- 404 Not found
- 409 Conflict (state transition invalid / revision mismatch)
- 422 Business rule failed (alternative to 409 where not strictly conflict)
- 429 Rate limit
- 500 Unexpected server

## 4. Pagination & Filtering

Query params (list endpoints):

- `page` (1-based), `pageSize` (default 20, max 100)
- `sort` (e.g., `createdAt:desc,reference:asc`)
- `status` (comma list) / `clientId` / `dateFrom` / `dateTo`
  Response envelope:

```ts
interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}
```

## 5. Endpoints Overview Table

| Method | Path                                                 | Purpose                        | RBAC Key (Proposal)           | Notes                          |
| ------ | ---------------------------------------------------- | ------------------------------ | ----------------------------- | ------------------------------ |
| GET    | /api/estimates                                       | List estimates                 | estimating.read               | Filters + pagination           |
| POST   | /api/estimates                                       | Create estimate (draft)        | estimating.create             | Returns detail                 |
| GET    | /api/estimates/:id                                   | Get estimate detail            | estimating.read               | Includes computed totals       |
| PATCH  | /api/estimates/:id                                   | Update draft / editable fields | estimating.update             | ETag optional                  |
| DELETE | /api/estimates/:id                                   | Delete draft                   | estimating.delete             | Hard or soft server-defined    |
| POST   | /api/estimates/:id/send                              | Send (client delivery)         | estimating.send               | Transitions DRAFT→SENT         |
| POST   | /api/estimates/:id/duplicate                         | Duplicate                      | estimating.duplicate          | Returns new draft              |
| POST   | /api/estimates/:id/cancel                            | Cancel                         | estimating.cancel             | Status → CANCELLED             |
| POST   | /api/estimates/:id/convert                           | Convert to project             | estimating.convert            | Returns project ref            |
| GET    | /api/estimates/:id/line-items                        | List line items                | estimating.read               | Or embedded in detail          |
| POST   | /api/estimates/:id/line-items                        | Add line item(s)               | estimating.update             | Bulk create allowed            |
| PATCH  | /api/estimates/:id/line-items/:itemId                | Update line item               | estimating.update             |                                |
| DELETE | /api/estimates/:id/line-items/:itemId                | Remove line item               | estimating.update             |                                |
| PUT    | /api/estimates/:id/line-items/reorder                | Reorder items                  | estimating.update             | Accepts ordered IDs            |
| GET    | /api/estimates/:id/terms                             | List terms                     | estimating.read               | Could be in detail             |
| PUT    | /api/estimates/:id/terms                             | Replace all terms              | estimating.update             | Idempotent                     |
| GET    | /api/estimates/:id/discounts                         | List discounts                 | estimating.read               |                                |
| PUT    | /api/estimates/:id/discounts                         | Replace all discounts          | estimating.update             |                                |
| GET    | /api/estimates/:id/taxes                             | List taxes                     | estimating.read               |                                |
| PUT    | /api/estimates/:id/taxes                             | Replace all taxes              | estimating.update             |                                |
| GET    | /api/estimates/:id/revisions                         | List revisions                 | estimating.revisions.read     | Metadata only                  |
| GET    | /api/estimates/:id/revisions/:revId                  | Get revision snapshot          | estimating.revisions.read     |                                |
| GET    | /api/estimates/:id/revisions/:revId/diff/:otherRevId | Diff revisions                 | estimating.revisions.read     | Server computes                |
| POST   | /api/estimates/:id/revisions                         | Force new revision (optional)  | estimating.revisions.create   | If allowed manually            |
| GET    | /api/estimates/:id/approvals                         | List approvals timeline        | estimating.approvals.read     |                                |
| POST   | /api/estimates/:id/approvals                         | Request approval               | estimating.approvals.request  | Creates pending entry          |
| POST   | /api/estimates/:id/approvals/:approvalId/decision    | Decision                       | estimating.approvals.decide   | APPROVE/DECLINE/CANCEL         |
| GET    | /api/estimates/:id/attachments                       | List attachments               | estimating.attachments.read   |                                |
| POST   | /api/estimates/:id/attachments                       | Upload attachment              | estimating.attachments.upload | multipart                      |
| DELETE | /api/estimates/:id/attachments/:attachmentId         | Delete attachment              | estimating.attachments.delete |                                |
| GET    | /api/estimates/:id/bids                              | List bids for estimate         | estimating.bids.read          |                                |
| POST   | /api/estimates/:id/bids/invitations                  | Invite bidders                 | estimating.bids.invite        | Bulk emails                    |
| GET    | /api/estimates/:id/bids/invitations                  | List invitations               | estimating.bids.read          |                                |
| GET    | /api/estimates/:id/bids/submissions                  | List submissions               | estimating.bids.read          |                                |
| POST   | /api/estimates/:id/bids/submissions                  | Submit bid (vendor)            | bids.submit                   | Might be separate auth context |
| POST   | /api/estimates/:id/bids/invitations/:invId/resend    | Resend invite                  | estimating.bids.invite        | Optional                       |

## 6. Detailed Endpoint Specs & DTOs

### Common Enums (mirror backend values)

```ts
enum EstimateStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  VIEWED = "VIEWED",
  CLIENT_APPROVED = "CLIENT_APPROVED",
  CLIENT_DECLINED = "CLIENT_DECLINED",
  APPROVED = "APPROVED",
  DECLINED = "DECLINED",
  CONVERTED = "CONVERTED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}
enum EstimateDiscountType {
  NONE = "NONE",
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  VOLUME = "VOLUME",
  EARLY_PAYMENT = "EARLY_PAYMENT",
  PROMOTIONAL = "PROMOTIONAL",
}
enum EstimateTaxType {
  NONE = "NONE",
  SALES_TAX = "SALES_TAX",
  VAT = "VAT",
  GST = "GST",
  CUSTOM = "CUSTOM",
}
enum EstimateTermType {
  PAYMENT = "PAYMENT",
  DELIVERY = "DELIVERY",
  WARRANTY = "WARRANTY",
  CANCELLATION = "CANCELLATION",
  SCOPE = "SCOPE",
  LIABILITY = "LIABILITY",
  COMPLIANCE = "COMPLIANCE",
}
enum EstimateApprovalDecision {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DECLINED = "DECLINED",
  CANCELLED = "CANCELLED",
  ESCALATED = "ESCALATED",
}
enum BidStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  AWARDED = "AWARDED",
  CANCELLED = "CANCELLED",
}
enum BidInvitationStatus {
  SENT = "SENT",
  VIEWED = "VIEWED",
  RESPONDED = "RESPONDED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}
enum BidSubmissionStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
  EXPIRED = "EXPIRED",
}
```

### Core DTOs

```ts
interface EstimateSummaryDTO {
  id: string;
  globalId: string;
  estimateNumber: string;
  customerId: string;
  title: string;
  status: EstimateStatus;
  currency: string;
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
  validUntil?: string;
  version: number;
}

interface EstimateLineItemDTO {
  id: string;
  itemNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasure?: string;
  notes?: string;
  costCategoryId?: string;
  costCodeId?: string;
  status: string;
  version: number;
}

interface EstimateDiscountDTO {
  id?: string;
  type: EstimateDiscountType;
  value: number; // percentage or amount
  label?: string;
}

interface EstimateTaxDTO {
  id?: string;
  type: EstimateTaxType;
  rate: number; // percent (e.g., 10 = 10%)
  label?: string;
  amount: number; // computed
}

interface EstimateTermDTO {
  id?: string;
  type: EstimateTermType;
  text: string;
}

interface EstimateAttachmentDTO {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string; // Signed or direct
  uploadedAt: string;
  uploadedBy: { id: string; name: string };
}

interface EstimateApprovalDTO {
  id: string;
  requestedBy: { id: string; name: string };
  decision: EstimateApprovalDecision;
  decidedBy?: { id: string; name: string };
  decidedAt?: string;
  reason?: string;
  createdAt: string;
}

interface EstimateRevisionMetaDTO {
  id: string;
  number: number;
  createdAt: string;
  createdBy: { id: string; name: string };
  summary?: string; // high-level change note
}

interface EstimateRevisionSnapshotDTO extends EstimateRevisionMetaDTO {
  estimate: Partial<EstimateDetailDTO>; // snapshot subset
}

interface RevisionDiffDTO {
  fromRevisionId: string;
  toRevisionId: string;
  changes: Array<{
    path: string;
    before: any;
    after: any;
    type: "added" | "removed" | "changed";
  }>;
}

interface BidDTO {
  id: string;
  estimateId: string;
  status: BidStatus;
  createdAt: string;
  updatedAt: string;
}

interface BidInvitationDTO {
  id: string;
  email: string;
  status: BidInvitationStatus;
  sentAt: string;
  respondedAt?: string;
}

interface BidSubmissionDTO {
  id: string;
  bidderEmail: string;
  status: BidSubmissionStatus;
  amount?: number;
  submittedAt?: string;
}

interface EstimateDetailDTO extends EstimateSummaryDTO {
  lineItems: EstimateLineItemDTO[];
  discounts: EstimateDiscountDTO[];
  taxes: EstimateTaxDTO[];
  terms: EstimateTermDTO[];
  attachments: EstimateAttachmentDTO[];
  approvals: EstimateApprovalDTO[];
  latestRevisionNumber: number;
  clientApprovedAt?: string;
  internallyApprovedAt?: string;
}
```

### Sample Requests

Create Estimate

```json
POST /api/estimates
{
  "clientId": "cli_123",
  "reference": "EST-2025-0001",
  "currency": "USD",
  "issueDate": "2025-10-08",
  "dueDate": "2025-10-20",
  "notes": "Initial draft",
  "lineItems": [ { "name": "Service A", "quantity": 10, "unitPrice": 120 } ],
  "discounts": [ { "type": "PERCENTAGE", "value": 5 } ],
  "taxes": [ { "type": "SALES_TAX", "rate": 7.5 } ],
  "terms": [ { "type": "PAYMENT", "text": "Net 30" } ]
}
```

Response 201:

```json
{ "id": "est_abc", "status": "DRAFT", "total": 1234.50, ... }
```

Line Items Bulk Add

```json
POST /api/estimates/est_abc/line-items
{ "items": [ { "name": "Labor", "quantity": 5, "unitPrice": 80 }, { "name": "Material", "quantity": 3, "unitPrice": 200 } ] }
```

Replace Terms

```json
PUT /api/estimates/est_abc/terms
{ "terms": [ { "type": "PAYMENT", "text": "Net 15" }, { "type": "WARRANTY", "text": "1 year" } ] }
```

Request Approval

```json
POST /api/estimates/est_abc/approvals
{ "note": "Need finance sign-off" }
```

Decision

```json
POST /api/estimates/est_abc/approvals/app_789/decision
{ "decision": "APPROVED", "reason": "Looks good." }
```

Upload Attachment (multipart form fields): `file`, optional `label`.

Bid Invitations

```json
POST /api/estimates/est_abc/bids/invitations
{ "emails": ["vendor1@example.com", "vendor2@example.com"] }
```

Bid Submission (vendor context)

```json
POST /api/estimates/est_abc/bids/submissions
{ "amount": 15000, "notes": "Can deliver in 6 weeks" }
```

### Diff Retrieval

`GET /api/estimates/est_abc/revisions/rev_2/diff/rev_1` → `RevisionDiffDTO`.

## 7. Service Method Signatures (TypeScript)

```ts
// services/estimating.service.ts
import { AxiosInstance } from "axios";
export interface EstimatingService {
  listEstimates(params: {
    page?: number;
    pageSize?: number;
    sort?: string;
    status?: string;
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Paginated<EstimateSummaryDTO>>;
  getEstimate(id: string): Promise<EstimateDetailDTO>;
  createEstimate(input: Partial<EstimateDetailDTO>): Promise<EstimateDetailDTO>;
  updateEstimate(
    id: string,
    patch: Partial<EstimateDetailDTO>,
    opts?: { etag?: string }
  ): Promise<EstimateDetailDTO>;
  deleteEstimate(id: string): Promise<void>;
  sendEstimate(
    id: string,
    payload?: { message?: string }
  ): Promise<EstimateDetailDTO>;
  duplicateEstimate(id: string): Promise<EstimateDetailDTO>;
  cancelEstimate(id: string, reason?: string): Promise<EstimateDetailDTO>;
  convertEstimate(
    id: string
  ): Promise<{ projectId: string; estimate: EstimateDetailDTO }>;

  addLineItems(
    estimateId: string,
    items: Omit<EstimateLineItemDTO, "id" | "total" | "position">[]
  ): Promise<EstimateDetailDTO>;
  updateLineItem(
    estimateId: string,
    itemId: string,
    patch: Partial<EstimateLineItemDTO>
  ): Promise<EstimateDetailDTO>;
  deleteLineItem(
    estimateId: string,
    itemId: string
  ): Promise<EstimateDetailDTO>;
  reorderLineItems(
    estimateId: string,
    orderedIds: string[]
  ): Promise<EstimateDetailDTO>;

  replaceTerms(
    estimateId: string,
    terms: Omit<EstimateTermDTO, "id">[]
  ): Promise<EstimateDetailDTO>;
  replaceDiscounts(
    estimateId: string,
    discounts: Omit<EstimateDiscountDTO, "id">[]
  ): Promise<EstimateDetailDTO>;
  replaceTaxes(
    estimateId: string,
    taxes: Omit<EstimateTaxDTO, "id" | "amount">[]
  ): Promise<EstimateDetailDTO>;

  listRevisions(estimateId: string): Promise<EstimateRevisionMetaDTO[]>;
  getRevisionSnapshot(
    estimateId: string,
    revId: string
  ): Promise<EstimateRevisionSnapshotDTO>;
  diffRevisions(
    estimateId: string,
    fromRev: string,
    toRev: string
  ): Promise<RevisionDiffDTO>;
  forceRevision(
    estimateId: string,
    note?: string
  ): Promise<EstimateRevisionMetaDTO>;

  requestApproval(
    estimateId: string,
    payload: { note?: string }
  ): Promise<EstimateApprovalDTO>;
  decideApproval(
    estimateId: string,
    approvalId: string,
    decision: {
      decision: "APPROVED" | "DECLINED" | "CANCELLED";
      reason?: string;
    }
  ): Promise<EstimateApprovalDTO>;

  listAttachments(estimateId: string): Promise<EstimateAttachmentDTO[]>;
  uploadAttachment(
    estimateId: string,
    file: File,
    meta?: { label?: string }
  ): Promise<EstimateAttachmentDTO>;
  deleteAttachment(estimateId: string, attachmentId: string): Promise<void>;

  listBids(estimateId: string): Promise<BidDTO[]>;
  inviteBidders(
    estimateId: string,
    emails: string[]
  ): Promise<BidInvitationDTO[]>;
  listBidInvitations(estimateId: string): Promise<BidInvitationDTO[]>;
  listBidSubmissions(estimateId: string): Promise<BidSubmissionDTO[]>;
  submitBid(
    estimateId: string,
    submission: { amount: number; notes?: string }
  ): Promise<BidSubmissionDTO>;
  resendBidInvitation(
    estimateId: string,
    invitationId: string
  ): Promise<BidInvitationDTO>;
}
```

## 8. cURL & Axios Examples

### Create Estimate

```bash
curl -X POST "$BASE/api/estimates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant-id: $TENANT" \
  -H "Content-Type: application/json" \
  -d '{"clientId":"cli_123","reference":"EST-2025-0001","currency":"USD","lineItems":[{"name":"Labor","quantity":5,"unitPrice":100}]}'
```

### Send Estimate

```bash
curl -X POST "$BASE/api/estimates/est_abc/send" -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT"
```

### Upload Attachment

```bash
curl -X POST "$BASE/api/estimates/est_abc/attachments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant-id: $TENANT" \
  -F file=@contract.pdf
```

### Axios Instance Pattern

```ts
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
api.interceptors.request.use((cfg) => {
  cfg.headers = {
    ...cfg.headers,
    Authorization: `Bearer ${getToken()}`,
    "x-tenant-id": getTenantId(),
    "x-correlation-id": crypto.randomUUID(),
  };
  return cfg;
});
```

### Retry Example (idempotent replace)

```ts
async function safeReplaceTerms(
  estId: string,
  terms: Omit<EstimateTermDTO, "id">[]
) {
  try {
    return await svc.replaceTerms(estId, terms);
  } catch (e: any) {
    if (
      e?.response?.status === 409 &&
      e.response.data.error.code === "CONFLICT"
    ) {
      // refetch then retry once
      await svc.getEstimate(estId);
      return svc.replaceTerms(estId, terms);
    }
    throw e;
  }
}
```

## 9. Retry & Idempotency Guidance

- GET: safe to retry.
- POST create: rely on backend generated IDs; if network error after timeout, client MAY GET list with temporary correlation or re-submit with idem-key (future enhancement header `Idempotency-Key`). Not implemented initially.
- PUT/Idempotent (replace terms/discounts/taxes): safe to retry.
- POST actions (send, duplicate, convert, cancel): NOT idempotent by default—consider Idempotency-Key in future.
- File uploads: do not retry automatically (risk duplicates); user-driven retry.

## 10. Assumptions & Open Questions

**Assumptions**

- Backend will supply ETag header (weak or strong) on GET detail for concurrency.
- Replace endpoints respond with updated `EstimateDetailDTO` or at least modified sections (assumed full detail for simplicity).
- Diff endpoint returns structured array; no HTML diff required.
- Bid submission auth may be via same JWT (internal) – vendor portal deferred.

**Open Questions**

- Should create / duplicate respond with `201 Location` header? (Assumed yes but not required by client.)
- Max pageSize? (Assumed 100.)
- Are partial PATCH updates allowed for nested arrays (line items) or only via dedicated endpoints? (Assumed dedicated endpoints.)
- Will rate limiting send `Retry-After` header? (Need confirmation.)

---

_End of ESTIMATING_API_CONTRACT.md_
