import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/lib/AuthContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OtpInput } from "./OtpInput"
import { Phone, CheckCircle2 } from "lucide-react"

interface EmailLoginProps {
  showHeader?: boolean
}

export const EmailLogin: React.FC<EmailLoginProps> = ({
  showHeader = false,
}) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [verificationId, setVerificationId] = useState<any>(null)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { setupRecaptcha, signInWithPhone } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password)
        toast({
          title: "Success",
          description: "Successfully signed in!",
        })
        navigate("/")
      } else {
        // Sign up
        await createUserWithEmailAndPassword(auth, email, password)
        toast({
          title: "Success",
          description: "Account created successfully!",
        })
        // Auto sign in after sign up
        await signInWithEmailAndPassword(auth, email, password)
        navigate("/")
      }
    } catch (error: any) {
      console.error("Authentication error:", error)
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedPhone = phoneNumber.trim().replace(/\D/g, "")

    if (!trimmedPhone || trimmedPhone.length !== 10) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid 10-digit Indian mobile number.",
        variant: "destructive",
      })
      return
    }

    // Add +91 prefix for Indian numbers
    const fullPhone = "+91" + trimmedPhone

    setLoading(true)
    try {
      setupRecaptcha("phone-recaptcha-container")
      const result = await signInWithPhone(fullPhone)
      setVerificationId(result)
      setOtpSent(true)
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    if (!verificationId) return

    setLoading(true)
    try {
      await verificationId.confirm(otp)
      toast({
        title: "Success",
        description: "Successfully signed in!",
      })
      navigate("/")
    } catch (error: any) {
      console.error("OTP verification error:", error)
      toast({
        title: "Error",
        description: "Invalid OTP code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto pt-2">
      {showHeader && (
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-slate-800">
            {isLogin ? "Sign In" : "Create Account"}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-2">
        <div className="w-full">
          <h3 className="text-center font-semibold text-slate-800 mb-4">
            Sign in with Phone
          </h3>

          {!otpSent ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9123456789"
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10)
                      setPhoneNumber(value)
                    }}
                    disabled={loading}
                    className="rounded-l-none pl-3"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enter your 10-digit Indian mobile number.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#D49217] hover:bg-[#B37A12]"
                disabled={loading || !phoneNumber}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
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
                <p className="text-sm text-slate-500">Sent to {phoneNumber}</p>
              </div>

              <OtpInput onComplete={handleVerifyOtp} disabled={loading} />

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false)
                    setVerificationId(null)
                  }}
                  className="text-sm text-[#D49217] hover:underline"
                  disabled={loading}
                >
                  Change Phone Number
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
