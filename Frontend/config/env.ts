export const env = {
  // Prefer explicit API URL from environment. Can be host or full /api URL; client normalizes it.
  API_URL:
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3001"
      : "https://oct3newschema-production.up.railway.app"),
  APP_ENV:
    process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development",
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Enterprise ERP",
  // Optional tenant id for multi-tenant header fallback in environments without user context
  TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID || "",
} as const;
