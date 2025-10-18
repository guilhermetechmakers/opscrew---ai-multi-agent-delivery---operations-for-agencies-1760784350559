import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portalCommentsApi } from '@/api/portal-comments';
import type { PortalComment, PortalCommentInsert, PortalCommentUpdate } from '@/types/database/portal-comments';

// Query keys
export const portalCommentKeys = {
  all: ['portal-comments'] as const,
  lists: () => [...portalCommentKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...portalCommentKeys.lists(), { filters }] as const,
  details: () => [...portalCommentKeys.all, 'detail'] as const,
  detail: (id: string) => [...portalCommentKeys.details(), id] as const,
  byProject: (projectId: string) => [...portalCommentKeys.all, 'by-project', projectId] as const,
  threaded: (projectId: string) => [...portalCommentKeys.all, 'threaded', projectId] as const,
  replies: (parentId: string) => [...portalCommentKeys.all, 'replies', parentId] as const,
  byStatus: (projectId: string, status: string) => [...portalCommentKeys.all, 'by-status', projectId, status] as const,
  byType: (projectId: string, type: string) => [...portalCommentKeys.all, 'by-type', projectId, type] as const,
};

// Get threaded comments by project
export function usePortalThreadedComments(projectId: string) {
  return useQuery({
    queryKey: portalCommentKeys.threaded(projectId),
    queryFn: () => portalCommentsApi.getThreadedComments(projectId),
    enabled: !!projectId,
  });
}

// Get comments by project
export function usePortalCommentsByProject(projectId: string) {
  return useQuery({
    queryKey: portalCommentKeys.byProject(projectId),
    queryFn: () => portalCommentsApi.getCommentsByProject(projectId),
    enabled: !!projectId,
  });
}

// Get comment by ID
export function usePortalComment(id: string) {
  return useQuery({
    queryKey: portalCommentKeys.detail(id),
    queryFn: () => portalCommentsApi.getComment(id),
    enabled: !!id,
  });
}

// Get comment replies
export function usePortalCommentReplies(parentId: string) {
  return useQuery({
    queryKey: portalCommentKeys.replies(parentId),
    queryFn: () => portalCommentsApi.getCommentReplies(parentId),
    enabled: !!parentId,
  });
}

// Get comments by status
export function usePortalCommentsByStatus(projectId: string, status: PortalComment['status']) {
  return useQuery({
    queryKey: portalCommentKeys.byStatus(projectId, status),
    queryFn: () => portalCommentsApi.getCommentsByStatus(projectId, status),
    enabled: !!projectId && !!status,
  });
}

// Get comments by type
export function usePortalCommentsByType(projectId: string, commentType: PortalComment['comment_type']) {
  return useQuery({
    queryKey: portalCommentKeys.byType(projectId, commentType),
    queryFn: () => portalCommentsApi.getCommentsByType(projectId, commentType),
    enabled: !!projectId && !!commentType,
  });
}

// Create comment
export function useCreatePortalComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: PortalCommentInsert) => portalCommentsApi.createComment(comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: portalCommentKeys.byProject(data.project_id) });
      queryClient.invalidateQueries({ queryKey: portalCommentKeys.threaded(data.project_id) });
      if (data.parent_id) {
        queryClient.invalidateQueries({ queryKey: portalCommentKeys.replies(data.parent_id) });
      }
    },
  });
}

// Update comment
export function useUpdatePortalComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PortalCommentUpdate }) =>
      portalCommentsApi.updateComment(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: portalCommentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: portalCommentKeys.byProject(data.project_id) });
      queryClient.invalidateQueries({ queryKey: portalCommentKeys.threaded(data.project_id) });
    },
  });
}

// Delete comment
export function useDeletePortalComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => portalCommentsApi.deleteComment(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: portalCommentKeys.lists() });
    },
  });
}
