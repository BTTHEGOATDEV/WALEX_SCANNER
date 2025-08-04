import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecretFormProps {
  secretName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (secretValue: string) => void;
  description?: string;
  placeholder?: string;
}

const SecretForm = ({ 
  secretName, 
  isOpen, 
  onClose, 
  onSubmit, 
  description,
  placeholder 
}: SecretFormProps) => {
  const [secretValue, setSecretValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!secretValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter a value for the secret",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(secretValue.trim());
      setSecretValue("");
      onClose();
      toast({
        title: "Success",
        description: `${secretName} has been configured successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save secret. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSecretInstructions = () => {
    switch (secretName) {
      case "PYTHON_SCANNER_URL":
        return {
          description: "The URL of your deployed Python nmap scanner service",
          placeholder: "https://your-scanner.railway.app",
          instructions: "Deploy the Python scanner following the deployment guide, then enter the URL here."
        };
      default:
        return {
          description: description || `Configuration value for ${secretName}`,
          placeholder: placeholder || "Enter secret value...",
          instructions: "Enter the required configuration value."
        };
    }
  };

  const instructions = getSecretInstructions();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configure {secretName}
          </DialogTitle>
          <DialogDescription>
            {instructions.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <AlertDescription className="text-sm">
              {instructions.instructions}
            </AlertDescription>
          </Alert>

          {secretName === "PYTHON_SCANNER_URL" && (
            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Need help deploying? Check the deployment guide in the python-scanner folder.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="secretValue">
              {secretName}
            </Label>
            <Input
              id="secretValue"
              type={secretName.includes("KEY") || secretName.includes("SECRET") ? "password" : "text"}
              value={secretValue}
              onChange={(e) => setSecretValue(e.target.value)}
              placeholder={instructions.placeholder}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="cyber"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Secret"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SecretForm;