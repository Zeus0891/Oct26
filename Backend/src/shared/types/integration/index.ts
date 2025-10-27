/**
 * Integration Types Index
 *
 * Exports all integration and external system types for system interoperability,
 * API management, webhook delivery, and external reference mapping. These types
 * support enterprise-grade integration architecture with comprehensive monitoring.
 *
 * Categories:
 * - External References: Mapping between internal and external entities
 * - Webhooks: Event-driven communication and delivery tracking
 * - API Management: External API interactions and credential management
 * - Integration Core: Generic integration patterns and connection management
 *
 * @category Integration Types
 * @description System interoperability and external integration management
 */

// External system reference mapping
export * from "./external-reference.types";

// Webhook event management and delivery
export * from "./webhook.types";

// API interaction and credential management
export * from "./api.types";

// Core integration and connection management
export * from "./integration.types";
