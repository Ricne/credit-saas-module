import { apiClient } from "./client";
import type { PurchaseHistoryItem } from "../types/wallet";

export type PurchaseResponse = {
  transaction_id: string;
  package_name: string;
  credits_added: number;
  balance_after: number;
  purchased_at: string;
};

export const purchasesApi = {
  purchase: async (packageId: string) => {
    const response = await apiClient.post<PurchaseResponse>("/purchases", {
      package_id: packageId,
    });

    return response.data;
  },

  history: async () => {
    const response = await apiClient.get<PurchaseHistoryItem[]>("/purchases/history");
    return response.data;
  },
};