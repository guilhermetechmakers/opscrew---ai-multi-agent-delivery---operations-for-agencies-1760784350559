import { useState } from 'react';
import { Settings, Bell, User, LogOut, Menu, X, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { ClientPortal } from '@/types/database/client-portals';

interface PortalHeaderProps {
  portal: ClientPortal;
}

export function PortalHeader({ portal }: PortalHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Portal Name */}
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden hover:bg-secondary/50">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-card border-r border-border">
                <div className="flex flex-col space-y-4 py-4">
                  <div className="flex items-center gap-3">
                    {portal.logo_url ? (
                      <img 
                        src={portal.logo_url} 
                        alt={portal.portal_name}
                        className="h-8 w-8 rounded-lg"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-primary-foreground font-bold text-sm">
                          {portal.portal_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-lg gradient-text">{portal.portal_name}</span>
                      <p className="text-xs text-muted-foreground">Client Portal</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start sidebar-item">
                      <Globe className="h-4 w-4 mr-2" />
                      Overview
                    </Button>
                    <Button variant="ghost" className="w-full justify-start sidebar-item">
                      <Shield className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                    <Button variant="ghost" className="w-full justify-start sidebar-item">
                      <User className="h-4 w-4 mr-2" />
                      Comments
                    </Button>
                    <Button variant="ghost" className="w-full justify-start sidebar-item">
                      <Settings className="h-4 w-4 mr-2" />
                      Billing
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3">
              {portal.logo_url ? (
                <img 
                  src={portal.logo_url} 
                  alt={portal.portal_name}
                  className="h-10 w-10 rounded-lg shadow-lg"
                />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-lg">
                    {portal.portal_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-semibold gradient-text">{portal.portal_name}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Client Portal</p>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    <Globe className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hover:bg-secondary/50 transition-all duration-200">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
              >
                3
              </Badge>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm" className="hover:bg-secondary/50 transition-all duration-200">
              <Settings className="h-4 w-4" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-secondary/50 transition-all duration-200 hover:scale-105">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-border shadow-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none gradient-text">Client User</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      client@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="hover:bg-secondary/50 transition-colors">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-secondary/50 transition-colors">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="hover:bg-destructive/10 text-destructive transition-colors">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
