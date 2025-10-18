/**
 * Database types for intake_proposals table
 * Generated: 2024-12-20T15:00:00Z
 */

export interface IntakeProposal {
  id: string;
  session_id: string;
  user_id: string;
  title: string;
  content: string;
  version: number;
  proposal_status: 'drafting' | 'ready' | 'sent' | 'signed' | 'rejected' | 'expired';
  esign_status: 'not_sent' | 'sent' | 'signed' | 'declined' | 'expired';
  esign_document_id: string | null;
  esign_recipient_email: string | null;
  esign_sent_at: string | null;
  esign_signed_at: string | null;
  template_id: string | null;
  variables: Record<string, any>;
  approval_required: boolean;
  approval_status: 'not_required' | 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntakeProposalInsert {
  id?: string;
  session_id: string;
  user_id: string;
  title: string;
  content: string;
  version?: number;
  proposal_status?: 'drafting' | 'ready' | 'sent' | 'signed' | 'rejected' | 'expired';
  esign_status?: 'not_sent' | 'sent' | 'signed' | 'declined' | 'expired';
  esign_document_id?: string | null;
  esign_recipient_email?: string | null;
  esign_sent_at?: string | null;
  esign_signed_at?: string | null;
  template_id?: string | null;
  variables?: Record<string, any>;
  approval_required?: boolean;
  approval_status?: 'not_required' | 'pending' | 'approved' | 'rejected';
  approved_by?: string | null;
  approved_at?: string | null;
  metadata?: Record<string, any>;
}

export interface IntakeProposalUpdate {
  title?: string;
  content?: string;
  version?: number;
  proposal_status?: 'drafting' | 'ready' | 'sent' | 'signed' | 'rejected' | 'expired';
  esign_status?: 'not_sent' | 'sent' | 'signed' | 'declined' | 'expired';
  esign_document_id?: string | null;
  esign_recipient_email?: string | null;
  esign_sent_at?: string | null;
  esign_signed_at?: string | null;
  template_id?: string | null;
  variables?: Record<string, any>;
  approval_required?: boolean;
  approval_status?: 'not_required' | 'pending' | 'approved' | 'rejected';
  approved_by?: string | null;
  approved_at?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type IntakeProposalRow = IntakeProposal;
