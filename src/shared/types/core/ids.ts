/**
 * Core ID Type Aliases (Compatibility Layer)
 */
export type TenantId = string;
export type UserId = string;
export type MemberId = string;
export type CorrelationId = string;
/**
 * UUID v7 identifier alias for strong typing across services/controllers.
 * Backward-compat shim: treat as string at compile-time while we progressively
 * enforce stricter validation at the boundaries (validators/db).
 */
export type UuidV7 = string;
