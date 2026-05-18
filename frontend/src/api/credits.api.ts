import { apiClient } from "./client";
import type { CreditLedgerItem, Wallet } from "../types/wallet";

export const creditsApi = {
  wallet: async () => {
    const response = await apiClient.get<Wallet>("/credits/wallet");
    return response.data;
  },

  ledger: async () => {
    const response = await apiClient.get<CreditLedgerItem[]>("/credits/ledger");
    return response.data;
  },
};