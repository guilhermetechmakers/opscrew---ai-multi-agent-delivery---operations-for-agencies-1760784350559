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
  sendProposalForSignature,
  getProposalSigningUrl,
  processDocuSignWebhook,
  voidProposalSignature
} from '@/api/proposals'
import type { Proposal, ProposalInsert, ProposalUpdate } from '@/types/database/proposals'

// Query keys
export const proposalKeys = {
  all: ['proposals'] as const,
  lists: () => [...proposalKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...proposalKeys.lists(), { filters }] as const,
  details: () => [...proposalKeys.all, 'detail'] as const,
  detail: (id: string) => [...proposalKeys.details(), id] as const,
  byStatus: (status: string) => [...proposalKeys.all, 'status', status] as const,
  search: (query: string) => [...proposalKeys.all, 'search', query] as const,
}

/**
 * Get all proposals for the current user
 */
export function useProposals(userId: string) {
  return useQuery({
    queryKey: proposalKeys.lists(),
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
export function useProposalsByStatus(userId: string, status: Proposal['status']) {
  return useQuery({
    queryKey: proposalKeys.byStatus(status),
    queryFn: () => getProposalsByStatus(userId, status),
    enabled: !!userId && !!status,
  })
}

/**
 * Search proposals
 */
export function useSearchProposals(userId: string, query: string) {
  return useQuery({
    queryKey: proposalKeys.search(query),
    queryFn: () => searchProposals(userId, query),
    enabled: !!userId && query.length > 0,
  })
}

/**
 * Create a new proposal
 */
export function useCreateProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (proposal: ProposalInsert) => createProposal(proposal),
    onSuccess: (newProposal) => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() })
      toast.success('Proposal created successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create proposal: ${error.message}`)
    },
  })
}

/**
 * Update a proposal
 */
export function useUpdateProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProposalUpdate }) =>
      updateProposal(id, updates),
    onSuccess: (updatedProposal) => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.detail(updatedProposal.id) })
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() })
      toast.success('Proposal updated successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update proposal: ${error.message}`)
    },
  })
}

/**
 * Delete a proposal (soft delete)
 */
export function useDeleteProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (proposalId: string) => deleteProposal(proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() })
      toast.success('Proposal deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete proposal: ${error.message}`)
    },
  })
}

/**
 * Create a proposal from template
 */
export function useCreateProposalFromTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      templateId,
      userId,
      variables,
    }: {
      templateId: string
      userId: string
      variables: Record<string, any>
    }) => createProposalFromTemplate(templateId, userId, variables),
    onSuccess: (newProposal) => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() })
      toast.success('Proposal created from template successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create proposal from template: ${error.message}`)
    },
  })
}

/**
 * Send proposal for e-signature
 */
export function useSendProposalForSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      proposalId,
      signers,
      provider = 'docusign',
    }: {
      proposalId: string
      signers: Array<{ name: string; email: string; role?: string }>
      provider?: string
    }) => sendProposalForSignature(proposalId, signers, provider),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.detail(variables.proposalId) })
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() })
      
      if (result.success) {
        toast.success('Proposal sent for signature successfully')
      } else {
        toast.error(`Failed to send proposal: ${result.error}`)
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to send proposal for signature: ${error.message}`)
    },
  })
}

/**
 * Get signing URL for a proposal
 */
export function useGetProposalSigningUrl() {
  return useMutation({
    mutationFn: ({ proposalId, signerEmail }: { proposalId: string; signerEmail: string }) =>
      getProposalSigningUrl(proposalId, signerEmail),
    onSuccess: (result) => {
      if (result.success && result.url) {
        window.open(result.url, '_blank')
      } else {
        toast.error(`Failed to get signing URL: ${result.error}`)
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to get signing URL: ${error.message}`)
    },
  })
}

/**
 * Process DocuSign webhook event
 */
export function useProcessDocuSignWebhook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (event: any) => processDocuSignWebhook(event),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: proposalKeys.lists() })
        toast.success('Signature status updated')
      } else {
        toast.error(`Failed to process webhook: ${result.error}`)
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to process webhook: ${error.message}`)
    },
  })
}

/**
 * Void a proposal signature
 */
export function useVoidProposalSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ proposalId, reason }: { proposalId: string; reason: string }) =>
      voidProposalSignature(proposalId, reason),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.detail(variables.proposalId) })
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() })
      
      if (result.success) {
        toast.success('Proposal signature voided successfully')
      } else {
        toast.error(`Failed to void signature: ${result.error}`)
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to void signature: ${error.message}`)
    },
  })
}
