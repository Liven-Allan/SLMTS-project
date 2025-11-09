import { ArrowLeft, MapPin, Navigation, CheckCircle, Clock, Package, Phone, Home, Route, Map, ClipboardCheck, Truck, User, Timer, Target, TrendingUp, Search, Filter, Eye, Edit, Plus, X, Check, Signature, Camera, FileText, AlertCircle, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

interface DriverDashboardProps {
  onBack: () => void;
}

type DriverViewType = "dashboard" | "routes" | "map" | "status-update";

const DriverDashboard = ({ onBack }: DriverDashboardProps) => {
  const [currentView, setCurrentView] = useState<DriverViewType>("dashboard");
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: -0.3476, lng: 32.5825 }); // Kampala coordinates
  const [routeProgress, setRouteProgress] = useState(0);

  const driverInfo = {
    name: "David Okello",
    vehicle: "UBD 123X",
    route: "Central Kampala",
    shift: "Morning (8:00 AM - 4:00 PM)",
    rating: 4.8,
    deliveriesToday: 8,
    totalDistance: 45.2
  };

  const allDeliveries = [
    {
      id: "DEL-001",
      order: "ORD-2024-005",
      customer: "Sarah Johnson",
      address: "123 Kampala Rd, Kololo",
      coordinates: { lat: -0.3136, lng: 32.5811 },
      phone: "+256 700 123 456",
      time: "10:00 AM - 11:00 AM",
      items: 12,
      distance: "2.3 km",
      type: "pickup",
      status: "pending",
      priority: "high",
      specialInstructions: "Ring doorbell twice, apartment 3B",
      estimatedDuration: "15 min"
    },
    {
      id: "DEL-002",
      order: "ORD-2024-006",
      customer: "Michael Okello",
      address: "456 Nakasero Ave, Nakasero",
      coordinates: { lat: -0.3167, lng: 32.5833 },
      phone: "+256 700 789 012",
      time: "11:30 AM - 12:30 PM",
      items: 8,
      distance: "1.8 km",
      type: "pickup",
      status: "pending",
      priority: "medium",
      specialInstructions: "Office building, reception desk",
      estimatedDuration: "10 min"
    },
    {
      id: "DEL-003",
      order: "ORD-2024-001",
      customer: "John Doe",
      address: "789 Ntinda Complex, Ntinda",
      coordinates: { lat: -0.3676, lng: 32.6176 },
      phone: "+256 700 345 678",
      time: "2:00 PM - 3:00 PM",
      items: 15,
      distance: "3.5 km",
      type: "delivery",
      status: "in-transit",
      priority: "high",
      specialInstructions: "Call on arrival, gate code: 1234",
      estimatedDuration: "20 min"
    },
    {
      id: "DEL-004",
      order: "ORD-2024-007",
      customer: "Grace Nansubuga",
      address: "321 Bugolobi Street, Bugolobi",
      coordinates: { lat: -0.3376, lng: 32.6125 },
      phone: "+256 700 456 789",
      time: "3:30 PM - 4:30 PM",
      items: 6,
      distance: "2.1 km",
      type: "delivery",
      status: "pending",
      priority: "medium",
      specialInstructions: "Leave with security if not home",
      estimatedDuration: "12 min"
    },
    {
      id: "DEL-005",
      order: "ORD-2024-008",
      customer: "Robert Mukasa",
      address: "654 Muyenga Hill, Muyenga",
      coordinates: { lat: -0.3876, lng: 32.6076 },
      phone: "+256 700 567 890",
      time: "9:00 AM - 10:00 AM",
      items: 20,
      distance: "4.2 km",
      type: "pickup",
      status: "completed",
      priority: "low",
      specialInstructions: "Large order, bring extra bags",
      estimatedDuration: "25 min"
    }
  ];

  const routeStops = [
    { id: 1, name: "CityVille Laundromat", address: "Main Branch", type: "start", time: "8:00 AM", status: "completed" },
    { id: 2, name: "Robert Mukasa", address: "654 Muyenga Hill", type: "pickup", time: "9:00 AM", status: "completed" },
    { id: 3, name: "Sarah Johnson", address: "123 Kampala Rd", type: "pickup", time: "10:00 AM", status: "pending" },
    { id: 4, name: "Michael Okello", address: "456 Nakasero Ave", type: "pickup", time: "11:30 AM", status: "pending" },
    { id: 5, name: "John Doe", address: "789 Ntinda Complex", type: "delivery", time: "2:00 PM", status: "pending" },
    { id: 6, name: "Grace Nansubuga", address: "321 Bugolobi Street", type: "delivery", time: "3:30 PM", status: "pending" },
    { id: 7, name: "CityVille Laundromat", address: "Main Branch", type: "end", time: "4:00 PM", status: "pending" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-status-pending text-white";
      case "in-transit": return "bg-status-processing text-white";
      case "completed": return "bg-status-completed text-white";
      case "delayed": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pickup": return "bg-primary text-primary-foreground";
      case "delivery": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getDeliveriesByType = (type: string) => {
    return allDeliveries.filter(delivery => delivery.type === type);
  };

  const getDeliveriesByStatus = (status: string) => {
    return allDeliveries.filter(delivery => delivery.status === status);
  };

  // Navigation Component
  const NavigationTabs = () => (
    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
      {[
        { id: "dashboard", label: "Dashboard", icon: Home },
        { id: "routes", label: "Delivery Routes", icon: Route },
        { id: "map", label: "GPS Navigation", icon: Map },
        { id: "status-update", label: "Status Updates", icon: ClipboardCheck },
      ].map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        return (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView(tab.id as DriverViewType)}
            className={`flex items-center gap-2 transition-all duration-200 ${
              isActive 
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

  // Dashboard Overview
  const DashboardView = () => (
    <div className="space-y-8">
      {/* Driver Info Card */}
      <Card className="shadow-card border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl font-bold">
                {driverInfo.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{driverInfo.name}</h2>
                <p className="text-muted-foreground">{driverInfo.vehicle} • {driverInfo.route}</p>
                <p className="text-sm text-muted-foreground">{driverInfo.shift}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{driverInfo.rating}★</p>
              <p className="text-sm text-muted-foreground">Driver Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Stops</p>
                <p className="text-3xl font-bold text-foreground mt-1">{routeStops.length - 2}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pickups</p>
                <p className="text-3xl font-bold text-foreground mt-1">{getDeliveriesByType('pickup').length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deliveries</p>
                <p className="text-3xl font-bold text-foreground mt-1">{getDeliveriesByType('delivery').length}</p>
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
                <p className="text-sm text-muted-foreground">Total Distance</p>
                <p className="text-3xl font-bold text-foreground mt-1">{driverInfo.totalDistance}</p>
                <p className="text-xs text-muted-foreground">km</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Navigation className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Route Progress */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Today's Route Progress</CardTitle>
          <CardDescription>Track your progress through today's delivery route</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Route Completion</span>
                <span className="text-sm font-medium text-foreground">
                  {Math.round((routeStops.filter(stop => stop.status === 'completed').length / routeStops.length) * 100)}%
                </span>
              </div>
              <Progress value={(routeStops.filter(stop => stop.status === 'completed').length / routeStops.length) * 100} className="h-3" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routeStops.slice(0, 4).map((stop) => (
                <div key={stop.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stop.status === 'completed' 
                      ? "bg-secondary text-white" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {stop.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{stop.name}</p>
                    <p className="text-xs text-muted-foreground">{stop.time} • {stop.type}</p>
                  </div>
                  <Badge className={getStatusColor(stop.status)} variant="outline">
                    {stop.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Next Pickups</CardTitle>
            <CardDescription>Upcoming pickup locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getDeliveriesByType('pickup').filter(d => d.status === 'pending').slice(0, 3).map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{delivery.customer}</p>
                      <p className="text-xs text-muted-foreground">{delivery.time} • {delivery.distance}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(delivery.priority)} variant="outline">
                      {delivery.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Next Deliveries</CardTitle>
            <CardDescription>Upcoming delivery locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getDeliveriesByType('delivery').filter(d => d.status !== 'completed').slice(0, 3).map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{delivery.customer}</p>
                      <p className="text-xs text-muted-foreground">{delivery.time} • {delivery.distance}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(delivery.status)} variant="outline">
                      {delivery.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Delivery Routes View
  const DeliveryRoutesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Delivery Routes</h2>
          <p className="text-muted-foreground">Manage your pickup and drop-off routes</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search deliveries..." className="pl-10 w-64" />
          </div>
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pickup">Pickups</SelectItem>
              <SelectItem value="delivery">Deliveries</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="pickups" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="pickups" className="data-[state=active]:bg-card">
            Pickups ({getDeliveriesByType('pickup').length})
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="data-[state=active]:bg-card">
            Deliveries ({getDeliveriesByType('delivery').length})
          </TabsTrigger>
          <TabsTrigger value="route" className="data-[state=active]:bg-card">
            Full Route ({routeStops.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pickups" className="space-y-4">
          {getDeliveriesByType('pickup').map((delivery) => (
            <Card key={delivery.id} className="shadow-card border-0 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{delivery.customer}</CardTitle>
                      <Badge className={getPriorityColor(delivery.priority)}>
                        {delivery.priority}
                      </Badge>
                      <Badge className={getStatusColor(delivery.status)} variant="outline">
                        {delivery.status}
                      </Badge>
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {delivery.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {delivery.time} • Est. {delivery.estimatedDuration}
                      </div>
                      {delivery.specialInstructions && (
                        <div className="flex items-center gap-2 text-accent">
                          <AlertCircle className="h-4 w-4" />
                          {delivery.specialInstructions}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">
                    {delivery.distance}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Order: {delivery.order}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {delivery.items} items
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm" className="bg-gradient-primary" onClick={() => setCurrentView("map")}>
                      <Navigation className="h-4 w-4 mr-2" />
                      Navigate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedDelivery(delivery.id);
                      setCurrentView("status-update");
                    }}>
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-4">
          {getDeliveriesByType('delivery').map((delivery) => (
            <Card key={delivery.id} className="shadow-card border-0 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{delivery.customer}</CardTitle>
                      <Badge className={getPriorityColor(delivery.priority)}>
                        {delivery.priority}
                      </Badge>
                      <Badge className={getStatusColor(delivery.status)} variant="outline">
                        {delivery.status}
                      </Badge>
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {delivery.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {delivery.time} • Est. {delivery.estimatedDuration}
                      </div>
                      {delivery.specialInstructions && (
                        <div className="flex items-center gap-2 text-accent">
                          <AlertCircle className="h-4 w-4" />
                          {delivery.specialInstructions}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className="bg-secondary text-secondary-foreground">
                    {delivery.distance}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Order: {delivery.order}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {delivery.items} items
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm" className="bg-gradient-success" onClick={() => {
                      setSelectedDelivery(delivery.id);
                      setCurrentView("status-update");
                    }}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="route" className="space-y-4">
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Complete Route Overview</CardTitle>
              <CardDescription>Your full delivery route for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routeStops.map((stop, index) => (
                  <div key={stop.id} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        stop.status === 'completed' 
                          ? "bg-secondary text-white" 
                          : index === routeStops.findIndex(s => s.status === 'pending')
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{stop.name}</p>
                        <p className="text-sm text-muted-foreground">{stop.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{stop.time}</span>
                      <Badge className={getTypeColor(stop.type)} variant="outline">
                        {stop.type}
                      </Badge>
                      <Badge className={getStatusColor(stop.status)} variant="outline">
                        {stop.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // GPS Navigation Map View
  const MapNavigationView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">GPS Navigation</h2>
          <p className="text-muted-foreground">Real-time navigation and location tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={isNavigating ? "destructive" : "default"}
            onClick={() => setIsNavigating(!isNavigating)}
            className={isNavigating ? "" : "bg-gradient-primary"}
          >
            {isNavigating ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Navigation
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Navigation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Interactive Map */}
      <Card className="shadow-card border-0">
        <CardContent className="p-0">
          <div className={`h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center relative overflow-hidden ${
            isNavigating ? "animate-pulse" : ""
          }`}>
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="text-center z-10">
              <Map className={`h-16 w-16 mx-auto mb-4 ${isNavigating ? "text-primary animate-bounce" : "text-muted-foreground"}`} />
              <p className="text-lg font-medium text-foreground mb-2">
                {isNavigating ? "Navigation Active" : "GPS Map View"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isNavigating ? "Following route to next destination" : "Real-time GPS integration would display here"}
              </p>
              {isNavigating && (
                <div className="mt-4 p-3 bg-card/80 rounded-lg backdrop-blur-sm">
                  <p className="text-sm font-medium text-foreground">Next Stop: Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">123 Kampala Rd, Kololo • 2.3 km away</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Current Location</CardTitle>
            <CardDescription>Your real-time GPS coordinates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Latitude</span>
              <span className="text-sm font-medium">{currentLocation.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Longitude</span>
              <span className="text-sm font-medium">{currentLocation.lng.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Speed</span>
              <span className="text-sm font-medium">45 km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Heading</span>
              <span className="text-sm font-medium">Northeast</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Route Information</CardTitle>
            <CardDescription>Current route details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Next Stop</span>
              <span className="text-sm font-medium">Sarah Johnson</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Distance</span>
              <span className="text-sm font-medium">2.3 km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">ETA</span>
              <span className="text-sm font-medium">10:45 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Traffic</span>
              <span className="text-sm font-medium text-secondary">Light</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Navigation Actions</CardTitle>
            <CardDescription>Quick navigation controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Recalculate Route
            </Button>
            <Button className="w-full" variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Report Traffic
            </Button>
            <Button className="w-full" variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call Customer
            </Button>
            <Button className="w-full bg-gradient-success">
              <CheckCircle className="h-4 w-4 mr-2" />
              Arrived at Location
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Route Progress */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Route Progress</CardTitle>
          <CardDescription>Track your progress through today's route</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Overall Progress</span>
                <span className="text-sm font-medium text-foreground">
                  {Math.round((routeStops.filter(stop => stop.status === 'completed').length / routeStops.length) * 100)}%
                </span>
              </div>
              <Progress value={(routeStops.filter(stop => stop.status === 'completed').length / routeStops.length) * 100} className="h-3" />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {routeStops.filter(stop => stop.status === 'completed').length} of {routeStops.length} stops completed
              </span>
              <span className="text-muted-foreground">
                Estimated completion: 4:00 PM
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Status Update View
  const StatusUpdateView = () => {
    const currentDelivery = selectedDelivery 
      ? allDeliveries.find(d => d.id === selectedDelivery)
      : allDeliveries.find(d => d.status === 'in-transit') || allDeliveries[0];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Status Updates</h2>
          <p className="text-muted-foreground">Confirm pickups, deliveries, and collect signatures</p>
        </div>

        {currentDelivery && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Details */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Current {currentDelivery.type === 'pickup' ? 'Pickup' : 'Delivery'}
                  <Badge className={getStatusColor(currentDelivery.status)}>
                    {currentDelivery.status}
                  </Badge>
                </CardTitle>
                <CardDescription>{currentDelivery.order}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customer</span>
                    <span className="text-sm font-medium">{currentDelivery.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Address</span>
                    <span className="text-sm font-medium text-right max-w-48">{currentDelivery.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <span className="text-sm font-medium">{currentDelivery.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Items</span>
                    <span className="text-sm font-medium">{currentDelivery.items}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Priority</span>
                    <Badge className={getPriorityColor(currentDelivery.priority)} variant="outline">
                      {currentDelivery.priority}
                    </Badge>
                  </div>
                </div>
                
                {currentDelivery.specialInstructions && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Special Instructions</p>
                      <p className="text-sm text-muted-foreground">{currentDelivery.specialInstructions}</p>
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Navigation className="h-4 w-4 mr-2" />
                    Navigate
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status Update Form */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>Confirm completion and collect required information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Selection */}
                <div className="space-y-2">
                  <Label htmlFor="status-update">Update Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arrived">Arrived at Location</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed Delivery</SelectItem>
                      <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label>Photo Confirmation</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Take a photo for confirmation</p>
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                  </div>
                </div>

                {/* Digital Signature */}
                <div className="space-y-2">
                  <Label>Customer Signature</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Signature className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Collect customer signature</p>
                    <Button variant="outline" size="sm">
                      <Signature className="h-4 w-4 mr-2" />
                      Get Signature
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="delivery-notes">Delivery Notes</Label>
                  <Textarea
                    id="delivery-notes"
                    placeholder="Add any notes about this delivery..."
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button className="flex-1 bg-gradient-success">
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Updates */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Recent Status Updates</CardTitle>
            <CardDescription>Your recent delivery confirmations and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 1, customer: "Robert Mukasa", action: "Pickup Completed", time: "9:15 AM", status: "completed" },
                { id: 2, customer: "Sarah Johnson", action: "Arrived at Location", time: "10:30 AM", status: "in-progress" },
                { id: 3, customer: "Michael Okello", action: "En Route", time: "11:00 AM", status: "in-transit" },
              ].map((update) => (
                <div key={update.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      update.status === 'completed' ? "bg-secondary/10" : "bg-primary/10"
                    }`}>
                      <CheckCircle className={`h-4 w-4 ${
                        update.status === 'completed' ? "text-secondary" : "text-primary"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{update.customer}</p>
                      <p className="text-xs text-muted-foreground">{update.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(update.status)} variant="outline">
                      {update.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{update.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                  {currentView === "dashboard" && "Driver Dashboard"}
                  {currentView === "routes" && "Delivery Routes"}
                  {currentView === "map" && "GPS Navigation"}
                  {currentView === "status-update" && "Status Updates"}
                </h1>
                <p className="text-sm text-muted-foreground">{driverInfo.vehicle} • {driverInfo.route}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setCurrentView("map")}>
                <Navigation className="h-4 w-4 mr-2" />
                Navigate
              </Button>
              <Button className="bg-gradient-primary" onClick={() => setCurrentView("status-update")}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Update Status
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
        {currentView === "routes" && <DeliveryRoutesView />}
        {currentView === "map" && <MapNavigationView />}
        {currentView === "status-update" && <StatusUpdateView />}
      </div>
    </div>
  );
};

export default DriverDashboard;
