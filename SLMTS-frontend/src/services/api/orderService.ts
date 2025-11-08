/**
 * Order API Service
 * Handles order creation, tracking, and management
 */

import { apiClient } from './client';
import { Order, CreateOrderRequest, OrderStats } from './types';

export const orderService = {
  /**
   * Get all orders (filtered by user role)
   */
  getOrders: async (params?: {
    status?: string;
    current_stage?: string;
    customer?: number;
    search?: string;
    ordering?: string;
  }): Promise<{ results: Order[]; count: number }> => {
    return await apiClient.get('/api/orders/', params);
  },

  /**
   * Get a specific order by ID
   */
  getOrder: async (id: number): Promise<Order> => {
    return await apiClient.get(`/api/orders/${id}/`);
  },

  /**
   * Create a new order
   */
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    return await apiClient.post('/api/orders/', data);
  },

  /**
   * Update an existing order
   */
  updateOrder: async (id: number, data: Partial<Order>): Promise<Order> => {
    return await apiClient.put(`/api/orders/${id}/`, data);
  },

  /**
   * Delete an order
   */
  deleteOrder: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/orders/${id}/`);
  },

  /**
   * Update order stage
   */
  updateOrderStage: async (id: number, stage: string): Promise<{ message: string }> => {
    return await apiClient.post(`/api/orders/${id}/update_stage/`, { stage });
  },

  /**
   * Get orders for a specific customer
   */
  getCustomerOrders: async (customerId: number): Promise<Order[]> => {
    return await apiClient.get('/api/orders/customer_orders/', { customer_id: customerId });
  },

  /**
   * Get order statistics
   */
  getOrderStats: async (): Promise<OrderStats> => {
    return await apiClient.get('/api/orders/stats/');
  },
};