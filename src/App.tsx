import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import EmailVerification from "@/pages/EmailVerification";
import PasswordReset from "@/pages/PasswordReset";
import ForgotPassword from "@/pages/ForgotPassword";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import IntakeChat from "@/pages/IntakeChat";
import ProjectBoard from "@/pages/ProjectBoard";
import ProjectProvisioning from "@/pages/ProjectProvisioning/ProjectProvisioning";
import AgentManagement from "@/pages/AgentManagement";
import AgentExecutions from "@/pages/AgentExecutions";
import MeetingSummary from "@/pages/MeetingSummary";
import ClientPortal from "@/pages/ClientPortal";
import NotFound from "@/pages/NotFound";

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes with dashboard layout */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="intake" element={<IntakeChat />} />
              <Route path="projects" element={<ProjectBoard />} />
              <Route path="projects/provision" element={<ProjectProvisioning />} />
              <Route path="meetings" element={<MeetingSummary />} />
              <Route path="agents" element={<AgentManagement />} />
              <Route path="executions" element={<AgentExecutions />} />
              <Route path="audit" element={<AgentExecutions />} />
              <Route path="profile" element={<AgentExecutions />} />
              <Route path="settings" element={<AgentExecutions />} />
              <Route path="help" element={<AgentExecutions />} />
            </Route>
            
            {/* Client Portal Routes */}
            <Route path="/portal/:projectId" element={<ClientPortal />} />
            <Route path="/portal" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="techstart" element={<Dashboard />} />
              <Route path="ecommerce" element={<Dashboard />} />
              <Route path="mobile" element={<Dashboard />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
