import { api } from './api';
import {
  Expedition,
  ExpeditionInput,
  ExpeditionUpdate,
  AvailableOrder,
  AvailableDriver,
  AvailableTruck,
} from '../types/Expedition';

export const expeditionService = {
  async getByDateRange(startDate: Date, endDate: Date): Promise<Expedition[]> {
    // Adjust endDate to end of day (23:59:59.999) to include all records from that day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    const response = await api.get<Expedition[]>('/expedition', {
      params: {
        startDate: startDate.toISOString(),
        endDate: adjustedEndDate.toISOString(),
      },
    });
    return response.data;
  },

  async getById(id: string): Promise<Expedition> {
    const response = await api.get<Expedition>(`/expedition/${id}`);
    return response.data;
  },

  async create(input: ExpeditionInput): Promise<Expedition> {
    const response = await api.post<Expedition>('/expedition', input);
    return response.data;
  },

  async update(id: string, update: ExpeditionUpdate): Promise<Expedition> {
    // Extract orderStatus from update to send as query parameter
    const { orderStatus, ...updateBody } = update;
    
    const response = await api.put<Expedition>(`/expedition/${id}`, updateBody, {
      params: orderStatus !== undefined ? { orderStatus } : {},
    });
    return response.data;
  },

  async getAvailableOrders(): Promise<AvailableOrder[]> {
    const response = await api.get<AvailableOrder[]>('/order/available-for-expedition');
    return response.data;
  },

  async getAvailableDrivers(): Promise<AvailableDriver[]> {
    const response = await api.get<AvailableDriver[]>('/driver/available');
    return response.data;
  },

  async getAvailableTrucks(): Promise<AvailableTruck[]> {
    const response = await api.get<AvailableTruck[]>('/truck/available');
    return response.data;
  },

  async getStats(): Promise<{
    total: number;
    inSeparation: number;
    inTransit: number;
    delivered: number;
    canceled: number;
  }> {
    const response = await api.get('/expedition/stats');
    return response.data;
  },
};
