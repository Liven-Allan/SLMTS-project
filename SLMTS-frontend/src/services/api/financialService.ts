/**
 * Financial Service for SLMTS Frontend
 * Handles all financial-related API operations
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

/**
 * Financial Summary Interface
 */
export interface FinancialSummary {
  monthly_revenue: number;
  pending_payments: number;
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
}

/**
 * Invoice Interface
 */
export interface Invoice {
  id: number;
  invoice_id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  invoice_date: string;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled' | 'completed';
  order_id?: string;
}

/**
 * Completed Order Interface (for financial table)
 */
export interface CompletedOrder {
  id: number;
  order_id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  created_at: string;
  status: string;
}

/**
 * Financial Service Class
 */
export class FinancialService {
  /**
   * Get financial summary data
   * @returns Promise<FinancialSummary>
   */
  static async getFinancialSummary(): Promise<FinancialSummary> {
    try {
      const response = await apiClient.get<FinancialSummary>(
        API_ENDPOINTS.FINANCIAL_SUMMARY
      );
      return response;
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  }

  /**
   * Get recent invoices
   * @param limit - Number of invoices to fetch (default: 10)
   * @returns Promise<Invoice[]>
   */
  static async getRecentInvoices(limit: number = 10): Promise<Invoice[]> {
    try {
      const response = await apiClient.get<{ results: Invoice[] }>(
        API_ENDPOINTS.INVOICES,
        { limit, ordering: '-invoice_date' }
      );
      return response.results;
    } catch (error) {
      console.error('Error fetching recent invoices:', error);
      throw error;
    }
  }

  /**
   * Get completed orders for financial table
   * @returns Promise<CompletedOrder[]>
   */
  static async getCompletedOrders(): Promise<CompletedOrder[]> {
    try {
      const response = await apiClient.get<CompletedOrder[]>(
        API_ENDPOINTS.COMPLETED_ORDERS
      );
      return response;
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   * @param id - Invoice ID
   * @returns Promise<Invoice>
   */
  static async getInvoiceById(id: number): Promise<Invoice> {
    try {
      const response = await apiClient.get<Invoice>(
        API_ENDPOINTS.INVOICE_BY_ID(id)
      );
      return response;
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error);
      throw error;
    }
  }

  /**
   * Generate invoice for an order
   * @param orderId - Order ID
   * @returns Promise<Invoice>
   */
  static async generateInvoice(orderId: number): Promise<Invoice> {
    try {
      const response = await apiClient.post<Invoice>(
        API_ENDPOINTS.GENERATE_INVOICE,
        { order_id: orderId }
      );
      return response;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  }

  /**
   * Update invoice status
   * @param id - Invoice ID
   * @param status - New status
   * @returns Promise<Invoice>
   */
  static async updateInvoiceStatus(
    id: number, 
    status: Invoice['status']
  ): Promise<Invoice> {
    try {
      const response = await apiClient.patch<Invoice>(
        API_ENDPOINTS.INVOICE_BY_ID(id),
        { status }
      );
      return response;
    } catch (error) {
      console.error(`Error updating invoice ${id} status:`, error);
      throw error;
    }
  }
}

// Export default instance
export default FinancialService;