/**
 * E-Signature Flow Component
 * Handles the complete e-signature workflow for proposals
 */

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  Send, 
  Mail, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ExternalLink,
  Users,
  AlertCircle,
  FileText
} from 'lucide-react'
import { 
  useSendProposalForSignature, 
  useGetProposalSigningUrl,
  useVoidProposalSignature 
} from '@/hooks/useProposals'
import type { Proposal } from '@/types/database/proposals'

interface EsignatureFlowProps {
  proposal: Proposal
  onStatusChange?: (proposal: Proposal) => void
}

interface Signer {
  name: string
  email: string
  role: string
}

export function EsignatureFlow({ proposal, onStatusChange }: EsignatureFlowProps) {
  const sendProposal = useSendProposalForSignature()
  const getSigningUrl = useGetProposalSigningUrl()
  const voidSignature = useVoidProposalSignature()
  
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false)
  const [signers, setSigners] = useState<Signer[]>([
    {
      name: proposal.client_name,
      email: proposal.client_email || '',
      role: 'client'
    }
  ])
  const [voidReason, setVoidReason] = useState('')

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
        return 'bg-gray-100 text-gray-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'signed':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canSend = proposal.status === 'approved' && proposal.esign_status === 'not_sent'
  const canVoid = proposal.esign_status === 'sent' || proposal.esign_status === 'signed'

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="gradient-text-primary">E-Signature Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-6 bg-card/50 rounded-xl border border-border/30">
            <div>
              <p className="font-medium text-foreground">Current Status</p>
              <p className="text-sm text-muted-foreground capitalize">
                {proposal.esign_status.replace('_', ' ')}
              </p>
            </div>
            <Badge className={getStatusColor(proposal.esign_status)}>
              {getStatusIcon(proposal.esign_status)}
              <span className="ml-1 capitalize">
                {proposal.esign_status.replace('_', ' ')}
              </span>
            </Badge>
          </div>
          
          {proposal.esign_envelope_id && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-primary font-medium">
                <strong>Envelope ID:</strong> {proposal.esign_envelope_id}
              </p>
              {proposal.esign_signed_at && (
                <p className="text-sm text-primary mt-1">
                  <strong>Signed:</strong> {new Date(proposal.esign_signed_at).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {canSend && (
          <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Send className="h-4 w-4 mr-2" />
                Send for Signature
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Send Proposal for E-Signature
                </DialogTitle>
                <DialogDescription>
                  Configure signers and send this proposal for electronic signature.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Signers</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Add the people who need to sign this proposal.
                  </p>
                  
                  <div className="space-y-3">
                    {signers.map((signer, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center space-x-3 p-4 border border-border/50 rounded-lg hover:border-primary/20 transition-colors duration-200"
                      >
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <Input
                            placeholder="Full Name"
                            value={signer.name}
                            onChange={(e) => handleSignerChange(index, 'name', e.target.value)}
                            className="focus:ring-primary/20"
                          />
                          <Input
                            placeholder="Email Address"
                            type="email"
                            value={signer.email}
                            onChange={(e) => handleSignerChange(index, 'email', e.target.value)}
                            className="focus:ring-primary/20"
                          />
                          <Input
                            placeholder="Role (optional)"
                            value={signer.role}
                            onChange={(e) => handleSignerChange(index, 'role', e.target.value)}
                            className="focus:ring-primary/20"
                          />
                        </div>
                        {signers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSigner(index)}
                            className="hover:bg-destructive/10 hover:text-destructive"
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
                    className="mt-3 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
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
                  className="btn-primary"
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
            className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {getSigningUrl.isPending ? 'Getting URL...' : 'Open Signing URL'}
          </Button>
        )}

        {canVoid && (
          <Dialog open={isVoidDialogOpen} onOpenChange={setIsVoidDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="hover:bg-destructive/90">
                <XCircle className="h-4 w-4 mr-2" />
                Void Signature
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  Void E-Signature
                </DialogTitle>
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
                    className="mt-1 focus:ring-destructive/20"
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
                  className="hover:bg-destructive/90"
                >
                  {voidSignature.isPending ? 'Voiding...' : 'Void Signature'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Signature History */}
      {proposal.esign_status !== 'not_sent' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="gradient-text-primary">Signature Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20"
              >
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div>
                  <p className="font-medium text-foreground">Proposal sent for signature</p>
                  <p className="text-sm text-muted-foreground">
                    {proposal.sent_at ? new Date(proposal.sent_at).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </motion.div>
              
              {proposal.esign_signed_at && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-center space-x-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-foreground">Proposal signed</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(proposal.esign_signed_at).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
