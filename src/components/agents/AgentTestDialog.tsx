/**
 * Agent Test Dialog Component
 * Interface for testing agent configurations
 */

import { useState } from 'react'
import { motion } from 'motion/react'
import { Bot, Play, Loader2, CheckCircle, XCircle, Copy } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTestAgent } from '@/hooks/useAgents'
import type { Agent } from '@/types/database/agents'

interface AgentTestDialogProps {
  agent: Agent
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AgentTestDialog({ agent, open, onOpenChange }: AgentTestDialogProps) {
  const [testInput, setTestInput] = useState('')
  const [testResult, setTestResult] = useState<{
    success: boolean
    output?: Record<string, any>
    error?: string
    tokenUsage?: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  } | null>(null)

  const testAgentMutation = useTestAgent()

  const handleTest = async () => {
    if (!testInput.trim()) return

    try {
      const result = await testAgentMutation.mutateAsync({
        agentId: agent.id,
        testInput: { message: testInput }
      })
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatOutput = (output: Record<string, any>) => {
    return JSON.stringify(output, null, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#222426] border-[#26282A] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <Bot className="w-6 h-6 mr-2 text-[#53B7FF]" />
            Test Agent
          </DialogTitle>
          <DialogDescription className="text-[#A3A7AC]">
            Test the {agent.name} agent with sample input
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agent Info */}
          <Card className="bg-[#2A2E35] border-[#353945]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center justify-between">
                <span>{agent.name}</span>
                <Badge className="bg-[#53B7FF]/20 text-[#53B7FF] border-[#53B7FF]/30">
                  {agent.type.replace('-', ' ')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#A3A7AC]">
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
            </CardContent>
          </Card>

          {/* Test Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-input" className="text-white">Test Input</Label>
              <Textarea
                id="test-input"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="bg-[#2A2E35] border-[#353945] text-white placeholder:text-[#6B6E7C] focus:border-[#53B7FF]"
                placeholder="Enter test input for the agent..."
                rows={4}
              />
            </div>

            <Button
              onClick={handleTest}
              disabled={!testInput.trim() || testAgentMutation.isPending}
              className="bg-[#53B7FF] hover:bg-[#4A9FE8] text-white"
            >
              {testAgentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </div>

          {/* Test Results */}
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className={`border ${
                testResult.success 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    {testResult.success ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                        <span className="text-green-400">Test Successful</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 mr-2 text-red-400" />
                        <span className="text-red-400">Test Failed</span>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {testResult.success && testResult.output && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Output</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(formatOutput(testResult.output!))}
                          className="bg-transparent border-[#53B7FF] text-[#53B7FF] hover:bg-[#53B7FF] hover:text-white"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="bg-[#181A1B] border border-[#353945] rounded-lg p-4 text-sm text-[#A3A7AC] overflow-x-auto">
                        {formatOutput(testResult.output)}
                      </pre>
                    </div>
                  )}

                  {testResult.error && (
                    <div className="space-y-2">
                      <Label className="text-white">Error</Label>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
                        {testResult.error}
                      </div>
                    </div>
                  )}

                  {testResult.tokenUsage && (
                    <div className="space-y-2">
                      <Label className="text-white">Token Usage</Label>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-[#181A1B] border border-[#353945] rounded-lg p-3 text-center">
                          <div className="text-[#A3A7AC]">Prompt</div>
                          <div className="text-white font-semibold">
                            {testResult.tokenUsage.prompt_tokens.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-[#181A1B] border border-[#353945] rounded-lg p-3 text-center">
                          <div className="text-[#A3A7AC]">Completion</div>
                          <div className="text-white font-semibold">
                            {testResult.tokenUsage.completion_tokens.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-[#181A1B] border border-[#353945] rounded-lg p-3 text-center">
                          <div className="text-[#A3A7AC]">Total</div>
                          <div className="text-white font-semibold">
                            {testResult.tokenUsage.total_tokens.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Dialog Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-[#353945]">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-[#6B6E7C] text-[#A3A7AC] hover:bg-[#6B6E7C] hover:text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}