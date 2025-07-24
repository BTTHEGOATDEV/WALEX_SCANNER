import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Target, Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface ScanDialogProps {
  actionType: string;
  children: React.ReactNode;
}

const ScanDialog = ({ actionType, children }: ScanDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    target: "",
    scanType: "",
    project: "",
    description: "",
    priority: "medium",
  });

  const scanTypes = {
    "Scan New Domain": [
      { value: "full", label: "Full Security Scan", icon: Target },
      { value: "basic", label: "Basic Vulnerability Scan", icon: Shield },
      { value: "deep", label: "Deep Penetration Test", icon: AlertTriangle },
    ],
    "Port Range Check": [
      { value: "tcp", label: "TCP Port Scan", icon: Shield },
      { value: "udp", label: "UDP Port Scan", icon: Shield },
      { value: "stealth", label: "Stealth Port Scan", icon: Target },
    ],
    "Vulnerability Assessment": [
      { value: "web", label: "Web Application Scan", icon: AlertTriangle },
      { value: "network", label: "Network Vulnerability Scan", icon: Shield },
      { value: "database", label: "Database Security Scan", icon: Target },
    ],
    "SSL/TLS Analysis": [
      { value: "cert", label: "Certificate Analysis", icon: CheckCircle },
      { value: "config", label: "Configuration Review", icon: Shield },
      { value: "compliance", label: "Compliance Check", icon: Target },
    ],
  };

  // Replace this with actual API call to fetch projects
  const projects: string[] = [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.target || !formData.scanType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Scan Initiated",
      description: `${actionType} started for ${formData.target}`,
    });

    setIsOpen(false);
    setFormData({
      target: "",
      scanType: "",
      project: "",
      description: "",
      priority: "medium",
    });
  };

  const currentScanTypes = scanTypes[actionType as keyof typeof scanTypes] || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {actionType}
          </DialogTitle>
          <DialogDescription>
            Configure and launch your security scan
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target">Target *</Label>
            <Input
              id="target"
              placeholder="Enter domain, IP, or URL"
              value={formData.target}
              onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scanType">Scan Type *</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, scanType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select scan type" />
              </SelectTrigger>
              <SelectContent>
                {currentScanTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, project: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select project (optional)" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={formData.priority}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-success text-success-foreground">Low</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-warning text-warning-foreground">Medium</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-cyber-red text-cyber-red-foreground">High</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="critical">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-critical text-critical-foreground">Critical</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional notes or specific requirements..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="cyber" className="flex-1">
              Launch Scan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScanDialog;