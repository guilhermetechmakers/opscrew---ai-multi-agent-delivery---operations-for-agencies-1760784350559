import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientPortalsApi } from '@/api/client-portals';
import type { ClientPortal, ClientPortalInsert, ClientPortalUpdate } from '@/types/database/client-portals';

// Query keys
export const clientPortalKeys = {
  all: ['client-portals'] as const,
  lists: () => [...clientPortalKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...clientPortalKeys.lists(), { filters }] as const,
  details: () => [...clientPortalKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientPortalKeys.details(), id] as const,
  byProject: (projectId: string) => [...clientPortalKeys.all, 'by-project', projectId] as const,
  byToken: (token: string) => [...clientPortalKeys.all, 'by-token', token] as const,
};

// Get all client portals
export function useClientPortals() {
  return useQuery({
    queryKey: clientPortalKeys.lists(),
    queryFn: () => clientPortalsApi.getClientPortals(),
  });
}

// Get client portal by ID
export function useClientPortal(id: string) {
  return useQuery({
    queryKey: clientPortalKeys.detail(id),
    queryFn: () => clientPortalsApi.getClientPortal(id),
    enabled: !!id,
  });
}

// Get client portal by project ID
export function useClientPortalByProject(projectId: string) {
  return useQuery({
    queryKey: clientPortalKeys.byProject(projectId),
    queryFn: () => clientPortalsApi.getClientPortalByProject(projectId),
    enabled: !!projectId,
  });
}

// Get client portal by access token
export function useClientPortalByToken(token: string) {
  return useQuery({
    queryKey: clientPortalKeys.byToken(token),
    queryFn: () => clientPortalsApi.getClientPortalByToken(token),
    enabled: !!token,
  });
}

// Create client portal
export function useCreateClientPortal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (portal: ClientPortalInsert) => clientPortalsApi.createClientPortal(portal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientPortalKeys.lists() });
    },
  });
}

// Update client portal
export function useUpdateClientPortal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ClientPortalUpdate }) =>
      clientPortalsApi.updateClientPortal(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientPortalKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: clientPortalKeys.lists() });
    },
  });
}

// Delete client portal
export function useDeleteClientPortal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientPortalsApi.deleteClientPortal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientPortalKeys.lists() });
    },
  });
}

// Update last accessed timestamp
export function useUpdateLastAccessed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientPortalsApi.updateLastAccessed(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: clientPortalKeys.detail(id) });
    },
  });
}

// Regenerate access token
export function useRegenerateAccessToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientPortalsApi.regenerateAccessToken(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: clientPortalKeys.detail(id) });
    },
  });
}
