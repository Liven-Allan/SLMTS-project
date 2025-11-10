import { Plus, Clock, AlertCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useServices } from "@/hooks/useSettings";
import { useOrder } from "@/hooks/useOrders";
import { Service, CreateOrderRequest, OrderItem } from "@/services/api/types";

interface NewOrderProps {
  onBack: () => void;
}

const NewOrder = ({ onBack }: NewOrderProps) => {
  // Hooks
  const { user } = useAuth();
  const { services, loading: servicesLoading, refresh: refreshServices } = useServices();
  const { createOrder, loading: orderLoading, error: orderError } = useOrder();
  
  // Order form state
  const [selectedServices, setSelectedServices] = useState<{ [key: number]: OrderItem }>({});
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Individual items state
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState<number | null>(null);
  const [individualItems, setIndividualItems] = useState<{ [serviceId: number]: string[] }>({});

  // Load services on component mount
  useEffect(() => {
    refreshServices();
  }, []); // Empty dependency array - only run once on mount

  // Helper functions
  const toggleService = (service: Service) => {
    const serviceId = service.id;
    if (selectedServices[serviceId]) {
      // Remove service
      const newServices = { ...selectedServices };
      delete newServices[serviceId];
      setSelectedServices(newServices);
    } else {
      // Add service with default quantity
      setSelectedServices({
        ...selectedServices,
        [serviceId]: {
          service: serviceId,
          quantity: 1,
          special_instructions: '',
        }
      });
    }
  };

  const updateServiceQuantity = (serviceId: number, quantity: number) => {
    if (selectedServices[serviceId]) {
      const newQuantity = Math.max(1, Math.floor(quantity)); // Minimum 1, integer only
      setSelectedServices({
        ...selectedServices,
        [serviceId]: {
          ...selectedServices[serviceId],
          quantity: newQuantity,
        }
      });
      
      // Open items modal to collect item names
      setCurrentServiceId(serviceId);
      setShowItemsModal(true);
    }
  };

  const handleItemsModalSave = (items: string[]) => {
    if (currentServiceId) {
      setIndividualItems({
        ...individualItems,
        [currentServiceId]: items
      });
    }
    setShowItemsModal(false);
    setCurrentServiceId(null);
  };

  const calculateEstimatedTotal = () => {
    return Object.values(selectedServices).reduce((total, item) => {
      const service = services.find(s => s.id === item.service);
      if (service) {
        return total + (item.quantity * Number(service.price));
      }
      return total;
    }, 0);
  };

  const handleCreateOrder = async () => {
    if (!user) {
      alert('Please log in to create an order');
      return;
    }

    if (Object.keys(selectedServices).length === 0) {
      alert('Please select at least one service');
      return;
    }

    if (!pickupDate) {
      alert('Please select a pickup date');
      return;
    }

    // Validate that all services have individual items matching their quantities
    for (const [serviceId, serviceData] of Object.entries(selectedServices)) {
      const serviceIdNum = parseInt(serviceId);
      const items = individualItems[serviceIdNum] || [];
      const expectedQuantity = Math.floor(serviceData.quantity);
      
      if (items.length !== expectedQuantity) {
        const serviceName = services.find(s => s.id === serviceIdNum)?.name || 'Service';
        alert(`${serviceName} requires exactly ${expectedQuantity} item names, but ${items.length} were provided. Please name all items.`);
        return;
      }
    }

    try {
      // Calculate estimated delivery (3 days after pickup)
      const pickup = new Date(pickupDate);
      const estimatedDelivery = new Date(pickup);
      estimatedDelivery.setDate(pickup.getDate() + 3);

      // Prepare order items with unit prices and individual items
      const orderItems = Object.values(selectedServices).map(item => {
        const service = services.find(s => s.id === item.service);
        const items = individualItems[item.service] || [];
        
        return {
          ...item,
          unit_price: service ? service.price : "0",
          individual_items: items.map(itemName => ({
            item_name: itemName,
            item_type: service?.name.toLowerCase() || 'garment'
          }))
        };
      });

      const orderData: CreateOrderRequest = {
        customer: user.id,
        pickup_date: pickupDate,
        estimated_delivery: estimatedDelivery.toISOString().split('T')[0],
        special_instructions: specialInstructions,
        order_items: orderItems,
      };



      const newOrder = await createOrder(orderData);
      
      // Reset form
      setSelectedServices({});
      setPickupDate('');
      setPickupTime('');
      setSpecialInstructions('');
      
      // Show success message and redirect
      alert(`Order ${newOrder.order_id} created successfully!`);
      onBack();
      
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Create New Order</h2>
        <p className="text-muted-foreground">Schedule a pickup and select your preferred services</p>
      </div>

      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Service Selection</CardTitle>
          <CardDescription>Choose the services you need for your laundry</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {servicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="h-6 w-6 animate-spin mr-2" />
              <span>Loading services...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.filter(service => service.status === 'active').map((service) => {
                const isSelected = !!selectedServices[service.id];
                return (
                  <Card 
                    key={service.id} 
                    className={`border-2 transition-colors cursor-pointer ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary'
                    }`}
                    onClick={() => toggleService(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                        <span className="text-sm font-medium text-primary">
                          UGX {Number(service.price).toFixed(0)}/{service.unit.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {service.description || 'Professional laundry service'}
                      </p>
                      
                      {isSelected && (
                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`quantity-${service.id}`} className="text-xs">
                              Quantity (items):
                            </Label>
                            <Input
                              id={`quantity-${service.id}`}
                              type="number"
                              min="1"
                              step="1"
                              value={selectedServices[service.id]?.quantity || 1}
                              onChange={(e) => updateServiceQuantity(service.id, parseInt(e.target.value))}
                              className="w-20 h-8 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentServiceId(service.id);
                                setShowItemsModal(true);
                              }}
                              className="h-8 px-2"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Name Items
                            </Button>
                          </div>
                          
                          {individualItems[service.id] && individualItems[service.id].length > 0 && (
                            <div className={`text-xs p-2 rounded ${
                              individualItems[service.id].length === Math.floor(selectedServices[service.id]?.quantity || 1)
                                ? 'text-green-600 bg-green-50'
                                : 'text-red-600 bg-red-50'
                            }`}>
                              {individualItems[service.id].length === Math.floor(selectedServices[service.id]?.quantity || 1) ? '✓' : '⚠️'} 
                              {individualItems[service.id].length} items named: {individualItems[service.id].slice(0, 2).join(', ')}
                              {individualItems[service.id].length > 2 && ` +${individualItems[service.id].length - 2} more`}
                              {individualItems[service.id].length !== Math.floor(selectedServices[service.id]?.quantity || 1) && (
                                <div className="mt-1 text-xs">
                                  Expected {Math.floor(selectedServices[service.id]?.quantity || 1)} items
                                </div>
                              )}
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            Subtotal: UGX {(selectedServices[service.id]?.quantity * Number(service.price)).toFixed(0)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {Object.keys(selectedServices).length > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Estimated Total:</span>
                  <span className="text-lg font-bold text-primary">
                    UGX {calculateEstimatedTotal().toFixed(0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Pickup Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup-date">Pickup Date</Label>
                <Input 
                  type="date" 
                  id="pickup-date" 
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup-time">Preferred Time</Label>
                <Select value={pickupTime} onValueChange={setPickupTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8:00 AM - 12:00 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12:00 PM - 5:00 PM)</SelectItem>
                    <SelectItem value="evening">Evening (5:00 PM - 8:00 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="special-instructions">Special Instructions</Label>
              <Textarea
                id="special-instructions"
                placeholder="Any special handling instructions for your items..."
                rows={3}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>
          </div>

          {orderError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{orderError}</span>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1" onClick={onBack}>
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-gradient-primary" 
              onClick={handleCreateOrder}
              disabled={orderLoading || Object.keys(selectedServices).length === 0 || !pickupDate}
            >
              {orderLoading && <Clock className="h-4 w-4 mr-2 animate-spin" />}
              Schedule Pickup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items Modal */}
      <ItemsModal 
        isOpen={showItemsModal}
        onClose={() => setShowItemsModal(false)}
        onSave={handleItemsModalSave}
        serviceId={currentServiceId}
        serviceName={currentServiceId ? services.find(s => s.id === currentServiceId)?.name || '' : ''}
        quantity={currentServiceId ? selectedServices[currentServiceId]?.quantity || 1 : 1}
        existingItems={currentServiceId ? individualItems[currentServiceId] || [] : []}
      />
    </div>
  );
};

// Items Modal Component
interface ItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: string[]) => void;
  serviceId: number | null;
  serviceName: string;
  quantity: number;
  existingItems: string[];
}

const ItemsModal = ({ isOpen, onClose, onSave, serviceId, serviceName, quantity, existingItems }: ItemsModalProps) => {
  const [items, setItems] = useState<string[]>([]);

  // Initialize items when modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingItems.length === quantity) {
        // Use existing items if they match the quantity
        setItems(existingItems);
      } else {
        // Create new items array based on quantity
        const newItems = Array(quantity).fill('').map((_, index) => {
          // Use existing item name if available, otherwise default
          return existingItems[index] || `Item ${index + 1}`;
        });
        setItems(newItems);
      }
    }
  }, [isOpen, quantity, existingItems]);

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSave = () => {
    // Validate that all items have names
    const validItems = items.filter(item => item.trim() !== '');
    if (validItems.length !== quantity) {
      alert(`Please provide names for all ${quantity} items`);
      return;
    }
    onSave(validItems);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Name Your Items</DialogTitle>
          <DialogDescription>
            Please provide names for each item in your {serviceName} service ({quantity} items required)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`item-${index}`}>Item {index + 1}</Label>
              <Input
                id={`item-${index}`}
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={`e.g., Blue Shirt, Favorite Jeans`}
                required
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-gradient-primary">
            Save Items
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrder;