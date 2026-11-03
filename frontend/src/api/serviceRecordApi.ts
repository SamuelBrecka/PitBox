import { apiClient } from './client';
import { CreateServiceRecordPayload, ServiceRecord } from '../types/serviceRecord';

export const serviceRecordApi = {
  getServiceRecords: async (vehicleId: string, category?: string): Promise<ServiceRecord[]> => {
    const params = category && category !== 'ALL' ? { category } : undefined;
    const { data } = await apiClient.get<ServiceRecord[]>(`/vehicles/${vehicleId}/service-records`, { params });
    return data;
  },

  getServiceRecord: async (vehicleId: string, recordId: string): Promise<ServiceRecord> => {
    const { data } = await apiClient.get<ServiceRecord>(`/vehicles/${vehicleId}/service-records/${recordId}`);
    return data;
  },

  createServiceRecord: async (vehicleId: string, payload: CreateServiceRecordPayload): Promise<ServiceRecord> => {
    const { data } = await apiClient.post<ServiceRecord>(`/vehicles/${vehicleId}/service-records`, payload);
    return data;
  },

  updateServiceRecord: async (vehicleId: string, recordId: string, payload: CreateServiceRecordPayload): Promise<ServiceRecord> => {
    const { data } = await apiClient.put<ServiceRecord>(`/vehicles/${vehicleId}/service-records/${recordId}`, payload);
    return data;
  },

  deleteServiceRecord: async (vehicleId: string, recordId: string): Promise<void> => {
    await apiClient.delete(`/vehicles/${vehicleId}/service-records/${recordId}`);
  },
};
