/**
 * Database types for portal_comments table
 * Generated: 2024-12-20T12:00:00Z
 */

export interface PortalComment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  comment_type: 'feedback' | 'question' | 'suggestion' | 'issue' | 'praise';
  parent_id: string | null;
  thread_id: string | null;
  status: 'open' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_internal: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PortalCommentInsert {
  id?: string;
  project_id: string;
  user_id: string;
  content: string;
  comment_type?: 'feedback' | 'question' | 'suggestion' | 'issue' | 'praise';
  parent_id?: string | null;
  thread_id?: string | null;
  status?: 'open' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  is_internal?: boolean;
  metadata?: Record<string, any>;
}

export interface PortalCommentUpdate {
  content?: string;
  comment_type?: 'feedback' | 'question' | 'suggestion' | 'issue' | 'praise';
  parent_id?: string | null;
  thread_id?: string | null;
  status?: 'open' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  is_internal?: boolean;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type PortalCommentRow = PortalComment;
