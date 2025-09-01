import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Target, Shield, Zap, Lock, Calendar, Clock, Eye, Trash2, Database, Wifi, Settings, FileText } from "lucide-react";
import ScanDialog from "@/components/ScanDialog";
import ScanDetailsDialog from "@/components/ScanDetailsDialog";
import ScanProgressModal from "@/components/ScanProgressModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const Scans = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("domain");
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedScan, setSelectedScan] = useState<any>(null);

  useEffect(() => {
    fetchScans();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('scans-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scans'
        },
        () => {
          fetchScans(); // Refresh when scans change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchScans = async () => {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error('Error fetching scans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    try {
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;

      toast({
        title: "Scan Deleted",
        description: "Scan has been successfully deleted",
      });

      fetchScans(); // Refresh the list
    } catch (error) {
      console.error('Error deleting scan:', error);
      toast({
        title: "Error",
        description: "Failed to delete scan",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (scanId: string) => {
    const scan = scans.find(s => s.id === scanId);
    setSelectedScan(scan);
    setSelectedScanId(scanId);
    
    // Show progress modal for running scans, details dialog for completed scans
    if (scan?.status === 'running' || scan?.status === 'queued') {
      setShowProgressModal(true);
    } else {
      setIsDetailsOpen(true);
    }
  };

  const scanCategories = [
    {
      id: "domain",
      label: "Domain Scanning",
      icon: Target,
      description: "Comprehensive domain and subdomain analysis",
      color: "text-primary",
      types: ["domain"]
    },
    {
      id: "port",
      label: "Port Scanning",
      icon: Wifi,
      description: "Network port discovery and enumeration",
      color: "text-success",
      types: ["port"]
    },
    {
      id: "vulnerability",
      label: "Vulnerability Assessment",
      icon: Shield,
      description: "Security weakness identification",
      color: "text-warning",
      types: ["vulnerability"]
    },
    {
      id: "ssl",
      label: "SSL/TLS Analysis",
      icon: Lock,
      description: "Certificate and encryption analysis",
      color: "text-info",
      types: ["ssl"]
    }
  ];

  const getFilteredScans = (types: string[]) => {
    return scans.filter(scan => types.includes(scan.scan_type));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-primary via-cyber-blue to-primary bg-clip-text text-transparent">
            Security Scans
          </h1>
          <p className="text-muted-foreground">Launch and monitor security assessments across your infrastructure</p>
        </div>
        <div className="flex gap-3 animate-slide-in-right">
          <ScanDialog actionType="Scan New Domain" onScanCreated={fetchScans}>
            <Button variant="cyber" size="lg" className="hover:shadow-lg hover:shadow-primary/25 transition-all">
              <Target className="h-4 w-4 mr-2" />
              Launch Scan
            </Button>
          </ScanDialog>
          <Button variant="outline" size="lg">
            <FileText className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <ScanDialog actionType="Scan New Domain" onScanCreated={fetchScans}>
              <Card className="cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
                <CardContent className="p-4 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-scan opacity-0 group-hover:opacity-100 transition-opacity animate-data-flow"></div>
                  <Target className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform relative z-10" />
                  <h3 className="font-semibold relative z-10">Domain Scan</h3>
                  <p className="text-xs text-muted-foreground relative z-10">Analyze domains & subdomains</p>
                </CardContent>
              </Card>
            </ScanDialog>
            
            <ScanDialog actionType="Port Range Check" onScanCreated={fetchScans}>
              <Card className="cursor-pointer hover:border-success/50 hover:shadow-lg hover:shadow-success/10 transition-all duration-300 group">
                <CardContent className="p-4 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Wifi className="h-8 w-8 mx-auto mb-2 text-success group-hover:scale-110 transition-transform relative z-10" />
                  <h3 className="font-semibold relative z-10">Port Scan</h3>
                  <p className="text-xs text-muted-foreground relative z-10">Network port discovery</p>
                </CardContent>
              </Card>
            </ScanDialog>
            
            <ScanDialog actionType="Vulnerability Assessment" onScanCreated={fetchScans}>
              <Card className="cursor-pointer hover:border-warning/50 hover:shadow-lg hover:shadow-warning/10 transition-all duration-300 group">
                <CardContent className="p-4 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Shield className="h-8 w-8 mx-auto mb-2 text-warning group-hover:scale-110 transition-transform relative z-10" />
                  <h3 className="font-semibold relative z-10">Vulnerability Scan</h3>
                  <p className="text-xs text-muted-foreground relative z-10">Security assessment</p>
                </CardContent>
              </Card>
            </ScanDialog>
            
            <ScanDialog actionType="SSL/TLS Analysis" onScanCreated={fetchScans}>
              <Card className="cursor-pointer hover:border-cyber-blue/50 hover:shadow-lg hover:shadow-cyber-blue/10 transition-all duration-300 group">
                <CardContent className="p-4 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Lock className="h-8 w-8 mx-auto mb-2 text-cyber-blue group-hover:scale-110 transition-transform relative z-10" />
                  <h3 className="font-semibold relative z-10">SSL Analysis</h3>
                  <p className="text-xs text-muted-foreground relative z-10">Certificate validation</p>
                </CardContent>
              </Card>
            </ScanDialog>
      </div>

      {/* Scans Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {scanCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {category.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {scanCategories.map((category) => {
              const filteredScans = getFilteredScans(category.types);
              const IconComponent = category.icon;
              
              return (
                <TabsContent key={category.id} value={category.id} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconComponent className={`h-5 w-5 ${category.color}`} />
                        {category.label}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Target</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Severity</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loading ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                  <p className="text-sm text-muted-foreground mt-2">Loading scans...</p>
                                </TableCell>
                              </TableRow>
                            ) : filteredScans.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                  <p className="text-muted-foreground">No scans found for this category.</p>
                                  <p className="text-sm text-muted-foreground">Start your first scan using the options above.</p>
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredScans.map((scan) => (
                                <TableRow key={scan.id}>
                                  <TableCell className="font-mono text-sm">{scan.target}</TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      <Badge variant="outline">{scan.scan_type}</Badge>
                                      {scan.scan_subtype && <Badge variant="secondary" className="text-xs">{scan.scan_subtype}</Badge>}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={
                                        scan.status === 'completed' ? 'default' : 
                                        scan.status === 'running' ? 'secondary' : 
                                        scan.status === 'failed' ? 'destructive' : 'outline'
                                      }
                                    >
                                      {scan.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant="outline"
                                      className={
                                        scan.severity === 'critical' ? 'bg-critical text-critical-foreground' :
                                        scan.severity === 'high' ? 'bg-cyber-red text-cyber-red-foreground' :
                                        scan.severity === 'medium' ? 'bg-warning text-warning-foreground' :
                                        scan.severity === 'low' ? 'bg-info text-info-foreground' :
                                        'bg-success text-success-foreground'
                                      }
                                    >
                                      {scan.severity}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {new Date(scan.created_at).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewDetails(scan.id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Scan</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete this scan? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => handleDeleteScan(scan.id)}
                                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
      </Tabs>

      <ScanDetailsDialog
            scanId={selectedScanId}
            isOpen={isDetailsOpen}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedScanId(null);
              setSelectedScan(null);
            }}
      />

      <ScanProgressModal
            isOpen={showProgressModal}
            onClose={() => {
              setShowProgressModal(false);
              setSelectedScanId(null);
              setSelectedScan(null);
            }}
            scanId={selectedScanId}
            scanDetails={selectedScan}
      />
    </div>
  );
};

export default Scans;