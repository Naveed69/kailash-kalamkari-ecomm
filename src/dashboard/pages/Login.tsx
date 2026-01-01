import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useToast } from "@/shared/ui/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const { signInWithEmailOTP, verifyEmailOTP, role, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Whitelist of allowed admin emails
  const ALLOWED_ADMINS = ["kailashkalamkari1984@gmail.com"];

  useEffect(() => {
    if (user && role) {
      if (role === 'super_admin' || role === 'admin') {
        navigate("/inventory");
      }
    }
  }, [user, role, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // Strict frontend whitelist check
    if (!ALLOWED_ADMINS.includes(trimmedEmail)) {
      toast({
        title: "Access Denied",
        description: "This email is not authorized to access the admin panel.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signInWithEmailOTP(trimmedEmail);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: "Please check your email for the login code.",
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await verifyEmailOTP(email, otp);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Role check will happen in useEffect, but we can also check here if we wait for state update
      // or just let the effect handle redirection.
      // We'll let the effect handle it, but we might want to show a success message.
      toast({
        title: "Login Successful",
        description: "Verifying access...",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-80">
        <h2 className="text-2xl font-semibold mb-6 text-center">Admin Login</h2>
        
        {step === 'email' ? (
          <form onSubmit={handleSendOtp}>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#cf972fff]"
              disabled={loading}
            />
            <button
              type="submit"
              className="w-full bg-[#D49217] text-white py-2 rounded-lg hover:bg-[#cf972ffa] transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Login Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
             <p className="text-sm text-gray-600 mb-4 text-center">
              Enter the code sent to {email}
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#cf972fff]"
              disabled={loading}
            />
            <button
              type="submit"
              className="w-full bg-[#D49217] text-white py-2 rounded-lg hover:bg-[#cf972ffa] transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              Back to Email
            </button>
          </form>
        )}

        <div className="mt-4 text-sm text-muted-foreground text-center">
          or{" "}
          <Link to="/" className="text-[#D49217] hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
