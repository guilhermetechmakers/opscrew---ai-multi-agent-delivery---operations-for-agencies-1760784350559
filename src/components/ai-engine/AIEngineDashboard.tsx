/**
 * AI Engine Dashboard Component
 * Main dashboard for AI Engine management and monitoring
 */

import { motion } from 'motion/react'
import { Bot, Brain, Zap, BarChart3, Settings, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useExecutionAnalytics, usePersonas } from '@/hooks/useAIEngine'
import { useAgents } from '@/hooks/useAgents'
import { AgentMemoryPanel } from './AgentMemoryPanel'
import { PersonaManagement } from './PersonaManagement'
import { ExecutionAnalytics } from './ExecutionAnalytics'
import { WorkflowStates } from './WorkflowStates'

interface AIEngineDashboardProps {
  userId: string
}

export function AIEngineDashboard({ userId }: AIEngineDashboardProps) {
  const { data: analytics, isLoading: analyticsLoading } = useExecutionAnalytics(userId)
  const { data: personas, isLoading: personasLoading } = usePersonas(userId)
  const { data: agents, isLoading: agentsLoading } = useAgents()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'running':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'awaiting_approval':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Engine Dashboard</h1>
          <p className="text-[#A3A7AC] mt-2">
            Manage and monitor your AI agents, workflows, and executions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-[#53B7FF]/20 text-[#53B7FF] border-[#53B7FF]/30">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-[#222426] border-[#26282A] hover:bg-[#232527] transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#A3A7AC]">
                Total Executions
              </CardTitle>
              <Bot className="h-4 w-4 text-[#53B7FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {analyticsLoading ? '...' : analytics?.totalExecutions || 0}
              </div>
              <p className="text-xs text-[#A3A7AC] mt-1">
                {analytics?.successfulExecutions || 0} successful
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-[#222426] border-[#26282A] hover:bg-[#232527] transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#A3A7AC]">
                Success Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {analyticsLoading ? '...' : 
                  analytics?.totalExecutions ? 
                    Math.round((analytics.successfulExecutions / analytics.totalExecutions) * 100) : 0
                }%
              </div>
              <p className="text-xs text-[#A3A7AC] mt-1">
                {analytics?.failedExecutions || 0} failed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-[#222426] border-[#26282A] hover:bg-[#232527] transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#A3A7AC]">
                Token Usage
              </CardTitle>
              <Zap className="h-4 w-4 text-[#53B7FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {analyticsLoading ? '...' : 
                  analytics?.totalTokenUsage ? 
                    Math.round(analytics.totalTokenUsage / 1000) : 0
                }K
              </div>
              <p className="text-xs text-[#A3A7AC] mt-1">
                ${analytics?.totalCost?.toFixed(2) || '0.00'} cost
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-[#222426] border-[#26282A] hover:bg-[#232527] transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#A3A7AC]">
                Active Agents
              </CardTitle>
              <Brain className="h-4 w-4 text-[#53B7FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {agentsLoading ? '...' : agents?.length || 0}
              </div>
              <p className="text-xs text-[#A3A7AC] mt-1">
                {personasLoading ? '...' : personas?.length || 0} personas
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-[#181A1B] border-[#26282A]">
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="memory" 
            className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white"
          >
            <Brain className="w-4 h-4 mr-2" />
            Memory
          </TabsTrigger>
          <TabsTrigger 
            value="personas" 
            className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Personas
          </TabsTrigger>
          <TabsTrigger 
            value="workflows" 
            className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white"
          >
            <Clock className="w-4 h-4 mr-2" />
            Workflows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <ExecutionAnalytics analytics={analytics} isLoading={analyticsLoading} />
        </TabsContent>

        <TabsContent value="memory" className="space-y-6">
          <AgentMemoryPanel userId={userId} />
        </TabsContent>

        <TabsContent value="personas" className="space-y-6">
          <PersonaManagement userId={userId} />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <WorkflowStates userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}