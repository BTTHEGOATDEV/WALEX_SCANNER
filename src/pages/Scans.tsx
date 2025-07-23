import { useState } from "react";
import { Activity, Play, Pause, RotateCcw, Filter, Calendar, Clock, Target, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const Scans = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const scans = [
    {
      id: 1,
      target: "api.example.com",
      type: "Full Security Scan",
      status: "running",
      progress: 73,
      startTime: "2024-01-23 14:30",
      estimatedCompletion: "15:45",
      findings: 8,
      severity: "high",
      project: "E-commerce Audit",
    },
    {
      id: 2,
      target: "webapp.client.org",
      type: "Vulnerability Assessment",
      status: "completed",
      progress: 100,
      startTime: "2024-01-23 12:00",
      estimatedCompletion: "Completed",
      findings: 15,
      severity: "critical",
      project: "Financial App Pentest",
    },
    {
      id: 3,
      target: "subdomain.target.com",
      type: "Port Scan",
      status: "queued",
      progress: 0,
      startTime: "Scheduled for 16:00",
      estimatedCompletion: "16:30",
      findings: 0,
      severity: "none",
      project: "Healthcare Platform",
    },
    {
      id: 4,
      target: "mobile.app.net",
      type: "SSL/TLS Analysis",
      status: "completed",
      progress: 100,
      startTime: "2024-01-23 10:15",
      estimatedCompletion: "Completed",
      findings: 3,
      severity: "medium",
      project: "IoT Assessment",
    },
    {
      id: 5,
      target: "secure.domain.net",
      type: "CMS Detection",
      status: "failed",
      progress: 45,
      startTime: "2024-01-23 09:30",
      estimatedCompletion: "Failed at 10:15",
      findings: 2,
      severity: "low",
      project: "E-commerce Audit",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-primary text-primary-foreground animate-pulse";
      case "completed": return "bg-success text-success-foreground";
      case "queued": return "bg-warning text-warning-foreground";
      case "failed": return "bg-critical text-critical-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-critical text-critical-foreground";
      case "high": return "bg-cyber-red text-cyber-red-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleScanAction = (action: string, scanId: number) => {
    toast({
      title: `Scan ${action}`,
      description: `${action} scan ID: ${scanId}`,
    });
  };

  const handleNewScan = () => {
    toast({
      title: "New Scan",
      description: "Opening scan configuration wizard...",
    });
  };

  const filteredScans = scans.filter(scan => {
    const matchesSearch = scan.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scan.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scan.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || scan.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
                Scans
              </h1>
              <p className="text-muted-foreground">Monitor and manage security scans</p>
            </div>
            <Button variant="cyber" size="lg" onClick={handleNewScan}>
              <Play className="h-4 w-4 mr-2" />
              New Scan
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "running", "completed", "queued", "failed"].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "cyber" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Scans List */}
          <div className="space-y-4">
            {filteredScans.map((scan) => (
              <Card key={scan.id} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{scan.target}</h3>
                          <Badge className={getStatusColor(scan.status)}>
                            {scan.status}
                          </Badge>
                          {scan.severity !== "none" && (
                            <Badge variant="outline" className={getSeverityColor(scan.severity)}>
                              {scan.severity}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{scan.type} • {scan.project}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {scan.startTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {scan.estimatedCompletion}
                          </span>
                          {scan.findings > 0 && (
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {scan.findings} findings
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {scan.status === "running" && (
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{scan.progress}%</span>
                          </div>
                          <Progress value={scan.progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {scan.status === "running" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleScanAction("Paused", scan.id)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {(scan.status === "completed" || scan.status === "failed") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleScanAction("Restarted", scan.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleScanAction("Viewed", scan.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scans;