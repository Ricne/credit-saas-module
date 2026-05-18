import { apiClient } from "./client";
import type {
  AdminFeature,
  FeatureCreatePayload,
  FeatureUpdatePayload,
} from "../types/package";
import type { MyFeature } from "../types/wallet";

export const featuresApi = {
  list: async () => {
    const response = await apiClient.get<AdminFeature[]>("/features");
    return response.data;
  },

  myFeatures: async () => {
    const response = await apiClient.get<MyFeature[]>("/features/me");
    return response.data;
  },

  adminList: async () => {
    const response = await apiClient.get<AdminFeature[]>("/admin/features");
    return response.data;
  },

  create: async (payload: FeatureCreatePayload) => {
    const response = await apiClient.post<AdminFeature>(
      "/admin/features",
      payload
    );
    return response.data;
  },

  update: async (featureId: string, payload: FeatureUpdatePayload) => {
    const response = await apiClient.patch<AdminFeature>(
      `/admin/features/${featureId}`,
      payload
    );
    return response.data;
  },

  delete: async (featureId: string) => {
    await apiClient.delete(`/admin/features/${featureId}`);
  },
};