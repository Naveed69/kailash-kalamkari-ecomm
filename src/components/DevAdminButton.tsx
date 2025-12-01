import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const DevAdminButton = () => {
  const navigate = useNavigate();
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    // Check if in development mode
    setIsDevelopment(import.meta.env.DEV || import.meta.env.MODE === 'development');
  }, []);

  if (!isDevelopment) return null;

  const handleAdminClick = async () => {
    try {
      // Try Supabase auth first (if user exists in Supabase Auth)
      const { supabase } = await import("@/lib/supabaseClient");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "kailashkalamkari1984@gmail.com",
        password: "9951821516",
      });

      if (!error && data.user) {
        // Supabase auth successful
        console.log("✅ Dev admin authenticated via Supabase:", data.user);
        localStorage.setItem("isLoggedIn", "true");
        navigate("/inventory");
        return;
      }

      // Supabase auth failed - fallback to localStorage only
      console.warn("⚠️ Supabase auth not configured. Using localStorage fallback.");
      console.info("To enable Supabase auth: Create user with email 'kailashkalamkari1984@gmail.com' in Supabase Auth");
      
      localStorage.setItem("isLoggedIn", "true");
      navigate("/inventory");
      
    } catch (err) {
      // Any error - just use localStorage fallback
      console.warn("Dev admin fallback to localStorage:", err);
      localStorage.setItem("isLoggedIn", "true");
      navigate("/inventory");
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
