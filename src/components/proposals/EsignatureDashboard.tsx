/**
 * E-Signature Dashboard Component
 * Comprehensive dashboard for managing e-signature workflows
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Activity,
  Webhook,
  Shield,
  Zap,
  RefreshCw,
  Download,
  Plus,
  Filter,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EsignatureIntegration } from './EsignatureIntegration'
import { SignatureStatusTracker } from './SignatureStatusTracker'
import { EsignatureAnalytics } from './EsignatureAnalytics'
import { EsignatureWebhookHandler } from './EsignatureWebhookHandler'
import { useProposalSignatures } from '@/hooks/useProposalSignatures'
import type { Proposal } from '@/types/database/proposals'

interface EsignatureDashboardProps {
  proposal: Proposal
  onStatusChange?: (proposal: Proposal) => void
}

export function EsignatureDashboard({ proposal, onStatusChange }: EsignatureDashboardProps) {
  const { data: signatures = [], isLoading, refetch } = useProposalSignatures(proposal.id)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Calculate summary statistics
  const summaryStats = {
    totalSignatures: signatures.length,
    completedSignatures: signatures.filter(s => s.status === 'signed').length,
    pendingSignatures: signatures.filter(s => s.status === 'pending').length,
    declinedSignatures: signatures.filter(s => s.status === 'declined').length,
    expiredSignatures: signatures.filter(s => s.status === 'expired').length,
    completionRate: signatures.length > 0 
      ? (signatures.filter(s => s.status === 'signed').length / signatures.length) * 100 
      : 0
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting signature data...')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-xl">E-Signature Dashboard</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage and monitor electronic signatures for "{proposal.title}"
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(proposal.esign_status)}>
                <span className="capitalize">{proposal.esign_status.replace('_', ' ')}</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{summaryStats.totalSignatures}</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{summaryStats.completedSignatures}</p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{summaryStats.pendingSignatures}</p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Declined</p>
                  <p className="text-2xl font-bold text-red-600">{summaryStats.declinedSignatures}</p>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{Math.round(summaryStats.completionRate)}%</p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search signatures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="tracker" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Tracker</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center space-x-2">
            <Webhook className="h-4 w-4" />
            <span>Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <EsignatureIntegration 
            proposal={proposal} 
            onStatusChange={onStatusChange}
          />
        </TabsContent>

        {/* Tracker Tab */}
        <TabsContent value="tracker">
          <SignatureStatusTracker 
            signatures={signatures}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <EsignatureAnalytics 
            signatures={signatures}
            onExport={handleExport}
          />
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <EsignatureWebhookHandler 
            proposal={proposal}
            onStatusChange={onStatusChange}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>E-Signature Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Settings Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Advanced e-signature configuration options will be available here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}