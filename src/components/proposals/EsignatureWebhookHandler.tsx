/**
 * E-Signature Webhook Handler Component
 * Handles real-time webhook events from e-signature providers
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Webhook, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Activity,
  Shield,
  Zap,
  Eye,
  Trash2
} from 'lucide-react'
import { useProcessDocuSignWebhook } from '@/hooks/useProposals'
import { useProposalSignatures } from '@/hooks/useProposalSignatures'
import { getEsignatureProviderService } from '@/services/esignature-providers'
import type { Proposal } from '@/types/database/proposals'

interface EsignatureWebhookHandlerProps {
  proposal: Proposal
  onStatusChange?: (proposal: Proposal) => void
}

interface WebhookEvent {
  id: string
  provider: string
  eventType: string
  envelopeId: string
  status: 'pending' | 'processing' | 'success' | 'error'
  timestamp: string
  data: any
  error?: string
}

export function EsignatureWebhookHandler({ proposal, onStatusChange }: EsignatureWebhookHandlerProps) {
  const processWebhook = useProcessDocuSignWebhook()
  const { data: signatures = [] } = useProposalSignatures(proposal.id)
  
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null)

  // Simulate webhook events (in production, these would come from your backend)
  useEffect(() => {
    const mockEvents: WebhookEvent[] = [
      {
        id: '1',
        provider: 'docusign',
        eventType: 'envelope-sent',
        envelopeId: proposal.esign_envelope_id || 'env_123',
        status: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        data: {
          envelopeId: proposal.esign_envelope_id || 'env_123',
          status: 'sent',
          recipients: signatures.map(sig => ({
            recipientId: sig.signature_id || '1',
            name: sig.signer_name,
            email: sig.signer_email,
            status: sig.status
          }))
        }
      },
      {
        id: '2',
        provider: 'docusign',
        eventType: 'recipient-signed',
        envelopeId: proposal.esign_envelope_id || 'env_123',
        status: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        data: {
          envelopeId: proposal.esign_envelope_id || 'env_123',
          recipientId: signatures[0]?.signature_id || '1',
          status: 'signed',
          signedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        }
      }
    ]

    setWebhookEvents(mockEvents)
  }, [proposal.esign_envelope_id, signatures])

  const handleProcessWebhook = async (event: WebhookEvent) => {
    setIsProcessing(true)
    try {
      const result = await processWebhook.mutateAsync(event.data)
      
      if (result.success) {
        setWebhookEvents(prev => 
          prev.map(e => 
            e.id === event.id 
              ? { ...e, status: 'success' as const }
              : e
          )
        )
        onStatusChange?.(proposal)
      } else {
        setWebhookEvents(prev => 
          prev.map(e => 
            e.id === event.id 
              ? { ...e, status: 'error' as const, error: result.error }
              : e
          )
        )
      }
    } catch (error) {
      setWebhookEvents(prev => 
        prev.map(e => 
          e.id === event.id 
            ? { 
                ...e, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              }
            : e
        )
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetryEvent = async (event: WebhookEvent) => {
    setWebhookEvents(prev => 
      prev.map(e => 
        e.id === event.id 
          ? { ...e, status: 'pending' as const, error: undefined }
          : e
      )
    )
    await handleProcessWebhook(event)
  }

  const handleDeleteEvent = (eventId: string) => {
    setWebhookEvents(prev => prev.filter(e => e.id !== eventId))
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'envelope-sent':
        return <Zap className="h-4 w-4" />
      case 'recipient-signed':
        return <CheckCircle className="h-4 w-4" />
      case 'envelope-completed':
        return <CheckCircle className="h-4 w-4" />
      case 'envelope-declined':
        return <XCircle className="h-4 w-4" />
      case 'envelope-voided':
        return <XCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getEventColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getEventDescription = (eventType: string) => {
    switch (eventType) {
      case 'envelope-sent':
        return 'Envelope sent to recipients'
      case 'recipient-signed':
        return 'Recipient completed signing'
      case 'envelope-completed':
        return 'All recipients have signed'
      case 'envelope-declined':
        return 'Envelope was declined'
      case 'envelope-voided':
        return 'Envelope was voided'
      default:
        return 'Unknown event type'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Webhook className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Webhook Handler</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time processing of e-signature events
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Webhook Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Events ({webhookEvents.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {webhookEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
                      {getEventIcon(event.eventType)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {getEventDescription(event.eventType)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(event.timestamp)}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        Envelope: {event.envelopeId}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getEventColor(event.status)}>
                      {event.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {event.status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                      {event.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                      {event.status === 'pending' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      <span className="capitalize">{event.status}</span>
                    </Badge>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      {event.status === 'error' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetryEvent(event)}
                          disabled={isProcessing}
                        >
                          <RefreshCw className={`h-3 w-3 ${isProcessing ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Event Details</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvent(null)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Event Type</p>
                    <p className="text-sm text-muted-foreground">
                      {getEventDescription(selectedEvent.eventType)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge className={getEventColor(selectedEvent.status)}>
                      {selectedEvent.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {selectedEvent.status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                      {selectedEvent.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                      {selectedEvent.status === 'pending' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      <span className="capitalize">{selectedEvent.status}</span>
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Provider</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedEvent.provider}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Envelope ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {selectedEvent.envelopeId}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Timestamp</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimestamp(selectedEvent.timestamp)}
                    </p>
                  </div>

                  {selectedEvent.error && (
                    <div>
                      <p className="text-sm font-medium text-red-600">Error</p>
                      <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
                        {selectedEvent.error}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium">Event Data</p>
                    <pre className="text-xs text-muted-foreground bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedEvent.data, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  {selectedEvent.status === 'error' && (
                    <Button
                      onClick={() => {
                        handleRetryEvent(selectedEvent)
                        setSelectedEvent(null)
                      }}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                      Retry Processing
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}