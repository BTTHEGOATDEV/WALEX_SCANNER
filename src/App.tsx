import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Scans from "./pages/Scans";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import VerificationSuccess from "./pages/VerificationSuccess";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verification-success" element={<VerificationSuccess />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          } />
          <Route path="/projects" element={
            <AuthGuard>
              <Projects />
            </AuthGuard>
          } />
          <Route path="/scans" element={
            <AuthGuard>
              <Scans />
            </AuthGuard>
          } />
          <Route path="/reports" element={
            <AuthGuard>
              <Reports />
            </AuthGuard>
          } />
          <Route path="/settings" element={
            <AuthGuard>
              <Settings />
            </AuthGuard>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
