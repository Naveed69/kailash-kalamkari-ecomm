import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';

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
  const { toast } = useToast();
  const navigate = useNavigate();

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
        navigate('/inventory/dashboard');
      } else {
        // Sign up
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Success',
          description: 'Account created successfully!',
        });
        // Auto sign in after sign up
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/inventory/dashboard');
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


  return (
    <Card className="w-full max-w-md mx-auto">
      {showHeader && (
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isLogin ? 'Sign In' : 'Create Account'}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
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
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => {/* Add forgot password logic */}}
                >
                  Forgot password?
                </button>
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
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
          
          <div className="text-center text-sm">
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
