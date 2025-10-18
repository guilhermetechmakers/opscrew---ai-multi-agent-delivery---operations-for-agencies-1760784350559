import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, CheckCircle, XCircle, Mail, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { useVerifyEmail, useResendEmailVerification } from "@/hooks/useAuthQueries";
import { useRequireGuest } from "@/hooks/useAuth";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { requireGuest } = useRequireGuest();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [email, setEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);

  const verifyEmailMutation = useVerifyEmail();
  const resendEmailMutation = useResendEmailVerification();

  // Redirect if already authenticated
  useEffect(() => {
    requireGuest();
  }, [requireGuest]);

  // Handle email verification on component mount
  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    }

    if (token) {
      handleVerifyEmail(token);
    } else {
      setVerificationStatus('error');
    }
  }, [searchParams]);

  const handleVerifyEmail = async (token: string) => {
    try {
      await verifyEmailMutation.mutateAsync({ token });
      setVerificationStatus('success');
      toast.success('Email verified successfully!');
    } catch (error: any) {
      console.error('Email verification error:', error);
      
      if (error.message?.includes('expired') || error.message?.includes('invalid')) {
        setVerificationStatus('expired');
      } else {
        setVerificationStatus('error');
      }
      
      toast.error(error.message || 'Failed to verify email');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email address is required');
      return;
    }

    setIsResending(true);
    try {
      await resendEmailMutation.mutateAsync({ 
        email,
        redirectTo: `${window.location.origin}/verify-email?email=${encodeURIComponent(email)}`
      });
      toast.success('Verification email sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="w-16 h-16 text-destructive" />;
      default:
        return <Loader2 className="w-16 h-16 text-primary animate-spin" />;
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Email Verified Successfully!';
      case 'expired':
        return 'Verification Link Expired';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Verifying Email...';
    }
  };

  const getStatusDescription = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Your email has been successfully verified. You can now access all features of your account.';
      case 'expired':
        return 'The verification link has expired. Please request a new verification email.';
      case 'error':
        return 'There was an error verifying your email. The link may be invalid or corrupted.';
      default:
        return 'Please wait while we verify your email address...';
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
            <CardHeader className="text-center space-y-4">
              <motion.div 
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {getStatusIcon()}
              </motion.div>
              <CardTitle className="text-2xl font-bold">{getStatusTitle()}</CardTitle>
              <CardDescription className="text-base">
                {getStatusDescription()}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Success state */}
              {verificationStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="space-y-4"
                >
                  <Alert className="border-green-200 bg-green-50/10">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      Your account is now fully activated and ready to use.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="w-full h-12 btn-primary text-base font-medium"
                    >
                      Go to Dashboard
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/login')}
                      className="w-full h-12 bg-secondary/50 hover:bg-secondary/80"
                    >
                      Sign In
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Error/Expired state */}
              {(verificationStatus === 'error' || verificationStatus === 'expired') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="space-y-4"
                >
                  <Alert className="border-destructive/20 bg-destructive/5">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive">
                      {verificationStatus === 'expired' 
                        ? 'This verification link has expired. Please request a new one.'
                        : 'Unable to verify your email. Please try again or contact support.'
                      }
                    </AlertDescription>
                  </Alert>

                  {/* Resend verification form */}
                  {email && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          Resend verification email to:
                        </p>
                        <p className="font-medium text-foreground">{email}</p>
                      </div>
                      
                      <Button 
                        onClick={handleResendVerification}
                        disabled={isResending}
                        className="w-full h-12 btn-primary text-base font-medium"
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Resend Verification Email
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/login')}
                      className="w-full h-12 bg-secondary/50 hover:bg-secondary/80"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Sign In
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/signup')}
                      className="w-full h-12 bg-secondary/50 hover:bg-secondary/80"
                    >
                      Create New Account
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Loading state */}
              {verificationStatus === 'loading' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Verifying your email address...
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
