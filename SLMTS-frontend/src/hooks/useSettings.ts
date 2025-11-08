/**
 * React Hooks for Settings Management
 * Custom hooks for managing business settings and services
 */

import { useState, useEffect, useCallback } from 'react';
import { SettingsService, ServiceManagementService } from '@/services/api';
import {
  BusinessSettings,
  UpdateBusinessSettingsRequest,
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
  ServiceQueryParams,
  PaginatedResponse,
  ServiceStats,
  ApiError,
} from '@/services/api/types';

// =============================================================================
// TYPES FOR HOOKS
// =============================================================================

interface UseBusinessSettingsState {
  settings: BusinessSettings | null;
  loading: boolean;
  error: string | null;
}

interface UseServicesState {
  services: Service[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface UseServiceState {
  service: Service | null;
  loading: boolean;
  error: string | null;
}

interface UseServiceStatsState {
  stats: ServiceStats | null;
  loading: boolean;
  error: string | null;
}

// =============================================================================
// BUSINESS SETTINGS HOOK
// =============================================================================

/**
 * Hook for managing business settings
 */
export const useBusinessSettings = () => {
  const [state, setState] = useState<UseBusinessSettingsState>({
    settings: null,
    loading: false,
    error: null,
  });

  /**
   * Fetch business settings from API
   */
  const fetchSettings = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const settings = await SettingsService.getBusinessSettings();
      setState(prev => ({ ...prev, settings, loading: false }));
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to fetch business settings',
      }));
    }
  }, []);

  /**
   * Update business settings
   */
  const updateSettings = useCallback(async (
    settingsData: UpdateBusinessSettingsRequest
  ): Promise<BusinessSettings | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const updatedSettings = await SettingsService.updateBusinessSettings(settingsData);
      setState(prev => ({ ...prev, settings: updatedSettings, loading: false }));
      return updatedSettings;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to update business settings',
      }));
      return null;
    }
  }, []);

  /**
   * Refresh settings
   */
  const refresh = useCallback(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    ...state,
    updateSettings,
    refresh,
  };
};

// =============================================================================
// SERVICES LIST HOOK
// =============================================================================

/**
 * Hook for managing services list with filtering and pagination
 */
export const useServices = (initialParams?: ServiceQueryParams) => {
  const [state, setState] = useState<UseServicesState>({
    services: [],
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    hasNext: false,
    hasPrevious: false,
  });

  const [queryParams, setQueryParams] = useState<ServiceQueryParams>(
    initialParams || {}
  );

  /**
   * Fetch services from API
   */
  const fetchServices = useCallback(async (params?: ServiceQueryParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response: PaginatedResponse<Service> = await ServiceManagementService.getServices(
        params || queryParams
      );

      setState(prev => ({
        ...prev,
        services: response.results,
        totalCount: response.count,
        hasNext: !!response.next,
        hasPrevious: !!response.previous,
        loading: false,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to fetch services',
      }));
    }
  }, [queryParams]);

  /**
   * Update query parameters and refetch
   */
  const updateParams = useCallback((newParams: Partial<ServiceQueryParams>) => {
    const updatedParams = { ...queryParams, ...newParams };
    setQueryParams(updatedParams);
    fetchServices(updatedParams);
  }, [queryParams, fetchServices]);

  /**
   * Search services
   */
  const searchServices = useCallback((searchTerm: string) => {
    updateParams({ search: searchTerm, page: 1 });
  }, [updateParams]);

  /**
   * Filter by status
   */
  const filterByStatus = useCallback((status: string | undefined) => {
    updateParams({ status: status as any, page: 1 });
  }, [updateParams]);

  /**
   * Filter by unit
   */
  const filterByUnit = useCallback((unit: string | undefined) => {
    updateParams({ unit: unit as any, page: 1 });
  }, [updateParams]);

  /**
   * Change page
   */
  const changePage = useCallback((page: number) => {
    updateParams({ page });
  }, [updateParams]);

  /**
   * Refresh services list
   */
  const refresh = useCallback(() => {
    fetchServices();
  }, [fetchServices]);

  // Initial fetch
  useEffect(() => {
    fetchServices();
  }, []);

  return {
    ...state,
    queryParams,
    fetchServices,
    updateParams,
    searchServices,
    filterByStatus,
    filterByUnit,
    changePage,
    refresh,
  };
};

// =============================================================================
// SINGLE SERVICE HOOK
// =============================================================================

/**
 * Hook for managing single service operations
 */
export const useService = (serviceId?: number) => {
  const [state, setState] = useState<UseServiceState>({
    service: null,
    loading: false,
    error: null,
  });

  /**
   * Fetch service by ID
   */
  const fetchService = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const service = await ServiceManagementService.getServiceById(id);
      setState(prev => ({ ...prev, service, loading: false }));
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to fetch service',
      }));
    }
  }, []);

  /**
   * Create new service
   */
  const createService = useCallback(async (
    serviceData: CreateServiceRequest
  ): Promise<Service | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const service = await ServiceManagementService.createService(serviceData);
      setState(prev => ({ ...prev, service, loading: false }));
      return service;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to create service',
      }));
      return null;
    }
  }, []);

  /**
   * Update service
   */
  const updateService = useCallback(async (
    id: number,
    serviceData: Partial<UpdateServiceRequest>
  ): Promise<Service | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const service = await ServiceManagementService.updateService(id, serviceData);
      setState(prev => ({ ...prev, service, loading: false }));
      return service;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to update service',
      }));
      return null;
    }
  }, []);

  /**
   * Delete service
   */
  const deleteService = useCallback(async (id: number): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await ServiceManagementService.deleteService(id);
      setState(prev => ({ ...prev, service: null, loading: false }));
      return true;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to delete service',
      }));
      return false;
    }
  }, []);

  // Fetch service on mount if ID provided
  useEffect(() => {
    if (serviceId) {
      fetchService(serviceId);
    }
  }, [serviceId, fetchService]);

  return {
    ...state,
    fetchService,
    createService,
    updateService,
    deleteService,
  };
};

// =============================================================================
// SERVICE STATS HOOK
// =============================================================================

/**
 * Hook for service statistics
 */
export const useServiceStats = () => {
  const [state, setState] = useState<UseServiceStatsState>({
    stats: null,
    loading: false,
    error: null,
  });

  /**
   * Fetch service statistics
   */
  const fetchStats = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const stats = await ServiceManagementService.getServiceStats();
      setState(prev => ({ ...prev, stats, loading: false }));
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to fetch service statistics',
      }));
    }
  }, []);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    fetchStats,
  };
};