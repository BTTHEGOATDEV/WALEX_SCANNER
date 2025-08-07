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
      title: "Welcome to WalexScan",
      description: "Your comprehensive penetration testing platform",
      route: "/dashboard",
      content: (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
            <Target className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground">
            WalexScan helps you manage security assessments, track vulnerabilities, and monitor your digital assets with ease.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium">🚀 Getting Started</p>
            <p className="text-xs text-muted-foreground mt-1">
              This guide will show you around your dashboard and key features
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Security Dashboard",
      description: "Your security command center - see the metrics above",
      route: "/dashboard",
      content: (
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Dashboard Overview
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
      title: "Recent Activity",
      description: "Stay updated with your latest scans and alerts",
      route: "/dashboard",
      content: (
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="bg-success/10 p-3 rounded-lg">
                <p className="font-medium">🕒 Recent Activity</p>
                <p className="text-xs">• View completed scans</p>
                <p className="text-xs">• Monitor scan progress</p>
                <p className="text-xs">• Check system alerts</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Check the activity section to stay updated on your security operations.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Quick Actions",
      description: "Start your security assessments",
      route: "/dashboard",
      content: (
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Quick Start Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-primary/10 p-2 rounded text-center">
                  <Target className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-xs font-medium">New Scan</p>
                </div>
                <div className="bg-success/10 p-2 rounded text-center">
                  <BarChart3 className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-xs font-medium">View Reports</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Use the navigation or quick action buttons to start scanning!
              </p>
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
    <Dialog open={true} onOpenChange={(open) => !open && onComplete()}>
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
              onClick={skipGuide}
            >
              Skip Guide
            </Button>
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
              variant="default"
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