import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Phone, Loader2 } from 'lucide-react';

interface PhoneLoginProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const PhoneLogin: React.FC<PhoneLoginProps> = ({ onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  
  const { signInWithOTP, verifyOTP } = useAuth();
  const { toast } = useToast();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone.length !== 10) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signInWithOTP(phone);
    
    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'OTP Sent!',
        description: `We've sent a 6-digit code to +91 ${phone}`,
        className: 'bg-green-50 border-green-200',
      });
      setStep('otp');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit code sent to your phone',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await verifyOTP(phone, otp);
    
    if (error) {
      toast({
        title: 'Invalid OTP',
        description: 'The code you entered is incorrect. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Login Successful!',
        description: 'Welcome back!',
        className: 'bg-green-50 border-green-200',
      });
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Login / Sign Up</CardTitle>
        <CardDescription>
          {step === 'phone' 
            ? 'Enter your phone number to continue' 
            : `Enter the OTP sent to +91 ${phone}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <Label className="mb-2 block">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 border rounded-md bg-slate-50">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium">+91</span>
                </div>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 text-lg"
                  maxLength={10}
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                We'll send you a one-time password
              </p>
            </div>
            
            <Button type="submit" className="w-full" size="lg" disabled={loading || phone.length !== 10}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <Label className="mb-2 block">Enter OTP</Label>
              <div className="flex justify-center my-4">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-center text-slate-500 mt-2">
                Check your SMS for the 6-digit code
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading || otp.length !== 6}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Login'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('phone');
                setOtp('');
              }}
            >
              ← Change Phone Number
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
