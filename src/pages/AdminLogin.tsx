// AdminLogin.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, ShoppingCart } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { admin, isAdmin, signInAdmin, resetPassword } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get admin emails from environment variable
  const ALLOWED_ADMINS = import.meta.env.VITE_ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];

  // Debug information (only show in development)
  const isDevelopment = import.meta.env.DEV;
  const envVariableExists = !!import.meta.env.VITE_ADMIN_EMAILS;

  useEffect(() => {
    console.log("CHECKING...", isAdmin)
    if (admin && isAdmin) {
      console.log('Admin authenticated, navigating to inventory...');
      navigate("/inventory/dashboard", { replace: true });
    }
  }, [admin, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    // Validation
    if (!trimmedEmail || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Check if email is in allowed admin list
    if (!ALLOWED_ADMINS.includes(trimmedEmail)) {
      toast({
        title: "Access Denied",
        description: "This email is not authorized for admin access. Please contact the system administrator.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const success = await signInAdmin(trimmedEmail, password);

      if (success) {
        toast({
          title: "Login Successful",
          description: `Welcome back!`,
        });
        // Navigation will happen automatically via the useEffect
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    // Check if email is in allowed admin list
    if (!ALLOWED_ADMINS.includes(trimmedEmail)) {
      toast({
        title: "Access Denied",
        description: "Password reset is only available for authorized admin emails.",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(trimmedEmail);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin(e as any);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Debug info - only show in development */}
        {/* {isDevelopment && envVariableExists && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <AlertDescription className="text-xs">
              <strong>Debug Info:</strong> Found {ALLOWED_ADMINS.length} admin email(s) in environment
            </AlertDescription>
          </Alert>
        )}

        {isDevelopment && !envVariableExists && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertDescription className="text-xs">
              <strong>Warning:</strong> VITE_ADMIN_EMAILS environment variable not found
            </AlertDescription>
          </Alert>
        )} */}

        <Card className="shadow-xl border-gray-200">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-[#D49217]/10 rounded-full">
                <Lock className="h-8 w-8 text-[#D49217]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-center">
              Restricted access for authorized administrators only
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-11"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleForgotPassword}
                    disabled={resetLoading || loading}
                    className="h-auto p-0 text-xs text-gray-500 hover:text-[#D49217]"
                  >
                    {resetLoading ? "Sending..." : "Forgot password?"}
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 pr-10 h-11"
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[#D49217] hover:bg-[#cf972ffa] text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              This portal is restricted to authorized personnel only.
            </div>

            <div className="w-full border-t pt-4">
              <Link to="/">
                <Button
                  variant="outline"
                  className="w-full h-10 border-gray-300 hover:bg-gray-50"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>

        
      </div>
    </div>
  );
};

export default AdminLogin;