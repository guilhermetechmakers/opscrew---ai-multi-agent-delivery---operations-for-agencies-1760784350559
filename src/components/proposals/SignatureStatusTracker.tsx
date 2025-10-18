/**
 * Signature Status Tracker Component
 * Real-time tracking of signature status with detailed timeline
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  Download,
  Mail,
  ExternalLink,
  Calendar,
  User,
  Shield,
  Activity
} from 'lucide-react'
import type { ProposalSignature } from '@/types/database/proposal-signatures'

interface SignatureStatusTrackerProps {
  signatures: ProposalSignature[]
  onRefresh?: () => void
  onViewDocument?: (signatureId: string) => void
  onDownloadDocument?: (signatureId: string) => void
  onResendReminder?: (signatureId: string) => void
}

interface TimelineEvent {
  id: string
  type: 'sent' | 'opened' | 'signed' | 'declined' | 'expired' | 'reminder'
  title: string
  description: string
  timestamp: string
  signatureId?: string
  icon: React.ReactNode
  color: string
}

export function SignatureStatusTracker({ 
  signatures, 
  onRefresh, 
  onViewDocument, 
  onDownloadDocument, 
  onResendReminder 
}: SignatureStatusTrackerProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null)

  // Calculate overall progress
  const totalSignatures = signatures.length
  const completedSignatures = signatures.filter(s => s.status === 'signed').length
  const progressPercentage = totalSignatures > 0 ? (completedSignatures / totalSignatures) * 100 : 0

  // Generate timeline events
  const timelineEvents: TimelineEvent[] = signatures.flatMap(signature => {
    const events: TimelineEvent[] = []

    // Document sent event
    events.push({
      id: `${signature.id}-sent`,
      type: 'sent',
      title: 'Document Sent',
      description: `Sent to ${signature.signer_name} (${signature.signer_email})`,
      timestamp: signature.created_at,
      signatureId: signature.id,
      icon: <Mail className="h-4 w-4" />,
      color: 'bg-blue-500'
    })

    // Status-specific events
    if (signature.status === 'signed' && signature.signed_at) {
      events.push({
        id: `${signature.id}-signed`,
        type: 'signed',
        title: 'Document Signed',
        description: `Signed by ${signature.signer_name}`,
        timestamp: signature.signed_at,
        signatureId: signature.id,
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'bg-green-500'
      })
    } else if (signature.status === 'declined') {
      events.push({
        id: `${signature.id}-declined`,
        type: 'declined',
        title: 'Document Declined',
        description: `Declined by ${signature.signer_name}`,
        timestamp: signature.updated_at,
        signatureId: signature.id,
        icon: <XCircle className="h-4 w-4" />,
        color: 'bg-red-500'
      })
    } else if (signature.status === 'expired') {
      events.push({
        id: `${signature.id}-expired`,
        type: 'expired',
        title: 'Document Expired',
        description: `Expired for ${signature.signer_name}`,
        timestamp: signature.expires_at || signature.updated_at,
        signatureId: signature.id,
        icon: <Clock className="h-4 w-4" />,
        color: 'bg-orange-500'
      })
    }

    return events
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh?.()
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'expired':
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
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Signature Status Tracker</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track the progress of all signatures in real-time
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedSignatures} of {totalSignatures} signatures completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {signatures.map((signature, index) => (
          <motion.div
            key={signature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedSignature(selectedSignature === signature.id ? null : signature.id)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                      {signature.signer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{signature.signer_name}</p>
                      <p className="text-xs text-muted-foreground">{signature.signer_email}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(signature.status)}>
                    {getStatusIcon(signature.status)}
                    <span className="ml-1 capitalize">{signature.status}</span>
                  </Badge>
                </div>

                <div className="space-y-2">
                  {signature.signer_role && (
                    <p className="text-xs text-muted-foreground">
                      <User className="h-3 w-3 inline mr-1" />
                      {signature.signer_role}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Sent: {formatTimestamp(signature.created_at)}
                  </p>

                  {signature.signed_at && (
                    <p className="text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      Signed: {formatTimestamp(signature.signed_at)}
                    </p>
                  )}

                  {signature.expires_at && signature.status === 'pending' && (
                    <p className="text-xs text-orange-600">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Expires: {formatTimestamp(signature.expires_at)}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  {signature.status === 'signed' && signature.document_url && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewDocument?.(signature.id)
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDownloadDocument?.(signature.id)
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  
                  {signature.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        onResendReminder?.(signature.id)
                      }}
                    >
                      <Mail className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Signature Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${event.color}`}>
                  {event.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Signature Details Modal */}
      <AnimatePresence>
        {selectedSignature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedSignature(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const signature = signatures.find(s => s.id === selectedSignature)
                if (!signature) return null

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Signature Details</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSignature(null)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Signer</p>
                        <p className="text-sm text-muted-foreground">
                          {signature.signer_name} ({signature.signer_email})
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <Badge className={getStatusColor(signature.status)}>
                          {getStatusIcon(signature.status)}
                          <span className="ml-1 capitalize">{signature.status}</span>
                        </Badge>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Provider</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {signature.provider}
                        </p>
                      </div>

                      {signature.signed_at && (
                        <div>
                          <p className="text-sm font-medium">Signed At</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTimestamp(signature.signed_at)}
                          </p>
                        </div>
                      )}

                      {signature.expires_at && (
                        <div>
                          <p className="text-sm font-medium">Expires At</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTimestamp(signature.expires_at)}
                          </p>
                        </div>
                      )}

                      {signature.ip_address && (
                        <div>
                          <p className="text-sm font-medium">IP Address</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {signature.ip_address}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-4">
                      {signature.document_url && (
                        <Button size="sm" className="flex-1">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}