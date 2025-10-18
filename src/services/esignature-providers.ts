/**
 * E-Signature Provider Service
 * Unified interface for different e-signature providers
 */

import { getDocuSignService } from './docusign'

export interface EsignatureProvider {
  name: string
  displayName: string
  logo: string
  isConfigured: boolean
  features: string[]
}

export interface EsignatureEnvelope {
  envelopeId: string
  status: string
  url?: string
  documents: Array<{
    documentId: string
    name: string
    url?: string
  }>
  recipients: Array<{
    recipientId: string
    name: string
    email: string
    status: string
    signedAt?: string
  }>
}

export interface EsignatureConfig {
  provider: string
  documentTitle: string
  documentContent: string
  signers: Array<{
    name: string
    email: string
    role?: string
    order?: number
  }>
  settings: {
    reminderFrequency?: number
    expirationDays?: number
    requireAuthentication?: boolean
    allowDecline?: boolean
    emailNotifications?: boolean
  }
}

export interface EsignatureResult {
  success: boolean
  envelopeId?: string
  url?: string
  error?: string
}

export class EsignatureProviderService {
  private providers: Map<string, any> = new Map()

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    try {
      const docuSignService = getDocuSignService()
      this.providers.set('docusign', docuSignService)
    } catch (error) {
      console.warn('DocuSign service not available:', error)
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): EsignatureProvider[] {
    return [
      {
        name: 'docusign',
        displayName: 'DocuSign',
        logo: '/logos/docusign.svg',
        isConfigured: this.providers.has('docusign'),
        features: [
          'Advanced authentication',
          'Bulk sending',
          'Template management',
          'Real-time notifications',
          'Mobile signing',
          'Audit trail'
        ]
      },
      {
        name: 'hellosign',
        displayName: 'HelloSign',
        logo: '/logos/hellosign.svg',
        isConfigured: false, // Not implemented yet
        features: [
          'Simple integration',
          'Template library',
          'Team collaboration',
          'API access'
        ]
      },
      {
        name: 'adobe-sign',
        displayName: 'Adobe Sign',
        logo: '/logos/adobe-sign.svg',
        isConfigured: false, // Not implemented yet
        features: [
          'Enterprise security',
          'Workflow automation',
          'Advanced analytics',
          'Mobile app'
        ]
      }
    ]
  }

  /**
   * Create an envelope for signing
   */
  async createEnvelope(config: EsignatureConfig): Promise<EsignatureResult> {
    const provider = this.providers.get(config.provider)
    
    if (!provider) {
      return {
        success: false,
        error: `Provider ${config.provider} is not configured or available`
      }
    }

    try {
      switch (config.provider) {
        case 'docusign':
          return await this.createDocuSignEnvelope(config, provider)
        default:
          return {
            success: false,
            error: `Provider ${config.provider} is not supported`
          }
      }
    } catch (error) {
      console.error(`Failed to create envelope with ${config.provider}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get envelope status
   */
  async getEnvelopeStatus(provider: string, envelopeId: string): Promise<EsignatureEnvelope | null> {
    const providerService = this.providers.get(provider)
    
    if (!providerService) {
      throw new Error(`Provider ${provider} is not configured`)
    }

    try {
      switch (provider) {
        case 'docusign':
          return await this.getDocuSignEnvelopeStatus(envelopeId, providerService)
        default:
          throw new Error(`Provider ${provider} is not supported`)
      }
    } catch (error) {
      console.error(`Failed to get envelope status from ${provider}:`, error)
      throw error
    }
  }

  /**
   * Get signing URL for a recipient
   */
  async getSigningUrl(
    provider: string, 
    envelopeId: string, 
    recipientId: string, 
    returnUrl: string
  ): Promise<{ url: string }> {
    const providerService = this.providers.get(provider)
    
    if (!providerService) {
      throw new Error(`Provider ${provider} is not configured`)
    }

    try {
      switch (provider) {
        case 'docusign':
          return await providerService.getRecipientView(envelopeId, recipientId, returnUrl)
        default:
          throw new Error(`Provider ${provider} is not supported`)
      }
    } catch (error) {
      console.error(`Failed to get signing URL from ${provider}:`, error)
      throw error
    }
  }

  /**
   * Void an envelope
   */
  async voidEnvelope(provider: string, envelopeId: string, reason: string): Promise<boolean> {
    const providerService = this.providers.get(provider)
    
    if (!providerService) {
      throw new Error(`Provider ${provider} is not configured`)
    }

    try {
      switch (provider) {
        case 'docusign':
          await providerService.voidEnvelope(envelopeId, reason)
          return true
        default:
          throw new Error(`Provider ${provider} is not supported`)
      }
    } catch (error) {
      console.error(`Failed to void envelope with ${provider}:`, error)
      throw error
    }
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(provider: string, event: any): Promise<{
    proposalId: string
    signatureUpdates: Array<{
      signatureId: string
      status: string
      signedAt?: string
    }>
  }> {
    const providerService = this.providers.get(provider)
    
    if (!providerService) {
      throw new Error(`Provider ${provider} is not configured`)
    }

    try {
      switch (provider) {
        case 'docusign':
          return await providerService.processWebhookEvent(event)
        default:
          throw new Error(`Provider ${provider} is not supported`)
      }
    } catch (error) {
      console.error(`Failed to process webhook event from ${provider}:`, error)
      throw error
    }
  }

  /**
   * Create DocuSign envelope
   */
  private async createDocuSignEnvelope(config: EsignatureConfig, provider: any): Promise<EsignatureResult> {
    try {
      const envelope = await provider.createEnvelope(
        {
          title: config.documentTitle,
          content: config.documentContent,
          client_name: config.signers[0]?.name || 'Client',
          client_email: config.signers[0]?.email || '',
          project_scope: null,
          budget_range: null,
          timeline: null,
          variables: {},
          status: 'draft',
          version: 1,
          requires_approval: false,
          approval_status: 'approved',
          esign_status: 'not_sent',
          esign_provider: 'docusign',
          metadata: {}
        },
        config.signers,
        config.documentContent
      )

      return {
        success: true,
        envelopeId: envelope.envelopeId,
        url: envelope.uri
      }
    } catch (error) {
      console.error('DocuSign envelope creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create DocuSign envelope'
      }
    }
  }

  /**
   * Get DocuSign envelope status
   */
  private async getDocuSignEnvelopeStatus(envelopeId: string, provider: any): Promise<EsignatureEnvelope> {
    try {
      const envelope = await provider.getEnvelopeStatus(envelopeId)
      
      return {
        envelopeId: envelope.envelopeId,
        status: envelope.status,
        url: envelope.uri,
        documents: envelope.envelopeDocuments?.map((doc: any) => ({
          documentId: doc.documentId,
          name: doc.name,
          url: doc.uri
        })) || [],
        recipients: envelope.recipients?.signers?.map((signer: any) => ({
          recipientId: signer.recipientId,
          name: signer.name,
          email: signer.email,
          status: signer.status,
          signedAt: signer.status === 'completed' ? new Date().toISOString() : undefined
        })) || []
      }
    } catch (error) {
      console.error('Failed to get DocuSign envelope status:', error)
      throw error
    }
  }
}

// Singleton instance
let esignatureProviderService: EsignatureProviderService | null = null

export function getEsignatureProviderService(): EsignatureProviderService {
  if (!esignatureProviderService) {
    esignatureProviderService = new EsignatureProviderService()
  }
  return esignatureProviderService
}