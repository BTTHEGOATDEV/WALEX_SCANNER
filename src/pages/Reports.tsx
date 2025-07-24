import { useState } from "react";
import { FileText, Download, Eye, Calendar, Filter, Search, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import ReportDialog from "@/components/ReportDialog";

const Reports = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  // Replace this with actual API call to fetch reports
  const reports: any[] = [];

  // Replace with actual stats from your API
  const stats = [
    {
      title: "Total Reports",
      value: "0",
      icon: FileText,
      description: "Generated this month",
    },
    {
      title: "Executive Summaries",
      value: "0",
      icon: BarChart3,
      description: "For stakeholders",
    },
    {
      title: "Technical Reports",
      value: "0",
      icon: PieChart,
      description: "Detailed findings",
    },
    {
      title: "Compliance Reports",
      value: "0",
      icon: TrendingUp,
      description: "Regulatory requirements",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-success text-success-foreground";
      case "generating": return "bg-warning text-warning-foreground animate-pulse";
      case "failed": return "bg-critical text-critical-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-critical text-critical-foreground";
      case "high": return "bg-cyber-red text-cyber-red-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "mixed": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleDownload = (reportTitle: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${reportTitle}...`,
    });
  };

  const handleView = (reportTitle: string) => {
    toast({
      title: "Opening Report",
      description: `Loading ${reportTitle} in viewer...`,
    });
  };

  // This will be handled by the ReportDialog component

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || report.type.toLowerCase().includes(filter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
                Reports
              </h1>
              <p className="text-muted-foreground">Generate and manage security reports</p>
            </div>
            <ReportDialog>
              <Button variant="cyber" size="lg">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </ReportDialog>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <IconComponent className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "executive", "technical", "compliance", "dashboard"].map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? "cyber" : "outline"}
                  size="sm"
                  onClick={() => setFilter(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reports Available</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? "No reports match your search criteria." : "Generate your first security report to get started."}
                </p>
                <ReportDialog>
                  <Button variant="cyber">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Your First Report
                  </Button>
                </ReportDialog>
              </div>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id} className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{report.title}</h3>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                            <Badge variant="outline" className={getSeverityColor(report.severity)}>
                              {report.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {report.project} • {report.type} • {report.format}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {report.created}
                            </span>
                            <span>{report.size}</span>
                            <span>{report.pages} pages</span>
                            <span>{report.findings} findings</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(report.title)}
                          disabled={report.status === "generating"}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="cyber"
                          size="sm"
                          onClick={() => handleDownload(report.title)}
                          disabled={report.status === "generating"}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;