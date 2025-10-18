/**
 * React Query hooks for sprint management
 * Provides data fetching, caching, and mutation capabilities for sprints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sprintsApi } from '@/api/sprints'
import type { Sprint } from '@/types/database/sprints'
import { toast } from 'sonner'

// Query keys
export const sprintKeys = {
  all: ['sprints'] as const,
  project: (projectId: string) => [...sprintKeys.all, 'project', projectId] as const,
  detail: (sprintId: string) => [...sprintKeys.all, 'detail', sprintId] as const,
  active: (projectId: string) => [...sprintKeys.all, 'project', projectId, 'active'] as const,
}

/**
 * Get all sprints for a project
 */
export function useSprints(projectId: string) {
  return useQuery({
    queryKey: sprintKeys.project(projectId),
    queryFn: () => sprintsApi.getSprints(projectId),
    enabled: !!projectId,
  })
}

/**
 * Get active sprint for a project
 */
export function useActiveSprint(projectId: string) {
  return useQuery({
    queryKey: sprintKeys.active(projectId),
    queryFn: () => sprintsApi.getActiveSprint(projectId),
    enabled: !!projectId,
  })
}

/**
 * Get a single sprint by ID
 */
export function useSprint(sprintId: string) {
  return useQuery({
    queryKey: sprintKeys.detail(sprintId),
    queryFn: () => sprintsApi.getSprint(sprintId),
    enabled: !!sprintId,
  })
}

/**
 * Create a new sprint
 */
export function useCreateSprint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sprint: Omit<Sprint, 'id' | 'created_at' | 'updated_at'>) => sprintsApi.createSprint(sprint),
    onSuccess: (newSprint) => {
      // Invalidate project sprints
      queryClient.invalidateQueries({ queryKey: sprintKeys.project(newSprint.project_id) })
      
      toast.success('Sprint created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create sprint: ' + error.message)
    },
  })
}

/**
 * Update an existing sprint
 */
export function useUpdateSprint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sprintId, updates }: { sprintId: string; updates: Partial<Sprint> }) =>
      sprintsApi.updateSprint(sprintId, updates),
    onSuccess: (updatedSprint) => {
      // Update the sprint in cache
      queryClient.setQueryData(sprintKeys.detail(updatedSprint.id), updatedSprint)
      
      // Invalidate project sprints
      queryClient.invalidateQueries({ queryKey: sprintKeys.project(updatedSprint.project_id) })
      
      toast.success('Sprint updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update sprint: ' + error.message)
    },
  })
}

/**
 * Start a sprint
 */
export function useStartSprint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sprintId: string) => sprintsApi.startSprint(sprintId),
    onSuccess: (updatedSprint) => {
      // Update the sprint in cache
      queryClient.setQueryData(sprintKeys.detail(updatedSprint.id), updatedSprint)
      
      // Invalidate project sprints and active sprint
      queryClient.invalidateQueries({ queryKey: sprintKeys.project(updatedSprint.project_id) })
      queryClient.invalidateQueries({ queryKey: sprintKeys.active(updatedSprint.project_id) })
      
      toast.success('Sprint started successfully')
    },
    onError: (error) => {
      toast.error('Failed to start sprint: ' + error.message)
    },
  })
}

/**
 * Complete a sprint
 */
export function useCompleteSprint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sprintId: string) => sprintsApi.completeSprint(sprintId),
    onSuccess: (updatedSprint) => {
      // Update the sprint in cache
      queryClient.setQueryData(sprintKeys.detail(updatedSprint.id), updatedSprint)
      
      // Invalidate project sprints and active sprint
      queryClient.invalidateQueries({ queryKey: sprintKeys.project(updatedSprint.project_id) })
      queryClient.invalidateQueries({ queryKey: sprintKeys.active(updatedSprint.project_id) })
      
      toast.success('Sprint completed successfully')
    },
    onError: (error) => {
      toast.error('Failed to complete sprint: ' + error.message)
    },
  })
}
