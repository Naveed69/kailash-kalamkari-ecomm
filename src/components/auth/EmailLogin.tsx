import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Loader2, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OtpInput } from './OtpInput';
import { Phone, CheckCircle2 } from 'lucide-react';

interface EmailLoginProps {
  showHeader?: boolean;
}

export const EmailLogin: React.FC<EmailLoginProps> = ({
  showHeader = false
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verificationId, setVerificationId] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setupRecaptcha, signInWithPhone } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Success',
          description: 'Successfully signed in!',
        });
        navigate('/');
      } else {
        // Sign up
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Success',
          description: 'Account created successfully!',
        });
        // Auto sign in after sign up
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Authentication failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let trimmedPhone = phoneNumber.trim().replace(/\s/g, '');

    if (!trimmedPhone) return;

    // Validation: Check if it's a 10-digit number without country code
    const isTenDigits = /^\d{10}$/.test(trimmedPhone);
    const hasCountryCode = trimmedPhone.startsWith('+');

    if (!hasCountryCode && isTenDigits) {
      trimmedPhone = '+91' + trimmedPhone;
    } else if (!hasCountryCode) {
      toast({
        title: 'Invalid Format',
        description: 'Please enter a 10-digit phone number or include country code starting with +.',
        variant: 'destructive',
      });
      return;
    } else if (hasCountryCode && trimmedPhone.length < 10) {
      toast({
        title: 'Invalid Format',
        description: 'Phone number is too short.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      setupRecaptcha('phone-recaptcha-container');
      const result = await signInWithPhone(trimmedPhone);
      setVerificationId(result);
      setOtpSent(true);
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    if (!verificationId) return;

    setLoading(true);
    try {
      await verificationId.confirm(otp);
      toast({
        title: 'Success',
        description: 'Successfully signed in!',
      });
      navigate('/');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: 'Error',
        description: 'Invalid OTP code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      {showHeader && (
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800">
            {isLogin ? 'Sign In' : 'Create Account'}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone / OTP</TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <Link
                      to="/forgot-password"
                      className="text-[#D49217] hover:underline text-sm"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#D49217] hover:bg-[#B37A12]"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="phone">
            {!otpSent ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={loading}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter your 10-digit mobile number.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#D49217] hover:bg-[#B37A12]"
                  disabled={loading || !phoneNumber}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send OTP
                </Button>
                <div id="phone-recaptcha-container"></div>
              </form>
            ) : (
              <div className="space-y-6 py-2">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-2">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Verify OTP</h3>
                  <p className="text-sm text-slate-500">
                    Sent to {phoneNumber}
                  </p>
                </div>

                <OtpInput onComplete={handleVerifyOtp} disabled={loading} />

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setVerificationId(null);
                    }}
                    className="text-sm text-[#D49217] hover:underline"
                    disabled={loading}
                  >
                    Change Phone Number
                  </button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            className="text-[#D49217] hover:underline font-medium"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Passwordless Email Option */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>

        <Link to="/login/email-link">
          <Button
            variant="outline"
            className="w-full border-[#D49217] text-[#D49217] hover:bg-[#D49217]/5"
            type="button"
          >
            <Key className="mr-2 h-4 w-4" />
            Sign in with Email Link
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
