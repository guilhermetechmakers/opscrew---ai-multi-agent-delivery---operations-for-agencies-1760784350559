/**
 * React Query hooks for tickets operations
 * Provides data fetching, caching, and mutation capabilities
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@/api/tickets';
import type { 
  Ticket, 
  TicketInsert, 
  TicketUpdate 
} from '@/types/database';

// Query keys
export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...ticketKeys.lists(), filters] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
  stats: () => [...ticketKeys.all, 'stats'] as const,
};

// =====================================================
// TICKETS HOOKS
// =====================================================

export function useTickets() {
  return useQuery({
    queryKey: ticketKeys.lists(),
    queryFn: ticketsApi.getTickets,
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketsApi.getTicket(id),
    enabled: !!id,
  });
}

export function useTicketsByProject(projectId: string) {
  return useQuery({
    queryKey: ticketKeys.list({ projectId }),
    queryFn: () => ticketsApi.getTicketsByProject(projectId),
    enabled: !!projectId,
  });
}

export function useTicketsByMeeting(meetingId: string) {
  return useQuery({
    queryKey: ticketKeys.list({ meetingId }),
    queryFn: () => ticketsApi.getTicketsByMeeting(meetingId),
    enabled: !!meetingId,
  });
}

export function useTicketsByStatus(status: Ticket['status']) {
  return useQuery({
    queryKey: ticketKeys.list({ status }),
    queryFn: () => ticketsApi.getTicketsByStatus(status),
    enabled: !!status,
  });
}

export function useTicketsByPriority(priority: Ticket['priority']) {
  return useQuery({
    queryKey: ticketKeys.list({ priority }),
    queryFn: () => ticketsApi.getTicketsByPriority(priority),
    enabled: !!priority,
  });
}

export function useTicketsBySource(source: Ticket['source']) {
  return useQuery({
    queryKey: ticketKeys.list({ source }),
    queryFn: () => ticketsApi.getTicketsBySource(source),
    enabled: !!source,
  });
}

export function useTicketsAssignedTo(userId: string) {
  return useQuery({
    queryKey: ticketKeys.list({ assignedTo: userId }),
    queryFn: () => ticketsApi.getTicketsAssignedTo(userId),
    enabled: !!userId,
  });
}

export function useTicketStats() {
  return useQuery({
    queryKey: ticketKeys.stats(),
    queryFn: ticketsApi.getTicketStats,
  });
}

// =====================================================
// TICKET MUTATIONS
// =====================================================

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketsApi.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats() });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TicketUpdate }) =>
      ticketsApi.updateTicket(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.setQueryData(ticketKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats() });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketsApi.deleteTicket,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.removeQueries({ queryKey: ticketKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats() });
    },
  });
}

export function useCreateTicketFromFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      meetingId, 
      meetingSummaryId, 
      feedback, 
      ticketData 
    }: { 
      meetingId: string; 
      meetingSummaryId: string; 
      feedback: string; 
      ticketData: Partial<TicketInsert>; 
    }) => ticketsApi.createTicketFromFeedback(meetingId, meetingSummaryId, feedback, ticketData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats() });
    },
  });
}

export function useCreateTicketsFromActionItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      meetingId, 
      meetingSummaryId, 
      actionItems, 
      ticketData 
    }: { 
      meetingId: string; 
      meetingSummaryId: string; 
      actionItems: string[]; 
      ticketData: Partial<TicketInsert>; 
    }) => ticketsApi.createTicketsFromActionItems(meetingId, meetingSummaryId, actionItems, ticketData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats() });
    },
  });
}

export function useBulkUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      ticketIds, 
      status 
    }: { 
      ticketIds: string[]; 
      status: Ticket['status']; 
    }) => ticketsApi.bulkUpdateStatus(ticketIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats() });
    },
  });
}
