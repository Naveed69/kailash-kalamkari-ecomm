import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

// Define the shape of the context value
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<boolean>;
  sendEmailLink: (email: string) => Promise<void>;
  signInWithEmail: (email: string, link: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  setupRecaptcha: (containerId: string) => void;
  signInWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      toast({
        title: "Successfully logged out",
        description: "You have been signed out.",
      });
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Send email link for passwordless sign-in
  const sendEmailLink = async (email: string) => {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/login/finish`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      // Save email in localStorage to complete sign-in
      window.localStorage.setItem('emailForSignIn', email);

      toast({
        title: "Email Link Sent",
        description: "Check your email for the sign-in link.",
      });
    } catch (error) {
      console.error("Error sending email link:", error);
      toast({
        title: "Error",
        description: "Failed to send email link. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Complete sign-in with email link
  const signInWithEmail = async (email: string, link: string): Promise<boolean> => {
    try {
      const result = await signInWithEmailLink(auth, email, link);

      // Clear email from localStorage
      window.localStorage.removeItem('emailForSignIn');

      toast({
        title: "Welcome!",
        description: "You have been successfully signed in.",
      });

      return true;
    } catch (error) {
      console.error("Error signing in with email link:", error);
      toast({
        title: "Error",
        description: "Failed to sign in. The link may have expired.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Send password reset email
  const resetPassword = async (email: string) => {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Setup Recaptcha for Phone Auth
  const setupRecaptcha = (containerId: string) => {
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }

    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
      }
    });
  };

  // Sign in with Phone Number (Send OTP)
  const signInWithPhone = async (phoneNumber: string): Promise<ConfirmationResult> => {
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      if (!appVerifier) {
        throw new Error("Recaptcha not initialized");
      }

      // Normalize phone number: always ensure it starts with + and contains only digits after that
      const normalizedPhone = '+' + phoneNumber.replace(/\D/g, '');

      console.log("Sending OTP to:", normalizedPhone);

      const result = await signInWithPhoneNumber(auth, normalizedPhone, appVerifier);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code.",
      });
      return result;
    } catch (error: any) {
      console.error("Error sending phone OTP:", error);

      let errorMessage = "Failed to send OTP. Please try again.";

      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = "The phone number is invalid. Please ensure it includes the country code (e.g., +91).";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Phone authentication is not enabled. Please contact support.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many requests. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    loading,
    logout,
    sendEmailLink,
    signInWithEmail,
    resetPassword,
    setupRecaptcha,
    signInWithPhone,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};