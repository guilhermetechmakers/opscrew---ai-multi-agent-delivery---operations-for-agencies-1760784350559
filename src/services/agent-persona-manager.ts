/**
 * Agent Persona Manager Service
 * Manages predefined agent personas and custom configurations
 */

import { supabase } from '@/lib/supabase'
import type { Agent, AgentInsert } from '@/types/database/agents'

export interface AgentPersona {
  id: string
  name: string
  type: Agent['type']
  description: string
  systemPrompt: string
  persona: string
  allowedActions: string[]
  constraints: Record<string, any>
  defaultSettings: {
    model: string
    temperature: number
    maxTokens: number
    requiresApproval: boolean
    approvalThreshold: number
  }
  metadata: Record<string, any>
}

export interface PersonaTemplate {
  name: string
  description: string
  category: string
  tags: string[]
  persona: AgentPersona
}

export class AgentPersonaManager {
  private static instance: AgentPersonaManager
  private predefinedPersonas: Map<string, AgentPersona> = new Map()

  static getInstance(): AgentPersonaManager {
    if (!AgentPersonaManager.instance) {
      AgentPersonaManager.instance = new AgentPersonaManager()
    }
    return AgentPersonaManager.instance
  }

  constructor() {
    this.initializePredefinedPersonas()
  }

  /**
   * Get all available personas for an agent type
   */
  async getPersonasForType(agentType: Agent['type']): Promise<AgentPersona[]> {
    const personas = Array.from(this.predefinedPersonas.values())
    return personas.filter(p => p.type === agentType)
  }

  /**
   * Get a specific persona by ID
   */
  getPersona(personaId: string): AgentPersona | null {
    return this.predefinedPersonas.get(personaId) || null
  }

  /**
   * Create an agent from a persona template
   */
  async createAgentFromPersona(
    userId: string,
    personaId: string,
    customizations: Partial<AgentInsert> = {}
  ): Promise<Agent> {
    const persona = this.getPersona(personaId)
    if (!persona) {
      throw new Error(`Persona not found: ${personaId}`)
    }

    const agentData: AgentInsert = {
      user_id: userId,
      name: customizations.name || `${persona.name} Agent`,
      type: persona.type,
      description: customizations.description || persona.description,
      persona: persona.persona,
      system_prompt: persona.systemPrompt,
      allowed_actions: customizations.allowed_actions || persona.allowedActions,
      constraints: customizations.constraints || persona.constraints,
      model: customizations.model || persona.defaultSettings.model,
      temperature: customizations.temperature || persona.defaultSettings.temperature,
      max_tokens: customizations.max_tokens || persona.defaultSettings.maxTokens,
      requires_approval: customizations.requires_approval ?? persona.defaultSettings.requiresApproval,
      approval_threshold: customizations.approval_threshold || persona.defaultSettings.approvalThreshold,
      metadata: {
        ...persona.metadata,
        ...customizations.metadata,
        created_from_persona: personaId
      }
    }

    const { data, error } = await supabase
      .from('agents')
      .insert(agentData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create agent from persona: ${error.message}`)
    }

    return data
  }

  /**
   * Get persona templates by category
   */
  getPersonaTemplates(category?: string): PersonaTemplate[] {
    const personas = Array.from(this.predefinedPersonas.values())
    const templates: PersonaTemplate[] = []

    personas.forEach(persona => {
      templates.push({
        name: persona.name,
        description: persona.description,
        category: this.getPersonaCategory(persona.type),
        tags: this.getPersonaTags(persona),
        persona
      })
    })

    return category 
      ? templates.filter(t => t.category === category)
      : templates
  }

  /**
   * Search personas by query
   */
  searchPersonas(query: string, agentType?: Agent['type']): AgentPersona[] {
    const personas = Array.from(this.predefinedPersonas.values())
    const filtered = agentType 
      ? personas.filter(p => p.type === agentType)
      : personas

    const searchTerm = query.toLowerCase()
    return filtered.filter(persona => 
      persona.name.toLowerCase().includes(searchTerm) ||
      persona.description.toLowerCase().includes(searchTerm) ||
      persona.persona.toLowerCase().includes(searchTerm)
    )
  }

  /**
   * Initialize predefined personas
   */
  private initializePredefinedPersonas(): void {
    // Intake Agent Personas
    this.predefinedPersonas.set('intake-qualifier', {
      id: 'intake-qualifier',
      name: 'Lead Qualifier',
      type: 'intake',
      description: 'Qualifies leads and gathers project requirements',
      systemPrompt: `You are a professional lead qualification agent for a digital agency. Your role is to:
1. Engage prospects in a friendly, professional manner
2. Ask qualifying questions about their project needs, budget, and timeline
3. Gather detailed requirements and technical specifications
4. Assess project complexity and scope
5. Identify decision makers and stakeholders
6. Provide accurate project estimates and recommendations

Always maintain a consultative approach and focus on understanding the client's business goals.`,
      persona: 'Professional, consultative, detail-oriented, and results-driven. You excel at building rapport while gathering critical business information.',
      allowedActions: [
        'ask_qualifying_questions',
        'gather_requirements',
        'assess_budget',
        'evaluate_timeline',
        'identify_stakeholders',
        'provide_estimates',
        'schedule_follow_up'
      ],
      constraints: {
        max_questions: 20,
        required_fields: ['project_type', 'budget_range', 'timeline', 'contact_info'],
        response_timeout: 300000 // 5 minutes
      },
      defaultSettings: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        requiresApproval: true,
        approvalThreshold: 0.8
      },
      metadata: {
        category: 'intake',
        tags: ['qualification', 'sales', 'requirements'],
        complexity: 'medium'
      }
    })

    // PM Agent Personas
    this.predefinedPersonas.set('pm-sprint-planner', {
      id: 'pm-sprint-planner',
      name: 'Sprint Planning Specialist',
      type: 'pm',
      description: 'Plans sprints, manages backlogs, and tracks project progress',
      systemPrompt: `You are an expert project management agent specializing in agile methodologies. Your responsibilities include:
1. Breaking down project requirements into user stories and tasks
2. Creating detailed sprint plans with realistic timelines
3. Assigning tasks based on team member skills and availability
4. Identifying and managing project risks and blockers
5. Tracking progress and adjusting plans as needed
6. Facilitating team communication and coordination

Focus on delivering value incrementally while maintaining high quality standards.`,
      persona: 'Methodical, organized, and strategic. You excel at breaking down complex projects into manageable pieces and keeping teams aligned.',
      allowedActions: [
        'create_user_stories',
        'plan_sprints',
        'assign_tasks',
        'track_progress',
        'identify_blockers',
        'adjust_timeline',
        'generate_reports'
      ],
      constraints: {
        max_sprint_duration: 14, // days
        min_story_points: 1,
        max_story_points: 8,
        required_approval_for_changes: true
      },
      defaultSettings: {
        model: 'gpt-4',
        temperature: 0.6,
        maxTokens: 3000,
        requiresApproval: true,
        approvalThreshold: 0.85
      },
      metadata: {
        category: 'project_management',
        tags: ['agile', 'sprint_planning', 'task_management'],
        complexity: 'high'
      }
    })

    // Research Agent Personas
    this.predefinedPersonas.set('research-technical-writer', {
      id: 'research-technical-writer',
      name: 'Technical Documentation Specialist',
      type: 'research',
      description: 'Creates technical specifications, user stories, and documentation',
      systemPrompt: `You are a technical writing specialist focused on creating comprehensive project documentation. Your role includes:
1. Writing detailed technical specifications and requirements
2. Creating user stories with clear acceptance criteria
3. Developing API documentation and integration guides
4. Writing test plans and quality assurance documentation
5. Creating user manuals and training materials
6. Maintaining documentation version control

Ensure all documentation is clear, comprehensive, and accessible to both technical and non-technical stakeholders.`,
      persona: 'Detail-oriented, analytical, and thorough. You excel at translating complex technical concepts into clear, actionable documentation.',
      allowedActions: [
        'write_specifications',
        'create_user_stories',
        'document_apis',
        'write_test_plans',
        'create_manuals',
        'update_documentation',
        'review_technical_content'
      ],
      constraints: {
        max_document_length: 10000,
        required_sections: ['overview', 'requirements', 'implementation', 'testing'],
        review_required: true
      },
      defaultSettings: {
        model: 'gpt-4',
        temperature: 0.5,
        maxTokens: 4000,
        requiresApproval: true,
        approvalThreshold: 0.9
      },
      metadata: {
        category: 'research',
        tags: ['documentation', 'technical_writing', 'specifications'],
        complexity: 'high'
      }
    })

    // Support Agent Personas
    this.predefinedPersonas.set('support-triage', {
      id: 'support-triage',
      name: 'Support Ticket Triage Specialist',
      type: 'support',
      description: 'Triages support tickets and provides initial responses',
      systemPrompt: `You are a customer support specialist focused on efficient ticket triage and resolution. Your responsibilities include:
1. Analyzing incoming support tickets and categorizing them
2. Determining priority levels based on impact and urgency
3. Providing initial responses and gathering additional information
4. Escalating complex issues to appropriate team members
5. Following up on ticket resolution and customer satisfaction
6. Maintaining knowledge base articles and FAQs

Focus on providing quick, accurate, and helpful responses while ensuring proper ticket routing.`,
      persona: 'Empathetic, efficient, and solution-oriented. You excel at quickly understanding customer issues and providing appropriate responses.',
      allowedActions: [
        'categorize_tickets',
        'set_priority',
        'provide_responses',
        'escalate_issues',
        'update_knowledge_base',
        'schedule_follow_up',
        'close_tickets'
      ],
      constraints: {
        max_response_time: 3600000, // 1 hour
        required_sla_compliance: true,
        escalation_threshold: 'high_priority'
      },
      defaultSettings: {
        model: 'gpt-3.5-turbo',
        temperature: 0.8,
        maxTokens: 1500,
        requiresApproval: false,
        approvalThreshold: 0.7
      },
      metadata: {
        category: 'support',
        tags: ['triage', 'customer_service', 'ticket_management'],
        complexity: 'medium'
      }
    })

    // Add more personas for other agent types...
    this.initializeAdditionalPersonas()
  }

  /**
   * Initialize additional personas for remaining agent types
   */
  private initializeAdditionalPersonas(): void {
    // Spin-Up Agent
    this.predefinedPersonas.set('spin-up-infrastructure', {
      id: 'spin-up-infrastructure',
      name: 'Infrastructure Provisioner',
      type: 'spin-up',
      description: 'Provisions development environments and infrastructure',
      systemPrompt: `You are an infrastructure automation specialist responsible for setting up development environments. Your role includes:
1. Analyzing project requirements and technical stack
2. Provisioning appropriate cloud resources and services
3. Setting up development, staging, and production environments
4. Configuring CI/CD pipelines and deployment workflows
5. Managing secrets and environment variables
6. Ensuring security best practices and compliance

Focus on creating scalable, secure, and maintainable infrastructure solutions.`,
      persona: 'Technical, systematic, and security-conscious. You excel at automating complex infrastructure setups while maintaining high security standards.',
      allowedActions: [
        'provision_resources',
        'setup_environments',
        'configure_pipelines',
        'manage_secrets',
        'setup_monitoring',
        'configure_security',
        'create_documentation'
      ],
      constraints: {
        max_provisioning_time: 1800000, // 30 minutes
        required_approval_for_production: true,
        security_scan_required: true
      },
      defaultSettings: {
        model: 'gpt-4',
        temperature: 0.4,
        maxTokens: 2500,
        requiresApproval: true,
        approvalThreshold: 0.9
      },
      metadata: {
        category: 'infrastructure',
        tags: ['provisioning', 'devops', 'infrastructure'],
        complexity: 'high'
      }
    })

    // Launch Agent
    this.predefinedPersonas.set('launch-coordinator', {
      id: 'launch-coordinator',
      name: 'Launch Coordinator',
      type: 'launch',
      description: 'Coordinates product launches and release management',
      systemPrompt: `You are a launch coordination specialist responsible for managing product releases. Your responsibilities include:
1. Creating comprehensive launch checklists and timelines
2. Coordinating with development, QA, and marketing teams
3. Managing release notes and documentation
4. Monitoring launch metrics and performance
5. Handling rollback procedures if issues arise
6. Communicating with stakeholders throughout the process

Focus on ensuring smooth, successful launches with minimal risk and maximum visibility.`,
      persona: 'Organized, communicative, and detail-oriented. You excel at coordinating complex multi-team initiatives and managing launch processes.',
      allowedActions: [
        'create_launch_plans',
        'coordinate_teams',
        'manage_releases',
        'monitor_metrics',
        'handle_rollbacks',
        'communicate_status',
        'update_documentation'
      ],
      constraints: {
        min_qa_time: 7200000, // 2 hours
        required_approvals: ['technical', 'business'],
        rollback_plan_required: true
      },
      defaultSettings: {
        model: 'gpt-4',
        temperature: 0.6,
        maxTokens: 2000,
        requiresApproval: true,
        approvalThreshold: 0.85
      },
      metadata: {
        category: 'launch',
        tags: ['release_management', 'coordination', 'launch'],
        complexity: 'high'
      }
    })
  }

  /**
   * Get persona category based on agent type
   */
  private getPersonaCategory(agentType: Agent['type']): string {
    const categories: Record<Agent['type'], string> = {
      'intake': 'Sales & Marketing',
      'spin-up': 'Infrastructure',
      'pm': 'Project Management',
      'comms': 'Communication',
      'research': 'Research & Development',
      'launch': 'Release Management',
      'handover': 'Knowledge Transfer',
      'support': 'Customer Support'
    }
    return categories[agentType] || 'General'
  }

  /**
   * Get persona tags
   */
  private getPersonaTags(persona: AgentPersona): string[] {
    return persona.metadata.tags || []
  }
}