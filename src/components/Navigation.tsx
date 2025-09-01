import { Shield, Home, FolderOpen, Activity, FileText, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUserProfile } from "@/hooks/useUserProfile";
const Navigation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, isLoading } = useUserProfile();
  const navItems = [{
    icon: Home,
    label: "Dashboard",
    path: "/dashboard"
  }, {
    icon: FolderOpen,
    label: "Projects",
    path: "/projects"
  }, {
    icon: Activity,
    label: "Scans",
    path: "/scans"
  }, {
    icon: FileText,
    label: "Reports",
    path: "/reports"
  }, {
    icon: Settings,
    label: "Settings",
    path: "/settings"
  }];
  const handleNavigation = (path: string, label: string) => {
    navigate(path);
    toast({
      title: `Navigating to ${label}`,
      description: `Opening ${label.toLowerCase()} section...`,
      duration: 2000
    });
  };
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account",
        duration: 2000
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while signing out",
        variant: "destructive",
        duration: 2000
      });
    }
  };
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between navbar-content">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-cyber">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">BTScan</h1>
              <p className="text-xs text-muted-foreground">Professional Pentesting Webapp</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item, index) => {
            const IconComponent = item.icon;
            return <Button key={index} variant={location.pathname === item.path ? "cyber" : "ghost"} size="sm" className="relative" onClick={() => handleNavigation(item.path, item.label)}>
                  <IconComponent className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>;
          })}
          </div>

          {/* Theme Toggle & User Profile */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:block text-right min-w-0">
              <p className="text-sm font-medium text-foreground transition-all duration-300">
                {isLoading ? (
                  <span className="inline-block w-16 h-4 bg-muted animate-pulse rounded"></span>
                ) : (
                  userProfile.name || "User"
                )}
              </p>
              <p className="text-xs text-muted-foreground transition-all duration-300">
                {isLoading ? (
                  <span className="inline-block w-12 h-3 bg-muted animate-pulse rounded"></span>
                ) : (
                  userProfile.role || "Member"
                )}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                  <Avatar className="cursor-pointer">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleNavigation("/settings", "Settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navigation;