/**
 * API Client for SLMTS Frontend
 * Centralized HTTP client with error handling and request/response interceptors
 */

import { API_BASE_URL, DEFAULT_HEADERS, HTTP_STATUS } from './config';
import { ApiError } from './types';

/**
 * Custom API Client Class
 * Handles all HTTP requests with proper error handling and response formatting
 */
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private csrfToken: string | null = null;
  private authToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = DEFAULT_HEADERS;
    this.loadAuthToken();
  }

  /**
   * Load authentication token from localStorage
   */
  private loadAuthToken(): void {
    if (typeof localStorage !== 'undefined') {
      this.authToken = localStorage.getItem('auth_token');
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  /**
   * Get CSRF token from cookie
   */
  private getCSRFToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }

  /**
   * Ensure CSRF token is available
   */
  private async ensureCSRFToken(): Promise<void> {
    if (!this.csrfToken) {
      this.csrfToken = this.getCSRFToken();
      
      if (!this.csrfToken) {
        try {
          // Fetch CSRF token from backend
          const response = await fetch(this.buildURL('/api/auth/csrf/'), {
            method: 'GET',
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            this.csrfToken = data.csrfToken;
          }
        } catch (error) {
          console.warn('Failed to fetch CSRF token:', error);
        }
      }
    }
  }

  /**
   * Build full URL from endpoint
   */
  private buildURL(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    let data: any;
    
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      throw new Error('Failed to parse response');
    }

    if (!response.ok) {
      const apiError: ApiError = {
        message: data.message || data.detail || 'An error occurred',
        status: response.status,
        details: data,
      };
      
      throw apiError;
    }

    return data;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Ensure CSRF token is available for non-GET requests
    if (options.method && options.method !== 'GET') {
      await this.ensureCSRFToken();
    }

    const url = this.buildURL(endpoint);
    
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(options.headers as Record<string, string> || {}),
    };

    // Add authentication token if available
    if (this.authToken) {
      headers['Authorization'] = `Token ${this.authToken}`;
    }

    // Add CSRF token for non-GET requests (fallback for session auth)
    if (this.csrfToken && options.method && options.method !== 'GET') {
      headers['X-CSRFToken'] = this.csrfToken;
    }
    
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Include cookies for session-based auth
      headers,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response);
    } catch (error) {
      // If it's already an API error from handleResponse, re-throw it
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }
      
      // Handle actual network errors (connection issues, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Please check your connection');
      }
      
      // Re-throw other errors as-is
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? this.buildQueryString(params) : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export { ApiClient };