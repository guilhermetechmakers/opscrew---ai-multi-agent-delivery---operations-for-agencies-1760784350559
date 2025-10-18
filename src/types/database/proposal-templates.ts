/**
 * Database types for proposal_templates table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface ProposalTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: 'general' | 'web-development' | 'mobile-app' | 'consulting' | 'maintenance' | 'custom';
  status: 'active' | 'archived' | 'deleted';
  title_template: string;
  content_template: string;
  variables: Record<string, any>;
  sections: any[];
  is_public: boolean;
  usage_count: number;
  last_used_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProposalTemplateInsert {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  category?: 'general' | 'web-development' | 'mobile-app' | 'consulting' | 'maintenance' | 'custom';
  status?: 'active' | 'archived' | 'deleted';
  title_template: string;
  content_template: string;
  variables?: Record<string, any>;
  sections?: any[];
  is_public?: boolean;
  usage_count?: number;
  last_used_at?: string | null;
  metadata?: Record<string, any>;
}

export interface ProposalTemplateUpdate {
  name?: string;
  description?: string | null;
  category?: 'general' | 'web-development' | 'mobile-app' | 'consulting' | 'maintenance' | 'custom';
  status?: 'active' | 'archived' | 'deleted';
  title_template?: string;
  content_template?: string;
  variables?: Record<string, any>;
  sections?: any[];
  is_public?: boolean;
  usage_count?: number;
  last_used_at?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type ProposalTemplateRow = ProposalTemplate;