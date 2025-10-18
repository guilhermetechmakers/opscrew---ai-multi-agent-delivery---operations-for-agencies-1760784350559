/**
 * Database types for projects table
 * Generated: 2024-12-20T12:00:00Z
 */

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  client_name: string | null;
  client_email: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  currency: string;
  tech_stack: string[];
  repository_url: string | null;
  staging_url: string | null;
  production_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProjectInsert {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  client_name?: string | null;
  client_email?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  currency?: string;
  tech_stack?: string[];
  repository_url?: string | null;
  staging_url?: string | null;
  production_url?: string | null;
  metadata?: Record<string, any>;
}

export interface ProjectUpdate {
  name?: string;
  description?: string | null;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  client_name?: string | null;
  client_email?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  currency?: string;
  tech_stack?: string[];
  repository_url?: string | null;
  staging_url?: string | null;
  production_url?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type ProjectRow = Project;
