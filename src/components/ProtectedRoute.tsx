// components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { 
  ShieldAlert, 
  Loader2, 
  AlertCircle,
  Shield,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  showDetails?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = true,
  showDetails = import.meta.env.DEV // Show debug details in development
}) => {
  const { admin, loading, isAdmin } = useAdminAuth();
  const location = useLocation();
  const from = location.pathname;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#D49217]" />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Verifying Access
            </p>
            <p className="text-sm text-gray-500">
              Please wait while we check your permissions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If admin access is required but user is not admin
  if (requireAdmin && !isAdmin) {
    console.warn('Non-admin user attempted to access protected route:', {
      path: from,
      userEmail: admin?.email,
      isAdmin
    });

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-red-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100">
                <ShieldAlert className="h-7 w-7 text-red-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Access Denied
                </h2>
                <p className="text-gray-600 mt-2">
                  This area is restricted to authorized administrators only.
                </p>
              </div>

              {showDetails && admin && (
                <Alert className="bg-gray-50 border-gray-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Debug Information</AlertTitle>
                  <AlertDescription className="text-xs font-mono mt-1">
                    <div>User: {admin.email}</div>
                    <div>Is Admin: {isAdmin ? 'Yes' : 'No'}</div>
                    <div>Admin List Check: {import.meta.env.VITE_ADMIN_EMAILS?.includes(admin.email || '') ? 'Found' : 'Not Found'}</div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-4">
                <Button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-[#D49217] hover:bg-[#cf972ffa]"
                  size="lg"
                >
                  Return to Home
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/admin'}
                  className="w-full mt-3"
                >
                  Admin Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If admin is required but not logged in
  if (requireAdmin && !admin) {
    return (
      <Navigate 
        to="/admin" 
        state={{ 
          from: from,
          message: "Please log in to access this page"
        }} 
        replace 
      />
    );
  }

  // Access granted
  return <>{children}</>;
};

export default ProtectedRoute;