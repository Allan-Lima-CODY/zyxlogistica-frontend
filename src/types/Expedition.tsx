export enum OrderStatus {
  Pending = 0,
  InSeparation = 1,
  InTransit = 2,
  Delivered = 3,
  Canceled = 4,
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Pendente',
  [OrderStatus.InSeparation]: 'Em Separação',
  [OrderStatus.InTransit]: 'Em Trânsito',
  [OrderStatus.Delivered]: 'Entregue',
  [OrderStatus.Canceled]: 'Cancelado',
};

export interface Expedition {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  orderStatus: string;
  driverId: string;
  driverName: string;
  truckId: string;
  truckModel: string;
  truckPlate: string;
  deliveryForecast: string;
  observation: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ExpeditionInput {
  orderId: string;
  driverId: string;
  truckId: string;
  deliveryForecast: string;
  observation: string;
}

export interface ExpeditionUpdate {
  deliveryForecast: string;
  observation: string;
  driverId: string;
  truckId: string;
  orderStatus?: OrderStatus;
}

export interface AvailableOrder {
  id: string;
  customerName: string;
  status: OrderStatus;
  createdAt: string;
}

export interface AvailableDriver {
  id: string;
  name: string;
  cnh: string;
  active: boolean;
}

export interface AvailableTruck {
  id: string;
  licensePlate: string;
  model: string;
  modelYear: number;
  available: boolean;
}
