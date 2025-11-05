import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: session } = await supabase.auth.getSession();
      const envAdmins = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ?? "";
      const allowed = envAdmins.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

      if (session?.session && session.session.user && allowed.length > 0) {
        const email = session.session.user.email?.toLowerCase();
        if (email && allowed.includes(email)) {
          setIsAdmin(true);
        } else {
          // Not authorized
          navigate("/admin/login");
        }
      } else {
        navigate("/admin/login");
      }
      setLoading(false);
    };
    check();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return null;
  return <>{children}</>;
};
