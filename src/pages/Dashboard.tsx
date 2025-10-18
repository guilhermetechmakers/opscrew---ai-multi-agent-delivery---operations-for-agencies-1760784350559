import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
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
  Search,
  Bell,
  Settings,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  GitBranch,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useDashboardStats, useRecentProjects, useAgentActivity, useProjectProgressData } from "@/hooks/useDashboard";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Area, AreaChart, RadialBarChart, RadialBar, ComposedChart, Scatter, ScatterChart, Treemap, FunnelChart, Funnel, Sankey } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Status color mappings following OpsCrew design system
const statusColors = {
  completed: "text-emerald-500",
  running: "text-blue-500", 
  failed: "text-red-500",
  awaiting_approval: "text-yellow-500",
  planning: "text-purple-500",
  active: "text-green-500",
  on_hold: "text-orange-500",
  cancelled: "text-gray-500"
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", 
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

const agentColors = {
  intake: "from-blue-500 to-blue-600",
  pm: "from-emerald-500 to-emerald-600", 
  comms: "from-purple-500 to-purple-600",
  research: "from-orange-500 to-orange-600",
  launch: "from-pink-500 to-pink-600",
  handover: "from-cyan-500 to-cyan-600",
  support: "from-indigo-500 to-indigo-600"
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
    projectName: "TechStart Platform",
    agentType: "intake" as const
  },
  {
    id: "2", 
    agentName: "PM Agent",
    action: "Created sprint plan for E-commerce platform",
    time: "15 minutes ago",
    confidence: 88,
    status: "completed" as const,
    projectName: "E-commerce Platform",
    agentType: "pm" as const
  },
  {
    id: "3",
    agentName: "Comms Agent", 
    action: "Summarized client meeting and extracted action items",
    time: "1 hour ago",
    confidence: 92,
    status: "completed" as const,
    projectName: "Client Portal",
    agentType: "comms" as const
  },
  {
    id: "4",
    agentName: "Launch Agent",
    action: "Completed pre-launch checklist for Mobile App",
    time: "2 hours ago", 
    confidence: 100,
    status: "completed" as const,
    projectName: "Mobile App",
    agentType: "launch" as const
  },
  {
    id: "5",
    agentName: "Research Agent",
    action: "Generated technical specifications for API integration",
    time: "3 hours ago",
    confidence: 87,
    status: "running" as const,
    projectName: "API Platform",
    agentType: "research" as const
  }
];

const quickActions = [
  {
    title: "Start New Intake",
    description: "Begin qualifying a new lead",
    icon: MessageSquare,
    href: "/dashboard/intake",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    hoverColor: "hover:from-blue-600 hover:to-blue-700",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    title: "Provision Project",
    description: "Set up repos and environments",
    icon: GitBranch,
    href: "/dashboard/projects/provision",
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    hoverColor: "hover:from-emerald-600 hover:to-emerald-700",
    gradient: "from-emerald-500 to-emerald-600"
  },
  {
    title: "Run Audit",
    description: "Check system health and compliance",
    icon: Shield,
    href: "/dashboard/audit",
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    hoverColor: "hover:from-purple-600 hover:to-purple-700",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    title: "Open Client Portal",
    description: "Access client-facing dashboard",
    icon: Globe,
    href: "/portal",
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
    hoverColor: "hover:from-orange-600 hover:to-orange-700",
    gradient: "from-orange-500 to-orange-600"
  }
];

const clientPortalLinks = [
  {
    title: "TechStart Platform Portal",
    url: "/portal/techstart",
    status: "active",
    lastActivity: "2 hours ago"
  },
  {
    title: "E-commerce Platform Portal", 
    url: "/portal/ecommerce",
    status: "active",
    lastActivity: "1 day ago"
  },
  {
    title: "Mobile App Portal",
    url: "/portal/mobile",
    status: "pending",
    lastActivity: "3 days ago"
  }
];

// Enhanced Metric Card Component with modern design
function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  isLoading = false,
  trend,
  subtitle
}: {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
  isLoading?: boolean;
  trend?: { data: number[]; color: string };
  subtitle?: string;
}) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? "text-emerald-500" : "text-red-500";
  const changeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="relative">
            <Icon className={`h-5 w-5 ${color} group-hover:scale-110 transition-transform duration-200`} />
            {trend && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-24" />
              {trend && <Skeleton className="h-12 w-full" />}
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-foreground mb-2">{value}</div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <changeIcon className={`h-3 w-3 ${changeColor}`} />
                  <span className={changeColor}>
                    {Math.abs(change)}%
                  </span>
                </div>
                <span className="text-muted-foreground">vs last week</span>
              </div>
              {trend && (
                <div className="mt-3 h-12 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend.data.map((value, index) => ({ value, index }))}>
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={trend.color} 
                        fill={trend.color}
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced Agent Activity Item Component
function AgentActivityItem({ activity, index }: { activity: any; index: number }) {
  const statusIcon = {
    completed: CheckCircle2,
    running: Loader2,
    failed: XCircle,
    awaiting_approval: Clock
  }[activity.status] || Activity;

  const StatusIcon = statusIcon;
  const agentGradient = agentColors[activity.agentType as keyof typeof agentColors] || "from-gray-500 to-gray-600";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-secondary/20 to-secondary/10 hover:from-secondary/30 hover:to-secondary/20 transition-all duration-300 border border-border/30 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
        {/* Agent indicator */}
        <div className="flex-shrink-0 relative">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${agentGradient} flex items-center justify-center shadow-lg`}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
            activity.status === 'completed' ? 'bg-emerald-500' :
            activity.status === 'running' ? 'bg-blue-500' :
            activity.status === 'failed' ? 'bg-red-500' :
            'bg-yellow-500'
          }`}>
            <StatusIcon className={`h-2.5 w-2.5 text-white ${
              activity.status === 'running' ? 'animate-spin' : ''
            }`} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              {activity.agentName}
            </span>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                activity.status === 'completed' ? 'border-emerald-500 text-emerald-500' :
                activity.status === 'running' ? 'border-blue-500 text-blue-500' :
                activity.status === 'failed' ? 'border-red-500 text-red-500' :
                'border-yellow-500 text-yellow-500'
              }`}
            >
              {activity.status.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{activity.time}</span>
          </div>
          
          <p className="text-sm text-foreground mb-3 leading-relaxed">{activity.action}</p>
          
          {activity.projectName && (
            <Badge variant="secondary" className="text-xs mb-3 bg-primary/10 text-primary border-primary/20">
              <FolderOpen className="w-3 h-3 mr-1" />
              {activity.projectName}
            </Badge>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Confidence:</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-2 rounded-full ${
                      activity.confidence >= 90 ? 'bg-emerald-500' :
                      activity.confidence >= 70 ? 'bg-blue-500' :
                      activity.confidence >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${activity.confidence}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground">{activity.confidence}%</span>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2">
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced Project Progress Chart Component
function ProjectProgressChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No project data available</p>
          <p className="text-xs text-muted-foreground mt-1">Create your first project to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            stroke="hsl(var(--background))"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => [value, 'Projects']}
            labelFormatter={(label: string) => `Status: ${label}`}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-center">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: recentProjects, isLoading: projectsLoading } = useRecentProjects(5);
  const { data: agentActivity, isLoading: activityLoading } = useAgentActivity(10);
  const { data: progressData, isLoading: progressLoading } = useProjectProgressData();
  const [searchQuery, setSearchQuery] = useState("");

  // Use mock data if API fails
  const displayStats = stats || mockStats;
  const displayActivity = agentActivity || mockActivity;

  // Mock trend data for metric cards
  const trendData = Array.from({ length: 7 }, (_, i) => Math.floor(Math.random() * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      {/* Enhanced Header with Search */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Welcome back! Here's what's happening with your operations.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects, agents, or anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-80 bg-secondary/50 border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="hover:bg-secondary/80">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Quick Start
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Active Projects"
          value={displayStats.activeProjects}
          change={displayStats.projectsChange}
          icon={FolderOpen}
          color="text-blue-500"
          isLoading={statsLoading}
          trend={{ data: trendData, color: '#3B82F6' }}
          subtitle="Currently in development"
        />
        <MetricCard
          title="Pending Proposals"
          value={displayStats.pendingProposals}
          change={displayStats.proposalsChange}
          icon={MessageSquare}
          color="text-yellow-500"
          isLoading={statsLoading}
          trend={{ data: trendData.map(x => x * 0.8), color: '#F59E0B' }}
          subtitle="Awaiting approval"
        />
        <MetricCard
          title="Open Tickets"
          value={displayStats.openTickets}
          change={displayStats.ticketsChange}
          icon={AlertTriangle}
          color="text-red-500"
          isLoading={statsLoading}
          trend={{ data: trendData.map(x => x * 0.6), color: '#EF4444' }}
          subtitle="Requiring attention"
        />
        <MetricCard
          title="SLA Health"
          value={`${displayStats.slaHealth}%`}
          change={displayStats.slaChange}
          icon={Target}
          color="text-emerald-500"
          isLoading={statsLoading}
          trend={{ data: trendData.map(x => x * 1.2), color: '#10B981' }}
          subtitle="Service level compliance"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Enhanced Agent Activity Feed */}
        <div className="xl:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Agent Activity Feed</CardTitle>
                      <CardDescription className="text-sm">
                        Real-time updates from your AI agents
                      </CardDescription>
                    </div>
                  </div>
                  {activityLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {activityLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/20">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {displayActivity.map((activity, index) => (
                      <AgentActivityItem key={activity.id} activity={activity} index={index} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Quick Actions */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Quick Actions</CardTitle>
                    <CardDescription className="text-sm">
                      Common tasks and shortcuts
                    </CardDescription>
                  </div>
                </div>
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
                      <Link to={action.href} className="block group">
                        <div className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${action.gradient} transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20`}>
                          <div className="relative z-10 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                              <action.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white text-sm">{action.title}</h4>
                              <p className="text-white/80 text-xs mt-1">{action.description}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Enhanced Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Recent Projects</CardTitle>
                    <CardDescription className="text-sm">
                      Your latest project activity
                    </CardDescription>
                  </div>
                </div>
                {projectsLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              </div>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/20">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-2 w-20" />
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
                      className="group"
                    >
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-secondary/20 to-secondary/10 hover:from-secondary/30 hover:to-secondary/20 transition-all duration-300 border border-border/30 hover:border-primary/20 hover:shadow-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                            <FolderOpen className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {project.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  project.status === 'active' ? 'border-emerald-500 text-emerald-500' :
                                  project.status === 'planning' ? 'border-blue-500 text-blue-500' :
                                  project.status === 'on_hold' ? 'border-orange-500 text-orange-500' :
                                  'border-gray-500 text-gray-500'
                                }`}
                              >
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
                            <div className="text-sm font-semibold text-foreground">{project.progress}%</div>
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                className="h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${project.progress}%` }}
                                transition={{ duration: 0.8, delay: 0.2 + 0.1 * index }}
                              />
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Project Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">Project Status</CardTitle>
                  <CardDescription className="text-sm">
                    Distribution of projects by status
                  </CardDescription>
                </div>
                {progressLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              </div>
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

      {/* Client Portal Access Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Client Portal Access</CardTitle>
                <CardDescription className="text-sm">
                  Quick access to client-facing dashboards
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {clientPortalLinks.map((portal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Link to={portal.url} className="block group">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-secondary/20 to-secondary/10 hover:from-secondary/30 hover:to-secondary/20 transition-all duration-300 border border-border/30 hover:border-cyan-500/20 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground group-hover:text-cyan-500 transition-colors">
                          {portal.title}
                        </h4>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-cyan-500 transition-colors" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            portal.status === 'active' ? 'border-emerald-500 text-emerald-500' : 'border-orange-500 text-orange-500'
                          }`}
                        >
                          {portal.status}
                        </Badge>
                        <span>•</span>
                        <span>{portal.lastActivity}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
