import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Shield, ArrowLeft, Lock, AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { motion } from "motion/react"
import { toast } from "sonner"

export default function Unauthorized() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuth()

  useEffect(() => {
    // Redirect if user doesn't have access
    if (!user) {
      navigate('/login', { replace: true })
    }
  }, [user, navigate])

  const handleGoBack = () => {
    // Go back to previous page or dashboard
    if (location.state?.from) {
      navigate(-1)
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  const handleContactSupport = () => {
    // In a real app, this would open a support ticket or contact form
    toast.info('Redirecting to support...')
    // For now, just show a message
    window.open('mailto:support@opscrew.ai?subject=Access Request', '_blank')
  }

  const getRequiredRole = () => {
    // Extract required role from location state or URL params
    const requiredRole = location.state?.requiredRole || 'admin'
    return requiredRole
  }

  const getCurrentRole = () => {
    return profile?.metadata?.role || 'user'
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
              className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Lock className="w-7 h-7 text-yellow-foreground" />
            </motion.div>
            <span className="font-bold text-3xl bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
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
                <Shield className="w-16 h-16 text-yellow-500" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                Access Denied
              </CardTitle>
              <CardDescription className="text-base">
                You don't have permission to access this resource.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Access details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="space-y-4"
              >
                <Alert className="border-yellow-200 bg-yellow-50/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                    <strong>Required Role:</strong> {getRequiredRole()}
                    <br />
                    <strong>Your Role:</strong> {getCurrentRole()}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Account:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempted Access:</span>
                    <span className="font-medium">
                      {location.state?.from?.pathname || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">
                      {new Date().toLocaleString()}
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
                    onClick={handleGoBack}
                    className="w-full h-12 btn-primary text-base font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleContactSupport}
                    className="w-full h-12 bg-secondary/50 hover:bg-secondary/80"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Request Access
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
                    If you believe you should have access to this resource, please contact your administrator.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
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