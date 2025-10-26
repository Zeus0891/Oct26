# ERP Architecture Index

Last updated: 2025-10-23

This index centralizes canonical architecture documentation and module-level READMEs for quick navigation.

## Canonical references

- ERP Module Structure (canonical): ./ERP_MODULE_STRUCTURE.md
- ERP Enums Reference (canonical): ./ERP_ENUMS_REFERENCE.md
- Backend Platform README: ../../README.md
- Core Infrastructure README: ../../src/core/README.md
- Core Infrastructure Deep Dive: ../../src/core/CORE_INFRASTRUCTURE_DOCUMENTATION.md

## Module READMEs

Links to module documentation in Backend/src/features.

| Module                                 | README                                      | Notes                                                  |
| -------------------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| Tenant / Platform                      | ../../src/features/tenant/README.md         | Tenant lifecycle, numbering, events, audit             |
| Identity                               | ../../src/features/identity/README.md       | Global users, tenant sessions, IdP connections         |
| Access Control (RBAC & Delegations)    | ../../src/features/access-control/README.md | Roles, permissions, delegations, service accounts      |
| CRM                                    | ../../src/features/crm/README.md            | Accounts, contacts, pipeline, quotes, contracts        |
| Estimating & Sales                     | ../../src/features/estimating/README.md     | Estimates, revisions, approvals, bids                  |
| Projects & Operations                  | ../../src/features/projects/README.md       | Tasks, RFIs, submittals, inspections, schedules        |
| Change Orders                          | ../../src/features/changeOrders/README.md   | Scope deltas, approvals, lineage to billing            |
| Billing / Accounts Receivable          | ../../src/features/billing/README.md        | Invoices, schedules, taxes, dunning, credits           |
| Payments                               | ../../src/features/payments/README.md       | Cash application, refunds, chargebacks, reconciliation |
| Procurement / Accounts Payable         | ../../src/features/procurement/README.md    | Vendors, RFQs, POs, receipts, AP bills                 |
| Inventory & Assets (incl. Zero‑Loss)   | ../../src/features/inventory/README.md      | Items, locations, transactions, custody chain          |
| HR / Workforce                         | ../../src/features/hrWorkforce/README.md    | People, positions, org units, compensation, leave      |
| Time & Payroll                         | ../../src/features/timePayroll/README.md    | Timesheets, approvals, payroll runs, statements        |
| Approvals & Controls                   | ../../src/features/approvals/README.md      | Rules, requests, decisions, reason codes               |
| Analytics & Reporting                  | ../../src/features/analytics/README.md      | KPIs, dashboards, snapshot cubes, exports              |
| AI & Automation                        | ../../src/features/ai/README.md             | Prompts, jobs, insights, embeddings, playbooks         |
| Privacy & Compliance (Access Firewall) | ../../src/features/compliance/README.md     | DSAR/erasure, legal holds, external data policies      |
| Notifications & Webhooks               | ../../src/features/notifications/README.md  | Templates, preferences, deliveries, webhooks           |
| Integrations (incl. Weather)           | ../../src/features/integrations/README.md   | Providers, connectors, mappings, sync jobs             |
| Spatial Intelligence (RoomScan)        | ../../src/features/room-plan/README.md      | Scan sessions, processing, models, exports             |

## Tips

- Start with ERP Module Structure for model ownership and boundaries.
- Use the Enums Reference to find authoritative enum ownership by domain.
- Each module README includes Canonical Alignment, Enums, Dependencies, and Cross‑References.
