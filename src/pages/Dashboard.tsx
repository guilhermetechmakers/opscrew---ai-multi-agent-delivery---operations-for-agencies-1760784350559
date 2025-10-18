import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  FolderOpen, 
  MessageSquare, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Activity,
  Target,
  Calendar,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useDashboardStats, useRecentProjects, useAgentActivity, useProjectProgressData } from "@/hooks/useDashboard";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

// Status color mappings
const statusColors = {
  completed: "text-emerald-500",
  running: "text-blue-500", 
  failed: "text-red-500",
  awaiting_approval: "text-yellow-500"
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800", 
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

// Mock data for fallback
const mockStats = {
  activeProjects: 12,
  pendingProposals: 5,
  openTickets: 8,
  slaHealth: 98,
  projectsChange: 12,
  proposalsChange: 8,
  ticketsChange: -15,
  slaChange: 2
};

const mockActivity = [
  {
    id: "1",
    agentName: "Intake Agent",
    action: "Generated proposal for TechStart project",
    time: "2 minutes ago",
    confidence: 95,
    status: "completed" as const,
    projectName: "TechStart Platform"
  },
  {
    id: "2", 
    agentName: "PM Agent",
    action: "Created sprint plan for E-commerce platform",
    time: "15 minutes ago",
    confidence: 88,
    status: "completed" as const,
    projectName: "E-commerce Platform"
  },
  {
    id: "3",
    agentName: "Comms Agent", 
    action: "Summarized client meeting and extracted action items",
    time: "1 hour ago",
    confidence: 92,
    status: "completed" as const,
    projectName: "Client Portal"
  },
  {
    id: "4",
    agentName: "Launch Agent",
    action: "Completed pre-launch checklist for Mobile App",
    time: "2 hours ago", 
    confidence: 100,
    status: "completed" as const,
    projectName: "Mobile App"
  }
];

const quickActions = [
  {
    title: "Start New Intake",
    description: "Begin qualifying a new lead",
    icon: MessageSquare,
    href: "/dashboard/intake",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    hoverColor: "hover:from-blue-600 hover:to-blue-700"
  },
  {
    title: "Create Project",
    description: "Set up a new project",
    icon: Plus,
    href: "/dashboard/projects/new",
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    hoverColor: "hover:from-emerald-600 hover:to-emerald-700"
  },
  {
    title: "View Analytics",
    description: "Check performance metrics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    hoverColor: "hover:from-purple-600 hover:to-purple-700"
  },
  {
    title: "Manage Team",
    description: "Add or manage team members",
    icon: Users,
    href: "/dashboard/team",
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
    hoverColor: "hover:from-orange-600 hover:to-orange-700"
  }
];

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  isLoading = false 
}: {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
  isLoading?: boolean;
}) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? "text-emerald-500" : "text-red-500";
  const changeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="card-hover group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className={`h-4 w-4 ${color} group-hover:scale-110 transition-transform`} />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">{value}</div>
              <div className="flex items-center gap-1 text-xs">
                <changeIcon className={`h-3 w-3 ${changeColor}`} />
                <span className={changeColor}>
                  {Math.abs(change)}% this week
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Agent Activity Item Component
function AgentActivityItem({ activity }: { activity: any }) {
  const statusIcon = {
    completed: CheckCircle,
    running: Loader2,
    failed: AlertCircle,
    awaiting_approval: Clock
  }[activity.status] || Activity;

  const StatusIcon = statusIcon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
    >
      <div className="flex-shrink-0">
        <div className={`w-2 h-2 rounded-full mt-2 ${
          activity.status === 'completed' ? 'bg-emerald-500' :
          activity.status === 'running' ? 'bg-blue-500' :
          activity.status === 'failed' ? 'bg-red-500' :
          'bg-yellow-500'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{activity.agentName}</span>
          <StatusIcon className={`h-3 w-3 ${
            activity.status === 'completed' ? 'text-emerald-500' :
            activity.status === 'running' ? 'text-blue-500 animate-spin' :
            activity.status === 'failed' ? 'text-red-500' :
            'text-yellow-500'
          }`} />
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{activity.time}</span>
        </div>
        <p className="text-sm text-foreground mb-2">{activity.action}</p>
        {activity.projectName && (
          <Badge variant="outline" className="text-xs mb-2">
            {activity.projectName}
          </Badge>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Confidence:</span>
          <div className="flex items-center gap-1">
            <div className="w-16 h-1 bg-muted rounded-full">
              <motion.div 
                className="h-1 bg-primary rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${activity.confidence}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
            <span className="text-xs font-medium">{activity.confidence}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Project Progress Chart Component
function ProjectProgressChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No project data available</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any) => [value, 'Projects']}
          labelFormatter={(label: string) => `Status: ${label}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: recentProjects, isLoading: projectsLoading } = useRecentProjects(5);
  const { data: agentActivity, isLoading: activityLoading } = useAgentActivity(10);
  const { data: progressData, isLoading: progressLoading } = useProjectProgressData();

  // Use mock data if API fails
  const displayStats = stats || mockStats;
  const displayActivity = agentActivity || mockActivity;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Quick Start
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Projects"
          value={displayStats.activeProjects}
          change={displayStats.projectsChange}
          icon={FolderOpen}
          color="text-blue-500"
          isLoading={statsLoading}
        />
        <MetricCard
          title="Pending Proposals"
          value={displayStats.pendingProposals}
          change={displayStats.proposalsChange}
          icon={MessageSquare}
          color="text-yellow-500"
          isLoading={statsLoading}
        />
        <MetricCard
          title="Open Tickets"
          value={displayStats.openTickets}
          change={displayStats.ticketsChange}
          icon={BarChart3}
          color="text-green-500"
          isLoading={statsLoading}
        />
        <MetricCard
          title="SLA Health"
          value={`${displayStats.slaHealth}%`}
          change={displayStats.slaChange}
          icon={Target}
          color="text-emerald-500"
          isLoading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Activity Feed */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  Agent Activity Feed
                  {activityLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </CardTitle>
                <CardDescription>
                  Real-time updates from your AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30">
                        <Skeleton className="w-2 h-2 rounded-full mt-2" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayActivity.map((activity, index) => (
                      <AgentActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <Link to={action.href}>
                        <div className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md ${action.color} ${action.hoverColor}`}>
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <action.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-white">{action.title}</h4>
                            <p className="text-xs text-white/80">{action.description}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/80" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                Recent Projects
                {projectsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                Your latest project activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-1 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProjects?.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <FolderOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className={priorityColors[project.priority]}>
                              {project.status.replace('_', ' ')}
                            </Badge>
                            <span>•</span>
                            <span>{project.teamSize} team members</span>
                            {project.daysRemaining && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {project.daysRemaining} days left
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{project.progress}%</div>
                          <div className="w-20 h-1 bg-muted rounded-full">
                            <motion.div 
                              className="h-1 bg-primary rounded-full" 
                              initial={{ width: 0 }}
                              animate={{ width: `${project.progress}%` }}
                              transition={{ duration: 0.5, delay: 0.2 + 0.1 * index }}
                            />
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Project Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Project Status
                {progressLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                Distribution of projects by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {progressLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Skeleton className="w-48 h-48 rounded-full" />
                </div>
              ) : (
                <ProjectProgressChart data={progressData || []} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
