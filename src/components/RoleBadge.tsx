// components/RoleBadge.tsx
import React from "react";
import { Shield, Crown, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: 'super_admin' | 'admin' | 'user';
  showIcon?: boolean;
  className?: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  showIcon = true, 
  className 
}) => {
  const roleConfig = {
    super_admin: {
      icon: Crown,
      label: "Super Admin",
      className: "bg-purple-100 text-purple-800 border-purple-200"
    },
    admin: {
      icon: Shield,
      label: "Admin",
      className: "bg-blue-100 text-blue-800 border-blue-200"
    },
    user: {
      icon: User,
      label: "User",
      className: "bg-gray-100 text-gray-800 border-gray-200"
    }
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
      config.className,
      className
    )}>
      {showIcon && <Icon className="h-3 w-3 mr-1.5" />}
      {config.label}
    </span>
  );
};

export default RoleBadge;