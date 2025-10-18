/**
 * Agent Memory Panel Component
 * Manages agent memory and contextual awareness
 */

import { useState } from 'react'
import { motion } from 'motion/react'
import { Brain, Search, Plus, Trash2, MessageSquare, Clock, Hash } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAgentMemory, useStoreAgentMemory, useSearchAgentMemory, useClearAgentMemory } from '@/hooks/useAIEngine'
import { useAgents } from '@/hooks/useAgents'
import { formatDistanceToNow } from 'date-fns'

interface AgentMemoryPanelProps {
  userId: string
}

export function AgentMemoryPanel({ userId }: AgentMemoryPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [newMemory, setNewMemory] = useState<string>('')
  const [memoryMetadata, setMemoryMetadata] = useState<string>('{}')

  const { data: agents } = useAgents()
  const { data: memory, isLoading: memoryLoading } = useAgentMemory(selectedAgent, sessionId)
  const { data: searchResults, mutate: searchMemory, isPending: isSearching } = useSearchAgentMemory()
  const storeMemory = useStoreAgentMemory()
  const clearMemory = useClearAgentMemory()

  const handleStoreMemory = async () => {
    if (!selectedAgent || !sessionId || !newMemory.trim()) return

    try {
      const metadata = JSON.parse(memoryMetadata || '{}')
      await storeMemory.mutateAsync({
        agentId: selectedAgent,
        sessionId,
        content: newMemory,
        metadata
      })
      setNewMemory('')
      setMemoryMetadata('{}')
    } catch (error) {
      console.error('Failed to store memory:', error)
    }
  }

  const handleSearchMemory = async () => {
    if (!selectedAgent || !sessionId || !searchQuery.trim()) return

    try {
      await searchMemory({
        agentId: selectedAgent,
        sessionId,
        query: searchQuery
      })
    } catch (error) {
      console.error('Failed to search memory:', error)
    }
  }

  const handleClearMemory = async () => {
    if (!selectedAgent || !sessionId) return

    try {
      await clearMemory.mutateAsync({
        agentId: selectedAgent,
        sessionId
      })
    } catch (error) {
      console.error('Failed to clear memory:', error)
    }
  }

  const displayMemory = searchResults || memory || []

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-[#222426] border-[#26282A]">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="w-5 h-5 mr-2 text-[#53B7FF]" />
            Agent Memory Management
          </CardTitle>
          <CardDescription className="text-[#A3A7AC]">
            Manage contextual memory for your AI agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A3A7AC]">Select Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="bg-[#181A1B] border-[#26282A] text-white">
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent className="bg-[#222426] border-[#26282A]">
                  {agents?.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id} className="text-white">
                      {agent.name} ({agent.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A3A7AC]">Session ID</label>
              <Input
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID"
                className="bg-[#181A1B] border-[#26282A] text-white placeholder:text-[#6B6E7C]"
              />
            </div>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#A3A7AC]">Search Memory</label>
            <div className="flex space-x-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memory content..."
                className="bg-[#181A1B] border-[#26282A] text-white placeholder:text-[#6B6E7C]"
              />
              <Button
                onClick={handleSearchMemory}
                disabled={!selectedAgent || !sessionId || !searchQuery.trim() || isSearching}
                className="bg-[#53B7FF] hover:bg-[#53B7FF]/80 text-white"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Add Memory */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#A3A7AC]">Add New Memory</label>
            <Textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="Enter memory content..."
              className="bg-[#181A1B] border-[#26282A] text-white placeholder:text-[#6B6E7C] min-h-[100px]"
            />
            <div className="flex space-x-2">
              <Input
                value={memoryMetadata}
                onChange={(e) => setMemoryMetadata(e.target.value)}
                placeholder='Metadata (JSON): {"key": "value"}'
                className="bg-[#181A1B] border-[#26282A] text-white placeholder:text-[#6B6E7C]"
              />
              <Button
                onClick={handleStoreMemory}
                disabled={!selectedAgent || !sessionId || !newMemory.trim() || storeMemory.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-[#26282A]">
            <div className="text-sm text-[#A3A7AC]">
              {displayMemory.length} memories found
            </div>
            <Button
              onClick={handleClearMemory}
              disabled={!selectedAgent || !sessionId || clearMemory.isPending}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Memory List */}
      <div className="space-y-4">
        {memoryLoading ? (
          <div className="text-center py-8 text-[#A3A7AC]">
            Loading memory...
          </div>
        ) : displayMemory.length === 0 ? (
          <Card className="bg-[#222426] border-[#26282A]">
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-[#6B6E7C] mx-auto mb-4" />
              <p className="text-[#A3A7AC]">No memories found for this agent and session</p>
            </CardContent>
          </Card>
        ) : (
          displayMemory.map((memory, index) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="bg-[#222426] border-[#26282A] hover:bg-[#232527] transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-[#53B7FF]" />
                      <span className="text-sm text-[#A3A7AC]">
                        {memory.session_id}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[#6B6E7C]" />
                      <span className="text-xs text-[#6B6E7C]">
                        {formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <p className="text-white mb-3 leading-relaxed">
                    {memory.content}
                  </p>

                  {memory.metadata && Object.keys(memory.metadata).length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-[#A3A7AC]">Metadata:</div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(memory.metadata).map(([key, value]) => (
                          <Badge
                            key={key}
                            className="bg-[#53B7FF]/20 text-[#53B7FF] border-[#53B7FF]/30 text-xs"
                          >
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}