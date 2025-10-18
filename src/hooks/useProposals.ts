/**
 * React Query hooks for proposal management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getProposals,
  getProposal,
  createProposal,
  updateProposal,
  deleteProposal,
  getProposalsByStatus,
  searchProposals,
  createProposalFromTemplate,
  getProposalApprovals,
  createProposalApproval,
  updateProposalApproval,
  getProposalSignatures,
  createProposalSignature,
  updateProposalSignature,
  sendProposalForSignature
} from '@/api/proposals'
import type { Proposal, ProposalInsert, ProposalUpdate } from '@/types/database/proposals'
import type { ProposalApproval, ProposalApprovalInsert, ProposalApprovalUpdate } from '@/types/database/proposal-approvals'
import type { ProposalSignature, ProposalSignatureInsert, ProposalSignatureUpdate } from '@/types/database/proposal-signatures'

// Query keys
export const proposalKeys = {
  all: ['proposals'] as const,
  lists: () => [...proposalKeys.all, 'list'] as const,
  list: (userId: string) => [...proposalKeys.lists(), userId] as const,
  byStatus: (userId: string, status: string) => [...proposalKeys.all, 'status', userId, status] as const,
  search: (userId: string, query: string) => [...proposalKeys.all, 'search', userId, query] as const,
  details: () => [...proposalKeys.all, 'detail'] as const,
  detail: (id: string) => [...proposalKeys.details(), id] as const,
  approvals: (proposalId: string) => [...proposalKeys.all, 'approvals', proposalId] as const,
  signatures: (proposalId: string) => [...proposalKeys.all, 'signatures', proposalId] as const,
}

/**
 * Get all proposals for a user
 */
export function useProposals(userId: string) {
  return useQuery({
    queryKey: proposalKeys.list(userId),
    queryFn: () => getProposals(userId),
    enabled: !!userId,
  })
}

/**
 * Get a single proposal by ID
 */
export function useProposal(proposalId: string) {
  return useQuery({
    queryKey: proposalKeys.detail(proposalId),
    queryFn: () => getProposal(proposalId),
    enabled: !!proposalId,
  })
}

/**
 * Get proposals by status
 */
export function useProposalsByStatus(userId: string, status: string) {
  return useQuery({
    queryKey: proposalKeys.byStatus(userId, status),
    queryFn: () => getProposalsByStatus(userId, status as any),
    enabled: !!userId && !!status,
  })
}

/**
 * Search proposals
 */
export function useSearchProposals(userId: string, query: string) {
  return useQuery({
    queryKey: proposalKeys.search(userId, query),
    queryFn: () => searchProposals(userId, query),
    enabled: !!userId && !!query,
  })
}

/**
 * Get approvals for a proposal
 */
export function useProposalApprovals(proposalId: string) {
  return useQuery({
    queryKey: proposalKeys.approvals(proposalId),
    queryFn: () => getProposalApprovals(proposalId),
    enabled: !!proposalId,
  })
}

/**
 * Get signatures for a proposal
 */
export function useProposalSignatures(proposalId: string) {
  return useQuery({
    queryKey: proposalKeys.signatures(proposalId),
    queryFn: () => getProposalSignatures(proposalId),
    enabled: !!proposalId,
  })
}

/**
 * Create a new proposal
 */
export function useCreateProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProposal,
    onSuccess: (data, variables) => {
      // Invalidate and refetch proposals list
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() })
      
      toast.success('Proposal created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create proposal: ${error.message}`)
    },
  })
}

/**
 * Create a proposal from template
 */
export function useCreateProposalFromTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ templateId, userId, variables }: { templateId: string; userId: string; variables: Record<string, any> }) =>
      createProposalFromTemplate(templateId, userId, variables),
    onSuccess: (data, variables) => {
      // Invalidate and refetch proposals list
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() })
      
      toast.success('Proposal created from template successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create proposal from template: ${error.message}`)
    },
  })
}

/**
 * Update a proposal
 */
export function useUpdateProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ proposalId, updates }: { proposalId: string; updates: ProposalUpdate }) =>
      updateProposal(proposalId, updates),
    onSuccess: (data, variables) => {
      // Invalidate and refetch proposals list and detail
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: proposalKeys.detail(variables.proposalId) })
      
      toast.success('Proposal updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update proposal: ${error.message}`)
    },
  })
}

/**
 * Delete a proposal
 */
export function useDeleteProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProposal,
    onSuccess: (data, variables) => {
      // Invalidate and refetch proposals list
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() })
      
      toast.success('Proposal deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete proposal: ${error.message}`)
    },
  })
}

/**
 * Create a proposal approval
 */
export function useCreateProposalApproval() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProposalApproval,
    onSuccess: (data, variables) => {
      // Invalidate and refetch approvals for the proposal
      queryClient.invalidateQueries({ queryKey: proposalKeys.approvals(variables.proposal_id) })
      
      toast.success('Approval request created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create approval request: ${error.message}`)
    },
  })
}

/**
 * Update a proposal approval
 */
export function useUpdateProposalApproval() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ approvalId, updates }: { approvalId: string; updates: ProposalApprovalUpdate }) =>
      updateProposalApproval(approvalId, updates),
    onSuccess: (data, variables) => {
      // Invalidate and refetch approvals for the proposal
      queryClient.invalidateQueries({ queryKey: proposalKeys.approvals(data.proposal_id) })
      
      toast.success('Approval updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update approval: ${error.message}`)
    },
  })
}

/**
 * Create a proposal signature
 */
export function useCreateProposalSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProposalSignature,
    onSuccess: (data, variables) => {
      // Invalidate and refetch signatures for the proposal
      queryClient.invalidateQueries({ queryKey: proposalKeys.signatures(variables.proposal_id) })
      
      toast.success('Signature request created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create signature request: ${error.message}`)
    },
  })
}

/**
 * Send proposal for e-signature
 */
export function useSendProposalForSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ proposalId, signers, provider }: { proposalId: string; signers: Array<{ name: string; email: string; role?: string }>; provider?: string }) =>
      sendProposalForSignature(proposalId, signers, provider),
    onSuccess: (data, variables) => {
      // Invalidate and refetch proposal detail and signatures
      queryClient.invalidateQueries({ queryKey: proposalKeys.detail(variables.proposalId) })
      queryClient.invalidateQueries({ queryKey: proposalKeys.signatures(variables.proposalId) })
      
      if (data.success) {
        toast.success('Proposal sent for signature successfully')
      } else {
        toast.error(`Failed to send proposal: ${data.error}`)
      }
    },
    onError: (error) => {
      toast.error(`Failed to send proposal for signature: ${error.message}`)
    },
  })
}