import { useState, useEffect } from "react";
import { Search, Eye, Edit, UserPlus, Clock, Package, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useOrders, useOrder } from "@/hooks/useOrders";
import { useUsers } from "@/hooks/useUsers";
import { Order } from "@/services/api/types";

const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [editAction, setEditAction] = useState<'reassign' | 'cancel' | null>(null);

  // Hooks
  const { orders, loading, error, fetchOrders } = useOrders();
  const { updateOrder } = useOrder();
  const { users, fetchUsers } = useUsers();

  // Load data on component mount
  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get staff members for assignment
  const staffMembers = users.filter(user => user.role === 'staff' && user.status === 'active');

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing": return <Clock className="h-4 w-4" />;
      case "pending": return <AlertCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const handleAssignOrder = async () => {
    if (selectedOrder && selectedStaff) {
      try {
        await updateOrder(selectedOrder.id, { assigned_to_id: parseInt(selectedStaff) });
        setIsAssignDialogOpen(false);
        setSelectedOrder(null);
        setSelectedStaff("");
        fetchOrders(); // Refresh the orders list
      } catch (error) {
        console.error('Failed to assign order:', error);
      }
    }
  };

  const handleReassignOrder = async () => {
    if (selectedOrder && selectedStaff) {
      try {
        await updateOrder(selectedOrder.id, { assigned_to_id: parseInt(selectedStaff) });
        setIsEditDialogOpen(false);
        setSelectedOrder(null);
        setSelectedStaff("");
        setEditAction(null);
        fetchOrders(); // Refresh the orders list
      } catch (error) {
        console.error('Failed to reassign order:', error);
      }
    }
  };

  const handleCancelOrder = async () => {
    if (selectedOrder) {
      try {
        await updateOrder(selectedOrder.id, { status: 'cancelled' });
        setIsEditDialogOpen(false);
        setSelectedOrder(null);
        setEditAction(null);
        fetchOrders(); // Refresh the orders list
      } catch (error) {
        console.error('Failed to cancel order:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-6 w-6 animate-spin mr-2" />
        <span>Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Order Management</h2>
          <p className="text-muted-foreground">View, assign, and track all orders</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search orders..." 
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>Error loading orders: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'processing').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="shadow-card border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== "all" ? "No orders match your filters" : "No orders found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{order.customer?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)} variant="outline">
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>{order.items || 0}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.amount || 0)}</TableCell>
                    <TableCell>
                      <span className={!order.assigned_to ? 'text-muted-foreground' : 'text-foreground'}>
                        {order.assigned_to?.name || 'Unassigned'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="View Details"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Edit Order"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {!order.assigned_to && order.status !== 'cancelled' && order.status !== 'completed' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary/80"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsAssignDialogOpen(true);
                            }}
                            title="Assign Staff"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Staff Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Staff Member</DialogTitle>
            <DialogDescription>
              Assign a staff member to order {selectedOrder?.order_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="staff-select">Select Staff Member</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id.toString()}>
                      {staff.name} - {staff.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignOrder}
                disabled={!selectedStaff}
                className="bg-gradient-primary"
              >
                Assign Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_id}</DialogTitle>
            <DialogDescription>
              Complete information about this order
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedOrder.status)} variant="outline">
                  <span className="flex items-center gap-1">
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created: {formatDate(selectedOrder.created_at)}
                </span>
              </div>

              {/* Customer & Order Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Customer</h4>
                  <div className="space-y-1 text-xs">
                    <p><span className="text-muted-foreground">Name:</span> {selectedOrder.customer?.name || 'Unknown'}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedOrder.customer?.email || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.customer?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Order Info</h4>
                  <div className="space-y-1 text-xs">
                    <p><span className="text-muted-foreground">Items:</span> {selectedOrder.items || 0}</p>
                    <p><span className="text-muted-foreground">Amount:</span> {formatCurrency(selectedOrder.amount || 0)}</p>
                    <p><span className="text-muted-foreground">Stage:</span> {selectedOrder.current_stage?.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              {/* Assignment & Schedule */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Assignment</h4>
                  <p className="text-xs">
                    <span className="text-muted-foreground">Staff:</span> {selectedOrder.assigned_to?.name || 'Unassigned'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Schedule</h4>
                  <div className="space-y-1 text-xs">
                    <p><span className="text-muted-foreground">Pickup:</span> {selectedOrder.pickup_date ? formatDate(selectedOrder.pickup_date) : 'Not scheduled'}</p>
                    <p><span className="text-muted-foreground">Delivery:</span> {selectedOrder.estimated_delivery ? formatDate(selectedOrder.estimated_delivery) : 'TBD'}</p>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.special_instructions && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Special Instructions</h4>
                  <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                    {selectedOrder.special_instructions}
                  </p>
                </div>
              )}

              {/* Order Items */}
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Services</h4>
                  <div className="space-y-1">
                    {selectedOrder.order_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded text-xs">
                        <span>{item.service} ({item.quantity} items)</span>
                        <span className="font-medium">{formatCurrency(Number(item.unit_price) * Number(item.quantity))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order - {selectedOrder?.order_id}</DialogTitle>
            <DialogDescription>
              Choose an action for this order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editAction && (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setEditAction('reassign')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Reassign to Different Staff
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setEditAction('cancel')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              </div>
            )}

            {editAction === 'reassign' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reassign-staff">Select New Staff Member</Label>
                  <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id.toString()}>
                          {staff.name} - {staff.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditAction(null)}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleReassignOrder}
                    disabled={!selectedStaff}
                    className="bg-gradient-primary"
                  >
                    Reassign Order
                  </Button>
                </div>
              </div>
            )}

            {editAction === 'cancel' && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditAction(null)}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleCancelOrder}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Cancel Order
                  </Button>
                </div>
              </div>
            )}

            {!editAction && (
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;