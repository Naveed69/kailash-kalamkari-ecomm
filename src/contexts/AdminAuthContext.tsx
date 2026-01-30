import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

interface AdminAuthContextType {
  admin: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  signInAdmin: (email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = (user: User) => {
      // Check if user email is in environment variable admin list
      const envEmails = import.meta.env.VITE_ADMIN_EMAILS;

      if (!envEmails) {
        console.error('CRITICAL: VITE_ADMIN_EMAILS environment variable is not defined!');
        setIsAdmin(false);
        return false;
      }

      const adminEmails = envEmails.split(',').map(email => email.trim().toLowerCase());
      const userEmail = user.email?.toLowerCase() || '';
      const isEmailInList = adminEmails.includes(userEmail);

      console.log('Admin access check result:', {
        userEmail,
        authorizedEmailsCount: adminEmails.length,
        isAuthorized: isEmailInList,
        envVariablePresent: !!envEmails
      });

      setIsAdmin(isEmailInList);
      return isEmailInList;
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed, user:', user?.email);

      if (user) {
        const adminStatus = checkAdminStatus(user);
        setAdmin(user);

        // Only sign out if user is not in admin list
        if (!adminStatus) {
          console.log('User not in admin list, giving only user access...');
          setIsAdmin(false);
          setAdmin(null);
          // firebaseSignOut(auth);
        } else {
          console.log('Admin access granted');
        }
      } else {
        console.log('No user, clearing admin state');
        setAdmin(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link",
      });
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setIsAdmin(false);
      toast({
        title: "Successfully logged out",
        description: "You have been signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      admin,
      loading,
      isAdmin,
      logout,
      signInAdmin,
      resetPassword
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
