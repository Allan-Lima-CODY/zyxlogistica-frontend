import { InventoryInput } from './Inventory';

export interface InboundEntry {
  id: string;
  inventoryId: string;
  productCode: string;
  description: string;
  quantity: number;
  price: number;
  reference: string;
  supplierName: string;
  observation?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InboundEntryInput {
  inventoryInput: InventoryInput;
  reference: string;
  supplierName: string;
  observation?: string;
}

export interface InboundEntryUpdate {
  reference: string;
  supplierName: string;
  observation?: string;
}
