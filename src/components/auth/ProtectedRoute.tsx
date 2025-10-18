import { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { motion } from "motion/react"

interface ProtectedRouteProps {
  children: ReactNode
  requireEmailVerification?: boolean
  require2FA?: boolean
  fallback?: ReactNode
}

export function ProtectedRoute({ 
  children, 
  requireEmailVerification = false,
  require2FA = false,
  fallback 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireEmailVerification && !user.email_confirmed_at) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />
  }

  if (require2FA && profile && !profile.two_factor_enabled) {
    return <Navigate to="/setup-2fa" state={{ from: location }} replace />
  }

  if (profile && (profile.status === "suspended" || profile.status === "deleted")) {
    return <Navigate to="/account-suspended" state={{ from: location }} replace />
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default ProtectedRoute
