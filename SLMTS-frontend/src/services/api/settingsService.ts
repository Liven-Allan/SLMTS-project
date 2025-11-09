/**
 * Settings Service for SLMTS Frontend
 * Handles all business settings and service management operations
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  BusinessSettings,
  UpdateBusinessSettingsRequest,
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
  ServiceQueryParams,
  PaginatedResponse,
  ServiceStats,
} from './types';

/**
 * Business Settings Service Class
 * Provides methods for business configuration management
 */
export class SettingsService {
  /**
   * Get current business settings
   * @returns Promise<BusinessSettings>
   */
  static async getBusinessSettings(): Promise<BusinessSettings> {
    try {
      const response = await apiClient.get<BusinessSettings>(API_ENDPOINTS.SETTINGS);
      return response;
    } catch (error) {
      console.error('Error fetching business settings:', error);
      throw error;
    }
  }

  /**
   * Update business settings
   * @param settingsData - Updated settings data
   * @returns Promise<BusinessSettings>
   */
  static async updateBusinessSettings(
    settingsData: UpdateBusinessSettingsRequest
  ): Promise<BusinessSettings> {
    try {
      const response = await apiClient.patch<BusinessSettings>(
        API_ENDPOINTS.SETTINGS_CURRENT,
        settingsData
      );
      return response;
    } catch (error) {
      console.error('Error updating business settings:', error);
      throw error;
    }
  }
}

/**
 * Service Management Service Class
 * Provides methods for laundry service management
 */
export class ServiceManagementService {
  /**
   * Get all services with optional filtering and pagination
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<PaginatedResponse<Service>>
   */
  static async getServices(params?: ServiceQueryParams): Promise<PaginatedResponse<Service>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Service>>(
        API_ENDPOINTS.SERVICES,
        params
      );
      return response;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * Get a specific service by ID
   * @param id - Service ID
   * @returns Promise<Service>
   */
  static async getServiceById(id: number): Promise<Service> {
    try {
      const response = await apiClient.get<Service>(API_ENDPOINTS.SERVICE_BY_ID(id));
      return response;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new service
   * @param serviceData - Service data for creation
   * @returns Promise<Service>
   */
  static async createService(serviceData: CreateServiceRequest): Promise<Service> {
    try {
      const response = await apiClient.post<Service>(API_ENDPOINTS.SERVICES, serviceData);
      return response;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  /**
   * Update an existing service
   * @param id - Service ID
   * @param serviceData - Updated service data
   * @returns Promise<Service>
   */
  static async updateService(
    id: number,
    serviceData: Partial<UpdateServiceRequest>
  ): Promise<Service> {
    try {
      const response = await apiClient.patch<Service>(
        API_ENDPOINTS.SERVICE_BY_ID(id),
        serviceData
      );
      return response;
    } catch (error) {
      console.error(`Error updating service ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a service
   * @param id - Service ID
   * @returns Promise<void>
   */
  static async deleteService(id: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.SERVICE_BY_ID(id)
      );
      return response;
    } catch (error) {
      console.error(`Error deleting service ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get only active services
   * @returns Promise<Service[]>
   */
  static async getActiveServices(): Promise<Service[]> {
    try {
      const response = await apiClient.get<Service[]>(API_ENDPOINTS.SERVICES_ACTIVE);
      return response;
    } catch (error) {
      console.error('Error fetching active services:', error);
      throw error;
    }
  }

  /**
   * Get service statistics
   * @returns Promise<ServiceStats>
   */
  static async getServiceStats(): Promise<ServiceStats> {
    try {
      const response = await apiClient.get<ServiceStats>(API_ENDPOINTS.SERVICE_STATS);
      return response;
    } catch (error) {
      console.error('Error fetching service stats:', error);
      throw error;
    }
  }

  /**
   * Search services by name or description
   * @param searchTerm - Search term
   * @returns Promise<PaginatedResponse<Service>>
   */
  static async searchServices(searchTerm: string): Promise<PaginatedResponse<Service>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Service>>(
        API_ENDPOINTS.SERVICES,
        { search: searchTerm }
      );
      return response;
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  }
}

// Export default instances
export default SettingsService;