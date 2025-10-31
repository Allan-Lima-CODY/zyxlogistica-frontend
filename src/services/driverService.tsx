import { api } from './api';
import { Driver, DriverInput, DriverUpdate } from '../types/Driver';

export const driverService = {
  async getByDateRange(startDate: Date, endDate: Date): Promise<Driver[]> {
    // Adjust endDate to end of day (23:59:59.999) to include all records from that day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    const response = await api.get<Driver[]>('/driver', {
      params: {
        startDate: startDate.toISOString(),
        endDate: adjustedEndDate.toISOString(),
      },
    });
    return response.data;
  },

  async create(driverInput: DriverInput): Promise<Driver> {
    const response = await api.post<Driver>('/driver', driverInput);
    return response.data;
  },

  async update(id: string, driverUpdate: DriverUpdate): Promise<Driver> {
    const response = await api.put<Driver>(`/driver/${id}`, driverUpdate);
    return response.data;
  },

  async toggleStatus(id: string): Promise<Driver> {
    const response = await api.patch<Driver>(`/driver/toggle-status/${id}`);
    return response.data;
  },

  async getAvailable(): Promise<Driver[]> {
    const response = await api.get<Driver[]>('/driver/available');
    return response.data;
  },
};
