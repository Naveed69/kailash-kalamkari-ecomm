import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/AuthContext"
import { OtpInput } from "./OtpInput"
import { Phone, CheckCircle2 } from "lucide-react"

interface EmailLoginProps {
  showHeader?: boolean
  redirectTo?: string
}

export const EmailLogin: React.FC<EmailLoginProps> = ({
  showHeader = false,
  redirectTo = "/",
}) => {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { signInWithPhone, verifyPhoneOTP } = useAuth()

  useEffect(() => {
    if (resendTimer <= 0) return

    const timer = window.setTimeout(() => {
      setResendTimer((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [resendTimer])

  useEffect(() => {
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          ;(window as any).recaptchaVerifier.clear()
        } catch (error) {
          console.error("Failed to clear recaptcha verifier on unmount:", error)
        }
        ;(window as any).recaptchaVerifier = null
      }
    }
  }, [])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleaned = phoneNumber.replace(/\D/g, "")

    if (cleaned.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit Indian mobile number.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const formattedPhone = "+91" + cleaned

    try {
      const { error } = await signInWithPhone(
        formattedPhone,
        "phone-recaptcha-container",
      )

      if (error) {
        toast({
          title: "Failed to send OTP",
          description: error.message || "Please try again.",
          variant: "destructive",
        })
      } else {
        setStep("otp")
        setResendTimer(30)
        toast({
          title: "Verification Code Sent",
          description: `Code sent to +91 ${cleaned}`,
        })
      }
    } catch (error) {
      console.error("Send OTP error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return

    setLoading(true)
    try {
      const { error } = await verifyPhoneOTP(otp)
      if (error) {
        toast({
          title: "Verification Failed",
          description: "Invalid code. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Welcome Back!",
          description: "Redirecting you...",
        })
        navigate(redirectTo, { replace: true })
      }
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

  const handleResendOtp = async () => {
    if (resendTimer > 0) return

    const cleaned = phoneNumber.replace(/\D/g, "")
    if (cleaned.length !== 10) return

    setLoading(true)
    try {
      const { error } = await signInWithPhone(
        `+91${cleaned}`,
        "phone-recaptcha-container",
      )

      if (!error) {
        setResendTimer(30)
        setOtp("")
        toast({
          title: "Code Resent",
          description: "A new code has been sent.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto pt-2">
      {showHeader && (
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-slate-800">
            Sign In
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-2">
        <div className="w-full">
          <h3 className="text-center font-semibold text-slate-800 mb-4">
            Sign in with Phone
          </h3>

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
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
            <form onSubmit={handleVerifyOtp} className="space-y-6 py-2">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Verify OTP</h3>
                <p className="text-sm text-slate-500">
                  Sent to +91 {phoneNumber}
                </p>
              </div>

              <OtpInput value={otp} onChange={setOtp} disabled={loading} />

              <Button
                type="submit"
                className="w-full bg-[#D49217] hover:bg-[#B37A12]"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Verify & Sign In
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone")
                    setOtp("")
                    setResendTimer(0)
                  }}
                  className="text-sm text-[#D49217] hover:underline"
                  disabled={loading}
                >
                  Change Phone Number
                </button>
                {resendTimer > 0 ? (
                  <span className="text-slate-500">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-[#D49217] hover:underline"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
