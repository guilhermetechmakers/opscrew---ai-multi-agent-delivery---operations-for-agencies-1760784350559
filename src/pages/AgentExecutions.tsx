/**
 * Agent Executions Page
 * Monitor and manage agent execution runs
 */

import { useState } from 'react'
import { motion } from 'motion/react'
import { Play, Pause, RotateCcw, Eye, Filter, Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useExecutions, useCancelExecution, useRetryExecution } from '@/hooks/useAgentExecutions'
import { useAgents } from '@/hooks/useAgents'
import { ExecutionCard } from '@/components/executions/ExecutionCard'
import { ExecutionDetails } from '@/components/executions/ExecutionDetails'
import { ExecutionStats } from '@/components/executions/ExecutionStats'
import type { AgentExecution } from '@/types/database/agent-executions'

export default function AgentExecutions() {
  const [selectedExecution, setSelectedExecution] = useState<AgentExecution | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [agentFilter, setAgentFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')

  const { data: executions = [], isLoading } = useExecutions({
    agentId: agentFilter !== 'all' ? agentFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter as AgentExecution['status'] : undefined
  })

  const { data: agents = [] } = useAgents()
  const cancelExecutionMutation = useCancelExecution()
  const retryExecutionMutation = useRetryExecution()

  const filteredExecutions = executions.data.filter(execution => {
    const matchesSearch = execution.input_data?.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         execution.agent_id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

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

  const handleCancelExecution = async (executionId: string) => {
    if (confirm('Are you sure you want to cancel this execution?')) {
      await cancelExecutionMutation.mutateAsync(executionId)
    }
  }

  const handleRetryExecution = async (executionId: string) => {
    await retryExecutionMutation.mutateAsync(executionId)
  }

  return (
    <div className="min-h-screen bg-[#181A1B] text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Agent Executions</h1>
              <p className="text-[#A3A7AC] text-lg">
                Monitor and manage your AI agent execution runs
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <ExecutionStats executions={executions.data} />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-[#222426] border-[#26282A]">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6E7C] w-4 h-4" />
                    <Input
                      placeholder="Search executions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-[#2A2E35] border-[#353945] text-white placeholder:text-[#6B6E7C] focus:border-[#53B7FF]"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-[#2A2E35] border-[#353945] text-white focus:border-[#53B7FF]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A2E35] border-[#353945]">
                      <SelectItem value="all" className="text-white hover:bg-[#353945]">All Status</SelectItem>
                      <SelectItem value="pending" className="text-white hover:bg-[#353945]">Pending</SelectItem>
                      <SelectItem value="running" className="text-white hover:bg-[#353945]">Running</SelectItem>
                      <SelectItem value="completed" className="text-white hover:bg-[#353945]">Completed</SelectItem>
                      <SelectItem value="failed" className="text-white hover:bg-[#353945]">Failed</SelectItem>
                      <SelectItem value="awaiting_approval" className="text-white hover:bg-[#353945]">Awaiting Approval</SelectItem>
                      <SelectItem value="cancelled" className="text-white hover:bg-[#353945]">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={agentFilter} onValueChange={setAgentFilter}>
                    <SelectTrigger className="w-40 bg-[#2A2E35] border-[#353945] text-white focus:border-[#53B7FF]">
                      <SelectValue placeholder="Agent" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A2E35] border-[#353945]">
                      <SelectItem value="all" className="text-white hover:bg-[#353945]">All Agents</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id} className="text-white hover:bg-[#353945]">
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Executions List */}
          <div className="lg:col-span-2">
            <Card className="bg-[#222426] border-[#26282A]">
              <CardHeader>
                <CardTitle className="text-xl text-white">Recent Executions</CardTitle>
                <CardDescription className="text-[#A3A7AC]">
                  {filteredExecutions.length} execution{filteredExecutions.length !== 1 ? 's' : ''} found
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-[#2A2E35] rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredExecutions.length === 0 ? (
                  <div className="p-12 text-center">
                    <Clock className="w-16 h-16 text-[#6B6E7C] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No executions found</h3>
                    <p className="text-[#A3A7AC]">
                      No executions match your current filters
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#353945]">
                    {filteredExecutions.map((execution, index) => (
                      <motion.div
                        key={execution.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 hover:bg-[#232527] transition-colors cursor-pointer"
                        onClick={() => setSelectedExecution(execution)}
                      >
                        <ExecutionCard
                          execution={execution}
                          onCancel={() => handleCancelExecution(execution.id)}
                          onRetry={() => handleRetryExecution(execution.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Execution Details */}
          <div className="lg:col-span-1">
            {selectedExecution ? (
              <ExecutionDetails
                execution={selectedExecution}
                onClose={() => setSelectedExecution(null)}
              />
            ) : (
              <Card className="bg-[#222426] border-[#26282A]">
                <CardContent className="p-6 text-center">
                  <Eye className="w-12 h-12 text-[#6B6E7C] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Select an Execution</h3>
                  <p className="text-[#A3A7AC]">
                    Click on an execution to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}