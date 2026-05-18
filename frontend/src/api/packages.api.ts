import { apiClient } from "./client";
import type {
  Package,
  PackageCreatePayload,
  PackageUpdatePayload,
} from "../types/package";

export const packagesApi = {
  list: async () => {
    const response = await apiClient.get<Package[]>("/packages");
    return response.data;
  },

  create: async (payload: PackageCreatePayload) => {
    const response = await apiClient.post<Package>("/admin/packages", payload);
    return response.data;
  },

  update: async (packageId: string, payload: PackageUpdatePayload) => {
    const response = await apiClient.patch<Package>(
      `/admin/packages/${packageId}`,
      payload
    );
    return response.data;
  },

  delete: async (packageId: string) => {
    await apiClient.delete(`/admin/packages/${packageId}`);
  },
};