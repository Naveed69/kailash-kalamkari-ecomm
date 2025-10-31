import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) navigate("/admin");
    };
    check();
  }, [navigate]);

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMessage(error.message);
    else setMessage("If the email is registered with Supabase, you should receive a magic link shortly.");
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Admin Login</h2>
      <p className="mb-4">Sign in with your admin email (magic link).</p>
      <input className="input w-full mb-2" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={handleSignIn} className="btn btn-primary">
          Send magic link
        </button>
        <button onClick={() => navigate("/")} className="btn">
          Cancel
        </button>
      </div>
      {message && <div className="mt-2 text-sm">{message}</div>}
    </div>
  );
}
