import { Search, CheckCircle, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/services/api/types";

interface TrackOrderProps {
  onBack: () => void;
}

const TrackOrder = ({ onBack }: TrackOrderProps) => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [searchOrderId, setSearchOrderId] = useState<string>("");
  
  // Hooks
  const { user } = useAuth();
  const { orders, loading, error, refresh } = useOrders();

  // Load orders on component mount
  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [user?.id, refresh]); // Include refresh in dependencies

  // Filter orders by customer
  const customerOrders = orders.filter(order => order.customer?.id === user?.id || order.customer_id === user?.id);
  const activeOrders = customerOrders.filter(order => 
    order.status === 'pending' || order.status === 'processing'
  );
  const completedOrders = customerOrders.filter(order => 
    order.status === 'completed'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "bg-status-processing text-white";
      case "pending": return "bg-status-pending text-white";
      case "completed": return "bg-status-completed text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStageDisplayName = (stage: string) => {
    const stageNames: { [key: string]: string } = {
      'order_placed': 'Order Placed',
      'pickup_confirmed': 'Pickup Confirmed',
      'items_received': 'Items Received',
      'washing': 'Washing',
      'drying': 'Drying',
      'folding': 'Folding',
      'quality_check': 'Quality Check',
      'ready_for_delivery': 'Ready for Delivery',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered'
    };
    return stageNames[stage] || stage;
  };

  // Find order to track
  const orderToTrack = selectedOrder
    ? customerOrders.find(order => order.order_id === selectedOrder)
    : activeOrders[0];

  // Handle search
  const handleSearch = () => {
    if (searchOrderId.trim()) {
      setSelectedOrder(searchOrderId.trim());
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-6 w-6 animate-spin mr-2" />
        <span>Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading orders: {error}</p>
        <Button onClick={refresh}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">Track Your Order</h2>
          <p className="text-muted-foreground">Real-time progress tracking for your laundry</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            {loading ? <Clock className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter order ID..."
            className="w-48"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" size="sm" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>

      {orderToTrack && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-1">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {orderToTrack.order_id}
                  <Badge className={getStatusColor(orderToTrack.status)}>
                    {getStageDisplayName(orderToTrack.current_stage)}
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
                  <span className="font-medium">UGX {Number(orderToTrack.amount).toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pickup Date</span>
                  <span className="font-medium">
                    {orderToTrack.pickup_date ? formatDate(orderToTrack.pickup_date) : 'Not scheduled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Est. Delivery</span>
                  <span className="font-medium">
                    {orderToTrack.estimated_delivery ? formatDate(orderToTrack.estimated_delivery) : 'TBD'}
                  </span>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Services</p>
                  <div className="space-y-1">
                    {orderToTrack.order_items?.map((item) => (
                      <Badge key={item.id} variant="outline" className="mr-2">
                        {item.service_name} ({item.quantity})
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
                  {orderToTrack.timeline && orderToTrack.timeline.length > 0 ? (
                    orderToTrack.timeline.map((step, index) => (
                      <div key={step.id || index} className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed
                          ? "bg-secondary text-white"
                          : step.is_current
                            ? "bg-primary text-white animate-pulse"
                            : "bg-muted text-muted-foreground"
                          }`}>
                          {step.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : step.is_current ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <div className="w-2 h-2 bg-current rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium ${step.completed || step.is_current ? "text-foreground" : "text-muted-foreground"
                            }`}>
                            {step.stage}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {step.timestamp ? formatDateTime(step.timestamp) : 'Pending'}
                          </p>
                          {step.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{step.notes}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No timeline data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* All Orders */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">All Orders</h3>
        {customerOrders.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {orders.length === 0 
                  ? "No orders found in the system" 
                  : `Found ${orders.length} orders, but none belong to you`
                }
              </p>
              <div className="space-y-2">
                <Button variant="outline" onClick={refresh}>
                  Refresh Orders
                </Button>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>User ID: {user?.id} | Role: {user?.role}</p>
                  <p>Total Orders in System: {orders.length}</p>
                  <p>Orders for this User: {customerOrders.length}</p>
                  {orders.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600">Show Order Details</summary>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        {orders.slice(0, 3).map(order => (
                          <div key={order.id} className="mb-1">
                            {order.order_id}: Customer ID = {order.customer?.id || order.customer_id || 'None'}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerOrders.map((order) => (
              <Card
                key={order.id}
                className={`shadow-card border-0 hover:shadow-lg transition-shadow cursor-pointer ${selectedOrder === order.order_id ? "ring-2 ring-primary" : ""
                  }`}
                onClick={() => setSelectedOrder(order.order_id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">{order.order_id}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.items} items • UGX {Number(order.amount).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {formatDate(order.created_at)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;