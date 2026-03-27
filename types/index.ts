// Re-export types from schemas for convenience
export type {
  CarCreateInput,
  CarUpdateInput,
  CarQueryInput,
  CarDeleteInput,
  ToggleFeaturedInput,
} from '@/lib/schemas/car';

export type {
  ContactFormData,
  SellCarFormData,
  LeadUpdateData,
  LeadQueryInput,
} from '@/lib/schemas/contact';

export type {
  LoginInput,
  AdminCreateInput,
  AdminUpdateInput,
  JwtPayload,
  Session,
} from '@/lib/schemas/admin';

// Additional types
export interface CarSummary {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  featured: boolean;
  status: string;
  primaryImageUrl?: string;
  createdAt: Date;
}

export interface LeadSummary {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  sourcePage: string;
  createdAt: Date;
}

export interface AdminSession {
  adminId: string;
  username: string;
  role: 'admin' | 'super_admin';
  expiresAt: Date;
}
