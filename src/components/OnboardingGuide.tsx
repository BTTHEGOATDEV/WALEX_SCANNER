import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Target, Activity, FolderOpen, BarChart3, Settings, Shield, Zap, Lock, Wifi } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface OnboardingGuideProps {
  onComplete: () => void;
}

const OnboardingGuide = ({ onComplete }: OnboardingGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to CyberScan",
      description: "Your comprehensive penetration testing platform",
      route: "/",
      content: (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
            <Target className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground">
            CyberScan helps you manage security assessments, track vulnerabilities, and monitor your digital assets with ease.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium">🚀 Getting Started</p>
            <p className="text-xs text-muted-foreground mt-1">
              This interactive guide will walk you through each feature with real navigation
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Security Dashboard",
      description: "Your security command center",
      route: "/",
      content: (
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Live Dashboard Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="font-medium">📊 Key Metrics</p>
                <p className="text-xs">• Track active scans and findings</p>
                <p className="text-xs">• Monitor target coverage</p>
                <p className="text-xs">• View success rates and trends</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Look at the metrics cards above to see your security posture at a glance!
              </p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Security Scans",
      description: "Launch comprehensive security assessments",
      route: "/scans",
      content: (
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Scan Types Available
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-primary/10 p-2 rounded text-center">
                  <Target className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-xs font-medium">Domain</p>
                </div>
                <div className="bg-success/10 p-2 rounded text-center">
                  <Wifi className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-xs font-medium">Port</p>
                </div>
                <div className="bg-warning/10 p-2 rounded text-center">
                  <Shield className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-xs font-medium">Vulnerability</p>
                </div>
                <div className="bg-info/10 p-2 rounded text-center">
                  <Lock className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-xs font-medium">SSL/TLS</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Click the quick action buttons above to start your first scan!
              </p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Reports & Analytics",
      description: "View detailed security reports",
      route: "/reports",
      content: (
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Report Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="bg-gradient-to-r from-primary/10 to-warning/10 p-3 rounded-lg">
                <p className="font-medium">📈 Analytics Dashboard</p>
                <p className="text-xs">• Export detailed PDF reports</p>
                <p className="text-xs">• Customize report templates</p>
                <p className="text-xs">• Share findings with stakeholders</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Access comprehensive reporting tools to document your security findings.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Settings & Configuration",
      description: "Customize your security environment",
      route: "/settings",
      content: (
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Configuration Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <p className="text-xs">Theme preferences</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <p className="text-xs">Notification settings</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <p className="text-xs">API configurations</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Personalize your CyberScan experience and configure advanced settings.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      // Navigate to the next step's route
      if (steps[nextStepIndex].route) {
        navigate(steps[nextStepIndex].route);
      }
      setCurrentStep(nextStepIndex);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      // Navigate to the previous step's route
      if (steps[prevStepIndex].route) {
        navigate(steps[prevStepIndex].route);
      }
      setCurrentStep(prevStepIndex);
    }
  };

  const skipGuide = () => {
    onComplete();
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {steps[currentStep].title}
          </DialogTitle>
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