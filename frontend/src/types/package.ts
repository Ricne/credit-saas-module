export type Feature = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

export type Package = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  credits: number;
  status: string;
  created_at: string;
  features: Feature[];
};

export type PackageCreatePayload = {
  name: string;
  description?: string;
  price: number;
  credits: number;
  feature_codes: string[];
};

export type PackageUpdatePayload = Partial<PackageCreatePayload> & {
  status?: string;
};