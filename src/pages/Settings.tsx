import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Database, Key, Palette, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import Navigation from "@/components/Navigation";
import { useTheme } from "@/components/ThemeProvider";

const Settings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { userProfile, isLoading: profileLoading, updateProfile } = useUserProfile();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for form inputs
  const [localProfile, setLocalProfile] = useState({
    name: "",
    email: "",
    role: "",
    company: "",
  });

  // Update local state when userProfile changes
  useEffect(() => {
    if (userProfile.name || userProfile.email || userProfile.role || userProfile.company) {
      setLocalProfile({
        name: userProfile.name || "",
        email: userProfile.email || "",
        role: userProfile.role || "",
        company: userProfile.company || ""
      });
    }
  }, [userProfile.name, userProfile.email, userProfile.role, userProfile.company]);

  const [notifications, setNotifications] = useState({
    scanCompletion: false,
    highSeverityFindings: false,
    weeklyReports: false,
    systemMaintenance: false,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    sessionTimeout: "30",
    passwordExpiry: "90",
  });

  useEffect(() => {
    // Component initialization - profile data will be loaded by useUserProfile hook
  }, []);

  const handleSave = async (section: string) => {
    if (section === "Profile") {
      if (!localProfile.name.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your full name",
          variant: "destructive"
        });
        return;
      }

      setIsSaving(true);
      
      try {
        const success = await updateProfile({
          name: localProfile.name,
          company: localProfile.company,
          role: localProfile.role
        });

        if (success) {
          toast({
            title: "Profile Updated",
            description: "Your profile has been saved successfully.",
          });
          
          // No need to reload - the navigation will update automatically
        } else {
          throw new Error("Update failed");
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to save profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      toast({
        title: "Settings Updated",
        description: `${section} settings have been saved successfully.`,
      });
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field: string, value: string | boolean) => {
    setSecurity(prev => ({ ...prev, [field]: value }));
  };

  const handleComingSoon = () => {
    setShowComingSoon(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-muted-foreground">Manage your account and application preferences</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                System
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-6">
                   {profileLoading ? (
                    <>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-10 w-32" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>

                      <Button className="w-full mt-4">Save Changes</Button>
                    </>
                  ) : (
                    <div className="animate-fade-in">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                            {localProfile.name ? localProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                         <div className="space-y-2">
                           <Button variant="outline" onClick={handleComingSoon}>Change Photo</Button>
                           <p className="text-sm text-muted-foreground">JPG, PNG up to 2MB</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                           <Input
                             id="name"
                             value={localProfile.name}
                             onChange={(e) => handleProfileChange("name", e.target.value)}
                             disabled={profileLoading}
                           />
                        </div>
                         <div className="space-y-2">
                           <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              value={localProfile.email}
                              disabled
                              className="bg-muted cursor-not-allowed"
                            />
                         </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                           <Input
                             id="role"
                             value={localProfile.role}
                             onChange={(e) => handleProfileChange("role", e.target.value)}
                             disabled={profileLoading}
                             placeholder="e.g., Security Analyst, IT Manager"
                           />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                           <Input
                             id="company"
                             value={localProfile.company}
                             onChange={(e) => handleProfileChange("company", e.target.value)}
                             disabled={profileLoading}
                             placeholder="Enter your company name"
                           />
                        </div>
                      </div>

                       <Button 
                         onClick={() => handleSave("Profile")} 
                         disabled={isSaving || profileLoading}
                         className="w-full mt-4"
                       >
                         {isSaving ? "Saving..." : "Save Changes"}
                       </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure when and how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="scan-completion">Scan Completion</Label>
                        <p className="text-sm text-muted-foreground">Get notified when scans complete</p>
                      </div>
                      <Switch
                        id="scan-completion"
                        checked={notifications.scanCompletion}
                        onCheckedChange={(checked) => handleNotificationChange("scanCompletion", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="high-severity">High Severity Findings</Label>
                        <p className="text-sm text-muted-foreground">Immediate alerts for critical vulnerabilities</p>
                      </div>
                      <Switch
                        id="high-severity"
                        checked={notifications.highSeverityFindings}
                        onCheckedChange={(checked) => handleNotificationChange("highSeverityFindings", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weekly-reports">Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">Summary of weekly activity</p>
                      </div>
                      <Switch
                        id="weekly-reports"
                        checked={notifications.weeklyReports}
                        onCheckedChange={(checked) => handleNotificationChange("weeklyReports", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenance">System Maintenance</Label>
                        <p className="text-sm text-muted-foreground">Scheduled maintenance notifications</p>
                      </div>
                      <Switch
                        id="maintenance"
                        checked={notifications.systemMaintenance}
                        onCheckedChange={(checked) => handleNotificationChange("systemMaintenance", checked)}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave("Notification")} className="w-full">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      Manage your account security and access controls
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="2fa">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Switch
                        id="2fa"
                        checked={security.twoFactorAuth}
                        onCheckedChange={(checked) => handleSecurityChange("twoFactorAuth", checked)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                        <Input
                          id="session-timeout"
                          value={security.sessionTimeout}
                          onChange={(e) => handleSecurityChange("sessionTimeout", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                        <Input
                          id="password-expiry"
                          value={security.passwordExpiry}
                          onChange={(e) => handleSecurityChange("passwordExpiry", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button variant="outline" className="w-full">
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Database className="h-4 w-4 mr-2" />
                        Download Account Data
                      </Button>
                    </div>

                    <Button onClick={() => handleSave("Security")} className="w-full">
                      Save Security Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Billing & Subscription
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and billing preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Current Plan: Free Tier</h3>
                        <p className="text-sm text-muted-foreground">5 scans per month • Basic reporting</p>
                      </div>
                      <Button variant="cyber" onClick={handleComingSoon}>
                        Upgrade Plan
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="relative overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Basic</CardTitle>
                        <div className="text-2xl font-bold">$9<span className="text-sm font-normal">/mo</span></div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>• 50 scans/month</p>
                        <p>• Basic reports</p>
                        <p>• Email support</p>
                        <Button variant="outline" size="sm" className="w-full mt-4" onClick={handleComingSoon}>
                          Select Plan
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-primary/50 bg-primary/5">
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs rounded-bl-lg">
                        Popular
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Professional</CardTitle>
                        <div className="text-2xl font-bold">$29<span className="text-sm font-normal">/mo</span></div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>• 500 scans/month</p>
                        <p>• Advanced reports</p>
                        <p>• API access</p>
                        <p>• Priority support</p>
                        <Button variant="cyber" size="sm" className="w-full mt-4" onClick={handleComingSoon}>
                          Select Plan
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Enterprise</CardTitle>
                        <div className="text-2xl font-bold">$99<span className="text-sm font-normal">/mo</span></div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>• Unlimited scans</p>
                        <p>• Custom reports</p>
                        <p>• White-label</p>
                        <p>• Dedicated support</p>
                        <Button variant="outline" size="sm" className="w-full mt-4" onClick={handleComingSoon}>
                          Contact Sales
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Billing Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Next Billing Date</Label>
                        <p className="text-sm text-muted-foreground">N/A (Free Plan)</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <p className="text-sm text-muted-foreground">No payment method on file</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleComingSoon}>Add Payment Method</Button>
                      <Button variant="outline" onClick={handleComingSoon}>Download Invoices</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Tab */}
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API & Webhooks
                  </CardTitle>
                  <CardDescription>
                    Manage API keys and webhook configurations for automated scanning
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Upgrade Banner */}
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <Key className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-700 dark:text-amber-300">Upgrade Required</h4>
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          API access and webhooks are available on Professional and Enterprise plans
                        </p>
                      </div>
                      <Button variant="cyber" size="sm" onClick={handleComingSoon}>
                        Upgrade Now
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 opacity-50">
                    <div>
                      <Label className="text-base font-medium">API Keys</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Generate and manage API keys for programmatic access to BTScan
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                          <div>
                            <div className="font-mono text-sm">bts_*********************</div>
                            <div className="text-xs text-muted-foreground">Created 2 days ago • Last used: Never</div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>Copy</Button>
                            <Button variant="outline" size="sm" disabled>Revoke</Button>
                          </div>
                        </div>
                        <Button variant="outline" disabled>
                          <Key className="h-4 w-4 mr-2" />
                          Generate New API Key
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Webhooks</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Configure webhooks to receive real-time notifications about scan results
                      </p>
                      <div className="space-y-3">
                        <div className="p-4 border rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">Scan Completion Webhook</div>
                            <Badge variant="secondary">Inactive</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            https://your-app.com/webhooks/scan-complete
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>Edit</Button>
                            <Button variant="outline" size="sm" disabled>Test</Button>
                            <Button variant="outline" size="sm" disabled>Delete</Button>
                          </div>
                        </div>
                        <Button variant="outline" disabled>
                          <Palette className="h-4 w-4 mr-2" />
                          Add New Webhook
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Rate Limits</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Current API usage and limits for your plan
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg text-center">
                          <div className="text-2xl font-bold text-muted-foreground">0</div>
                          <div className="text-sm text-muted-foreground">Requests Today</div>
                        </div>
                        <div className="p-3 border rounded-lg text-center">
                          <div className="text-2xl font-bold text-muted-foreground">100</div>
                          <div className="text-sm text-muted-foreground">Daily Limit</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    System Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure application behavior and appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Theme</Label>
                      <p className="text-sm text-muted-foreground mb-3">Choose your preferred color theme</p>
                      <div className="flex gap-2">
                        <Button 
                          variant={theme === "light" ? "cyber" : "outline"} 
                          size="sm"
                          onClick={() => setTheme("light")}
                          className="transition-all duration-200"
                        >
                          Light
                        </Button>
                        <Button 
                          variant={theme === "dark" ? "cyber" : "outline"} 
                          size="sm"
                          onClick={() => setTheme("dark")}
                          className="transition-all duration-200"
                        >
                          Dark
                        </Button>
                        <Button 
                          variant={theme === "system" ? "cyber" : "outline"} 
                          size="sm"
                          onClick={() => setTheme("system")}
                          className="transition-all duration-200"
                        >
                          Auto
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Language</Label>
                      <p className="text-sm text-muted-foreground mb-3">Select your preferred language</p>
                      <div className="flex gap-2">
                        <Button variant="cyber" size="sm">English</Button>
                        <Button variant="outline" size="sm" onClick={handleComingSoon}>Spanish</Button>
                        <Button variant="outline" size="sm" onClick={handleComingSoon}>French</Button>
                      </div>
                    </div>

                    <div>
                      <Label>Data Retention</Label>
                      <p className="text-sm text-muted-foreground mb-3">How long to keep scan data</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleComingSoon}>30 days</Button>
                        <Button variant="outline" size="sm" onClick={handleComingSoon}>90 days</Button>
                        <Button variant="cyber" size="sm">1 year</Button>
                        <Button variant="outline" size="sm" onClick={handleComingSoon}>Forever</Button>
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => handleSave("System")} className="w-full">
                    Save System Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Coming Soon Modal */}
      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Coming Soon!</DialogTitle>
            <DialogDescription className="text-center py-4">
              This feature is currently under development and will be available in a future update.
              <br /><br />
              Stay tuned for more exciting features!
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowComingSoon(false)} className="w-full">
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;