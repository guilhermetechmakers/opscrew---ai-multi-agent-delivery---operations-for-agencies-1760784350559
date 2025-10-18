/**
 * React Query hooks for proposal template management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getProposalTemplates,
  getPublicProposalTemplates,
  getProposalTemplate,
  createProposalTemplate,
  updateProposalTemplate,
  deleteProposalTemplate,
  getProposalTemplatesByCategory,
  searchProposalTemplates,
  incrementTemplateUsage
} from '@/api/proposal-templates'
import type { ProposalTemplate, ProposalTemplateInsert, ProposalTemplateUpdate } from '@/types/database/proposal-templates'

// Query keys
export const proposalTemplateKeys = {
  all: ['proposal-templates'] as const,
  lists: () => [...proposalTemplateKeys.all, 'list'] as const,
  list: (userId: string) => [...proposalTemplateKeys.lists(), userId] as const,
  public: () => [...proposalTemplateKeys.all, 'public'] as const,
  byCategory: (userId: string, category: string) => [...proposalTemplateKeys.all, 'category', userId, category] as const,
  search: (userId: string, query: string) => [...proposalTemplateKeys.all, 'search', userId, query] as const,
  details: () => [...proposalTemplateKeys.all, 'detail'] as const,
  detail: (id: string) => [...proposalTemplateKeys.details(), id] as const,
}

/**
 * Get all proposal templates for a user
 */
export function useProposalTemplates(userId: string) {
  return useQuery({
    queryKey: proposalTemplateKeys.list(userId),
    queryFn: () => getProposalTemplates(userId),
    enabled: !!userId,
  })
}

/**
 * Get all public proposal templates
 */
export function usePublicProposalTemplates() {
  return useQuery({
    queryKey: proposalTemplateKeys.public(),
    queryFn: getPublicProposalTemplates,
  })
}

/**
 * Get a single proposal template by ID
 */
export function useProposalTemplate(templateId: string) {
  return useQuery({
    queryKey: proposalTemplateKeys.detail(templateId),
    queryFn: () => getProposalTemplate(templateId),
    enabled: !!templateId,
  })
}

/**
 * Get proposal templates by category
 */
export function useProposalTemplatesByCategory(userId: string, category: string) {
  return useQuery({
    queryKey: proposalTemplateKeys.byCategory(userId, category),
    queryFn: () => getProposalTemplatesByCategory(userId, category as any),
    enabled: !!userId && !!category,
  })
}

/**
 * Search proposal templates
 */
export function useSearchProposalTemplates(userId: string, query: string) {
  return useQuery({
    queryKey: proposalTemplateKeys.search(userId, query),
    queryFn: () => searchProposalTemplates(userId, query),
    enabled: !!userId && !!query,
  })
}

/**
 * Create a new proposal template
 */
export function useCreateProposalTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProposalTemplate,
    onSuccess: (data, variables) => {
      // Invalidate and refetch templates list
      queryClient.invalidateQueries({ queryKey: proposalTemplateKeys.lists() })
      
      toast.success('Template created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`)
    },
  })
}

/**
 * Update a proposal template
 */
export function useUpdateProposalTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ templateId, updates }: { templateId: string; updates: ProposalTemplateUpdate }) =>
      updateProposalTemplate(templateId, updates),
    onSuccess: (data, variables) => {
      // Invalidate and refetch templates list and detail
      queryClient.invalidateQueries({ queryKey: proposalTemplateKeys.lists() })
      queryClient.invalidateQueries({ queryKey: proposalTemplateKeys.detail(variables.templateId) })
      
      toast.success('Template updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update template: ${error.message}`)
    },
  })
}

/**
 * Delete a proposal template
 */
export function useDeleteProposalTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProposalTemplate,
    onSuccess: (data, variables) => {
      // Invalidate and refetch templates list
      queryClient.invalidateQueries({ queryKey: proposalTemplateKeys.lists() })
      
      toast.success('Template deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete template: ${error.message}`)
    },
  })
}

/**
 * Increment template usage count
 */
export function useIncrementTemplateUsage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: incrementTemplateUsage,
    onSuccess: (data, variables) => {
      // Invalidate and refetch templates list and detail
      queryClient.invalidateQueries({ queryKey: proposalTemplateKeys.lists() })
      queryClient.invalidateQueries({ queryKey: proposalTemplateKeys.detail(variables) })
    },
    onError: (error) => {
      console.error('Failed to increment template usage:', error)
    },
  })
}