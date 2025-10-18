/**
 * AI Sprint Planner Component
 * Provides AI-powered sprint planning and task generation
 */

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, 
  Zap, 
  Bot, 
  Target, 
  Clock, 
  Users, 
  CheckCircle2,
  ArrowRight,
  Loader2,
  Brain,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AISprintPlannerProps {
  onSprintGenerated?: (sprint: any) => void
  onClose?: () => void
}

interface GeneratedTask {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  storyPoints: number
  estimatedHours: number
  acceptanceCriteria: string[]
  aiConfidence: number
}

interface GeneratedSprint {
  name: string
  description: string
  duration: number
  goals: string[]
  successCriteria: string[]
  tasks: GeneratedTask[]
  totalStoryPoints: number
  totalEstimatedHours: number
}

export function AISprintPlanner({ onSprintGenerated, onClose }: AISprintPlannerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedSprint, setGeneratedSprint] = useState<GeneratedSprint | null>(null)
  
  // Form state
  const [sprintGoals, setSprintGoals] = useState('')
  const [timeline, setTimeline] = useState('14')
  const [teamSize, setTeamSize] = useState('3')
  const [complexity, setComplexity] = useState('medium')
  const [focusArea, setFocusArea] = useState('')

  const generateSprint = async () => {
    if (!sprintGoals.trim()) return

    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate AI generation process
    const steps = [
      'Analyzing sprint goals...',
      'Generating user stories...',
      'Estimating story points...',
      'Creating acceptance criteria...',
      'Optimizing task distribution...',
      'Finalizing sprint plan...'
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setGenerationProgress((i + 1) / steps.length * 100)
    }

    // Generate mock sprint data
    const mockSprint: GeneratedSprint = {
      name: `Sprint ${Math.floor(Math.random() * 100)} - ${sprintGoals.split(' ').slice(0, 3).join(' ')}`,
      description: `AI-generated sprint focused on: ${sprintGoals}`,
      duration: parseInt(timeline),
      goals: [
        sprintGoals,
        'Improve system performance',
        'Enhance user experience',
        'Implement new features'
      ],
      successCriteria: [
        'All tasks completed within timeline',
        'Code review completed for all changes',
        'Tests passing with >90% coverage',
        'Deployed to staging environment'
      ],
      tasks: [
        {
          id: '1',
          title: 'Implement user authentication system',
          description: 'Create secure login and registration functionality with JWT tokens',
          priority: 'high',
          storyPoints: 8,
          estimatedHours: 12,
          acceptanceCriteria: [
            'User can register with email and password',
            'User can login and receive JWT token',
            'Password reset functionality works',
            'Email verification is implemented'
          ],
          aiConfidence: 0.92
        },
        {
          id: '2',
          title: 'Design responsive dashboard layout',
          description: 'Create mobile-first responsive dashboard with modern UI components',
          priority: 'medium',
          storyPoints: 5,
          estimatedHours: 8,
          acceptanceCriteria: [
            'Dashboard works on mobile, tablet, and desktop',
            'All components are accessible',
            'Loading states are implemented',
            'Error handling is in place'
          ],
          aiConfidence: 0.88
        },
        {
          id: '3',
          title: 'Set up automated testing pipeline',
          description: 'Configure CI/CD pipeline with automated testing and deployment',
          priority: 'high',
          storyPoints: 6,
          estimatedHours: 10,
          acceptanceCriteria: [
            'Unit tests run on every commit',
            'Integration tests are automated',
            'Deployment to staging is automated',
            'Code coverage is tracked'
          ],
          aiConfidence: 0.85
        },
        {
          id: '4',
          title: 'Implement data validation and sanitization',
          description: 'Add comprehensive input validation and data sanitization',
          priority: 'medium',
          storyPoints: 3,
          estimatedHours: 6,
          acceptanceCriteria: [
            'All user inputs are validated',
            'SQL injection prevention is in place',
            'XSS protection is implemented',
            'Data sanitization is working'
          ],
          aiConfidence: 0.90
        },
        {
          id: '5',
          title: 'Create API documentation',
          description: 'Generate comprehensive API documentation with examples',
          priority: 'low',
          storyPoints: 2,
          estimatedHours: 4,
          acceptanceCriteria: [
            'All endpoints are documented',
            'Request/response examples are provided',
            'Authentication methods are explained',
            'Error codes are documented'
          ],
          aiConfidence: 0.87
        }
      ],
      totalStoryPoints: 24,
      totalEstimatedHours: 40
    }

    setGeneratedSprint(mockSprint)
    setIsGenerating(false)
  }

  const priorityConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
  }

  if (isGenerating) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Brain className="w-8 h-8 text-primary" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-2">AI is generating your sprint plan...</h3>
          <p className="text-muted-foreground mb-4">This may take a few moments</p>
          <Progress value={generationProgress} className="w-full max-w-md mx-auto" />
        </div>
      </div>
    )
  }

  if (generatedSprint) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
          >
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-2">Sprint Plan Generated!</h3>
          <p className="text-muted-foreground">Your AI-powered sprint is ready</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {generatedSprint.name}
            </CardTitle>
            <CardDescription>{generatedSprint.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sprint Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{generatedSprint.duration}</div>
                <div className="text-sm text-muted-foreground">Days</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{generatedSprint.totalStoryPoints}</div>
                <div className="text-sm text-muted-foreground">Story Points</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{generatedSprint.totalEstimatedHours}</div>
                <div className="text-sm text-muted-foreground">Hours</div>
              </div>
            </div>

            {/* Sprint Goals */}
            <div>
              <h4 className="font-semibold mb-3">Sprint Goals</h4>
              <div className="space-y-2">
                {generatedSprint.goals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Tasks */}
            <div>
              <h4 className="font-semibold mb-3">Generated Tasks ({generatedSprint.tasks.length})</h4>
              <div className="space-y-3">
                {generatedSprint.tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium">{task.title}</h5>
                      <div className="flex items-center gap-2">
                        <Badge className={priorityConfig[task.priority].color}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">
                          {task.storyPoints} pts
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {task.estimatedHours}h
                        </span>
                        <span className="flex items-center gap-1">
                          <Bot className="w-4 h-4" />
                          {Math.round(task.aiConfidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => onSprintGenerated?.(generatedSprint)}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Create Sprint
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setGeneratedSprint(null)}
              >
                Regenerate
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center"
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">AI Sprint Planner</h3>
        <p className="text-muted-foreground">Generate intelligent sprint plans with AI-powered task breakdown</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configure Your Sprint</CardTitle>
          <CardDescription>
            Provide details about your sprint goals and team to generate an optimized plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="sprint-goals">Sprint Goals *</Label>
            <Textarea
              id="sprint-goals"
              placeholder="Describe what you want to achieve in this sprint... (e.g., Implement user authentication, improve performance, add new features)"
              value={sprintGoals}
              onChange={(e) => setSprintGoals(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeline">Timeline (days)</Label>
              <Input
                id="timeline"
                type="number"
                placeholder="14"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="team-size">Team Size</Label>
              <Input
                id="team-size"
                type="number"
                placeholder="3"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="complexity">Project Complexity</Label>
              <select
                id="complexity"
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="low">Low - Simple features, minimal dependencies</option>
                <option value="medium">Medium - Moderate complexity, some integrations</option>
                <option value="high">High - Complex features, multiple integrations</option>
                <option value="very-high">Very High - Enterprise-level complexity</option>
              </select>
            </div>
            <div>
              <Label htmlFor="focus-area">Focus Area (optional)</Label>
              <Input
                id="focus-area"
                placeholder="e.g., Frontend, Backend, Mobile, DevOps"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={generateSprint}
              disabled={!sprintGoals.trim()}
              className="flex-1"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate Sprint Plan
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
