// components/RouteGuard.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  path: string;
}

// Define route permissions
const routePermissions: Record<string, ('super_admin' | 'admin')[]> = {
  '/inventory/dashboard': ['admin', 'super_admin'],
  '/inventory/products': ['admin', 'super_admin'],
  '/inventory/orders': ['admin', 'super_admin'],
  '/inventory/categories': ['admin', 'super_admin'],
  '/inventory/settings': ['super_admin'], // Only super admin
  '/inventory/users': ['super_admin'], // Only super admin
};

const RouteGuard: React.FC<RouteGuardProps> = ({ children, path }) => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D49217]" />
      </div>
    );
  }

  // Check if route requires admin access
  if (path.startsWith('/inventory') && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;