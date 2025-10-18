import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import { useResetPassword } from "@/hooks/useAuthQueries";
import { useRequireGuest } from "@/hooks/useAuth";
import { motion } from "motion/react";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { requireGuest } = useRequireGuest();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Redirect if already authenticated
  requireGuest();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync({ 
        email: data.email,
        redirectTo: `${window.location.origin}/reset-password`
      });
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    }
  };

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
                {isSubmitted ? (
                  <CheckCircle className="w-16 h-16 text-green-500" />
                ) : (
                  <Mail className="w-16 h-16 text-primary" />
                )}
              </motion.div>
              <CardTitle className="text-2xl font-bold">
                {isSubmitted ? 'Check Your Email' : 'Forgot Password?'}
              </CardTitle>
              <CardDescription className="text-base">
                {isSubmitted 
                  ? 'We\'ve sent a password reset link to your email address.'
                  : 'Enter your email address and we\'ll send you a link to reset your password.'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Success state */}
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="space-y-4"
                >
                  <Alert className="border-green-200 bg-green-50/10">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      Password reset email sent to <strong>{submittedEmail}</strong>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => {
                        setIsSubmitted(false);
                        setSubmittedEmail('');
                      }}
                      variant="outline"
                      className="w-full h-12 bg-secondary/50 hover:bg-secondary/80"
                    >
                      Send Another Email
                    </Button>
                    <Button 
                      onClick={() => navigate('/login')}
                      className="w-full h-12 btn-primary text-base font-medium"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Form state */}
              {!isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                >
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="h-12 bg-secondary/50 border-0 focus:ring-2 focus:ring-primary transition-all duration-200"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Security notice */}
                    <Alert className="border-primary/20 bg-primary/5">
                      <Mail className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-sm">
                        We'll send you a secure link to reset your password. The link will expire in 1 hour.
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
                          Sending Reset Link...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Back to login */}
              <div className="pt-4 border-t border-border/50">
                <div className="text-center">
                  <Button 
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </div>
              </div>

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
