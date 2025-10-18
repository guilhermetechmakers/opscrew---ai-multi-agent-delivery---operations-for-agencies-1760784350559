import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from '@/lib/utils';
import { useLogsByRequestId, useProvisioningProgress } from '@/hooks/useProjectProvisioningLogs';
import type { ProvisioningStepLog } from '@/types/database/project-provisioning-logs';

interface ProvisioningLogsProps {
  requestId: string;
  className?: string;
}

export function ProvisioningLogs({ requestId, className }: ProvisioningLogsProps) {
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useLogsByRequestId(requestId);
  const { data: progress, isLoading: progressLoading } = useProvisioningProgress(requestId);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logs) {
      const scrollContainer = document.getElementById('logs-scroll-area');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs, autoScroll]);

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

  const getStepTypeColor = (stepType: string) => {
    switch (stepType) {
      case 'repository':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'environment':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
      case 'infrastructure':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'portal':
        return 'bg-pink-500/10 text-pink-700 dark:text-pink-400';
      case 'validation':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'rollback':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return null;
    if (durationMs < 1000) return `${durationMs}ms`;
    if (durationMs < 60000) return `${(durationMs / 1000).toFixed(1)}s`;
    return `${(durationMs / 60000).toFixed(1)}m`;
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleTimeString();
  };

  const filteredLogs = logs?.filter(log => {
    if (showErrorsOnly) {
      return log.log_level === 'error';
    }
    return true;
  }) || [];

  const toggleStepExpansion = (stepName: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepName)) {
      newExpanded.delete(stepName);
    } else {
      newExpanded.add(stepName);
    }
    setExpandedSteps(newExpanded);
  };

  if (logsLoading || progressLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Provisioning Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Provisioning Logs
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowErrorsOnly(!showErrorsOnly)}
            >
              {showErrorsOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showErrorsOnly ? 'Show All' : 'Errors Only'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchLogs()}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Overview */}
        {progress && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {progress.progress_percentage}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress_percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Status: {progress.overall_status}</span>
              <span>Current: {progress.current_step}</span>
            </div>
          </div>
        )}

        {/* Logs */}
        <ScrollArea id="logs-scroll-area" className="h-96">
          <div className="space-y-3">
            <AnimatePresence>
              {filteredLogs.map((log, index) => {
                const metadata = log.metadata || {};
                const stepType = metadata.step_type || 'validation';
                const status = metadata.status || 'completed';
                const isExpanded = expandedSteps.has(log.step_name);

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm">{log.step_name}</h4>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getStatusColor(status))}
                          >
                            {status}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getStepTypeColor(stepType))}
                          >
                            {stepType}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {log.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatTimestamp(log.created_at)}</span>
                          {log.duration_ms && (
                            <span>Duration: {formatDuration(log.duration_ms)}</span>
                          )}
                          {metadata.error_message && (
                            <span className="text-red-500">Error</span>
                          )}
                        </div>

                        {/* Expandable Details */}
                        {(metadata.details && Object.keys(metadata.details).length > 0) || 
                         metadata.error_message ? (
                          <div className="mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStepExpansion(log.step_name)}
                              className="h-8 px-2"
                            >
                              {isExpanded ? 'Hide Details' : 'Show Details'}
                            </Button>
                            
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 p-3 bg-muted/30 rounded border"
                              >
                                {metadata.error_message && (
                                  <div className="mb-3">
                                    <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                                      Error Message:
                                    </h5>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                      {metadata.error_message}
                                    </p>
                                  </div>
                                )}
                                
                                {metadata.details && Object.keys(metadata.details).length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-medium mb-2">Details:</h5>
                                    <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
                                      {JSON.stringify(metadata.details, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No logs available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
