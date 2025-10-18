/**
 * React Query hooks for blocker management
 * Provides data fetching, caching, and mutation capabilities for blockers
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blockersApi } from '@/api/blockers'
import type { Blocker, BlockerInsert, BlockerUpdate } from '@/types/database/blockers'
import { toast } from 'sonner'

// Query keys
export const blockerKeys = {
  all: ['blockers'] as const,
  project: (projectId: string) => [...blockerKeys.all, 'project', projectId] as const,
  active: (projectId: string) => [...blockerKeys.all, 'project', projectId, 'active'] as const,
  task: (taskId: string) => [...blockerKeys.all, 'task', taskId] as const,
  detail: (blockerId: string) => [...blockerKeys.all, 'detail', blockerId] as const,
}

/**
 * Get all blockers for a project
 */
export function useBlockers(projectId: string) {
  return useQuery({
    queryKey: blockerKeys.project(projectId),
    queryFn: () => blockersApi.getBlockers(projectId),
    enabled: !!projectId,
  })
}

/**
 * Get active blockers for a project
 */
export function useActiveBlockers(projectId: string) {
  return useQuery({
    queryKey: blockerKeys.active(projectId),
    queryFn: () => blockersApi.getActiveBlockers(projectId),
    enabled: !!projectId,
  })
}

/**
 * Get blockers for a specific task
 */
export function useTaskBlockers(taskId: string) {
  return useQuery({
    queryKey: blockerKeys.task(taskId),
    queryFn: () => blockersApi.getTaskBlockers(taskId),
    enabled: !!taskId,
  })
}

/**
 * Get a single blocker by ID
 */
export function useBlocker(blockerId: string) {
  return useQuery({
    queryKey: blockerKeys.detail(blockerId),
    queryFn: () => blockersApi.getBlocker(blockerId),
    enabled: !!blockerId,
  })
}

/**
 * Create a new blocker
 */
export function useCreateBlocker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (blocker: BlockerInsert) => blockersApi.createBlocker(blocker),
    onSuccess: (newBlocker) => {
      // Invalidate project blockers
      queryClient.invalidateQueries({ queryKey: blockerKeys.project(newBlocker.project_id) })
      queryClient.invalidateQueries({ queryKey: blockerKeys.active(newBlocker.project_id) })
      
      // If blocker is associated with a task, invalidate task blockers too
      if (newBlocker.task_id) {
        queryClient.invalidateQueries({ queryKey: blockerKeys.task(newBlocker.task_id) })
      }
      
      toast.success('Blocker created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create blocker: ' + error.message)
    },
  })
}

/**
 * Update an existing blocker
 */
export function useUpdateBlocker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ blockerId, updates }: { blockerId: string; updates: BlockerUpdate }) =>
      blockersApi.updateBlocker(blockerId, updates),
    onSuccess: (updatedBlocker) => {
      // Update the blocker in cache
      queryClient.setQueryData(blockerKeys.detail(updatedBlocker.id), updatedBlocker)
      
      // Invalidate project blockers
      queryClient.invalidateQueries({ queryKey: blockerKeys.project(updatedBlocker.project_id) })
      queryClient.invalidateQueries({ queryKey: blockerKeys.active(updatedBlocker.project_id) })
      
      // If blocker is associated with a task, invalidate task blockers too
      if (updatedBlocker.task_id) {
        queryClient.invalidateQueries({ queryKey: blockerKeys.task(updatedBlocker.task_id) })
      }
      
      toast.success('Blocker updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update blocker: ' + error.message)
    },
  })
}

/**
 * Resolve a blocker
 */
export function useResolveBlocker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ blockerId, resolutionNotes }: { blockerId: string; resolutionNotes?: string }) =>
      blockersApi.resolveBlocker(blockerId, resolutionNotes),
    onSuccess: (updatedBlocker) => {
      // Update the blocker in cache
      queryClient.setQueryData(blockerKeys.detail(updatedBlocker.id), updatedBlocker)
      
      // Invalidate project blockers
      queryClient.invalidateQueries({ queryKey: blockerKeys.project(updatedBlocker.project_id) })
      queryClient.invalidateQueries({ queryKey: blockerKeys.active(updatedBlocker.project_id) })
      
      // If blocker is associated with a task, invalidate task blockers too
      if (updatedBlocker.task_id) {
        queryClient.invalidateQueries({ queryKey: blockerKeys.task(updatedBlocker.task_id) })
      }
      
      toast.success('Blocker resolved successfully')
    },
    onError: (error) => {
      toast.error('Failed to resolve blocker: ' + error.message)
    },
  })
}

/**
 * Escalate a blocker
 */
export function useEscalateBlocker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (blockerId: string) => blockersApi.escalateBlocker(blockerId),
    onSuccess: (updatedBlocker) => {
      // Update the blocker in cache
      queryClient.setQueryData(blockerKeys.detail(updatedBlocker.id), updatedBlocker)
      
      // Invalidate project blockers
      queryClient.invalidateQueries({ queryKey: blockerKeys.project(updatedBlocker.project_id) })
      queryClient.invalidateQueries({ queryKey: blockerKeys.active(updatedBlocker.project_id) })
      
      // If blocker is associated with a task, invalidate task blockers too
      if (updatedBlocker.task_id) {
        queryClient.invalidateQueries({ queryKey: blockerKeys.task(updatedBlocker.task_id) })
      }
      
      toast.success('Blocker escalated successfully')
    },
    onError: (error) => {
      toast.error('Failed to escalate blocker: ' + error.message)
    },
  })
}

/**
 * Delete a blocker
 */
export function useDeleteBlocker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (blockerId: string) => blockersApi.deleteBlocker(blockerId),
    onSuccess: (_, blockerId) => {
      // Remove blocker from cache
      queryClient.removeQueries({ queryKey: blockerKeys.detail(blockerId) })
      
      // Invalidate all blocker queries
      queryClient.invalidateQueries({ queryKey: blockerKeys.all })
      
      toast.success('Blocker deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete blocker: ' + error.message)
    },
  })
}
