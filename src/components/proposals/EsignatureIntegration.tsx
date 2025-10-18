/**
 * Enhanced E-Signature Integration Component
 * Comprehensive e-signature workflow with modern design and real-time updates
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Send, 
  Mail, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ExternalLink,
  Users,
  AlertCircle,
  FileText,
  Download,
  Eye,
  RefreshCw,
  Settings,
  BarChart3,
  Shield,
  Zap,
  Activity
} from 'lucide-react'
import { 
  useSendProposalForSignature, 
  useGetProposalSigningUrl,
  useVoidProposalSignature
} from '@/hooks/useProposals'
import { useProposalSignatures } from '@/hooks/useProposalSignatures'
import type { Proposal } from '@/types/database/proposals'
import type { ProposalSignature } from '@/types/database/proposal-signatures'

interface EsignatureIntegrationProps {
  proposal: Proposal
  onStatusChange?: (proposal: Proposal) => void
}

interface Signer {
  name: string
  email: string
  role: string
}

interface SignatureAnalytics {
  totalSignatures: number
  completedSignatures: number
  pendingSignatures: number
  declinedSignatures: number
  averageSignTime: number
  completionRate: number
}

export function EsignatureIntegration({ proposal, onStatusChange }: EsignatureIntegrationProps) {
  const sendProposal = useSendProposalForSignature()
  const getSigningUrl = useGetProposalSigningUrl()
  const voidSignature = useVoidProposalSignature()
  const { data: signatures = [] } = useProposalSignatures(proposal.id)
  
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [signers, setSigners] = useState<Signer[]>([
    {
      name: proposal.client_name,
      email: proposal.client_email || '',
      role: 'client'
    }
  ])
  const [voidReason, setVoidReason] = useState('')
  const [signatureSettings, setSignatureSettings] = useState({
    reminderFrequency: '3',
    expirationDays: '30',
    requireAuthentication: true,
    allowDecline: true,
    emailNotifications: true
  })

  // Calculate signature analytics
  const analytics: SignatureAnalytics = {
    totalSignatures: signatures.length,
    completedSignatures: signatures.filter(s => s.status === 'signed').length,
    pendingSignatures: signatures.filter(s => s.status === 'pending').length,
    declinedSignatures: signatures.filter(s => s.status === 'declined').length,
    averageSignTime: 0, // Calculate based on signed_at timestamps
    completionRate: signatures.length > 0 ? 
      (signatures.filter(s => s.status === 'signed').length / signatures.length) * 100 : 0
  }

  const handleAddSigner = () => {
    setSigners([...signers, { name: '', email: '', role: 'signer' }])
  }

  const handleRemoveSigner = (index: number) => {
    setSigners(signers.filter((_, i) => i !== index))
  }

  const handleSignerChange = (index: number, field: keyof Signer, value: string) => {
    setSigners(signers.map((signer, i) => 
      i === index ? { ...signer, [field]: value } : signer
    ))
  }

  const handleSendForSignature = async () => {
    try {
      const result = await sendProposal.mutateAsync({
        proposalId: proposal.id,
        signers: signers.filter(s => s.name && s.email),
        provider: 'docusign'
      })

      if (result.success) {
        setIsSendDialogOpen(false)
        onStatusChange?.(proposal)
      }
    } catch (error) {
      console.error('Failed to send for signature:', error)
    }
  }

  const handleGetSigningUrl = async (signerEmail: string) => {
    try {
      await getSigningUrl.mutateAsync({
        proposalId: proposal.id,
        signerEmail
      })
    } catch (error) {
      console.error('Failed to get signing URL:', error)
    }
  }

  const handleVoidSignature = async () => {
    try {
      const result = await voidSignature.mutateAsync({
        proposalId: proposal.id,
        reason: voidReason
      })

      if (result.success) {
        setIsVoidDialogOpen(false)
        setVoidReason('')
        onStatusChange?.(proposal)
      }
    } catch (error) {
      console.error('Failed to void signature:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_sent':
        return <Mail className="h-4 w-4" />
      case 'sent':
        return <Send className="h-4 w-4" />
      case 'signed':
        return <CheckCircle className="h-4 w-4" />
      case 'declined':
        return <XCircle className="h-4 w-4" />
      case 'expired':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_sent':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'signed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'expired':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const canSend = proposal.status === 'approved' && proposal.esign_status === 'not_sent'
  const canVoid = proposal.esign_status === 'sent' || proposal.esign_status === 'signed'

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">E-Signature Integration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage electronic signatures for this proposal
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${getStatusColor(proposal.esign_status)} px-3 py-1`}>
                {getStatusIcon(proposal.esign_status)}
                <span className="ml-1 capitalize">
                  {proposal.esign_status.replace('_', ' ')}
                </span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="signers" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Signers</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Signature Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Completed</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {analytics.completedSignatures}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Pending</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {analytics.pendingSignatures}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">Completion Rate</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {Math.round(analytics.completionRate)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.completedSignatures} of {analytics.totalSignatures} signatures
                  </span>
                </div>
                <Progress 
                  value={analytics.completionRate} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {canSend && (
                  <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Send className="h-4 w-4 mr-2" />
                        Send for Signature
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Send Proposal for E-Signature</DialogTitle>
                        <DialogDescription>
                          Configure signers and send this proposal for electronic signature.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-medium">Signers</Label>
                          <p className="text-sm text-muted-foreground mb-3">
                            Add the people who need to sign this proposal.
                          </p>
                          
                          <div className="space-y-3">
                            {signers.map((signer, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex items-center space-x-3 p-3 border rounded-lg bg-card"
                              >
                                <div className="flex-1 grid grid-cols-3 gap-3">
                                  <Input
                                    placeholder="Full Name"
                                    value={signer.name}
                                    onChange={(e) => handleSignerChange(index, 'name', e.target.value)}
                                  />
                                  <Input
                                    placeholder="Email Address"
                                    type="email"
                                    value={signer.email}
                                    onChange={(e) => handleSignerChange(index, 'email', e.target.value)}
                                  />
                                  <Input
                                    placeholder="Role (optional)"
                                    value={signer.role}
                                    onChange={(e) => handleSignerChange(index, 'role', e.target.value)}
                                  />
                                </div>
                                {signers.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveSigner(index)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </motion.div>
                            ))}
                          </div>
                          
                          <Button
                            variant="outline"
                            onClick={handleAddSigner}
                            className="mt-3"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Add Signer
                          </Button>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSendForSignature}
                          disabled={sendProposal.isPending || signers.some(s => !s.name || !s.email)}
                        >
                          {sendProposal.isPending ? 'Sending...' : 'Send for Signature'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {proposal.esign_status === 'sent' && (
                  <Button
                    variant="outline"
                    onClick={() => handleGetSigningUrl(proposal.client_email || '')}
                    disabled={getSigningUrl.isPending}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {getSigningUrl.isPending ? 'Getting URL...' : 'Open Signing URL'}
                  </Button>
                )}

                {canVoid && (
                  <Dialog open={isVoidDialogOpen} onOpenChange={setIsVoidDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Void Signature
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Void E-Signature</DialogTitle>
                        <DialogDescription>
                          This will cancel the signature process and mark the proposal as voided.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="void-reason">Reason for voiding</Label>
                          <Textarea
                            id="void-reason"
                            placeholder="Enter reason for voiding the signature..."
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVoidDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={handleVoidSignature}
                          disabled={voidSignature.isPending || !voidReason.trim()}
                        >
                          {voidSignature.isPending ? 'Voiding...' : 'Void Signature'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>

                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signers Tab */}
        <TabsContent value="signers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Signers ({signatures.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signatures.map((signature, index) => (
                  <motion.div
                    key={signature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                        {signature.signer_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{signature.signer_name}</p>
                        <p className="text-sm text-muted-foreground">{signature.signer_email}</p>
                        {signature.signer_role && (
                          <p className="text-xs text-muted-foreground">{signature.signer_role}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(signature.status)}>
                        {getStatusIcon(signature.status)}
                        <span className="ml-1 capitalize">{signature.status}</span>
                      </Badge>
                      {signature.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGetSigningUrl(signature.signer_email)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Signature Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Signatures</span>
                    <span className="text-2xl font-bold">{analytics.totalSignatures}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-2xl font-bold text-green-600">{analytics.completedSignatures}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pending</span>
                    <span className="text-2xl font-bold text-orange-600">{analytics.pendingSignatures}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Declined</span>
                    <span className="text-2xl font-bold text-red-600">{analytics.declinedSignatures}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-2xl font-bold">{Math.round(analytics.completionRate)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Sign Time</span>
                    <span className="text-2xl font-bold">{analytics.averageSignTime}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security & Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reminder-frequency">Reminder Frequency (days)</Label>
                    <Input
                      id="reminder-frequency"
                      type="number"
                      value={signatureSettings.reminderFrequency}
                      onChange={(e) => setSignatureSettings(prev => ({
                        ...prev,
                        reminderFrequency: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiration-days">Expiration (days)</Label>
                    <Input
                      id="expiration-days"
                      type="number"
                      value={signatureSettings.expirationDays}
                      onChange={(e) => setSignatureSettings(prev => ({
                        ...prev,
                        expirationDays: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require-auth">Require Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require signers to authenticate before signing
                      </p>
                    </div>
                    <input
                      id="require-auth"
                      type="checkbox"
                      checked={signatureSettings.requireAuthentication}
                      onChange={(e) => setSignatureSettings(prev => ({
                        ...prev,
                        requireAuthentication: e.target.checked
                      }))}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-decline">Allow Decline</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow signers to decline the document
                      </p>
                    </div>
                    <input
                      id="allow-decline"
                      type="checkbox"
                      checked={signatureSettings.allowDecline}
                      onChange={(e) => setSignatureSettings(prev => ({
                        ...prev,
                        allowDecline: e.target.checked
                      }))}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email notifications for signature events
                      </p>
                    </div>
                    <input
                      id="email-notifications"
                      type="checkbox"
                      checked={signatureSettings.emailNotifications}
                      onChange={(e) => setSignatureSettings(prev => ({
                        ...prev,
                        emailNotifications: e.target.checked
                      }))}
                      className="h-4 w-4"
                    />
                  </div>
                </div>

                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}