export interface Truck {
  id: string;
  licensePlate: string;
  model: string;
  year: number;
  capacityKg: number;
  available: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TruckInput {
  licensePlate: string;
  model: string;
  year: number;
  capacityKg: number;
}

export interface TruckUpdate {
  model: string;
  year: number;
  capacityKg: number;
}
