import api from "@/lib/api";
import { Tenant } from "@/types/global";

export const tenantService = {
  async getCurrentTenant(): Promise<Tenant> {
    // Backend exposes /api/identity/users/me which includes tenant info
    const response = await api.get("/api/identity/users/me");
    return response.data?.tenant as Tenant;
  },

  async updateTenant(tenantId: string, data: Partial<Tenant>): Promise<Tenant> {
    // TODO: Switch to /api/tenants/:id when backend route exists
    const response = await api.put(`/tenants/${tenantId}`, data);
    return response.data as Tenant;
  },
};
