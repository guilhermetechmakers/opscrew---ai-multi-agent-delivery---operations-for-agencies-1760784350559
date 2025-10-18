/**
 * E-Signature Analytics Component
 * Comprehensive analytics and reporting for signature workflows
 */

import React, { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar,
  Download,
  RefreshCw,
  Activity,
  Zap,
  Shield,
  Target
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import type { ProposalSignature } from '@/types/database/proposal-signatures'

interface EsignatureAnalyticsProps {
  signatures: ProposalSignature[]
  timeRange?: '7d' | '30d' | '90d' | '1y' | 'all'
  onTimeRangeChange?: (range: string) => void
  onExport?: () => void
}

interface AnalyticsData {
  totalSignatures: number
  completedSignatures: number
  pendingSignatures: number
  declinedSignatures: number
  expiredSignatures: number
  averageSignTime: number
  completionRate: number
  declineRate: number
  averageResponseTime: number
  peakSigningHours: number[]
  statusDistribution: Array<{ status: string; count: number; percentage: number }>
  dailySignatures: Array<{ date: string; signed: number; pending: number; declined: number }>
  hourlyDistribution: Array<{ hour: number; count: number }>
  providerStats: Array<{ provider: string; count: number; successRate: number }>
}

const COLORS = {
  signed: '#10b981',
  pending: '#f59e0b',
  declined: '#ef4444',
  expired: '#6b7280'
}

export function EsignatureAnalytics({ 
  signatures, 
  timeRange = '30d',
  onTimeRangeChange,
  onExport 
}: EsignatureAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState('overview')

  // Calculate analytics data
  const analyticsData: AnalyticsData = useMemo(() => {
    const now = new Date()
    const timeRangeMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
      'all': Infinity
    }

    const filteredSignatures = signatures.filter(sig => {
      if (timeRange === 'all') return true
      const sigDate = new Date(sig.created_at)
      return now.getTime() - sigDate.getTime() <= timeRangeMs[timeRange]
    })

    const totalSignatures = filteredSignatures.length
    const completedSignatures = filteredSignatures.filter(s => s.status === 'signed').length
    const pendingSignatures = filteredSignatures.filter(s => s.status === 'pending').length
    const declinedSignatures = filteredSignatures.filter(s => s.status === 'declined').length
    const expiredSignatures = filteredSignatures.filter(s => s.status === 'expired').length

    // Calculate average sign time (hours)
    const signedSignatures = filteredSignatures.filter(s => s.status === 'signed' && s.signed_at)
    const averageSignTime = signedSignatures.length > 0 
      ? signedSignatures.reduce((acc, sig) => {
          const sentTime = new Date(sig.created_at).getTime()
          const signedTime = new Date(sig.signed_at!).getTime()
          return acc + (signedTime - sentTime) / (1000 * 60 * 60) // Convert to hours
        }, 0) / signedSignatures.length
      : 0

    const completionRate = totalSignatures > 0 ? (completedSignatures / totalSignatures) * 100 : 0
    const declineRate = totalSignatures > 0 ? (declinedSignatures / totalSignatures) * 100 : 0

    // Calculate average response time (hours)
    const averageResponseTime = signedSignatures.length > 0
      ? signedSignatures.reduce((acc, sig) => {
          const sentTime = new Date(sig.created_at).getTime()
          const signedTime = new Date(sig.signed_at!).getTime()
          return acc + (signedTime - sentTime) / (1000 * 60 * 60)
        }, 0) / signedSignatures.length
      : 0

    // Peak signing hours
    const hourlyCounts = new Array(24).fill(0)
    signedSignatures.forEach(sig => {
      const hour = new Date(sig.signed_at!).getHours()
      hourlyCounts[hour]++
    })
    const peakSigningHours = hourlyCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour)

    // Status distribution
    const statusDistribution = [
      { status: 'signed', count: completedSignatures, percentage: completionRate },
      { status: 'pending', count: pendingSignatures, percentage: (pendingSignatures / totalSignatures) * 100 },
      { status: 'declined', count: declinedSignatures, percentage: declineRate },
      { status: 'expired', count: expiredSignatures, percentage: (expiredSignatures / totalSignatures) * 100 }
    ].filter(item => item.count > 0)

    // Daily signatures (last 30 days)
    const dailySignatures = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const daySignatures = filteredSignatures.filter(sig => 
        sig.created_at.startsWith(dateStr)
      )
      
      dailySignatures.push({
        date: dateStr,
        signed: daySignatures.filter(s => s.status === 'signed').length,
        pending: daySignatures.filter(s => s.status === 'pending').length,
        declined: daySignatures.filter(s => s.status === 'declined').length
      })
    }

    // Hourly distribution
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: filteredSignatures.filter(sig => {
        const sigHour = new Date(sig.created_at).getHours()
        return sigHour === hour
      }).length
    }))

    // Provider stats
    const providerStats = Array.from(
      new Set(filteredSignatures.map(s => s.provider))
    ).map(provider => {
      const providerSignatures = filteredSignatures.filter(s => s.provider === provider)
      const successRate = providerSignatures.length > 0
        ? (providerSignatures.filter(s => s.status === 'signed').length / providerSignatures.length) * 100
        : 0
      
      return {
        provider,
        count: providerSignatures.length,
        successRate
      }
    })

    return {
      totalSignatures,
      completedSignatures,
      pendingSignatures,
      declinedSignatures,
      expiredSignatures,
      averageSignTime,
      completionRate,
      declineRate,
      averageResponseTime,
      peakSigningHours,
      statusDistribution,
      dailySignatures,
      hourlyDistribution,
      providerStats
    }
  }, [signatures, timeRange])

  const metricCards = [
    {
      title: 'Total Signatures',
      value: analyticsData.totalSignatures,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(analyticsData.completionRate)}%`,
      icon: <Target className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      title: 'Avg. Sign Time',
      value: `${Math.round(analyticsData.averageSignTime)}h`,
      icon: <Clock className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900'
    },
    {
      title: 'Decline Rate',
      value: `${Math.round(analyticsData.declineRate)}%`,
      icon: <XCircle className="h-5 w-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl">E-Signature Analytics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Comprehensive insights into signature performance and trends
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <div className={metric.color}>
                      {metric.icon}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pie className="h-5 w-5" />
              <span>Status Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentage }) => `${status} (${Math.round(percentage)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Signatures Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Daily Signatures Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.dailySignatures}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Area type="monotone" dataKey="signed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="declined" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Hourly Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => `${value}:00`}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Provider Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Provider Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.providerStats.map((provider, index) => (
                <motion.div
                  key={provider.provider}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium capitalize">{provider.provider}</p>
                    <p className="text-sm text-muted-foreground">
                      {provider.count} signatures
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Math.round(provider.successRate)}%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Performance Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analyticsData.peakSigningHours.length > 0 ? 
                  analyticsData.peakSigningHours.map(hour => `${hour}:00`).join(', ') : 
                  'N/A'
                }
              </div>
              <p className="text-sm text-muted-foreground">Peak Signing Hours</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round(analyticsData.averageResponseTime)}h
              </div>
              <p className="text-sm text-muted-foreground">Average Response Time</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {analyticsData.completionRate > 80 ? 'Excellent' : 
                 analyticsData.completionRate > 60 ? 'Good' : 
                 analyticsData.completionRate > 40 ? 'Fair' : 'Needs Improvement'}
              </div>
              <p className="text-sm text-muted-foreground">Performance Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}