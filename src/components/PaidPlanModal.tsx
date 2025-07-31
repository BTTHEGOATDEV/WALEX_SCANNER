import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Star } from "lucide-react";

interface PaidPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

const PaidPlanModal = ({ isOpen, onClose, featureName }: PaidPlanModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-warning" />
            Premium Feature
          </DialogTitle>
          <DialogDescription>
            Upgrade to unlock advanced security scanning capabilities
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-warning/10 rounded-lg border">
            <Star className="h-8 w-8 text-warning" />
            <div>
              <h3 className="font-semibold text-foreground">🔒 {featureName}</h3>
              <p className="text-sm text-muted-foreground">
                This is a premium feature. Please upgrade your plan to unlock advanced scans.
              </p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span>Advanced vulnerability detection</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span>Detailed security reports</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span>Priority scan execution</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="cyber" className="flex-1">
            Upgrade Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaidPlanModal;