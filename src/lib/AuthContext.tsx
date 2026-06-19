import React, { createContext, useContext, useEffect, useState } from "react"
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
  ConfirmationResult,
} from "firebase/auth"
import { auth, initAppCheckOnDemand } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { useNavigate, useLocation } from "react-router-dom"

// Define the shape of the context value
interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<boolean>
  sendEmailLink: (email: string) => Promise<void>
  signInWithEmail: (email: string, link: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<void>
  signInWithPhone: (
    phoneNumber: string,
    recaptchaContainer: string,
  ) => Promise<{ error?: any }>
  verifyPhoneOTP: (otp: string) => Promise<{ error?: any; user?: User }>
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const logout = async () => {
    try {
      await firebaseSignOut(auth)
      toast({
        title: "Successfully logged out",
        description: "You have been signed out.",
      })
      return true
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  // Send email link for passwordless sign-in
  const sendEmailLink = async (email: string) => {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/login/finish`,
        handleCodeInApp: true,
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings)

      // Save email in localStorage to complete sign-in
      window.localStorage.setItem("emailForSignIn", email)

      toast({
        title: "Email Link Sent",
        description: "Check your email for the sign-in link.",
      })
    } catch (error) {
      console.error("Error sending email link:", error)
      toast({
        title: "Error",
        description: "Failed to send email link. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Complete sign-in with email link
  const signInWithEmail = async (
    email: string,
    link: string,
  ): Promise<boolean> => {
    try {
      const result = await signInWithEmailLink(auth, email, link)

      // Clear email from localStorage
      window.localStorage.removeItem("emailForSignIn")

      toast({
        title: "Welcome!",
        description: "You have been successfully signed in.",
      })

      return true
    } catch (error) {
      console.error("Error signing in with email link:", error)
      toast({
        title: "Error",
        description: "Failed to sign in. The link may have expired.",
        variant: "destructive",
      })
      return false
    }
  }

  // Send password reset email
  const resetPassword = async (email: string) => {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      }

      await sendPasswordResetEmail(auth, email, actionCodeSettings)

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link.",
      })
    } catch (error) {
      console.error("Error sending password reset email:", error)
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Setup Recaptcha for Phone Auth
  const cleanupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) {
      try {
        ;(window as any).recaptchaVerifier.clear()
      } catch (error) {
        console.error("Failed to clear recaptcha verifier:", error)
      }
      ;(window as any).recaptchaVerifier = null
    }
  }

  const setupRecaptcha = (containerId: string) => {
    cleanupRecaptcha()

    const container = document.getElementById(containerId)
    if (container) container.innerHTML = ""

    ;(window as any).recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: "invisible",
        callback: (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        "expired-callback": () => {
          // Response expired. Ask user to solve reCAPTCHA again.
        },
      },
    )
  }

  // Sign in with Phone Number (Send OTP)
  const signInWithPhone = async (
    phoneNumber: string,
    recaptchaContainer: string,
  ): Promise<{ error?: any }> => {
    try {
      await initAppCheckOnDemand()
      setupRecaptcha(recaptchaContainer)
      const appVerifier = (window as any).recaptchaVerifier
      await appVerifier.render()

      // Keep + at start, strip non-digits only after it
      const normalizedPhone = phoneNumber.startsWith("+")
        ? "+" + phoneNumber.slice(1).replace(/\D/g, "")
        : "+" + phoneNumber.replace(/\D/g, "")

      console.log("Sending OTP to:", normalizedPhone)

      const result = await signInWithPhoneNumber(
        auth,
        normalizedPhone,
        appVerifier,
      )
      setConfirmationResult(result)
      return { error: null }
    } catch (error: any) {
      console.error("Error sending phone OTP:", error)
      cleanupRecaptcha()
      return { error }
    }
  }

  const verifyPhoneOTP = async (otp: string) => {
    try {
      if (!confirmationResult) {
        return {
          error: { message: "No confirmation result. Please request OTP first." },
        }
      }

      const result = await confirmationResult.confirm(otp)
      setUser(result.user)
      return { user: result.user, error: null }
    } catch (error: any) {
      console.error("Error verifying phone OTP:", error)
      return { error }
    }
  }

  const value = {
    user,
    loading,
    logout,
    sendEmailLink,
    signInWithEmail,
    resetPassword,
    signInWithPhone,
    verifyPhoneOTP,
  }
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
