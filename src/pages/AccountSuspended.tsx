import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Shield, Mail, ArrowLeft, AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { motion } from "motion/react"
import { toast } from "sonner"

export default function AccountSuspended() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuth()

  useEffect(() => {
    // Redirect if account is not actually suspended
    if (profile && profile.status !== 'suspended' && profile.status !== 'deleted') {
      navigate('/dashboard', { replace: true })
    }
  }, [profile, navigate])

  const handleContactSupport = () => {
    // In a real app, this would open a support ticket or contact form
    toast.info('Redirecting to support...')
    // For now, just show a message
    window.open('mailto:support@opscrew.ai?subject=Account Suspension Appeal', '_blank')
  }

  const handleSignOut = () => {
    navigate('/login', { replace: true })
  }

  const getSuspensionReason = () => {
    if (profile?.status === 'deleted') {
      return 'Your account has been deleted and cannot be recovered.'
    }
    
    // Check metadata for suspension reason
    const reason = profile?.metadata?.suspension_reason
    if (reason) {
      return reason
    }
    
    return 'Your account has been suspended due to a violation of our terms of service.'
  }

  const getSuspensionDate = () => {
    const suspendedAt = profile?.metadata?.suspended_at
    if (suspendedAt) {
      return new Date(suspendedAt).toLocaleDateString()
    }
    return 'Recently'
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-destructive/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-destructive/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo and branding */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-destructive to-destructive/80 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Shield className="w-7 h-7 text-destructive-foreground" />
            </motion.div>
            <span className="font-bold text-3xl bg-gradient-to-r from-destructive to-destructive/80 bg-clip-text text-transparent">
              OpsCrew
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <motion.div 
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <AlertTriangle className="w-16 h-16 text-destructive" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-destructive">
                Account Suspended
              </CardTitle>
              <CardDescription className="text-base">
                Your account has been suspended and access is restricted.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Suspension details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="space-y-4"
              >
                <Alert className="border-destructive/20 bg-destructive/5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    <strong>Reason:</strong> {getSuspensionReason()}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Account:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Suspended on:</span>
                    <span className="font-medium">{getSuspensionDate()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-destructive capitalize">
                      {profile?.status}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.0 }}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <Button 
                    onClick={handleContactSupport}
                    className="w-full h-12 btn-primary text-base font-medium"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full h-12 bg-secondary/50 hover:bg-secondary/80"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </motion.div>

              {/* Additional information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                className="pt-4 border-t border-border/50"
              >
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    If you believe this is an error, please contact our support team.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span>support@opscrew.ai</span>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}