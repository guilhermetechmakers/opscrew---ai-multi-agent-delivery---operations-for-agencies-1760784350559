import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Clock, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Calendar className="h-5 w-5 text-gray-500" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
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
    <div className="space-y-4">
      {timelineData.map((item, index) => {
        const isExpanded = expandedItems.has(item.id);
        const isLast = index === timelineData.length - 1;

        return (
          <div key={item.id} className="flex gap-4">
            {/* Timeline line and icon */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {getStatusIcon(item.status)}
                {!isLast && (
                  <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border"></div>
                )}
              </div>
            </div>

            {/* Timeline content */}
            <div className="flex-1 pb-6">
              <Card className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{item.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(item.status)}`}
                        >
                          {item.status.replace('_', ' ')}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTypeColor(item.type)}`}
                        >
                          {item.type}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                        </span>
                        <span>
                          Due: {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Progress:</span>
                              <div className="flex-1 bg-secondary rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    item.status === 'completed' ? 'bg-green-500' : 
                                    item.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-500'
                                  }`}
                                  style={{ 
                                    width: item.status === 'completed' ? '100%' : 
                                           item.status === 'in_progress' ? '60%' : '0%' 
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {item.status === 'completed' ? '100%' : 
                                 item.status === 'in_progress' ? '60%' : '0%'}
                              </span>
                            </div>
                            
                            {item.status === 'in_progress' && (
                              <div className="text-xs text-blue-600">
                                Currently in progress - expected completion in 3 days
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expand/collapse button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(item.id)}
                      className="ml-2"
                    >
                      <ArrowRight 
                        className={`h-4 w-4 transition-transform duration-200 ${
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
