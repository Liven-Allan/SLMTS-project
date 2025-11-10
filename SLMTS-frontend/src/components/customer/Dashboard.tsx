import { Package, Clock, CheckCircle, Bell, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DashboardProps {
  onNavigate: (view: string) => void;
  onSelectOrder: (orderId: string) => void;
}

const Dashboard = ({ onNavigate, onSelectOrder }: DashboardProps) => {
  // Mock data - replace with real data from backend
  const activeOrders = [
    {
      id: "ORD-2024-001",
      status: "processing",
      stage: "Washing",
      progress: 45,
      items: 12,
      pickupDate: "2024-01-15",
      estimatedDelivery: "2024-01-17",
      services: ["Wash & Fold", "Stain Treatment"],
      totalAmount: "UGX 38,000",
    },
    {
      id: "ORD-2024-002",
      status: "pending",
      stage: "Awaiting Pickup",
      progress: 10,
      items: 8,
      pickupDate: "2024-01-16",
      estimatedDelivery: "2024-01-18",
      services: ["Dry Cleaning", "Pressing"],
      totalAmount: "UGX 52,000",
    },
  ];

  const recentOrders = [
    { id: "ORD-2024-000", status: "completed", items: 15, deliveryDate: "2024-01-10", amount: "UGX 45,000" },
    { id: "ORD-2023-999", status: "completed", items: 10, deliveryDate: "2024-01-05", amount: "UGX 30,000" },
    { id: "ORD-2023-998", status: "completed", items: 18, deliveryDate: "2023-12-28", amount: "UGX 67,000" },
  ];

  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Order Ready for Pickup",
      message: "Your order ORD-2024-001 has been completed and is ready for delivery.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "info",
      title: "Pickup Confirmed",
      message: "Our driver will collect your items today between 2:00 PM - 4:00 PM.",
      time: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "warning",
      title: "Delivery Delayed",
      message: "Due to heavy traffic, your delivery may be delayed by 30 minutes.",
      time: "1 day ago",
      read: true,
    },
    {
      id: 4,
      type: "success",
      title: "Payment Confirmed",
      message: "Payment of UGX 45,000 has been received for order ORD-2024-000.",
      time: "2 days ago",
      read: true,
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
      case "warning": return <Bell className="h-5 w-5 text-accent" />;
      case "info": return <Bell className="h-5 w-5 text-primary" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

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
                <p className="text-3xl font-bold text-foreground mt-1">
                  {activeOrders.reduce((sum, order) => sum + order.items, 0)}
                </p>
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
                <p className="text-3xl font-bold text-foreground mt-1">{recentOrders.length}</p>
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
          <Button variant="outline" size="sm" onClick={() => onNavigate("track-order")}>
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {activeOrders.slice(0, 2).map((order) => (
            <Card key={order.id} className="shadow-card border-0 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.id}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      Pickup: {order.pickupDate} • Delivery: {order.estimatedDelivery}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.stage}
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
                    <span className="text-sm text-muted-foreground">{order.items} items • {order.totalAmount}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onSelectOrder(order.id);
                        onNavigate("track-order");
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
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          <Button variant="outline" size="sm" onClick={() => onNavigate("notifications")}>
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

export default Dashboard;