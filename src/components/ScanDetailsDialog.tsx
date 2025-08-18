import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Target, Calendar, Clock, AlertTriangle, CheckCircle, Info, RefreshCw } from "lucide-react";

interface ScanDetailsDialogProps {
  scanId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ScanResult {
  id: string;
  scan_id: string;
  content: any;
  result_type: string;
  created_at: string;
}

const ScanDetailsDialog = ({ scanId, isOpen, onClose }: ScanDetailsDialogProps) => {
  const [scanDetails, setScanDetails] = useState<any>(null);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scanId && isOpen) {
      fetchScanDetails();
    }
  }, [scanId, isOpen]);

  const fetchScanDetails = async () => {
    if (!scanId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Fetch scan details
      const { data: scanData, error: scanError } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (scanError || !scanData) {
        throw new Error(scanError?.message || 'Scan not found');
      }

      // Fetch scan results
      const { data: resultsData, error: resultsError } = await supabase
        .from('scan_results')
        .select('*')
        .eq('scan_id', scanId)
        .order('created_at', { ascending: false });

      if (resultsError) {
        console.error('Results error:', resultsError);
        // Continue with just scan data
      }

      setScanDetails(scanData);
      setScanResults(resultsData || []);
      
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load scan details');
      setScanDetails(null);
      setScanResults([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchScanDetails();
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-amber-500 text-amber-50';
      case 'medium':
        return 'bg-yellow-500 text-yellow-50';
      case 'low':
        return 'bg-blue-500 text-blue-50';
      default:
        return 'bg-green-500 text-green-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (start: string, end: string) => {
    try {
      const startTime = new Date(start);
      const endTime = new Date(end);
      const duration = endTime.getTime() - startTime.getTime();
      const seconds = Math.floor(duration / 1000);
      const minutes = Math.floor(seconds / 60);
      
      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      }
      return `${seconds}s`;
    } catch {
      return 'N/A';
    }
  };

  const renderStatCard = (title: string, stats: Record<string, any>) => {
    return (
      <div className="bg-muted/30 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3">{title}</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
              <span className="font-mono">
                {value !== undefined ? String(value) : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHostCard = (host: any) => {
    return (
      <div key={host.address} className="border rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="font-semibold">{host.address}</span>
            {host.hostname && host.hostname !== host.address && (
              <span className="text-sm text-muted-foreground">({host.hostname})</span>
            )}
          </div>
          <Badge variant={host.state === 'up' ? 'default' : 'secondary'}>
            {host.state || 'unknown'}
          </Badge>
        </div>

        {host.open_ports && Array.isArray(host.open_ports) && (
          <div className="mt-3">
            <h5 className="text-sm font-medium mb-2">
              Open Ports ({host.open_ports.length})
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {host.open_ports.map((port: any) => (
                <div key={`${host.address}-${port.port}`} className="bg-muted/30 p-3 rounded border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-medium">
                      {port.port}/{port.protocol || 'tcp'}
                    </span>
                    {port.severity && (
                      <Badge className={getSeverityColor(port.severity)}>
                        {port.severity.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs space-y-1">
                    {port.service && <div>Service: {port.service}</div>}
                    {port.product && <div>Product: {port.product}</div>}
                    {port.version && <div>Version: {port.version}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFindingCard = (finding: any) => {
    return (
      <div key={finding.title || finding.id} className="border rounded-lg p-4 bg-muted/10">
        <div className="flex items-start gap-3 mb-2">
          {getSeverityIcon(finding.severity)}
          <div className="flex-1">
            <h4 className="font-medium">{finding.title || 'Finding'}</h4>
            {finding.description && (
              <p className="text-sm text-muted-foreground mt-1">{finding.description}</p>
            )}
          </div>
          {finding.severity && (
            <Badge className={getSeverityColor(finding.severity)}>
              {finding.severity.toUpperCase()}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mt-3">
          {finding.host && <div>Host: <span className="font-mono">{finding.host}</span></div>}
          {finding.port && <div>Port: <span className="font-mono">{finding.port}</span></div>}
          {finding.service && <div>Service: {finding.service}</div>}
          {finding.cve && <div>CVE: <Badge variant="destructive">{finding.cve}</Badge></div>}
        </div>

        {finding.recommendation && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-sm border border-blue-100">
            <p className="font-medium text-blue-800">Recommendation:</p>
            <p className="text-blue-700">{finding.recommendation}</p>
          </div>
        )}
      </div>
    );
  };

  const renderResultContent = (result: ScanResult) => {
    let content = result.content;
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch {
        content = { error: "Invalid JSON format" };
      }
    }

    // Handle Python scanner results
    if (content?.scan_stats || content?.hosts) {
      return (
        <div className="space-y-4">
          {content.scan_stats && renderStatCard('Scan Statistics', content.scan_stats)}
          
          {content.hosts && Array.isArray(content.hosts) && (
            <div className="space-y-3">
              <h5 className="font-medium">Scanned Hosts ({content.hosts.length})</h5>
              {content.hosts.map(renderHostCard)}
            </div>
          )}

          {content.findings && Array.isArray(content.findings) && (
            <div className="space-y-3">
              <h5 className="font-medium">Findings ({content.findings.length})</h5>
              {content.findings.map(renderFindingCard)}
            </div>
          )}
        </div>
      );
    }

    // Fallback for raw JSON display
    return (
      <div className="bg-muted/50 rounded p-3 text-sm font-mono overflow-x-auto">
        <pre>{JSON.stringify(content, null, 2)}</pre>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Scan Details
              </DialogTitle>
              <DialogDescription>
                {scanDetails
                  ? `Details for scan #${scanDetails.id.slice(0, 8)}`
                  : `Loading scan ${scanId?.slice(0, 8) || ''}`
                }
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {loading && !isRefreshing ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading scan details...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h4 className="text-destructive font-medium mb-2">Error Loading Scan</h4>
                <p className="text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={fetchScanDetails}
                >
                  Retry
                </Button>
              </div>
            ) : !scanDetails ? (
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No scan data available</p>
              </div>
            ) : (
              <>
                {/* Scan Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>Target:</span>
                      <span className="font-mono">{scanDetails.target}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Type:</span>
                      <Badge variant="outline">{scanDetails.scan_type}</Badge>
                      {scanDetails.scan_subtype && (
                        <Badge variant="secondary">{scanDetails.scan_subtype}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Priority:</span>
                      <Badge variant="outline">{scanDetails.priority}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Started:</span>
                      <span>{formatDate(scanDetails.started_at || scanDetails.created_at)}</span>
                    </div>
                    {scanDetails.completed_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Duration:</span>
                        <span>
                          {formatDuration(
                            scanDetails.started_at || scanDetails.created_at,
                            scanDetails.completed_at
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span>Status:</span>
                      <Badge variant={
                        scanDetails.status === 'completed' ? 'default' :
                        scanDetails.status === 'failed' ? 'destructive' :
                        'secondary'
                      }>
                        {scanDetails.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Progress Indicator */}
                {scanDetails.status === 'running' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                      <p className="font-medium">Scan in Progress</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Estimated completion: {formatDate(scanDetails.estimated_completion)}
                      </p>
                    </div>
                    <div className="max-w-md mx-auto">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${scanDetails.progress || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0%</span>
                        <span>{scanDetails.progress || 0}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {scanDetails.status === 'failed' && scanDetails.error_message && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <h4 className="font-medium">Scan Failed</h4>
                    </div>
                    <p className="mt-2 text-sm">{scanDetails.error_message}</p>
                  </div>
                )}

                {/* Scan Results */}
                {scanDetails.status === 'completed' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Scan Results</h3>
                    
                    {scanResults.length === 0 ? (
                      <div className="text-center py-8 border rounded bg-muted/30">
                        <Info className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground">No detailed results available</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {scanResults.map((result, index) => (
                          <div key={result.id || index} className="border rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <Badge variant="outline">
                                {result.result_type || 'result'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(result.created_at)}
                              </span>
                            </div>
                            {renderResultContent(result)}
                          </div>
                        ))}
                      </div>
                    )}
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
