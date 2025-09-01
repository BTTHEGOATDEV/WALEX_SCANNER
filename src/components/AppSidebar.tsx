import { useState } from "react";
import { Home, FolderOpen, Activity, FileText, Settings, Shield, BarChart3, Users, Zap } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Projects", url: "/projects", icon: FolderOpen },
  { title: "Scans", url: "/scans", icon: Activity },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const tools = [
  { title: "Vulnerability Scanner", url: "/tools/vuln-scanner", icon: Shield },
  { title: "Network Mapper", url: "/tools/network-map", icon: Zap },
  { title: "Threat Intelligence", url: "/tools/threat-intel", icon: Users },
];

export function AppSidebar() {
  const { state, open } = useSidebar();
  const location = useLocation();
  const { userProfile, isLoading } = useUserProfile();
  
  const collapsed = state === "collapsed";
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary border-r-2 border-primary font-medium" 
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">{
      /* Content */}
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-cyber">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in-right">
              <h1 className="text-xl font-bold font-display text-foreground">BTScan</h1>
              <p className="text-xs text-muted-foreground">Pro Pentesting Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClass}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="animate-fade-in-right">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {!collapsed && "Security Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClass}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <div className="flex items-center justify-between w-full animate-fade-in-right">
                          <span className="text-sm">{item.title}</span>
                          <Badge variant="secondary" className="text-xs">Soon</Badge>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {isLoading ? '...' : (userProfile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U')}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in-right">
              <p className="text-sm font-medium text-foreground truncate">
                {isLoading ? '...' : (userProfile.name || 'User')}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {isLoading ? '...' : (userProfile.role || 'Member')}
              </p>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <NavLink 
            to="/settings" 
            className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors animate-fade-in-right"
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}