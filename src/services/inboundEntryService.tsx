import { api } from './api';
import { InboundEntry, InboundEntryInput, InboundEntryUpdate } from '../types/InboundEntry';

export const inboundEntryService = {
  async getByDateRange(startDate: Date, endDate: Date): Promise<InboundEntry[]> {
    // Adjust endDate to end of day (23:59:59.999) to include all records from that day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    const response = await api.get<InboundEntry[]>('/inbound-entry', {
      params: {
        startDate: startDate.toISOString(),
        endDate: adjustedEndDate.toISOString(),
      },
    });
    return response.data;
  },

  async getById(id: string): Promise<InboundEntry | null> {
    const response = await api.get<InboundEntry>(`/inbound-entry/${id}`);
    return response.data;
  },

  async create(input: InboundEntryInput): Promise<InboundEntry> {
    const response = await api.post<InboundEntry>('/inbound-entry', input);
    return response.data;
  },

  async update(id: string, update: InboundEntryUpdate): Promise<InboundEntry> {
    const response = await api.put<InboundEntry>(`/inbound-entry/${id}`, update);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/inbound-entry/${id}`);
  },
};
