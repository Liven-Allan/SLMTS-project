import { ArrowLeft, Plus, Package, Clock, CheckCircle, AlertCircle, MapPin, Bell, User, Truck, Home, Search, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Hooks
  const { user } = useAuth();



  const activeOrders = [
    {
      id: "ORD-2024-001",
      status: "processing",
      stage: "Washing",
      progress: 45,
      items: 12,
      pickupDate: "2024-01-15",
      estimatedDelivery: "2024-01-17",
      timeline: [
        { stage: "Order Placed", completed: true, time: "Jan 15, 9:00 AM" },
        { stage: "Pickup Confirmed", completed: true, time: "Jan 15, 10:30 AM" },
        { stage: "Items Received", completed: true, time: "Jan 15, 11:15 AM" },
        { stage: "Washing", completed: false, time: "In Progress", current: true },
        { stage: "Drying", completed: false, time: "Pending" },
        { stage: "Folding", completed: false, time: "Pending" },
        { stage: "Quality Check", completed: false, time: "Pending" },
        { stage: "Ready for Delivery", completed: false, time: "Pending" },
      ],
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
      timeline: [
        { stage: "Order Placed", completed: true, time: "Jan 16, 8:30 AM" },
        { stage: "Pickup Scheduled", completed: false, time: "Jan 16, 2:00 PM", current: true },
        { stage: "Items Received", completed: false, time: "Pending" },
        { stage: "Processing", completed: false, time: "Pending" },
        { stage: "Ready for Delivery", completed: false, time: "Pending" },
      ],
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

  const [customerProfile, setCustomerProfile] = useState({
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+256 700 123 456",
    address: "123 Kampala Road, Kololo, Kampala",
    preferences: {
      detergent: "Eco-friendly",
      fabric_softener: true,
      starch: false,
      special_instructions: "Please handle delicate items with care",
    },
  });

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
  const DashboardView = () => (
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
          <Button variant="outline" size="sm" onClick={() => setCurrentView("track-order")}>
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
                        setSelectedOrder(order.id);
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



  // Track Order View
  const TrackOrderView = () => {
    const orderToTrack = selectedOrder
      ? activeOrders.find(order => order.id === selectedOrder)
      : activeOrders[0];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">Track Your Order</h2>
            <p className="text-muted-foreground">Real-time progress tracking for your laundry</p>
          </div>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter order ID..."
              className="w-48"
              value={selectedOrder || ""}
              onChange={(e) => setSelectedOrder(e.target.value)}
            />
          </div>
        </div>

        {orderToTrack && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Details */}
            <div className="lg:col-span-1">
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {orderToTrack.id}
                    <Badge className={getStatusColor(orderToTrack.status)}>
                      {orderToTrack.stage}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Order Details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Items</span>
                    <span className="font-medium">{orderToTrack.items}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className="font-medium">{orderToTrack.totalAmount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pickup Date</span>
                    <span className="font-medium">{orderToTrack.pickupDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Est. Delivery</span>
                    <span className="font-medium">{orderToTrack.estimatedDelivery}</span>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Services</p>
                    <div className="space-y-1">
                      {orderToTrack.services.map((service) => (
                        <Badge key={service} variant="outline" className="mr-2">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <div className="lg:col-span-2">
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Order Timeline</CardTitle>
                  <CardDescription>Track your order progress in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {orderToTrack.timeline.map((step, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed
                          ? "bg-secondary text-white"
                          : step.current
                            ? "bg-primary text-white animate-pulse"
                            : "bg-muted text-muted-foreground"
                          }`}>
                          {step.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : step.current ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <div className="w-2 h-2 bg-current rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium ${step.completed || step.current ? "text-foreground" : "text-muted-foreground"
                            }`}>
                            {step.stage}
                          </h3>
                          <p className="text-sm text-muted-foreground">{step.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* All Orders */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">All Orders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...activeOrders, ...recentOrders.map(order => ({ ...order, timeline: [], services: [], totalAmount: order.amount }))].map((order) => (
              <Card
                key={order.id}
                className={`shadow-card border-0 hover:shadow-lg transition-shadow cursor-pointer ${selectedOrder === order.id ? "ring-2 ring-primary" : ""
                  }`}
                onClick={() => setSelectedOrder(order.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">{order.id}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.items} items • {order.totalAmount}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Notifications View
  const NotificationsView = () => (
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

  // Profile View
  const ProfileView = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>
        <Button
          variant={isEditingProfile ? "outline" : "default"}
          onClick={() => setIsEditingProfile(!isEditingProfile)}
        >
          {isEditingProfile ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your basic account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={customerProfile.name}
                disabled={!isEditingProfile}
                onChange={(e) => setCustomerProfile({ ...customerProfile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={customerProfile.phone}
                disabled={!isEditingProfile}
                onChange={(e) => setCustomerProfile({ ...customerProfile, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={customerProfile.email}
              disabled={!isEditingProfile}
              onChange={(e) => setCustomerProfile({ ...customerProfile, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={customerProfile.address}
              disabled={!isEditingProfile}
              onChange={(e) => setCustomerProfile({ ...customerProfile, address: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Laundry Preferences</CardTitle>
          <CardDescription>Set your default preferences for laundry services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="detergent">Preferred Detergent</Label>
            <Select disabled={!isEditingProfile}>
              <SelectTrigger>
                <SelectValue placeholder={customerProfile.preferences.detergent} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eco-friendly">Eco-friendly</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="sensitive">Sensitive Skin</SelectItem>
                <SelectItem value="fragrance-free">Fragrance-free</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="fabric-softener">Fabric Softener</Label>
                <p className="text-sm text-muted-foreground">Add fabric softener to make clothes softer</p>
              </div>
              <input
                type="checkbox"
                id="fabric-softener"
                checked={customerProfile.preferences.fabric_softener}
                disabled={!isEditingProfile}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="starch">Starch</Label>
                <p className="text-sm text-muted-foreground">Add starch for crisp, professional finish</p>
              </div>
              <input
                type="checkbox"
                id="starch"
                checked={customerProfile.preferences.starch}
                disabled={!isEditingProfile}
                className="rounded"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special-instructions">Special Instructions</Label>
            <Textarea
              id="special-instructions"
              value={customerProfile.preferences.special_instructions}
              disabled={!isEditingProfile}
              onChange={(e) => setCustomerProfile({
                ...customerProfile,
                preferences: {
                  ...customerProfile.preferences,
                  special_instructions: e.target.value
                }
              })}
              placeholder="Any special handling instructions..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {isEditingProfile && (
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => setIsEditingProfile(false)}>
            Cancel
          </Button>
          <Button className="flex-1 bg-gradient-primary" onClick={() => setIsEditingProfile(false)}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );

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
