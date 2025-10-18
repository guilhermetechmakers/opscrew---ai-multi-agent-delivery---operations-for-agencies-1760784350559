/**
 * React Query hooks for project provisioning logs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectProvisioningLogsApi } from '@/api/project-provisioning-logs';
import type { ProjectProvisioningLogInsert } from '@/types/database/project-provisioning-logs';

// Query keys
export const logKeys = {
  all: ['project-provisioning-logs'] as const,
  lists: () => [...logKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...logKeys.lists(), { filters }] as const,
  byRequest: (requestId: string) => [...logKeys.all, 'request', requestId] as const,
  byLevel: (level: string) => [...logKeys.all, 'level', level] as const,
  recent: (limit: number) => [...logKeys.all, 'recent', limit] as const,
  errors: () => [...logKeys.all, 'errors'] as const,
};

// Get logs by request ID
export function useLogsByRequestId(requestId: string) {
  return useQuery({
    queryKey: logKeys.byRequest(requestId),
    queryFn: () => projectProvisioningLogsApi.getLogsByRequestId(requestId),
    enabled: !!requestId,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for active requests
  });
}

// Get logs by level
export function useLogsByLevel(level: string) {
  return useQuery({
    queryKey: logKeys.byLevel(level),
    queryFn: () => projectProvisioningLogsApi.getLogsByLevel(level as any),
    enabled: !!level,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get recent logs
export function useRecentLogs(limit: number = 50) {
  return useQuery({
    queryKey: logKeys.recent(limit),
    queryFn: () => projectProvisioningLogsApi.getRecentLogs(limit),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
}

// Get error logs
export function useErrorLogs() {
  return useQuery({
    queryKey: logKeys.errors(),
    queryFn: () => projectProvisioningLogsApi.getErrorLogs(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Create log mutation
export function useCreateLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (log: ProjectProvisioningLogInsert) =>
      projectProvisioningLogsApi.createLog(log),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: logKeys.byRequest(data.request_id) });
      queryClient.invalidateQueries({ queryKey: logKeys.recent(50) });
      if (data.log_level === 'error') {
        queryClient.invalidateQueries({ queryKey: logKeys.errors() });
      }
    },
  });
}

// Create multiple logs mutation
export function useCreateLogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logs: ProjectProvisioningLogInsert[]) =>
      projectProvisioningLogsApi.createLogs(logs),
    onSuccess: (data) => {
      if (data.length > 0) {
        const requestId = data[0].request_id;
        queryClient.invalidateQueries({ queryKey: logKeys.byRequest(requestId) });
        queryClient.invalidateQueries({ queryKey: logKeys.recent(50) });
        
        // Check if any logs are errors
        const hasErrors = data.some(log => log.log_level === 'error');
        if (hasErrors) {
          queryClient.invalidateQueries({ queryKey: logKeys.errors() });
        }
      }
    },
  });
}
