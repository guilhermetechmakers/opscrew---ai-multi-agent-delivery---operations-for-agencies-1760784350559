/**
 * API functions for portal documents management
 */

import { supabase } from '@/lib/supabase';
import type { PortalDocument, PortalDocumentInsert, PortalDocumentUpdate } from '@/types/database/portal-documents';

export const portalDocumentsApi = {
  // Get all documents for a project
  async getDocumentsByProject(projectId: string): Promise<PortalDocument[]> {
    const { data, error } = await supabase
      .from('portal_documents')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return data || [];
  },

  // Get document by ID
  async getDocument(id: string): Promise<PortalDocument | null> {
    const { data, error } = await supabase
      .from('portal_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Document not found
      }
      throw new Error(`Failed to fetch document: ${error.message}`);
    }

    return data;
  },

  // Create a new document
  async createDocument(document: PortalDocumentInsert): Promise<PortalDocument> {
    const { data, error } = await supabase
      .from('portal_documents')
      .insert(document)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }

    return data;
  },

  // Update a document
  async updateDocument(id: string, updates: PortalDocumentUpdate): Promise<PortalDocument> {
    const { data, error } = await supabase
      .from('portal_documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }

    return data;
  },

  // Delete a document
  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('portal_documents')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  },

  // Increment download count
  async incrementDownloadCount(id: string): Promise<void> {
    const { error } = await supabase
      .from('portal_documents')
      .update({ 
        download_count: supabase.raw('download_count + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to increment download count: ${error.message}`);
    }
  },

  // Get documents by type
  async getDocumentsByType(projectId: string, documentType: PortalDocument['document_type']): Promise<PortalDocument[]> {
    const { data, error } = await supabase
      .from('portal_documents')
      .select('*')
      .eq('project_id', projectId)
      .eq('document_type', documentType)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch documents by type: ${error.message}`);
    }

    return data || [];
  }
};
