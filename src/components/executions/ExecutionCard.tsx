/**
 * Execution Card Component
 * Displays execution information in a compact card format
 */

import { motion } from 'motion/react'
import { Play, Pause, RotateCcw, Clock, CheckCircle, XCircle, AlertCircle, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import type { AgentExecution } from '@/types/database/agent-executions'

interface ExecutionCardProps {
  execution: AgentExecution
  onCancel: () => void
  onRetry: () => void
}

export function ExecutionCard({ execution, onCancel, onRetry }: ExecutionCardProps) {
  const getStatusIcon = (status: AgentExecution['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'running':
        return <Play className="w-4 h-4 text-blue-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'awaiting_approval':
        return <AlertCircle className="w-4 h-4 text-orange-400" />
      case 'cancelled':
        return <Pause className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: AgentExecution['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'running':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'awaiting_approval':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const getInputPreview = () => {
    if (execution.input_data?.message) {
      return execution.input_data.message.length > 100
        ? `${execution.input_data.message.substring(0, 100)}...`
        : execution.input_data.message
    }
    return 'No input data'
  }

  const getOutputPreview = () => {
    if (execution.output_data?.response) {
      return execution.output_data.response.length > 100
        ? `${execution.output_data.response.substring(0, 100)}...`
        : execution.output_data.response
    }
    if (execution.output_data && Object.keys(execution.output_data).length > 0) {
      return 'Output data available'
    }
    return 'No output data'
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#53B7FF]/20 rounded-lg">
            <Bot className="w-4 h-4 text-[#53B7FF]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-white">Execution {execution.id.slice(0, 8)}</h3>
              <Badge className={`${getStatusColor(execution.status)} border`}>
                {execution.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-[#A3A7AC]">
              {formatDistanceToNow(new Date(execution.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {getStatusIcon(execution.status)}
        </div>
      </div>

      {/* Input/Output Preview */}
      <div className="space-y-2">
        <div>
          <p className="text-xs text-[#6B6E7C] uppercase tracking-wide">Input</p>
          <p className="text-sm text-[#A3A7AC]">{getInputPreview()}</p>
        </div>
        {execution.status === 'completed' && (
          <div>
            <p className="text-xs text-[#6B6E7C] uppercase tracking-wide">Output</p>
            <p className="text-sm text-[#A3A7AC]">{getOutputPreview()}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-[#A3A7AC]">
        <div className="flex items-center space-x-4">
          <span>Duration: {formatDuration(execution.duration_ms)}</span>
          {execution.total_tokens > 0 && (
            <span>Tokens: {execution.total_tokens.toLocaleString()}</span>
          )}
          {execution.confidence_score && (
            <span>Confidence: {(execution.confidence_score * 100).toFixed(0)}%</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {execution.status === 'running' && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onCancel()
            }}
            className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
          >
            <Pause className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        )}
        
        {execution.status === 'failed' && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onRetry()
            }}
            className="bg-[#53B7FF]/20 border-[#53B7FF]/30 text-[#53B7FF] hover:bg-[#53B7FF]/30"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}

        {execution.status === 'awaiting_approval' && (
          <Button
            size="sm"
            variant="outline"
            className="bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            Review
          </Button>
        )}
      </div>
    </div>
  )
}