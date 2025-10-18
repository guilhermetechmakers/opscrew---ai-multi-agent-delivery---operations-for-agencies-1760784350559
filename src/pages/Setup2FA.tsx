import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Shield, Smartphone, Key, CheckCircle, Loader2, ArrowLeft, Copy, Download, QrCode } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useTwoFactorSecrets, useUpdateTwoFactorSecrets } from "@/hooks/useAuthQueries"
import { motion } from "motion/react"
import { toast } from "sonner"
import { generateTOTPSecret, generateBackupCodes, generateTOTPQRData, formatSecretForDisplay, verifyTOTPToken, generateSMSVerificationCode } from "@/lib/totp-utils"
import { twoFARateLimiter, getRateLimitKey } from "@/lib/rate-limit"

const totpSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must contain only numbers")
})

const smsSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number"),
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must contain only numbers")
})

type TotpFormData = z.infer<typeof totpSchema>
type SmsFormData = z.infer<typeof smsSchema>

export default function Setup2FA() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("totp")
  const [qrCode, setQrCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [totpSecret, setTotpSecret] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [isGeneratingSecret, setIsGeneratingSecret] = useState(false)

  const { data: secrets, isLoading: loadingSecrets } = useTwoFactorSecrets()
  const updateSecretsMutation = useUpdateTwoFactorSecrets()

  const totpForm = useForm<TotpFormData>({
    resolver: zodResolver(totpSchema)
  })

  const smsForm = useForm<SmsFormData>({
    resolver: zodResolver(smsSchema)
  })

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (secrets?.totp_enabled || secrets?.sms_enabled) {
      setIsSetupComplete(true)
    }
  }, [user, secrets, navigate])

  // Generate TOTP secret when component mounts
  useEffect(() => {
    if (activeTab === "totp" && !totpSecret && !secrets?.totp_secret) {
      generateNewTOTPSecret()
    }
  }, [activeTab, totpSecret, secrets?.totp_secret])

  const generateNewTOTPSecret = async () => {
    setIsGeneratingSecret(true)
    try {
      const secret = generateTOTPSecret()
      const codes = generateBackupCodes()
      
      setTotpSecret(secret)
      setBackupCodes(codes)
      
      // Generate QR code data
      const qrData = generateTOTPQRData(secret, user?.email || '')
      setQrCode(qrData)
      
      // Store secret in database
      await updateSecretsMutation.mutateAsync({
        totp_secret: secret,
        totp_backup_codes: codes
      })
      
      toast.success("TOTP secret generated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to generate TOTP secret")
    } finally {
      setIsGeneratingSecret(false)
    }
  }

  const handleTotpSubmit = async (data: TotpFormData) => {
    try {
      // Check rate limiting
      const rateLimitKey = getRateLimitKey('TWO_FA', user?.id || '')
      const rateLimit = twoFARateLimiter.isAllowed(rateLimitKey)
      
      if (!rateLimit.allowed) {
        toast.error("Too many attempts. Please try again later.")
        return
      }

      // Verify TOTP code
      const isValid = verifyTOTPToken(data.code, { secret: totpSecret })
      
      if (!isValid) {
        toast.error("Invalid verification code. Please try again.")
        return
      }

      // Enable TOTP 2FA
      await updateSecretsMutation.mutateAsync({
        totp_enabled: true,
        totp_enabled_at: new Date().toISOString()
      })
      
      toast.success("TOTP 2FA enabled successfully!")
      setIsSetupComplete(true)
    } catch (error: any) {
      toast.error(error.message || "Failed to enable TOTP 2FA")
    }
  }

  const handleSmsSubmit = async (data: SmsFormData) => {
    try {
      // Check rate limiting
      const rateLimitKey = getRateLimitKey('TWO_FA', user?.id || '')
      const rateLimit = twoFARateLimiter.isAllowed(rateLimitKey)
      
      if (!rateLimit.allowed) {
        toast.error("Too many attempts. Please try again later.")
        return
      }

      // Generate and send SMS code (in production, integrate with SMS service)
      const verificationCode = generateSMSVerificationCode()
      setSmsCode(verificationCode)
      
      // For demo purposes, show the code
      toast.info(`SMS verification code: ${verificationCode}`)
      
      // Verify SMS code
      if (data.code !== verificationCode) {
        toast.error("Invalid verification code. Please try again.")
        return
      }

      // Enable SMS 2FA
      await updateSecretsMutation.mutateAsync({
        sms_enabled: true,
        sms_enabled_at: new Date().toISOString(),
        sms_phone: data.phone
      })
      
      toast.success("SMS 2FA enabled successfully!")
      setIsSetupComplete(true)
    } catch (error: any) {
      toast.error(error.message || "Failed to enable SMS 2FA")
    }
  }

  const generateQrCode = () => {
    if (totpSecret) {
      const qrData = generateTOTPQRData(totpSecret, user?.email || '')
      setQrCode(qrData)
    }
  }

  const copyBackupCodes = () => {
    if (backupCodes.length > 0) {
      navigator.clipboard.writeText(backupCodes.join("\n"))
      toast.success("Backup codes copied to clipboard")
    }
  }

  const downloadBackupCodes = () => {
    if (backupCodes.length > 0) {
      const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "opscrew-backup-codes.txt"
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  if (isSetupComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <CardTitle className="text-2xl font-bold">2FA Setup Complete!</CardTitle>
              <CardDescription>
                Your account is now protected with two-factor authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate("/dashboard")}
                className="w-full h-12 btn-primary"
              >
                Continue to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="font-bold text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                OpsCrew
              </span>
            </div>
            <CardTitle className="text-2xl font-bold">Setup Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="totp" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Authenticator App
                </TabsTrigger>
                <TabsTrigger value="sms" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  SMS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="totp" className="space-y-6 mt-6">
                <Alert className="border-primary/20 bg-primary/5">
                  <Shield className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    Use an authenticator app like Google Authenticator or Authy to generate time-based codes.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {!totpSecret ? (
                    <div className="text-center">
                      <Button 
                        onClick={generateNewTOTPSecret}
                        variant="outline"
                        className="mb-4"
                        disabled={isGeneratingSecret}
                      >
                        {isGeneratingSecret ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Key className="w-4 h-4 mr-2" />
                            Generate Secret
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center space-y-4">
                        <div className="bg-white p-4 rounded-lg inline-block">
                          {/* QR Code would be generated here */}
                          <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                            <QrCode className="w-12 h-12 text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Scan this QR code with your authenticator app, or enter this secret key manually:
                          </p>
                          <div className="bg-muted p-3 rounded-lg font-mono text-sm break-all">
                            {formatSecretForDisplay(totpSecret)}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(totpSecret)
                              toast.success("Secret copied to clipboard!")
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Secret
                          </Button>
                        </div>
                      </div>

                      <form onSubmit={totpForm.handleSubmit(handleTotpSubmit)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="totp-code">Enter 6-digit code from your app</Label>
                          <Input
                            id="totp-code"
                            placeholder="123456"
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                            {...totpForm.register("code")}
                          />
                          {totpForm.formState.errors.code && (
                            <p className="text-sm text-destructive">
                              {totpForm.formState.errors.code.message}
                            </p>
                          )}
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-12 btn-primary"
                          disabled={updateSecretsMutation.isPending}
                        >
                          {updateSecretsMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Enabling...
                            </>
                          ) : (
                            "Enable TOTP 2FA"
                          )}
                        </Button>
                      </form>

                      {backupCodes.length > 0 && (
                        <div className="space-y-2">
                          <Alert className="border-yellow-200 bg-yellow-50/10">
                            <Shield className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                              <strong>Save these backup codes!</strong> You can use them to access your account if you lose your authenticator device.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="bg-muted p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                              {backupCodes.map((code, index) => (
                                <div key={index} className="p-2 bg-background rounded text-center">
                                  {code}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={copyBackupCodes}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Codes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={downloadBackupCodes}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sms" className="space-y-6 mt-6">
                <Alert className="border-primary/20 bg-primary/5">
                  <Smartphone className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    Receive verification codes via SMS to your phone number.
                  </AlertDescription>
                </Alert>

                <form onSubmit={smsForm.handleSubmit(handleSmsSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sms-phone">Phone Number</Label>
                    <Input
                      id="sms-phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      {...smsForm.register("phone")}
                    />
                    {smsForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {smsForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sms-code">Enter 6-digit code from SMS</Label>
                    <Input
                      id="sms-code"
                      placeholder="123456"
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                      {...smsForm.register("code")}
                    />
                    {smsForm.formState.errors.code && (
                      <p className="text-sm text-destructive">
                        {smsForm.formState.errors.code.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 btn-primary"
                    disabled={updateSecretsMutation.isPending}
                  >
                    {updateSecretsMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enabling...
                      </>
                    ) : (
                      "Enable SMS 2FA"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="pt-6 border-t border-border/50">
              <Button 
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
