/**
 * Proposal Editor Component
 * Rich text editor with templating and variable injection for proposals
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
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
  XCircle,
  Edit3,
  Copy,
  Share2,
  Settings,
  History,
  Zap,
  Shield,
  Lock,
  Unlock
} from 'lucide-react'
import { useProposal, useUpdateProposal, useSendProposalForSignature } from '@/hooks/useProposals'
import { RichTextEditor } from './RichTextEditor'
import { TemplateLibrary } from './TemplateLibrary'
import { ApprovalWorkflow } from './ApprovalWorkflow'
import { SignatureStatusTracker } from './SignatureStatusTracker'
import type { Proposal, ProposalUpdate } from '@/types/database/proposals'

interface ProposalEditorProps {
  proposalId: string
  onSave?: (proposal: Proposal) => void
  onSend?: (proposal: Proposal) => void
  readOnly?: boolean
  showTemplates?: boolean
  showApproval?: boolean
}

export function ProposalEditor({ 
  proposalId, 
  onSave, 
  onSend, 
  readOnly = false,
  showTemplates = true,
  showApproval = true
}: ProposalEditorProps) {
  const { data: proposal, isLoading, error } = useProposal(proposalId)
  const updateProposal = useUpdateProposal()
  const sendProposal = useSendProposalForSignature()
  
  const [formData, setFormData] = useState<ProposalUpdate>({})
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [showApprovalWorkflow, setShowApprovalWorkflow] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

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

  const handleContentChange = useCallback((content: string) => {
    setFormData(prev => ({ ...prev, content }))
    setIsDirty(true)
  }, [])

  const handleVariableChange = useCallback((variables: Record<string, any>) => {
    setFormData(prev => ({ ...prev, variables }))
    setIsDirty(true)
  }, [])

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && isDirty && proposal) {
      const timeoutId = setTimeout(() => {
        handleSave()
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [formData, autoSave, isDirty, proposal])

  const handleSave = async () => {
    if (!proposal) return

    try {
      const updatedProposal = await updateProposal.mutateAsync({
        id: proposal.id,
        updates: formData
      })
      
      setIsDirty(false)
      setLastSaved(new Date())
      onSave?.(updatedProposal)
    } catch (error) {
      console.error('Failed to save proposal:', error)
    }
  }

  const handleTemplateSelect = (template: any) => {
    setFormData(prev => ({
      ...prev,
      title: template.title_template,
      content: template.content_template,
      variables: template.variables || {}
    }))
    setIsDirty(true)
    setShowTemplateLibrary(false)
  }

  const handleCopyProposal = () => {
    if (proposal) {
      navigator.clipboard.writeText(proposal.content)
    }
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Export PDF functionality to be implemented')
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
          <div className="flex items-center space-x-2">
            <Edit3 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              {formData.title || proposal.title}
            </h1>
          </div>
          <Badge className={getStatusColor(proposal.status)}>
            {getStatusIcon(proposal.status)}
            <span className="ml-1 capitalize">{proposal.status.replace('_', ' ')}</span>
          </Badge>
          {proposal.requires_approval && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Requires Approval
            </Badge>
          )}
        </div>
        
        {!readOnly && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
                className="scale-90"
              />
              <span>Auto-save</span>
            </div>
            
            {lastSaved && (
              <div className="text-xs text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyProposal}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center gap-2" disabled={!showApproval}>
            <Shield className="h-4 w-4" />
            Approval
          </TabsTrigger>
          <TabsTrigger value="signatures" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Signatures
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Proposal Content
            </CardTitle>
            {showTemplates && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateLibrary(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
            )}
          </div>
          
          <Card>
            <CardContent className="p-0">
              <RichTextEditor
                content={formData.content || ''}
                onChange={handleContentChange}
                variables={[
                  { key: 'client_name', label: 'Client Name', type: 'text', required: true },
                  { key: 'project_scope', label: 'Project Scope', type: 'text' },
                  { key: 'budget_range', label: 'Budget Range', type: 'currency' },
                  { key: 'timeline', label: 'Timeline', type: 'text' },
                  { key: 'company_name', label: 'Company Name', type: 'text' },
                  { key: 'proposal_date', label: 'Proposal Date', type: 'date' }
                ]}
                onVariablesChange={handleVariableChange}
                disabled={readOnly}
                className="min-h-[500px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Client Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="client_name">Client Name *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name || ''}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                    disabled={readOnly}
                    placeholder="Enter client name"
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
                    placeholder="client@example.com"
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
                    placeholder="Describe the project scope..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget_range">Budget Range</Label>
                    <Input
                      id="budget_range"
                      value={formData.budget_range || ''}
                      onChange={(e) => handleInputChange('budget_range', e.target.value)}
                      disabled={readOnly}
                      placeholder="$10,000 - $25,000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input
                      id="timeline"
                      value={formData.timeline || ''}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                      disabled={readOnly}
                      placeholder="3-6 months"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Proposal Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="requires_approval">Requires Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    This proposal must be approved before sending
                  </p>
                </div>
                <Switch
                  id="requires_approval"
                  checked={formData.requires_approval ?? proposal.requires_approval}
                  onCheckedChange={(checked) => handleInputChange('requires_approval', checked)}
                  disabled={readOnly}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="version">Version</Label>
                  <p className="text-sm text-muted-foreground">
                    Current version: {proposal.version}
                  </p>
                </div>
                <Badge variant="outline">
                  v{proposal.version}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-4">
          {showApproval && (
            <ApprovalWorkflow
              proposalId={proposalId}
              proposal={proposal}
              onStatusChange={handleProposalSave}
            />
          )}
        </TabsContent>

        <TabsContent value="signatures" className="space-y-4">
          <SignatureStatusTracker
            proposalId={proposalId}
            proposal={proposal}
            onStatusChange={handleProposalSave}
          />
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
              <div className="prose prose-invert max-w-none">
                <h1 className="text-3xl font-bold mb-4 gradient-text-primary">
                  {formData.title || proposal.title}
                </h1>
                
                <div className="bg-muted/20 p-6 rounded-xl mb-8 border border-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <strong>Client:</strong> {formData.client_name || proposal.client_name}
                    </div>
                    {formData.client_email || proposal.client_email ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <strong>Email:</strong> {formData.client_email || proposal.client_email}
                      </div>
                    ) : null}
                    {formData.project_scope || proposal.project_scope ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <strong>Scope:</strong> {formData.project_scope || proposal.project_scope}
                      </div>
                    ) : null}
                    {formData.budget_range || proposal.budget_range ? (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <strong>Budget:</strong> {formData.budget_range || proposal.budget_range}
                      </div>
                    ) : null}
                    {formData.timeline || proposal.timeline ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <strong>Timeline:</strong> {formData.timeline || proposal.timeline}
                      </div>
                    ) : null}
                  </div>
                </div>
                
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formData.content || proposal.content 
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <TemplateLibrary
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}

      {/* Approval Workflow Modal */}
      {showApprovalWorkflow && (
        <ApprovalWorkflow
          proposalId={proposalId}
          proposal={proposal}
          onClose={() => setShowApprovalWorkflow(false)}
          onStatusChange={handleProposalSave}
        />
      )}
    </div>
  )
}
