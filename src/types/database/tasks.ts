/**
 * Database types for tasks table
 * Generated: 2024-12-20T12:00:00Z
 */

export interface Task {
  id: string;
  user_id: string;
  project_id: string;
  sprint_id?: string | null;
  title: string;
  description: string | null;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string | null;
  assignee_name?: string | null;
  due_date?: string | null;
  story_points?: number | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  acceptance_criteria: string[];
  ai_generated: boolean;
  ai_confidence?: number | null;
  ai_notes?: string | null;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  external_links: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  id?: string;
  user_id: string;
  project_id: string;
  sprint_id?: string | null;
  title: string;
  description?: string | null;
  status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string | null;
  assignee_name?: string | null;
  due_date?: string | null;
  story_points?: number | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  acceptance_criteria?: string[];
  ai_generated?: boolean;
  ai_confidence?: number | null;
  ai_notes?: string | null;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  external_links?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  metadata?: Record<string, any>;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string | null;
  assignee_name?: string | null;
  due_date?: string | null;
  story_points?: number | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  acceptance_criteria?: string[];
  ai_confidence?: number | null;
  ai_notes?: string | null;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  external_links?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type TaskRow = Task;