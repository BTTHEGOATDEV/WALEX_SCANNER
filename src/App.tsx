import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppSidebar } from "@/components/AppSidebar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Scans from "./pages/Scans";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="cyberscan-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              <AuthGuard requireAuth={false}>
                <Landing />
              </AuthGuard>
            } />
            <Route path="/landing" element={
              <AuthGuard requireAuth={false}>
                <Landing />
              </AuthGuard>
            } />
            <Route path="/login" element={
              <AuthGuard requireAuth={false}>
                <Login />
              </AuthGuard>
            } />
            <Route path="/register" element={
              <AuthGuard requireAuth={false}>
                <Register />
              </AuthGuard>
            } />
            
            {/* Protected routes with sidebar */}
            <Route path="/dashboard" element={
              <AuthGuard>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full bg-background">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex h-14 items-center px-6">
                          <SidebarTrigger className="mr-4" />
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-muted-foreground">System Operational</span>
                          </div>
                        </div>
                      </header>
                      <main className="flex-1 p-6 overflow-auto">
                        <Dashboard />
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </AuthGuard>
            } />
            <Route path="/projects" element={
              <AuthGuard>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full bg-background">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex h-14 items-center px-6">
                          <SidebarTrigger className="mr-4" />
                        </div>
                      </header>
                      <main className="flex-1 p-6 overflow-auto">
                        <Projects />
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </AuthGuard>
            } />
            <Route path="/scans" element={
              <AuthGuard>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full bg-background">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex h-14 items-center px-6">
                          <SidebarTrigger className="mr-4" />
                        </div>
                      </header>
                      <main className="flex-1 p-6 overflow-auto">
                        <Scans />
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </AuthGuard>
            } />
            <Route path="/reports" element={
              <AuthGuard>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full bg-background">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex h-14 items-center px-6">
                          <SidebarTrigger className="mr-4" />
                        </div>
                      </header>
                      <main className="flex-1 p-6 overflow-auto">
                        <Reports />
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </AuthGuard>
            } />
            <Route path="/settings" element={
              <AuthGuard>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full bg-background">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex h-14 items-center px-6">
                          <SidebarTrigger className="mr-4" />
                        </div>
                      </header>
                      <main className="flex-1 p-6 overflow-auto">
                        <Settings />
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </AuthGuard>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
