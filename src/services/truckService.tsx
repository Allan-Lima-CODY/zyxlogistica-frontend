import { api } from './api';
import { Truck, TruckInput, TruckUpdate } from '../types/Truck';

export const truckService = {
  async getByDateRange(startDate: Date, endDate: Date): Promise<Truck[]> {
    // Adjust endDate to end of day (23:59:59.999) to include all records from that day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    const response = await api.get<Truck[]>('/truck', {
      params: {
        startDate: startDate.toISOString(),
        endDate: adjustedEndDate.toISOString(),
      },
    });
    return response.data;
  },

  async create(truckInput: TruckInput): Promise<Truck> {
    const response = await api.post<Truck>('/truck', truckInput);
    return response.data;
  },

  async update(id: string, truckUpdate: TruckUpdate): Promise<Truck> {
    const response = await api.put<Truck>(`/truck/${id}`, truckUpdate);
    return response.data;
  },

  async getAvailable(): Promise<Truck[]> {
    const response = await api.get<Truck[]>('/truck/available');
    return response.data;
  },
};
