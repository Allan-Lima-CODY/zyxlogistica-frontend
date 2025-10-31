export interface Inventory {
  id: string;
  productCode: string;
  description: string;
  quantity: number;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface InventoryInput {
  productCode: string;
  description: string;
  quantity: number;
  price: number;
}

export interface InventoryUpdate {
  description: string;
  price: number;
}
