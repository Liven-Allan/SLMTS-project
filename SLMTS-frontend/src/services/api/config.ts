/**
 * API Configuration for SLMTS Frontend
 * Centralized configuration for API endpoints and settings
 */

// Base API URL - Update this based on your Django server
export const API_BASE_URL = 'http://127.0.0.1:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // User Management
  USERS: '/api/users/',
  USER_BY_ID: (id: number) => `/api/users/${id}/`,
  USERS_BY_ROLE: '/api/users/by_role/',
  USER_STATS: '/api/users/stats/',
  
  // Business Settings
  SETTINGS: '/api/settings/',
  SETTINGS_CURRENT: '/api/settings/current/',
  
  // Services
  SERVICES: '/api/services/',
  SERVICE_BY_ID: (id: number) => `/api/services/${id}/`,
  SERVICES_ACTIVE: '/api/services/active/',
  SERVICE_STATS: '/api/services/stats/',
  
  // Authentication
  AUTH_REGISTER: '/api/auth/register/',
  AUTH_LOGIN: '/api/auth/login/',
  AUTH_LOGOUT: '/api/auth/logout/',
  AUTH_PROFILE: '/api/auth/profile/',
  AUTH_PROFILE_UPDATE: '/api/auth/profile/update/',
  AUTH_CHANGE_PASSWORD: '/api/auth/change-password/',
  
  // Financial endpoints
  FINANCIAL_SUMMARY: '/api/financial/summary/',
  COMPLETED_ORDERS: '/api/financial/completed-orders/',
  INVOICES: '/api/invoices/',
  INVOICE_BY_ID: (id: number) => `/api/invoices/${id}/`,
  GENERATE_INVOICE: '/api/invoices/generate/',
  
  // Future endpoints for other features
  ORDERS: '/api/orders/',
  TASKS: '/api/tasks/',
  DELIVERIES: '/api/deliveries/',
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Request Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// API Response Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;