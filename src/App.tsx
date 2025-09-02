import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
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
import WalkingChatbot from "./components/WalkingChatbot";
import PageWrapper from "./components/PageWrapper";

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
                <PageWrapper>
                  <Landing />
                </PageWrapper>
              </AuthGuard>
            } />
            <Route path="/landing" element={
              <AuthGuard requireAuth={false}>
                <PageWrapper>
                  <Landing />
                </PageWrapper>
              </AuthGuard>
            } />
            <Route path="/login" element={
              <AuthGuard requireAuth={false}>
                <PageWrapper>
                  <Login />
                </PageWrapper>
              </AuthGuard>
            } />
            <Route path="/register" element={
              <AuthGuard requireAuth={false}>
                <PageWrapper>
                  <Register />
                </PageWrapper>
              </AuthGuard>
            } />
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <AuthGuard>
                <PageWrapper>
                  <Dashboard />
                </PageWrapper>
              </AuthGuard>
            } />
            <Route path="/projects" element={
              <AuthGuard>
                <PageWrapper>
                  <Projects />
                </PageWrapper>
              </AuthGuard>
            } />
            <Route path="/scans" element={
              <AuthGuard>
                <PageWrapper>
                  <Scans />
                </PageWrapper>
              </AuthGuard>
            } />
            <Route path="/reports" element={
              <AuthGuard>
                <PageWrapper>
                  <Reports />
                </PageWrapper>
              </AuthGuard>
            } />
            <Route path="/settings" element={
              <AuthGuard>
                <PageWrapper>
                  <Settings />
                </PageWrapper>
              </AuthGuard>
            } />
            
            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
          
          {/* Walking Chatbot - shows on all pages */}
          <WalkingChatbot />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
