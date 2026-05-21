export type Wallet = {
  id: string;
  balance: number;
  created_at: string;
  updated_at: string;
};

export type CreditLedgerItem = {
  id: string;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  created_at: string;
};

export type MyFeature = {
  id: string;
  feature_code: string;
  package_name: string;
  granted_at: string;
  expired_at: string | null;
  revoked_at: string | null;
};

export type PurchaseHistoryItem = {
  id: string;
  package_name: string;
  amount: string;
  credits_added: number;
  status: string;
  payment_method: string;
  created_at: string;
};