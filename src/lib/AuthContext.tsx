import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'super_admin' | 'admin' | 'customer';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  
  // Email authentication methods
  signInWithEmail: (email: string) => Promise<{ error: any }>;
  signInWithMagicLink: (email: string, redirectTo?: string) => Promise<{ error: any }>;
  signInWithEmailOTP: (email: string) => Promise<{ error: any }>;
  verifyEmailOTP: (email: string, token: string) => Promise<{ error: any }>;
  
  // Legacy phone methods (kept for backward compatibility)
  signInWithOTP: (phone: string) => Promise<{ error: any }>;
  verifyOTP: (phone: string, token: string) => Promise<{ error: any }>;
  
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Fetching role for user:", userId);
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'customer';
      }
      console.log("Fetched role:", data?.role);
      return (data?.role as UserRole) || 'customer';
    } catch (err) {
      console.error('Exception fetching role:', err);
      return 'customer';
    }
  };

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userRole = await fetchUserRole(session.user.id);
        setRole(userRole);
      } else {
        setRole(null);
      }
      
      setLoading(false);
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Only fetch role if we don't have it or if the user changed
        if (!role || (user && user.id !== session.user.id)) {
           const userRole = await fetchUserRole(session.user.id);
           setRole(userRole);
        }
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in with Magic Link (Preferred Method)
   * Sends a magic link to the user's email
   * Auto-creates account if user doesn't exist
   */
  const signInWithMagicLink = async (email: string, redirectTo?: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: redirectTo || `${window.location.origin}/cart`,
        shouldCreateUser: true, // Auto-create account if doesn't exist
      },
    });
    return { error };
  };

  /**
   * Sign in with Email OTP (Alternative Method)
   * Sends a 6-digit code to the user's email
   * Auto-creates account if user doesn't exist
   */
  const signInWithEmailOTP = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        shouldCreateUser: true, // Auto-create account if doesn't exist
      },
    });
    return { error };
  };

  /**
   * Verify Email OTP
   */
  const verifyEmailOTP = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token,
      type: 'email',
    });

    if (!error && data.user) {
      // Create user profile record if doesn't exist
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingUser) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          role: 'customer', // Default role
        });
      }
    }

    return { error };
  };

  /**
   * Generic sign in with email (uses Magic Link by default)
   */
  const signInWithEmail = async (email: string) => {
    return signInWithMagicLink(email);
  };

  // Legacy phone authentication (kept for backward compatibility)
  const signInWithOTP = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
    });
    return { error };
  };

  const verifyOTP = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token,
      type: 'sms',
    });

    if (!error && data.user) {
      // Create user record if doesn't exist
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingUser) {
        await supabase.from('users').insert({
          id: data.user.id,
          phone: data.user.phone,
          role: 'customer', // Default role
        });
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        role,
        loading, 
        signInWithEmail,
        signInWithMagicLink,
        signInWithEmailOTP,
        verifyEmailOTP,
        signInWithOTP, 
        verifyOTP, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
