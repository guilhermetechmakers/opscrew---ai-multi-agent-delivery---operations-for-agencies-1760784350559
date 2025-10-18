/**
 * Proposal Editor Component
 * Rich text editor with templating and variable injection for proposals
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Save, 
  Send, 
  Eye, 
  Download, 
  FileText, 
  Users, 
  Clock, 
  DollarSign,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { useProposal, useUpdateProposal, useSendProposalForSignature } from '@/hooks/useProposals'
import type { Proposal, ProposalUpdate } from '@/types/database/proposals'

interface ProposalEditorProps {
  proposalId: string
  onSave?: (proposal: Proposal) => void
  onSend?: (proposal: Proposal) => void
  readOnly?: boolean
}

export function ProposalEditor({ 
  proposalId, 
  onSave, 
  onSend, 
  readOnly = false 
}: ProposalEditorProps) {
  const { data: proposal, isLoading, error } = useProposal(proposalId)
  const updateProposal = useUpdateProposal()
  const sendProposal = useSendProposalForSignature()
  
  const [formData, setFormData] = useState<ProposalUpdate>({})
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState('content')

  useEffect(() => {
    if (proposal) {
      setFormData({
        title: proposal.title,
        client_name: proposal.client_name,
        client_email: proposal.client_email,
        project_scope: proposal.project_scope,
        budget_range: proposal.budget_range,
        timeline: proposal.timeline,
        content: proposal.content,
        status: proposal.status
      })
    }
  }, [proposal])

  const handleInputChange = (field: keyof ProposalUpdate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleSave = async () => {
    if (!proposal) return

    try {
      const updatedProposal = await updateProposal.mutateAsync({
        id: proposal.id,
        updates: formData
      })
      
      setIsDirty(false)
      onSave?.(updatedProposal)
    } catch (error) {
      console.error('Failed to save proposal:', error)
    }
  }

  const handleSend = async () => {
    if (!proposal) return

    try {
      const result = await sendProposal.mutateAsync({
        proposalId: proposal.id,
        signers: [
          {
            name: formData.client_name || proposal.client_name,
            email: formData.client_email || proposal.client_email || '',
            role: 'client'
          }
        ],
        provider: 'docusign'
      })

      if (result.success) {
        onSend?.(proposal)
      }
    } catch (error) {
      console.error('Failed to send proposal:', error)
    }
  }

  const getStatusIcon = (status: Proposal['status']) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />
      case 'pending_approval':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'sent':
        return <Send className="h-4 w-4" />
      case 'signed':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'signed':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load proposal</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {formData.title || proposal.title}
          </h1>
          <Badge className={getStatusColor(proposal.status)}>
            {getStatusIcon(proposal.status)}
            <span className="ml-1 capitalize">{proposal.status.replace('_', ' ')}</span>
          </Badge>
        </div>
        
        {!readOnly && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!isDirty || updateProposal.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateProposal.isPending ? 'Saving...' : 'Save'}
            </Button>
            
            {proposal.status === 'approved' && (
              <Button
                onClick={handleSend}
                disabled={sendProposal.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {sendProposal.isPending ? 'Sending...' : 'Send for Signature'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.content || ''}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Enter your proposal content here..."
                className="min-h-[400px] font-mono text-sm"
                disabled={readOnly}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Client Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name || ''}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="client_email">Client Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email || ''}
                    onChange={(e) => handleInputChange('client_email', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Project Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="project_scope">Project Scope</Label>
                  <Textarea
                    id="project_scope"
                    value={formData.project_scope || ''}
                    onChange={(e) => handleInputChange('project_scope', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="budget_range">Budget Range</Label>
                  <Input
                    id="budget_range"
                    value={formData.budget_range || ''}
                    onChange={(e) => handleInputChange('budget_range', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline || ''}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="signatures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>E-Signature Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposal.esign_status === 'not_sent' ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>This proposal has not been sent for signature yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Signature Status</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {proposal.esign_status.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(proposal.esign_status as any)}>
                      {getStatusIcon(proposal.esign_status as any)}
                    </Badge>
                  </div>
                  
                  {proposal.esign_envelope_id && (
                    <div className="text-sm text-gray-600">
                      <p><strong>Envelope ID:</strong> {proposal.esign_envelope_id}</p>
                      {proposal.esign_signed_at && (
                        <p><strong>Signed At:</strong> {new Date(proposal.esign_signed_at).toLocaleString()}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h1 className="text-3xl font-bold mb-4">
                  {formData.title || proposal.title}
                </h1>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Client:</strong> {formData.client_name || proposal.client_name}
                    </div>
                    {formData.client_email || proposal.client_email ? (
                      <div>
                        <strong>Email:</strong> {formData.client_email || proposal.client_email}
                      </div>
                    ) : null}
                    {formData.project_scope || proposal.project_scope ? (
                      <div>
                        <strong>Scope:</strong> {formData.project_scope || proposal.project_scope}
                      </div>
                    ) : null}
                    {formData.budget_range || proposal.budget_range ? (
                      <div>
                        <strong>Budget:</strong> {formData.budget_range || proposal.budget_range}
                      </div>
                    ) : null}
                    {formData.timeline || proposal.timeline ? (
                      <div>
                        <strong>Timeline:</strong> {formData.timeline || proposal.timeline}
                      </div>
                    ) : null}
                  </div>
                </div>
                
                <div className="whitespace-pre-wrap">
                  {formData.content || proposal.content}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
