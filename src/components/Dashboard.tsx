import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Target, Shield, TrendingUp, Clock, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ScanDetailsDialog from "@/components/ScanDetailsDialog";
import ScanDialog from "@/components/ScanDialog";
import PortCheckerInfo from "@/components/PortCheckerInfo";
const Dashboard = () => {
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [scanStats, setScanStats] = useState({
    total: 0,
    completed: 0,
    running: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscription for scans
    const channel = supabase.channel('dashboard-scans').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'scans'
    }, () => {
      fetchDashboardData(); // Refresh when scans change
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const fetchDashboardData = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recent scans for the authenticated user
      const {
        data: scans,
        error: scansError
      } = await supabase.from('scans').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      }).limit(10);
      if (scansError) throw scansError;
      setRecentScans(scans || []);

      // Calculate stats
      const stats = {
        total: scans?.length || 0,
        completed: scans?.filter(s => s.status === 'completed').length || 0,
        running: scans?.filter(s => s.status === 'running').length || 0,
        failed: scans?.filter(s => s.status === 'failed').length || 0
      };
      setScanStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleViewDetails = (scanId: string) => {
    setSelectedScanId(scanId);
    setIsDetailsOpen(true);
  };
  return <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold bg-gradient-cyber bg-clip-text text-transparent text-7xl">
              Security Dashboard
            </h1>
            <p className="text-muted-foreground">Real-time security assessment overview</p>
          </div>
          <Button onClick={() => navigate('/scans')} variant="cyber" size="lg">
            <Target className="h-4 w-4 mr-2" />
            New Scan
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 hover:shadow-lg"
            onClick={() => navigate('/scans')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scanStats.total}</div>
              <p className="text-xs text-muted-foreground">
                All time security scans
              </p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 hover:shadow-lg"
            onClick={() => navigate('/scans')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Target className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{scanStats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 hover:shadow-lg"
            onClick={() => navigate('/scans')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{scanStats.running}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 hover:shadow-lg"
            onClick={() => navigate('/scans')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <Shield className="h-4 w-4 text-cyber-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyber-red">{scanStats.failed}</div>
              <p className="text-xs text-muted-foreground">
                Scans with errors
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scan Activity</CardTitle>
              <CardDescription>
                Latest security scans and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading recent activity...</p>
                </div> : recentScans.length === 0 ? <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent scans</p>
                  <p className="text-sm text-muted-foreground mb-4">Start your first security scan to see activity here.</p>
                  <Button onClick={() => navigate('/scans')}>
                    Start First Scan
                  </Button>
                </div> : <ScrollArea className="h-80 custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Target</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentScans.map(scan => <TableRow key={scan.id}>
                          <TableCell className="font-mono text-sm">{scan.target}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{scan.scan_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={scan.status === 'completed' ? 'default' : scan.status === 'running' ? 'secondary' : scan.status === 'failed' ? 'destructive' : 'outline'}>
                              {scan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={scan.severity === 'critical' ? 'bg-critical text-critical-foreground' : scan.severity === 'high' ? 'bg-cyber-red text-cyber-red-foreground' : scan.severity === 'medium' ? 'bg-warning text-warning-foreground' : scan.severity === 'low' ? 'bg-info text-info-foreground' : 'bg-success text-success-foreground'}>
                              {scan.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(scan.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(scan.id)} className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </ScrollArea>}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common security scanning tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScanDialog actionType="Scan New Domain" onScanCreated={fetchDashboardData}>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  New Domain Scan
                </Button>
              </ScanDialog>
              <ScanDialog actionType="Port Range Check" onScanCreated={fetchDashboardData}>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  Port Range Check
                </Button>
              </ScanDialog>
              <ScanDialog actionType="Vulnerability Assessment" onScanCreated={fetchDashboardData}>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  Vulnerability Assessment
                </Button>
              </ScanDialog>
              <Button onClick={() => navigate('/reports')} className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View All Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Port Checker Information Section */}
        <PortCheckerInfo />

        <ScanDetailsDialog scanId={selectedScanId} isOpen={isDetailsOpen} onClose={() => {
        setIsDetailsOpen(false);
        setSelectedScanId(null);
      }} />
      </div>
    </div>;
};

export default Dashboard;