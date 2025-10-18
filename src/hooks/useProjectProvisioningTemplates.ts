/**
 * React Query hooks for project provisioning templates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectProvisioningTemplatesApi } from '@/api/project-provisioning-templates';
import type { 
  ProjectProvisioningTemplateInsert, 
  ProjectProvisioningTemplateUpdate 
} from '@/types/database/project-provisioning-templates';

// Query keys
export const templateKeys = {
  all: ['project-provisioning-templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...templateKeys.lists(), { filters }] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
  public: () => [...templateKeys.all, 'public'] as const,
  byCategory: (category: string) => [...templateKeys.all, 'category', category] as const,
  byProvider: (provider: string) => [...templateKeys.all, 'provider', provider] as const,
  search: (query: string) => [...templateKeys.all, 'search', query] as const,
};

// Get all templates
export function useProjectProvisioningTemplates() {
  return useQuery({
    queryKey: templateKeys.lists(),
    queryFn: () => projectProvisioningTemplatesApi.getTemplates(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get public templates
export function usePublicTemplates() {
  return useQuery({
    queryKey: templateKeys.public(),
    queryFn: () => projectProvisioningTemplatesApi.getPublicTemplates(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get templates by category
export function useTemplatesByCategory(category: string) {
  return useQuery({
    queryKey: templateKeys.byCategory(category),
    queryFn: () => projectProvisioningTemplatesApi.getTemplatesByCategory(category as any),
    enabled: !!category,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get templates by infrastructure provider
export function useTemplatesByProvider(provider: string) {
  return useQuery({
    queryKey: templateKeys.byProvider(provider),
    queryFn: () => projectProvisioningTemplatesApi.getTemplatesByProvider(provider as any),
    enabled: !!provider,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get a single template
export function useProjectProvisioningTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => projectProvisioningTemplatesApi.getTemplate(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Search templates
export function useSearchTemplates(query: string) {
  return useQuery({
    queryKey: templateKeys.search(query),
    queryFn: () => projectProvisioningTemplatesApi.searchTemplates(query),
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Create template mutation
export function useCreateProjectProvisioningTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: ProjectProvisioningTemplateInsert) =>
      projectProvisioningTemplatesApi.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.public() });
    },
  });
}

// Update template mutation
export function useUpdateProjectProvisioningTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProjectProvisioningTemplateUpdate }) =>
      projectProvisioningTemplatesApi.updateTemplate(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.public() });
    },
  });
}

// Duplicate template mutation
export function useDuplicateProjectProvisioningTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      projectProvisioningTemplatesApi.duplicateTemplate(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

// Archive template mutation
export function useArchiveProjectProvisioningTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectProvisioningTemplatesApi.archiveTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.public() });
    },
  });
}

// Delete template mutation
export function useDeleteProjectProvisioningTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectProvisioningTemplatesApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.public() });
    },
  });
}

// Increment usage mutation
export function useIncrementTemplateUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectProvisioningTemplatesApi.incrementUsage(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.public() });
    },
  });
}
