/**
 * Database types for provisioning_webhooks table
 * Generated: 2024-12-20T16:00:00Z
 */

export interface ProvisioningWebhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret_token: string | null;
  headers: Record<string, any>;
  success_count: number;
  failure_count: number;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProvisioningWebhookInsert {
  id?: string;
  user_id: string;
  name: string;
  url: string;
  events: string[];
  is_active?: boolean;
  secret_token?: string | null;
  headers?: Record<string, any>;
  success_count?: number;
  failure_count?: number;
  last_triggered_at?: string | null;
}

export interface ProvisioningWebhookUpdate {
  name?: string;
  url?: string;
  events?: string[];
  is_active?: boolean;
  secret_token?: string | null;
  headers?: Record<string, any>;
  success_count?: number;
  failure_count?: number;
  last_triggered_at?: string | null;
}

// Supabase query result type
export type ProvisioningWebhookRow = ProvisioningWebhook;
