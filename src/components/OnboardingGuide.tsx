import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Target, Activity, FolderOpen, BarChart3, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OnboardingGuideProps {
  onComplete: () => void;
}

const OnboardingGuide = ({ onComplete }: OnboardingGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to CyberScan",
      description: "Your comprehensive penetration testing platform",
      content: (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
            <Target className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground">
            CyberScan helps you manage security assessments, track vulnerabilities, and monitor your digital assets with ease.
          </p>
        </div>
      )
    },
    {
      title: "Dashboard Overview",
      description: "Monitor your security posture at a glance",
      content: (
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Track active scans and findings</p>
              <p>• Monitor target coverage</p>
              <p>• View success rates and trends</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Managing Projects",
      description: "Organize your penetration testing projects",
      content: (
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                Project Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Create projects for different clients</p>
              <p>• Track progress and team members</p>
              <p>• Manage targets and timelines</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Running Scans",
      description: "Perform security assessments",
      content: (
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Security Scanning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Launch various scan types</p>
              <p>• Monitor real-time progress</p>
              <p>• Review detailed findings</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Reports & Analytics",
      description: "Generate comprehensive security reports",
      content: (
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Export detailed reports</p>
              <p>• Customize report templates</p>
              <p>• Share findings with stakeholders</p>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipGuide = () => {
    onComplete();
  };

  return (
    <Dialog open={true} onOpenChange={skipGuide}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {steps[currentStep].title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipGuide}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {steps[currentStep].description}
          </p>
        </DialogHeader>

        <div className="py-4">
          {steps[currentStep].content}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              variant="cyber"
              size="sm"
              onClick={nextStep}
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep !== steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingGuide;