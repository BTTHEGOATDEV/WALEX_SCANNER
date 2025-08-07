import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Target, Calendar, Clock, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ScanDetailsDialogProps {
  scanId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ScanResult {
  scan_id: string;
  content: any;
  result_type: string;
  created_at: string;
}

const ScanDetailsDialog = ({ scanId, isOpen, onClose }: ScanDetailsDialogProps) => {
  const [scanDetails, setScanDetails] = useState<any>(null);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scanId && isOpen) {
      fetchScanDetails();
    }
  }, [scanId, isOpen]);

  const fetchScanDetails = async () => {
    if (!scanId) return;
    
    setLoading(true);
    try {
      // Fetch scan details
      const { data: scan, error: scanError } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (scanError) throw scanError;
      setScanDetails(scan);

      // Fetch scan results
      const { data: results, error: resultsError } = await supabase
        .from('scan_results')
        .select('*')
        .eq('scan_id', scanId);

      if (resultsError) throw resultsError;
      setScanResults(results || []);
    } catch (error) {
      console.error('Error fetching scan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-cyber-red" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'low':
        return <Info className="h-4 w-4 text-info" />;
      default:
        return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-critical text-critical-foreground';
      case 'high':
        return 'bg-cyber-red text-cyber-red-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-info text-info-foreground';
      default:
        return 'bg-success text-success-foreground';
    }
  };

  const formatDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = endTime.getTime() - startTime.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (!scanDetails) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Scan Details
          </DialogTitle>
          <DialogDescription>
            Detailed information and results for scan #{scanDetails.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Scan Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Target:</span>
                  <span className="text-sm font-mono">{scanDetails.target}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Type:</span>
                  <Badge variant="outline">{scanDetails.scan_type}</Badge>
                  {scanDetails.scan_subtype && <Badge variant="secondary">{scanDetails.scan_subtype}</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={scanDetails.status === 'completed' ? 'default' : 'secondary'}>
                    {scanDetails.status}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Started:</span>
                  <span className="text-sm">{new Date(scanDetails.started_at || scanDetails.created_at).toLocaleString()}</span>
                </div>
                {scanDetails.completed_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm">{formatDuration(scanDetails.started_at || scanDetails.created_at, scanDetails.completed_at)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Severity:</span>
                  <Badge className={getSeverityColor(scanDetails.severity)}>
                    {getSeverityIcon(scanDetails.severity)}
                    {scanDetails.severity}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Scan Results */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading results...</p>
              </div>
            ) : scanResults.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Scan Results</h3>
                {scanResults.map((result, index) => (
                  <div key={index} className="bg-card border rounded-lg p-4">
                    <div className="mb-3">
                      <Badge variant="outline">{result.result_type}</Badge>
                    </div>
                    
                    {result.content.summary && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Summary</h4>
                        <div className="bg-muted/50 rounded p-3 text-sm">
                          {Object.entries(result.content.summary).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-1">
                              <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                              <span className="font-mono">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.content.findings && result.content.findings.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Findings ({result.content.findings.length})</h4>
                        <div className="space-y-2">
                          {result.content.findings.map((finding: any, findingIndex: number) => (
                            <div key={findingIndex} className="border rounded p-3 bg-muted/20">
                              <div className="flex items-center gap-2 mb-2">
                                {getSeverityIcon(finding.severity)}
                                <span className="font-medium">{finding.title}</span>
                                <Badge className={getSeverityColor(finding.severity)} variant="outline">
                                  {finding.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{finding.description}</p>
                              {finding.cve && (
                                <div className="mt-2">
                                  <Badge variant="destructive">{finding.cve}</Badge>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : scanDetails.status === 'running' ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground font-medium">Scan in Progress...</p>
                <p className="text-sm text-muted-foreground mt-2">Please wait while the scan completes</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No detailed results available for this scan.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScanDetailsDialog;