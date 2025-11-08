import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertTriangle, Package, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useRFIDTags, useRFIDTag } from "@/hooks/useRFID";
import { useOrders, useOrder } from "@/hooks/useOrders";
import { RFIDTag } from "@/services/api/types";

interface RFIDScannerProps {
  selectedOrderId?: string | null;
  onOrderComplete?: (orderId: string) => void;
}

const RFIDScanner = ({ selectedOrderId, onOrderComplete }: RFIDScannerProps = {}) => {
  const [selectedTag, setSelectedTag] = useState<RFIDTag | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);

  // Hooks
  const { user } = useAuth();
  const { tags, loading, error, fetchStaffRFIDTags } = useRFIDTags();
  const { verifyRFIDTag, loading: verifyLoading } = useRFIDTag();
  const { orders, fetchOrders } = useOrders();
  const { updateOrderStage } = useOrder();

  // Load RFID tags and orders for staff member
  useEffect(() => {
    if (user) {
      fetchStaffRFIDTags();
      fetchOrders();
    }
  }, [user?.id, fetchStaffRFIDTags, fetchOrders, selectedOrderId]);

  // Filter tags based on selected order (if any)
  const filteredTags = selectedOrderId 
    ? tags.filter(tag => tag.order_id === selectedOrderId)
    : tags;

  // Group tags by order
  const tagsByOrder = filteredTags.reduce((acc, tag) => {
    const orderId = tag.order_id;
    if (!acc[orderId]) {
      acc[orderId] = [];
    }
    acc[orderId].push(tag);
    return acc;
  }, {} as Record<string, RFIDTag[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-800 border-green-200";
      case "scanned": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return <CheckCircle className="h-4 w-4" />;
      case "scanned": return <Eye className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleVerifyTag = async () => {
    if (selectedTag) {
      try {
        await verifyRFIDTag(selectedTag.id, { verification_notes: verificationNotes });
        setIsVerifyDialogOpen(false);
        setSelectedTag(null);
        setVerificationNotes("");
        fetchStaffRFIDTags(); // Refresh the tags list
        
        // Check if all items for the selected order are now verified
        if (selectedOrderId) {
          const orderTags = tags.filter(tag => tag.order_id === selectedOrderId);
          const allVerified = orderTags.every(tag => 
            tag.id === selectedTag.id || tag.status === 'verified'
          );
          
          if (allVerified && onOrderComplete) {
            // Auto-complete if all items are verified
            setTimeout(() => {
              onOrderComplete(selectedOrderId);
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Failed to verify tag:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCompleteVerification = async () => {
    if (!selectedOrderId) return;
    
    try {
      // Find the order by order_id
      const order = orders.find(o => o.order_id === selectedOrderId);
      if (order) {
        // Start the task by moving to 'items_received' stage
        await updateOrderStage(order.id, 'items_received');
      }
      
      // Call the completion callback
      onOrderComplete?.(selectedOrderId);
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  };

  if (loading && tags.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-6 w-6 animate-spin mr-2" />
        <span>Loading RFID tags...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Item Verification Interface</h2>
          <p className="text-muted-foreground">
            {selectedOrderId 
              ? `Verifying items for Order: ${selectedOrderId}`
              : "Verify and track items for your assigned orders"
            }
          </p>
        </div>
        {selectedOrderId && (
          <Button 
            onClick={handleCompleteVerification}
            className="bg-gradient-success"
            disabled={filteredTags.some(tag => tag.status === 'pending')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Start Task
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>Error loading RFID tags: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{filteredTags.filter(t => t.status === 'pending').length}</p>
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
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">{filteredTags.filter(t => t.status === 'verified').length}</p>
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
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{filteredTags.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan Results */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Scan Results</CardTitle>
          <CardDescription>Recently scanned items and their verification status</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(tagsByOrder).length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No items found for your assigned orders</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>User ID: {user?.id} | Role: {user?.role}</p>
                <p>Total Tags: {tags.length}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(tagsByOrder).map(([orderId, orderTags]) => (
                <div key={orderId} className="space-y-3">
                  <h3 className="font-semibold text-foreground border-b pb-2">
                    Order: {orderId} ({orderTags.length} items)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {orderTags.map((tag) => (
                      <Card key={tag.id} className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="font-medium text-foreground text-sm">
                                {tag.display_name || tag.item_description || 'Item'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tag.tag_id} • {tag.service_name || 'Service'} • {orderId}
                              </p>
                            </div>
                            <Badge className={getStatusColor(tag.status)} variant="outline">
                              <span className="flex items-center gap-1">
                                {getStatusIcon(tag.status)}
                                {tag.status}
                              </span>
                            </Badge>
                          </div>
                          
                          {tag.verified_at && (
                            <p className="text-xs text-muted-foreground mb-2">
                              Verified: {formatDate(tag.verified_at)}
                            </p>
                          )}
                          
                          {tag.status === 'pending' && (
                            <Button 
                              size="sm" 
                              className="w-full bg-gradient-success"
                              onClick={() => {
                                setSelectedTag(tag);
                                setIsVerifyDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Verify Item
                            </Button>
                          )}
                          
                          {tag.status === 'verified' && tag.verification_notes && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                              <p className="font-medium text-green-800">Notes:</p>
                              <p className="text-green-700">{tag.verification_notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verify Tag Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Item</DialogTitle>
            <DialogDescription>
              Confirm that you have received and verified this item: {selectedTag?.tag_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="verification-notes">Verification Notes (Optional)</Label>
              <Textarea
                id="verification-notes"
                placeholder="Add any notes about the item condition, special handling, etc."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleVerifyTag}
                disabled={verifyLoading}
                className="bg-gradient-success"
              >
                {verifyLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Item
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RFIDScanner;