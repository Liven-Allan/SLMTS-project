/**
 * Authentication API Service
 * Handles user login, registration, and profile management
 */

import { apiClient } from './client';
import { LoginRequest, RegisterRequest, AuthResponse, AuthUser } from './types';

export const authService = {
  /**
   * Register a new user account
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return await apiClient.post<AuthResponse>('/api/auth/register/', data);
  },

  /**
   * Login user with email and password
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return await apiClient.post<AuthResponse>('/api/auth/login/', data);
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>('/api/auth/logout/');
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<AuthUser> => {
    return await apiClient.get<AuthUser>('/api/auth/profile/');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<AuthUser>): Promise<{ message: string; user: AuthUser }> => {
    return await apiClient.put<{ message: string; user: AuthUser }>('/api/auth/profile/update/', data);
  },

  /**
   * Change user password
   */
  changePassword: async (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>('/api/auth/change-password/', data);
  },
};