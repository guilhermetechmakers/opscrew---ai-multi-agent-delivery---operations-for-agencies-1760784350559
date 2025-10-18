/**
 * Database types for portal_documents table
 * Generated: 2024-12-20T12:00:00Z
 */

export interface PortalDocument {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string | null;
  document_type: 'proposal' | 'sow' | 'design' | 'tutorial' | 'report' | 'other';
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  version: string;
  is_public: boolean;
  download_count: number;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortalDocumentInsert {
  id?: string;
  project_id: string;
  user_id: string;
  title: string;
  description?: string | null;
  document_type: 'proposal' | 'sow' | 'design' | 'tutorial' | 'report' | 'other';
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  version?: string;
  is_public?: boolean;
  download_count?: number;
  content?: string | null;
}

export interface PortalDocumentUpdate {
  title?: string;
  description?: string | null;
  document_type?: 'proposal' | 'sow' | 'design' | 'tutorial' | 'report' | 'other';
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  version?: string;
  is_public?: boolean;
  download_count?: number;
  content?: string | null;
}

// Supabase query result type
export type PortalDocumentRow = PortalDocument;
