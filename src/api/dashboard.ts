/**
 * API functions for dashboard statistics and data
 */

import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/database/projects';
import type { Proposal } from '@/types/database/proposals';
import type { Ticket } from '@/types/database/tickets';
import type { AgentExecution } from '@/types/database/agent-executions';

export interface DashboardStats {
  activeProjects: number;
  pendingProposals: number;
  openTickets: number;
  slaHealth: number;
  projectsChange: number;
  proposalsChange: number;
  ticketsChange: number;
  slaChange: number;
}

export interface ProjectWithProgress extends Project {
  progress: number;
  teamSize: number;
  daysRemaining: number | null;
}

export interface AgentActivity {
  id: string;
  agentName: string;
  action: string;
  time: string;
  confidence: number;
  status: 'completed' | 'running' | 'failed' | 'awaiting_approval';
  projectName?: string;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  // Get current counts
  const [projectsResult, proposalsResult, ticketsResult] = await Promise.all([
    supabase
      .from('projects')
      .select('status, created_at')
      .eq('user_id', userId),
    supabase
      .from('proposals')
      .select('status, created_at')
      .eq('user_id', userId),
    supabase
      .from('tickets')
      .select('status, created_at, sla_deadline')
      .eq('user_id', userId)
  ]);

  if (projectsResult.error) throw new Error(`Failed to fetch projects: ${projectsResult.error.message}`);
  if (proposalsResult.error) throw new Error(`Failed to fetch proposals: ${proposalsResult.error.message}`);
  if (ticketsResult.error) throw new Error(`Failed to fetch tickets: ${ticketsResult.error.message}`);

  const projects = projectsResult.data || [];
  const proposals = proposalsResult.data || [];
  const tickets = ticketsResult.data || [];

  // Calculate current stats
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const pendingProposals = proposals.filter(p => p.status === 'pending_approval' || p.status === 'draft').length;
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  // Calculate SLA health (tickets within SLA)
  const now = new Date();
  const ticketsWithinSLA = tickets.filter(t => {
    if (!t.sla_deadline) return true;
    return new Date(t.sla_deadline) > now;
  }).length;
  const slaHealth = tickets.length > 0 ? Math.round((ticketsWithinSLA / tickets.length) * 100) : 100;

  // Calculate changes (simplified - comparing last 7 days vs previous 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const recentProjects = projects.filter(p => new Date(p.created_at) >= sevenDaysAgo).length;
  const previousProjects = projects.filter(p => {
    const created = new Date(p.created_at);
    return created >= fourteenDaysAgo && created < sevenDaysAgo;
  }).length;
  const projectsChange = previousProjects > 0 ? Math.round(((recentProjects - previousProjects) / previousProjects) * 100) : 0;

  const recentProposals = proposals.filter(p => new Date(p.created_at) >= sevenDaysAgo).length;
  const previousProposals = proposals.filter(p => {
    const created = new Date(p.created_at);
    return created >= fourteenDaysAgo && created < sevenDaysAgo;
  }).length;
  const proposalsChange = previousProposals > 0 ? Math.round(((recentProposals - previousProposals) / previousProposals) * 100) : 0;

  const recentTickets = tickets.filter(t => new Date(t.created_at) >= sevenDaysAgo).length;
  const previousTickets = tickets.filter(t => {
    const created = new Date(t.created_at);
    return created >= fourteenDaysAgo && created < sevenDaysAgo;
  }).length;
  const ticketsChange = previousTickets > 0 ? Math.round(((recentTickets - previousTickets) / previousTickets) * 100) : 0;

  // SLA change (simplified)
  const slaChange = 2; // Mock positive change

  return {
    activeProjects,
    pendingProposals,
    openTickets,
    slaHealth,
    projectsChange,
    proposalsChange,
    ticketsChange,
    slaChange
  };
}

/**
 * Get recent projects with progress
 */
export async function getRecentProjects(userId: string, limit: number = 5): Promise<ProjectWithProgress[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent projects: ${error.message}`);
  }

  // Mock progress calculation (in real app, this would come from tasks/sprints)
  return (data || []).map(project => ({
    ...project,
    progress: Math.floor(Math.random() * 100),
    teamSize: Math.floor(Math.random() * 5) + 1,
    daysRemaining: project.end_date ? 
      Math.ceil((new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
      null
  }));
}

/**
 * Get agent activity feed
 */
export async function getAgentActivity(userId: string, limit: number = 10): Promise<AgentActivity[]> {
  const { data, error } = await supabase
    .from('agent_executions')
    .select(`
      id,
      status,
      confidence_score,
      created_at,
      output_data,
      agents!inner(name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch agent activity: ${error.message}`);
  }

  // Transform the data
  return (data || []).map(execution => {
    const agentName = (execution.agents as any)?.name || 'Unknown Agent';
    const action = execution.output_data?.action || 'Completed task';
    const projectName = execution.output_data?.project_name;
    
    // Calculate time ago
    const createdAt = new Date(execution.created_at);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeAgo: string;
    if (diffMins < 1) timeAgo = 'Just now';
    else if (diffMins < 60) timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    else timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return {
      id: execution.id,
      agentName,
      action,
      time: timeAgo,
      confidence: execution.confidence_score || 0,
      status: execution.status as 'completed' | 'running' | 'failed' | 'awaiting_approval',
      projectName
    };
  });
}

/**
 * Get project progress data for charts
 */
export async function getProjectProgressData(userId: string): Promise<{ name: string; value: number; color: string }[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('status')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch project progress data: ${error.message}`);
  }

  const projects = data || [];
  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusColors = {
    planning: '#F7C948',
    active: '#2FE6A6',
    on_hold: '#FF6B6B',
    completed: '#48B7F5',
    cancelled: '#A3A7AC'
  };

  return Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: count,
    color: statusColors[status as keyof typeof statusColors] || '#A3A7AC'
  }));
}
