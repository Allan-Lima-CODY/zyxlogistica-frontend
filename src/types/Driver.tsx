export enum CnhCategory {
  None = 0,
  A = 1,
  B = 2,
  C = 4,
  D = 8,
  E = 16,
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  cnh: string;
  cnhCategory: CnhCategory;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DriverInput {
  name: string;
  phone: string;
  cnh: string;
  cnhCategory: CnhCategory;
}

export interface DriverUpdate {
  name: string;
  phone: string;
}
