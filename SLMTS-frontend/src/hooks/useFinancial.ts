/**
 * React Hooks for Financial Management
 * Custom hooks for managing financial state and API operations
 */

import { useState, useEffect, useCallback } from 'react';
import { FinancialService, FinancialSummary, Invoice, CompletedOrder } from '@/services/api/financialService';
import { ApiError } from '@/services/api/types';

// =============================================================================
// TYPES FOR HOOKS
// =============================================================================

interface UseFinancialSummaryState {
  summary: FinancialSummary | null;
  loading: boolean;
  error: string | null;
}

interface UseInvoicesState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
}

interface UseCompletedOrdersState {
  orders: CompletedOrder[];
  loading: boolean;
  error: string | null;
}

// =============================================================================
// FINANCIAL SUMMARY HOOK
// =============================================================================

/**
 * Hook for managing financial summary data
 */
export const useFinancialSummary = () => {
  const [state, setState] = useState<UseFinancialSummaryState>({
    summary: null,
    loading: false,
    error: null,
  });

  /**
   * Fetch financial summary from API
   */
  const fetchSummary = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const summary = await FinancialService.getFinancialSummary();
      setState(prev => ({ ...prev, summary, loading: false }));
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to fetch financial summary',
      }));
    }
  }, []);

  /**
   * Refresh financial summary
   */
  const refresh = useCallback(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Initial fetch
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    ...state,
    fetchSummary,
    refresh,
  };
};

// =============================================================================
// INVOICES HOOK
// =============================================================================

/**
 * Hook for managing invoices data
 */
export const useInvoices = (limit: number = 10) => {
  const [state, setState] = useState<UseInvoicesState>({
    invoices: [],
    loading: false,
    error: null,
  });

  /**
   * Fetch invoices from API
   */
  const fetchInvoices = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const invoices = await FinancialService.getRecentInvoices(limit);
      setState(prev => ({ ...prev, invoices, loading: false }));
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to fetch invoices',
      }));
    }
  }, [limit]);

  /**
   * Refresh invoices
   */
  const refresh = useCallback(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Initial fetch
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    ...state,
    fetchInvoices,
    refresh,
  };
};

// =============================================================================
// COMPLETED ORDERS HOOK
// =============================================================================

/**
 * Hook for managing completed orders data
 */
export const useCompletedOrders = () => {
  const [state, setState] = useState<UseCompletedOrdersState>({
    orders: [],
    loading: false,
    error: null,
  });

  /**
   * Fetch completed orders from API
   */
  const fetchOrders = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const orders = await FinancialService.getCompletedOrders();
      setState(prev => ({ ...prev, orders, loading: false }));
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to fetch completed orders',
      }));
    }
  }, []);

  /**
   * Refresh completed orders
   */
  const refresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    ...state,
    fetchOrders,
    refresh,
  };
};

// =============================================================================
// COMBINED FINANCIAL HOOK
// =============================================================================

/**
 * Hook that combines financial summary and completed orders
 */
export const useFinancialData = () => {
  const summaryHook = useFinancialSummary();
  const ordersHook = useCompletedOrders();

  const refreshAll = useCallback(() => {
    summaryHook.refresh();
    ordersHook.refresh();
  }, [summaryHook, ordersHook]);

  return {
    summary: summaryHook.summary,
    summaryLoading: summaryHook.loading,
    summaryError: summaryHook.error,
    
    orders: ordersHook.orders,
    ordersLoading: ordersHook.loading,
    ordersError: ordersHook.error,
    
    loading: summaryHook.loading || ordersHook.loading,
    error: summaryHook.error || ordersHook.error,
    
    refreshAll,
    refreshSummary: summaryHook.refresh,
    refreshOrders: ordersHook.refresh,
  };
};