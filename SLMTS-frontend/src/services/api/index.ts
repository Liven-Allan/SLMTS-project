/**
 * API Services Index
 * Central export point for all API services
 */

// Export API client
export { apiClient, ApiClient } from './client';

// Export configuration
export * from './config';

// Export types
export * from './types';

// Export services
export { default as UserService } from './userService';
export { default as SettingsService, ServiceManagementService } from './settingsService';
export { default as FinancialService } from './financialService';
export { authService } from './authService';
export { orderService } from './orderService';
export { profileService } from './profileService';

// Future service exports
// export { default as OrderService } from './orderService';
// export { default as TaskService } from './taskService';
// export { default as DeliveryService } from './deliveryService';