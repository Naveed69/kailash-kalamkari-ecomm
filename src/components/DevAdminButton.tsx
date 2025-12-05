import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const DevAdminButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Determine if the button should be shown
  // Shows on: localhost, Vercel preview deployments, or if VITE_SHOW_DEV_BUTTON is set
  // Hides on: Hostinger production (or any other domain)
  const shouldShowButton = () => {
    const hostname = window.location.hostname;
    
    // Allow on localhost (development)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }
    
    // Allow on Vercel preview/staging deployments
    if (hostname.includes('vercel.app')) {
      return true;
    }
    
    // Allow if explicitly enabled via environment variable
    if (import.meta.env.VITE_SHOW_DEV_BUTTON === 'true') {
      return true;
    }
    
    // Hide on all other domains (e.g., Hostinger production)
    return false;
  };

  // Don't render at all if not allowed
  if (!shouldShowButton()) {
    return null;
  }

  useEffect(() => {
    if (isLoggingIn && user) {
      // Login successful and AuthContext updated
      console.log("✅ Dev admin logged in, navigating...");
      setIsLoggingIn(false);
      navigate("/inventory");
    }
  }, [user, isLoggingIn, navigate]);

  const handleAdminClick = async () => {
    setIsLoggingIn(true);
    try {
      // Try Supabase auth first (if user exists in Supabase Auth)
      const { supabase } = await import("@/lib/supabaseClient");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "kailashkalamkari1984@gmail.com",
        password: "9951821516",
      });

      if (error) {
        console.warn("⚠️ Dev auto-login failed:", error.message);
        toast({
          title: "Dev Login Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoggingIn(false);
        return;
      }

      if (data.user) {
        console.log("✅ Dev admin authenticated via Supabase:", data.user);
        toast({
          title: "Dev Login Successful",
          description: "Redirecting...",
        });
      }
      
    } catch (err: any) {
      console.warn("Dev admin error:", err);
      toast({
        title: "Dev Error",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
      setIsLoggingIn(false);
    }
  };

  return (
    <button
      onClick={handleAdminClick}
      className="fixed bottom-6 right-6 z-[9999] group"
      title="Admin Access (Dev Only)"
    >
      <div className="relative">
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-[#D49217] opacity-75 animate-ping"></div>
        
        {/* Main button */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#D49217] to-[#cf972f] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
          <Shield className="w-7 h-7 text-white" />
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
            <div className="font-semibold">Admin Access</div>
            <div className="text-gray-300 text-[10px]">Development Mode</div>
            {/* Arrow */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        </div>

        {/* Dev badge */}
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
          DEV
        </div>
      </div>
    </button>
  );
};

export default DevAdminButton;
