/**
 * Template Library component for browsing and selecting proposal templates
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Eye, 
  Plus,
  FileText,
  Code,
  Smartphone,
  Briefcase,
  Wrench,
  Settings
} from 'lucide-react'
import { useProposalTemplates, usePublicProposalTemplates } from '@/hooks/useProposalTemplates'
import { useAuth } from '@/hooks/useAuth'
import type { ProposalTemplate } from '@/types/database/proposal-templates'

interface TemplateLibraryProps {
  onSelectTemplate: (template: ProposalTemplate) => void
  onCreateTemplate: () => void
  className?: string
}

const categoryIcons = {
  'general': FileText,
  'web-development': Code,
  'mobile-app': Smartphone,
  'consulting': Briefcase,
  'maintenance': Wrench,
  'custom': Settings
}

const categoryLabels = {
  'general': 'General',
  'web-development': 'Web Development',
  'mobile-app': 'Mobile App',
  'consulting': 'Consulting',
  'maintenance': 'Maintenance',
  'custom': 'Custom'
}

export function TemplateLibrary({ 
  onSelectTemplate, 
  onCreateTemplate, 
  className 
}: TemplateLibraryProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Fetch templates
  const { data: userTemplates = [], isLoading: userTemplatesLoading } = useProposalTemplates(user?.id || '')
  const { data: publicTemplates = [], isLoading: publicTemplatesLoading } = usePublicProposalTemplates()

  // Filter templates based on search and category
  const filteredUserTemplates = userTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredPublicTemplates = publicTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { value: 'all', label: 'All Categories', count: userTemplates.length + publicTemplates.length },
    { value: 'general', label: 'General', count: userTemplates.filter(t => t.category === 'general').length + publicTemplates.filter(t => t.category === 'general').length },
    { value: 'web-development', label: 'Web Development', count: userTemplates.filter(t => t.category === 'web-development').length + publicTemplates.filter(t => t.category === 'web-development').length },
    { value: 'mobile-app', label: 'Mobile App', count: userTemplates.filter(t => t.category === 'mobile-app').length + publicTemplates.filter(t => t.category === 'mobile-app').length },
    { value: 'consulting', label: 'Consulting', count: userTemplates.filter(t => t.category === 'consulting').length + publicTemplates.filter(t => t.category === 'consulting').length },
    { value: 'maintenance', label: 'Maintenance', count: userTemplates.filter(t => t.category === 'maintenance').length + publicTemplates.filter(t => t.category === 'maintenance').length },
    { value: 'custom', label: 'Custom', count: userTemplates.filter(t => t.category === 'custom').length + publicTemplates.filter(t => t.category === 'custom').length }
  ]

  const TemplateCard = ({ template, isPublic = false }: { template: ProposalTemplate; isPublic?: boolean }) => {
    const IconComponent = categoryIcons[template.category] || FileText
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="group"
      >
        <Card 
          className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-primary/5"
          onClick={() => onSelectTemplate(template)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base text-foreground">{template.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {categoryLabels[template.category]}
                  </CardDescription>
                </div>
              </div>
              {isPublic && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Public
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {template.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {template.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {template.usage_count} uses
                </span>
                {template.last_used_at && (
                  <span>
                    Used {new Date(template.last_used_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" className="btn-primary">
                  Use Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground gradient-text-primary">Template Library</h2>
          <p className="text-muted-foreground">
            Choose from our collection of proposal templates or create your own
          </p>
        </div>
        <Button onClick={onCreateTemplate} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              {category.label}
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Templates */}
      <Tabs defaultValue="my-templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-templates">
            My Templates ({userTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="public-templates">
            Public Templates ({publicTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-templates" className="space-y-4">
          {userTemplatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-24" />
                        <div className="h-3 bg-muted rounded w-16" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredUserTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUserTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No templates match your search criteria.' : 'You haven\'t created any templates yet.'}
                </p>
                <Button onClick={onCreateTemplate} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="public-templates" className="space-y-4">
          {publicTemplatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-24" />
                        <div className="h-3 bg-muted rounded w-16" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPublicTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPublicTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} isPublic />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No public templates found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No public templates match your search criteria.' : 'There are no public templates available yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}