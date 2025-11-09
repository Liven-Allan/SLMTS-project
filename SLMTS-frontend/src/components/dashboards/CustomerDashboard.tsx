import { ArrowLeft, Plus, Package, Clock, CheckCircle, AlertCircle, MapPin, Bell, User, Truck, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";

// Import customer components
import NewOrder from "@/components/customer/NewOrder";
import TrackOrder from "@/components/customer/TrackOrder";
import Notifications from "@/components/customer/Notifications";
import Profile from "@/components/customer/Profile";

interface CustomerDashboardProps {
  onBack: () => void;
}

type ViewType = "dashboard" | "new-order" | "track-order" | "notifications" | "profile";

const CustomerDashboard = ({ onBack }: CustomerDashboardProps) => {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);


  // Hooks
  const { user, logout } = useAuth();
  const { orders, loading: ordersLoading, refresh: refreshOrders } = useOrders();

  // Load orders on component mount
  useEffect(() => {
    if (user) {
      refreshOrders();
    }
  }, [user?.id]); // Only depend on user ID, not the refresh function

  // Filter orders by customer
  const customerOrders = orders.filter(order => order.customer?.id === user?.id || order.customer_id === user?.id);
  const activeOrders = customerOrders.filter(order =>
    order.status === 'pending' || order.status === 'processing'
  );
  const completedOrders = customerOrders.filter(order =>
    order.status === 'completed'
  );

  // Calculate total items in active orders
  const totalActiveItems = activeOrders.reduce((sum, order) => sum + order.items, 0);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      onBack(); // Navigate back to login/main page
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate back even if logout API fails
      onBack();
    }
  };

  const confirmLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      handleLogout();
    }
  };

  // Mock notifications for now - can be replaced with real data later
  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Order Ready for Pickup",
      message: "Your order has been completed and is ready for delivery.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "info",
      title: "Pickup Confirmed",
      message: "Our driver will collect your items today.",
      time: "5 hours ago",
      read: false,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "bg-status-processing text-white";
      case "pending": return "bg-status-pending text-white";
      case "completed": return "bg-status-completed text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-5 w-5 text-secondary" />;
      case "warning": return <AlertCircle className="h-5 w-5 text-accent" />;
      case "info": return <Bell className="h-5 w-5 text-primary" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Navigation Component
  const NavigationTabs = () => (
    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
      {[
        { id: "dashboard", label: "Dashboard", icon: Home },
        { id: "new-order", label: "New Order", icon: Plus },
        { id: "track-order", label: "Track Order", icon: Truck },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "profile", label: "Profile", icon: User },
      ].map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        return (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView(tab.id as ViewType)}
            className={`flex items-center gap-2 transition-all duration-200 ${isActive
              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">{tab.label}</span>
          </Button>
        );
      })}
    </div>
  );

  // Dashboard View
  const DashboardView = () => {
    if (ordersLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Clock className="h-6 w-6 animate-spin mr-2" />
          <span>Loading dashboard...</span>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{activeOrders.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Items in Process</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalActiveItems}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Orders</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{completedOrders.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unread Notifications</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {notifications.filter(n => !n.read).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Active Orders</h2>
            <Button variant="outline" size="sm" onClick={() => setCurrentView("track-order")}>
              View All
            </Button>
          </div>
          {activeOrders.length === 0 ? (
            <Card className="shadow-card border-0">
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No active orders</p>
                <Button onClick={() => setCurrentView("new-order")}>
                  Create New Order
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeOrders.slice(0, 2).map((order) => (
                <Card key={order.id} className="shadow-card border-0 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{order.order_id}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4" />
                          Pickup: {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString() : 'TBD'} •
                          Delivery: {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : 'TBD'}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.current_stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium text-foreground">{order.progress}%</span>
                        </div>
                        <Progress value={order.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-muted-foreground">{order.items} items • UGX {Number(order.amount).toFixed(0)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order.order_id);
                            setCurrentView("track-order");
                          }}
                        >
                          Track Order
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            <Button variant="outline" size="sm" onClick={() => setCurrentView("notifications")}>
              View All
            </Button>
          </div>
          <Card className="shadow-card border-0">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {currentView === "dashboard" && "Dashboard"}
                  {currentView === "new-order" && "New Order"}
                  {currentView === "track-order" && "Track Order"}
                  {currentView === "notifications" && "Notifications"}
                  {currentView === "profile" && "Profile"}
                </h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name || 'Customer'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={() => setCurrentView("notifications")}>
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs flex items-center justify-center text-white">
                      {notifications.filter(n => !n.read).length}
                    </div>
                  )}
                </Button>
              </div>
              <Button className="bg-gradient-primary" onClick={() => setCurrentView("new-order")}>
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
              <Button
                variant="outline"
                onClick={confirmLogout}
                title="Sign Out"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-4">
            <NavigationTabs />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" && <DashboardView />}
        {currentView === "new-order" && <NewOrder onBack={() => setCurrentView("dashboard")} />}
        {currentView === "track-order" && <TrackOrder onBack={() => setCurrentView("dashboard")} />}
        {currentView === "notifications" && <Notifications onBack={() => setCurrentView("dashboard")} />}
        {currentView === "profile" && <Profile onBack={() => setCurrentView("dashboard")} />}
      </div>
    </div>
  );
};

export default CustomerDashboard;