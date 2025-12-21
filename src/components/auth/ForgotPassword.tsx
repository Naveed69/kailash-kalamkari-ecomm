import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error) {
      // Error is handled in the context
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Reset Email Sent
            </CardTitle>
            <CardDescription>
              We've sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Check your email and click the reset link to create a new password. The link will expire in 24 hours.
              </AlertDescription>
            </Alert>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive the email?
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setEmailSent(false);
                  setLoading(false);
                }}
                className="text-[#D49217] hover:text-[#cf972ffa] p-0 h-auto"
              >
                Send another email
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-[#D49217]/10 rounded-full">
              <Mail className="h-8 w-8 text-[#D49217]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#D49217] hover:bg-[#cf972ffa] text-white font-medium"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Remember your password? 
            <Link to="/login" className="text-[#D49217] hover:text-[#cf972ffa] ml-1">
              Sign in
            </Link>
          </div>

          <div className="w-full border-t pt-4">
            <Link to="/login">
              <Button
                variant="outline"
                className="w-full h-10 border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
