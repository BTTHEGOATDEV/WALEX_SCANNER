import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Target, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Zap, 
  Eye,
  Server,
  Globe,
  Lock,
  Wifi,
  Database
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ScanDialog from "@/components/ScanDialog";

const EnhancedDashboard = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    activeScans: 0,
    criticalFindings: 0,
    totalProjects: 0,
    lastScanDate: null as Date | null
  });
  
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch scans data
      const { data: scans } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (scans) {
        setRecentScans(scans);
        setStats({
          totalScans: scans.length,
          activeScans: scans.filter(s => s.status === 'running' || s.status === 'queued').length,
          criticalFindings: scans.filter(s => s.severity === 'critical' || s.severity === 'high').length,
          totalProjects: 3, // Mock value for now
          lastScanDate: scans.length > 0 ? new Date(scans[0].created_at) : null
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Domain Scan",
      description: "Comprehensive domain analysis",
      icon: Globe,
      color: "text-primary",
      action: "Scan New Domain"
    },
    {
      title: "Port Scan", 
      description: "Network port discovery",
      icon: Wifi,
      color: "text-success",
      action: "Port Range Check"
    },
    {
      title: "Vulnerability Scan",
      description: "Security assessment",
      icon: Shield,
      color: "text-warning",
      action: "Vulnerability Assessment"
    },
    {
      title: "SSL Analysis",
      description: "Certificate validation",
      icon: Lock,
      color: "text-info",
      action: "SSL/TLS Analysis"
    }
  ];

  const securityMetrics = [
    { label: "Security Score", value: 87, max: 100, color: "bg-success" },
    { label: "Threat Level", value: 23, max: 100, color: "bg-warning" },
    { label: "Compliance", value: 94, max: 100, color: "bg-primary" },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-background to-cyber-blue/5 p-6 border border-primary/20">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-display mb-2 animate-fade-in-down">
            Security Operations Center
          </h1>
          <p className="text-muted-foreground mb-4 animate-fade-in-down" style={{ animationDelay: '0.1s' }}>
            Monitor, analyze, and secure your digital infrastructure
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <ScanDialog actionType="Scan New Domain" onScanCreated={fetchDashboardData}>
              <Button className="bg-primary hover:bg-primary/90">
                <Zap className="h-4 w-4 mr-2" />
                Quick Scan
              </Button>
            </ScanDialog>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-cyber opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-cyber-green/20 to-cyber-blue/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Scans", value: stats.totalScans, icon: Activity, color: "text-primary", trend: "+12%" },
          { title: "Active Scans", value: stats.activeScans, icon: Zap, color: "text-success", trend: "+5%" },
          { title: "Critical Issues", value: stats.criticalFindings, icon: AlertTriangle, color: "text-destructive", trend: "-8%" },
          { title: "Projects", value: stats.totalProjects, icon: Target, color: "text-info", trend: "+3%" },
        ].map((stat, index) => (
          <Card key={stat.title} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold font-mono">{stat.value}</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Metrics */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Metrics
          </CardTitle>
          <CardDescription>Real-time security posture indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {securityMetrics.map((metric, index) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{metric.label}</span>
                  <span className="font-mono">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Launch security scans and assessments</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <ScanDialog key={action.title} actionType={action.action} onScanCreated={fetchDashboardData}>
                <div className="group cursor-pointer p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 hover:shadow-md">
                  <action.icon className={`h-8 w-8 mb-2 ${action.color} group-hover:scale-110 transition-transform`} />
                  <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </ScanDialog>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="animate-slide-in-right" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Scans
            </CardTitle>
            <CardDescription>Latest security scan activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentScans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scans yet</p>
                <p className="text-sm">Start your first security scan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan, index) => (
                  <div key={scan.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                    <div className="p-2 rounded-full bg-muted">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate font-mono">{scan.target}</p>
                      <p className="text-xs text-muted-foreground">{scan.scan_type}</p>
                    </div>
                    <Badge 
                      variant={scan.status === 'completed' ? 'default' : scan.status === 'running' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {scan.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { service: "Scan Engine", status: "operational", uptime: "99.9%" },
              { service: "Database", status: "operational", uptime: "100%" },
              { service: "API Gateway", status: "operational", uptime: "99.8%" }
            ].map((service, index) => (
              <div key={service.service} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 animate-scale-in" style={{ animationDelay: `${0.7 + index * 0.1}s` }}>
                <div>
                  <p className="text-sm font-medium">{service.service}</p>
                  <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
                </div>
                <Badge variant="default" className="bg-success text-success-foreground">
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;