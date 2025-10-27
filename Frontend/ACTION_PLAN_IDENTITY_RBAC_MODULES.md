# 📋 ACTION PLAN: FRONTEND IDENTITY + RBAC MODULES

## 🎯 **Executive Summary**

**Mission:** Crear módulos Identity y RBAC en el frontend que se alineen perfectamente con la arquitectura backend, manteniendo una separación clara entre operaciones globales (Identity) y tenant-scoped (RBAC), sin lógica de seguridad real en frontend.

**Audit Status:** ✅ Backend completamente auditado  
**Frontend Status:** 🔄 Limpio y listo para implementación  
**Alignment Goal:** 100% sincronización con backend architecture

---

## 🔍 **BACKEND AUDIT FINDINGS**

### **✅ Identity Module (Backend)**

✅ STRUCTURE COMPLETA:
└── /features/identity/
├── controllers/ (7 controllers)
├── routes/ (7 route files)
├── services/ (7 services)
├── types/ (673 lines of types)
├── validators/ (validation schemas)
└── utils/ (password, mfa, session utils)

✅ ARCHITECTURE PATTERNS:

- Global operations (User, AuthFactor, PasswordResetToken)
- Session-based tenant bridging
- JWT + MFA + Device registration
- Comprehensive audit trail

✅ API ENDPOINTS STRUCTURE:
🌐 GLOBAL (No RLS): /api/identity/_
├── /users (registration, profile)
├── /auth/_ (login, refresh, validate)
├── /password/_ (reset flow)
└── /mfa/_ (totp setup, verify)
🔒 TENANT-SCOPED: /api/identity/_ (with tenant context)
├── /users/_ (tenant user management)
└── /sessions/\* (tenant session management)

```

### **✅ RBAC Module (Backend)**

✅ STRUCTURE COMPLETA:
└── /features/rbac/
    ├── controllers/ (6 controllers)
    ├── routes/ (6 route files)
    ├── services/ (delegation, permissions)
    ├── types/ (comprehensive RBAC types)
    └── validators/ (role/permission validation)

✅ RBAC.schema.v7.yml ANALYSIS:
- 5 roles: ADMIN, PROJECT_MANAGER, FINANCE_MANAGER, WORKER, VIEWER
- 18+ domains (tenant_management, identity_access, etc.)
- 1652+ granular permissions (Model.action format)
- Full tenant isolation with sandbox support

✅ API ENDPOINTS STRUCTURE:
🔒 ALL TENANT-SCOPED: /api/rbac/*
   ├── /members/* (tenant user-role management)
   ├── /roles/* (tenant role definitions)
   ├── /permissions/* (permission assignments)
   └── /me/* (current user permissions/roles)
```

---

## 🎯 **FRONTEND ARCHITECTURE PLAN**

### **📁 Proposed Directory Structure**

```
Frontend/
├── features/
│   ├── identity/                    # 🆕 GLOBAL IDENTITY MODULE
│   │   ├── components/
│   │   │   ├── forms/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   ├── MfaSetupForm.tsx
│   │   │   │   ├── MfaVerifyForm.tsx
│   │   │   │   ├── PasswordResetForm.tsx
│   │   │   │   ├── PasswordChangeForm.tsx
│   │   │   │   ├── DeviceRegistrationForm.tsx
│   │   │   │   └── ProfileUpdateForm.tsx
│   │   │   ├── guards/
│   │   │   │   ├── AuthGuard.tsx           # Base authentication
│   │   │   │   └── SessionGuard.tsx        # Session validation
│   │   │   ├── providers/
│   │   │   │   ├── IdentityProvider.tsx    # Identity context
│   │   │   │   └── SessionProvider.tsx     # Session management
│   │   │   └── ui/
│   │   │       ├── UserAvatar.tsx
│   │   │       ├── SessionStatus.tsx
│   │   │       ├── MfaStatus.tsx
│   │   │       └── DeviceList.tsx
│   │   ├── hooks/
│   │   │   ├── useIdentity.ts              # Main identity hook
│   │   │   ├── useSession.ts               # Session management
│   │   │   ├── useMfa.ts                   # MFA operations
│   │   │   ├── usePasswordReset.ts         # Password reset flow
│   │   │   ├── useDevices.ts               # Device management
│   │   │   └── useProfile.ts               # User profile
│   │   ├── services/
│   │   │   ├── identity.service.ts         # Core identity API calls
│   │   │   ├── session.service.ts          # Session API calls
│   │   │   ├── mfa.service.ts              # MFA API calls
│   │   │   ├── password.service.ts         # Password API calls
│   │   │   ├── device.service.ts           # Device API calls
│   │   │   └── profile.service.ts          # Profile API calls
│   │   ├── stores/
│   │   │   ├── identityStore.ts            # Zustand identity state
│   │   │   ├── sessionStore.ts             # Session state
│   │   │   └── profileStore.ts             # User profile state
│   │   ├── types/
│   │   │   ├── identity.types.ts           # Identity types
│   │   │   ├── session.types.ts            # Session types
│   │   │   ├── mfa.types.ts                # MFA types
│   │   │   ├── device.types.ts             # Device types
│   │   │   └── profile.types.ts            # Profile types
│   │   ├── validators/
│   │   │   ├── identity.validators.ts      # Identity validation
│   │   │   ├── session.validators.ts       # Session validation
│   │   │   ├── mfa.validators.ts           # MFA validation
│   │   │   ├── password.validators.ts      # Password validation
│   │   │   └── profile.validators.ts       # Profile validation
│   │   └── utils/
│   │       ├── session.utils.ts            # Session helpers
│   │       ├── token.utils.ts              # JWT helpers
│   │       ├── mfa.utils.ts                # MFA helpers
│   │       └── device.utils.ts             # Device helpers
│   │
│   └── rbac/                        # 🆕 TENANT-SCOPED RBAC MODULE
│       ├── components/
│       │   ├── guards/
│       │   │   ├── RoleGuard.tsx           # Role-based UI protection
│       │   │   ├── PermissionGuard.tsx     # Permission-based UI protection
│       │   │   ├── TenantGuard.tsx         # Tenant context protection
│       │   │   └── ConditionalGuard.tsx    # Custom condition protection
│       │   ├── forms/
│       │   │   ├── RoleAssignmentForm.tsx
│       │   │   ├── PermissionForm.tsx
│       │   │   └── MemberRoleForm.tsx
│       │   └── ui/
│       │       ├── RoleBadge.tsx           # Role display component
│       │       ├── PermissionList.tsx      # Permission list component
│       │       ├── RoleSelector.tsx        # Role selection component
│       │       └── PermissionMatrix.tsx    # Permission matrix display
│       ├── hooks/
│       │   ├── useRbac.ts                  # Main RBAC hook
│       │   ├── useRoles.ts                 # Role management
│       │   ├── usePermissions.ts           # Permission management
│       │   ├── useMembers.ts               # Member management
│       │   └── useTenantContext.ts         # Tenant context
│       ├── services/
│       │   ├── rbac.service.ts             # RBAC API calls
│       │   ├── roles.service.ts            # Roles API calls
│       │   ├── permissions.service.ts      # Permissions API calls
│       │   └── members.service.ts          # Members API calls
│       ├── stores/
│       │   ├── rbacStore.ts                # Zustand RBAC state
│       │   ├── rolesStore.ts               # Roles state
│       │   └── permissionsStore.ts         # Permissions state
│       ├── types/
│       │   ├── rbac.types.ts               # Manual RBAC types
│       │   ├── rbac.generated.ts           # 🤖 AUTO-GENERATED from schema v7
│       │   └── rbac.generation.json        # Generation metadata
│       ├── validators/
│       │   ├── rbac.validators.ts          # RBAC validation
│       │   ├── role.validators.ts          # Role validation
│       │   └── permission.validators.ts    # Permission validation
│       ├── utils/
│       │   ├── rbac.utils.ts               # RBAC helpers
│       │   ├── permission.utils.ts         # Permission helpers
│       │   └── role.utils.ts               # Role helpers
│       └── scripts/                # 🤖 AUTO-GENERATION SYSTEM
│           ├── generate-rbac-types.js      # Generate types from schema v7
│           ├── watch-rbac-schema.js        # Watch schema for changes
│           └── validate-rbac-sync.js       # Validate frontend-backend sync
│
├── context/                         # 🔄 UPDATED CONTEXTS
│   ├── IdentityContext.tsx                 # Renamed from AuthContext
│   ├── RbacContext.tsx                     # New RBAC context
│   ├── SessionContext.tsx                  # Session-specific context
│   └── TenantContext.tsx                   # Tenant context
│
├── components/                      # 🔄 UPDATED LAYOUTS
│   └── layouts/
│       ├── IdentityLayout.tsx              # Renamed from AuthLayout
│       ├── DashboardLayout.tsx             # Updated with RBAC guards
│       └── TenantLayout.tsx                # Tenant-aware layout
│
└── app/                            # 🔄 UPDATED ROUTES
    ├── (identity)/                         # Renamed from (auth)
    │   ├── layout.tsx                      # Identity-specific layout
    │   ├── login/page.tsx                  # Login page
    │   ├── register/page.tsx               # Registration page
    │   ├── mfa-setup/page.tsx              # MFA setup page
    │   ├── mfa-verify/page.tsx             # MFA verification page
    │   ├── password-reset/page.tsx         # Password reset request
    │   ├── password-reset/
    │   │   └── [token]/page.tsx            # Password reset confirmation
    │   ├── device-setup/page.tsx           # Device registration
    │   └── profile/page.tsx                # User profile management
    │
    └── (dashboard)/                        # Tenant-scoped routes
        ├── layout.tsx                      # RbacProvider + guards
        ├── admin/                          # Admin-only routes
        ├── projects/                       # Project management routes
        └── settings/                       # Tenant settings routes
```

---

## 🔧 **IMPLEMENTATION PHASES**

### **PHASE 1: Identity Module Foundation**

**Duration:** 2-3 days  
**Priority:** 🔴 CRITICAL

#### **1.1 Core Types & Services**

```typescript
// Phase 1A: Type System
✅ identity.types.ts     - Core identity types aligned with backend
✅ session.types.ts      - Session management types
✅ mfa.types.ts         - MFA types matching backend enums
✅ profile.types.ts     - User profile types

// Phase 1B: API Services
✅ identity.service.ts   - API client for identity endpoints
✅ session.service.ts    - Session management API calls
✅ mfa.service.ts       - MFA API integration
✅ password.service.ts  - Password reset API calls
```

#### **1.2 Core Hooks & State**

```typescript
// Phase 1C: State Management
✅ useIdentity.ts       - Main identity hook
✅ useSession.ts        - Session management hook
✅ identityStore.ts     - Zustand store for identity state
✅ sessionStore.ts      - Session state management
```

#### **1.3 Authentication Guards**

```typescript
// Phase 1D: Protection Components
✅ AuthGuard.tsx        - Base authentication guard
✅ SessionGuard.tsx     - Session validation guard
✅ IdentityProvider.tsx - Context provider
```

### **PHASE 2: RBAC Module Foundation**

**Duration:** 2-3 days
**Priority:** 🔴 CRITICAL

#### **2.1 Auto-Generated Type System**

```bash
# Phase 2A: Schema Integration
✅ Setup rbac schema copy/sync from backend
✅ Create generate-rbac-types.js script
✅ Generate rbac.generated.ts (1652+ permissions)
✅ Setup watch system for schema changes
```

#### **2.2 RBAC Guards & Components**

```typescript
// Phase 2B: Guard System
✅ RoleGuard.tsx        - Role-based UI protection
✅ PermissionGuard.tsx  - Permission-based UI protection
✅ useRbac.ts          - Main RBAC hook
✅ rbacStore.ts        - RBAC state management
```

#### **2.3 RBAC API Integration**

```typescript
// Phase 2C: API Services
✅ rbac.service.ts      - RBAC API client
✅ roles.service.ts     - Roles management
✅ permissions.service.ts - Permissions management
```

### **PHASE 3: Context Integration**

**Duration:** 1-2 days  
**Priority:** 🟡 HIGH

#### **3.1 Context Refactoring**

```typescript
// Phase 3A: Context Updates
✅ Rename AuthContext → IdentityContext
✅ Create RbacContext for permissions/roles
✅ Create SessionContext for session management
✅ Update imports throughout application
```

#### **3.2 Layout Updates**

```typescript
// Phase 3B: Layout Integration
✅ Update AuthLayout → IdentityLayout
✅ Add RBAC guards to DashboardLayout
✅ Create TenantLayout for tenant-aware components
✅ Update route protection logic
```

### **PHASE 4: Forms & UI Components**

**Duration:** 2-3 days
**Priority:** 🟢 MEDIUM

#### **4.1 Identity Forms**

```typescript
// Phase 4A: Form Components
✅ LoginForm.tsx        - Enhanced login with MFA
✅ SignupForm.tsx       - User registration
✅ MfaSetupForm.tsx     - MFA enrollment
✅ PasswordResetForm.tsx - Password reset flow
✅ DeviceRegistrationForm.tsx - Device registration
```

#### **4.2 RBAC UI Components**

```typescript
// Phase 4B: RBAC Components
✅ RoleBadge.tsx        - Role display
✅ PermissionList.tsx   - Permission display
✅ PermissionMatrix.tsx - Permission matrix view
✅ RoleSelector.tsx     - Role assignment UI
```

### **PHASE 5: Route Updates & Testing**

**Duration:** 1-2 days
**Priority:** 🟢 MEDIUM

#### **5.1 Route Structure**

```bash
# Phase 5A: Route Refactoring
✅ Rename app/(auth) → app/(identity)
✅ Add new identity routes (mfa, device, profile)
✅ Update dashboard routes with RBAC guards
✅ Update middleware.ts for new structure
```

#### **5.2 Integration Testing**

```bash
# Phase 5B: Testing & Validation
✅ Test identity flows (login, mfa, password reset)
✅ Test RBAC guards with real user permissions
✅ Validate auto-generation system
✅ Test session management across tenants
```

---

## 🎯 **KEY INTEGRATION POINTS**

### **🔗 Identity ↔ RBAC Bridge**

```typescript
// session.service.ts - The Bridge Between Global & Tenant
interface SessionData {
  // Identity info (global)
  user: UserProfile;
  accessToken: string;

  // RBAC info (tenant-scoped)
  tenantId: string;
  roles: Role[];
  permissions: Permission[];
  member: MemberProfile;
}

// Usage in components
const { user } = useIdentity(); // Global identity
const { roles, hasPermission } = useRbac(); // Tenant RBAC
```

### **🛡️ Guard Integration Pattern**

```typescript
// Nested guard protection
<AuthGuard>                    {/* Identity: Must be logged in */}
  <TenantGuard>               {/* RBAC: Must have tenant context */}
    <RoleGuard roles={['ADMIN', 'PROJECT_MANAGER']}>
      <PermissionGuard permission="Project.create">
        <CreateProjectButton />
      </PermissionGuard>
    </RoleGuard>
  </TenantGuard>
</AuthGuard>
```

### **📡 API Integration Pattern**

```typescript
// Service integration with proper headers
class IdentityService {
  // Global operations - no tenant header
  async login(credentials: LoginRequest) {
    return this.apiClient.post("/api/identity/auth/login", credentials);
  }
}

class RbacService {
  // Tenant-scoped operations - include tenant header
  async getUserRoles(userId: string) {
    return this.apiClient.get(`/api/rbac/users/${userId}/roles`, {
      headers: { "X-Tenant-Id": getCurrentTenantId() },
    });
  }
}
```

---

## 🚀 **EXPECTED OUTCOMES**

### **✅ Alignment Goals**

- **100% API Compatibility** with backend Identity + RBAC modules
- **Type Safety** with auto-generated RBAC types from schema v7
- **Zero Security Logic** in frontend (pure UX/UI protection)
- **Seamless Developer Experience** with comprehensive guards
- **Maintainable Architecture** with clear separation of concerns

### **✅ Performance Targets**

- **< 100ms** guard evaluation time
- **< 200ms** permission lookup time
- **< 50KB** bundle size per module
- **90%+** TypeScript coverage
- **Zero** runtime permission errors

### **✅ Developer Experience**

- **Auto-completion** for all roles and permissions
- **Compile-time validation** of RBAC usage
- **Hot-reload** support for schema changes
- **Comprehensive documentation** and examples
- **Easy testing** with mock providers

---

## 🎯 **SUCCESS CRITERIA**

| Criteria            | Target    | Validation Method                   |
| ------------------- | --------- | ----------------------------------- |
| **API Alignment**   | 100%      | All endpoints match backend routes  |
| **Type Safety**     | 90%+      | TypeScript strict mode passes       |
| **Auto-Generation** | Real-time | Schema changes trigger regeneration |
| **Guard Coverage**  | 100%      | All protected routes have guards    |
| **Performance**     | < 200ms   | Guard evaluation benchmarks         |
| **Documentation**   | 100%      | All components have examples        |
| **Testing**         | 90%+      | Unit + integration tests pass       |

---

## 📋 **DELIVERABLES CHECKLIST**

### **🎯 Phase 1 Deliverables:**

- [ ] Identity module structure created
- [ ] Core identity types defined
- [ ] Identity API services implemented
- [ ] Authentication guards created
- [ ] Identity context provider ready

### **🎯 Phase 2 Deliverables:**

- [ ] RBAC schema auto-generation system
- [ ] RBAC types generated (1652+ permissions)
- [ ] Role and permission guards created
- [ ] RBAC API services implemented
- [ ] RBAC context provider ready

### **🎯 Phase 3 Deliverables:**

- [ ] Context refactoring completed
- [ ] Layout updates with guards
- [ ] Route protection updated
- [ ] Import updates throughout app

### **🎯 Phase 4 Deliverables:**

- [ ] Identity forms implemented
- [ ] RBAC UI components created
- [ ] Form validation added
- [ ] UI components documented

### **🎯 Phase 5 Deliverables:**

- [ ] Route structure updated
- [ ] Integration testing completed
- [ ] Performance benchmarks met
- [ ] Documentation completed

---

## 🔧 **IMPLEMENTATION COMMANDS**

### **Quick Start Sequence:**

```bash
# 1. Setup dependencies
npm install zustand zod react-hook-form @hookform/resolvers

# 2. Create module structures
mkdir -p features/{identity,rbac}/{components,hooks,services,stores,types,validators,utils}

# 3. Setup auto-generation system
npm install js-yaml chokidar --save-dev
cp ../Backend/RBAC.schema.v7.yml ./RBAC.schema.v7.yml

# 4. Start development
npm run dev
npm run watch:rbac  # In separate terminal
```

### **Validation Commands:**

```bash
# Validate type generation
npm run generate:rbac

# Validate API alignment
npm run test:api-integration

# Validate guard coverage
npm run test:guard-coverage

# Validate performance
npm run benchmark:guards
```

---

**🎯 This action plan provides a comprehensive roadmap for creating production-ready Identity and RBAC modules that perfectly align with the backend architecture while maintaining frontend best practices and zero security logic on the client side.**
