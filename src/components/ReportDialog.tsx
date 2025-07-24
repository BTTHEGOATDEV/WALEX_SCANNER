import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download } from "lucide-react";

interface ReportDialogProps {
  children: React.ReactNode;
}

interface ReportSections {
  [key: string]: {
    enabled: boolean;
    content: string;
  };
}

const ReportDialog = ({ children }: ReportDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    reportType: "",
    format: "pdf",
    recipients: "",
  });

  const [reportSections, setReportSections] = useState<ReportSections>({
    executiveSummary: { enabled: true, content: "" },
    riskAssessment: { enabled: false, content: "" },
    vulnerabilityDetails: { enabled: false, content: "" },
    threatAnalysis: { enabled: false, content: "" },
    technicalDetails: { enabled: true, content: "" },
    findingsSummary: { enabled: false, content: "" },
    impactAnalysis: { enabled: false, content: "" },
    testingMethodology: { enabled: false, content: "" },
    networkArchitecture: { enabled: false, content: "" },
    systemInventory: { enabled: false, content: "" },
    securityControls: { enabled: false, content: "" },
    complianceStatus: { enabled: false, content: "" },
    recommendations: { enabled: true, content: "" },
    remediationPlan: { enabled: false, content: "" },
    appendices: { enabled: false, content: "" },
  });

  const reportTypes = [
    { value: "executive", label: "Executive Summary" },
    { value: "technical", label: "Technical Report" },
    { value: "compliance", label: "Compliance Report" },
    { value: "vulnerability", label: "Vulnerability Assessment" },
    { value: "penetration", label: "Penetration Test Report" },
    { value: "risk", label: "Risk Assessment Report" },
    { value: "custom", label: "Custom Report" },
  ];

  const sectionLabels = {
    executiveSummary: "Executive Summary",
    riskAssessment: "Risk Assessment",
    vulnerabilityDetails: "Vulnerability Details",
    threatAnalysis: "Threat Analysis",
    technicalDetails: "Technical Details",
    findingsSummary: "Findings Summary",
    impactAnalysis: "Impact Analysis",
    testingMethodology: "Testing Methodology",
    networkArchitecture: "Network Architecture",
    systemInventory: "System Inventory",
    securityControls: "Security Controls Assessment",
    complianceStatus: "Compliance Status",
    recommendations: "Recommendations",
    remediationPlan: "Remediation Plan",
    appendices: "Appendices",
  };

  const handleSectionToggle = (sectionKey: string, enabled: boolean) => {
    setReportSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        enabled,
      }
    }));
  };

  const handleSectionContentChange = (sectionKey: string, content: string) => {
    setReportSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        content,
      }
    }));
  };

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

    // Collect all enabled sections with their content
    const enabledSections = Object.entries(reportSections)
      .filter(([_, section]) => section.enabled)
      .reduce((acc, [key, section]) => {
        acc[key] = section;
        return acc;
      }, {} as ReportSections);

    const reportData = {
      ...formData,
      sections: enabledSections,
    };

    // Here you would typically send data to your backend
    console.log("Generating report:", reportData);

    toast({
      title: "Report Generation Started",
      description: `${formData.title} is being generated. You'll be notified when it's ready.`,
    });

    setIsOpen(false);
    setFormData({
      title: "",
      reportType: "",
      format: "pdf",
      recipients: "",
    });
    
    // Reset sections to default state
    setReportSections({
      executiveSummary: { enabled: true, content: "" },
      riskAssessment: { enabled: false, content: "" },
      vulnerabilityDetails: { enabled: false, content: "" },
      threatAnalysis: { enabled: false, content: "" },
      technicalDetails: { enabled: true, content: "" },
      findingsSummary: { enabled: false, content: "" },
      impactAnalysis: { enabled: false, content: "" },
      testingMethodology: { enabled: false, content: "" },
      networkArchitecture: { enabled: false, content: "" },
      systemInventory: { enabled: false, content: "" },
      securityControls: { enabled: false, content: "" },
      complianceStatus: { enabled: false, content: "" },
      recommendations: { enabled: true, content: "" },
      remediationPlan: { enabled: false, content: "" },
      appendices: { enabled: false, content: "" },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate Security Report
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive security report with customizable sections and content
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

          <div className="space-y-4">
            <Label>Report Sections</Label>
            <div className="space-y-4">
              {Object.entries(sectionLabels).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={reportSections[key].enabled}
                      onCheckedChange={(checked) => 
                        handleSectionToggle(key, checked as boolean)
                      }
                    />
                    <Label htmlFor={key} className="font-medium">{label}</Label>
                  </div>
                  {reportSections[key].enabled && (
                    <div className="ml-6">
                      <Textarea
                        placeholder={`Enter content for ${label.toLowerCase()}...`}
                        value={reportSections[key].content}
                        onChange={(e) => handleSectionContentChange(key, e.target.value)}
                        rows={3}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
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
            <Button type="submit" className="flex-1">
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