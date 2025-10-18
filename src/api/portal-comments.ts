/**
 * API functions for portal comments management
 */

import { supabase } from '@/lib/supabase';
import type { PortalComment, PortalCommentInsert, PortalCommentUpdate } from '@/types/database/portal-comments';

export const portalCommentsApi = {
  // Get all comments for a project
  async getCommentsByProject(projectId: string): Promise<PortalComment[]> {
    const { data, error } = await supabase
      .from('portal_comments')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_internal', false)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }

    return data || [];
  },

  // Get comment by ID
  async getComment(id: string): Promise<PortalComment | null> {
    const { data, error } = await supabase
      .from('portal_comments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Comment not found
      }
      throw new Error(`Failed to fetch comment: ${error.message}`);
    }

    return data;
  },

  // Get threaded comments (with replies)
  async getThreadedComments(projectId: string): Promise<PortalComment[]> {
    const { data, error } = await supabase
      .from('portal_comments')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_internal', false)
      .is('parent_id', null) // Only root comments
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch threaded comments: ${error.message}`);
    }

    return data || [];
  },

  // Get replies for a comment
  async getCommentReplies(parentId: string): Promise<PortalComment[]> {
    const { data, error } = await supabase
      .from('portal_comments')
      .select('*')
      .eq('parent_id', parentId)
      .eq('is_internal', false)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch comment replies: ${error.message}`);
    }

    return data || [];
  },

  // Create a new comment
  async createComment(comment: PortalCommentInsert): Promise<PortalComment> {
    const { data, error } = await supabase
      .from('portal_comments')
      .insert(comment)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    return data;
  },

  // Update a comment
  async updateComment(id: string, updates: PortalCommentUpdate): Promise<PortalComment> {
    const { data, error } = await supabase
      .from('portal_comments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update comment: ${error.message}`);
    }

    return data;
  },

  // Delete a comment
  async deleteComment(id: string): Promise<void> {
    const { error } = await supabase
      .from('portal_comments')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  },

  // Get comments by status
  async getCommentsByStatus(projectId: string, status: PortalComment['status']): Promise<PortalComment[]> {
    const { data, error } = await supabase
      .from('portal_comments')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', status)
      .eq('is_internal', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch comments by status: ${error.message}`);
    }

    return data || [];
  },

  // Get comments by type
  async getCommentsByType(projectId: string, commentType: PortalComment['comment_type']): Promise<PortalComment[]> {
    const { data, error } = await supabase
      .from('portal_comments')
      .select('*')
      .eq('project_id', projectId)
      .eq('comment_type', commentType)
      .eq('is_internal', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch comments by type: ${error.message}`);
    }

    return data || [];
  }
};
