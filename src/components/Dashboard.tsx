import { Activity, Shield, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const overviewStats = [
    {
      title: "Active Scans",
      value: "3",
      icon: Activity,
      description: "Currently running",
      variant: "cyber" as const,
    },
    {
      title: "Total Findings",
      value: "127",
      icon: AlertTriangle,
      description: "Last 30 days",
      variant: "warning" as const,
    },
    {
      title: "Targets Monitored",
      value: "42",
      icon: Target,
      description: "Active projects",
      variant: "success" as const,
    },
    {
      title: "Success Rate",
      value: "94.2%",
      icon: TrendingUp,
      description: "Scan completion",
      variant: "success" as const,
    },
  ];

  const recentScans = [
    {
      id: 1,
      target: "api.example.com",
      type: "Full Scan",
      status: "completed",
      severity: "high",
      timestamp: "2 minutes ago",
      findings: 8,
    },
    {
      id: 2,
      target: "subdomain.target.com",
      type: "Port Scan",
      status: "completed",
      severity: "medium",
      timestamp: "15 minutes ago",
      findings: 3,
    },
    {
      id: 3,
      target: "webapp.client.org",
      type: "CMS Detection",
      status: "running",
      severity: "low",
      timestamp: "1 hour ago",
      findings: 1,
    },
    {
      id: 4,
      target: "secure.domain.net",
      type: "Vuln Scan",
      status: "completed",
      severity: "critical",
      timestamp: "3 hours ago",
      findings: 15,
    },
  ];

  const activeScans = [
    {
      id: 1,
      target: "new-target.com",
      type: "Port Scan",
      progress: 73,
      eta: "2 min",
    },
    {
      id: 2,
      target: "webapp.test.io",
      type: "Vulnerability Assessment",
      progress: 45,
      eta: "8 min",
    },
  ];

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
          <Button variant="cyber" size="lg">
            <Play className="h-4 w-4 mr-2" />
            New Scan
          </Button>
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
              <div className="space-y-4">
                {recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
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
                    <Button
                      key={index}
                      variant={action.variant}
                      className="w-full justify-start h-auto p-3"
                    >
                      <IconComponent className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs opacity-90">{action.description}</div>
                      </div>
                    </Button>
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
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;