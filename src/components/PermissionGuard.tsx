// components/PermissionGuard.tsx
import React from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Loader2 } from "lucide-react";

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions: string[];
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions,
  fallback
}) => {
  const { loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Since we simplified to only check .env file, all admins have all permissions
  return <>{children}</>;

};

export default PermissionGuard;