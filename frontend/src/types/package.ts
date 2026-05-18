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

export type AdminFeature = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type FeatureCreatePayload = {
  code: string;
  name: string;
  description?: string;
};

export type FeatureUpdatePayload = Partial<FeatureCreatePayload> & {
  is_active?: boolean;
};