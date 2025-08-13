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
      console.log('Fetching scan details for ID:', scanId);
      
      const { data, error } = await supabase.functions.invoke('get-scan-results', {
        body: { scanId }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      setScanDetails(data?.scan ?? null);
      setScanResults(data?.results ?? []);
      
      if (!data?.scan) {
        console.warn('No scan found with ID:', scanId);
      }
    } catch (error) {
      console.error('Error fetching scan details:', error);
      // Set empty state so dialog still shows with error message
      setScanDetails(null);
      setScanResults([]);
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

  const renderResultContent = (result: ScanResult) => {
    const c = result.content;
    // Normalize common structures
    if (result.result_type === 'summary' && c && typeof c === 'object' && !Array.isArray(c)) {
      return (
        <div className="bg-muted/50 rounded p-3 text-sm">
          {Object.entries(c).map(([key, value]) => (
            <div key={key} className="flex justify-between py-1">
              <span className="capitalize">{String(key).replace(/_/g, ' ')}</span>
              <span className="font-mono">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
            </div>
          ))}
        </div>
      );
    }

    if (result.result_type === 'hosts') {
      const hosts = Array.isArray(c) ? c : c?.hosts;
      if (Array.isArray(hosts) && hosts.length > 0) {
        return (
          <div className="space-y-2">
            {hosts.map((h: any, i: number) => (
              <div key={i} className="border rounded p-3 bg-muted/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{h.address || h.ip || h.host || `Host ${i+1}`}</span>
                  {h.status && <Badge variant="outline">{h.status}</Badge>}
                </div>
                {h.open_ports && Array.isArray(h.open_ports) && h.open_ports.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Open Ports:</span>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      {h.open_ports.map((p: any, pi: number) => (
                        <div key={pi} className="bg-background/40 border rounded px-2 py-1 flex items-center justify-between">
                          <span className="font-mono">{p.port || p}</span>
                          {p.service && <span className="text-muted-foreground text-xs">{p.service}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }
    }

    if (c?.findings && Array.isArray(c.findings) && c.findings.length > 0) {
      return (
        <div className="space-y-3">
          {c.findings.map((finding: any, findingIndex: number) => (
            <div key={findingIndex} className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                {getSeverityIcon(finding.severity)}
                <span className="font-medium">{finding.title || finding.id || `Finding ${findingIndex+1}`}</span>
                {finding.severity && (
                  <Badge className={getSeverityColor(finding.severity)} variant="outline">
                    {finding.severity.toUpperCase()}
                  </Badge>
                )}
              </div>
              {finding.description && <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>}
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                {finding.host && (
                  <div><span className="font-medium">Host:</span> <span className="font-mono">{finding.host}</span></div>
                )}
                {finding.port && (
                  <div><span className="font-medium">Port:</span> <span className="font-mono">{finding.port}/{finding.protocol}</span></div>
                )}
                {finding.service && (
                  <div><span className="font-medium">Service:</span> {finding.service}</div>
                )}
                {finding.version && (
                  <div><span className="font-medium">Version:</span> {finding.version}</div>
                )}
              </div>
              
              {finding.recommendation && (
                <div className="mt-3 p-2 bg-info/10 border border-info/20 rounded text-xs">
                  <span className="font-medium">Recommendation:</span> {finding.recommendation}
                </div>
              )}
              
              {(finding.cve || finding.cves) && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {finding.cve && <Badge variant="destructive" className="text-xs">{finding.cve}</Badge>}
                  {finding.cves && finding.cves.map((cve: string, i: number) => (
                    <Badge key={i} variant="destructive" className="text-xs">{cve}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Fallbacks
    if (Array.isArray(c)) {
      return (
        <div className="space-y-2">
          {c.map((item: any, i: number) => (
            <div key={i} className="bg-muted/50 rounded p-3 text-sm font-mono overflow-x-auto">
              {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
            </div>
          ))}
        </div>
      );
    }
    if (c && typeof c === 'object') {
      return (
        <div className="bg-muted/50 rounded p-3 text-sm font-mono overflow-x-auto">
          {JSON.stringify(c, null, 2)}
        </div>
      );
    }
    if (c != null) {
      return <div className="text-sm">{String(c)}</div>;
    }
    return <div className="text-sm text-muted-foreground">No content for this result.</div>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Scan Details
          </DialogTitle>
          <DialogDescription>
            {scanDetails ? 
              `Detailed information and results for scan #${scanDetails.id.slice(0, 8)}` :
              `Loading scan details for ID: ${scanId?.slice(0, 8) || 'Unknown'}`
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading scan details...</p>
              </div>
            ) : !scanDetails ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Scan not found</p>
                <p className="text-sm text-muted-foreground mt-2">The scan with ID {scanId?.slice(0, 8)} could not be found or you don't have permission to view it.</p>
              </div>
            ) : (
              <>
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
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Scan Results</h3>
                {scanResults.map((result, index) => {
                  const content = result.content;
                  const isSummary = result.result_type === 'summary' || content?.summary;
                  const hasFindings = content?.findings && Array.isArray(content.findings) && content.findings.length > 0;
                  const hasHosts = content?.hosts && Array.isArray(content.hosts) && content.hosts.length > 0;
                  
                  return (
                    <div key={index} className="bg-card border rounded-lg p-6">
                      <div className="mb-4">
                        <Badge variant="outline" className="mb-3">{result.result_type}</Badge>
                        
                        {/* Summary Stats */}
                        {isSummary && content?.summary && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-muted/30 rounded">
                              <div className="text-2xl font-bold text-cyber-red">{content.summary.critical_findings || 0}</div>
                              <div className="text-xs text-muted-foreground">Critical</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded">
                              <div className="text-2xl font-bold text-warning">{content.summary.high_findings || 0}</div>
                              <div className="text-xs text-muted-foreground">High</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded">
                              <div className="text-2xl font-bold text-info">{content.summary.medium_findings || 0}</div>
                              <div className="text-xs text-muted-foreground">Medium</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded">
                              <div className="text-2xl font-bold text-success">{content.summary.low_findings || 0}</div>
                              <div className="text-xs text-muted-foreground">Low</div>
                            </div>
                          </div>
                        )}
                        
                        {/* Risk Score */}
                        {content?.risk_score !== undefined && (
                          <div className="mb-4 p-3 bg-muted/20 rounded">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Risk Score:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">{content.risk_score.toFixed(1)}/10</span>
                                <Badge className={getSeverityColor(content.risk_level?.toLowerCase() || 'low')}>
                                  {content.risk_level || 'Unknown'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Recommendations */}
                        {content?.recommendations && Array.isArray(content.recommendations) && content.recommendations.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Recommendations:</h4>
                            <ul className="space-y-1 text-sm">
                              {content.recommendations.map((rec: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {/* Collapsible Sections */}
                      {hasFindings && (
                        <details className="mb-4">
                          <summary className="cursor-pointer font-medium mb-2 hover:text-primary">
                            Findings ({content.findings.length})
                          </summary>
                          {renderResultContent(result)}
                        </details>
                      )}
                      
                      {hasHosts && (
                        <details className="mb-4">
                          <summary className="cursor-pointer font-medium mb-2 hover:text-primary">
                            Hosts ({content.hosts.length})
                          </summary>
                          {renderResultContent(result)}
                        </details>
                      )}
                      
                      {!hasFindings && !hasHosts && (
                        <div>{renderResultContent(result)}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : scanDetails.status === 'running' ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground font-medium">Scan in Progress...</p>
                <p className="text-sm text-muted-foreground mt-2">Please wait while the scan completes</p>
                {scanDetails.progress && (
                  <div className="mt-4 max-w-xs mx-auto">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${scanDetails.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{scanDetails.progress}% complete</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No detailed results available for this scan.</p>
              </div>
            )}
            </>
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