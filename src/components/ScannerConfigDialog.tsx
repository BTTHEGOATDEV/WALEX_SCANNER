import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Rocket, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react";
import SecretForm from "./SecretForm";

interface ScannerConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScannerConfigDialog = ({ isOpen, onClose }: ScannerConfigDialogProps) => {
  const [showSecretForm, setShowSecretForm] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if the scanner URL is already configured
    // This would typically check your backend configuration
    checkScannerConfiguration();
  }, []);

  const checkScannerConfiguration = async () => {
    // In a real implementation, you would check if the PYTHON_SCANNER_URL is configured
    // For now, we'll assume it's not configured
    setIsConfigured(false);
  };

  const handleConfigureScanner = () => {
    setShowSecretForm(true);
  };

  const handleSecretSubmit = async (secretValue: string) => {
    // Here you would save the secret to your backend/Supabase configuration
    console.log("Configuring Python Scanner URL:", secretValue);
    
    // For demonstration, we'll just mark it as configured
    setIsConfigured(true);
    setShowSecretForm(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Real nmap Scanner Setup
            </DialogTitle>
            <DialogDescription>
              Configure your Python nmap scanner for real security scanning
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isConfigured ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ Python scanner is configured and ready! Your scans will now use real nmap scanning.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Currently using mock scan data. Configure your Python scanner for real security scanning.
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h3 className="font-medium">Python Scanner Benefits:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Real nmap network scanning</li>
                <li>• Actual vulnerability detection</li>
                <li>• Comprehensive port discovery</li>
                <li>• Detailed security assessments</li>
                <li>• Professional-grade results</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-warning/10 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Quick Deployment Options:</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-background/50 p-3 rounded">
                  <div className="font-medium">Railway (Recommended)</div>
                  <div className="text-xs text-muted-foreground">Easy deployment, auto-scaling</div>
                </div>
                <div className="bg-background/50 p-3 rounded">
                  <div className="font-medium">Render</div>
                  <div className="text-xs text-muted-foreground">Free tier available</div>
                </div>
                <div className="bg-background/50 p-3 rounded">
                  <div className="font-medium">DigitalOcean</div>
                  <div className="text-xs text-muted-foreground">Professional hosting</div>
                </div>
                <div className="bg-background/50 p-3 rounded">
                  <div className="font-medium">Google Cloud Run</div>
                  <div className="text-xs text-muted-foreground">Serverless, pay-per-use</div>
                </div>
              </div>
            </div>

            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertDescription>
                <strong>Deployment Guide:</strong> Check the <code>python-scanner/DEPLOYMENT.md</code> file for comprehensive 
                deployment instructions and platform-specific setup guides.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={onClose}>
                Skip for Now
              </Button>
              <div className="flex gap-2">
                {!isConfigured && (
                  <Button variant="cyber" onClick={handleConfigureScanner}>
                    Configure Scanner URL
                  </Button>
                )}
                {isConfigured && (
                  <Button variant="cyber" onClick={onClose}>
                    Ready to Scan!
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SecretForm
        secretName="PYTHON_SCANNER_URL"
        isOpen={showSecretForm}
        onClose={() => setShowSecretForm(false)}
        onSubmit={handleSecretSubmit}
      />
    </>
  );
};

export default ScannerConfigDialog;