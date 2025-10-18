/**
 * Proposal List Component
 * Displays a list of proposals with filtering and actions
 */

import React, { useState } from 'react'
import { motion } from 'motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Plus, 
  FileText, 
  Send, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { useProposals, useDeleteProposal } from '@/hooks/useProposals'
import type { Proposal } from '@/types/database/proposals'

interface ProposalListProps {
  userId: string
  onSelectProposal?: (proposal: Proposal) => void
  onCreateProposal?: () => void
}

export function ProposalList({ 
  userId, 
  onSelectProposal, 
  onCreateProposal 
}: ProposalListProps) {
  const { data: proposals, isLoading, error } = useProposals(userId)
  const deleteProposal = useDeleteProposal()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredProposals = proposals?.filter(proposal => {
    const matchesSearch = searchQuery === '' || 
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.client_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

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
        return <FileText className="h-4 w-4" />
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

  const getEsignStatusColor = (esignStatus: Proposal['esign_status']) => {
    switch (esignStatus) {
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

  const handleDelete = async (proposalId: string) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      try {
        await deleteProposal.mutateAsync(proposalId)
      } catch (error) {
        console.error('Failed to delete proposal:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>Failed to load proposals</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Proposals</h2>
          <p className="text-gray-600">
            {filteredProposals.length} of {proposals?.length || 0} proposals
          </p>
        </div>
        
        <Button onClick={onCreateProposal}>
          <Plus className="h-4 w-4 mr-2" />
          New Proposal
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Status: {statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('draft')}>
              Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('pending_approval')}>
              Pending Approval
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('approved')}>
              Approved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('sent')}>
              Sent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('signed')}>
              Signed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>
              Rejected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first proposal.'
              }
            </p>
            {(!searchQuery && statusFilter === 'all') && (
              <Button onClick={onCreateProposal}>
                <Plus className="h-4 w-4 mr-2" />
                Create Proposal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onSelectProposal?.(proposal)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {proposal.title}
                        </h3>
                        <Badge className={getStatusColor(proposal.status)}>
                          {getStatusIcon(proposal.status)}
                          <span className="ml-1 capitalize text-xs">
                            {proposal.status.replace('_', ' ')}
                          </span>
                        </Badge>
                        {proposal.esign_status !== 'not_sent' && (
                          <Badge className={getEsignStatusColor(proposal.esign_status)}>
                            <span className="text-xs capitalize">
                              {proposal.esign_status.replace('_', ' ')}
                            </span>
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <p><strong>Client:</strong> {proposal.client_name}</p>
                        {proposal.client_email && (
                          <p><strong>Email:</strong> {proposal.client_email}</p>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <p>Created: {new Date(proposal.created_at).toLocaleDateString()}</p>
                        {proposal.sent_at && (
                          <p>Sent: {new Date(proposal.sent_at).toLocaleDateString()}</p>
                        )}
                        {proposal.esign_signed_at && (
                          <p>Signed: {new Date(proposal.esign_signed_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectProposal?.(proposal)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onSelectProposal?.(proposal)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onSelectProposal?.(proposal)
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(proposal.id)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
