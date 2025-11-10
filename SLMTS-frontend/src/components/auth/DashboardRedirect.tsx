/**
 * Dashboard Redirect Component
 * Redirects users to their appropriate dashboard based on their role
 */

import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'customer':
      return <Navigate to="/dashboard/customer" replace />;
    case 'staff':
      return <Navigate to="/dashboard/staff" replace />;
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    default:
      return <Navigate to="/dashboard/customer" replace />;
  }
};

export default DashboardRedirect;