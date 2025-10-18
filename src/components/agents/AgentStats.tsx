/**
 * Agent Statistics Component
 * Displays overview statistics for agents
 */

import { motion } from 'motion/react'
import { Bot, Activity, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Agent } from '@/types/database/agents'

interface AgentStatsProps {
  agents: Agent[]
}

export function AgentStats({ agents }: AgentStatsProps) {
  const stats = {
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    inactive: agents.filter(a => a.status === 'inactive').length,
    archived: agents.filter(a => a.status === 'archived').length,
    byType: agents.reduce((acc, agent) => {
      acc[agent.type] = (acc[agent.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    requiresApproval: agents.filter(a => a.requires_approval).length
  }

  const statCards = [
    {
      title: 'Total Agents',
      value: stats.total,
      icon: Bot,
      color: 'text-[#53B7FF]',
      bgColor: 'bg-[#53B7FF]/20',
      borderColor: 'border-[#53B7FF]/30'
    },
    {
      title: 'Active',
      value: stats.active,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    },
    {
      title: 'Inactive',
      value: stats.inactive,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      title: 'Requires Approval',
      value: stats.requiresApproval,
      icon: AlertCircle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {stat.title === 'Total Agents' 
                  ? 'All configured agents'
                  : stat.title === 'Active'
                  ? 'Currently running'
                  : stat.title === 'Inactive'
                  ? 'Paused or stopped'
                  : 'Need human approval'
                }
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}