import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Target, Network, Lock, Search, Wifi, Server, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PortCheckerInfo = () => {
  const navigate = useNavigate();

  const commonPorts = [
    { port: "20-21", service: "FTP", description: "File Transfer Protocol", color: "bg-cyber-blue" },
    { port: "22", service: "SSH", description: "Secure Shell", color: "bg-success" },
    { port: "25", service: "SMTP", description: "Email Transfer", color: "bg-warning" },
    { port: "53", service: "DNS", description: "Domain Name System", color: "bg-info" },
    { port: "80", service: "HTTP", description: "Web Traffic", color: "bg-primary" },
    { port: "443", service: "HTTPS", description: "Secure Web", color: "bg-cyber-green" },
    { port: "3306", service: "MySQL", description: "Database", color: "bg-cyber-orange" },
    { port: "3389", service: "RDP", description: "Remote Desktop", color: "bg-cyber-red" }
  ];

  const scanTypes = [
    {
      icon: Target,
      title: "TCP Scanning",
      description: "Reliable connection-based port scanning for accurate results",
      color: "text-cyber-green"
    },
    {
      icon: Network,
      title: "UDP Scanning", 
      description: "Fast connectionless scanning for network services discovery",
      color: "text-cyber-blue"
    },
    {
      icon: Shield,
      title: "Stealth Scanning",
      description: "Advanced techniques to avoid detection during reconnaissance",
      color: "text-cyber-orange"
    },
    {
      icon: Search,
      title: "Service Detection",
      description: "Identify running services and their versions on open ports",
      color: "text-warning"  
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Info Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50"></div>
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-cyber">
              <Wifi className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
                Professional Port Checker
              </CardTitle>
              <CardDescription className="text-base">
                Advanced TCP & UDP port scanning for comprehensive network analysis
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Our sophisticated port scanner combines traditional TCP and UDP scanning techniques to deliver 
            <span className="font-semibold text-cyber-green"> 100% accurate results</span>. Think of it as your 
            network's advanced security investigator - systematically checking every digital door to identify 
            vulnerabilities and connectivity status.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-success" />
                  <span className="font-semibold text-success">Security Assessment</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Identify potential vulnerabilities and flag security risks across your network infrastructure.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="h-4 w-4 text-cyber-blue" />
                  <span className="font-semibold text-cyber-blue">Service Discovery</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Map running services and understand your network's connectivity landscape with precision.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button 
              onClick={() => navigate('/scans')} 
              className="bg-gradient-cyber hover:opacity-90"
              size="lg"
            >
              <Target className="h-4 w-4 mr-2" />
              Start Port Scan
            </Button>
            <Button 
              onClick={() => navigate('/reports')} 
              variant="outline" 
              size="lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Common Ports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Most Scanned Ports
          </CardTitle>
          <CardDescription>
            Essential ports commonly targeted during security assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {commonPorts.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                <Badge variant="outline" className={`${item.color} text-foreground font-mono text-xs`}>
                  {item.port}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{item.service}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scanning Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Scanning Techniques</CardTitle>
          <CardDescription>
            Professional methodologies for comprehensive network reconnaissance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {scanTypes.map((scan, index) => {
              const IconComponent = scan.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-border/50">
                  <IconComponent className={`h-5 w-5 mt-0.5 ${scan.color}`} />
                  <div>
                    <h3 className="font-semibold text-sm">{scan.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{scan.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortCheckerInfo;