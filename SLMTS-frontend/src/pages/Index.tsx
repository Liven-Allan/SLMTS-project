import { useNavigate } from "react-router-dom";
import { Users, Package, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

type UserRole = "customer" | "staff" | "admin";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleRoleSelection = (role: UserRole) => {
    if (isAuthenticated && user?.role === role) {
      // User is already authenticated with the correct role, go directly to dashboard
      navigate(`/dashboard/${role}`);
    } else {
      // User needs to login/register, redirect to login with intended destination
      navigate('/login', { state: { intendedRole: role, from: `/dashboard/${role}` } });
    }
  };

  const roles = [
    {
      id: "customer" as UserRole,
      title: "Customer Portal",
      description: "Track orders, schedule pickups, and manage preferences",
      icon: Users,
      gradient: "from-primary to-primary-dark",
    },
    {
      id: "staff" as UserRole,
      title: "Staff Dashboard",
      description: "Manage tasks, scan RFID tags, update work progress",
      icon: Package,
      gradient: "from-secondary to-secondary-light",
    },
    {
      id: "admin" as UserRole,
      title: "Admin Dashboard",
      description: "Analytics, user management, financial overview",
      icon: BarChart3,
      gradient: "from-primary to-secondary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-hero py-20 px-4 sm:px-6 lg:px-8">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: 'url(/laundry.png)' }}
        ></div>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Smart Laundry Management System</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
            CityVille Laundromat
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto mb-8 animate-fade-in">
            Streamlined operations from order intake to final delivery. Real-time tracking, 
            automated workflows, and intelligent decision-making for modern laundry services.
          </p>
        </div>
      </div>

      {/* Role Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in border-0 shadow-card"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleRoleSelection(role.id)}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                  <Button
                    variant="ghost"
                    className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Access Dashboard
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="mt-20 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Real-Time Tracking</h3>
              <p className="text-muted-foreground">
                Monitor every garment from pickup to delivery with RFID technology
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Automated Workflows</h3>
              <p className="text-muted-foreground">
                Reduce manual errors and streamline operations with smart automation
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Make data-driven decisions with comprehensive performance insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
