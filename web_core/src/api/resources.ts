import { apiClient } from './client';
import type { ResourceModel } from './types';

/**
 * Resources API
 */
export const resourcesApi = {
  /**
   * List all available models
   */
  async listModels(): Promise<ResourceModel[]> {
    const response = await apiClient.get<ResourceModel[]>('/resources/models');
    return response.data;
  },

  /**
   * Get model URL by ID
   */
  async getModelUrl(id: string): Promise<{ url: string }> {
    const response = await apiClient.get<{ url: string }>(`/resources/models/${id}`);
    return response.data;
  },

  /**
   * Upload a new model file
   */
  async uploadModel(file: File, type: 'character' | 'room' | 'accessory'): Promise<ResourceModel> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await apiClient.post<ResourceModel>('/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a model by ID
   */
  async deleteModel(id: string): Promise<void> {
    await apiClient.delete(`/resources/models/${id}`);
  },
};

export default resourcesApi;
