import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portalSettingsApi } from '@/api/portal-settings';
import type { PortalSettings, PortalSettingsInsert, PortalSettingsUpdate } from '@/types/database/portal-settings';

// Query keys
export const portalSettingsKeys = {
  all: ['portal-settings'] as const,
  details: () => [...portalSettingsKeys.all, 'detail'] as const,
  detail: (id: string) => [...portalSettingsKeys.details(), id] as const,
  byProject: (projectId: string) => [...portalSettingsKeys.all, 'by-project', projectId] as const,
};

// Get portal settings by project
export function usePortalSettingsByProject(projectId: string) {
  return useQuery({
    queryKey: portalSettingsKeys.byProject(projectId),
    queryFn: () => portalSettingsApi.getSettingsByProject(projectId),
    enabled: !!projectId,
  });
}

// Get portal settings by ID
export function usePortalSettings(id: string) {
  return useQuery({
    queryKey: portalSettingsKeys.detail(id),
    queryFn: () => portalSettingsApi.getSettings(id),
    enabled: !!id,
  });
}

// Get or create portal settings
export function usePortalSettingsOrCreate(projectId: string, userId: string) {
  return useQuery({
    queryKey: [...portalSettingsKeys.byProject(projectId), 'or-create'],
    queryFn: () => portalSettingsApi.getOrCreateSettings(projectId, userId),
    enabled: !!projectId && !!userId,
  });
}

// Create portal settings
export function useCreatePortalSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: PortalSettingsInsert) => portalSettingsApi.createSettings(settings),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: portalSettingsKeys.byProject(data.project_id) });
      queryClient.invalidateQueries({ queryKey: portalSettingsKeys.detail(data.id) });
    },
  });
}

// Update portal settings
export function useUpdatePortalSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PortalSettingsUpdate }) =>
      portalSettingsApi.updateSettings(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: portalSettingsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: portalSettingsKeys.byProject(data.project_id) });
    },
  });
}

// Update portal settings by project
export function useUpdatePortalSettingsByProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: PortalSettingsUpdate }) =>
      portalSettingsApi.updateSettingsByProject(projectId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: portalSettingsKeys.byProject(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: portalSettingsKeys.detail(data.id) });
    },
  });
}

// Delete portal settings
export function useDeletePortalSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => portalSettingsApi.deleteSettings(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: portalSettingsKeys.lists() });
    },
  });
}
