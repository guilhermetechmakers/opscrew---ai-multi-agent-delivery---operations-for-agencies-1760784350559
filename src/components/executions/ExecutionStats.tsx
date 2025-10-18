/**
 * Execution Statistics Component
 * Displays overview statistics for executions
 */

import { motion } from 'motion/react'
import { Play, CheckCircle, XCircle, Clock, AlertCircle, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { AgentExecution } from '@/types/database/agent-executions'

interface ExecutionStatsProps {
  executions: AgentExecution[]
}

export function ExecutionStats({ executions }: ExecutionStatsProps) {
  const stats = {
    total: executions.length,
    completed: executions.filter(e => e.status === 'completed').length,
    failed: executions.filter(e => e.status === 'failed').length,
    running: executions.filter(e => e.status === 'running').length,
    pending: executions.filter(e => e.status === 'pending').length,
    awaitingApproval: executions.filter(e => e.status === 'awaiting_approval').length,
    cancelled: executions.filter(e => e.status === 'cancelled').length,
    totalTokens: executions.reduce((sum, e) => sum + e.total_tokens, 0),
    averageDuration: 0,
    successRate: 0
  }

  // Calculate average duration for completed executions
  const completedExecutions = executions.filter(e => e.status === 'completed' && e.duration_ms)
  if (completedExecutions.length > 0) {
    stats.averageDuration = completedExecutions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / completedExecutions.length
  }

  // Calculate success rate
  if (stats.total > 0) {
    stats.successRate = (stats.completed / stats.total) * 100
  }

  const statCards = [
    {
      title: 'Total Executions',
      value: stats.total,
      icon: Play,
      color: 'text-[#53B7FF]',
      bgColor: 'bg-[#53B7FF]/20',
      borderColor: 'border-[#53B7FF]/30'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30'
    },
    {
      title: 'Running',
      value: stats.running,
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Awaiting Approval',
      value: stats.awaitingApproval,
      icon: AlertCircle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      icon: Zap,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30'
    }
  ]

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-[#222426] border-[#26282A] hover:bg-[#232527] transition-all duration-200 group`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#A3A7AC]">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white group-hover:text-[#53B7FF] transition-colors">
                  {stat.value}
                </div>
                <CardDescription className="text-xs text-[#6B6E7C] mt-1">
                  {stat.title === 'Total Executions' 
                    ? 'All execution runs'
                    : stat.title === 'Completed'
                    ? 'Successfully finished'
                    : stat.title === 'Failed'
                    ? 'Encountered errors'
                    : stat.title === 'Running'
                    ? 'Currently executing'
                    : stat.title === 'Awaiting Approval'
                    ? 'Need human review'
                    : 'Completion percentage'
                  }
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#222426] border-[#26282A]">
          <CardHeader>
            <CardTitle className="text-lg text-white">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#A3A7AC]">Average Duration</span>
              <span className="text-white font-semibold">
                {formatDuration(stats.averageDuration)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A3A7AC]">Total Tokens Used</span>
              <span className="text-white font-semibold">
                {stats.totalTokens.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A3A7AC]">Pending Executions</span>
              <span className="text-white font-semibold">
                {stats.pending}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A3A7AC]">Cancelled Executions</span>
              <span className="text-white font-semibold">
                {stats.cancelled}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#222426] border-[#26282A]">
          <CardHeader>
            <CardTitle className="text-lg text-white">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
                { label: 'Failed', value: stats.failed, color: 'bg-red-500' },
                { label: 'Running', value: stats.running, color: 'bg-blue-500' },
                { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
                { label: 'Awaiting Approval', value: stats.awaitingApproval, color: 'bg-orange-500' },
                { label: 'Cancelled', value: stats.cancelled, color: 'bg-gray-500' }
              ].map((item) => {
                const percentage = stats.total > 0 ? (item.value / stats.total) * 100 : 0
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A3A7AC]">{item.label}</span>
                      <span className="text-white">{item.value} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-[#353945] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}