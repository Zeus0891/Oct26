/**
 * Services Index
 * Centralized export for all identity services
 */

export { default as identityService, identityApi } from "./identity.service";

// Alias for backwards compatibility
export { default as AuthService } from "./identity.service";
export { default as sessionService, sessionApi } from "./session.service";
export { default as mfaService, mfaApi } from "./mfa.service";
export { default as passwordService } from "./password.service";
export { default as deviceService } from "./device.service";
export { default as profileService } from "./profile.service";

// Service error classes
export { IdentityServiceError } from "./identity.service";
export { SessionServiceError } from "./session.service";
export { MfaServiceError } from "./mfa.service";
export { DeviceServiceError } from "./device.service";
export { ProfileServiceError } from "./profile.service";
