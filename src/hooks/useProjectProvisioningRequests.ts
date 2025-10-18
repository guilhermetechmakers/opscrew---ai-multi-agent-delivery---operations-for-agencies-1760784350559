/**
 * React Query hooks for project provisioning requests
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectProvisioningRequestsApi } from '@/api/project-provisioning-requests';
import type { 
  ProjectProvisioningRequestInsert, 
  ProjectProvisioningRequestUpdate 
} from '@/types/database/project-provisioning-requests';

// Query keys
export const requestKeys = {
  all: ['project-provisioning-requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...requestKeys.lists(), { filters }] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestKeys.details(), id] as const,
  byStatus: (status: string) => [...requestKeys.all, 'status', status] as const,
  byProject: (projectId: string) => [...requestKeys.all, 'project', projectId] as const,
  active: () => [...requestKeys.all, 'active'] as const,
};

// Get all requests
export function useRequests() {
  return useQuery({
    queryKey: requestKeys.lists(),
    queryFn: () => projectProvisioningRequestsApi.getRequests(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get requests by status
export function useRequestsByStatus(status: string) {
  return useQuery({
    queryKey: requestKeys.byStatus(status),
    queryFn: () => projectProvisioningRequestsApi.getRequestsByStatus(status as any),
    enabled: !!status,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get a single request
export function useRequest(id: string) {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => projectProvisioningRequestsApi.getRequest(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get request by project ID
export function useRequestByProjectId(projectId: string) {
  return useQuery({
    queryKey: requestKeys.byProject(projectId),
    queryFn: () => projectProvisioningRequestsApi.getRequestByProjectId(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get active requests
export function useActiveRequests() {
  return useQuery({
    queryKey: requestKeys.active(),
    queryFn: () => projectProvisioningRequestsApi.getActiveRequests(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
}

// Create request mutation
export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ProjectProvisioningRequestInsert) =>
      projectProvisioningRequestsApi.createRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestKeys.active() });
    },
  });
}

// Update request mutation
export function useUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProjectProvisioningRequestUpdate }) =>
      projectProvisioningRequestsApi.updateRequest(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.active() });
    },
  });
}

// Update request status mutation
export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      status, 
      progress 
    }: { 
      id: string; 
      status: string; 
      progress?: number 
    }) =>
      projectProvisioningRequestsApi.updateRequestStatus(id, status as any, progress),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.active() });
    },
  });
}

// Cancel request mutation
export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectProvisioningRequestsApi.cancelRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestKeys.active() });
    },
  });
}

// Delete request mutation
export function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectProvisioningRequestsApi.deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestKeys.active() });
    },
  });
}
