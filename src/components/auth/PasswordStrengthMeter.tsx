/**
 * Password Strength Meter Component
 * Shows visual feedback for password strength
 */

import React from 'react'
import { checkPasswordStrength, getPasswordStrengthColor, getPasswordStrengthText } from '@/lib/password-utils'
import { Check, X } from 'lucide-react'

/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'motion/react'

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

  if (profile && (profile.status === 'suspended' || profile.status === 'deleted')) {
    return <Navigate to="/account-suspended" state={{ from: location }} replace />
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default ProtectedRoute

interface PasswordStrengthMeterProps {
  password: string
  showRequirements?: boolean
  className?: string
}

export function PasswordStrengthMeter({ 
  password, 
  showRequirements = true, 
  className = '' 
}: PasswordStrengthMeterProps) {
  const strength = checkPasswordStrength(password)
  const strengthColor = getPasswordStrengthColor(strength.score)
  const strengthText = getPasswordStrengthText(strength.score)

  if (!password) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Password Strength</span>
          <span className={`text-sm font-medium ${
            strength.score >= 3 ? 'text-green-500' : 
            strength.score >= 2 ? 'text-yellow-500' : 
            'text-red-500'
          }`}>
            {strengthText}
          </span>
        </div>
        
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                level <= strength.score 
                  ? strengthColor 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements */}
      {showRequirements && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Requirements</div>
          <div className="space-y-1">
            {Object.entries(strength.requirements).map(([key, met]) => (
              <div key={key} className="flex items-center space-x-2">
                {met ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${
                  met ? 'text-green-500' : 'text-red-500'
                }`}>
                  {getRequirementText(key)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getRequirementText(key: string): string {
  const requirements = {
    length: 'At least 8 characters',
    lowercase: 'One lowercase letter',
    uppercase: 'One uppercase letter',
    number: 'One number',
    special: 'One special character',
  }
  return requirements[key as keyof typeof requirements] || key
}