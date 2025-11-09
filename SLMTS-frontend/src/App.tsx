import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardRedirect from "./components/auth/DashboardRedirect";
import CustomerDashboard from "./components/dashboards/CustomerDashboard";
import StaffDashboard from "./components/dashboards/StaffDashboard";

import AdminDashboard from "./components/dashboards/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/dashboard/customer" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard onBack={() => window.history.back()} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/staff" 
              element={
                <ProtectedRoute requiredRole="staff">
                  <StaffDashboard onBack={() => window.history.back()} />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard onBack={() => window.history.back()} />
                </ProtectedRoute>
              } 
            />
            
            {/* Generic dashboard route - redirects based on user role */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
