/**
 * Authentication Middleware Component
 * Provides comprehensive authentication state management and security features
 */

import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'motion/react'
import { Shield, AlertTriangle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isSecureEnvironment, generateDeviceFingerprint } from '@/lib/security-utils'
import { toast } from 'sonner'

interface AuthMiddlewareProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireEmailVerification?: boolean
  require2FA?: boolean
  allowedRoles?: string[]
  fallback?: React.ReactNode
}

export function AuthMiddleware({
  children,
  requireAuth = true,
  requireEmailVerification = false,
  require2FA = false,
  allowedRoles = [],
  fallback
}: AuthMiddlewareProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([])
  const [isCheckingSecurity, setIsCheckingSecurity] = useState(true)

  // Check security environment
  useEffect(() => {
    const checkSecurity = async () => {
      const warnings: string[] = []
      
      // Check if running on HTTPS
      if (!isSecureEnvironment()) {
        warnings.push('This site is not running on a secure connection. Please use HTTPS.')
      }
      
      // Check for device fingerprint
      try {
        const fingerprint = generateDeviceFingerprint()
        // Store fingerprint for security monitoring
        localStorage.setItem('device_fingerprint', fingerprint)
      } catch (error) {
        console.warn('Failed to generate device fingerprint:', error)
      }
      
      setSecurityWarnings(warnings)
      setIsCheckingSecurity(false)
    }
    
    checkSecurity()
  }, [])

  // Handle authentication requirements
  useEffect(() => {
    if (loading || isCheckingSecurity) return

    // Check if authentication is required
    if (requireAuth && !user) {
      navigate('/login', { 
        state: { from: location },
        replace: true 
      })
      return
    }

    // Check if user is authenticated but requirements not met
    if (user) {
      // Check email verification
      if (requireEmailVerification && !user.email_confirmed_at) {
        navigate('/verify-email', { 
          state: { from: location },
          replace: true 
        })
        return
      }

      // Check 2FA
      if (require2FA && profile && !profile.two_factor_enabled) {
        navigate('/setup-2fa', { 
          state: { from: location },
          replace: true 
        })
        return
      }

      // Check account status
      if (profile && (profile.status === 'suspended' || profile.status === 'deleted')) {
        navigate('/account-suspended', { 
          state: { from: location },
          replace: true 
        })
        return
      }

      // Check role-based access
      if (allowedRoles.length > 0 && profile) {
        const userRole = profile.metadata?.role || 'user'
        if (!allowedRoles.includes(userRole)) {
          navigate('/unauthorized', { 
            state: { from: location },
            replace: true 
          })
          return
        }
      }
    }
  }, [user, profile, loading, isCheckingSecurity, requireAuth, requireEmailVerification, require2FA, allowedRoles, location, navigate])

  // Show loading state
  if (loading || isCheckingSecurity) {
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

  // Show security warnings
  if (securityWarnings.length > 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-yellow-200 bg-yellow-50/10">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                Security Warning
              </CardTitle>
              <CardDescription className="text-yellow-600 dark:text-yellow-400">
                We've detected some security issues that need your attention.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {securityWarnings.map((warning, index) => (
                <Alert key={index} className="border-yellow-200 bg-yellow-50/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                    {warning}
                  </AlertDescription>
                </Alert>
              ))}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={() => setSecurityWarnings([])}
                  className="flex-1"
                >
                  Continue Anyway
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Show fallback if provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Render children if all checks pass
  return <>{children}</>
}

export default AuthMiddleware