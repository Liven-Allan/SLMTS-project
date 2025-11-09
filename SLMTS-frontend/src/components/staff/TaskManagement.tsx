import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Filter, Eye, Edit, Play, CheckCircle, Clock, AlertTriangle, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useOrders, useOrder } from "@/hooks/useOrders";
import { Order } from "@/services/api/types";

interface TaskManagementProps {
  onNavigateToRFID?: (orderId: string) => void;
}

const TaskManagement = ({ onNavigateToRFID }: TaskManagementProps = {}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Order | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const lastInteractionRef = useRef<number>(Date.now());

  // Hooks
  const { user } = useAuth();
  const { orders, loading, error, fetchOrders } = useOrders();
  const { updateOrderStage, loading: updateLoading } = useOrder();

  // Load orders assigned to this staff member
  useEffect(() => {
    if (user) {
      fetchOrders().then(() => setLastRefresh(new Date()));
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
      if (!loading && !successMessage && timeSinceLastInteraction > 10000) {
        fetchOrders().then(() => setLastRefresh(new Date()));
      }
    }, 60000); // 60 seconds (reduced from 30)

    return () => clearInterval(interval);
  }, [user?.id]); // Only depend on user.id, not fetchOrders

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

  // Filter tasks based on search and status (memoized)
  const filteredTasks = useMemo(() => 
    staffTasks.filter(task => {
      const matchesSearch = 
        task.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }), [staffTasks, searchTerm, statusFilter]
  );

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
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

  const handleStartTask = async (task: Order) => {
    // Redirect to RFID Scanner to verify items first
    if (onNavigateToRFID) {
      onNavigateToRFID(task.order_id);
    } else {
      // Fallback: direct start (for backward compatibility)
      try {
        await updateOrderStage(task.id, 'items_received');
        setSuccessMessage(`Task ${task.order_id} started successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchOrders();
      } catch (error) {
        console.error('Failed to start task:', error);
      }
    }
  };

  const handleNextStage = async (task: Order) => {
    const nextStage = getNextStage(task.current_stage);
    if (nextStage) {
      try {
        await updateOrderStage(task.id, nextStage);
        setSuccessMessage(`Task ${task.order_id} moved to ${getStageDisplayName(nextStage)}!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchOrders(); // Refresh the orders list
      } catch (error) {
        console.error('Failed to update stage:', error);
      }
    }
  };

  const getPriorityColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
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

  const canStartTask = (task: Order) => {
    return task.status === 'pending' && ['order_placed', 'pickup_confirmed'].includes(task.current_stage);
  };

  const canProgressStage = (task: Order) => {
    return task.status === 'processing' && getNextStage(task.current_stage) !== null;
  };

  const getActionButtonText = (task: Order) => {
    if (canStartTask(task)) {
      return 'Verify Items';
    } else if (canProgressStage(task)) {
      const nextStage = getNextStage(task.current_stage);
      return `Next: ${getStageDisplayName(nextStage || '')}`;
    }
    return 'View Details';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  if (loading && staffTasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-6 w-6 animate-spin mr-2" />
        <span>Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Task Management</h2>
          <p className="text-muted-foreground">View and manage your assigned laundry tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleUserInteraction();
              }}
              onFocus={handleUserInteraction}
            />
          </div>
          <Select 
            value={statusFilter} 
            onValueChange={(value) => {
              setStatusFilter(value);
              handleUserInteraction();
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                fetchOrders().then(() => setLastRefresh(new Date()));
                handleUserInteraction();
              }}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <span className="text-xs text-muted-foreground">
              Updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>
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

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>Error loading tasks: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{getTasksByStatus('pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{getTasksByStatus('processing').length}</p>
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
                <p className="text-2xl font-bold">{getTasksByStatus('completed').length}</p>
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
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{staffTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Tabs */}
      <Tabs 
        defaultValue="pending" 
        className="space-y-4"
        onValueChange={handleUserInteraction}
      >
        <TabsList className="bg-muted">
          <TabsTrigger value="pending" className="data-[state=active]:bg-card">
            Pending ({getTasksByStatus('pending').length})
          </TabsTrigger>
          <TabsTrigger value="processing" className="data-[state=active]:bg-card">
            Processing ({getTasksByStatus('processing').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-card">
            Completed ({getTasksByStatus('completed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {getTasksByStatus('pending').length === 0 ? (
            <Card className="shadow-card border-0">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No pending tasks</p>
              </CardContent>
            </Card>
          ) : (
            getTasksByStatus('pending').map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          {getTasksByStatus('processing').length === 0 ? (
            <Card className="shadow-card border-0">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No tasks in progress</p>
              </CardContent>
            </Card>
          ) : (
            getTasksByStatus('processing').map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {getTasksByStatus('completed').length === 0 ? (
            <Card className="shadow-card border-0">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No completed tasks</p>
              </CardContent>
            </Card>
          ) : (
            getTasksByStatus('completed').map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* No Tasks Message */}
      {staffTasks.length === 0 && !loading && (
        <Card className="shadow-card border-0">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No tasks assigned to you yet</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>User ID: {user?.id} | Role: {user?.role}</p>
              <p>Total Orders in System: {orders.length}</p>
              <p>Orders Assigned to You: {staffTasks.length}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Task Card Component
  function TaskCard({ task }: { task: Order }) {
    return (
      <Card className="shadow-card border-0 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-lg">{task.order_id}</CardTitle>
                <Badge className={getPriorityColor(task.status)}>
                  {task.status}
                </Badge>
                <Badge variant="outline">
                  {getStageDisplayName(task.current_stage)}
                </Badge>
              </div>
              <CardDescription className="space-y-1">
                <div>Customer: {task.customer?.name || 'Unknown'}</div>
                <div>{task.items} items • {formatCurrency(task.amount || 0)}</div>
                {task.special_instructions && (
                  <div className="text-accent">⚠️ {task.special_instructions}</div>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium text-foreground">
                  {Math.round(getStageProgress(task.current_stage))}%
                </span>
              </div>
              <Progress value={getStageProgress(task.current_stage)} className="h-2" />
            </div>

            {/* Current Stage Indicator */}
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Clock className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Current: {getStageDisplayName(task.current_stage)}
                </p>
                {getNextStage(task.current_stage) && (
                  <p className="text-xs text-muted-foreground">
                    Next: {getStageDisplayName(getNextStage(task.current_stage) || '')}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {getWorkStageNumber(task.current_stage) > 0 
                  ? `Stage ${getWorkStageNumber(task.current_stage)} of ${workStages.length}`
                  : 'Pre-work'
                }
              </Badge>
            </div>

            {/* Task Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Pickup Date:</span>
                <p className="font-medium">{task.pickup_date ? formatDate(task.pickup_date) : 'Not scheduled'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Delivery Date:</span>
                <p className="font-medium">{task.estimated_delivery ? formatDate(task.estimated_delivery) : 'TBD'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Created: {formatDate(task.created_at)}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                {canStartTask(task) && (
                  <Button 
                    size="sm" 
                    className="bg-gradient-success"
                    onClick={() => handleStartTask(task)}
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Package className="h-4 w-4 mr-2" />
                        Verify Items
                      </>
                    )}
                  </Button>
                )}
                {canProgressStage(task) && (
                  <Button 
                    size="sm" 
                    className="bg-gradient-primary"
                    onClick={() => handleNextStage(task)}
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
          </div>
        </CardContent>
      </Card>
    );
  }
};

export default TaskManagement;