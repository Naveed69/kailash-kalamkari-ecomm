import React from "react"
import { EmailLogin } from "@/storefront/components/auth/EmailLogin"
import { useNavigate } from "react-router-dom"
import logo from "@/storefront/assets/Logo/kklogo.png"

const LoginPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f0ece3] to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={logo}
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

        <EmailLogin showHeader={true} />
      </div>
    </div>
  )
}

export default LoginPage
