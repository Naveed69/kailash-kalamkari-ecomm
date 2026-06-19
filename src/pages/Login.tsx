import React, { useEffect, useMemo } from "react"
import { EmailLogin } from "@/components/auth/EmailLogin"
import { useLocation, useNavigate } from "react-router-dom"
import { CloudflareImage } from "@/components/images/CloudflareImage"
import { useAuth } from "@/lib/AuthContext"

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const returnTo = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const queryReturnTo = params.get("returnTo")
    const stateFrom = (location.state as { from?: string | { pathname?: string } } | null)
      ?.from
    const raw =
      queryReturnTo ||
      (typeof stateFrom === "string" ? stateFrom : stateFrom?.pathname) ||
      "/profile"

    return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/profile"
  }, [location.search, location.state])

  useEffect(() => {
    if (user) navigate(returnTo, { replace: true })
  }, [user, navigate, returnTo])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f0ece3] to-slate-100 flex justify-center p-4 pt-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <CloudflareImage
            imageRef="cb1eba23-5f89-4d3d-a2a4-487e70cd0400"
            variant="thumb"
            alt="Kailash Kalamkari"
            className="w-48 h-24 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome to Kailash Kalamkari
          </h1>
          <p className="text-slate-600">
            Sign in to access your account and orders
          </p>
        </div>

        <EmailLogin showHeader={true} redirectTo={returnTo} />
      </div>
    </div>
  )
}

export default LoginPage
