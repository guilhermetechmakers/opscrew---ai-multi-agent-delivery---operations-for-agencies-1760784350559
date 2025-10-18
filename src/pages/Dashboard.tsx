import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  FolderOpen, 
  MessageSquare, 
  BarChart3, 
  TrendingUp, 
  Clock,
  Users,
  Zap,
  ArrowRight,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Active Projects",
    value: "12",
    change: "+2 this week",
    icon: FolderOpen,
    color: "text-blue-500"
  },
  {
    title: "Pending Proposals",
    value: "5",
    change: "+1 today",
    icon: MessageSquare,
    color: "text-yellow-500"
  },
  {
    title: "Open Tickets",
    value: "8",
    change: "-3 this week",
    icon: BarChart3,
    color: "text-green-500"
  },
  {
    title: "SLA Health",
    value: "98%",
    change: "+2% this month",
    icon: TrendingUp,
    color: "text-emerald-500"
  }
];

const recentActivity = [
  {
    id: 1,
    agent: "Intake Agent",
    action: "Generated proposal for TechStart project",
    time: "2 minutes ago",
    confidence: 95
  },
  {
    id: 2,
    agent: "PM Agent",
    action: "Created sprint plan for E-commerce platform",
    time: "15 minutes ago",
    confidence: 88
  },
  {
    id: 3,
    agent: "Comms Agent",
    action: "Summarized client meeting and extracted action items",
    time: "1 hour ago",
    confidence: 92
  },
  {
    id: 4,
    agent: "Launch Agent",
    action: "Completed pre-launch checklist for Mobile App",
    time: "2 hours ago",
    confidence: 100
  }
];

const quickActions = [
  {
    title: "Start New Intake",
    description: "Begin qualifying a new lead",
    icon: MessageSquare,
    href: "/dashboard/intake",
    color: "bg-blue-500"
  },
  {
    title: "Create Project",
    description: "Set up a new project",
    icon: Plus,
    href: "/dashboard/projects/new",
    color: "bg-green-500"
  },
  {
    title: "View Analytics",
    description: "Check performance metrics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    color: "bg-purple-500"
  },
  {
    title: "Manage Team",
    description: "Add or manage team members",
    icon: Users,
    href: "/dashboard/team",
    color: "bg-orange-500"
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your operations.
          </p>
        </div>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Quick Start
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="card-hover animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Activity Feed */}
        <div className="lg:col-span-2">
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Agent Activity Feed
              </CardTitle>
              <CardDescription>
                Real-time updates from your AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{activity.agent}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-foreground">{activity.action}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1 bg-muted rounded-full">
                            <div 
                              className="h-1 bg-primary rounded-full" 
                              style={{ width: `${activity.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{activity.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="animate-fade-in-up">
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
                  <Link key={index} to={action.href}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{action.title}</h4>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Projects */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>
            Your latest project activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "E-commerce Platform", status: "In Progress", progress: 75, team: 4 },
              { name: "Mobile App Redesign", status: "Review", progress: 90, team: 3 },
              { name: "API Integration", status: "Planning", progress: 25, team: 2 },
            ].map((project, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.status} • {project.team} team members
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{project.progress}%</div>
                    <div className="w-20 h-1 bg-muted rounded-full">
                      <div 
                        className="h-1 bg-primary rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
