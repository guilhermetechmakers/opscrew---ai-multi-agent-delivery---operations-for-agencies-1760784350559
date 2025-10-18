/**
 * Database types for proposals table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface Proposal {
  id: string;
  user_id: string;
  template_id: string | null;
  title: string;
  client_name: string;
  client_email: string | null;
  project_scope: string | null;
  budget_range: string | null;
  timeline: string | null;
  content: string;
  variables: Record<string, any>;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'signed' | 'rejected' | 'archived';
  version: number;
  requires_approval: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  approval_notes: string | null;
  esign_status: 'not_sent' | 'sent' | 'signed' | 'declined' | 'expired';
  esign_provider: string | null;
  esign_envelope_id: string | null;
  esign_signed_at: string | null;
  esign_document_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
}

export interface ProposalInsert {
  id?: string;
  user_id: string;
  template_id?: string | null;
  title: string;
  client_name: string;
  client_email?: string | null;
  project_scope?: string | null;
  budget_range?: string | null;
  timeline?: string | null;
  content: string;
  variables?: Record<string, any>;
  status?: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'signed' | 'rejected' | 'archived';
  version?: number;
  requires_approval?: boolean;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string | null;
  approved_at?: string | null;
  approval_notes?: string | null;
  esign_status?: 'not_sent' | 'sent' | 'signed' | 'declined' | 'expired';
  esign_provider?: string | null;
  esign_envelope_id?: string | null;
  esign_signed_at?: string | null;
  esign_document_url?: string | null;
  metadata?: Record<string, any>;
  sent_at?: string | null;
}

export interface ProposalUpdate {
  title?: string;
  client_name?: string;
  client_email?: string | null;
  project_scope?: string | null;
  budget_range?: string | null;
  timeline?: string | null;
  content?: string;
  variables?: Record<string, any>;
  status?: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'signed' | 'rejected' | 'archived';
  version?: number;
  requires_approval?: boolean;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string | null;
  approved_at?: string | null;
  approval_notes?: string | null;
  esign_status?: 'not_sent' | 'sent' | 'signed' | 'declined' | 'expired';
  esign_provider?: string | null;
  esign_envelope_id?: string | null;
  esign_signed_at?: string | null;
  esign_document_url?: string | null;
  metadata?: Record<string, any>;
  sent_at?: string | null;
}

// Supabase query result type
export type ProposalRow = Proposal;