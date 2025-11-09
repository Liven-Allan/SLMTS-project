import { ArrowLeft, TrendingUp, Users, Package, DollarSign, Calendar, BarChart3, Clock, Settings, UserPlus, Edit, Trash2, Eye, Search, Filter, Download, Plus, CheckCircle, AlertCircle, XCircle, Home, FileText, Cog, LogOut } from "lucide-react";
import UserManagement from "@/components/admin/UserManagement";
import SettingsManagement from "@/components/admin/SettingsManagement";
import OrderManagement from "@/components/admin/OrderManagement";
import FinancialManagement from "@/components/admin/FinancialManagement";
import AdminDashboardOverview from "@/components/admin/AdminDashboardOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AdminDashboardProps {
  onBack: () => void;
}

type AdminViewType = "dashboard" | "users" | "orders" | "financial" | "settings";

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const [currentView, setCurrentView] = useState<AdminViewType>("dashboard");

  // Hooks
  const { user, logout } = useAuth();



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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "bg-status-processing text-white";
      case "pending": return "bg-status-pending text-white";
      case "completed": return "bg-status-completed text-white";
      case "cancelled": return "bg-status-cancelled text-white";
      case "active": return "bg-secondary text-secondary-foreground";
      case "break": return "bg-accent text-accent-foreground";
      case "paid": return "bg-secondary text-secondary-foreground";
      case "overdue": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "customer": return "bg-primary/10 text-primary";
      case "staff": return "bg-secondary/10 text-secondary";
      case "driver": return "bg-accent/10 text-accent";
      case "admin": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Navigation Component
  const NavigationTabs = () => (
    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
      {[
        { id: "dashboard", label: "Dashboard", icon: Home },
        { id: "users", label: "User Management", icon: Users },
        { id: "orders", label: "Order Management", icon: Package },
        { id: "financial", label: "Financial", icon: DollarSign },
        { id: "settings", label: "Settings", icon: Cog },
      ].map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        return (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView(tab.id as AdminViewType)}
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

  // Dashboard Overview - Now uses the dedicated AdminDashboardOverview component
  const DashboardView = () => <AdminDashboardOverview />;

  // User Management View - Now uses the dedicated UserManagement component
  const UserManagementView = () => <UserManagement />;

  // Order Management View - Now uses the dedicated OrderManagement component
  const OrderManagementView = () => <OrderManagement />;

  // Financial Overview View - Now uses the dedicated FinancialManagement component
  const FinancialView = () => <FinancialManagement />;



  // Settings View - Now uses the dedicated SettingsManagement component
  const SettingsView = () => <SettingsManagement />;

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
                  {currentView === "dashboard" && "Admin Dashboard"}
                  {currentView === "users" && "User Management"}
                  {currentView === "orders" && "Order Management"}
                  {currentView === "financial" && "Financial Overview"}
                  {currentView === "settings" && "System Settings"}
                </h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name || 'Admin'} • CityVille Laundromat</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* User Info */}
              <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'A'}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role || 'admin'}</p>
                </div>
              </div>
              
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
              <Button className="bg-gradient-primary">
                <Download className="h-4 w-4 mr-2" />
                Export Report
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
        {currentView === "users" && <UserManagementView />}
        {currentView === "orders" && <OrderManagementView />}
        {currentView === "financial" && <FinancialView />}
        {currentView === "settings" && <SettingsView />}
      </div>
    </div>
  );
};

export default AdminDashboard;
