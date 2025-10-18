/**
 * React Query hooks for Git providers
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gitProvidersApi } from '@/api/git-providers';
import type { 
  GitProviderInsert, 
  GitProviderUpdate 
} from '@/types/database/git-providers';

// Query keys
export const gitProviderKeys = {
  all: ['git-providers'] as const,
  lists: () => [...gitProviderKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...gitProviderKeys.lists(), { filters }] as const,
  details: () => [...gitProviderKeys.all, 'detail'] as const,
  detail: (id: string) => [...gitProviderKeys.details(), id] as const,
  enabled: () => [...gitProviderKeys.all, 'enabled'] as const,
  byType: (type: string) => [...gitProviderKeys.all, 'type', type] as const,
};

// Get all providers
export function useGitProviders() {
  return useQuery({
    queryKey: gitProviderKeys.lists(),
    queryFn: () => gitProvidersApi.getProviders(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get enabled providers only
export function useEnabledGitProviders() {
  return useQuery({
    queryKey: gitProviderKeys.enabled(),
    queryFn: () => gitProvidersApi.getEnabledProviders(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get providers by type
export function useGitProvidersByType(type: string) {
  return useQuery({
    queryKey: gitProviderKeys.byType(type),
    queryFn: () => gitProvidersApi.getProvidersByType(type as any),
    enabled: !!type,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get a single provider
export function useGitProvider(id: string) {
  return useQuery({
    queryKey: gitProviderKeys.detail(id),
    queryFn: () => gitProvidersApi.getProvider(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create provider mutation
export function useCreateGitProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provider: GitProviderInsert) =>
      gitProvidersApi.createProvider(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gitProviderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gitProviderKeys.enabled() });
    },
  });
}

// Update provider mutation
export function useUpdateGitProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: GitProviderUpdate }) =>
      gitProvidersApi.updateProvider(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gitProviderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gitProviderKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: gitProviderKeys.enabled() });
    },
  });
}

// Toggle provider enabled status mutation
export function useToggleGitProviderEnabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      gitProvidersApi.toggleProviderEnabled(id, enabled),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gitProviderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gitProviderKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: gitProviderKeys.enabled() });
    },
  });
}

// Delete provider mutation
export function useDeleteGitProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gitProvidersApi.deleteProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gitProviderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gitProviderKeys.enabled() });
    },
  });
}

// Test provider connection mutation
export function useTestGitProviderConnection() {
  return useMutation({
    mutationFn: (id: string) => gitProvidersApi.testProviderConnection(id),
  });
}
