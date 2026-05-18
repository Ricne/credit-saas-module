import { apiClient } from "./client";
import type { MyFeature } from "../types/wallet";

export const featuresApi = {
  myFeatures: async () => {
    const response = await apiClient.get<MyFeature[]>("/features/me");
    return response.data;
  },
};