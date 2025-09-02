// Database types (simplified for development)
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Investor {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  description?: string;
  currentValue: number;
  createdAt: Date;
  updatedAt: Date;
}
