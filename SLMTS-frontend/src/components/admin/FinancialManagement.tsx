/**
 * Financial Management Component for Admin Dashboard
 * Displays financial overview with revenue, payments, and invoices
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Clock, Eye, Download, Loader2, AlertCircle } from "lucide-react";
import { useFinancialData } from '@/hooks/useFinancial';

/**
 * Financial Management Component
 */
const FinancialManagement: React.FC = () => {
  const {
    summary,
    orders,
    loading,
    error,
    refreshAll
  } = useFinancialData(); // Get completed orders

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `UGX ${amount.toLocaleString()}`;
  };

  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-secondary text-secondary-foreground';
      case 'completed': return 'bg-secondary text-secondary-foreground';
      case 'pending': return 'bg-accent text-accent-foreground';
      case 'overdue': return 'bg-destructive text-destructive-foreground';
      case 'cancelled': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading financial data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-destructive">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial Overview</h2>
          <p className="text-muted-foreground">Monitor revenue and payment status</p>
        </div>
        <Button 
          variant="outline" 
          onClick={refreshAll}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Revenue Card */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {summary ? formatCurrency(summary.monthly_revenue) : 'UGX 0'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              From {summary?.completed_orders || 0} completed orders
            </p>
          </CardContent>
        </Card>

        {/* Pending Payments Card */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Pending Payments</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {summary ? formatCurrency(summary.pending_payments) : 'UGX 0'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {summary?.pending_orders || 0} orders in process
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Completed Orders Table */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Recent Completed Orders</CardTitle>
          <CardDescription>Latest completed orders and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.amount)}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)} variant="outline">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" title="View order">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Download receipt">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Empty State */}
          {orders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No completed orders found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialManagement;