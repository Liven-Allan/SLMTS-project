/**
 * RFID Tag API Service
 * Handles RFID tag operations for staff verification
 */

import { apiClient } from './client';
import { RFIDTag, CreateRFIDTagRequest, VerifyRFIDTagRequest } from './types';

export const rfidService = {
  /**
   * Get all RFID tags (filtered by user role)
   */
  getRFIDTags: async (params?: {
    status?: string;
    order?: number;
    search?: string;
    ordering?: string;
  }): Promise<{ results: RFIDTag[]; count: number }> => {
    return await apiClient.get('/api/rfid-tags/', params);
  },

  /**
   * Get RFID tags for staff member's assigned orders
   */
  getStaffRFIDTags: async (): Promise<RFIDTag[]> => {
    return await apiClient.get('/api/rfid-tags/for_staff_orders/');
  },

  /**
   * Get a specific RFID tag by ID
   */
  getRFIDTag: async (id: number): Promise<RFIDTag> => {
    return await apiClient.get(`/api/rfid-tags/${id}/`);
  },

  /**
   * Create a new RFID tag
   */
  createRFIDTag: async (data: CreateRFIDTagRequest): Promise<RFIDTag> => {
    return await apiClient.post('/api/rfid-tags/', data);
  },

  /**
   * Update an RFID tag
   */
  updateRFIDTag: async (id: number, data: Partial<RFIDTag>): Promise<RFIDTag> => {
    return await apiClient.patch(`/api/rfid-tags/${id}/`, data);
  },

  /**
   * Verify an RFID tag
   */
  verifyRFIDTag: async (id: number, data: VerifyRFIDTagRequest): Promise<{ message: string; tag: RFIDTag }> => {
    return await apiClient.post(`/api/rfid-tags/${id}/verify/`, data);
  },

  /**
   * Delete an RFID tag
   */
  deleteRFIDTag: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/rfid-tags/${id}/`);
  },
};