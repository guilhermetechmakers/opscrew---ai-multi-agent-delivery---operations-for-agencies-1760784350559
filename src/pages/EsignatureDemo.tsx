/**
 * E-Signature Demo Page
 * Demonstrates the complete e-signature integration functionality
 */

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Activity,
  Webhook,
  Shield,
  Zap,
  ArrowLeft,
  Play,
  Code,
  Eye
} from 'lucide-react'
import { EsignatureDashboard } from '@/components/proposals/EsignatureDashboard'
import type { Proposal } from '@/types/database/proposals'

// Mock proposal data for demonstration
const mockProposal: Proposal = {
  id: 'proposal-123',
  user_id: 'user-123',
  template_id: 'template-456',
  title: 'Website Development Proposal',
  client_name: 'Acme Corporation',
  client_email: 'client@acme.com',
  project_scope: 'Full-stack web application development',
  budget_range: '$50,000 - $75,000',
  timeline: '12 weeks',
  content: `
    <h2>Project Overview</h2>
    <p>We propose to develop a comprehensive web application for Acme Corporation that will streamline their business operations and improve customer engagement.</p>
    
    <h3>Scope of Work</h3>
    <ul>
      <li>Frontend development using React and TypeScript</li>
      <li>Backend API development with Node.js</li>
      <li>Database design and implementation</li>
      <li>User authentication and authorization</li>
      <li>Payment integration</li>
      <li>Mobile-responsive design</li>
    </ul>
    
    <h3>Timeline</h3>
    <p>The project will be completed in 12 weeks with the following milestones:</p>
    <ul>
      <li>Week 1-3: Project setup and design</li>
      <li>Week 4-8: Core development</li>
      <li>Week 9-11: Testing and refinement</li>
      <li>Week 12: Deployment and handover</li>
    </ul>
    
    <h3>Investment</h3>
    <p>Total project cost: $62,500</p>
    <p>Payment terms: 50% upfront, 50% on completion</p>
  `,
  variables: {
    client_name: 'Acme Corporation',
    client_email: 'client@acme.com',
    project_scope: 'Full-stack web application development',
    budget_range: '$50,000 - $75,000',
    timeline: '12 weeks'
  },
  status: 'approved',
  version: 1,
  requires_approval: true,
  approval_status: 'approved',
  approved_by: 'manager-123',
  approved_at: '2024-01-15T10:30:00Z',
  approval_notes: 'Approved for e-signature',
  esign_status: 'sent',
  esign_provider: 'docusign',
  esign_envelope_id: 'env_abc123def456',
  esign_signed_at: null,
  esign_document_url: null,
  metadata: {
    created_by_agent: 'intake-agent',
    confidence_score: 0.95,
    estimated_value: 62500
  },
  created_at: '2024-01-10T09:00:00Z',
  updated_at: '2024-01-15T10:30:00Z',
  sent_at: '2024-01-15T10:30:00Z'
}

export function EsignatureDemo() {
  const [proposal, setProposal] = useState<Proposal>(mockProposal)
  const [activeDemo, setActiveDemo] = useState('dashboard')

  const handleProposalChange = (updatedProposal: Proposal) => {
    setProposal(updatedProposal)
  }

  const demoOptions = [
    {
      id: 'dashboard',
      title: 'Complete Dashboard',
      description: 'Full e-signature management interface',
      icon: <BarChart3 className="h-5 w-5" />,
      component: <EsignatureDashboard proposal={proposal} onStatusChange={handleProposalChange} />
    },
    {
      id: 'integration',
      title: 'Integration Component',
      description: 'Core e-signature workflow management',
      icon: <FileText className="h-5 w-5" />,
      component: <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>E-Signature Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This component handles the complete e-signature workflow including sending documents, 
              tracking signatures, and managing the approval process.
            </p>
          </CardContent>
        </Card>
      </div>
    },
    {
      id: 'tracker',
      title: 'Status Tracker',
      description: 'Real-time signature status monitoring',
      icon: <Activity className="h-5 w-5" />,
      component: <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Signature Status Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Real-time tracking of signature status with detailed timeline and audit trail.
            </p>
          </CardContent>
        </Card>
      </div>
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Comprehensive signature analytics and reporting',
      icon: <BarChart3 className="h-5 w-5" />,
      component: <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>E-Signature Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Advanced analytics and reporting for signature workflows with performance metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    },
    {
      id: 'webhooks',
      title: 'Webhook Handler',
      description: 'Real-time webhook event processing',
      icon: <Webhook className="h-5 w-5" />,
      component: <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Webhook Event Handler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Process real-time webhook events from e-signature providers for instant status updates.
            </p>
          </CardContent>
        </Card>
      </div>
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                E-Signature Integration Demo
              </h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive e-signature workflow management for OpsCrew
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Shield className="h-3 w-3 mr-1" />
              Production Ready
            </Badge>
          </div>
        </motion.div>

        {/* Demo Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Demo Components</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {demoOptions.map((option) => (
                  <motion.div
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 ${
                        activeDemo === option.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                          : 'hover:shadow-lg'
                      }`}
                      onClick={() => setActiveDemo(option.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            activeDemo === option.id 
                              ? 'bg-blue-100 dark:bg-blue-900' 
                              : 'bg-muted'
                          }`}>
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{option.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                          {activeDemo === option.id && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Active
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Demo Content */}
        <motion.div
          key={activeDemo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeDemo === 'dashboard' ? (
            <EsignatureDashboard 
              proposal={proposal} 
              onStatusChange={handleProposalChange}
            />
          ) : (
            demoOptions.find(option => option.id === activeDemo)?.component
          )}
        </motion.div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Implementation Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h4 className="font-medium">DocuSign Integration</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Full DocuSign API integration with JWT authentication, envelope management, and webhook processing.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h4 className="font-medium">Real-time Updates</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Live status tracking with webhook events and automatic UI updates.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h4 className="font-medium">Analytics Dashboard</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive analytics with charts, metrics, and performance insights.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h4 className="font-medium">Error Handling</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Robust error handling with user-friendly messages and retry mechanisms.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h4 className="font-medium">Modern UI</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Beautiful, responsive interface with animations and dark mode support.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h4 className="font-medium">TypeScript</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fully typed implementation with comprehensive type definitions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}