/**
 * React Query hooks for project provisioning logs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectProvisioningLogsApi } from '@/api/project-provisioning-logs';
import type { 
  ProjectProvisioningLogInsert,
  ProvisioningProgress
} from '@/types/database/project-provisioning-logs';

// Query keys
export const logKeys = {
  all: ['project-provisioning-logs'] as const,
  lists: () => [...logKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...logKeys.lists(), { filters }] as const,
  byRequest: (requestId: string) => [...logKeys.all, 'request', requestId] as const,
  byLevel: (level: string) => [...logKeys.all, 'level', level] as const,
  recent: (limit: number) => [...logKeys.all, 'recent', limit] as const,
  progress: (requestId: string) => [...logKeys.all, 'progress', requestId] as const,
  errors: (requestId: string) => [...logKeys.all, 'errors', requestId] as const,
};

// Get logs by request ID
export function useLogsByRequestId(requestId: string) {
  return useQuery({
    queryKey: logKeys.byRequest(requestId),
    queryFn: () => projectProvisioningLogsApi.getLogsByRequestId(requestId),
    enabled: !!requestId,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for real-time updates
  });
}

// Get logs by level
export function useLogsByLevel(level: string) {
  return useQuery({
    queryKey: logKeys.byLevel(level),
    queryFn: () => projectProvisioningLogsApi.getLogsByLevel(level as any),
    enabled: !!level,
    staleTime: 1000 * 60 * 2, // 2 minutes
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

// Get provisioning progress
export function useProvisioningProgress(requestId: string) {
  return useQuery({
    queryKey: logKeys.progress(requestId),
    queryFn: () => projectProvisioningLogsApi.getProvisioningProgress(requestId),
    enabled: !!requestId,
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 10, // Refetch every 10 seconds for real-time updates
  });
}

// Get error logs for a request
export function useErrorLogs(requestId: string) {
  return useQuery({
    queryKey: logKeys.errors(requestId),
    queryFn: () => projectProvisioningLogsApi.getErrorLogs(requestId),
    enabled: !!requestId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Create log mutation
export function useCreateProvisioningLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (log: ProjectProvisioningLogInsert) =>
      projectProvisioningLogsApi.createLog(log),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: logKeys.byRequest(data.request_id) });
      queryClient.invalidateQueries({ queryKey: logKeys.recent(50) });
      queryClient.invalidateQueries({ queryKey: logKeys.progress(data.request_id) });
    },
  });
}

// Log step mutation
export function useLogProvisioningStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      requestId,
      stepName,
      stepType,
      status,
      message,
      details = {},
      errorMessage,
      errorDetails = {}
    }: {
      userId: string;
      requestId: string;
      stepName: string;
      stepType: string;
      status: string;
      message: string;
      details?: Record<string, any>;
      errorMessage?: string;
      errorDetails?: Record<string, any>;
    }) =>
      projectProvisioningLogsApi.logStep(
        userId,
        requestId,
        stepName,
        stepType,
        status,
        message,
        details,
        errorMessage,
        errorDetails
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: logKeys.byRequest(variables.requestId) });
      queryClient.invalidateQueries({ queryKey: logKeys.recent(50) });
      queryClient.invalidateQueries({ queryKey: logKeys.progress(variables.requestId) });
    },
  });
}

// Clear logs mutation
export function useClearProvisioningLogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => projectProvisioningLogsApi.clearLogs(requestId),
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: logKeys.byRequest(requestId) });
      queryClient.invalidateQueries({ queryKey: logKeys.progress(requestId) });
    },
  });
}

// Real-time log streaming hook
export function useStreamProvisioningLogs(
  requestId: string,
  onLog: (log: any) => void
) {
  return useQuery({
    queryKey: [`stream-logs-${requestId}`],
    queryFn: () => {
      return new Promise<void>((resolve) => {
        const unsubscribe = projectProvisioningLogsApi.streamLogs(requestId, onLog);
        // Return a cleanup function
        return () => {
          unsubscribe();
          resolve();
        };
      });
    },
    enabled: !!requestId,
    staleTime: Infinity, // Never stale for streaming
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
