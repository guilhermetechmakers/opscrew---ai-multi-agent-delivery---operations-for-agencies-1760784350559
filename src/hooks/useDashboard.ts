/**
 * React Query hooks for dashboard data
 */

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRecentProjects, getAgentActivity, getProjectProgressData } from '@/api/dashboard';
import { useAuth } from '@/hooks/useAuth';

export function useDashboardStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: () => getDashboardStats(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRecentProjects(limit: number = 5) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['recent-projects', user?.id, limit],
    queryFn: () => getRecentProjects(user!.id, limit),
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAgentActivity(limit: number = 10) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['agent-activity', user?.id, limit],
    queryFn: () => getAgentActivity(user!.id, limit),
    enabled: !!user,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
}

export function useProjectProgressData() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['project-progress', user?.id],
    queryFn: () => getProjectProgressData(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
