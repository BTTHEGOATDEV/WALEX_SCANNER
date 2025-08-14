import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, Terminal, Eye, X } from "lucide-react";

interface ScanProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanId: string | null;
  scanDetails: any;
}

const ScanProgressModal = ({ isOpen, onClose, scanId, scanDetails }: ScanProgressModalProps) => {
  const [verboseMode, setVerboseMode] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!scanDetails) return;

    // Add logs based on scan progress and status
    const newLogs = [];
    
    if (scanDetails.status === 'running') {
      newLogs.push(`🚀 Scan initiated for target: ${scanDetails.target}`);
      newLogs.push(`📊 Scan type: ${scanDetails.scan_type} (${scanDetails.scan_subtype || 'default'})`);
      newLogs.push(`🔍 Running nmap with optimized parameters...`);
      
      if (scanDetails.progress >= 25) {
        newLogs.push(`🌐 Host discovery and port enumeration in progress...`);
      }
      if (scanDetails.progress >= 50) {
        newLogs.push(`🔓 Service detection and version identification...`);
      }
      if (scanDetails.progress >= 75) {
        newLogs.push(`🛡️ Running vulnerability detection scripts...`);
      }
      if (scanDetails.progress >= 90) {
        newLogs.push(`📝 Analyzing results and generating findings...`);
      }
    } else if (scanDetails.status === 'completed') {
      newLogs.push(`✅ Scan completed successfully!`);
      newLogs.push(`📊 Found ${scanDetails.findings_count || 0} findings`);
      newLogs.push(`🎯 Risk level: ${scanDetails.severity || 'Unknown'}`);
    } else if (scanDetails.status === 'failed') {
      newLogs.push(`❌ Scan failed: ${scanDetails.error_message || 'Unknown error'}`);
    }

    setLogs(newLogs);
  }, [scanDetails]);

  const getStatusColor = () => {
    switch (scanDetails?.status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (scanDetails?.status) {
      case 'running': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed': return <Eye className="w-4 h-4" />;
      case 'failed': return <X className="w-4 h-4" />;
      default: return <Loader2 className="w-4 h-4" />;
    }
  };

  if (!scanDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading Scan Details
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Scan Progress: {scanDetails.target}
          </DialogTitle>
          <DialogDescription>
            {scanDetails.scan_type} scan • {scanDetails.status}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <Badge variant="outline" className={`${getStatusColor()} text-white`}>
                {scanDetails.status.toUpperCase()}
              </Badge>
            </div>
            
            <Progress 
              value={scanDetails.progress || 0} 
              className="w-full h-3"
            />
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{scanDetails.progress || 0}% Complete</span>
              {scanDetails.estimated_completion && (
                <span>
                  ETA: {new Date(scanDetails.estimated_completion).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Scan Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <span className="text-sm font-medium">Target:</span>
              <p className="text-sm text-muted-foreground">{scanDetails.target}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Type:</span>
              <p className="text-sm text-muted-foreground">
                {scanDetails.scan_type} {scanDetails.scan_subtype && `(${scanDetails.scan_subtype})`}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">Started:</span>
              <p className="text-sm text-muted-foreground">
                {scanDetails.started_at ? new Date(scanDetails.started_at).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">Findings:</span>
              <p className="text-sm text-muted-foreground">{scanDetails.findings_count || 0}</p>
            </div>
          </div>

          {/* Verbose Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVerboseMode(!verboseMode)}
              className="flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              {verboseMode ? 'Hide' : 'Show'} Verbose Logs
            </Button>
          </div>

          {/* Verbose Logs */}
          {verboseMode && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Scan Logs
              </h4>
              <ScrollArea className="h-48 w-full rounded-md border p-4 bg-black text-green-400 font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))}
                {scanDetails.status === 'running' && (
                  <div className="flex items-center gap-2 text-blue-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Scan in progress...</span>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {scanDetails.status === 'completed' && (
              <Button variant="default" onClick={onClose}>
                View Results
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScanProgressModal;