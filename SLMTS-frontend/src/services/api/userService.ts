/**
 * User Service for SLMTS Frontend
 * Handles all user-related API operations
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
  PaginatedResponse,
  UserStats,
  UsersByRole,
} from './types';

/**
 * User Service Class
 * Provides methods for all user management operations
 */
export class UserService {
  /**
   * Get all users with optional filtering and pagination
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<PaginatedResponse<User>>
   */
  static async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiClient.get<PaginatedResponse<User>>(
        API_ENDPOINTS.USERS,
        params
      );
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get a specific user by ID
   * @param id - User ID
   * @returns Promise<User>
   */
  static async getUserById(id: number): Promise<User> {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.USER_BY_ID(id));
      return response;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param userData - User data for creation
   * @returns Promise<User>
   */
  static async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await apiClient.post<User>(API_ENDPOINTS.USERS, userData);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   * @param id - User ID
   * @param userData - Updated user data
   * @returns Promise<User>
   */
  static async updateUser(id: number, userData: Partial<UpdateUserRequest>): Promise<User> {
    try {
      const response = await apiClient.patch<User>(
        API_ENDPOINTS.USER_BY_ID(id),
        userData
      );
      return response;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a user
   * @param id - User ID
   * @returns Promise<void>
   */
  static async deleteUser(id: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.USER_BY_ID(id)
      );
      return response;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get users grouped by role
   * @returns Promise<UsersByRole>
   */
  static async getUsersByRole(): Promise<UsersByRole> {
    try {
      const response = await apiClient.get<UsersByRole>(API_ENDPOINTS.USERS_BY_ROLE);
      return response;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * @returns Promise<UserStats>
   */
  static async getUserStats(): Promise<UserStats> {
    try {
      const response = await apiClient.get<UserStats>(API_ENDPOINTS.USER_STATS);
      return response;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * Search users by name, email, or phone
   * @param searchTerm - Search term
   * @returns Promise<PaginatedResponse<User>>
   */
  static async searchUsers(searchTerm: string): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiClient.get<PaginatedResponse<User>>(
        API_ENDPOINTS.USERS,
        { search: searchTerm }
      );
      return response;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Get users by specific role
   * @param role - User role to filter by
   * @returns Promise<PaginatedResponse<User>>
   */
  static async getUsersBySpecificRole(role: string): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiClient.get<PaginatedResponse<User>>(
        API_ENDPOINTS.USERS,
        { role }
      );
      return response;
    } catch (error) {
      console.error(`Error fetching ${role} users:`, error);
      throw error;
    }
  }
}

// Export default instance
export default UserService;