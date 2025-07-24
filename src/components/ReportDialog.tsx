import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Mail, Calendar } from "lucide-react";

interface ReportDialogProps {
  children: React.ReactNode;
}

const ReportDialog = ({ children }: ReportDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    project: "",
    reportType: "",
    format: "pdf",
    includeExecutiveSummary: true,
    includeTechnicalDetails: true,
    includeRecommendations: true,
    includeAppendices: false,
    customSections: "",
    recipients: "",
  });

  const reportTypes = [
    { value: "executive", label: "Executive Summary" },
    { value: "technical", label: "Technical Report" },
    { value: "compliance", label: "Compliance Report" },
    { value: "vulnerability", label: "Vulnerability Assessment" },
    { value: "penetration", label: "Penetration Test Report" },
    { value: "custom", label: "Custom Report" },
  ];

  const projects = [
    "E-commerce Security Audit",
    "Financial App Pentest",
    "Healthcare Platform Review",
    "IoT Device Assessment",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.reportType) {
      toast({
        title: "Missing Information",
        description: "Please fill in report title and type.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send data to your backend
    console.log("Generating report:", formData);

    toast({
      title: "Report Generation Started",
      description: `${formData.title} is being generated. You'll be notified when it's ready.`,
    });

    setIsOpen(false);
    setFormData({
      title: "",
      project: "",
      reportType: "",
      format: "pdf",
      includeExecutiveSummary: true,
      includeTechnicalDetails: true,
      includeRecommendations: true,
      includeAppendices: false,
      customSections: "",
      recipients: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate Security Report
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive security report with customizable sections and formats
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Q1 2024 Security Assessment"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Associated Project</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select 
                value={formData.format}
                onValueChange={(value) => setFormData(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF Document
                    </div>
                  </SelectItem>
                  <SelectItem value="html">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      HTML Report
                    </div>
                  </SelectItem>
                  <SelectItem value="docx">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Word Document
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Report Sections</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="executive"
                  checked={formData.includeExecutiveSummary}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, includeExecutiveSummary: checked as boolean }))
                  }
                />
                <Label htmlFor="executive">Executive Summary</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="technical"
                  checked={formData.includeTechnicalDetails}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, includeTechnicalDetails: checked as boolean }))
                  }
                />
                <Label htmlFor="technical">Technical Details</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommendations"
                  checked={formData.includeRecommendations}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, includeRecommendations: checked as boolean }))
                  }
                />
                <Label htmlFor="recommendations">Recommendations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="appendices"
                  checked={formData.includeAppendices}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, includeAppendices: checked as boolean }))
                  }
                />
                <Label htmlFor="appendices">Appendices</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customSections">Custom Sections</Label>
            <Textarea
              id="customSections"
              placeholder="Specify any additional sections or special requirements..."
              value={formData.customSections}
              onChange={(e) => setFormData(prev => ({ ...prev, customSections: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">Email Recipients</Label>
            <Input
              id="recipients"
              placeholder="client@company.com, manager@company.com"
              value={formData.recipients}
              onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="cyber" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;