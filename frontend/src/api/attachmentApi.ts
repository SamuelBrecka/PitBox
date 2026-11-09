import { apiClient } from './client';
import { Attachment } from '../types/serviceRecord';

export const attachmentApi = {
  uploadAttachments: async (vehicleId: string, recordId: string, files: File[]): Promise<Attachment[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    const { data } = await apiClient.post<Attachment[]>(
      `/vehicles/${vehicleId}/service-records/${recordId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  getAttachmentsByRecord: async (vehicleId: string, recordId: string): Promise<Attachment[]> => {
    const { data } = await apiClient.get<Attachment[]>(
      `/vehicles/${vehicleId}/service-records/${recordId}/attachments`
    );
    return data;
  },

  getAttachmentsByVehicle: async (vehicleId: string): Promise<Attachment[]> => {
    const { data } = await apiClient.get<Attachment[]>(`/vehicles/${vehicleId}/attachments`);
    return data;
  },

  deleteAttachment: async (vehicleId: string, recordId: string, attachmentId: string): Promise<void> => {
    await apiClient.delete(`/vehicles/${vehicleId}/service-records/${recordId}/attachments/${attachmentId}`);
  },
};
