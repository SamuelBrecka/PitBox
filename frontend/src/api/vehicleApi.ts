import { apiClient } from './client';
import { CreateVehiclePayload, MileageLog, UpdateMileagePayload, UpdateVehiclePayload, Vehicle } from '../types/vehicle';

export const vehicleApi = {
  getVehicles: async (): Promise<Vehicle[]> => {
    const { data } = await apiClient.get<Vehicle[]>('/vehicles');
    return data;
  },

  getVehicle: async (id: string): Promise<Vehicle> => {
    const { data } = await apiClient.get<Vehicle>(`/vehicles/${id}`);
    return data;
  },

  createVehicle: async (payload: CreateVehiclePayload): Promise<Vehicle> => {
    const { data } = await apiClient.post<Vehicle>('/vehicles', payload);
    return data;
  },

  updateVehicle: async (id: string, payload: UpdateVehiclePayload): Promise<Vehicle> => {
    const { data } = await apiClient.put<Vehicle>(`/vehicles/${id}`, payload);
    return data;
  },

  deleteVehicle: async (id: string): Promise<void> => {
    await apiClient.delete(`/vehicles/${id}`);
  },

  updateMileage: async (id: string, payload: UpdateMileagePayload): Promise<Vehicle> => {
    const { data } = await apiClient.patch<Vehicle>(`/vehicles/${id}/mileage`, payload);
    return data;
  },

  uploadPhoto: async (id: string, file: File): Promise<Vehicle> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<Vehicle>(`/vehicles/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  deletePhoto: async (id: string): Promise<Vehicle> => {
    const { data } = await apiClient.delete<Vehicle>(`/vehicles/${id}/photo`);
    return data;
  },

  getMileageLogs: async (id: string): Promise<MileageLog[]> => {
    const { data } = await apiClient.get<MileageLog[]>(`/vehicles/${id}/mileage-logs`);
    return data;
  },
};
