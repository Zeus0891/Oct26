# Estimating Module Frontend Blueprint

> Version: 0.1 • Target Stack: Next.js 14 (App Router) + TypeScript + Tailwind + Axios + Zustand + React Hook Form + Zod + Shadcn UI

## Table of Contents

1. Vision & Scope
2. Guiding Principles
3. Information Architecture
4. Feature Folder Structure (`features/estimating`)
5. App Router Routes (`app/(drawer)/estimating/*`)
6. Screens Overview
7. Components Overview
8. Forms Layer & Validation
9. Hooks & State Management
10. Services Layer
11. Types & DTO Mapping
12. Utilities
13. RBAC UI Mapping (Advisory Only)
14. Enum → UX Mapping (Badges, Filters, Actions)
15. Navigation & Interaction Flows
16. Build Order (MVP → Iterations)
17. Performance & UX Considerations
18. Testing Strategy
19. Non-Goals
20. Assumptions & Open Questions

---

## 1. Vision & Scope

Deliver a professional Estimating experience: create, refine, approve, send, and manage estimates and related bids. Frontend focuses on presentation, optimistic UX, and advisory visibility. All authoritative security, validation, state transitions, and business rules enforced by backend.

## 2. Guiding Principles

- Server = Source of Truth.
- Lean DTOs, no DB leakage.
- Incremental enhancement: start list → detail → edit flows → ancillary (approvals, bids, revisions, attachments).
- Predictable data hooks (query + mutation separation).
- Local ephemeral state via component state / RHF; cross-screen cached data via Zustand + React Query style pattern (if React Query not used, a lightweight custom cache in Zustand).
- Stateless UI components, state managed in hooks/forms.

## 3. Information Architecture

- Primary Entities: Estimate, EstimateRevision, EstimateLineItem, EstimateTerm, EstimateDiscount, EstimateTax, EstimateAttachment, EstimateApproval, Bid, BidInvitation, BidSubmission.
- Detail Page Tabs (Estimate): Overview | Items | Terms & Charges | Revisions | Approvals | Attachments | Bids | Activity.
- Secondary Panels: Modals/Drawers for add/edit operations (line items, discounts, taxes, approvals, invitations, uploads).

## 4. Feature Folder Structure (`features/estimating`)

```
features/estimating/
  screens/
    EstimatesListScreen.tsx
    EstimateDetailScreen/
      index.tsx
      OverviewTab.tsx
      ItemsTab.tsx
      TermsDiscountsTaxesTab.tsx
      RevisionsTab.tsx
      ApprovalsTab.tsx
      AttachmentsTab.tsx
      BidsTab.tsx
      ActivityTab.tsx
    EstimateCreateScreen.tsx
    EstimateEditScreen.tsx
    EstimateBidsScreen.tsx (aggregate view of bids across estimates optional phase 2)
  components/
    EstimateHeader.tsx
    StatusBadge.tsx
    LineItemsGrid.tsx
    LineItemRow.tsx
    TotalsCard.tsx
    TermsEditor.tsx
    DiscountsEditor.tsx
    TaxesEditor.tsx
    RevisionTimeline.tsx
    RevisionsDiffViewer.tsx
    ApprovalsTimeline.tsx
    AttachmentsList.tsx
    BidsTable.tsx
    ActivityFeed.tsx
    EmptyState.tsx
    PaginationBar.tsx
    SearchBar.tsx
    Toolbar.tsx
  forms/
    EstimateForm.tsx
    LineItemForm.tsx
    TermsForm.tsx
    DiscountForm.tsx
    TaxForm.tsx
    ApprovalRequestForm.tsx
    ApprovalDecisionForm.tsx
    BidInvitationForm.tsx
    BidSubmissionForm.tsx (if needed client-side; otherwise view only)
  modals/
    SelectClientModal.tsx
    AddLineItemDrawer.tsx
    ApplyDiscountModal.tsx
    ApplyTaxModal.tsx
    EditTermsModal.tsx
    UploadAttachmentModal.tsx
    RequestApprovalModal.tsx
    ApprovalDecisionModal.tsx
    SendEstimateModal.tsx
    InviteBiddersModal.tsx
  hooks/
    useEstimates.ts
    useEstimate.ts
    useEstimateMutations.ts
    useRevisions.ts
    useApprovals.ts
    useAttachments.ts
    useBids.ts
  services/
    estimating.service.ts
  types/
    estimating.types.ts
  utils/
    money.ts
    taxes.ts
    discounts.ts
    status.ts
    formatting.ts
```

## 5. App Router Routes (`app/(drawer)/estimating/*`)

Each route page simply imports and re-exports a Screen component.

```
app/(drawer)/estimating/page.tsx                     -> EstimatesListScreen
app/(drawer)/estimating/create/page.tsx              -> EstimateCreateScreen
app/(drawer)/estimating/[estimateId]/page.tsx        -> EstimateDetailScreen (default tab Overview)
app/(drawer)/estimating/[estimateId]/edit/page.tsx   -> EstimateEditScreen
app/(drawer)/estimating/[estimateId]/bids/page.tsx   -> EstimateDetailScreen (BidsTab preselected) OR EstimateBidsScreen
app/(drawer)/estimating/bids/page.tsx                -> EstimateBidsScreen (optional)
```

Tab state handled via search param `?tab=overview|items|charges|revisions|approvals|attachments|bids|activity` to allow deep linking without nested routes complexity.

## 6. Screens Overview

- EstimatesListScreen: searchable, filterable (status, date range, client), bulk actions (delete, send) – conditionally visible via RBAC.
- EstimateCreateScreen: multi-step or single form (client selection, line items inline creation minimal). Save as Draft.
- EstimateDetailScreen: composed tabs, header with primary actions (Edit, Send, Duplicate, Request Approval, Convert, Cancel) depending on status & RBAC.
- EstimateEditScreen: similar to create but prefilled and constrained by status (cannot edit after APPROVED except Allowed fields?). Backend authoritative.
- EstimateBidsScreen: cross-estimate summary (phase 2).

## 7. Components Overview

- StatusBadge: enum → color + label mapping.
- LineItemsGrid: virtualized if large; supports inline quantity/price edits in edit mode (optimistic disabled unless simple fields).
- RevisionTimeline + RevisionsDiffViewer: show revision metadata & field diffs (server provides diff payload to avoid re-implementing diff logic on client; fallback naive deep diff util only if needed).
- ApprovalsTimeline: chronological decisions with avatars/time.
- AttachmentsList: list + upload + remove; uses UploadAttachmentModal (multipart) + progress state.
- BidsTable: show invitations, status, submissions; action buttons conditionally visible.

## 8. Forms Layer & Validation

Use React Hook Form + Zod schemas exporting both `schema` and `infer` types. Forms gather only necessary DTO fields (e.g., `EstimateForm` excludes computed totals). Inline editors (line items) reuse `LineItemForm` schema.

Example (conceptual):

```ts
// forms/schemas.ts
import { z } from "zod";
export const lineItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  taxRateId: z.string().optional(),
});
export type LineItemInput = z.infer<typeof lineItemSchema>;

export const estimateSchema = z.object({
  clientId: z.string(),
  reference: z.string().min(1),
  currency: z.string().length(3),
  issueDate: z.string(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema),
  discounts: z
    .array(
      z.object({
        type: z.enum([
          "PERCENTAGE",
          "FIXED_AMOUNT",
          "VOLUME",
          "EARLY_PAYMENT",
          "PROMOTIONAL",
          "NONE",
        ]),
        value: z.number().nonnegative(),
      })
    )
    .optional(),
  taxes: z
    .array(
      z.object({
        type: z.enum(["SALES_TAX", "VAT", "GST", "CUSTOM", "NONE"]),
        rate: z.number().nonnegative(),
      })
    )
    .optional(),
  terms: z
    .array(
      z.object({
        type: z.enum([
          "PAYMENT",
          "DELIVERY",
          "WARRANTY",
          "CANCELLATION",
          "SCOPE",
          "LIABILITY",
          "COMPLIANCE",
        ]),
        text: z.string().min(1),
      })
    )
    .optional(),
});
export type EstimateInput = z.infer<typeof estimateSchema>;
```

## 9. Hooks & State Management

Each `useX` hook encapsulates fetch (Axios) + caching (Zustand store or SWR-like pattern). Pattern:

```ts
// hooks/useEstimate.ts
export function useEstimate(id: string) {
  const { getEstimate, estimatesById, loading, error } = useEstimatingStore();
  useEffect(() => {
    getEstimate(id);
  }, [id]);
  return { estimate: estimatesById[id], loading, error };
}
```

`useEstimateMutations` groups create/update/delete actions returning promise + local optimistic patch callback (only for simple fields; rely on server responses for authoritative recalculations like totals).

## 10. Services Layer

`estimating.service.ts` centralizes REST calls, attaching headers (`Authorization`, `x-tenant-id`, optional `x-correlation-id`). All methods return typed DTO promises.

## 11. Types & DTO Mapping

`estimating.types.ts` defines frontend DTOs (avoid leaking internal DB columns like `deleted_at`). Key types: `EstimateSummary`, `EstimateDetail`, `EstimateLineItem`, `EstimateRevisionMeta`, `EstimateApproval`, `EstimateAttachment`, `Bid`, `BidInvitation`, `BidSubmission`.

## 12. Utilities

- `money.ts`: formatMoney, sumLineItems, applyDiscounts, applyTaxes (pure, for UI previews only; backend returns authoritative totals).
- `taxes.ts`, `discounts.ts`: derive effective amounts; guard rails to avoid client misalignment (display only).
- `status.ts`: mapping between statuses and labels, colors, action availability.
- `formatting.ts`: date/time, reference codes.

## 13. RBAC UI Mapping (Advisory Only)

| Action/Button                | Permission Key (proposed)     | Visibility Logic (AND status)                           |
| ---------------------------- | ----------------------------- | ------------------------------------------------------- |
| Create Estimate              | estimating.create             | Always visible if permission                            |
| Edit Estimate                | estimating.update             | Status in [DRAFT, SENT, VIEWED, CLIENT_DECLINED]        |
| Send Estimate                | estimating.send               | Status == DRAFT                                         |
| Duplicate Estimate           | estimating.duplicate          | Any non-CANCELLED                                       |
| Delete Estimate              | estimating.delete             | Status in [DRAFT]                                       |
| Request Approval             | estimating.approvals.request  | Status in [DRAFT, SENT] and no pending approval         |
| Approve / Decline (internal) | estimating.approvals.decide   | Status in [PENDING via approval workflow]               |
| Add Line Item                | estimating.update             | Status in editable set                                  |
| Upload Attachment            | estimating.attachments.upload | Any except CANCELLED/ARCHIVED                           |
| Remove Attachment            | estimating.attachments.delete | Same + user is uploader (server authoritative)          |
| Invite Bidders               | estimating.bids.invite        | Status in [DRAFT, SENT, VIEWED]                         |
| Submit Bid (vendor view)     | bids.submit                   | BidStatus == OPEN                                       |
| Convert to Project           | estimating.convert            | Status == APPROVED                                      |
| Cancel Estimate              | estimating.cancel             | Status not in [CANCELLED, APPROVED, CONVERTED, EXPIRED] |

`<RoleGuard perms={["estimating.update"]}>...</RoleGuard>` wraps components; never blocks navigation; absence hides control.

## 14. Enum → UX Mapping (Badges, Filters, Actions)

### EstimateStatus

| Status          | Color   | Badge Variant | Primary Allowed Actions (UI)                                           |
| --------------- | ------- | ------------- | ---------------------------------------------------------------------- |
| DRAFT           | slate   | outline       | Edit, Send, Request Approval, Delete, Duplicate                        |
| SENT            | blue    | default       | Edit, Request Approval, Duplicate, Cancel                              |
| VIEWED          | indigo  | default       | Edit, Request Approval, Duplicate, Cancel                              |
| CLIENT_APPROVED | emerald | default       | Request Internal Approval, Convert (if internally Approved), Duplicate |
| CLIENT_DECLINED | rose    | outline       | Edit (revise), Duplicate                                               |
| APPROVED        | green   | solid         | Convert, Duplicate                                                     |
| DECLINED        | red     | solid         | Duplicate                                                              |
| CONVERTED       | violet  | solid         | Duplicate (read-only)                                                  |
| EXPIRED         | orange  | outline       | Duplicate                                                              |
| CANCELLED       | gray    | secondary     | Duplicate                                                              |

### EstimateApprovalDecision

| Decision  | Color  | Icon     | Next UI State                 |
| --------- | ------ | -------- | ----------------------------- |
| PENDING   | amber  | clock    | Show spinner / awaiting badge |
| APPROVED  | green  | check    | Mark approved timeline entry  |
| DECLINED  | red    | x        | Show decline reason tooltip   |
| CANCELLED | gray   | dash     | Mark inactive                 |
| ESCALATED | purple | arrow-up | Flag escalation badge         |

### Bid / Invitations / Submissions

Similar mapping with neutral / state color coding. Use consistent palette (OPEN blue, AWARDED green, CANCELLED gray, CLOSED slate, REJECTED red, EXPIRED orange).

## 15. Navigation & Interaction Flows

- Create → Draft saved → redirect to Detail (Overview).
- Send action triggers `SendEstimateModal` (confirm & optional email notes) → POST send endpoint → status updates to SENT.
- Approvals: Request creates pending approval entries; timeline updates; decision modal posts decision.
- Revisions: Editing after SENT may create a new revision (server returns new revision id & diff summary) → RevisionsTab updates.
- Bids: Invite bidders modal collects vendor emails → server creates invitations → Invitations appear in BidsTab.

## 16. Build Order (MVP → Iterations)

1. Scaffolding: folder structure, service placeholder, types, basic routes.
2. EstimatesListScreen (list + filters minimal + create button).
3. Create + Detail (Overview only) with header actions (Draft / Send).
4. Items & Charges (LineItemsGrid, Discounts, Taxes, Terms).
5. Edit Screen path + duplication.
6. Attachments (upload/list/delete).
7. Approvals (request + timeline) & status badges.
8. Revisions (timeline + diff viewer) after edit flow stable.
9. Bids (invitations + submissions view).
10. Activity feed (optional aggregation of events) + final polish.

## 17. Performance & UX Considerations

- Lazy load heavy tabs (dynamic import with suspense) when user switches tabs.
- Virtualize line item table if > 100 rows (react-virtualized or lightweight custom). Phase 2.
- Debounced search & filter queries.
- Avoid over-optimistic updates for financial totals; rely on server recalculation response.
- Upload progress with `XMLHttpRequest` or Axios `onUploadProgress`.

## 18. Testing Strategy

- Component tests: status badge mapping, forms validation.
- Integration tests: create → send, edit → revision created, request approval → approval appears.
- Mock service layer (Jest) with deterministic fixtures.
- Visual regression (Storybook stories for core components) optional later.

## 19. Non-Goals

- Client-side RBAC enforcement (display only).
- Client-side complex tax/discount authoritative calculations (display estimates only).
- Offline mode.
- Vendor portal UI (beyond internal viewing) Phase 2.

## 20. Assumptions & Open Questions

**Assumptions**

- Server provides diff payloads for revisions and computed totals.
- `x-tenant-id` always required and provided via user session context.
- Approvals workflow single-level; escalation is server-driven.
- Send action triggers server email dispatch.

**Open Questions**

- Are partial approvals (line-item level) required? (Assumed No initially)
- Should editing after APPROVED create a new revision or disallow? (Assumed disallow except notes)
- Do bids require real-time updates (WebSocket)? (Assumed polling for MVP)
- Max attachment file size & allowed MIME types? (Need backend confirmation)

---

_End of FRONTEND_BLUEPRINT.md_
