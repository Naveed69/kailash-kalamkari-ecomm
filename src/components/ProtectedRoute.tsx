import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/lib/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // User is logged in but doesn't have permission
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
        <div className="p-4 bg-gray-100 rounded-lg text-sm font-mono">
          <p>User ID: {user.id}</p>
          <p>Current Role: <span className="font-bold">{role}</span></p>
          <p>Required Roles: {allowedRoles.join(', ')}</p>
        </div>
        <p className="text-gray-600 max-w-md text-center">
          If you are the admin, please ensure you have run the SQL command to set your role to 'super_admin'.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
