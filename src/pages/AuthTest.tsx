/**
 * Authentication Test Page
 * Comprehensive testing interface for all authentication features
 * This page should only be available in development mode
 */

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSignUp, useSignIn, useSignOut, useResetPassword, useUpdatePassword, useVerifyEmail, useResendEmailVerification } from '@/hooks/useAuthQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  User, 
  Mail, 
  Key, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'

export default function AuthTest() {
  const { user, profile, loading } = useAuth()
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testPassword, setTestPassword] = useState('TestPassword123!')
  const [testToken, setTestToken] = useState('')
  
  // Mutations
  const signUpMutation = useSignUp()
  const signInMutation = useSignIn()
  const signOutMutation = useSignOut()
  const resetPasswordMutation = useResetPassword()
  const updatePasswordMutation = useUpdatePassword()
  const verifyEmailMutation = useVerifyEmail()
  const resendEmailMutation = useResendEmailVerification()

  // Test functions
  const testSignUp = async () => {
    try {
      await signUpMutation.mutateAsync({
        email: testEmail,
        password: testPassword,
        metadata: { test: true }
      })
      toast.success('Sign up test completed')
    } catch (error: any) {
      toast.error(`Sign up test failed: ${error.message}`)
    }
  }

  const testSignIn = async () => {
    try {
      await signInMutation.mutateAsync({
        email: testEmail,
        password: testPassword
      })
      toast.success('Sign in test completed')
    } catch (error: any) {
      toast.error(`Sign in test failed: ${error.message}`)
    }
  }

  const testSignOut = async () => {
    try {
      await signOutMutation.mutateAsync()
      toast.success('Sign out test completed')
    } catch (error: any) {
      toast.error(`Sign out test failed: ${error.message}`)
    }
  }

  const testResetPassword = async () => {
    try {
      await resetPasswordMutation.mutateAsync({
        email: testEmail
      })
      toast.success('Password reset test completed')
    } catch (error: any) {
      toast.error(`Password reset test failed: ${error.message}`)
    }
  }

  const testUpdatePassword = async () => {
    try {
      await updatePasswordMutation.mutateAsync('NewPassword123!')
      toast.success('Password update test completed')
    } catch (error: any) {
      toast.error(`Password update test failed: ${error.message}`)
    }
  }

  const testVerifyEmail = async () => {
    try {
      await verifyEmailMutation.mutateAsync({
        token: testToken
      })
      toast.success('Email verification test completed')
    } catch (error: any) {
      toast.error(`Email verification test failed: ${error.message}`)
    }
  }

  const testResendEmail = async () => {
    try {
      await resendEmailMutation.mutateAsync({
        email: testEmail
      })
      toast.success('Resend email test completed')
    } catch (error: any) {
      toast.error(`Resend email test failed: ${error.message}`)
    }
  }

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === undefined) return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    return status ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />
  }

  const getStatusText = (status: boolean | undefined) => {
    if (status === undefined) return 'Unknown'
    return status ? 'Active' : 'Inactive'
  }

  const getStatusColor = (status: boolean | undefined) => {
    if (status === undefined) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    return status ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading authentication state...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Authentication Test Suite</h1>
          </div>
          <p className="text-muted-foreground">
            Comprehensive testing interface for all authentication features
          </p>
        </motion.div>

        {/* Current State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Current Authentication State
              </CardTitle>
              <CardDescription>
                Real-time status of authentication components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>User Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(!!user)}
                    <Badge className={getStatusColor(!!user)}>
                      {getStatusText(!!user)}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Profile Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(!!profile)}
                    <Badge className={getStatusColor(!!profile)}>
                      {getStatusText(!!profile)}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Email Verified</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(user?.email_confirmed_at ? true : false)}
                    <Badge className={getStatusColor(user?.email_confirmed_at ? true : false)}>
                      {getStatusText(user?.email_confirmed_at ? true : false)}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>2FA Enabled</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(profile?.two_factor_enabled)}
                    <Badge className={getStatusColor(profile?.two_factor_enabled)}>
                      {getStatusText(profile?.two_factor_enabled)}
                    </Badge>
                  </div>
                </div>
              </div>

              {user && (
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <Label>User Details</Label>
                    <div className="bg-muted p-3 rounded-lg text-sm font-mono">
                      <div>ID: {user.id}</div>
                      <div>Email: {user.email}</div>
                      <div>Created: {new Date(user.created_at).toLocaleString()}</div>
                      <div>Last Sign In: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Test Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Test Interface
              </CardTitle>
              <CardDescription>
                Test all authentication functions with custom parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="auth" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="auth">Authentication</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>

                <TabsContent value="auth" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="test-email">Test Email</Label>
                      <Input
                        id="test-email"
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="test@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-password">Test Password</Label>
                      <Input
                        id="test-password"
                        type="password"
                        value={testPassword}
                        onChange={(e) => setTestPassword(e.target.value)}
                        placeholder="TestPassword123!"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Button
                      onClick={testSignUp}
                      disabled={signUpMutation.isPending}
                      variant="outline"
                    >
                      {signUpMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <User className="w-4 h-4 mr-2" />
                      )}
                      Test Sign Up
                    </Button>
                    
                    <Button
                      onClick={testSignIn}
                      disabled={signInMutation.isPending}
                      variant="outline"
                    >
                      {signInMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4 mr-2" />
                      )}
                      Test Sign In
                    </Button>
                    
                    <Button
                      onClick={testSignOut}
                      disabled={signOutMutation.isPending}
                      variant="outline"
                    >
                      {signOutMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Test Sign Out
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="password" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-email-password">Email for Password Tests</Label>
                    <Input
                      id="test-email-password"
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="test@example.com"
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Button
                      onClick={testResetPassword}
                      disabled={resetPasswordMutation.isPending}
                      variant="outline"
                    >
                      {resetPasswordMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      Test Reset Password
                    </Button>
                    
                    <Button
                      onClick={testUpdatePassword}
                      disabled={updatePasswordMutation.isPending}
                      variant="outline"
                    >
                      {updatePasswordMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4 mr-2" />
                      )}
                      Test Update Password
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="test-email-verification">Email for Verification</Label>
                      <Input
                        id="test-email-verification"
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="test@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-token">Verification Token</Label>
                      <Input
                        id="test-token"
                        value={testToken}
                        onChange={(e) => setTestToken(e.target.value)}
                        placeholder="verification-token"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Button
                      onClick={testResendEmail}
                      disabled={resendEmailMutation.isPending}
                      variant="outline"
                    >
                      {resendEmailMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      Test Resend Email
                    </Button>
                    
                    <Button
                      onClick={testVerifyEmail}
                      disabled={verifyEmailMutation.isPending}
                      variant="outline"
                    >
                      {verifyEmailMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Test Verify Email
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mutation Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mutation Status</CardTitle>
              <CardDescription>
                Current status of all authentication mutations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Sign Up</Label>
                  <div className="flex items-center gap-2">
                    {signUpMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : signUpMutation.isError ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : signUpMutation.isSuccess ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-sm">
                      {signUpMutation.isPending ? 'Pending' : 
                       signUpMutation.isError ? 'Error' : 
                       signUpMutation.isSuccess ? 'Success' : 'Idle'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sign In</Label>
                  <div className="flex items-center gap-2">
                    {signInMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : signInMutation.isError ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : signInMutation.isSuccess ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-sm">
                      {signInMutation.isPending ? 'Pending' : 
                       signInMutation.isError ? 'Error' : 
                       signInMutation.isSuccess ? 'Success' : 'Idle'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sign Out</Label>
                  <div className="flex items-center gap-2">
                    {signOutMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : signOutMutation.isError ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : signOutMutation.isSuccess ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-sm">
                      {signOutMutation.isPending ? 'Pending' : 
                       signOutMutation.isError ? 'Error' : 
                       signOutMutation.isSuccess ? 'Success' : 'Idle'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reset Password</Label>
                  <div className="flex items-center gap-2">
                    {resetPasswordMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : resetPasswordMutation.isError ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : resetPasswordMutation.isSuccess ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-sm">
                      {resetPasswordMutation.isPending ? 'Pending' : 
                       resetPasswordMutation.isError ? 'Error' : 
                       resetPasswordMutation.isSuccess ? 'Success' : 'Idle'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}