export enum OrderStatus {
  Pending = 0,
  InSeparation = 1,
  InTransit = 2,
  Delivered = 3,
  Cancelled = 4,
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Pendente',
  [OrderStatus.InSeparation]: 'Em Separação',
  [OrderStatus.InTransit]: 'Em Trânsito',
  [OrderStatus.Delivered]: 'Entregue',
  [OrderStatus.Cancelled]: 'Cancelado',
};

export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [OrderStatus.InSeparation]: 'bg-blue-100 text-blue-800 border-blue-300',
  [OrderStatus.InTransit]: 'bg-purple-100 text-purple-800 border-purple-300',
  [OrderStatus.Delivered]: 'bg-green-100 text-green-800 border-green-300',
  [OrderStatus.Cancelled]: 'bg-red-100 text-red-800 border-red-300',
};

export interface OrderInventoryDTO {
  id: string;
  inventoryId: string;
  quantity: number;
  // Additional info for display
  productCode?: string;
  description?: string;
  availableQuantity?: number;
  price?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  items: OrderInventoryDTO[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderInventoryInput {
  inventoryId: string;
  quantity: number;
}

export interface OrderInput {
  orderNumber: string;
  customerName: string;
  items: OrderInventoryInput[];
}

export interface OrderUpdate {
  customerName: string;
  items: OrderInventoryInput[];
}

export interface OrderListDTO {
  id: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  createdAt: string;
}
