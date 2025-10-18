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
  byCategory: (category: string) => [...templateKeys.all, 'category', category] as const,
  popular: (limit: number) => [...templateKeys.all, 'popular', limit] as const,
};

// Get all templates
export function useTemplates() {
  return useQuery({
    queryKey: templateKeys.lists(),
    queryFn: () => projectProvisioningTemplatesApi.getTemplates(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get templates by category
export function useTemplatesByCategory(category: string) {
  return useQuery({
    queryKey: templateKeys.byCategory(category),
    queryFn: () => projectProvisioningTemplatesApi.getTemplatesByCategory(category),
    enabled: !!category,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get a single template
export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => projectProvisioningTemplatesApi.getTemplate(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get popular templates
export function usePopularTemplates(limit: number = 10) {
  return useQuery({
    queryKey: templateKeys.popular(limit),
    queryFn: () => projectProvisioningTemplatesApi.getPopularTemplates(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Create template mutation
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: ProjectProvisioningTemplateInsert) =>
      projectProvisioningTemplatesApi.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

// Update template mutation
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProjectProvisioningTemplateUpdate }) =>
      projectProvisioningTemplatesApi.updateTemplate(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(data.id) });
    },
  });
}

// Delete template mutation
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectProvisioningTemplatesApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

// Increment usage count mutation
export function useIncrementUsageCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectProvisioningTemplatesApi.incrementUsageCount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.popular(10) });
    },
  });
}
