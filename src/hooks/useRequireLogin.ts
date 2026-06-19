import { useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/AuthContext"

const normalizeReturnTo = (value: string) =>
  value.startsWith("/") && !value.startsWith("//") ? value : "/"

export const useRequireLogin = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const requireLogin = useCallback(
    (intent = "continue", returnTo = `${location.pathname}${location.search}`) => {
      if (user) return true

      const safeReturnTo = normalizeReturnTo(returnTo)
      toast({
        title: "Sign in required",
        description: `Please sign in to ${intent}.`,
      })
      navigate(`/login?returnTo=${encodeURIComponent(safeReturnTo)}`, {
        state: { from: safeReturnTo },
      })
      return false
    },
    [location.pathname, location.search, navigate, toast, user],
  )

  return { user, requireLogin }
}
