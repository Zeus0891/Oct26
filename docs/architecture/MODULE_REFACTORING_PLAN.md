# RECOMMENDED ERP MODULE REFACTORING

## Current Issues Found:

### 1. CRM Module Domain Mixing

- **Problem**: Sales pipeline, pricing, contracts, and territories mixed together
- **Impact**: Tight coupling, difficult to maintain pricing logic separately
- **Solution**: Split into 4 focused modules

### 2. HRWorkforce Module Too Broad

- **Problem**: People data, org structure, compensation, performance, and leave all mixed
- **Impact**: Violates single responsibility, makes HR changes risky
- **Solution**: Split into 5 focused modules

### 3. Projects Module Overly Complex

- **Problem**: Project management, construction, financials, and resources all mixed
- **Impact**: Massive module that's difficult to test and maintain
- **Solution**: Split into 4 focused modules

### 4. Inventory/Asset Management Mixed

- **Problem**: Inventory operations mixed with capital asset management
- **Impact**: Different business rules and lifecycles inappropriately coupled
- **Solution**: Separate into inventory vs assetManagement

### 5. Generic Dependencies Everywhere

- **Problem**: Every module says "Feeds Projects and Billing; uses Approvals and Compliance"
- **Impact**: No clear dependency graph, potential for circular dependencies
- **Solution**: Map specific dependencies per business flow

## Recommended New Module Structure:

```
📦 Core Platform (4 modules)
├── tenant (infrastructure)
├── identity (authentication) ✅ Already clean
├── access-control (authorization) ✅ Already clean
└── audit (compliance & audit trails)

📦 People & Organization (5 modules)
├── people (person registry)
├── organization (org structure)
├── compensation (pay & benefits)
├── performance (reviews & goals)
└── leaveManagement (time off)

📦 Customer Lifecycle (4 modules)
├── crm (sales pipeline)
├── pricing (price management)
├── contracts (contract lifecycle)
└── territories (sales geography)

📦 Operations (6 modules)
├── projects (core project management)
├── construction (construction operations)
├── inventory (inventory operations)
├── assetManagement (capital assets)
├── procurement (vendor & purchasing)
└── resourcePlanning (resource allocation)

📦 Financial (4 modules)
├── estimating (quotes & bids)
├── billing (invoicing)
├── payments (cash management)
├── projectFinancials (project finance)
├── financialLedgerTax (accounting core)
└── expenseManagement (employee expenses)

📦 Workflow & Intelligence (6 modules)
├── approvals (approval engine) ✅ Already clean
├── workflows (business processes)
├── fraudShield (security controls) ✅ Already clean
├── ai (AI/ML operations) ✅ Already clean
├── analytics (reporting & BI) ✅ Already clean
└── profitabilityForecasting (forecasting) ✅ Already clean

📦 Infrastructure & Integration (8 modules)
├── integrations (integration platform)
├── weatherServices (weather intelligence)
├── messaging (internal comms) ✅ Already clean
├── notifications (external comms) ✅ Already clean
├── documentManagement (file management) ✅ Already clean
├── eSignature (digital signing) ✅ Already clean
├── mobileSync (offline sync) ✅ Already clean
└── observabilityJobs (system operations) ✅ Already clean

📦 Compliance & Security (4 modules)
├── security (security operations)
├── privacyCompliance (GDPR compliance) ✅ Already clean
├── accessFirewall (external security) ✅ Already clean
└── dataLineageGovernance (audit trails) ✅ Already clean

📦 Specialized (3 modules)
├── timePayroll (time & payroll) ✅ Already clean
├── room-plan (spatial processing) ✅ Already clean
└── settingsCatalogs (global catalogs) ✅ Already clean
```

## Implementation Priority:

**Phase 1 (High Impact, Low Risk)**:

1. Split HRWorkforce → 5 modules
2. Split CRM → 4 modules
3. Split Inventory → 2 modules

**Phase 2 (High Impact, High Risk)**: 4. Split Projects → 4 modules 5. Create missing modules (audit, security, workflows)

**Phase 3 (Cleanup)**: 6. Fix all dependency declarations 7. Validate no circular dependencies 8. Update documentation

This refactoring will result in 39 focused modules instead of 32 mixed-domain modules.
