/**
 * API functions for project provisioning logs management
 */

import { supabase } from '@/lib/supabase';
import type { 
  ProjectProvisioningLog, 
  ProjectProvisioningLogInsert,
  ProvisioningProgress,
  ProvisioningStepLog
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
  async getLogsByLevel(level: ProjectProvisioningLog['log_level']): Promise<ProjectProvisioningLog[]> {
    const { data, error } = await supabase
      .from('project_provisioning_logs')
      .select('*')
      .eq('log_level', level)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch logs by level: ${error.message}`);
    }

    return data || [];
  },

  // Get recent logs
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

  // Log a provisioning step using the database function
  async logStep(
    userId: string,
    requestId: string,
    stepName: string,
    stepType: string,
    status: string,
    message: string,
    details: Record<string, any> = {},
    errorMessage?: string,
    errorDetails: Record<string, any> = {}
  ): Promise<string> {
    const { data, error } = await supabase
      .rpc('log_provisioning_step', {
        p_user_id: userId,
        p_request_id: requestId,
        p_step_name: stepName,
        p_step_type: stepType,
        p_status: status,
        p_message: message,
        p_details: details,
        p_error_message: errorMessage,
        p_error_details: errorDetails
      });

    if (error) {
      throw new Error(`Failed to log step: ${error.message}`);
    }

    return data;
  },

  // Get provisioning progress for a request
  async getProvisioningProgress(requestId: string): Promise<ProvisioningProgress | null> {
    try {
      // Get the request details
      const { data: request, error: requestError } = await supabase
        .from('project_provisioning_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        return null;
      }

      // Get all logs for this request
      const logs = await this.getLogsByRequestId(requestId);

      // Transform logs into step logs
      const steps: ProvisioningStepLog[] = logs.map(log => {
        const metadata = log.metadata || {};
        return {
          step_name: log.step_name,
          step_type: metadata.step_type || 'validation',
          status: metadata.status || 'completed',
          message: log.message,
          details: metadata.details || {},
          error_message: metadata.error_message,
          error_details: metadata.error_details || {},
          started_at: log.created_at,
          completed_at: log.duration_ms ? new Date(new Date(log.created_at).getTime() + log.duration_ms).toISOString() : undefined,
          duration_ms: log.duration_ms || undefined
        };
      });

      // Determine current step
      const currentStep = steps.length > 0 ? steps[steps.length - 1].step_name : 'Initializing';

      return {
        request_id: requestId,
        overall_status: request.status as any,
        progress_percentage: request.progress_percentage,
        current_step: currentStep,
        steps,
        started_at: request.created_at,
        completed_at: request.completed_at || undefined,
        error_message: request.error_message || undefined
      };
    } catch (error) {
      console.error('Failed to get provisioning progress:', error);
      return null;
    }
  },

  // Stream logs for real-time updates
  async streamLogs(requestId: string, onLog: (log: ProjectProvisioningLog) => void): Promise<() => void> {
    const subscription = supabase
      .channel(`provisioning-logs-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_provisioning_logs',
          filter: `request_id=eq.${requestId}`
        },
        (payload) => {
          onLog(payload.new as ProjectProvisioningLog);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  // Get error logs for a request
  async getErrorLogs(requestId: string): Promise<ProjectProvisioningLog[]> {
    const { data, error } = await supabase
      .from('project_provisioning_logs')
      .select('*')
      .eq('request_id', requestId)
      .eq('log_level', 'error')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch error logs: ${error.message}`);
    }

    return data || [];
  },

  // Clear logs for a request (for cleanup)
  async clearLogs(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('project_provisioning_logs')
      .delete()
      .eq('request_id', requestId);

    if (error) {
      throw new Error(`Failed to clear logs: ${error.message}`);
    }
  }
};
