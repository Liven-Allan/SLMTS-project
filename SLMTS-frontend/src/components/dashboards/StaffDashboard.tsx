import { ArrowLeft, Scan, CheckCircle, Clock, AlertTriangle, RefreshCw, Play, Pause, RotateCcw, Home, ClipboardList, Activity, QrCode, Package, User, Timer, Target, TrendingUp, Search, Filter, Eye, Edit, Plus, X, Check, LogOut } from "lucide-react";
import TaskManagement from "@/components/staff/TaskManagement";
import RFIDScanner from "@/components/staff/RFIDScanner";
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
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders, useOrder } from "@/hooks/useOrders";

interface StaffDashboardProps {
  onBack: () => void;
}

type StaffViewType = "dashboard" | "tasks" | "progress" | "rfid-scan";

const StaffDashboard = ({ onBack }: StaffDashboardProps) => {
  const [currentView, setCurrentView] = useState<StaffViewType>("dashboard");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedOrderForRFID, setSelectedOrderForRFID] = useState<string | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  // Hooks
  const { user, logout } = useAuth();
  const { orders, loading, fetchOrders } = useOrders();
  const { updateOrderStage, loading: updateLoading } = useOrder();

  // Load orders on component mount
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user?.id, fetchOrders]);

  // Auto-refresh every 60 seconds to keep data current (reduced frequency)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
      
      // Only refresh if:
      // 1. Not currently loading
      // 2. No success message is showing
      // 3. User hasn't interacted in the last 10 seconds
      // 4. Currently on dashboard or work progress view (not task management)
      if (!loading && !successMessage && timeSinceLastInteraction > 10000 && 
          (currentView === 'dashboard' || currentView === 'progress')) {
        fetchOrders();
      }
    }, 60000); // 60 seconds (reduced from 30)

    return () => clearInterval(interval);
  }, [user?.id, currentView]); // Depend on currentView to avoid refreshing task management

  // Track user interactions to pause auto-refresh
  const handleUserInteraction = () => {
    lastInteractionRef.current = Date.now();
  };

  // Filter orders assigned to current staff member (memoized)
  const staffTasks = useMemo(() => 
    orders.filter(order => 
      order.assigned_to?.id === user?.id || order.assigned_to_id === user?.id
    ), [orders, user?.id]
  );

  const getTasksByStatus = (status: string) => {
    return staffTasks.filter(task => task.status === status);
  };

  // Define all stages in order (for navigation)
  const allStages = [
    'order_placed',
    'pickup_confirmed', 
    'items_received',
    'washing',
    'drying',
    'folding',
    'quality_check',
    'ready_for_delivery',
    'out_for_delivery',
    'delivered'
  ];

  // Define work stages that staff actually work on (for progress and counting)
  const workStages = [
    'items_received',
    'washing', 
    'drying',
    'folding',
    'quality_check',
    'ready_for_delivery',
    'out_for_delivery',
    'delivered'
  ];

  const getNextStage = (currentStage: string) => {
    const currentIndex = allStages.indexOf(currentStage);
    if (currentIndex >= 0 && currentIndex < allStages.length - 1) {
      return allStages[currentIndex + 1];
    }
    return null;
  };

  const getStageProgress = (stage: string) => {
    // For pre-work stages, show minimal progress
    if (['order_placed', 'pickup_confirmed'].includes(stage)) {
      return 5; // Show 5% for initial stages
    }
    
    const workIndex = workStages.indexOf(stage);
    if (workIndex >= 0) {
      // Calculate progress based on work stages (12.5% increments for 8 stages)
      return Math.round(((workIndex + 1) / workStages.length) * 100);
    }
    
    return 0;
  };

  const getWorkStageNumber = (stage: string) => {
    const workIndex = workStages.indexOf(stage);
    return workIndex >= 0 ? workIndex + 1 : 0;
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

  const handleUpdateStage = async (taskId: number, currentStage: string) => {
    const nextStage = getNextStage(currentStage);
    if (nextStage) {
      try {
        await updateOrderStage(taskId, nextStage);
        setSuccessMessage(`Task moved to ${getStageDisplayName(nextStage)}!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchOrders(); // Refresh the orders list
      } catch (error) {
        console.error('Failed to update stage:', error);
      }
    }
  };

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

  // Calculate dynamic staff info from real data
  const staffInfo = {
    name: user?.name || "Staff Member",
    station: user?.station || "Station 1", // Add station to user model if needed
    shift: user?.shift || "Day Shift",
    efficiency: 95, // TODO: Calculate from completed tasks
    tasksToday: staffTasks.length,
    itemsProcessed: staffTasks.reduce((total, task) => total + (task.items || 0), 0)
  };



  // Define work stages with details for reference cards
  const workStageDetails = [
    { stage: "items_received", name: "Items Received", description: "Items collected and logged into system", icon: Package },
    { stage: "washing", name: "Washing", description: "Main washing cycle with appropriate detergents", icon: RefreshCw },
    { stage: "drying", name: "Drying", description: "Dry items using appropriate temperature settings", icon: Timer },
    { stage: "folding", name: "Folding", description: "Fold and organize clean items", icon: ClipboardList },
    { stage: "quality_check", name: "Quality Check", description: "Final inspection for quality assurance", icon: Eye },
    { stage: "ready_for_delivery", name: "Ready for Delivery", description: "Items ready for customer pickup", icon: CheckCircle },
    { stage: "out_for_delivery", name: "Out for Delivery", description: "Items being delivered to customer", icon: AlertTriangle },
    { stage: "delivered", name: "Delivered", description: "Items successfully delivered to customer", icon: CheckCircle }
  ];



  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };



  // Navigation Component
  const NavigationTabs = () => (
    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
      {[
        { id: "dashboard", label: "Dashboard", icon: Home },
        { id: "tasks", label: "Task Management", icon: ClipboardList },
        { id: "progress", label: "Work Progress", icon: Activity },
        { id: "rfid-scan", label: "RFID Scanner", icon: QrCode },
      ].map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        return (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentView(tab.id as StaffViewType);
              handleUserInteraction();
            }}
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
      {/* Staff Info Card */}
      <Card className="shadow-card border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl font-bold">
                {staffInfo.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{staffInfo.name}</h2>
                <p className="text-muted-foreground">{staffInfo.station} • {staffInfo.shift}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{staffInfo.efficiency}%</p>
              <p className="text-sm text-muted-foreground">Efficiency Rating</p>
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
                <p className="text-sm text-muted-foreground">Tasks Today</p>
                <p className="text-3xl font-bold text-foreground mt-1">{staffTasks.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-foreground mt-1">{getTasksByStatus('processing').length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-foreground mt-1">{getTasksByStatus('completed').length}</p>
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
                <p className="text-sm text-muted-foreground">Items Processed</p>
                <p className="text-3xl font-bold text-foreground mt-1">{staffInfo.itemsProcessed}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Current Tasks</CardTitle>
            <CardDescription>Your active and pending tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffTasks.filter(task => task.status !== 'completed').slice(0, 4).length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No active tasks</p>
              ) : (
                staffTasks.filter(task => task.status !== 'completed').slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ClipboardList className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{task.order_id}</p>
                        <p className="text-xs text-muted-foreground">{task.customer?.name || 'Unknown'} • {task.items} items</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(task.status)} variant="outline">
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Item Verification</CardTitle>
            <CardDescription>Quick access to item verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Use the RFID Scanner to verify items</p>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView("rfid-scan")}
                className="bg-gradient-primary text-white border-0"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Open Scanner
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Task Management View - Now uses the dedicated TaskManagement component
  const TaskManagementView = () => (
    <TaskManagement 
      onNavigateToRFID={(orderId) => {
        // Store the selected order ID for RFID Scanner
        setSelectedOrderForRFID(orderId);
        setCurrentView("rfid-scan");
        handleUserInteraction();
      }} 
    />
  );

  // Work Progress View
  const WorkProgressView = () => {
    const currentTask = staffTasks.find(task => task.status === 'processing') || staffTasks[0];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Work Progress Interface</h2>
            <p className="text-muted-foreground">Track and update your current work progress</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              fetchOrders();
              handleUserInteraction();
            }}
            disabled={loading}
            title={`Last updated: ${new Date().toLocaleTimeString()}`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span>{successMessage}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {currentTask ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Task Details */}
            <div className="lg:col-span-1">
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Current Task
                    <Badge className={getStatusColor(currentTask.status)}>
                      {currentTask.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Order: {currentTask.order_id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Customer</span>
                      <span className="text-sm font-medium">{currentTask.customer?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Items</span>
                      <span className="text-sm font-medium">{currentTask.items}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Stage</span>
                      <Badge variant="outline">
                        {getStageDisplayName(currentTask.current_stage)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="text-sm font-medium">UGX {currentTask.amount?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                  
                  {currentTask.special_instructions && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Special Instructions</p>
                        <p className="text-sm text-muted-foreground">{currentTask.special_instructions}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Progress Tracking */}
            <div className="lg:col-span-2">
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Stage Progress</CardTitle>
                  <CardDescription>Mark completion of each work stage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Overall Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Overall Progress</span>
                        <span className="text-sm font-medium text-foreground">
                          {Math.round(getStageProgress(currentTask.current_stage))}%
                        </span>
                      </div>
                      <Progress value={getStageProgress(currentTask.current_stage)} className="h-3" />
                    </div>

                    {/* Current Stage */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-lg border">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">
                            {getStageDisplayName(currentTask.current_stage)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Current Stage - {currentTask.status}
                          </p>
                          {getNextStage(currentTask.current_stage) && (
                            <p className="text-xs text-muted-foreground">
                              Next: {getStageDisplayName(getNextStage(currentTask.current_stage) || '')}
                            </p>
                          )}
                        </div>
                        {getNextStage(currentTask.current_stage) && (
                          <Button 
                            size="sm" 
                            className="bg-gradient-success"
                            onClick={() => handleUpdateStage(currentTask.id, currentTask.current_stage)}
                            disabled={updateLoading}
                          >
                            {updateLoading ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Next Stage
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Stage Progress Visualization */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Stage Timeline</h4>
                      <div className="space-y-2">
                        {workStages.map((stage, index) => {
                          const currentWorkIndex = workStages.indexOf(currentTask.current_stage);
                          const stageWorkIndex = workStages.indexOf(stage);
                          const isCompleted = currentWorkIndex > stageWorkIndex;
                          const isCurrent = currentTask.current_stage === stage;
                          const isNext = getNextStage(currentTask.current_stage) === stage;
                          
                          return (
                            <div key={stage} className={`flex items-center gap-3 p-2 rounded-lg ${
                              isCurrent ? 'bg-primary/10 border border-primary/20' : 
                              isCompleted ? 'bg-green-50 border border-green-200' :
                              isNext ? 'bg-blue-50 border border-blue-200' :
                              'bg-muted/30'
                            }`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isCompleted ? 'bg-green-500 text-white' :
                                isCurrent ? 'bg-primary text-white' :
                                isNext ? 'bg-blue-500 text-white' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <span className="text-xs font-bold">{index + 1}</span>
                                )}
                              </div>
                              <span className={`text-sm font-medium ${
                                isCurrent ? 'text-primary' :
                                isCompleted ? 'text-green-700' :
                                isNext ? 'text-blue-700' :
                                'text-muted-foreground'
                              }`}>
                                {getStageDisplayName(stage)}
                              </span>
                              {isCurrent && (
                                <Badge variant="outline" className="ml-auto">Current</Badge>
                              )}
                              {isNext && (
                                <Badge variant="outline" className="ml-auto text-blue-600">Next</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="shadow-card border-0">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No active tasks assigned</p>
              <p className="text-xs text-muted-foreground">
                You have {staffTasks.length} total tasks assigned
              </p>
            </CardContent>
          </Card>
        )}

        {/* Work Stages Reference */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Work Stages Reference</CardTitle>
            <CardDescription>Standard laundry process stages and descriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {workStageDetails.map((stage, index) => {
                const Icon = stage.icon;
                const isCurrentStage = currentTask?.current_stage === stage.stage;
                return (
                  <div key={index} className={`p-4 rounded-lg border transition-colors ${
                    isCurrentStage ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isCurrentStage ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-medium text-foreground">{stage.name}</h3>
                      {isCurrentStage && (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // RFID Scanner View - Now uses the dedicated RFIDScanner component
  const RFIDScannerView = () => (
    <RFIDScanner 
      selectedOrderId={selectedOrderForRFID}
      onOrderComplete={(orderId) => {
        // When items are verified and task started, go back to task management
        setSelectedOrderForRFID(null);
        setCurrentView("tasks");
        setSuccessMessage(`Task ${orderId} started successfully! Items have been verified.`);
        setTimeout(() => setSuccessMessage(null), 5000);
        // Refresh orders to show updated status
        fetchOrders();
      }}
    />
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
                  {currentView === "dashboard" && "Staff Dashboard"}
                  {currentView === "tasks" && "Task Management"}
                  {currentView === "progress" && "Work Progress"}
                  {currentView === "rfid-scan" && "RFID Scanner"}
                </h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name || 'Staff'} • {staffInfo.station}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* User Info */}
              <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'S'}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">{user?.name || 'Staff'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role || 'staff'}</p>
                </div>
              </div>

              <Button variant="outline" onClick={() => setCurrentView("rfid-scan")}>
                <QrCode className="h-4 w-4 mr-2" />
                Quick Scan
              </Button>
              <Button className="bg-gradient-success" onClick={() => setCurrentView("progress")}>
                <Activity className="h-4 w-4 mr-2" />
                Work Progress
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
        {currentView === "tasks" && <TaskManagementView />}
        {currentView === "progress" && <WorkProgressView />}
        {currentView === "rfid-scan" && <RFIDScannerView />}
      </div>
    </div>
  );
};

export default StaffDashboard;
