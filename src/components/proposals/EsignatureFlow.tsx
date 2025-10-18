/**
 * E-Signature Flow Component
 * Handles the complete e-signature workflow for proposals
 */

import React, { useState } from 'react'
import { motion } from 'motion'
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>E-Signature Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Current Status</p>
              <p className="text-sm text-gray-600 capitalize">
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
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Envelope ID:</strong> {proposal.esign_envelope_id}
              </p>
              {proposal.esign_signed_at && (
                <p className="text-sm text-blue-800 mt-1">
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
              <Button>
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
                  <p className="text-sm text-gray-600 mb-3">
                    Add the people who need to sign this proposal.
                  </p>
                  
                  <div className="space-y-3">
                    {signers.map((signer, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
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
                      </div>
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
      </div>

      {/* Signature History */}
      {proposal.esign_status !== 'not_sent' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Signature Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Proposal sent for signature</p>
                  <p className="text-sm text-gray-600">
                    {proposal.sent_at ? new Date(proposal.sent_at).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </div>
              
              {proposal.esign_signed_at && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Proposal signed</p>
                    <p className="text-sm text-gray-600">
                      {new Date(proposal.esign_signed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
