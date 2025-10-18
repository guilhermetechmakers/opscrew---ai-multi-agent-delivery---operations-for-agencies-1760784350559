import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portalDocumentsApi } from '@/api/portal-documents';
import type { PortalDocument, PortalDocumentInsert, PortalDocumentUpdate } from '@/types/database/portal-documents';

// Query keys
export const portalDocumentKeys = {
  all: ['portal-documents'] as const,
  lists: () => [...portalDocumentKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...portalDocumentKeys.lists(), { filters }] as const,
  details: () => [...portalDocumentKeys.all, 'detail'] as const,
  detail: (id: string) => [...portalDocumentKeys.details(), id] as const,
  byProject: (projectId: string) => [...portalDocumentKeys.all, 'by-project', projectId] as const,
  byType: (projectId: string, type: string) => [...portalDocumentKeys.all, 'by-type', projectId, type] as const,
};

// Get documents by project
export function usePortalDocumentsByProject(projectId: string) {
  return useQuery({
    queryKey: portalDocumentKeys.byProject(projectId),
    queryFn: () => portalDocumentsApi.getDocumentsByProject(projectId),
    enabled: !!projectId,
  });
}

// Get document by ID
export function usePortalDocument(id: string) {
  return useQuery({
    queryKey: portalDocumentKeys.detail(id),
    queryFn: () => portalDocumentsApi.getDocument(id),
    enabled: !!id,
  });
}

// Get documents by type
export function usePortalDocumentsByType(projectId: string, documentType: PortalDocument['document_type']) {
  return useQuery({
    queryKey: portalDocumentKeys.byType(projectId, documentType),
    queryFn: () => portalDocumentsApi.getDocumentsByType(projectId, documentType),
    enabled: !!projectId && !!documentType,
  });
}

// Create document
export function useCreatePortalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (document: PortalDocumentInsert) => portalDocumentsApi.createDocument(document),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: portalDocumentKeys.byProject(data.project_id) });
      queryClient.invalidateQueries({ queryKey: portalDocumentKeys.lists() });
    },
  });
}

// Update document
export function useUpdatePortalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PortalDocumentUpdate }) =>
      portalDocumentsApi.updateDocument(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: portalDocumentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: portalDocumentKeys.byProject(data.project_id) });
    },
  });
}

// Delete document
export function useDeletePortalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => portalDocumentsApi.deleteDocument(id),
    onSuccess: (data, id) => {
      // We need to get the project_id from the deleted document to invalidate the right queries
      // In a real app, you might want to return the project_id from the delete operation
      queryClient.invalidateQueries({ queryKey: portalDocumentKeys.lists() });
    },
  });
}

// Increment download count
export function useIncrementDownloadCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => portalDocumentsApi.incrementDownloadCount(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: portalDocumentKeys.detail(id) });
    },
  });
}
