# Identity vs Access-Control — Boundaries

- Identity owns human and machine login flows, sessions, MFA, devices, and IdP federation. It does not make authorization decisions beyond validating authentication.
- Access-Control owns roles, permissions, memberships, delegations, and API/service accounts authorization.

Interaction Contracts:

- Identity issues sessions and user claims. Access-Control consumes claims to evaluate permissions.
- Identity may expose read-only endpoints to list current user's sessions and devices; tenant administrators use Access-Control to view member-level access and revoke authorizations.
- Audit: Identity emits auth-related events (LOGIN_SUCCEEDED/FAILED, SESSION_TERMINATED, MFA_ENROLLED). Access-Control emits RBAC changes (ROLE_ASSIGNED, PERMISSION_GRANTED, APIKEY_REVOKED).

Data Flows:

- Sign-in -> Identity (creates Session)
- Token refresh -> Identity
- Password reset -> Identity
- MFA enroll/verify -> Identity
- Assign role -> Access-Control
- Invite member -> Access-Control (creates Member linked to User)
- Create API key -> Access-Control
