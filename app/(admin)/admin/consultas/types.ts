export type LeadStatus = 'new' | 'contacted' | 'closed';
export type LeadType = 'sell_car' | 'contact';

export interface LeadRow {
  id: string;
  type: LeadType;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  sourcePage: string;
  createdAt: Date;
  carBrand?: string;
  carModel?: string;
  carYear?: number;
  carMileage?: number;
  message?: string;
}
