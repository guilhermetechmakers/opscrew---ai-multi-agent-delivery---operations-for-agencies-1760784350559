/**
 * Agent Management Page
 * Main interface for managing AI agents
 */

import { useState } from 'react'
import { motion } from 'motion/react'
import { Plus, Bot, Settings, Play, Pause, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAgents, useDeleteAgent } from '@/hooks/useAgents'
import { AgentCreateDialog } from '@/components/agents/AgentCreateDialog'
import { AgentEditDialog } from '@/components/agents/AgentEditDialog'
import { AgentTestDialog } from '@/components/agents/AgentTestDialog'
import { AgentCard } from '@/components/agents/AgentCard'
import { AgentStats } from '@/components/agents/AgentStats'
import type { Agent } from '@/types/database/agents'

export default function AgentManagement() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const { data: agents = [], isLoading } = useAgents()
  const deleteAgentMutation = useDeleteAgent()

  const agentTypes: Agent['type'][] = [
    'intake', 'spin-up', 'pm', 'comms', 'research', 'launch', 'handover', 'support'
  ]

  const filteredAgents = activeTab === 'all' 
    ? agents 
    : agents.filter(agent => agent.type === activeTab)

  const handleDeleteAgent = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      await deleteAgentMutation.mutateAsync(agentId)
    }
  }

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsEditDialogOpen(true)
  }

  const handleTestAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsTestDialogOpen(true)
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
              <h1 className="text-4xl font-bold text-white mb-2">Agent Management</h1>
              <p className="text-[#A3A7AC] text-lg">
                Configure and manage your AI agents for automated operations
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[#53B7FF] hover:bg-[#4A9FE8] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Agent
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <AgentStats agents={agents} />
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-9 bg-[#222426] border border-[#26282A]">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white"
              >
                All
              </TabsTrigger>
              {agentTypes.map((type) => (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="data-[state=active]:bg-[#53B7FF] data-[state=active]:text-white capitalize"
                >
                  {type.replace('-', ' ')}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-[#222426] border-[#26282A] animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-[#353945] rounded w-3/4"></div>
                        <div className="h-4 bg-[#353945] rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-4 bg-[#353945] rounded"></div>
                          <div className="h-4 bg-[#353945] rounded w-5/6"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredAgents.length === 0 ? (
                <Card className="bg-[#222426] border-[#26282A] text-center py-12">
                  <CardContent>
                    <Bot className="w-16 h-16 text-[#6B6E7C] mx-auto mb-4" />
                    <CardTitle className="text-xl text-white mb-2">No agents found</CardTitle>
                    <CardDescription className="text-[#A3A7AC] mb-6">
                      {activeTab === 'all' 
                        ? "Get started by creating your first AI agent"
                        : `No ${activeTab.replace('-', ' ')} agents found`
                      }
                    </CardDescription>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-[#53B7FF] hover:bg-[#4A9FE8] text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Agent
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAgents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AgentCard
                        agent={agent}
                        onEdit={() => handleEditAgent(agent)}
                        onTest={() => handleTestAgent(agent)}
                        onDelete={() => handleDeleteAgent(agent.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Dialogs */}
        <AgentCreateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />

        {selectedAgent && (
          <>
            <AgentEditDialog
              agent={selectedAgent}
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
            />

            <AgentTestDialog
              agent={selectedAgent}
              open={isTestDialogOpen}
              onOpenChange={setIsTestDialogOpen}
            />
          </>
        )}
      </div>
    </div>
  )
}