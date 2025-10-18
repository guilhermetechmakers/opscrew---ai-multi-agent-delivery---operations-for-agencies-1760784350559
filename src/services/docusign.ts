/**
 * DocuSign API integration service
 * Handles envelope creation, sending, and webhook processing
 */

import axios, { type AxiosInstance } from 'axios'
import type { Proposal, ProposalSignature } from '@/types/database'

export interface DocuSignConfig {
  baseUrl: string
  integratorKey: string
  userId: string
  privateKey: string
  expiresIn: number // in hours
}

export interface DocuSignEnvelope {
  envelopeId: string
  status: string
  statusChangedDateTime: string
  documentsUri: string
  recipientsUri: string
  attachmentsUri: string
  uri: string
  emailSubject: string
  emailBlurb: string
  envelopeIdStamping: string
  signingLocation: string
  authoritative: string
  envelopeDocuments: Array<{
    documentId: string
    name: string
    type: string
    uri: string
  }>
  envelopeAttachments: any[]
  customFields: any
  notification: any
  eventNotification: any
  documents: any[]
  recipients: any
  tabs: any
  signers: Array<{
    recipientId: string
    name: string
    email: string
    routingOrder: string
    status: string
    clientUserId?: string
  }>
  recipients: {
    signers: Array<{
      recipientId: string
      name: string
      email: string
      routingOrder: string
      status: string
      clientUserId?: string
    }>
  }
}

export interface DocuSignWebhookEvent {
  event: string
  envelopeId: string
  apiVersion: string
  uri: string
  retryCount: string
  configurationId: string
  generatedDateTime: string
  data: {
    accountId: string
    userId: string
    envelopeId: string
    envelopeSummary: {
      envelopeId: string
      status: string
      statusChangedDateTime: string
      documentsUri: string
      recipientsUri: string
      attachmentsUri: string
      uri: string
      emailSubject: string
      emailBlurb: string
      envelopeIdStamping: string
      signingLocation: string
      authoritative: string
      envelopeDocuments: any[]
      envelopeAttachments: any[]
      customFields: any
      notification: any
      eventNotification: any
      documents: any[]
      recipients: any
      tabs: any
    }
  }
}

export class DocuSignService {
  private client: AxiosInstance
  private config: DocuSignConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(config: DocuSignConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  /**
   * Get or refresh access token using JWT authentication
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    if (!this.validateConfig()) {
      throw new Error('DocuSign configuration is incomplete. Please check your environment variables.')
    }

    try {
      // In a real implementation, you would use a JWT library to create the assertion
      // For now, we'll use a mock implementation
      const assertion = this.createJWTAssertion()
      
      const response = await axios.post(`${this.config.baseUrl}/oauth/token`, {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000 // 10 second timeout
      })

      this.accessToken = response.data.access_token
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000 // 1 minute buffer

      return this.accessToken
    } catch (error) {
      this.handleApiError(error, 'authentication')
    }
  }

  /**
   * Create JWT assertion for DocuSign authentication
   * In production, use a proper JWT library like jsonwebtoken
   */
  private createJWTAssertion(): string {
    // This is a simplified implementation
    // In production, you should use a proper JWT library
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    }

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: this.config.integratorKey,
      sub: this.config.userId,
      aud: this.config.baseUrl,
      iat: now,
      exp: now + this.config.expiresIn * 3600,
      scope: 'signature impersonation'
    }

    // In production, sign with the private key
    // For now, return a mock token
    return 'mock-jwt-token'
  }

  /**
   * Validate DocuSign configuration
   */
  private validateConfig(): boolean {
    return !!(
      this.config.baseUrl &&
      this.config.integratorKey &&
      this.config.userId &&
      this.config.privateKey
    )
  }

  /**
   * Handle DocuSign API errors
   */
  private handleApiError(error: any, operation: string): never {
    let errorMessage = `DocuSign ${operation} failed`
    
    if (error.response) {
      const { status, data } = error.response
      errorMessage = `DocuSign API Error (${status}): ${data?.errorMessage || data?.message || 'Unknown error'}`
    } else if (error.request) {
      errorMessage = `DocuSign API Error: Network request failed - ${error.message}`
    } else {
      errorMessage = `DocuSign ${operation} Error: ${error.message}`
    }

    console.error(`DocuSign ${operation} error:`, error)
    throw new Error(errorMessage)
  }

  /**
   * Create an envelope for a proposal
   */
  async createEnvelope(
    proposal: Proposal,
    signers: Array<{ name: string; email: string; role?: string }>,
    documentContent: string
  ): Promise<DocuSignEnvelope> {
    try {
      if (!signers || signers.length === 0) {
        throw new Error('At least one signer is required')
      }

      if (!documentContent) {
        throw new Error('Document content is required')
      }

      const envelope = {
        emailSubject: `Please sign: ${proposal.title}`,
        emailBlurb: `Please review and sign the proposal for ${proposal.client_name}`,
        documents: [
          {
            documentId: '1',
            name: `${proposal.title}.pdf`,
            documentBase64: Buffer.from(documentContent).toString('base64')
          }
        ],
        recipients: {
          signers: signers.map((signer, index) => ({
            recipientId: (index + 1).toString(),
            name: signer.name,
            email: signer.email,
            routingOrder: (index + 1).toString(),
            status: 'created',
            clientUserId: signer.role || 'signer'
          }))
        },
        customFields: {
          textCustomFields: [
            {
              name: 'proposal_id',
              value: proposal.id
            }
          ]
        },
        status: 'sent'
      }

      const response = await this.client.post('/restapi/v2.1/accounts/{accountId}/envelopes', envelope, {
        timeout: 30000 // 30 second timeout for envelope creation
      })
      
      return response.data
    } catch (error) {
      this.handleApiError(error, 'envelope creation')
    }
  }

  /**
   * Send an envelope
   */
  async sendEnvelope(envelopeId: string): Promise<DocuSignEnvelope> {
    try {
      if (!envelopeId) {
        throw new Error('Envelope ID is required')
      }

      const response = await this.client.put(`/restapi/v2.1/accounts/{accountId}/envelopes/${envelopeId}`, {
        status: 'sent'
      }, {
        timeout: 15000 // 15 second timeout
      })
      
      return response.data
    } catch (error) {
      this.handleApiError(error, 'envelope sending')
    }
  }

  /**
   * Get envelope status
   */
  async getEnvelopeStatus(envelopeId: string): Promise<DocuSignEnvelope> {
    try {
      if (!envelopeId) {
        throw new Error('Envelope ID is required')
      }

      const response = await this.client.get(`/restapi/v2.1/accounts/{accountId}/envelopes/${envelopeId}`, {
        timeout: 10000 // 10 second timeout
      })
      
      return response.data
    } catch (error) {
      this.handleApiError(error, 'envelope status retrieval')
    }
  }

  /**
   * Get envelope documents
   */
  async getEnvelopeDocuments(envelopeId: string): Promise<Array<{ documentId: string; name: string; uri: string }>> {
    try {
      if (!envelopeId) {
        throw new Error('Envelope ID is required')
      }

      const response = await this.client.get(`/restapi/v2.1/accounts/{accountId}/envelopes/${envelopeId}/documents`, {
        timeout: 15000 // 15 second timeout
      })
      
      return response.data.envelopeDocuments || []
    } catch (error) {
      this.handleApiError(error, 'envelope documents retrieval')
    }
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: DocuSignWebhookEvent): Promise<{
    proposalId: string
    signatureUpdates: Array<{
      signatureId: string
      status: ProposalSignature['status']
      signedAt?: string
    }>
  }> {
    try {
      if (!event || !event.data) {
        throw new Error('Invalid webhook event data')
      }

      const { envelopeId, data } = event
      const { envelopeSummary } = data

      if (!envelopeId || !envelopeSummary) {
        throw new Error('Missing envelope ID or summary in webhook event')
      }

      // Extract proposal ID from envelope metadata or custom fields
      const proposalId = envelopeSummary.customFields?.textCustomFields?.find(
        (field: any) => field.name === 'proposal_id'
      )?.value

      if (!proposalId) {
        throw new Error('Proposal ID not found in envelope metadata')
      }

      // Map DocuSign status to our signature status
      const statusMap: Record<string, ProposalSignature['status']> = {
        'completed': 'signed',
        'declined': 'declined',
        'voided': 'expired',
        'sent': 'pending',
        'delivered': 'pending',
        'signed': 'signed',
        'expired': 'expired'
      }

      const signatureUpdates = envelopeSummary.recipients?.signers?.map((signer: any) => ({
        signatureId: signer.recipientId,
        status: statusMap[signer.status] || 'pending',
        signedAt: signer.status === 'completed' ? new Date().toISOString() : undefined
      })) || []

      return {
        proposalId,
        signatureUpdates
      }
    } catch (error) {
      console.error('Failed to process DocuSign webhook event:', error)
      throw new Error(`Failed to process DocuSign webhook event: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate signing URL for a recipient
   */
  async getRecipientView(
    envelopeId: string,
    recipientId: string,
    returnUrl: string
  ): Promise<{ url: string }> {
    try {
      if (!envelopeId || !recipientId || !returnUrl) {
        throw new Error('Envelope ID, recipient ID, and return URL are required')
      }

      const response = await this.client.post(`/restapi/v2.1/accounts/{accountId}/envelopes/${envelopeId}/views/recipient`, {
        authenticationMethod: 'none',
        email: '',
        userName: '',
        recipientId,
        returnUrl
      }, {
        timeout: 15000 // 15 second timeout
      })
      
      if (!response.data?.url) {
        throw new Error('No signing URL returned from DocuSign')
      }

      return { url: response.data.url }
    } catch (error) {
      this.handleApiError(error, 'recipient view generation')
    }
  }

  /**
   * Void an envelope
   */
  async voidEnvelope(envelopeId: string, reason: string): Promise<DocuSignEnvelope> {
    try {
      if (!envelopeId) {
        throw new Error('Envelope ID is required')
      }

      if (!reason || reason.trim().length === 0) {
        throw new Error('Void reason is required')
      }

      const response = await this.client.put(`/restapi/v2.1/accounts/{accountId}/envelopes/${envelopeId}`, {
        status: 'voided',
        voidedReason: reason.trim()
      }, {
        timeout: 15000 // 15 second timeout
      })
      
      return response.data
    } catch (error) {
      this.handleApiError(error, 'envelope voiding')
    }
  }
}

// Singleton instance
let docuSignService: DocuSignService | null = null

export function getDocuSignService(): DocuSignService {
  if (!docuSignService) {
    const config: DocuSignConfig = {
      baseUrl: import.meta.env.VITE_DOCUSIGN_BASE_URL || 'https://demo.docusign.net',
      integratorKey: import.meta.env.VITE_DOCUSIGN_INTEGRATOR_KEY || '',
      userId: import.meta.env.VITE_DOCUSIGN_USER_ID || '',
      privateKey: import.meta.env.VITE_DOCUSIGN_PRIVATE_KEY || '',
      expiresIn: 1 // 1 hour
    }

    if (!config.integratorKey || !config.userId || !config.privateKey) {
      throw new Error('DocuSign configuration is incomplete. Please check environment variables.')
    }

    docuSignService = new DocuSignService(config)
  }

  return docuSignService
}
