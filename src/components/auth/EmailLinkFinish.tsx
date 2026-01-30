import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EmailLinkFinish = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        // Get email from localStorage
        const email = window.localStorage.getItem('emailForSignIn');
        
        if (!email) {
          setError('No email found. Please request a new sign-in link.');
          setLoading(false);
          return;
        }

        // Get the sign-in link from URL
        const urlParams = new URLSearchParams(location.search);
        const link = window.location.href;

        // Complete sign-in
        const success = await signInWithEmail(email, link);
        
        if (success) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setError('Failed to sign in. The link may have expired or been used already.');
        }
      } catch (err) {
        setError('An error occurred during sign-in. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    completeSignIn();
  }, [location, signInWithEmail, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Completing Sign In
            </CardTitle>
            <CardDescription>
              Please wait while we verify your sign-in link...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Sign In Successful!
            </CardTitle>
            <CardDescription>
              You have been successfully signed in. Redirecting...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Sign In Failed
          </CardTitle>
          <CardDescription>
            We couldn't complete your sign-in
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Link to="/login/email-link">
              <Button className="w-full bg-[#D49217] hover:bg-[#cf972ffa]">
                Request New Link
              </Button>
            </Link>
            
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailLinkFinish;
