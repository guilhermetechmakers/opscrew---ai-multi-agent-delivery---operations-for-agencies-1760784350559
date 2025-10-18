/**
 * Agent Card Component
 * Displays agent information in a card format
 */

import { motion } from 'motion/react'
import { Bot, Settings, Play, Trash2, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Agent } from '@/types/database/agents'

interface AgentCardProps {
  agent: Agent
  onEdit: () => void
  onTest: () => void
  onDelete: () => void
}

export function AgentCard({ agent, onEdit, onTest, onDelete }: AgentCardProps) {
  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'inactive':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'archived':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'inactive':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'archived':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTypeColor = (type: Agent['type']) => {
    const colors: Record<Agent['type'], string> = {
      'intake': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'spin-up': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'pm': 'bg-green-500/20 text-green-400 border-green-500/30',
      'comms': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'research': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'launch': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'handover': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'support': 'bg-teal-500/20 text-teal-400 border-teal-500/30'
    }
    return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-[#222426] border-[#26282A] hover:bg-[#232527] transition-all duration-200 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#53B7FF]/20 rounded-lg">
                <Bot className="w-5 h-5 text-[#53B7FF]" />
              </div>
              <div>
                <CardTitle className="text-lg text-white group-hover:text-[#53B7FF] transition-colors">
                  {agent.name}
                </CardTitle>
                <CardDescription className="text-[#A3A7AC] text-sm">
                  {agent.description || 'No description provided'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(agent.status)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={`${getTypeColor(agent.type)} border`}>
              {agent.type.replace('-', ' ')}
            </Badge>
            <Badge className={`${getStatusColor(agent.status)} border`}>
              {agent.status}
            </Badge>
            {agent.requires_approval && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border">
                Requires Approval
              </Badge>
            )}
          </div>

          {/* Agent Details */}
          <div className="space-y-2 text-sm text-[#A3A7AC]">
            <div className="flex justify-between">
              <span>Model:</span>
              <span className="text-white">{agent.model}</span>
            </div>
            <div className="flex justify-between">
              <span>Temperature:</span>
              <span className="text-white">{agent.temperature}</span>
            </div>
            <div className="flex justify-between">
              <span>Max Tokens:</span>
              <span className="text-white">{agent.max_tokens.toLocaleString()}</span>
            </div>
            {agent.approval_threshold && (
              <div className="flex justify-between">
                <span>Approval Threshold:</span>
                <span className="text-white">{(agent.approval_threshold * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onTest}
              className="flex-1 bg-transparent border-[#53B7FF] text-[#53B7FF] hover:bg-[#53B7FF] hover:text-white"
            >
              <Play className="w-4 h-4 mr-1" />
              Test
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="flex-1 bg-transparent border-[#6B6E7C] text-[#A3A7AC] hover:bg-[#6B6E7C] hover:text-white"
            >
              <Settings className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}