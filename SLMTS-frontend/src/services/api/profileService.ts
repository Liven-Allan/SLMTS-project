/**
 * Profile API Service
 * Handles user profile operations
 */

import { apiClient } from './client';
import { User } from './types';

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface UserStatistics {
  total_orders: number;
  total_spent: number;
  orders_by_status: {
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  member_since: string | null;
  recent_orders: Array<{
    order_id: string;
    amount: number;
    status: string;
    created_at: string;
  }>;
}

export const profileService = {
  /**
   * Get current user's profile
   */
  getProfile: async (): Promise<User> => {
    return await apiClient.get('/api/auth/profile/');
  },

  /**
   * Update current user's profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<{ message: string; user: User }> => {
    return await apiClient.put('/api/auth/profile/update/', data);
  },

  /**
   * Change user password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    return await apiClient.post('/api/auth/change-password/', data);
  },

  /**
   * Get user statistics
   */
  getUserStatistics: async (): Promise<UserStatistics> => {
    return await apiClient.get('/api/auth/statistics/');
  },
};