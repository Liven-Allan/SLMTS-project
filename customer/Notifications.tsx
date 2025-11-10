import { CheckCircle, AlertCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationsProps {
  onBack: () => void;
}

const Notifications = ({ onBack }: NotificationsProps) => {
  // Mock data - replace with real data from backend
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-5 w-5 text-secondary" />;
      case "warning": return <AlertCircle className="h-5 w-5 text-accent" />;
      case "info": return <Bell className="h-5 w-5 text-primary" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          <p className="text-muted-foreground">Stay updated with your order status and important updates</p>
        </div>
        <Button variant="outline" size="sm">
          Mark All as Read
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({notifications.filter(n => !n.read).length})</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`shadow-card border-0 ${!notification.read ? "bg-primary/5" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {notifications.filter(n => !n.read).map((notification) => (
            <Card key={notification.id} className="shadow-card border-0 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                  </div>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {notifications.filter(n => n.title.toLowerCase().includes('order')).map((notification) => (
            <Card key={notification.id} className={`shadow-card border-0 ${!notification.read ? "bg-primary/5" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;