import { api } from './api';
import { Order, OrderInput, OrderUpdate, OrderListDTO } from '../types/Order';

export const orderService = {
  async getByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    // Adjust endDate to end of day (23:59:59.999) to include all records from that day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    const response = await api.get<Order[]>('/order', {
      params: {
        startDate: startDate.toISOString(),
        endDate: adjustedEndDate.toISOString(),
      },
    });
    return response.data;
  },

  async create(orderInput: OrderInput): Promise<Order> {
    const response = await api.post<Order>('/order', orderInput);
    return response.data;
  },

  async update(id: string, orderUpdate: OrderUpdate): Promise<Order> {
    const response = await api.put<Order>(`/order/${id}`, orderUpdate);
    return response.data;
  },

  async getAvailableForExpedition(): Promise<OrderListDTO[]> {
    const response = await api.get<OrderListDTO[]>('/order/available-for-expedition');
    return response.data;
  },
};
