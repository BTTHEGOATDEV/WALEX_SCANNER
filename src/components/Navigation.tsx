import { Shield, Home, FolderOpen, Activity, FileText, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Navigation = () => {
  const navItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: FolderOpen, label: "Projects", count: 8 },
    { icon: Activity, label: "Scans", count: 3 },
    { icon: FileText, label: "Reports" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-cyber">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CyberScan</h1>
              <p className="text-xs text-muted-foreground">Professional Pentesting Platform</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={index}
                  variant={item.active ? "cyber" : "ghost"}
                  size="sm"
                  className="relative"
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {item.label}
                  {item.count && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground">Senior Pentester</p>
            </div>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;