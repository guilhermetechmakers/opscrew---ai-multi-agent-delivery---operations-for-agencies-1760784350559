/**
 * React Query hooks for meetings operations
 * Provides data fetching, caching, and mutation capabilities
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingsApi, meetingTranscriptsApi, meetingSummariesApi } from '@/api/meetings';
import type { 
  Meeting, 
  MeetingInsert, 
  MeetingUpdate,
  MeetingTranscript,
  MeetingTranscriptInsert,
  MeetingSummary,
  MeetingSummaryInsert
} from '@/types/database';

// Query keys
export const meetingKeys = {
  all: ['meetings'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...meetingKeys.lists(), filters] as const,
  details: () => [...meetingKeys.all, 'detail'] as const,
  detail: (id: string) => [...meetingKeys.details(), id] as const,
  transcripts: () => [...meetingKeys.all, 'transcripts'] as const,
  transcript: (meetingId: string) => [...meetingKeys.transcripts(), meetingId] as const,
  summaries: () => [...meetingKeys.all, 'summaries'] as const,
  summary: (meetingId: string) => [...meetingKeys.summaries(), meetingId] as const,
};

// =====================================================
// MEETINGS HOOKS
// =====================================================

export function useMeetings() {
  return useQuery({
    queryKey: meetingKeys.lists(),
    queryFn: meetingsApi.getMeetings,
  });
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: meetingKeys.detail(id),
    queryFn: () => meetingsApi.getMeeting(id),
    enabled: !!id,
  });
}

export function useMeetingsByProject(projectId: string) {
  return useQuery({
    queryKey: meetingKeys.list({ projectId }),
    queryFn: () => meetingsApi.getMeetingsByProject(projectId),
    enabled: !!projectId,
  });
}

export function useMeetingsByType(type: Meeting['meeting_type']) {
  return useQuery({
    queryKey: meetingKeys.list({ type }),
    queryFn: () => meetingsApi.getMeetingsByType(type),
    enabled: !!type,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: meetingsApi.createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: MeetingUpdate }) =>
      meetingsApi.updateMeeting(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.setQueryData(meetingKeys.detail(data.id), data);
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: meetingsApi.deleteMeeting,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.removeQueries({ queryKey: meetingKeys.detail(id) });
    },
  });
}

// =====================================================
// MEETING TRANSCRIPTS HOOKS
// =====================================================

export function useMeetingTranscript(meetingId: string) {
  return useQuery({
    queryKey: meetingKeys.transcript(meetingId),
    queryFn: () => meetingTranscriptsApi.getTranscript(meetingId),
    enabled: !!meetingId,
  });
}

export function useUpsertTranscript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: meetingTranscriptsApi.upsertTranscript,
    onSuccess: (data) => {
      queryClient.setQueryData(meetingKeys.transcript(data.meeting_id), data);
    },
  });
}

export function useUpdateTranscriptStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      meetingId, 
      status, 
      error 
    }: { 
      meetingId: string; 
      status: MeetingTranscript['processing_status']; 
      error?: string; 
    }) => meetingTranscriptsApi.updateProcessingStatus(meetingId, status, error),
    onSuccess: (data) => {
      queryClient.setQueryData(meetingKeys.transcript(data.meeting_id), data);
    },
  });
}

export function useUpdateTranscriptContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      meetingId, 
      rawTranscript, 
      processedTranscript, 
      confidenceScore 
    }: { 
      meetingId: string; 
      rawTranscript: string; 
      processedTranscript?: string; 
      confidenceScore?: number; 
    }) => meetingTranscriptsApi.updateTranscriptContent(
      meetingId, 
      rawTranscript, 
      processedTranscript, 
      confidenceScore
    ),
    onSuccess: (data) => {
      queryClient.setQueryData(meetingKeys.transcript(data.meeting_id), data);
    },
  });
}

// =====================================================
// MEETING SUMMARIES HOOKS
// =====================================================

export function useMeetingSummary(meetingId: string) {
  return useQuery({
    queryKey: meetingKeys.summary(meetingId),
    queryFn: () => meetingSummariesApi.getSummary(meetingId),
    enabled: !!meetingId,
  });
}

export function useMeetingSummaries() {
  return useQuery({
    queryKey: meetingKeys.summaries(),
    queryFn: meetingSummariesApi.getSummaries,
  });
}

export function useUpsertSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: meetingSummariesApi.upsertSummary,
    onSuccess: (data) => {
      queryClient.setQueryData(meetingKeys.summary(data.meeting_id), data);
      queryClient.invalidateQueries({ queryKey: meetingKeys.summaries() });
    },
  });
}

export function useUpdateClientApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      meetingId, 
      approved, 
      feedback 
    }: { 
      meetingId: string; 
      approved: boolean; 
      feedback?: string; 
    }) => meetingSummariesApi.updateClientApproval(meetingId, approved, feedback),
    onSuccess: (data) => {
      queryClient.setQueryData(meetingKeys.summary(data.meeting_id), data);
    },
  });
}
