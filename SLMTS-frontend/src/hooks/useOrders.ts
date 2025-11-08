/**
 * Order Management Hooks
 * Custom React hooks for order operations
 */

import { useState, useEffect, useCallback } from 'react';
import { orderService } from '@/services/api/orderService';
import { Order, CreateOrderRequest, OrderStats } from '@/services/api/types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOrders = useCallback(async (params?: {
    status?: string;
    current_stage?: string;
    customer?: number;
    search?: string;
    ordering?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrders(params);
      setOrders(response.results);
      setTotalCount(response.count);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchOrders = useCallback(async (searchTerm: string) => {
    await fetchOrders({ search: searchTerm });
  }, [fetchOrders]);

  const filterByStatus = useCallback(async (status: string) => {
    await fetchOrders({ status });
  }, [fetchOrders]);

  const filterByStage = useCallback(async (stage: string) => {
    await fetchOrders({ current_stage: stage });
  }, [fetchOrders]);

  const refresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    totalCount,
    fetchOrders,
    searchOrders,
    filterByStatus,
    filterByStage,
    refresh,
  };
};

export const useOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (data: CreateOrderRequest): Promise<Order> => {
    try {
      setLoading(true);
      setError(null);
      const order = await orderService.createOrder(data);
      return order;
    } catch (error: any) {
      let errorMessage = 'Failed to create order';
      
      // Handle specific error types
      if (error.status === 500) {
        errorMessage = 'Server error occurred. Please try again.';
      } else if (error.status === 400) {
        errorMessage = error.message || 'Invalid order data provided';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id: number, data: Partial<Order>): Promise<Order> => {
    try {
      setLoading(true);
      setError(null);
      const order = await orderService.updateOrder(id, data);
      return order;
    } catch (error: any) {
      setError(error.message || 'Failed to update order');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await orderService.deleteOrder(id);
    } catch (error: any) {
      setError(error.message || 'Failed to delete order');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStage = async (id: number, stage: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await orderService.updateOrderStage(id, stage);
    } catch (error: any) {
      setError(error.message || 'Failed to update order stage');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStage,
    loading,
    error,
  };
};

export const useOrderStats = () => {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderStats = await orderService.getOrderStats();
      setStats(orderStats);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch order statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
};