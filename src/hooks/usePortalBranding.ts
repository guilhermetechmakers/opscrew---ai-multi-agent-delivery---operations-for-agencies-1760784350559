/**
 * React Query hooks for portal branding settings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { portalBrandingApi } from '@/api/portal-branding-settings';
import type { 
  PortalBrandingSettingsInsert, 
  PortalBrandingSettingsUpdate,
  BrandingConfig 
} from '@/types/database/portal-branding-settings';

// Query keys
export const portalBrandingKeys = {
  all: ['portal-branding'] as const,
  byProject: (projectId: string) => [...portalBrandingKeys.all, 'project', projectId] as const,
  byId: (id: string) => [...portalBrandingKeys.all, 'id', id] as const,
};

// Get branding by project ID
export function usePortalBranding(projectId: string) {
  return useQuery({
    queryKey: portalBrandingKeys.byProject(projectId),
    queryFn: () => portalBrandingApi.getBrandingByProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get branding by ID
export function usePortalBrandingById(id: string) {
  return useQuery({
    queryKey: portalBrandingKeys.byId(id),
    queryFn: () => portalBrandingApi.getBranding(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get or create branding (with default fallback)
export function usePortalBrandingOrCreate(projectId: string, userId: string) {
  return useQuery({
    queryKey: [...portalBrandingKeys.byProject(projectId), 'or-create'],
    queryFn: () => portalBrandingApi.getOrCreateBranding(projectId, userId),
    enabled: !!projectId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create branding mutation
export function useCreatePortalBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branding: PortalBrandingSettingsInsert) => 
      portalBrandingApi.createBranding(branding),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: portalBrandingKeys.all });
      queryClient.invalidateQueries({ 
        queryKey: portalBrandingKeys.byProject(data.project_id) 
      });
      toast.success('Branding settings created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create branding settings: ${error.message}`);
    },
  });
}

// Update branding mutation
export function useUpdatePortalBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PortalBrandingSettingsUpdate }) => 
      portalBrandingApi.updateBranding(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: portalBrandingKeys.all });
      queryClient.invalidateQueries({ 
        queryKey: portalBrandingKeys.byProject(data.project_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: portalBrandingKeys.byId(data.id) 
      });
      toast.success('Branding settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update branding settings: ${error.message}`);
    },
  });
}

// Update branding by project mutation
export function useUpdatePortalBrandingByProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: PortalBrandingSettingsUpdate }) => 
      portalBrandingApi.updateBrandingByProject(projectId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: portalBrandingKeys.all });
      queryClient.invalidateQueries({ 
        queryKey: portalBrandingKeys.byProject(data.project_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: portalBrandingKeys.byId(data.id) 
      });
      toast.success('Branding settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update branding settings: ${error.message}`);
    },
  });
}

// Delete branding mutation
export function useDeletePortalBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => portalBrandingApi.deleteBranding(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: portalBrandingKeys.all });
      queryClient.removeQueries({ queryKey: portalBrandingKeys.byId(id) });
      toast.success('Branding settings deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete branding settings: ${error.message}`);
    },
  });
}

// Deactivate branding mutation
export function useDeactivatePortalBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => portalBrandingApi.deactivateBranding(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: portalBrandingKeys.all });
      queryClient.invalidateQueries({ queryKey: portalBrandingKeys.byId(id) });
      toast.success('Branding settings deactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to deactivate branding settings: ${error.message}`);
    },
  });
}

// Utility hook to get branding config
export function useBrandingConfig(projectId: string): BrandingConfig | null {
  const { data: branding } = usePortalBranding(projectId);
  
  if (!branding) return null;
  
  return portalBrandingApi.convertToBrandingConfig(branding);
}

// Utility hook to get CSS for portal
export function usePortalCSS(projectId: string): string | null {
  const config = useBrandingConfig(projectId);
  
  if (!config) return null;
  
  return portalBrandingApi.generatePortalCSS(config);
}
