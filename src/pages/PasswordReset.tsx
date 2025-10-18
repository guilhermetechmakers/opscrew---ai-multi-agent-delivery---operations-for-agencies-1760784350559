import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Eye, EyeOff, Loader2, CheckCircle, XCircle, ArrowLeft, Lock, Mail } from "lucide-react";
import { useVerifyPasswordResetToken, useUpdatePassword } from "@/hooks/useAuthQueries";
import { useRequireGuest } from "@/hooks/useAuth";
import { motion } from "motion/react";
import { toast } from "sonner";

const passwordResetSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

export default function PasswordReset() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { requireGuest } = useRequireGuest();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetStatus, setResetStatus] = useState<'loading' | 'valid' | 'invalid' | 'success' | 'error'>('loading');
  const [token, setToken] = useState<string>('');

  const verifyTokenMutation = useVerifyPasswordResetToken();
  const updatePasswordMutation = useUpdatePassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const password = watch('password', '');

  // Redirect if already authenticated
  useEffect(() => {
    requireGuest();
  }, [requireGuest]);

  // Handle token verification on component mount
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
      handleVerifyToken(tokenParam);
    } else {
      setResetStatus('invalid');
    }
  }, [searchParams]);

  const handleVerifyToken = async (tokenToVerify: string) => {
    try {
      await verifyTokenMutation.mutateAsync({ token: tokenToVerify });
      setResetStatus('valid');
    } catch (error: any) {
      console.error('Token verification error:', error);
      
      if (error.message?.includes('expired') || error.message?.includes('invalid')) {
        setResetStatus('invalid');
      } else {
        setResetStatus('error');
      }
      
      toast.error(error.message || 'Invalid or expired reset token');
    }
  };

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      await updatePasswordMutation.mutateAsync(data.password);
      setResetStatus('success');
      toast.success('Password updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 2) return 'bg-destructive';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
              className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Bot className="w-7 h-7 text-primary-foreground" />
            </motion.div>
            <span className="font-bold text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
            <CardHeader className="text-center space-y-2">
              <motion.div 
                className="flex justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {resetStatus === 'success' ? (
                  <CheckCircle className="w-16 h-16 text-green-500" />
                ) : resetStatus === 'invalid' || resetStatus === 'error' ? (
                  <XCircle className="w-16 h-16 text-destructive" />
                ) : (
                  <Lock className="w-16 h-16 text-primary" />
                )}
              </motion.div>
              <CardTitle className="text-2xl font-bold">
                {resetStatus === 'success' 
                  ? 'Password Reset Successfully!' 
                  : resetStatus === 'invalid' || resetStatus === 'error'
                  ? 'Invalid Reset Link'
                  : 'Reset Your Password'
                }
              </CardTitle>
              <CardDescription className="text-base">
                {resetStatus === 'success' 
                  ? 'Your password has been successfully updated. You can now sign in with your new password.'
                  : resetStatus === 'invalid' || resetStatus === 'error'
                  ? 'This password reset link is invalid or has expired. Please request a new one.'
                  : 'Enter your new password below to complete the reset process.'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Success state */}
              {resetStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="space-y-4"
                >
                  <Alert className="border-green-200 bg-green-50/10">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      Your password has been successfully updated.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/login')}
                      className="w-full h-12 btn-primary text-base font-medium"
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="w-full h-12 bg-secondary/50 hover:bg-secondary/80"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Invalid/Error state */}
              {(resetStatus === 'invalid' || resetStatus === 'error') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="space-y-4"
                >
                  <Alert className="border-destructive/20 bg-destructive/5">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive">
                      This password reset link is invalid or has expired. Please request a new one.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/forgot-password')}
                      className="w-full h-12 bg-secondary/50 hover:bg-secondary/80"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Request New Reset Link
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/login')}
                      className="w-full h-12 bg-secondary/50 hover:bg-secondary/80"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Sign In
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Valid token - show form */}
              {resetStatus === 'valid' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                >
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* New password field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          className="h-12 bg-secondary/50 border-0 focus:ring-2 focus:ring-primary pr-12 transition-all duration-200"
                          {...register("password")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                      )}
                      
                      {/* Password strength indicator */}
                      {password && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Password strength:</span>
                            <span className={`font-medium ${
                              strength < 2 ? 'text-destructive' : 
                              strength < 4 ? 'text-yellow-500' : 
                              'text-green-500'
                            }`}>
                              {getPasswordStrengthText(strength)}
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(strength)}`}
                              style={{ width: `${(strength / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm password field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          className="h-12 bg-secondary/50 border-0 focus:ring-2 focus:ring-primary pr-12 transition-all duration-200"
                          {...register("confirmPassword")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    {/* Security notice */}
                    <Alert className="border-primary/20 bg-primary/5">
                      <Lock className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-sm">
                        Your password must be at least 8 characters long and contain uppercase, lowercase, number, and special characters.
                      </AlertDescription>
                    </Alert>

                    {/* Submit button */}
                    <Button 
                      type="submit" 
                      className="w-full h-12 btn-primary text-base font-medium"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Loading state */}
              {resetStatus === 'loading' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Verifying reset token...
                    </p>
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Support information */}
              <div className="pt-4 border-t border-border/50">
                <div className="text-center space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Need help? Contact our support team
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span>support@opscrew.ai</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
