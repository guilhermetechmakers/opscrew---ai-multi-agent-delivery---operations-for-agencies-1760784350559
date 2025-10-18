/**
 * Agent Approval Panel Component
 * Handles human-in-the-loop approvals for agent executions
 */

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Eye,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { AgentOrchestrator } from '@/services/agent-orchestrator'
import type { AgentExecution } from '@/types/database/agent-executions'

interface AgentApprovalPanelProps {
  userId: string
  onApprovalChange?: () => void
}

interface ApprovalRequest {
  executionId: string
  agentName: string
  status: 'pending' | 'approved' | 'rejected'
  confidence: number
  output: Record<string, any>
  inputData: Record<string, any>
  createdAt: string
  requestedBy: string
  notes?: string
}

export function AgentApprovalPanel({ userId, onApprovalChange }: AgentApprovalPanelProps) {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedExecution, setSelectedExecution] = useState<ApprovalRequest | null>(null)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const orchestrator = AgentOrchestrator.getInstance()

  useEffect(() => {
    loadApprovalRequests()
  }, [userId])

  const loadApprovalRequests = async () => {
    try {
      setIsLoading(true)
      // This would typically come from an API call
      // For now, we'll simulate the data
      const mockRequests: ApprovalRequest[] = [
        {
          executionId: 'exec-1',
          agentName: 'Lead Qualifier',
          status: 'pending',
          confidence: 0.75,
          output: {
            response: 'I recommend proceeding with this lead. The budget aligns with our services and the timeline is realistic.',
            next_steps: ['Schedule discovery call', 'Prepare proposal', 'Follow up in 48 hours']
          },
          inputData: {
            company: 'TechCorp Inc',
            budget: '$50,000 - $75,000',
            timeline: '3-6 months',
            project_type: 'Web Application'
          },
          createdAt: new Date().toISOString(),
          requestedBy: 'system'
        },
        {
          executionId: 'exec-2',
          agentName: 'Sprint Planner',
          status: 'pending',
          confidence: 0.65,
          output: {
            sprint_plan: {
              duration: '2 weeks',
              stories: ['User authentication', 'Dashboard setup', 'API integration'],
              estimated_points: 21
            },
            risks: ['API dependencies may cause delays']
          },
          inputData: {
            project_requirements: 'Build a user dashboard with authentication',
            team_size: 3,
            available_hours: 120
          },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          requestedBy: 'system'
        }
      ]
      setApprovalRequests(mockRequests)
    } catch (error) {
      console.error('Failed to load approval requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproval = async (executionId: string, approved: boolean) => {
    try {
      setIsProcessing(true)
      
      await orchestrator.approveExecution(
        executionId,
        approved,
        userId,
        approvalNotes
      )

      // Update local state
      setApprovalRequests(prev => 
        prev.map(req => 
          req.executionId === executionId 
            ? { ...req, status: approved ? 'approved' : 'rejected', notes: approvalNotes }
            : req
        )
      )

      setSelectedExecution(null)
      setApprovalNotes('')
      onApprovalChange?.()
    } catch (error) {
      console.error('Failed to process approval:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-[#53B7FF]" />
        <span className="ml-2 text-[#A3A7AC]">Loading approval requests...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Agent Approvals</h2>
          <p className="text-[#A3A7AC]">Review and approve agent actions requiring human oversight</p>
        </div>
        <Button
          onClick={loadApprovalRequests}
          variant="outline"
          className="bg-transparent border-[#53B7FF] text-[#53B7FF] hover:bg-[#53B7FF] hover:text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#222426] border-[#26282A]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A3A7AC] text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {approvalRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#222426] border-[#26282A]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A3A7AC] text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-400">
                  {approvalRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#222426] border-[#26282A]">
          <CardContent className="p4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A3A7AC] text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-400">
                  {approvalRequests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Requests */}
      <div className="space-y-4">
        {approvalRequests.length === 0 ? (
          <Card className="bg-[#222426] border-[#26282A] text-center py-8">
            <CardContent>
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <CardTitle className="text-xl text-white mb-2">No pending approvals</CardTitle>
              <CardDescription className="text-[#A3A7AC]">
                All agent actions have been reviewed and processed
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          approvalRequests.map((request) => (
            <motion.div
              key={request.executionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-[#222426] border-[#26282A] hover:bg-[#232527] transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-white">{request.agentName}</CardTitle>
                      <CardDescription className="text-[#A3A7AC]">
                        Execution ID: {request.executionId}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Confidence Score */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#A3A7AC]">Confidence Score</span>
                      <span className={`font-semibold ${getConfidenceColor(request.confidence)}`}>
                        {(request.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={request.confidence * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Output Preview */}
                  <div>
                    <p className="text-[#A3A7AC] text-sm mb-2">Agent Output</p>
                    <div className="bg-[#1A1C1D] rounded-lg p-3 max-h-32 overflow-y-auto">
                      <pre className="text-white text-sm whitespace-pre-wrap">
                        {JSON.stringify(request.output, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Input Data */}
                  <div>
                    <p className="text-[#A3A7AC] text-sm mb-2">Input Data</p>
                    <div className="bg-[#1A1C1D] rounded-lg p-3 max-h-24 overflow-y-auto">
                      <pre className="text-white text-sm whitespace-pre-wrap">
                        {JSON.stringify(request.inputData, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-[#A3A7AC]">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{request.requestedBy}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(request.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex items-center space-x-4 pt-4 border-t border-[#353945]">
                      <Button
                        onClick={() => setSelectedExecution(request)}
                        variant="outline"
                        className="bg-transparent border-[#6B6E7C] text-[#A3A7AC] hover:bg-[#6B6E7C] hover:text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review Details
                      </Button>
                      <Button
                        onClick={() => handleApproval(request.executionId, true)}
                        disabled={isProcessing}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleApproval(request.executionId, false)}
                        disabled={isProcessing}
                        variant="outline"
                        className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                      >
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {request.status !== 'pending' && request.notes && (
                    <div className="pt-4 border-t border-[#353945]">
                      <p className="text-[#A3A7AC] text-sm mb-1">Approval Notes</p>
                      <p className="text-white text-sm">{request.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Approval Modal */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl bg-[#222426] border-[#26282A] text-white">
            <CardHeader>
              <CardTitle className="text-xl">Review Agent Execution</CardTitle>
              <CardDescription className="text-[#A3A7AC]">
                Agent: {selectedExecution.agentName} | Confidence: {(selectedExecution.confidence * 100).toFixed(1)}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="approval-notes" className="text-white">Approval Notes (Optional)</Label>
                <Textarea
                  id="approval-notes"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  className="bg-[#1A1C1D] border-[#353945] text-white placeholder-[#6B6E7C] mt-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  onClick={() => setSelectedExecution(null)}
                  variant="outline"
                  className="bg-transparent border-[#6B6E7C] text-[#A3A7AC] hover:bg-[#6B6E7C] hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApproval(selectedExecution.executionId, true)}
                  disabled={isProcessing}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleApproval(selectedExecution.executionId, false)}
                  disabled={isProcessing}
                  variant="outline"
                  className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}