# identity — Tables and Enums

## 🧱 Models

### User

```prisma
model User {
  id                 String               @id @default(uuid(7)) @db.Uuid
  status             UserStatus           @default(ACTIVE)
  version            Int                  @default(1)
  createdAt          DateTime             @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime             @db.Timestamptz(6)
  deletedAt          DateTime?            @db.Timestamptz(6)
  deletedByActorId   String?              @db.Uuid
  createdByActorId   String?              @db.Uuid
  updatedByActorId   String?              @db.Uuid
  auditCorrelationId String?              @db.Uuid
  dataClassification String               @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  email              String               @unique @db.Citext
  emailVerified      Boolean              @default(false)
  emailVerifiedAt    DateTime?            @db.Timestamptz(6)
  firstName          String?              @db.VarChar(100)
  lastName           String?              @db.VarChar(100)
  displayName        String?              @db.VarChar(255)
  avatarUrl          String?              @db.VarChar(500)
  passwordHash       String?              @db.VarChar(255)
  passwordSalt       String?              @db.VarChar(255)
  lastPasswordChange DateTime?            @db.Timestamptz(6)
  lastLoginAt        DateTime?            @db.Timestamptz(6)
  lastLoginIp        String?              @db.VarChar(45)
  loginAttempts      Int                  @default(0)
  lockedAt           DateTime?            @db.Timestamptz(6)
  lockedUntil        DateTime?            @db.Timestamptz(6)
  mfaEnabled         Boolean              @default(false)
  mfaSecret          String?              @db.VarChar(255)
  mfaBackupCodes     String[]             @db.VarChar(20)
  timezone           String               @default("UTC") @db.VarChar(50)
  locale             String               @default("en-US") @db.VarChar(10)
  invitedAt          DateTime?            @db.Timestamptz(6)
  invitedByUserId    String?              @db.Uuid
  onboardedAt        DateTime?            @db.Timestamptz(6)
  suspendedAt        DateTime?            @db.Timestamptz(6)
  suspendedReason    String?
  terminatedAt       DateTime?            @db.Timestamptz(6)
  terminationReason  String?
  metadata           Json?
  ApiKey             ApiKey[]
  AuthFactor         AuthFactor[]
  Member             Member[]
  PasswordResetToken PasswordResetToken[]
  Session            Session[]
  User               User?                @relation("UserToUser", fields: [invitedByUserId], references: [id])
  other_User         User[]               @relation("UserToUser")
  UserDevice         UserDevice[]

  // Actor audit relationships
  CreatedByActor Actor? @relation("UserCreatedByActor", fields: [createdByActorId], references: [id])
  UpdatedByActor Actor? @relation("UserUpdatedByActor", fields: [updatedByActorId], references: [id])
  DeletedByActor Actor? @relation("UserDeletedByActor", fields: [deletedByActorId], references: [id])

  @@index([auditCorrelationId])
  @@index([createdAt], type: Brin)
  @@index([dataClassification])
  @@index([emailVerified])
  @@index([email])
  @@index([invitedByUserId])
  @@index([lastLoginAt])
  @@index([status])
}
```

### Session

```prisma
model Session {
  id                                          String           @id @default(uuid(7)) @db.Uuid
  status                                      SessionStatus    @default(ACTIVE)
  version                                     Int              @default(1)
  createdAt                                   DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt                                   DateTime         @db.Timestamptz(6)
  tenantId                                    String           @db.Uuid
  deletedAt                                   DateTime?        @db.Timestamptz(6)
  deletedByActorId                            String?          @db.Uuid
  createdByActorId                            String?          @db.Uuid
  updatedByActorId                            String?          @db.Uuid
  auditCorrelationId                          String?          @db.Uuid
  dataClassification                          String           @default("CONFIDENTIAL")
  retentionPolicy                             RetentionPolicy?
  userId                                      String           @db.Uuid
  memberId                                    String?          @db.Uuid
  sessionToken                                String           @unique @db.VarChar(255)
  hashedToken                                 String           @db.VarChar(255)
  refreshToken                                String?          @unique @db.VarChar(255)
  hashedRefreshToken                          String?          @db.VarChar(255)
  expiresAt                                   DateTime         @db.Timestamptz(6)
  refreshExpiresAt                            DateTime?        @db.Timestamptz(6)
  lastAccessedAt                              DateTime         @default(now()) @db.Timestamptz(6)
  deviceId                                    String?          @db.Uuid
  deviceFingerprint                           String?          @db.VarChar(255)
  userAgent                                   String?
  ipAddress                                   String?          @db.VarChar(45)
  location                                    Json?
  isSecure                                    Boolean          @default(true)
  isMfaVerified                               Boolean          @default(false)
  riskScore                                   Int              @default(0)
  terminatedAt                                DateTime?        @db.Timestamptz(6)
  terminationReason                           String?
  terminatedByMemberId                        String?          @db.Uuid
  activityCount                               Int              @default(0)
  lastActivityType                            String?          @db.VarChar(100)
  metadata                                    Json?
  Member_Session_memberIdToMember             Member?          @relation("Session_memberIdToMember", fields: [memberId], references: [id], onDelete: Cascade)
  Tenant                                      Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  Member_Session_terminatedByMemberIdToMember Member?          @relation("Session_terminatedByMemberIdToMember", fields: [terminatedByMemberId], references: [id])
  User                                        User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, refreshToken])
  @@unique([tenantId, sessionToken])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, deviceId])
  @@index([tenantId, expiresAt])
  @@index([tenantId, ipAddress])
  @@index([tenantId, isMfaVerified])
  @@index([tenantId, lastAccessedAt])
  @@index([tenantId, memberId])
  @@index([tenantId, status])
  @@index([tenantId, userId])
  @@index([terminatedByMemberId])
}
```

### AuthFactor

```prisma
model AuthFactor {
  id                   String           @id @default(uuid(7)) @db.Uuid
  status               AuthFactorStatus @default(PENDING_VERIFICATION)
  version              Int              @default(1)
  createdAt            DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt            DateTime         @db.Timestamptz(6)
  tenantId             String?          @db.Uuid
  deletedAt            DateTime?        @db.Timestamptz(6)
  deletedByActorId     String?          @db.Uuid
  createdByActorId     String?          @db.Uuid
  updatedByActorId     String?          @db.Uuid
  auditCorrelationId   String?          @db.Uuid
  dataClassification   String           @default("CONFIDENTIAL")
  retentionPolicy      RetentionPolicy?
  userId               String           @db.Uuid
  memberId             String?          @db.Uuid
  factorType           AuthFactorType
  name                 String           @db.VarChar(255)
  isDefault            Boolean          @default(false)
  isPrimary            Boolean          @default(false)
  totpSecret           String?          @db.VarChar(255)
  totpAlgorithm        String?          @default("SHA1") @db.VarChar(10)
  totpDigits           Int?             @default(6)
  totpPeriod           Int?             @default(30)
  phoneNumber          String?          @db.VarChar(50)
  emailAddress         String?          @db.Citext
  webauthnCredentialId String?
  webauthnPublicKey    String?
  webauthnCounter      BigInt?          @default(0)
  webauthnTransports   String[]         @db.VarChar(20)
  backupCodes          String[]         @db.VarChar(20)
  backupCodesUsed      String[]         @db.VarChar(20)
  isVerified           Boolean          @default(false)
  verifiedAt           DateTime?        @db.Timestamptz(6)
  verificationCode     String?          @db.VarChar(10)
  verificationExpiry   DateTime?        @db.Timestamptz(6)
  lastUsedAt           DateTime?        @db.Timestamptz(6)
  useCount             Int              @default(0)
  failureCount         Int              @default(0)
  lastFailureAt        DateTime?        @db.Timestamptz(6)
  deviceInfo           Json?
  userAgent            String?
  ipAddress            String?          @db.VarChar(45)
  compromisedAt        DateTime?        @db.Timestamptz(6)
  compromiseReason     String?
  recoveredAt          DateTime?        @db.Timestamptz(6)
  metadata             Json?
  Member               Member?          @relation(fields: [memberId], references: [id], onDelete: Cascade)
  Tenant               Tenant?          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  User                 User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, factorType, name])
  @@unique([tenantId, userId, factorType, name])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, emailAddress])
  @@index([tenantId, factorType])
  @@index([tenantId, isDefault])
  @@index([tenantId, isVerified])
  @@index([tenantId, lastUsedAt])
  @@index([tenantId, memberId])
  @@index([tenantId, phoneNumber])
  @@index([tenantId, status])
  @@index([tenantId, userId])
}
```

### PasswordResetToken

```prisma
model PasswordResetToken {
  id                    String           @id @default(uuid(7)) @db.Uuid
  status                String           @default("ACTIVE")
  version               Int              @default(1)
  createdAt             DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt             DateTime         @db.Timestamptz(6)
  tenantId              String?          @db.Uuid
  deletedAt             DateTime?        @db.Timestamptz(6)
  deletedByActorId      String?          @db.Uuid
  createdByActorId      String?          @db.Uuid
  updatedByActorId      String?          @db.Uuid
  auditCorrelationId    String?          @db.Uuid
  dataClassification    String           @default("CONFIDENTIAL")
  retentionPolicy       RetentionPolicy?
  userId                String           @db.Uuid
  memberId              String?          @db.Uuid
  token                 String           @db.VarChar(255)
  hashedToken           String           @db.VarChar(255)
  selector              String           @db.VarChar(100)
  expiresAt             DateTime         @db.Timestamptz(6)
  isUsed                Boolean          @default(false)
  usedAt                DateTime?        @db.Timestamptz(6)
  requestedEmail        String           @db.Citext
  requestIpAddress      String?          @db.VarChar(45)
  requestUserAgent      String?
  requestFingerprint    String?          @db.VarChar(255)
  attemptCount          Int              @default(0)
  maxAttempts           Int              @default(3)
  lastAttemptAt         DateTime?        @db.Timestamptz(6)
  lastAttemptIp         String?          @db.VarChar(45)
  invalidatedAt         DateTime?        @db.Timestamptz(6)
  invalidationReason    String?
  invalidatedByMemberId String?          @db.Uuid
  passwordChangedAt     DateTime?        @db.Timestamptz(6)
  changeIpAddress       String?          @db.VarChar(45)
  changeUserAgent       String?
  metadata              Json?

  Member_PasswordResetToken_invalidatedByMemberIdToMember Member? @relation("PasswordResetToken_invalidatedByMemberIdToMember", fields: [invalidatedByMemberId], references: [id])
  Member_PasswordResetToken_memberIdToMember              Member? @relation("PasswordResetToken_memberIdToMember", fields: [memberId], references: [id], onDelete: Cascade)
  Tenant                                                  Tenant? @relation(fields: [tenantId], references: [id])
  User                                                    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([selector])
  @@unique([token])
  @@index([createdAt], type: Brin)
  @@index([requestedEmail])
  @@index([expiresAt])
  @@index([isUsed])
  @@index([userId])
  @@index([status])
  @@index([auditCorrelationId])
}
```

### UserDevice

```prisma
model UserDevice {
  id                                          String           @id @default(uuid(7)) @db.Uuid
  status                                      DeviceStatus     @default(PENDING_VERIFICATION)
  version                                     Int              @default(1)
  createdAt                                   DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt                                   DateTime         @db.Timestamptz(6)
  tenantId                                    String           @db.Uuid
  deletedAt                                   DateTime?        @db.Timestamptz(6)
  deletedByActorId                            String?          @db.Uuid
  createdByActorId                            String?          @db.Uuid
  updatedByActorId                            String?          @db.Uuid
  auditCorrelationId                          String?          @db.Uuid
  dataClassification                          String           @default("CONFIDENTIAL")
  retentionPolicy                             RetentionPolicy?
  userId                                      String           @db.Uuid
  memberId                                    String?          @db.Uuid
  deviceFingerprint                           String           @unique @db.VarChar(255)
  deviceId                                    String?          @db.VarChar(255)
  deviceName                                  String?          @db.VarChar(255)
  deviceType                                  DeviceType       @default(OTHER)
  userAgent                                   String?
  browserName                                 String?          @db.VarChar(100)
  browserVersion                              String?          @db.VarChar(50)
  osName                                      String?          @db.VarChar(100)
  osVersion                                   String?          @db.VarChar(50)
  appVersion                                  String?          @db.VarChar(50)
  ipAddress                                   String?          @db.VarChar(45)
  ipCountry                                   String?          @db.VarChar(10)
  ipRegion                                    String?          @db.VarChar(100)
  ipCity                                      String?          @db.VarChar(100)
  screenResolution                            String?          @db.VarChar(20)
  colorDepth                                  Int?
  timezone                                    String?          @db.VarChar(50)
  language                                    String?          @db.VarChar(10)
  isTrusted                                   Boolean          @default(false)
  trustLevel                                  Int              @default(0)
  riskLevel                                   ImpactLevel      @default(MEDIUM)
  isVerified                                  Boolean          @default(false)
  verifiedAt                                  DateTime?        @db.Timestamptz(6)
  verificationMethod                          String?          @db.VarChar(50)
  verificationCode                            String?          @db.VarChar(10)
  verificationExpiry                          DateTime?        @db.Timestamptz(6)
  firstSeenAt                                 DateTime         @default(now()) @db.Timestamptz(6)
  lastSeenAt                                  DateTime         @default(now()) @db.Timestamptz(6)
  lastUsedAt                                  DateTime?        @db.Timestamptz(6)
  sessionCount                                Int              @default(0)
  compromisedAt                               DateTime?        @db.Timestamptz(6)
  compromiseReason                            String?
  compromiseEvidence                          Json?
  revokedAt                                   DateTime?        @db.Timestamptz(6)
  revokedReason                               String?
  revokedByMemberId                           String?          @db.Uuid
  isManaged                                   Boolean          @default(false)
  managementProfile                           String?          @db.VarChar(100)
  complianceStatus                            String?          @db.VarChar(50)
  deviceMetadata                              Json?
  securityMetadata                            Json?
  Member_UserDevice_memberIdToMember          Member?          @relation("UserDevice_memberIdToMember", fields: [memberId], references: [id], onDelete: Cascade)
  Member_UserDevice_revokedByMemberIdToMember Member?          @relation("UserDevice_revokedByMemberIdToMember", fields: [revokedByMemberId], references: [id])
  Tenant                                      Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  User                                        User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([tenantId, deviceFingerprint])
  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([revokedByMemberId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, browserName])
  @@index([tenantId, compromisedAt])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, deviceType])
  @@index([tenantId, ipAddress])
  @@index([tenantId, isTrusted])
  @@index([tenantId, isVerified])
  @@index([tenantId, lastSeenAt])
  @@index([tenantId, memberId])
  @@index([tenantId, osName])
  @@index([tenantId, revokedAt])
  @@index([tenantId, status])
  @@index([tenantId, userId])
}
```

### IdentityProvider

```prisma
model IdentityProvider {
  id                         String                       @id @default(uuid(7)) @db.Uuid
  status                     String                       @default("ACTIVE")
  version                    Int                          @default(1)
  createdAt                  DateTime                     @default(now()) @db.Timestamptz(6)
  updatedAt                  DateTime                     @db.Timestamptz(6)
  deletedAt                  DateTime?                    @db.Timestamptz(6)
  deletedByActorId           String?                      @db.Uuid
  createdByActorId           String?                      @db.Uuid
  updatedByActorId           String?                      @db.Uuid
  auditCorrelationId         String?                      @db.Uuid
  dataClassification         String                       @default("INTERNAL")
  retentionPolicy            RetentionPolicy?
  name                       String                       @unique @db.VarChar(100)
  displayName                String                       @db.VarChar(255)
  description                String?
  providerType               String                       @db.VarChar(50)
  protocol                   String                       @db.VarChar(20)
  protocolVersion            String?                      @db.VarChar(20)
  configurationSchema        Json?
  defaultConfiguration       Json?
  supportsSSO                Boolean                      @default(true)
  supportsProvisioning       Boolean                      @default(false)
  supportsGroups             Boolean                      @default(false)
  supportsJIT                Boolean                      @default(false)
  requiresEncryption         Boolean                      @default(true)
  supportsMFA                Boolean                      @default(false)
  complianceLevel            ComplianceLevel              @default(STANDARD)
  logoUrl                    String?                      @db.VarChar(500)
  documentationUrl           String?                      @db.VarChar(500)
  supportUrl                 String?                      @db.VarChar(500)
  vendorName                 String?                      @db.VarChar(100)
  vendorWebsite              String?                      @db.VarChar(255)
  isActive                   Boolean                      @default(true)
  isDeprecated               Boolean                      @default(false)
  deprecationDate            DateTime?                    @db.Timestamptz(6)
  endOfLifeDate              DateTime?                    @db.Timestamptz(6)
  metadata                   Json?
  tags                       String[]                     @db.VarChar(50)
  IdentityProviderConnection IdentityProviderConnection[]

  @@index([auditCorrelationId])
  @@index([complianceLevel])
  @@index([createdAt], type: Brin)
  @@index([dataClassification])
  @@index([deletedAt])
  @@index([isActive])
  @@index([isDeprecated])
  @@index([protocol])
  @@index([providerType])
  @@index([status])
}
```

### IdentityProviderConnection

```prisma
model IdentityProviderConnection {
  id                   String           @id @default(uuid(7)) @db.Uuid
  status               String           @default("ACTIVE")
  version              Int              @default(1)
  createdAt            DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt            DateTime         @db.Timestamptz(6)
  tenantId             String           @db.Uuid
  deletedAt            DateTime?        @db.Timestamptz(6)
  deletedByActorId     String?          @db.Uuid
  createdByActorId     String?          @db.Uuid
  updatedByActorId     String?          @db.Uuid
  auditCorrelationId   String?          @db.Uuid
  dataClassification   String           @default("CONFIDENTIAL")
  retentionPolicy      RetentionPolicy?
  identityProviderId   String           @db.Uuid
  name                 String           @db.VarChar(100)
  displayName          String           @db.VarChar(255)
  description          String?
  configuration        Json
  clientId             String?          @db.VarChar(255)
  clientSecretHash     String?          @db.VarChar(500)
  entityId             String?          @db.VarChar(255)
  ssoUrl               String?          @db.VarChar(500)
  sloUrl               String?          @db.VarChar(500)
  certificate          String?
  discoveryUrl         String?          @db.VarChar(500)
  authorizationUrl     String?          @db.VarChar(500)
  tokenUrl             String?          @db.VarChar(500)
  userInfoUrl          String?          @db.VarChar(500)
  userMapping          Json?
  groupMapping         Json?
  enableProvisioning   Boolean          @default(false)
  enableJIT            Boolean          @default(false)
  isActive             Boolean          @default(true)
  isDefault            Boolean          @default(false)
  allowedDomains       String[]         @db.VarChar(100)
  blockedDomains       String[]         @db.VarChar(100)
  lastTestedAt         DateTime?        @db.Timestamptz(6)
  testStatus           String?          @default("PENDING") @db.VarChar(20)
  testError            String?
  lastUsedAt           DateTime?        @db.Timestamptz(6)
  totalLogins          Int              @default(0)
  activeUsers          Int              @default(0)
  configuredByMemberId String           @db.Uuid
  metadata             Json?
  tags                 String[]         @db.VarChar(50)
  IdentityProvider     IdentityProvider @relation(fields: [identityProviderId], references: [id])
  Member               Member           @relation(fields: [tenantId, configuredByMemberId], references: [tenantId, id])
  Tenant               Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, identityProviderId])
  @@unique([tenantId, name])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, configuredByMemberId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, identityProviderId])
  @@index([tenantId, isActive])
  @@index([tenantId, isActive, isDefault])
  @@index([tenantId, isDefault])
  @@index([tenantId, lastUsedAt])
  @@index([tenantId, status])
  @@index([tenantId, testStatus])
}
```

## 🧩 Enums

### AuthenticationMethod

```prisma
enum AuthenticationMethod {
  EMAIL
  SMS
  PHONE_CALL
  KNOWLEDGE_BASED
  ID_VERIFICATION
  SOCIAL_LOGIN
  ACCESS_CODE
}
```

### AuthenticationType

```prisma
enum AuthenticationType {
  OAUTH2
  API_KEY
  BASIC_AUTH
  CERTIFICATE
  JWT
  SAML
  WEBHOOK
  CUSTOM
}
```

### AuthFactorStatus

```prisma
enum AuthFactorStatus {
  ACTIVE
  INACTIVE
  PENDING_VERIFICATION
  COMPROMISED
  EXPIRED
}
```

### AuthFactorType

```prisma
enum AuthFactorType {
  TOTP
  SMS
  EMAIL
  WEBAUTHN
  BACKUP_CODE
  HARDWARE_TOKEN
}
```

### ComplianceLevel

```prisma
enum ComplianceLevel {
  BASIC
  STANDARD
  ENTERPRISE
  SOC2
}
```

### DeviceStatus

```prisma
enum DeviceStatus {
  ACTIVE
  INACTIVE
  COMPROMISED
  REVOKED
  PENDING_VERIFICATION
}
```

### DeviceType

```prisma
enum DeviceType {
  MOBILE
  DESKTOP
  TABLET
  BROWSER
  API_CLIENT
  OTHER
}
```

### ImpactLevel

```prisma
enum ImpactLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### RetentionPolicy

```prisma
enum RetentionPolicy {
  DAYS_30
  DAYS_90
  MONTHS_6
  YEAR_1
  YEARS_3
  YEARS_7
  YEARS_10
  PERMANENT
}
```

### SessionStatus

```prisma
enum SessionStatus {
  ACTIVE
  EXPIRED
  REVOKED
  TERMINATED
}
```

### TokenType

```prisma
enum TokenType {
  ACCESS_TOKEN
  REFRESH_TOKEN
  API_KEY
  SESSION_TOKEN
  BEARER_TOKEN
  JWT_TOKEN
  CERTIFICATE
}
```

### UserStatus

```prisma
enum UserStatus {
  ACTIVE
  SUSPENDED
  INVITED
  PENDING_VERIFICATION
  LOCKED
  DELETED
}
```

_Mapped from ERP docs; extracted from schema.prisma_