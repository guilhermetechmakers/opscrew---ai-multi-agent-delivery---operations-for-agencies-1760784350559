import { useState } from 'react';
import { Settings, Bell, User, LogOut, Menu, X } from 'lucide-react';
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
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col space-y-4 py-4">
                  <div className="flex items-center gap-2">
                    {portal.logo_url ? (
                      <img 
                        src={portal.logo_url} 
                        alt={portal.portal_name}
                        className="h-8 w-8 rounded"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">
                          {portal.portal_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="font-semibold text-lg">{portal.portal_name}</span>
                  </div>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      Overview
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      Documents
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      Comments
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
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
                  className="h-8 w-8 rounded"
                />
              ) : (
                <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    {portal.portal_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-semibold">{portal.portal_name}</h1>
                <p className="text-sm text-muted-foreground">Client Portal</p>
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Client User</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      client@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
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
