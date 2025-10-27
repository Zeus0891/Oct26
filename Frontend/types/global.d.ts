// Re-export auth types from the new auth module
export type {
  AuthUser as User,
  LoginRequest,
  RegisterRequest,
  LoginResponse as AuthResponse,
  AuthTokens,
  AuthTenant,
  AuthMember,
} from "@/features/identity/types";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
