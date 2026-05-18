import { apiClient } from "./client";
import type { PurchaseHistoryItem } from "../types/wallet";

export type FakePaymentInfo = {
  cardholder_name: string;
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  billing_email: string;
};

export type PurchaseResponse = {
  transaction_id: string;
  package_name: string;
  credits_added: number;
  balance_after: number;
  purchased_at: string;
};

export const purchasesApi = {
  purchase: async (packageId: string, payment: FakePaymentInfo) => {
    const response = await apiClient.post<PurchaseResponse>("/purchases", {
      package_id: packageId,
      payment,
    });

    return response.data;
  },

  history: async () => {
    const response = await apiClient.get<PurchaseHistoryItem[]>("/purchases/history");
    return response.data;
  },
};