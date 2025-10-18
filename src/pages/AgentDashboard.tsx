/**
 * Agent Dashboard Page
 * Comprehensive monitoring and management interface for AI agents
 */

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { 
  Bot, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Zap,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useAgents } from '@/hooks/useAgents'
import { AgentMonitor } from '@/services/agent-monitor'
import type { MonitoringDashboard, AgentMetrics, ExecutionAlert } from '@/services/agent-monitor'

export default function AgentDashboard() {
  const [dashboard, setDashboard] = useState<MonitoringDashboard | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const { data: agents = [] } = useAgents()
  const monitor = AgentMonitor.getInstance()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      const userId = 'current-user-id' // This should come from auth context
      const dashboardData = await monitor.getDashboard(userId)
      setDashboard(dashboardData)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboard()
    setRefreshing(false)
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400'
      case 'degraded': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'degraded': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#181A1B] text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#53B7FF] mx-auto mb-4" />
          <p className="text-[#A3A7AC]">Loading dashboard...</p>
        </div>
      </div>
    )
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
              <h1 className="text-4xl font-bold text-white mb-2">Agent Dashboard</h1>
              <p className="text-[#A3A7AC] text-lg">
                Monitor and manage your AI agents in real-time
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="bg-transparent border-[#53B7FF] text-[#53B7FF] hover:bg-[#53B7FF] hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* System Health Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-[#222426] border-[#26282A]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#A3A7AC] text-sm">System Health</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getHealthIcon(dashboard?.systemHealth || 'healthy')}
                      <span className={`font-semibold ${getHealthColor(dashboard?.systemHealth || 'healthy')}`}>
                        {dashboard?.systemHealth || 'healthy'}
                      </span>
                    </div>
                  </div>
                  <Activity className="w-8 h-8 text-[#53B7FF]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#222426] border-[#26282A]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#A3A7AC] text-sm">Active Agents</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {dashboard?.totalAgents || 0}
                    </p>
                  </div>
                  <Bot className="w-8 h-8 text-[#53B7FF]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#222426] border-[#26282A]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#A3A7AC] text-sm">Running Executions</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {dashboard?.activeExecutions || 0}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-[#53B7FF]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#222426] border-[#26282A]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#A3A7AC] text-sm">Total Executions</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {dashboard?.totalExecutions || 0}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-[#53B7FF]" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-[#222426] border border-[#26282A]">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="agents" 
                className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white"
              >
                Agents
              </TabsTrigger>
              <TabsTrigger 
                value="alerts" 
                className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white"
              >
                Alerts
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white"
              >
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performers */}
                <Card className="bg-[#222426] border-[#26282A]">
                  <CardHeader>
                    <CardTitle className="text-white">Top Performers</CardTitle>
                    <CardDescription className="text-[#A3A7AC]">
                      Agents with the highest success rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboard?.topPerformers.slice(0, 5).map((agent, index) => (
                        <div key={agent.agentId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#53B7FF]/20 rounded-full flex items-center justify-center">
                              <span className="text-[#53B7FF] font-bold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{agent.agentName}</p>
                              <p className="text-[#A3A7AC] text-sm">
                                {agent.totalExecutions} executions
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">
                              {(agent.successRate * 100).toFixed(1)}%
                            </p>
                            <p className="text-[#A3A7AC] text-sm">success rate</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-[#222426] border-[#26282A]">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                    <CardDescription className="text-[#A3A7AC]">
                      Latest agent executions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboard?.recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.executionId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.status === 'completed' ? 'bg-green-400' :
                              activity.status === 'failed' ? 'bg-red-400' :
                              activity.status === 'running' ? 'bg-yellow-400' :
                              'bg-gray-400'
                            }`} />
                            <div>
                              <p className="text-white text-sm">{activity.agentName}</p>
                              <p className="text-[#A3A7AC] text-xs">
                                {new Date(activity.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={
                              activity.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              activity.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                              activity.status === 'running' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }>
                              {activity.status}
                            </Badge>
                            <p className="text-[#A3A7AC] text-xs mt-1">
                              {Math.round(activity.duration / 1000)}s
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="agents" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboard?.topPerformers.map((agent) => (
                  <Card key={agent.agentId} className="bg-[#222426] border-[#26282A] hover:bg-[#232527] transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">{agent.agentName}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            agent.successRate > 0.8 ? 'bg-green-400' :
                            agent.successRate > 0.6 ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Success Rate */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-[#A3A7AC]">Success Rate</span>
                          <span className="text-white">{(agent.successRate * 100).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={agent.successRate * 100} 
                          className="h-2"
                        />
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[#A3A7AC]">Executions</p>
                          <p className="text-white font-semibold">{agent.totalExecutions}</p>
                        </div>
                        <div>
                          <p className="text-[#A3A7AC]">Avg Time</p>
                          <p className="text-white font-semibold">
                            {Math.round(agent.averageExecutionTime / 1000)}s
                          </p>
                        </div>
                        <div>
                          <p className="text-[#A3A7AC]">Confidence</p>
                          <p className="text-white font-semibold">
                            {(agent.averageConfidence * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[#A3A7AC]">Cost</p>
                          <p className="text-white font-semibold">
                            ${agent.totalCost.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Performance Breakdown */}
                      <div className="space-y-2">
                        <p className="text-[#A3A7AC] text-sm">Performance</p>
                        <div className="flex space-x-2">
                          <div className="flex-1 bg-green-500/20 rounded p-2 text-center">
                            <p className="text-green-400 text-xs font-semibold">
                              {agent.performance.excellent}
                            </p>
                            <p className="text-green-400 text-xs">Excellent</p>
                          </div>
                          <div className="flex-1 bg-yellow-500/20 rounded p-2 text-center">
                            <p className="text-yellow-400 text-xs font-semibold">
                              {agent.performance.good}
                            </p>
                            <p className="text-yellow-400 text-xs">Good</p>
                          </div>
                          <div className="flex-1 bg-red-500/20 rounded p-2 text-center">
                            <p className="text-red-400 text-xs font-semibold">
                              {agent.performance.needsImprovement}
                            </p>
                            <p className="text-red-400 text-xs">Needs Work</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="mt-6">
              <Card className="bg-[#222426] border-[#26282A]">
                <CardHeader>
                  <CardTitle className="text-white">Active Alerts</CardTitle>
                  <CardDescription className="text-[#A3A7AC]">
                    System alerts and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard?.alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <p className="text-[#A3A7AC]">No active alerts</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboard?.alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start space-x-4 p-4 bg-[#1A1C1D] rounded-lg">
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            alert.severity === 'critical' ? 'bg-red-400' :
                            alert.severity === 'high' ? 'bg-orange-400' :
                            alert.severity === 'medium' ? 'bg-yellow-400' :
                            'bg-blue-400'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-white font-medium">{alert.message}</h4>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-[#A3A7AC] text-sm mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card className="bg-[#222426] border-[#26282A]">
                <CardHeader>
                  <CardTitle className="text-white">Activity Timeline</CardTitle>
                  <CardDescription className="text-[#A3A7AC]">
                    Recent agent activity and executions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboard?.recentActivity.map((activity) => (
                      <div key={activity.executionId} className="flex items-center space-x-4 p-4 bg-[#1A1C1D] rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.status === 'completed' ? 'bg-green-500/20' :
                          activity.status === 'failed' ? 'bg-red-500/20' :
                          activity.status === 'running' ? 'bg-yellow-500/20' :
                          'bg-gray-500/20'
                        }`}>
                          <Bot className={`w-5 h-5 ${
                            activity.status === 'completed' ? 'text-green-400' :
                            activity.status === 'failed' ? 'text-red-400' :
                            activity.status === 'running' ? 'text-yellow-400' :
                            'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-medium">{activity.agentName}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={
                                activity.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                activity.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                activity.status === 'running' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }>
                                {activity.status}
                              </Badge>
                              <span className="text-[#A3A7AC] text-sm">
                                {Math.round(activity.duration / 1000)}s
                              </span>
                            </div>
                          </div>
                          <p className="text-[#A3A7AC] text-sm mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}