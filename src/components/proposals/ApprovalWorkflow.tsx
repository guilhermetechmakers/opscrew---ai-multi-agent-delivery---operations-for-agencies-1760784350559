/**
 * Approval Workflow component for proposal approvals
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MessageSquare, 
  Send,
  Plus,
  Trash2
} from 'lucide-react'
import { useProposalApprovals, useCreateProposalApproval, useUpdateProposalApproval } from '@/hooks/useProposals'
import { useAuth } from '@/hooks/useAuth'
import type { ProposalApproval } from '@/types/database/proposal-approvals'

interface ApprovalWorkflowProps {
  proposalId: string
  proposalStatus: string
  onStatusChange?: (status: string) => void
  className?: string
}

interface Approver {
  id: string
  name: string
  email: string
  avatar?: string
}

const mockApprovers: Approver[] = [
  { id: '1', name: 'John Smith', email: 'john@company.com', avatar: undefined },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', avatar: undefined },
  { id: '3', name: 'Mike Wilson', email: 'mike@company.com', avatar: undefined }
]

export function ApprovalWorkflow({ 
  proposalId, 
  proposalStatus, 
  onStatusChange,
  className 
}: ApprovalWorkflowProps) {
  const { user } = useAuth()
  const [newApproverEmail, setNewApproverEmail] = useState('')
  const [isAddingApprover, setIsAddingApprover] = useState(false)
  const [approvalComments, setApprovalComments] = useState('')

  // Fetch approvals
  const { data: approvals = [], isLoading } = useProposalApprovals(proposalId)
  const createApproval = useCreateProposalApproval()
  const updateApproval = useUpdateProposalApproval()

  const handleAddApprover = async () => {
    if (!newApproverEmail.trim()) return

    // Find approver by email
    const approver = mockApprovers.find(a => a.email === newApproverEmail)
    if (!approver) {
      // In a real app, you might want to search for users or show an error
      return
    }

    try {
      await createApproval.mutateAsync({
        proposal_id: proposalId,
        approver_id: approver.id,
        status: 'pending'
      })
      setNewApproverEmail('')
      setIsAddingApprover(false)
    } catch (error) {
      console.error('Failed to add approver:', error)
    }
  }

  const handleApprovalAction = async (approvalId: string, status: 'approved' | 'rejected') => {
    try {
      await updateApproval.mutateAsync({
        approvalId,
        updates: {
          status,
          comments: approvalComments,
          approved_at: new Date().toISOString()
        }
      })
      setApprovalComments('')
      
      // Update proposal status if all approvals are complete
      const allApprovals = approvals.filter(a => a.id !== approvalId)
      const allApproved = allApprovals.every(a => a.status === 'approved')
      const anyRejected = allApprovals.some(a => a.status === 'rejected')
      
      if (status === 'rejected' || anyRejected) {
        onStatusChange?.('rejected')
      } else if (allApproved) {
        onStatusChange?.('approved')
      }
    } catch (error) {
      console.error('Failed to update approval:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const isApprovalComplete = approvals.length > 0 && approvals.every(a => a.status !== 'pending')
  const isApproved = approvals.length > 0 && approvals.every(a => a.status === 'approved')
  const isRejected = approvals.some(a => a.status === 'rejected')

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Approval Workflow
              </CardTitle>
              <CardDescription>
                Manage proposal approvals and reviewer feedback
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isApprovalComplete && (
                <Badge variant={isApproved ? "default" : "destructive"}>
                  {isApproved ? 'All Approved' : 'Rejected'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Current Status</h4>
                <p className="text-sm text-muted-foreground">
                  {proposalStatus === 'pending_approval' && 'Waiting for approvals'}
                  {proposalStatus === 'approved' && 'All approvals received'}
                  {proposalStatus === 'rejected' && 'Proposal rejected'}
                  {proposalStatus === 'draft' && 'Draft - not yet submitted for approval'}
                </p>
              </div>
              {getStatusIcon(proposalStatus)}
            </div>
          </div>

          {/* Add Approver */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Approvers</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingApprover(!isAddingApprover)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Approver
              </Button>
            </div>

            {isAddingApprover && (
              <Card className="animate-fade-in-down">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="approver-email">Approver Email</Label>
                      <Input
                        id="approver-email"
                        type="email"
                        placeholder="Enter approver email address"
                        value={newApproverEmail}
                        onChange={(e) => setNewApproverEmail(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddApprover}
                        disabled={!newApproverEmail.trim() || createApproval.isPending}
                        className="btn-primary"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Add Approver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddingApprover(false)
                          setNewApproverEmail('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Approvals List */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-32" />
                            <div className="h-3 bg-muted rounded w-24" />
                          </div>
                          <div className="w-16 h-6 bg-muted rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : approvals.length > 0 ? (
                approvals.map((approval) => {
                  const approver = mockApprovers.find(a => a.id === approval.approver_id)
                  const canApprove = approval.status === 'pending' && approval.approver_id === user?.id
                  
                  return (
                    <Card key={approval.id} className="animate-fade-in-up">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={approver?.avatar} />
                            <AvatarFallback>
                              {approver?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">{approver?.name || 'Unknown User'}</h5>
                                <p className="text-sm text-muted-foreground">{approver?.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(approval.status)}
                                {getStatusIcon(approval.status)}
                              </div>
                            </div>

                            {approval.comments && (
                              <div className="p-3 bg-muted/20 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                                  <p className="text-sm">{approval.comments}</p>
                                </div>
                              </div>
                            )}

                            {approval.approved_at && (
                              <p className="text-xs text-muted-foreground">
                                {approval.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                                {new Date(approval.approved_at).toLocaleDateString()}
                              </p>
                            )}

                            {canApprove && (
                              <div className="space-y-3 pt-2 border-t">
                                <div>
                                  <Label htmlFor={`comments-${approval.id}`}>Comments (Optional)</Label>
                                  <Textarea
                                    id={`comments-${approval.id}`}
                                    placeholder="Add any comments about this proposal..."
                                    value={approvalComments}
                                    onChange={(e) => setApprovalComments(e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprovalAction(approval.id, 'approved')}
                                    disabled={updateApproval.isPending}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleApprovalAction(approval.id, 'rejected')}
                                    disabled={updateApproval.isPending}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <Card className="text-center py-8">
                  <CardContent>
                    <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No approvers added</h3>
                    <p className="text-muted-foreground mb-4">
                      Add approvers to review this proposal before sending to clients.
                    </p>
                    <Button
                      onClick={() => setIsAddingApprover(true)}
                      className="btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Approver
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}