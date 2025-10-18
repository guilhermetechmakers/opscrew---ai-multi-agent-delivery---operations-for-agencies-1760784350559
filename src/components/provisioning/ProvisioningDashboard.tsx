import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Settings,
  BarChart3,
  TrendingUp,
  Server,
  GitBranch,
  Cloud,
  Globe
} from "lucide-react";
import { cn } from '@/lib/utils';
import { useActiveRequests, useRequests } from '@/hooks/useProjectProvisioningRequests';
import { useRecentLogs } from '@/hooks/useProjectProvisioningLogs';
import { usePublicTemplates } from '@/hooks/useProjectProvisioningTemplates';
import { ProvisioningLogs } from './ProvisioningLogs';

interface ProvisioningDashboardProps {
  className?: string;
}

export function ProvisioningDashboard({ className }: ProvisioningDashboardProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: activeRequests, isLoading: activeLoading } = useActiveRequests();
  const { data: allRequests, isLoading: allLoading } = useRequests();
  const { data: recentLogs, isLoading: logsLoading } = useRecentLogs(20);
  const { data: templates, isLoading: templatesLoading } = usePublicTemplates();

  // Calculate statistics
  const stats = {
    active: activeRequests?.length || 0,
    completed: allRequests?.filter(r => r.status === 'completed').length || 0,
    failed: allRequests?.filter(r => r.status === 'failed').length || 0,
    total: allRequests?.length || 0
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    
    if (duration < 60000) return `${Math.round(duration / 1000)}s`;
    if (duration < 3600000) return `${Math.round(duration / 60000)}m`;
    return `${Math.round(duration / 3600000)}h`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Provisioning Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage your project provisioning activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Play className="w-4 h-4 mr-2" />
            New Provisioning
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <div className="p-2 bg-red-500/10 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeRequests?.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0">
                        {getStatusIcon(request.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {request.request_config?.project_name || 'Unknown Project'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {request.status} • {formatDuration(request.created_at)}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Progress value={request.progress_percentage} className="w-16 h-2" />
                      </div>
                    </div>
                  ))}
                  {activeRequests?.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No active provisioning requests
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Server className="w-6 h-6" />
                    <span className="text-sm">New Project</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <GitBranch className="w-6 h-6" />
                    <span className="text-sm">Repository</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Cloud className="w-6 h-6" />
                    <span className="text-sm">Infrastructure</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Globe className="w-6 h-6" />
                    <span className="text-sm">Portal</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provisioning Requests</CardTitle>
              <CardDescription>
                All your project provisioning requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allRequests?.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRequestId(request.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getStatusIcon(request.status)}
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {request.request_config?.project_name || 'Unknown Project'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.repository_settings?.name || 'No repository'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getStatusColor(request.status))}
                        >
                          {request.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(request.created_at, request.completed_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Server className="w-4 h-4" />
                        <span>{request.infrastructure_settings?.provider || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitBranch className="w-4 h-4" />
                        <span>{request.repository_settings?.branch || 'main'}</span>
                      </div>
                      <div className="flex-1">
                        <Progress value={request.progress_percentage} className="h-2" />
                      </div>
                      <span className="text-xs">{request.progress_percentage}%</span>
                    </div>
                  </motion.div>
                ))}
                {allRequests?.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No provisioning requests found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {selectedRequestId ? (
            <ProvisioningLogs requestId={selectedRequestId} />
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Select a provisioning request to view its logs
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Templates</CardTitle>
              <CardDescription>
                Browse and manage your project provisioning templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates?.slice(0, 6).map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Server className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{template.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{template.category}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{template.usage_count} uses</span>
                      <Badge variant="outline" className="text-xs">
                        {template.infrastructure_provider}
                      </Badge>
                    </div>
                  </div>
                ))}
                {templates?.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No templates available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
