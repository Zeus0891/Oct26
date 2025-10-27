export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/identity/auth/login",
    REGISTER: "/api/identity/users",
    LOGOUT: "/api/identity/auth/logout",
    ME: "/api/identity/users/me",
    REFRESH: "/api/identity/auth/refresh",
  },
  DASHBOARD: {
    STATS: "/api/dashboard/stats",
    ACTIVITIES: "/api/dashboard/activities",
  },
  INVENTORY: {
    PRODUCTS: "/api/inventory/products",
  },
  FINANCE: {
    TRANSACTIONS: "/api/finance/transactions",
    STATS: "/api/finance/stats",
  },
  TENANT: {
    CURRENT: "/api/tenant/current",
  },
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
} as const;

export const PRODUCT_STATUS = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
} as const;

export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
} as const;

export const TRANSACTION_STATUS = {
  COMPLETED: "completed",
  PENDING: "pending",
  FAILED: "failed",
} as const;
