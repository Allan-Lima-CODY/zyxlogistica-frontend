import { api } from './api';
import { Inventory, InventoryInput, InventoryUpdate } from '../types/Inventory';

export const inventoryService = {
  async getByDateRange(startDate: Date, endDate: Date): Promise<Inventory[]> {
    // Adjust endDate to end of day (23:59:59.999) to include all records from that day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    const response = await api.get<Inventory[]>('/inventory', {
      params: {
        startDate: startDate.toISOString(),
        endDate: adjustedEndDate.toISOString(),
      },
    });
    return response.data;
  },

  async create(inventoryInput: InventoryInput): Promise<Inventory> {
    const response = await api.post<Inventory>('/inventory', inventoryInput);
    return response.data;
  },

  async update(id: string, inventoryUpdate: InventoryUpdate): Promise<Inventory> {
    const response = await api.put<Inventory>(`/inventory/${id}`, inventoryUpdate);
    return response.data;
  },

  async increase(id: string, amount: number): Promise<Inventory> {
    const response = await api.patch<Inventory>(`/inventory/increase/${id}`, amount);
    return response.data;
  },

  async decrease(id: string, amount: number): Promise<Inventory> {
    const response = await api.patch<Inventory>(`/inventory/decrease/${id}`, amount);
    return response.data;
  },

  async toggleActive(id: string): Promise<Inventory> {
    const response = await api.patch<Inventory>(`/inventory/toggle-active/${id}`);
    return response.data;
  },

  async getAvailable(): Promise<Inventory[]> {
    const response = await api.get<Inventory[]>('/inventory/available');
    return response.data;
  },
};
