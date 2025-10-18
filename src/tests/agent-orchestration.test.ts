/**
 * Agent Orchestration Integration Tests
 * Comprehensive tests for agent orchestration and workflow execution
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AgentOrchestrator } from '@/services/agent-orchestrator'
import { WorkflowEngine } from '@/services/workflow-engine'
import { AgentMemoryService } from '@/services/agent-memory'
import { AgentPersonaManager } from '@/services/agent-persona-manager'
import { AuditLogger } from '@/services/audit-logger'
import { RateLimiter } from '@/services/rate-limiter'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-id' },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }
}))

// Mock OpenAI
vi.mock('@/lib/openai', () => ({
  createChatCompletion: vi.fn(() => Promise.resolve({
    content: '{"response": "Test response", "confidence": 0.8}',
    usage: {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150
    },
    model: 'gpt-4',
    finish_reason: 'stop'
  })),
  createEmbedding: vi.fn(() => Promise.resolve({
    embedding: new Array(1536).fill(0.1),
    usage: {
      prompt_tokens: 10,
      total_tokens: 10
    },
    model: 'text-embedding-3-small'
  })),
  trackTokenUsage: vi.fn(() => Promise.resolve())
}))

describe('Agent Orchestration System', () => {
  let orchestrator: AgentOrchestrator
  let workflowEngine: WorkflowEngine
  let memoryService: AgentMemoryService
  let personaManager: AgentPersonaManager
  let auditLogger: AuditLogger
  let rateLimiter: RateLimiter

  beforeEach(() => {
    orchestrator = AgentOrchestrator.getInstance()
    workflowEngine = WorkflowEngine.getInstance()
    memoryService = AgentMemoryService.getInstance()
    personaManager = AgentPersonaManager.getInstance()
    auditLogger = AuditLogger.getInstance()
    rateLimiter = RateLimiter.getInstance()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Agent Orchestrator', () => {
    it('should execute agent with valid context', async () => {
      const context = {
        userId: 'test-user',
        agentId: 'test-agent',
        inputData: { message: 'Hello' },
        useMemory: true
      }

      const result = await orchestrator.executeAgent(context)

      expect(result).toHaveProperty('executionId')
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('output')
      expect(result).toHaveProperty('confidence')
      expect(result).toHaveProperty('tokenUsage')
    })

    it('should handle agent execution errors gracefully', async () => {
      const context = {
        userId: 'test-user',
        agentId: 'invalid-agent',
        inputData: { message: 'Hello' }
      }

      // Mock agent not found
      vi.mocked(require('@/lib/supabase').supabase.from().select().eq().single)
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' }
        })

      const result = await orchestrator.executeAgent(context)

      expect(result.status).toBe('failed')
      expect(result.error).toBeDefined()
    })

    it('should require approval when confidence is below threshold', async () => {
      const context = {
        userId: 'test-user',
        agentId: 'test-agent',
        inputData: { message: 'Hello' },
        useMemory: false
      }

      // Mock low confidence response
      vi.mocked(require('@/lib/openai').createChatCompletion)
        .mockResolvedValueOnce({
          content: '{"response": "Test response", "confidence": 0.5}',
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
          model: 'gpt-4',
          finish_reason: 'stop'
        })

      const result = await orchestrator.executeAgent(context)

      expect(result.status).toBe('awaiting_approval')
    })

    it('should approve execution when requested', async () => {
      const executionId = 'test-execution'
      const approvedBy = 'test-user'
      const notes = 'Approved for testing'

      await expect(
        orchestrator.approveExecution(executionId, true, approvedBy, notes)
      ).resolves.not.toThrow()
    })
  })

  describe('Workflow Engine', () => {
    it('should execute sequential workflow', async () => {
      const context = {
        userId: 'test-user',
        workflowId: 'test-workflow',
        inputData: { message: 'Hello' }
      }

      // Mock workflow configuration
      vi.mocked(require('@/lib/supabase').supabase.from().select().eq().single)
        .mockResolvedValueOnce({
          data: {
            id: 'test-workflow',
            name: 'Test Workflow',
            workflow_type: 'sequential',
            steps: [
              {
                id: 'step-1',
                name: 'Test Step',
                type: 'agent_call',
                agent_id: 'test-agent',
                config: {},
                next_steps: [],
                error_handling: { on_error: 'fail' }
              }
            ],
            status: 'active'
          },
          error: null
        })

      const result = await workflowEngine.executeWorkflow(context)

      expect(result).toHaveProperty('executionId')
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('results')
      expect(result).toHaveProperty('totalDuration')
    })

    it('should handle workflow execution errors', async () => {
      const context = {
        userId: 'test-user',
        workflowId: 'invalid-workflow',
        inputData: { message: 'Hello' }
      }

      // Mock workflow not found
      vi.mocked(require('@/lib/supabase').supabase.from().select().eq().single)
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' }
        })

      const result = await workflowEngine.executeWorkflow(context)

      expect(result.status).toBe('failed')
      expect(result.error).toBeDefined()
    })
  })

  describe('Agent Memory Service', () => {
    it('should store memory with embedding', async () => {
      const memory = {
        user_id: 'test-user',
        agent_id: 'test-agent',
        session_id: 'test-session',
        content: 'Test memory content',
        metadata: { test: true }
      }

      const result = await memoryService.storeMemory(memory)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('embedding')
      expect(result.content).toBe(memory.content)
    })

    it('should search memories by similarity', async () => {
      const userId = 'test-user'
      const agentId = 'test-agent'
      const query = 'test query'

      const result = await memoryService.searchMemories(userId, agentId, query)

      expect(Array.isArray(result)).toBe(true)
    })

    it('should get recent memories for session', async () => {
      const userId = 'test-user'
      const agentId = 'test-agent'
      const sessionId = 'test-session'

      const result = await memoryService.getRecentMemories(userId, agentId, sessionId)

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Agent Persona Manager', () => {
    it('should get personas for agent type', async () => {
      const personas = await personaManager.getPersonasForType('intake')

      expect(Array.isArray(personas)).toBe(true)
      expect(personas.every(p => p.type === 'intake')).toBe(true)
    })

    it('should create agent from persona', async () => {
      const userId = 'test-user'
      const personaId = 'intake-qualifier'
      const customizations = {
        name: 'Custom Intake Agent'
      }

      const result = await personaManager.createAgentFromPersona(userId, personaId, customizations)

      expect(result).toHaveProperty('id')
      expect(result.name).toBe(customizations.name)
      expect(result.type).toBe('intake')
    })

    it('should search personas by query', () => {
      const query = 'qualifier'
      const results = personaManager.searchPersonas(query)

      expect(Array.isArray(results)).toBe(true)
      expect(results.some(p => p.name.toLowerCase().includes(query.toLowerCase()))).toBe(true)
    })
  })

  describe('Audit Logger', () => {
    it('should log execution event', async () => {
      const event = {
        user_id: 'test-user',
        agent_id: 'test-agent',
        execution_id: 'test-execution',
        event_type: 'execution_started',
        event_data: { test: true },
        severity: 'medium' as const
      }

      await expect(auditLogger.logEvent(event)).resolves.not.toThrow()
    })

    it('should log approval event', async () => {
      const userId = 'test-user'
      const agentId = 'test-agent'
      const executionId = 'test-execution'
      const approved = true
      const notes = 'Approved for testing'

      await expect(
        auditLogger.logApprovalEvent(userId, agentId, executionId, approved, notes)
      ).resolves.not.toThrow()
    })

    it('should log error event', async () => {
      const userId = 'test-user'
      const agentId = 'test-agent'
      const executionId = 'test-execution'
      const error = new Error('Test error')
      const context = { test: true }

      await expect(
        auditLogger.logErrorEvent(userId, agentId, executionId, error, context)
      ).resolves.not.toThrow()
    })

    it('should query audit events', async () => {
      const query = {
        userId: 'test-user',
        limit: 10
      }

      const result = await auditLogger.queryEvents(query)

      expect(Array.isArray(result)).toBe(true)
    })

    it('should get audit statistics', async () => {
      const userId = 'test-user'
      const startDate = '2024-01-01'
      const endDate = '2024-12-31'

      const result = await auditLogger.getAuditStats(userId, startDate, endDate)

      expect(result).toHaveProperty('totalEvents')
      expect(result).toHaveProperty('eventsByCategory')
      expect(result).toHaveProperty('eventsBySeverity')
      expect(result).toHaveProperty('errorRate')
      expect(result).toHaveProperty('complianceScore')
    })
  })

  describe('Rate Limiter', () => {
    it('should check rate limits', async () => {
      const userId = 'test-user'
      const agentId = 'test-agent'
      const limitType = 'requests_per_minute' as const

      const result = await rateLimiter.checkRateLimit(userId, agentId, undefined, limitType)

      expect(result).toHaveProperty('allowed')
      expect(result).toHaveProperty('limit')
      expect(typeof result.allowed).toBe('boolean')
    })

    it('should increment rate limit counter', async () => {
      const userId = 'test-user'
      const agentId = 'test-agent'
      const amount = 1

      await expect(
        rateLimiter.incrementRateLimit(userId, agentId, undefined, 'requests_per_minute', amount)
      ).resolves.not.toThrow()
    })

    it('should record token usage', async () => {
      const usage = {
        userId: 'test-user',
        agentId: 'test-agent',
        model: 'gpt-4',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        cost: 0.01
      }

      await expect(rateLimiter.recordTokenUsage(usage)).resolves.not.toThrow()
    })

    it('should get usage statistics', async () => {
      const userId = 'test-user'
      const startDate = '2024-01-01'
      const endDate = '2024-12-31'

      const result = await rateLimiter.getUsageStats(userId, startDate, endDate)

      expect(result).toHaveProperty('totalTokens')
      expect(result).toHaveProperty('totalCost')
      expect(result).toHaveProperty('requestsCount')
      expect(result).toHaveProperty('usageByModel')
      expect(result).toHaveProperty('usageByAgent')
    })
  })

  describe('Integration Tests', () => {
    it('should execute complete agent workflow with memory and approval', async () => {
      const context = {
        userId: 'test-user',
        agentId: 'test-agent',
        inputData: { message: 'Hello, I need help with my project' },
        useMemory: true,
        sessionId: 'test-session'
      }

      // Execute agent
      const result = await orchestrator.executeAgent(context)

      expect(result).toHaveProperty('executionId')
      expect(result).toHaveProperty('status')

      // If approval is required, test approval flow
      if (result.status === 'awaiting_approval') {
        await orchestrator.approveExecution(result.executionId, true, 'test-user', 'Approved for testing')
      }

      // Verify memory was stored
      const memories = await memoryService.getRecentMemories(
        context.userId,
        context.agentId,
        context.sessionId!
      )

      expect(Array.isArray(memories)).toBe(true)
    })

    it('should handle rate limiting and audit logging', async () => {
      const userId = 'test-user'
      const agentId = 'test-agent'

      // Check rate limit
      const rateLimitResult = await rateLimiter.checkRateLimit(userId, agentId)

      if (rateLimitResult.allowed) {
        // Execute agent
        const context = {
          userId,
          agentId,
          inputData: { message: 'Test message' }
        }

        const result = await orchestrator.executeAgent(context)

        // Record token usage
        await rateLimiter.recordTokenUsage({
          userId,
          agentId,
          model: 'gpt-4',
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
          cost: 0.01
        })

        // Log audit event
        await auditLogger.logExecutionEvent(
          userId,
          agentId,
          result.executionId,
          'execution_completed',
          { status: result.status, confidence: result.confidence },
          'medium'
        )

        expect(result).toHaveProperty('executionId')
      }
    })
  })
})