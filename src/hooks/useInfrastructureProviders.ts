/**
 * React Query hooks for infrastructure providers
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { infrastructureProvidersApi } from '@/api/infrastructure-providers';
import type { 
  InfrastructureProviderInsert, 
  InfrastructureProviderUpdate 
} from '@/types/database/infrastructure-providers';

// Query keys
export const infrastructureProviderKeys = {
  all: ['infrastructure-providers'] as const,
  lists: () => [...infrastructureProviderKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...infrastructureProviderKeys.lists(), { filters }] as const,
  details: () => [...infrastructureProviderKeys.all, 'detail'] as const,
  detail: (id: string) => [...infrastructureProviderKeys.details(), id] as const,
  enabled: () => [...infrastructureProviderKeys.all, 'enabled'] as const,
  byType: (type: string) => [...infrastructureProviderKeys.all, 'type', type] as const,
};

// Get all providers
export function useInfrastructureProviders() {
  return useQuery({
    queryKey: infrastructureProviderKeys.lists(),
    queryFn: () => infrastructureProvidersApi.getProviders(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get enabled providers only
export function useEnabledInfrastructureProviders() {
  return useQuery({
    queryKey: infrastructureProviderKeys.enabled(),
    queryFn: () => infrastructureProvidersApi.getEnabledProviders(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get providers by type
export function useInfrastructureProvidersByType(type: string) {
  return useQuery({
    queryKey: infrastructureProviderKeys.byType(type),
    queryFn: () => infrastructureProvidersApi.getProvidersByType(type as any),
    enabled: !!type,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get a single provider
export function useInfrastructureProvider(id: string) {
  return useQuery({
    queryKey: infrastructureProviderKeys.detail(id),
    queryFn: () => infrastructureProvidersApi.getProvider(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create provider mutation
export function useCreateInfrastructureProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provider: InfrastructureProviderInsert) =>
      infrastructureProvidersApi.createProvider(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: infrastructureProviderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: infrastructureProviderKeys.enabled() });
    },
  });
}

// Update provider mutation
export function useUpdateInfrastructureProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: InfrastructureProviderUpdate }) =>
      infrastructureProvidersApi.updateProvider(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: infrastructureProviderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: infrastructureProviderKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: infrastructureProviderKeys.enabled() });
    },
  });
}

// Toggle provider enabled status mutation
export function useToggleInfrastructureProviderEnabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      infrastructureProvidersApi.toggleProviderEnabled(id, enabled),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: infrastructureProviderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: infrastructureProviderKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: infrastructureProviderKeys.enabled() });
    },
  });
}

// Delete provider mutation
export function useDeleteInfrastructureProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => infrastructureProvidersApi.deleteProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: infrastructureProviderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: infrastructureProviderKeys.enabled() });
    },
  });
}

// Test provider connection mutation
export function useTestInfrastructureProviderConnection() {
  return useMutation({
    mutationFn: (id: string) => infrastructureProvidersApi.testProviderConnection(id),
  });
}
