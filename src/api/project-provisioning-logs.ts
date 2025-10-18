/**
 * API functions for project provisioning logs management
 */

import { supabase } from '@/lib/supabase';
import type { 
  ProjectProvisioningLog, 
  ProjectProvisioningLogInsert 
} from '@/types/database/project-provisioning-logs';

export const projectProvisioningLogsApi = {
  // Get logs for a specific request
  async getLogsByRequestId(requestId: string): Promise<ProjectProvisioningLog[]> {
    const { data, error } = await supabase
      .from('project_provisioning_logs')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch logs: ${error.message}`);
    }

    return data || [];
  },

  // Get logs by log level
  async getLogsByLevel(logLevel: ProjectProvisioningLog['log_level']): Promise<ProjectProvisioningLog[]> {
    const { data, error } = await supabase
      .from('project_provisioning_logs')
      .select('*')
      .eq('log_level', logLevel)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch logs by level: ${error.message}`);
    }

    return data || [];
  },

  // Create a new log entry
  async createLog(log: ProjectProvisioningLogInsert): Promise<ProjectProvisioningLog> {
    const { data, error } = await supabase
      .from('project_provisioning_logs')
      .insert(log)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create log: ${error.message}`);
    }

    return data;
  },

  // Create multiple log entries
  async createLogs(logs: ProjectProvisioningLogInsert[]): Promise<ProjectProvisioningLog[]> {
    const { data, error } = await supabase
      .from('project_provisioning_logs')
      .insert(logs)
      .select();

    if (error) {
      throw new Error(`Failed to create logs: ${error.message}`);
    }

    return data || [];
  },

  // Get recent logs for all requests
  async getRecentLogs(limit: number = 50): Promise<ProjectProvisioningLog[]> {
    const { data, error } = await supabase
      .from('project_provisioning_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent logs: ${error.message}`);
    }

    return data || [];
  },

  // Get error logs
  async getErrorLogs(): Promise<ProjectProvisioningLog[]> {
    const { data, error } = await supabase
      .from('project_provisioning_logs')
      .select('*')
      .eq('log_level', 'error')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch error logs: ${error.message}`);
    }

    return data || [];
  }
};
