/**
 * Execution Details Component
 * Detailed view of a single execution
 */

import { motion } from 'motion/react'
import { X, Copy, Clock, CheckCircle, XCircle, AlertCircle, Bot, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDistanceToNow, format } from 'date-fns'
import type { AgentExecution } from '@/types/database/agent-executions'

interface ExecutionDetailsProps {
  execution: AgentExecution
  onClose: () => void
}

export function ExecutionDetails({ execution, onClose }: ExecutionDetailsProps) {
  const getStatusIcon = (status: AgentExecution['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'running':
        return <Play className="w-5 h-5 text-blue-400" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />
      case 'awaiting_approval':
        return <AlertCircle className="w-5 h-5 text-orange-400" />
      case 'cancelled':
        return <Pause className="w-5 h-5 text-gray-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="bg-[#222426] border-[#26282A]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#53B7FF]/20 rounded-lg">
                <Bot className="w-5 h-5 text-[#53B7FF]" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Execution Details</CardTitle>
                <CardDescription className="text-[#A3A7AC]">
                  {execution.id}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="bg-transparent border-[#6B6E7C] text-[#A3A7AC] hover:bg-[#6B6E7C] hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(execution.status)}
              <Badge className={`${getStatusColor(execution.status)} border`}>
                {execution.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="text-sm text-[#A3A7AC]">
              {formatDistanceToNow(new Date(execution.created_at), { addSuffix: true })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#6B6E7C] uppercase tracking-wide text-xs">Duration</p>
              <p className="text-white font-medium">{formatDuration(execution.duration_ms)}</p>
            </div>
            <div>
              <p className="text-[#6B6E7C] uppercase tracking-wide text-xs">Total Tokens</p>
              <p className="text-white font-medium">{execution.total_tokens.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[#6B6E7C] uppercase tracking-wide text-xs">Confidence</p>
              <p className="text-white font-medium">
                {execution.confidence_score ? `${(execution.confidence_score * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[#6B6E7C] uppercase tracking-wide text-xs">Retry Count</p>
              <p className="text-white font-medium">{execution.retry_count}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#2A2E35] border-[#353945]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="input" className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white">
            Input
          </TabsTrigger>
          <TabsTrigger value="output" className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white">
            Output
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white">
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-[#222426] border-[#26282A]">
            <CardHeader>
              <CardTitle className="text-lg text-white">Execution Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-white">Created</p>
                    <p className="text-xs text-[#A3A7AC]">
                      {format(new Date(execution.created_at), 'PPpp')}
                    </p>
                  </div>
                </div>
                
                {execution.started_at && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-white">Started</p>
                      <p className="text-xs text-[#A3A7AC]">
                        {format(new Date(execution.started_at), 'PPpp')}
                      </p>
                    </div>
                  </div>
                )}

                {execution.completed_at && (
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      execution.status === 'completed' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-white">Completed</p>
                      <p className="text-xs text-[#A3A7AC]">
                        {format(new Date(execution.completed_at), 'PPpp')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {execution.requires_approval && (
            <Card className="bg-[#222426] border-[#26282A]">
              <CardHeader>
                <CardTitle className="text-lg text-white">Approval Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#A3A7AC]">Status:</span>
                    <Badge className={
                      execution.approval_status === 'approved' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : execution.approval_status === 'rejected'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }>
                      {execution.approval_status || 'Pending'}
                    </Badge>
                  </div>
                  {execution.approved_by && (
                    <div className="flex justify-between">
                      <span className="text-[#A3A7AC]">Approved by:</span>
                      <span className="text-white">{execution.approved_by}</span>
                    </div>
                  )}
                  {execution.approved_at && (
                    <div className="flex justify-between">
                      <span className="text-[#A3A7AC]">Approved at:</span>
                      <span className="text-white">
                        {format(new Date(execution.approved_at), 'PPpp')}
                      </span>
                    </div>
                  )}
                  {execution.approval_notes && (
                    <div>
                      <span className="text-[#A3A7AC]">Notes:</span>
                      <p className="text-white text-sm mt-1">{execution.approval_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="input" className="space-y-4">
          <Card className="bg-[#222426] border-[#26282A]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Input Data</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(formatJSON(execution.input_data))}
                  className="bg-transparent border-[#53B7FF] text-[#53B7FF] hover:bg-[#53B7FF] hover:text-white"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-[#181A1B] border border-[#353945] rounded-lg p-4 text-sm text-[#A3A7AC] overflow-x-auto">
                {formatJSON(execution.input_data)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="output" className="space-y-4">
          <Card className="bg-[#222426] border-[#26282A]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Output Data</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(formatJSON(execution.output_data))}
                  className="bg-transparent border-[#53B7FF] text-[#53B7FF] hover:bg-[#53B7FF] hover:text-white"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-[#181A1B] border border-[#353945] rounded-lg p-4 text-sm text-[#A3A7AC] overflow-x-auto">
                {formatJSON(execution.output_data)}
              </pre>
            </CardContent>
          </Card>

          {execution.error_data && Object.keys(execution.error_data).length > 0 && (
            <Card className="bg-[#222426] border-[#26282A]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-red-400">Error Data</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(formatJSON(execution.error_data))}
                    className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-[#181A1B] border border-red-500/30 rounded-lg p-4 text-sm text-red-400 overflow-x-auto">
                  {formatJSON(execution.error_data)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="bg-[#222426] border-[#26282A]">
            <CardHeader>
              <CardTitle className="text-lg text-white">Execution Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#A3A7AC]">Agent ID:</span>
                  <span className="text-white font-mono">{execution.agent_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A3A7AC]">Session ID:</span>
                  <span className="text-white font-mono">{execution.session_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A3A7AC]">Project ID:</span>
                  <span className="text-white font-mono">{execution.project_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A3A7AC]">Current Step:</span>
                  <span className="text-white font-mono">{execution.current_step || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A3A7AC]">Max Retries:</span>
                  <span className="text-white">{execution.max_retries}</span>
                </div>
                {execution.next_retry_at && (
                  <div className="flex justify-between">
                    <span className="text-[#A3A7AC]">Next Retry:</span>
                    <span className="text-white">
                      {format(new Date(execution.next_retry_at), 'PPpp')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}