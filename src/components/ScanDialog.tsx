import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Target, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import PaidPlanModal from "./PaidPlanModal";

interface ScanDialogProps {
  actionType: string;
  children: React.ReactNode;
  onScanCreated?: () => void;
}

const ScanDialog = ({ actionType, children, onScanCreated }: ScanDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
  const [paidFeatureName, setPaidFeatureName] = useState("");
  const [formData, setFormData] = useState({
    target: "",
    scanType: "",
    priority: "medium",
  });

  const scanTypes = {
    "Scan New Domain": [
      { value: "full", label: "Full Security Scan", icon: Target, isPaid: true },
      { value: "basic", label: "Basic Vulnerability Scan", icon: Shield, isPaid: false },
      { value: "deep", label: "Deep Penetration Test", icon: AlertTriangle, isPaid: true },
    ],
    "Port Range Check": [
      { value: "tcp", label: "TCP Port Scan", icon: Shield, isPaid: false },
      { value: "udp", label: "UDP Port Scan", icon: Shield, isPaid: true },
      { value: "stealth", label: "Stealth Port Scan", icon: Target, isPaid: true },
    ],
    "Vulnerability Assessment": [
      { value: "web", label: "Web Application Scan", icon: AlertTriangle, isPaid: true },
      { value: "network", label: "Network Vulnerability Scan", icon: Shield, isPaid: true },
      { value: "database", label: "Database Security Scan", icon: Target, isPaid: true },
    ],
    "SSL/TLS Analysis": [
      { value: "cert", label: "Certificate Analysis", icon: CheckCircle, isPaid: true },
      { value: "config", label: "Configuration Review", icon: Shield, isPaid: true },
      { value: "compliance", label: "Compliance Check", icon: Target, isPaid: true },
    ],
  };

  const isPaidFeature = (scanType: string) => {
    const currentTypes = scanTypes[actionType as keyof typeof scanTypes] || [];
    const selectedType = currentTypes.find(type => type.value === scanType);
    return selectedType?.isPaid || false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.target || !formData.scanType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if this is a paid feature
    if (isPaidFeature(formData.scanType)) {
      const currentTypes = scanTypes[actionType as keyof typeof scanTypes] || [];
      const selectedType = currentTypes.find(type => type.value === formData.scanType);
      setPaidFeatureName(selectedType?.label || "Premium Feature");
      setIsPaidModalOpen(true);
      return;
    }

    try {
      const scanTypeMap: Record<string, string> = {
        "Scan New Domain": "domain",
        "Port Range Check": "port", 
        "Vulnerability Assessment": "vulnerability",
        "SSL/TLS Analysis": "ssl"
      };

      const { data, error } = await supabase.functions.invoke('create-scan', {
        body: {
          target: formData.target,
          scanType: scanTypeMap[actionType],
          scanSubtype: formData.scanType,
          priority: formData.priority
        }
      });

      if (error) throw error;

      toast({
        title: "Scan Initiated",
        description: `${actionType} started for ${formData.target}`,
      });

      setIsOpen(false);
      setFormData({
        target: "",
        scanType: "",
        priority: "medium",
      });

      // Notify parent component to refresh scan list
      onScanCreated?.();

    } catch (error: any) {
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to create scan",
        variant: "destructive",
      });
    }
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
                        {type.isPaid && <Badge variant="outline" className="bg-warning text-warning-foreground text-xs">Pro</Badge>}
                      </div>
                    </SelectItem>
                  );
                })}
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
      
      <PaidPlanModal 
        isOpen={isPaidModalOpen}
        onClose={() => setIsPaidModalOpen(false)}
        featureName={paidFeatureName}
      />
    </Dialog>
  );
};

export default ScanDialog;
