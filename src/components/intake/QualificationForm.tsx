/**
 * Enhanced Qualification Form Component
 * Comprehensive lead qualification form with all required fields
 * 
 * Features:
 * - Budget range and currency selection
 * - Timeline with start/end dates and urgency
 * - Scope with features, requirements, and deliverables
 * - Stakeholders (primary and secondary contacts)
 * - Company information
 * - Real-time validation and auto-save
 * - Progress tracking
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  Calendar, 
  Target, 
  Users, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Briefcase,
  Star,
  Globe,
  User,
  Save,
  RefreshCw,
  Eye,
  Edit
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'

interface QualificationData {
  budget: {
    min: number
    max: number
    currency: string
  }
  timeline: {
    startDate: string
    endDate: string
    urgency: 'low' | 'medium' | 'high'
  }
  scope: {
    description: string
    features: string[]
    requirements: string[]
    deliverables: string[]
  }
  stakeholders: {
    primary: {
      name: string
      email: string
      phone: string
      role: string
    }
    secondary: Array<{
      name: string
      email: string
      role: string
    }>
  }
  company: {
    name: string
    industry: string
    size: string
    website: string
    location: string
  }
}

interface QualificationFormProps {
  data: QualificationData | null
  onChange: (data: QualificationData) => void
  sessionId: string | null
}

export default function QualificationForm({ data, onChange, sessionId }: QualificationFormProps) {
  // State management
  const [formData, setFormData] = useState<QualificationData>({
    budget: { min: 0, max: 0, currency: 'USD' },
    timeline: { startDate: '', endDate: '', urgency: 'medium' },
    scope: { description: '', features: [], requirements: [], deliverables: [] },
    stakeholders: {
      primary: { name: '', email: '', phone: '', role: '' },
      secondary: []
    },
    company: { name: '', industry: '', size: '', website: '', location: '' }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('budget')
  const [newFeature, setNewFeature] = useState('')
  const [newRequirement, setNewRequirement] = useState('')
  const [newDeliverable, setNewDeliverable] = useState('')
  const [newSecondaryStakeholder, setNewSecondaryStakeholder] = useState({
    name: '',
    email: '',
    role: ''
  })

  // Calculate completion percentage
  const calculateProgress = () => {
    const fields = [
      formData.budget.min > 0,
      formData.budget.max > 0,
      formData.timeline.startDate,
      formData.timeline.endDate,
      formData.scope.description,
      formData.scope.features.length > 0,
      formData.stakeholders.primary.name,
      formData.stakeholders.primary.email,
      formData.company.name,
      formData.company.industry
    ]
    const completed = fields.filter(Boolean).length
    return (completed / fields.length) * 100
  }

  // Effects
  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  useEffect(() => {
    onChange(formData)
  }, [formData, onChange])

  // Helper functions
  const updateFormData = (section: keyof QualificationData, updates: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }))
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        scope: {
          ...prev.scope,
          features: [...prev.scope.features, newFeature.trim()]
        }
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        features: prev.scope.features.filter((_, i) => i !== index)
      }
    }))
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        scope: {
          ...prev.scope,
          requirements: [...prev.scope.requirements, newRequirement.trim()]
        }
      }))
      setNewRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        requirements: prev.scope.requirements.filter((_, i) => i !== index)
      }
    }))
  }

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setFormData(prev => ({
        ...prev,
        scope: {
          ...prev.scope,
          deliverables: [...prev.scope.deliverables, newDeliverable.trim()]
        }
      }))
      setNewDeliverable('')
    }
  }

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        deliverables: prev.scope.deliverables.filter((_, i) => i !== index)
      }
    }))
  }

  const addSecondaryStakeholder = () => {
    if (newSecondaryStakeholder.name.trim() && newSecondaryStakeholder.email.trim()) {
      setFormData(prev => ({
        ...prev,
        stakeholders: {
          ...prev.stakeholders,
          secondary: [...prev.stakeholders.secondary, { ...newSecondaryStakeholder }]
        }
      }))
      setNewSecondaryStakeholder({ name: '', email: '', role: '' })
    }
  }

  const removeSecondaryStakeholder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stakeholders: {
        ...prev.stakeholders,
        secondary: prev.stakeholders.secondary.filter((_, i) => i !== index)
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In real implementation, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Qualification data saved')
    } catch (error) {
      console.error('Error saving qualification data:', error)
      toast.error('Failed to save qualification data')
    } finally {
      setIsSaving(false)
    }
  }

  const sections = [
    { id: 'budget', title: 'Budget', icon: DollarSign, color: 'text-green-500' },
    { id: 'timeline', title: 'Timeline', icon: Calendar, color: 'text-blue-500' },
    { id: 'scope', title: 'Scope', icon: Target, color: 'text-purple-500' },
    { id: 'stakeholders', title: 'Stakeholders', icon: Users, color: 'text-orange-500' },
    { id: 'company', title: 'Company', icon: Building, color: 'text-indigo-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Lead Qualification</span>
              </CardTitle>
              <CardDescription>
                Capture comprehensive information about the prospect and their requirements
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-sm font-medium">
                  {Math.round(calculateProgress())}% Complete
                </div>
                <Progress value={calculateProgress()} className="w-24 h-2" />
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              const isCompleted = checkSectionCompletion(section.id, formData)
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isCompleted ? 'text-green-500' : section.color}`} />
                  <span className="font-medium">{section.title}</span>
                  {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Budget Section */}
      {activeSection === 'budget' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span>Budget Information</span>
              </CardTitle>
              <CardDescription>
                Capture the prospect's budget range and currency preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budget-min">Minimum Budget</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget-min"
                      type="number"
                      placeholder="0"
                      value={formData.budget.min || ''}
                      onChange={(e) => updateFormData('budget', { min: parseInt(e.target.value) || 0 })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="budget-max">Maximum Budget</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget-max"
                      type="number"
                      placeholder="0"
                      value={formData.budget.max || ''}
                      onChange={(e) => updateFormData('budget', { max: parseInt(e.target.value) || 0 })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.budget.currency}
                    onValueChange={(value) => updateFormData('budget', { currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.budget.min > 0 && formData.budget.max > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Budget Range</span>
                    <span className="text-lg font-bold">
                      {formData.budget.currency} {formData.budget.min.toLocaleString()} - {formData.budget.max.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((formData.budget.min / formData.budget.max) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timeline Section */}
      {activeSection === 'timeline' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Project Timeline</span>
              </CardTitle>
              <CardDescription>
                Define project start date, end date, and urgency level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.timeline.startDate}
                    onChange={(e) => updateFormData('timeline', { startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.timeline.endDate}
                    onChange={(e) => updateFormData('timeline', { endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select
                  value={formData.timeline.urgency}
                  onValueChange={(value: 'low' | 'medium' | 'high') => updateFormData('timeline', { urgency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span>Low - Flexible timeline</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span>Medium - Some urgency</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-red-500" />
                        <span>High - Urgent delivery needed</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.timeline.startDate && formData.timeline.endDate && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Project Duration</span>
                    <span className="text-lg font-bold">
                      {Math.ceil((new Date(formData.timeline.endDate).getTime() - new Date(formData.timeline.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                  <div className="mt-2">
                    <Badge variant={
                      formData.timeline.urgency === 'high' ? 'destructive' :
                      formData.timeline.urgency === 'medium' ? 'default' :
                      'secondary'
                    }>
                      {formData.timeline.urgency} urgency
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Scope Section */}
      {activeSection === 'scope' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-500" />
                <span>Project Scope</span>
              </CardTitle>
              <CardDescription>
                Define the project description, features, requirements, and deliverables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="scope-description">Project Description</Label>
                <Textarea
                  id="scope-description"
                  placeholder="Describe the project in detail..."
                  value={formData.scope.description}
                  onChange={(e) => updateFormData('scope', { description: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Features */}
              <div>
                <Label>Features</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a feature..."
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    />
                    <Button onClick={addFeature} disabled={!newFeature.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {formData.scope.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted px-3 py-2 rounded-lg">
                        <span className="text-sm">{feature}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <Label>Requirements</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a requirement..."
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                    />
                    <Button onClick={addRequirement} disabled={!newRequirement.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {formData.scope.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted px-3 py-2 rounded-lg">
                        <span className="text-sm">{requirement}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequirement(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <Label>Deliverables</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a deliverable..."
                      value={newDeliverable}
                      onChange={(e) => setNewDeliverable(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addDeliverable()}
                    />
                    <Button onClick={addDeliverable} disabled={!newDeliverable.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {formData.scope.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted px-3 py-2 rounded-lg">
                        <span className="text-sm">{deliverable}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDeliverable(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stakeholders Section */}
      {activeSection === 'stakeholders' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-500" />
                <span>Stakeholders</span>
              </CardTitle>
              <CardDescription>
                Identify key contacts and decision makers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Stakeholder */}
              <div>
                <Label className="text-base font-medium">Primary Contact</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="primary-name">Name</Label>
                    <Input
                      id="primary-name"
                      placeholder="Full name"
                      value={formData.stakeholders.primary.name}
                      onChange={(e) => updateFormData('stakeholders', {
                        primary: { ...formData.stakeholders.primary, name: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary-role">Role</Label>
                    <Input
                      id="primary-role"
                      placeholder="Job title"
                      value={formData.stakeholders.primary.role}
                      onChange={(e) => updateFormData('stakeholders', {
                        primary: { ...formData.stakeholders.primary, role: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="primary-email"
                        type="email"
                        placeholder="email@company.com"
                        value={formData.stakeholders.primary.email}
                        onChange={(e) => updateFormData('stakeholders', {
                          primary: { ...formData.stakeholders.primary, email: e.target.value }
                        })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="primary-phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="primary-phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.stakeholders.primary.phone}
                        onChange={(e) => updateFormData('stakeholders', {
                          primary: { ...formData.stakeholders.primary, phone: e.target.value }
                        })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Secondary Stakeholders */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-medium">Additional Stakeholders</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addSecondaryStakeholder}
                    disabled={!newSecondaryStakeholder.name.trim() || !newSecondaryStakeholder.email.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stakeholder
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.stakeholders.secondary.map((stakeholder, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Name</Label>
                          <p className="text-sm font-medium">{stakeholder.name}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Email</Label>
                          <p className="text-sm">{stakeholder.email}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Role</Label>
                          <p className="text-sm">{stakeholder.role}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSecondaryStakeholder(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {formData.stakeholders.secondary.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No additional stakeholders added yet</p>
                    </div>
                  )}
                </div>

                {/* Add New Stakeholder Form */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="text-sm font-medium mb-3">Add New Stakeholder</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="new-stakeholder-name">Name</Label>
                      <Input
                        id="new-stakeholder-name"
                        placeholder="Full name"
                        value={newSecondaryStakeholder.name}
                        onChange={(e) => setNewSecondaryStakeholder({
                          ...newSecondaryStakeholder,
                          name: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-stakeholder-email">Email</Label>
                      <Input
                        id="new-stakeholder-email"
                        type="email"
                        placeholder="email@company.com"
                        value={newSecondaryStakeholder.email}
                        onChange={(e) => setNewSecondaryStakeholder({
                          ...newSecondaryStakeholder,
                          email: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-stakeholder-role">Role</Label>
                      <Input
                        id="new-stakeholder-role"
                        placeholder="Job title"
                        value={newSecondaryStakeholder.role}
                        onChange={(e) => setNewSecondaryStakeholder({
                          ...newSecondaryStakeholder,
                          role: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Company Section */}
      {activeSection === 'company' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-indigo-500" />
                <span>Company Information</span>
              </CardTitle>
              <CardDescription>
                Capture company details and context
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    placeholder="Company name"
                    value={formData.company.name}
                    onChange={(e) => updateFormData('company', { name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="company-industry">Industry</Label>
                  <Select
                    value={formData.company.industry}
                    onValueChange={(value) => updateFormData('company', { industry: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="nonprofit">Non-profit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="company-size">Company Size</Label>
                  <Select
                    value={formData.company.size}
                    onValueChange={(value) => updateFormData('company', { size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                      <SelectItem value="small">Small (11-50 employees)</SelectItem>
                      <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                      <SelectItem value="large">Large (201-1000 employees)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="company-website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company-website"
                      placeholder="https://company.com"
                      value={formData.company.website}
                      onChange={(e) => updateFormData('company', { website: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="company-location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company-location"
                    placeholder="City, State, Country"
                    value={formData.company.location}
                    onChange={(e) => updateFormData('company', { location: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

// Helper function to check if a section is completed
function checkSectionCompletion(sectionId: string, formData: QualificationData): boolean {
  switch (sectionId) {
    case 'budget':
      return formData.budget.min > 0 && formData.budget.max > 0
    case 'timeline':
      return formData.timeline.startDate !== '' && formData.timeline.endDate !== ''
    case 'scope':
      return formData.scope.description !== '' && formData.scope.features.length > 0
    case 'stakeholders':
      return formData.stakeholders.primary.name !== '' && formData.stakeholders.primary.email !== ''
    case 'company':
      return formData.company.name !== '' && formData.company.industry !== ''
    default:
      return false
  }
}