# Identity Module

Scope: Authentication and user identity for the platform. Owns humans and their credentials, sessions, MFA factors, trusted devices, and external identity providers. Does not own RBAC (roles/permissions/memberships).

Key responsibilities:

- Sign-in, refresh, sign-out, password reset flows
- Session lifecycle and session introspection
- MFA enrollment and verification (TOTP, WebAuthn, email/SMS codes)
- Trusted device registration and management
- Identity Provider connections (SAML/OIDC) at tenant level

Out of scope (owned by Access-Control):

- Members and memberships per tenant
- Roles, permissions, role assignments
- Delegations, scopes, API keys, service accounts

Data ownership (Prisma models):

- Owned by Identity: User, Session, AuthFactor, PasswordResetToken, UserDevice, IdentityProvider, IdentityProviderConnection
- Referenced but external: Member (for tenant context bindings)
- Remain in Access-Control: Member, MemberSettings, MemberRole, Permission, Role, RolePermission, DelegationGrant, DelegationConstraint, ApiKey, ServiceAccount, ServiceAccountKey

Enums:

- Identity: AuthenticationMethod, AuthenticationType, AuthFactorStatus, AuthFactorType, DeviceStatus, DeviceType, SessionStatus, TokenType, UserStatus
- Access-Control: ApiKeyScope, ApiKeyStatus, AssignmentScope, ConstraintViolationAction, DelegationConstraintType, DelegationStatus, DelegationType, MemberStatus, PermissionScope, RoleType, ServiceAccountStatus, ServiceAccountType, ThemePreference
- Shared/common: RetentionPolicy, SecurityLevel, ComplianceLevel, RiskLevel, ImpactLevel (consumed by UserDevice), AccessMethod (not identity)

Routing base: /api/identity

Security model:

- Public endpoints for login/register/password-reset initiation use publicStack
- Authenticated endpoints use securityStack; RBAC is not enforced here (identity layer); tenant RBAC happens in Access-Control

Observability:

- Per-endpoint metrics via MetricsService
- Audit events for auth-sensitive actions (LOGIN_SUCCEEDED/FAILED, SESSION_TERMINATED, MFA_ENROLLED, etc.)

Next slices:

- Slice 1: Sessions & login (GET /sessions/me, GET /sessions, POST /login, POST /logout, POST /refresh)
- Slice 2: MFA factors (enroll/verify/list)
- Slice 3: Devices (register/list/revoke)
- Slice 4: Password reset flow
- Slice 5: IdP Connections (admin endpoints)

| Model                      | Scope  | Parent | Description                                      |
| -------------------------- | ------ | ------ | ------------------------------------------------ |
| User                       | Global | ✅     | Global user identity (IdP, email)                |
| Session                    | Tenant |        | Authenticated tenant session with device context |
| AuthFactor                 | Tenant |        | MFA factors and verifications                    |
| PasswordResetToken         | Tenant |        | Secure reset tokens and flows                    |
| UserDevice                 | Tenant |        | Registered devices and trust signals             |
| IdentityProvider           | Global |        | External IdP registry                            |
| IdentityProviderConnection | Tenant |        | Tenant-level IdP configuration                   |

---

## Dependencies: Provides sessions/claims to Access-Control; uses Tenant for RLS context.

## identity

Enums:

- AuthenticationMethod
- AuthenticationType
- AuthFactorStatus
- AuthFactorType
- DeviceStatus
- DeviceType
- SessionStatus
- TokenType
- UserStatus

---
