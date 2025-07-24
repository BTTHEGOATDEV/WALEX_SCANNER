import { Activity, Shield, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import ScanDialog from "@/components/ScanDialog";

const Dashboard = () => {
  const { toast } = useToast();

  const handleNewScan = () => {
    toast({
      title: "New Scan Initiated",
      description: "Starting comprehensive security scan...",
    });
  };

  const handleQuickAction = (actionTitle: string) => {
    toast({
      title: `${actionTitle} Started`,
      description: "Initializing scan parameters...",
    });
  };

  const handleScanView = (target: string) => {
    toast({
      title: "Viewing Scan Details",
      description: `Opening detailed results for ${target}`,
    });
  };
  // Replace with actual API calls to get dashboard stats
  const overviewStats = [
    {
      title: "Active Scans",
      value: "0",
      icon: Activity,
      description: "Currently running",
      variant: "cyber" as const,
    },
    {
      title: "Total Findings",
      value: "0",
      icon: AlertTriangle,
      description: "Last 30 days",
      variant: "warning" as const,
    },
    {
      title: "Targets Monitored",
      value: "0",
      icon: Target,
      description: "Active projects",
      variant: "success" as const,
    },
    {
      title: "Success Rate",
      value: "0%",
      icon: TrendingUp,
      description: "Scan completion",
      variant: "success" as const,
    },
  ];

  // Replace with actual API call to fetch recent scans
  const recentScans: any[] = [];

  // Replace with actual API call to fetch active scans
  const activeScans: any[] = [];

  const quickActions = [
    {
      title: "Scan New Domain",
      description: "Start comprehensive domain scan",
      icon: Target,
      variant: "cyber" as const,
    },
    {
      title: "Port Range Check",
      description: "Quick port enumeration",
      icon: Shield,
      variant: "success" as const,
    },
    {
      title: "Vulnerability Assessment",
      description: "Deep security analysis",
      icon: AlertTriangle,
      variant: "warning" as const,
    },
    {
      title: "SSL/TLS Analysis",
      description: "Certificate and encryption check",
      icon: CheckCircle,
      variant: "default" as const,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-critical text-critical-foreground";
      case "high": return "bg-cyber-red text-cyber-red-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-success" />;
      case "running": return <Clock className="h-4 w-4 text-primary animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              PenTest Dashboard
            </h1>
            <p className="text-muted-foreground">Real-time security assessment overview</p>
          </div>
          <ScanDialog actionType="Scan New Domain">
            <Button variant="cyber" size="lg">
              <Play className="h-4 w-4 mr-2" />
              New Scan
            </Button>
          </ScanDialog>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Scan Activity */}
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Scan Activity
              </CardTitle>
              <CardDescription>Latest security assessments and findings</CardDescription>
            </CardHeader>
            <CardContent>
              {recentScans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="font-medium mb-1">No Recent Activity</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start your first scan to see activity here
                  </p>
                  <ScanDialog actionType="Scan New Domain">
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Start First Scan
                    </Button>
                  </ScanDialog>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentScans.map((scan) => (
                    <div 
                      key={scan.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleScanView(scan.target)}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(scan.status)}
                        <div>
                          <p className="font-medium text-foreground">{scan.target}</p>
                          <p className="text-sm text-muted-foreground">{scan.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getSeverityColor(scan.severity)}>
                          {scan.severity}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{scan.findings} findings</p>
                          <p className="text-xs text-muted-foreground">{scan.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Launch common scan types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <ScanDialog key={index} actionType={action.title}>
                      <Button
                        variant={action.variant}
                        className="w-full justify-start h-auto p-3"
                      >
                        <IconComponent className="h-4 w-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs opacity-90">{action.description}</div>
                        </div>
                      </Button>
                    </ScanDialog>
                  );
                })}
              </CardContent>
            </Card>

            {/* Active Scans Progress */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Active Scans
                </CardTitle>
                <CardDescription>Real-time scan progress</CardDescription>
              </CardHeader>
              <CardContent>
                {activeScans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Clock className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No active scans</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeScans.map((scan) => (
                      <div key={scan.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{scan.target}</p>
                            <p className="text-sm text-muted-foreground">{scan.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-primary">{scan.progress}%</p>
                            <p className="text-xs text-muted-foreground">ETA {scan.eta}</p>
                          </div>
                        </div>
                        <Progress value={scan.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;