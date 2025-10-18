import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  MessageSquare, 
  FolderOpen, 
  Settings, 
  Users, 
  BarChart3,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Bot,
  Zap,
  Rocket,
  Shield,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Intake Chat", href: "/dashboard/intake", icon: MessageSquare },
  { name: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { name: "Meetings", href: "/dashboard/meetings", icon: Video },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help", href: "/dashboard/help", icon: HelpCircle },
];

const agentTools = [
  { name: "AI Agents", href: "/dashboard/agents", icon: Bot },
  { name: "Executions", href: "/dashboard/executions", icon: Zap },
  { name: "Automation", href: "/dashboard/automation", icon: Rocket },
  { name: "Security", href: "/dashboard/security", icon: Shield },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">OpsCrew</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="p-2"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "sidebar-item",
                  isActive && "sidebar-item-active",
                  collapsed && "justify-center"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </div>

        {/* Agent Tools Section */}
        {!collapsed && (
          <div className="pt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Agent Tools
            </h3>
            <div className="space-y-1">
              {agentTools.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "sidebar-item",
                      isActive && "sidebar-item-active"
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <p>OpsCrew v1.0</p>
            <p>AI Multi-Agent Platform</p>
          </div>
        )}
      </div>
    </div>
  );
}
