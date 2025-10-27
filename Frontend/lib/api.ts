import axios from "axios";
import { env } from "@/config/env";

// Base origin: do NOT include /api here; we will prefix /api to request paths below
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || env.API_URL).replace(
  /\/$/,
  ""
);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // allow cookies for refresh token flow
  timeout: 0, // sin límite (solo para desarrollo)
});

// Request interceptor to add auth token and logging
api.interceptors.request.use(
  (config) => {
    // Ensure API prefix on relative URLs
    if (typeof config.url === "string") {
      const urlStr = config.url;
      const isAbsolute = /^https?:\/\//i.test(urlStr);
      if (!isAbsolute) {
        const ensured = urlStr.startsWith("/") ? urlStr : `/${urlStr}`;
        config.url = ensured.startsWith("/api/") ? ensured : `/api${ensured}`;
      }
    }

    // Debug logging
    console.log(
      `🔴 [API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );
    if (config.data) {
      console.log(`🔴 [API Request Body]`, config.data);
    }

    // Auth header
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        `🔴 [API Request] Auth token present: ${token.substring(0, 20)}...`
      );
    } else {
      console.log(`🔴 [API Request] No auth token found`);
    }

    // Tenant header
    try {
      const userRaw =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const user = userRaw ? JSON.parse(userRaw) : null;
      const tenantId: string | undefined =
        user?.tenantId || env.TENANT_ID || undefined;
      if (tenantId) {
        (config.headers as Record<string, string>)["x-tenant-id"] = tenantId;
      }
    } catch {
      if (env.TENANT_ID) {
        (config.headers as Record<string, string>)["x-tenant-id"] =
          env.TENANT_ID;
      }
    }

    // Correlation header per request (use Web Crypto if available)
    let correlationId: string;
    const gt = globalThis as unknown as {
      crypto?: { randomUUID?: () => string };
    };
    if (gt.crypto && typeof gt.crypto.randomUUID === "function") {
      correlationId = gt.crypto.randomUUID();
    } else {
      correlationId = Math.random().toString(36).slice(2);
    }
    (config.headers as Record<string, string>)["x-correlation-id"] =
      correlationId;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

api.interceptors.response.use(
  (response) => {
    console.log(
      `🟢 [API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`
    );
    console.log(`🟢 [API Response Data]`, response.data);
    return response;
  },
  async (error) => {
    console.log(
      `🔴 [API Error] ${error.response?.status || "NETWORK"} ${error.config?.method?.toUpperCase()} ${error.config?.url}`
    );
    console.log(
      `🔴 [API Error Details]`,
      error.response?.data || error.message
    );
    const originalRequest = error.config;
    // If unauthorized and we haven't tried refresh yet, attempt refresh
    if (error.response?.status === 401 && !originalRequest.__isRetryRequest) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve) => {
          pendingRequests.push((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            originalRequest.__isRetryRequest = true;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      originalRequest.__isRetryRequest = true;
      try {
        const storedRefresh =
          typeof window !== "undefined"
            ? localStorage.getItem("refreshToken")
            : null;
        const refreshResp = await api.post(
          "/api/identity/auth/refresh",
          storedRefresh ? { refreshToken: storedRefresh } : {}
        );
        const newAccess = refreshResp.data?.accessToken as string | undefined;
        const newRefresh = refreshResp.data?.refreshToken as string | undefined;
        if (newAccess && typeof window !== "undefined") {
          localStorage.setItem("token", newAccess);
          if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
        }

        // Replay pending requests
        pendingRequests.forEach((cb) => cb(newAccess || null));
        pendingRequests = [];
        isRefreshing = false;

        // Retry original
        if (newAccess) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        }
        return api(originalRequest);
      } catch (refreshErr) {
        // Refresh failed; clear auth and redirect
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        pendingRequests = [];
        isRefreshing = false;
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
