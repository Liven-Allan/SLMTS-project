import { useState, useEffect } from "react";
import { TrendingUp, Users, Package, DollarSign, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrders, useOrderStats } from "@/hooks/useOrders";
import { useUsers } from "@/hooks/useUsers";
import { useProfile } from "@/hooks/useProfile";
import { Order, User } from "@/services/api/types";

interface StaffWithTasks extends User {
  total_tasks: number;
  active_tasks: number;
  completed_tasks: number;
}

const AdminDashboardOverview = () => {
  const [revenueStats, setRevenueStats] = useState({
    todayRevenue: 0,
    todayConfirmedRevenue: 0,
    todayPendingRevenue: 0,
    monthlyRevenue: 0,
    monthlyConfirmedRevenue: 0,
    monthlyPendingRevenue: 0,
    revenueGrowth: 0
  });

  // Hooks
  const { orders, loading: ordersLoading, error: ordersError, fetchOrders } = useOrders();
  const { stats: orderStats, loading: statsLoading } = useOrderStats();
  const { users, loading: usersLoading, fetchUsers } = useUsers();
  const { getUserStatistics } = useProfile();

  // Load data on component mount
  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  const loadRevenueStats = async () => {
    try {
      // Calculate revenue from completed orders
      const completedOrders = orders.filter(order => order.status === 'completed');
      const todayRevenue = completedOrders
        .filter(order => {
          const orderDate = new Date(order.created_at);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        })
        .reduce((sum, order) => sum + Number(order.amount || 0), 0);

      const monthlyRevenue = completedOrders
        .filter(order => {
          const orderDate = new Date(order.created_at);
          const now = new Date();
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, order) => sum + Number(order.amount || 0), 0);

      setRevenueStats({
        todayRevenue: Number(todayRevenue) || 0,
        todayConfirmedRevenue: Number(todayRevenue) || 0,
        todayPendingRevenue: 0,
        monthlyRevenue: Number(monthlyRevenue) || 0,
        monthlyConfirmedRevenue: Number(monthlyRevenue) || 0,
        monthlyPendingRevenue: 0,
        revenueGrowth: 12.5
      });
    } catch (error) {
      console.error('Failed to load revenue stats:', error);
    }
  };

  // Update revenue stats when orders change
  useEffect(() => {
    if (orders.length > 0) {
      loadRevenueStats();
    }
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "break": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    const numAmount = Number(amount) || 0;
    return `UGX ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRecentOrders = () => {
    return orders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);
  };

  const getActiveStaff = (): StaffWithTasks[] => {
    return users
      .filter(user => user.role === 'staff' && user.status === 'active')
      .slice(0, 4)
      .map(staff => {
        // Count assigned orders for this staff member
        const assignedOrders = orders.filter(order => 
          order.assigned_to?.id === staff.id || order.assigned_to_id === staff.id
        );
        
        return {
          ...staff,
          total_tasks: assignedOrders.length,
          active_tasks: assignedOrders.filter(order => 
            order.status === 'pending' || order.status === 'processing'
          ).length,
          completed_tasks: assignedOrders.filter(order => 
            order.status === 'completed'
          ).length
        };
      });
  };

  const getOrderStatusCounts = () => {
    return {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  };

  const statusCounts = getOrderStatusCounts();
  const totalOrders = orders.length;
  const recentOrders = getRecentOrders();
  const activeStaff = getActiveStaff();

  if (ordersLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-6 w-6 animate-spin mr-2" />
        <span>Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error Messages */}
      {ordersError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>Error loading orders: {ordersError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-secondary/10 text-secondary border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{revenueStats.revenueGrowth}%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Revenue Today</p>
            <p className="text-3xl font-bold text-foreground mt-1">{formatCurrency(revenueStats.todayRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-2">Monthly: {formatCurrency(revenueStats.monthlyRevenue)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-secondary/10 text-secondary border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-3xl font-bold text-foreground mt-1">{totalOrders}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {statusCounts.pending} pending • {statusCounts.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <Badge className="bg-accent/10 text-accent border-0">
                {users.filter(u => u.status === 'active' && u.role === 'staff').length} active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-3xl font-bold text-foreground mt-1">{users.length}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {users.filter(u => u.role === 'customer').length} customers • {users.filter(u => u.role === 'staff').length} staff
            </p>
          </CardContent>
        </Card>


      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Current orders breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  label: "Completed",
                  value: totalOrders > 0 ? Math.round((statusCounts.completed / totalOrders) * 100) : 0,
                  color: "bg-green-500",
                  count: statusCounts.completed
                },
                {
                  label: "Processing",
                  value: totalOrders > 0 ? Math.round((statusCounts.processing / totalOrders) * 100) : 0,
                  color: "bg-blue-500",
                  count: statusCounts.processing
                },
                {
                  label: "Pending",
                  value: totalOrders > 0 ? Math.round((statusCounts.pending / totalOrders) * 100) : 0,
                  color: "bg-yellow-500",
                  count: statusCounts.pending
                },
                {
                  label: "Cancelled",
                  value: totalOrders > 0 ? Math.round((statusCounts.cancelled / totalOrders) * 100) : 0,
                  color: "bg-red-500",
                  count: statusCounts.cancelled
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.count} ({item.value}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Users by role and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  label: "Customers",
                  count: users.filter(u => u.role === 'customer').length,
                  color: "bg-primary"
                },
                {
                  label: "Staff",
                  count: users.filter(u => u.role === 'staff').length,
                  color: "bg-secondary"
                },
                {
                  label: "Drivers",
                  count: users.filter(u => u.role === 'driver').length,
                  color: "bg-accent"
                },
                {
                  label: "Admins",
                  count: users.filter(u => u.role === 'admin').length,
                  color: "bg-destructive"
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No orders found</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{order.order_id}</p>
                        <p className="text-xs text-muted-foreground">{order.customer?.name || 'Unknown Customer'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)} variant="outline">
                        {order.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{formatCurrency(order.amount || 0)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Active Staff</CardTitle>
            <CardDescription>Currently active staff members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeStaff.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No active staff found</p>
              ) : (
                activeStaff.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-semibold">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{staff.name}</p>
                        <p className="text-xs text-muted-foreground">{staff.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(staff.status)} variant="outline">
                        {staff.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {staff.total_tasks || 0} tasks ({staff.active_tasks || 0} active)
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;