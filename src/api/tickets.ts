/**
 * API functions for tickets operations
 * Handles CRUD operations for tickets created from meeting feedback
 */

import { supabase } from '@/lib/supabase';
import type { 
  Ticket, 
  TicketInsert, 
  TicketUpdate 
} from '@/types/database';

export const ticketsApi = {
  // Get all tickets for the current user
  async getTickets(): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get a single ticket by ID
  async getTicket(id: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new ticket
  async createTicket(ticket: TicketInsert): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .insert(ticket)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a ticket
  async updateTicket(id: string, updates: TicketUpdate): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a ticket
  async deleteTicket(id: string): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get tickets by project
  async getTicketsByProject(projectId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get tickets by meeting
  async getTicketsByMeeting(meetingId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get tickets by status
  async getTicketsByStatus(status: Ticket['status']): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get tickets by priority
  async getTicketsByPriority(priority: Ticket['priority']): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('priority', priority)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get tickets by source
  async getTicketsBySource(source: Ticket['source']): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('source', source)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get tickets assigned to user
  async getTicketsAssignedTo(userId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create ticket from meeting feedback
  async createTicketFromFeedback(
    meetingId: string,
    meetingSummaryId: string,
    feedback: string,
    ticketData: Partial<TicketInsert>
  ): Promise<Ticket> {
    const ticket: TicketInsert = {
      user_id: ticketData.user_id || '',
      project_id: ticketData.project_id || null,
      meeting_id: meetingId,
      meeting_summary_id: meetingSummaryId,
      title: ticketData.title || 'Meeting Feedback Ticket',
      description: feedback,
      ticket_type: ticketData.ticket_type || 'task',
      priority: ticketData.priority || 'medium',
      status: 'open',
      source: 'meeting_feedback',
      source_meeting_feedback: feedback,
      ...ticketData
    };

    return this.createTicket(ticket);
  },

  // Create tickets from action items
  async createTicketsFromActionItems(
    meetingId: string,
    meetingSummaryId: string,
    actionItems: string[],
    ticketData: Partial<TicketInsert>
  ): Promise<Ticket[]> {
    const tickets: TicketInsert[] = actionItems.map((item, index) => ({
      user_id: ticketData.user_id || '',
      project_id: ticketData.project_id || null,
      meeting_id: meetingId,
      meeting_summary_id: meetingSummaryId,
      title: `Action Item: ${item.substring(0, 50)}${item.length > 50 ? '...' : ''}`,
      description: item,
      ticket_type: ticketData.ticket_type || 'task',
      priority: ticketData.priority || 'medium',
      status: 'open',
      source: 'action_item',
      ...ticketData
    }));

    const { data, error } = await supabase
      .from('tickets')
      .insert(tickets)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Bulk update ticket status
  async bulkUpdateStatus(ticketIds: string[], status: Ticket['status']): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .update({ status })
      .in('id', ticketIds)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Get ticket statistics
  async getTicketStats(): Promise<{
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
    by_priority: Record<string, number>;
    by_type: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('tickets')
      .select('status, priority, ticket_type');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      by_priority: {} as Record<string, number>,
      by_type: {} as Record<string, number>
    };

    data?.forEach(ticket => {
      // Count by status
      if (ticket.status === 'open') stats.open++;
      else if (ticket.status === 'in_progress') stats.in_progress++;
      else if (ticket.status === 'resolved') stats.resolved++;
      else if (ticket.status === 'closed') stats.closed++;

      // Count by priority
      stats.by_priority[ticket.priority] = (stats.by_priority[ticket.priority] || 0) + 1;

      // Count by type
      stats.by_type[ticket.ticket_type] = (stats.by_type[ticket.ticket_type] || 0) + 1;
    });

    return stats;
  }
};
