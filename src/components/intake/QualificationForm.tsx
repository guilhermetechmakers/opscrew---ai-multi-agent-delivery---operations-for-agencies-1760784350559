/**
 * Qualification Form Component for Intake Chat
 * Displays and allows editing of qualification data extracted from conversations
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Target, 
  DollarSign, 
  Clock, 
  Users, 
  CheckCircle, 
  Edit, 
  Save, 
  X,
  TrendingUp,
  AlertCircle,
  Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import type { IntakeQualification } from '@/types/database/intake-qualifications'

interface QualificationFormProps {
  qualification: IntakeQualification | null
  onUpdate: (updates: Partial<IntakeQualification>) => void
  onSave?: () => void
  isLoading?: boolean
  className?: string
}

const QUALIFICATION_SCORE_COLORS = {
  low: 'text-red-600 dark:text-red-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  high: 'text-green-600 dark:text-green-400'
}

const QUALIFICATION_SCORE_LABELS = {
  low: 'Low',
  medium: 'Medium', 
  high: 'High'
}

export default function QualificationForm({
  qualification,
  onUpdate,
  onSave,
  isLoading = false,
  className = ''
}: QualificationFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Partial<IntakeQualification>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (qualification) {
      setEditedData(qualification)
    }
  }, [qualification])

  const handleSave = async () => {
    if (!onSave) return
    
    setIsSaving(true)
    try {
      await onSave()
      setIsEditing(false)
      toast.success('Qualification data saved successfully')
    } catch (error) {
      toast.error('Failed to save qualification data')
      console.error('Save qualification error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedData(qualification || {})
    setIsEditing(false)
  }

  const getScoreLevel = (score: number) => {
    if (score >= 80) return 'high'
    if (score >= 50) return 'medium'
    return 'low'
  }

  const getScoreColor = (score: number) => {
    const level = getScoreLevel(score)
    return QUALIFICATION_SCORE_COLORS[level]
  }

  const getScoreLabel = (score: number) => {
    const level = getScoreLevel(score)
    return QUALIFICATION_SCORE_LABELS[level]
  }

  if (!qualification) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No qualification data available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start a conversation to begin qualification
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Lead Qualification
            <Badge 
              variant={qualification.qualification_status === 'qualified' ? 'default' : 'secondary'}
              className="ml-2"
            >
              {qualification.qualification_status}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Qualification Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Qualification Score
            </Label>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${getScoreColor(qualification.qualification_score)}`}>
                {qualification.qualification_score}%
              </span>
              <Badge variant="outline" className={getScoreColor(qualification.qualification_score)}>
                {getScoreLabel(qualification.qualification_score)}
              </Badge>
            </div>
          </div>
          <Progress 
            value={qualification.qualification_score} 
            className="h-2"
          />
        </div>

        <Separator />

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Project Type</Label>
            {isEditing ? (
              <Input
                value={editedData.project_type || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, project_type: e.target.value }))}
                placeholder="e.g., Web Application, Mobile App"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {qualification.project_type || 'Not specified'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Budget Range</Label>
            {isEditing ? (
              <Input
                value={editedData.budget_range || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, budget_range: e.target.value }))}
                placeholder="e.g., $50,000 - $100,000"
              />
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {qualification.budget_range || 'Not specified'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Timeline</Label>
            {isEditing ? (
              <Input
                value={editedData.timeline || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, timeline: e.target.value }))}
                placeholder="e.g., 3-6 months"
              />
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {qualification.timeline || 'Not specified'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Project Scope</Label>
            {isEditing ? (
              <Textarea
                value={editedData.project_scope || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, project_scope: e.target.value }))}
                placeholder="Brief description of project scope"
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {qualification.project_scope || 'Not specified'}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Stakeholders */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Key Stakeholders
          </Label>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedData.stakeholders?.join(', ') || ''}
                onChange={(e) => setEditedData(prev => ({ 
                  ...prev, 
                  stakeholders: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                placeholder="Enter stakeholders separated by commas"
                rows={2}
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {qualification.stakeholders?.length > 0 ? (
                qualification.stakeholders.map((stakeholder, index) => (
                  <Badge key={index} variant="secondary">
                    {stakeholder}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No stakeholders identified</p>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Requirements */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Requirements</Label>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedData.requirements?.join(', ') || ''}
                onChange={(e) => setEditedData(prev => ({ 
                  ...prev, 
                  requirements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                placeholder="Enter requirements separated by commas"
                rows={3}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {qualification.requirements?.length > 0 ? (
                qualification.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm">{requirement}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No requirements identified</p>
              )}
            </div>
          )}
        </div>

        {/* Additional Data */}
        <AnimatePresence>
          {(qualification.pain_points?.length > 0 || qualification.success_metrics?.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <Separator />
              
              {/* Pain Points */}
              {qualification.pain_points?.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-red-600 dark:text-red-400">
                    Pain Points
                  </Label>
                  <div className="space-y-1">
                    {qualification.pain_points.map((point, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <span className="text-sm">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Metrics */}
              {qualification.success_metrics?.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-600 dark:text-green-400">
                    Success Metrics
                  </Label>
                  <div className="space-y-1">
                    {qualification.success_metrics.map((metric, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-sm">{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Panel */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Qualification Data
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              This data is automatically extracted from the conversation and can be manually edited. 
              Higher scores indicate better qualified leads.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
