/**
 * React Query hooks for proposal signatures
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getProposalSignatures,
  createProposalSignature,
  updateProposalSignature
} from '@/api/proposals'
import type { ProposalSignature, ProposalSignatureInsert, ProposalSignatureUpdate } from '@/types/database/proposal-signatures'

// Query keys
export const proposalSignatureKeys = {
  all: ['proposal-signatures'] as const,
  lists: () => [...proposalSignatureKeys.all, 'list'] as const,
  list: (proposalId: string) => [...proposalSignatureKeys.lists(), { proposalId }] as const,
  details: () => [...proposalSignatureKeys.all, 'detail'] as const,
  detail: (id: string) => [...proposalSignatureKeys.details(), id] as const,
}

/**
 * Get signatures for a proposal
 */
export function useProposalSignatures(proposalId: string) {
  return useQuery({
    queryKey: proposalSignatureKeys.list(proposalId),
    queryFn: () => getProposalSignatures(proposalId),
    enabled: !!proposalId,
  })
}

/**
 * Create a proposal signature
 */
export function useCreateProposalSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (signature: ProposalSignatureInsert) => createProposalSignature(signature),
    onSuccess: (newSignature) => {
      queryClient.invalidateQueries({ 
        queryKey: proposalSignatureKeys.list(newSignature.proposal_id) 
      })
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      toast.success('Signature created successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create signature: ${error.message}`)
    },
  })
}

/**
 * Update a proposal signature
 */
export function useUpdateProposalSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProposalSignatureUpdate }) =>
      updateProposalSignature(id, updates),
    onSuccess: (updatedSignature) => {
      queryClient.invalidateQueries({ 
        queryKey: proposalSignatureKeys.list(updatedSignature.proposal_id) 
      })
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      toast.success('Signature updated successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update signature: ${error.message}`)
    },
  })
}