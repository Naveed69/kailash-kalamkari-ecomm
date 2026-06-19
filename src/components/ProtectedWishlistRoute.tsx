import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/lib/AuthContext"

export const ProtectedWishlistRoute = ({
  children,
}: {
  children: JSX.Element
}) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const returnTo = `${location.pathname}${location.search}`
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
        state={{ from: returnTo }}
        replace
      />
    )
  }

  return children
}

export default ProtectedWishlistRoute
