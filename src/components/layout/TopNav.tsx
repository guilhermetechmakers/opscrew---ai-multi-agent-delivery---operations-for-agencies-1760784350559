import { Search, Bell, User, Plus, Settings, LogOut, HelpCircle, Moon, Sun, Monitor, ChevronDown, Zap, MessageSquare, GitBranch, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSignOut } from "@/hooks/useAuthQueries";

export function TopNav() {
  const { user, profile } = useAuth();
  const signOutMutation = useSignOut();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState([
    { id: 1, title: "New proposal generated", time: "2 min ago", unread: true },
    { id: 2, title: "Project deployment completed", time: "15 min ago", unread: true },
    { id: 3, title: "Client feedback received", time: "1 hour ago", unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const getUserDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) return profile.first_name;
    return user?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const quickActions = [
    { title: "Start Intake", icon: MessageSquare, href: "/dashboard/intake" },
    { title: "Provision Project", icon: GitBranch, href: "/dashboard/projects/provision" },
    { title: "Run Audit", icon: Shield, href: "/dashboard/audit" },
    { title: "Client Portal", icon: Globe, href: "/portal" },
  ];

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Enhanced Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search projects, agents, or anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 bg-secondary/50 border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
            />
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <span className="sr-only">Clear search</span>
                  ×
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Zap className="w-4 h-4" />
                Quick Actions
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickActions.map((action) => (
                <DropdownMenuItem key={action.title} asChild>
                  <Link to={action.href} className="flex items-center gap-3">
                    <action.icon className="w-4 h-4" />
                    <span>{action.title}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create Button */}
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>

          {/* Enhanced Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-semibold"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm">{notification.title}</span>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Enhanced User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-secondary/80 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ""} alt={getUserDisplayName()} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {profile?.two_factor_enabled && (
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">2FA Enabled</span>
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile" className="flex items-center gap-3">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/setup-2fa" className="flex items-center gap-3">
                    <Shield className="w-4 h-4" />
                    <span>Security & 2FA</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/help" className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked>
                  <Monitor className="w-4 h-4 mr-2" />
                  System
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  <Sun className="w-4 h-4 mr-2" />
                  Light
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  <Moon className="w-4 h-4 mr-2" />
                  Dark
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleSignOut}
                disabled={signOutMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>{signOutMutation.isPending ? "Signing out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
