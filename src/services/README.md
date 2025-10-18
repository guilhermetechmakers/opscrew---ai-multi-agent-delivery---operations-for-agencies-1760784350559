# Agent Orchestration System

This directory contains the core services for the OpsCrew AI Multi-Agent system. The system provides comprehensive agent orchestration, workflow management, memory management, and monitoring capabilities.

## Architecture Overview

The agent system is built around several core services that work together to provide a complete AI agent management platform:

- **Agent Orchestrator**: Central service for executing agents and managing their lifecycle
- **Workflow Engine**: Handles complex multi-agent workflows with conditional logic
- **Memory Service**: Manages agent memory with semantic search capabilities
- **Persona Manager**: Provides predefined agent templates and configurations
- **Audit Logger**: Comprehensive logging and compliance tracking
- **Rate Limiter**: Token usage accounting and rate limiting
- **Monitor**: Real-time monitoring and performance metrics

## Services

### Agent Orchestrator (`agent-orchestrator.ts`)

The central orchestration service that manages AI agent execution, workflows, and state management.

**Key Features:**
- Agent execution with OpenAI integration
- Memory management for contextual conversations
- Human-in-the-loop approval workflows
- Rate limiting and token usage tracking
- Comprehensive error handling and retry logic

**Usage:**
```typescript
import { AgentOrchestrator } from '@/services/agent-orchestrator'

const orchestrator = AgentOrchestrator.getInstance()

// Execute an agent
const result = await orchestrator.executeAgent({
  userId: 'user-123',
  agentId: 'agent-456',
  inputData: { message: 'Hello' },
  useMemory: true
})

// Approve an execution
await orchestrator.approveExecution(executionId, true, userId, 'Approved')
```

### Workflow Engine (`workflow-engine.ts`)

Manages complex multi-agent workflows with conditional logic, error handling, and approval gates.

**Key Features:**
- Sequential, parallel, and conditional workflow execution
- Approval workflow support
- Error handling and retry policies
- Webhook integration
- Real-time execution monitoring

**Usage:**
```typescript
import { WorkflowEngine } from '@/services/workflow-engine'

const workflowEngine = WorkflowEngine.getInstance()

// Execute a workflow
const result = await workflowEngine.executeWorkflow({
  userId: 'user-123',
  workflowId: 'workflow-456',
  inputData: { project: 'test' }
})
```

### Memory Service (`agent-memory.ts`)

Provides semantic memory management for agents using OpenAI embeddings.

**Key Features:**
- Semantic search using vector embeddings
- Memory storage and retrieval
- Session-based memory management
- Memory statistics and analytics

**Usage:**
```typescript
import { AgentMemoryService } from '@/services/agent-memory'

const memoryService = AgentMemoryService.getInstance()

// Store memory
await memoryService.storeMemory({
  user_id: 'user-123',
  agent_id: 'agent-456',
  session_id: 'session-789',
  content: 'User prefers email communication',
  metadata: { context: 'communication' }
})

// Search memories
const results = await memoryService.searchMemories(
  'user-123',
  'agent-456',
  'communication preferences'
)
```

### Persona Manager (`agent-persona-manager.ts`)

Manages predefined agent personas and templates for quick agent creation.

**Key Features:**
- Predefined persona templates
- Category-based organization
- Search and filtering
- Custom agent creation from templates

**Usage:**
```typescript
import { AgentPersonaManager } from '@/services/agent-persona-manager'

const personaManager = AgentPersonaManager.getInstance()

// Get personas for agent type
const personas = await personaManager.getPersonasForType('intake')

// Create agent from persona
const agent = await personaManager.createAgentFromPersona(
  'user-123',
  'intake-qualifier',
  { name: 'Custom Intake Agent' }
)
```

### Audit Logger (`audit-logger.ts`)

Comprehensive audit logging and compliance tracking for all agent activities.

**Key Features:**
- Event categorization and severity levels
- Real-time audit feed
- Compliance scoring
- Export capabilities (JSON/CSV)
- Performance metrics

**Usage:**
```typescript
import { AuditLogger } from '@/services/audit-logger'

const auditLogger = AuditLogger.getInstance()

// Log execution event
await auditLogger.logExecutionEvent(
  'user-123',
  'agent-456',
  'execution-789',
  'execution_completed',
  { status: 'success' },
  'medium'
)

// Get audit statistics
const stats = await auditLogger.getAuditStats('user-123')
```

### Rate Limiter (`rate-limiter.ts`)

Implements rate limiting and token usage accounting per organization and project.

**Key Features:**
- Multiple rate limit types (requests, tokens)
- Per-user, per-agent, per-project limits
- Token usage tracking and cost calculation
- Usage statistics and analytics

**Usage:**
```typescript
import { RateLimiter } from '@/services/rate-limiter'

const rateLimiter = RateLimiter.getInstance()

// Check rate limit
const { allowed, limit } = await rateLimiter.checkRateLimit(
  'user-123',
  'agent-456',
  'project-789',
  'requests_per_minute'
)

// Record token usage
await rateLimiter.recordTokenUsage({
  userId: 'user-123',
  agentId: 'agent-456',
  model: 'gpt-4',
  promptTokens: 100,
  completionTokens: 50,
  totalTokens: 150,
  cost: 0.01
})
```

### Monitor (`agent-monitor.ts`)

Real-time monitoring and performance metrics for agent executions.

**Key Features:**
- Real-time execution monitoring
- Performance metrics and analytics
- Alert system
- Dashboard data aggregation

**Usage:**
```typescript
import { AgentMonitor } from '@/services/agent-monitor'

const monitor = AgentMonitor.getInstance()

// Get monitoring dashboard
const dashboard = await monitor.getDashboard('user-123')

// Get agent metrics
const metrics = await monitor.getAgentMetrics('user-123', 'agent-456')
```

## Database Schema

The agent system uses several database tables:

- `agents`: Agent configurations and metadata
- `agent_executions`: Execution records and status
- `agent_memory`: Memory storage with embeddings
- `agent_workflows`: Workflow definitions
- `agent_audit_logs`: Audit events and compliance logs
- `token_usage`: Token usage tracking
- `rate_limits`: Rate limiting data

## Configuration

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Rate Limiting Configuration

Default rate limits can be configured per user/organization:

```typescript
const config = {
  requestsPerMinute: 60,
  requestsPerHour: 1000,
  requestsPerDay: 10000,
  tokensPerHour: 100000,
  tokensPerDay: 1000000,
  burstLimit: 10
}
```

## Error Handling

All services implement comprehensive error handling:

- Graceful degradation on service failures
- Retry logic with exponential backoff
- Detailed error logging and tracking
- User-friendly error messages

## Security

- Row Level Security (RLS) on all database tables
- User-based access control
- Audit logging for all actions
- Rate limiting to prevent abuse
- Input validation and sanitization

## Performance

- Local caching for frequently accessed data
- Batch processing for audit logs
- Optimized database queries
- Memory management for large datasets

## Testing

Comprehensive test suite included:

```bash
npm run test
```

Tests cover:
- Unit tests for all services
- Integration tests for workflows
- Error handling scenarios
- Performance benchmarks

## Monitoring and Observability

- Real-time execution monitoring
- Performance metrics dashboard
- Alert system for critical events
- Audit trail for compliance
- Token usage analytics

## Contributing

When adding new features:

1. Follow the existing service patterns
2. Add comprehensive tests
3. Update documentation
4. Consider rate limiting implications
5. Add audit logging for new actions

## License

This project is part of the OpsCrew AI Multi-Agent system.