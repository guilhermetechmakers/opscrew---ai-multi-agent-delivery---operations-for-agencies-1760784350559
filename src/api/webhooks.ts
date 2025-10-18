/**
 * Webhook handlers for external services
 * Handles DocuSign webhook events and other integrations
 */

import { processDocuSignWebhook } from './proposals'
import type { DocuSignWebhookEvent } from '@/services/docusign'

/**
 * Handle DocuSign webhook events
 */
export async function handleDocuSignWebhook(event: DocuSignWebhookEvent): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const result = await processDocuSignWebhook(event)
    return result
  } catch (error) {
    console.error('Failed to process DocuSign webhook:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Verify DocuSign webhook signature
 * In production, verify the webhook signature to ensure authenticity
 */
export function verifyDocuSignSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // In production, implement proper signature verification
  // For now, return true for development
  return true
}

/**
 * Process incoming webhook requests
 */
export async function processWebhook(
  provider: string,
  event: any,
  signature?: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    switch (provider) {
      case 'docusign':
        // Verify signature if provided
        if (signature && !verifyDocuSignSignature(JSON.stringify(event), signature, '')) {
          return {
            success: false,
            error: 'Invalid signature'
          }
        }
        
        return await handleDocuSignWebhook(event)
      
      default:
        return {
          success: false,
          error: `Unsupported webhook provider: ${provider}`
        }
    }
  } catch (error) {
    console.error('Failed to process webhook:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
