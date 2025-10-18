import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Clock, AlertCircle, Calendar, ArrowRight, Sparkles, Target, Zap, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ProjectTimelineProps {
  projectId: string;
}

// Mock timeline data - in real app, this would come from API
const mockTimelineData = [
  {
    id: '1',
    title: 'Project Kickoff',
    description: 'Initial project setup and requirements gathering',
    status: 'completed',
    date: '2023-11-01',
    type: 'milestone'
  },
  {
    id: '2',
    title: 'Design Phase',
    description: 'UI/UX design and wireframe creation',
    status: 'completed',
    date: '2023-11-15',
    type: 'phase'
  },
  {
    id: '3',
    title: 'Development Sprint 1',
    description: 'Core functionality development',
    status: 'completed',
    date: '2023-12-01',
    type: 'sprint'
  },
  {
    id: '4',
    title: 'Development Sprint 2',
    description: 'Feature implementation and testing',
    status: 'in_progress',
    date: '2023-12-15',
    type: 'sprint'
  },
  {
    id: '5',
    title: 'Testing & QA',
    description: 'Comprehensive testing and bug fixes',
    status: 'pending',
    date: '2023-12-25',
    type: 'phase'
  },
  {
    id: '6',
    title: 'Final Delivery',
    description: 'Project handover and documentation',
    status: 'pending',
    date: '2024-01-01',
    type: 'milestone'
  }
];

export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['4']));
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  // In a real app, this would be a proper API call
  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['project-timeline', projectId],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockTimelineData;
    },
    enabled: !!projectId,
  });

  // Animate items in sequence
  useEffect(() => {
    if (timelineData) {
      timelineData.forEach((item, index) => {
        setTimeout(() => {
          setVisibleItems(prev => new Set([...prev, item.id]));
        }, index * 200);
      });
    }
  }, [timelineData]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="relative">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-md animate-pulse"></div>
          </div>
        );
      case 'in_progress':
        return (
          <div className="relative">
            <Clock className="h-6 w-6 text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md animate-pulse"></div>
          </div>
        );
      case 'pending':
        return <Calendar className="h-6 w-6 text-gray-500" />;
      case 'overdue':
        return (
          <div className="relative">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md animate-pulse"></div>
          </div>
        );
      default:
        return <Calendar className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'overdue':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'phase':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'sprint':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-5 w-5 bg-secondary rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-secondary rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-secondary rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!timelineData || timelineData.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Timeline Available</h3>
        <p className="text-muted-foreground">
          Project timeline will be updated as milestones are created.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timelineData.map((item, index) => {
        const isExpanded = expandedItems.has(item.id);
        const isLast = index === timelineData.length - 1;
        const isVisible = visibleItems.has(item.id);

        return (
          <div 
            key={item.id} 
            className={`flex gap-6 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            {/* Enhanced Timeline line and icon */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {getStatusIcon(item.status)}
                {!isLast && (
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b from-border to-transparent"></div>
                )}
              </div>
            </div>

            {/* Enhanced Timeline content */}
            <div className="flex-1 pb-8">
              <Card className={`group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:scale-[1.02] ${
                item.status === 'completed' ? 'ring-2 ring-green-500/20' : 
                item.status === 'in_progress' ? 'ring-2 ring-blue-500/20' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold gradient-text group-hover:text-primary transition-colors duration-200">
                          {item.title}
                        </h4>
                        <div className="flex gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs transition-all duration-200 hover:scale-105 ${getStatusColor(item.status)}`}
                          >
                            {item.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {item.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                            {item.status === 'pending' && <Calendar className="h-3 w-3 mr-1" />}
                            {item.status.replace('_', ' ')}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs transition-all duration-200 hover:scale-105 ${getTypeColor(item.type)}`}
                          >
                            {item.type === 'milestone' && <Target className="h-3 w-3 mr-1" />}
                            {item.type === 'phase' && <Zap className="h-3 w-3 mr-1" />}
                            {item.type === 'sprint' && <Star className="h-3 w-3 mr-1" />}
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-6 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-3 w-3" />
                          <span>
                            Due: {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Expanded content */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-border/50 animate-fade-in">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Progress
                              </span>
                              <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                                <div 
                                  className={`h-3 rounded-full transition-all duration-1000 ${
                                    item.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-400' : 
                                    item.status === 'in_progress' ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-gradient-to-r from-gray-500 to-gray-400'
                                  }`}
                                  style={{ 
                                    width: item.status === 'completed' ? '100%' : 
                                           item.status === 'in_progress' ? '60%' : '0%' 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">
                                {item.status === 'completed' ? '100%' : 
                                 item.status === 'in_progress' ? '60%' : '0%'}
                              </span>
                            </div>
                            
                            {item.status === 'in_progress' && (
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-blue-500">
                                  Currently in progress - expected completion in 3 days
                                </span>
                              </div>
                            )}

                            {item.status === 'completed' && (
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-500">
                                  Successfully completed ahead of schedule
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Expand/collapse button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(item.id)}
                      className="ml-4 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    >
                      <ArrowRight 
                        className={`h-4 w-4 transition-transform duration-300 ${
                          isExpanded ? 'rotate-90' : ''
                        }`} 
                      />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );
}
