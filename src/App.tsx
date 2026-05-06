import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Login } from "./pages/auth";
import { Dashboard, Courses, Profile, MyLearning, Achievements, Catalog } from "./pages/student";
import { Admin } from "./pages/admin";
import { SuperAdmin, SalesManager } from "./pages/superadmin";
import SupportTenants from "./pages/support/SupportTenants";
import { ChatStudent, ChatTenant, ChatSalesManager, ChatSupport, ChatSuperAdmin } from "./pages/chat";
import CoursePage from "./pages/CoursePage";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StatsProvider } from "./contexts/StatsContext";
import { RoleProvider, useRole } from "./contexts/RoleContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";

const queryClient = new QueryClient();

const ROLE_HOME: Record<string, string> = {
  superadmin:    "/super-admin",
  sales_manager: "/sales",
  admin:         "/admin",
  manager:       "/admin",
  student:       "/",
  support:       "/chat",
};

function ChatPage() {
  const { role } = useRole();
  if (role === "student")       return <ChatStudent />;
  if (role === "admin")         return <ChatTenant />;
  if (role === "manager")       return <ChatTenant />;
  if (role === "sales_manager") return <ChatSalesManager />;
  if (role === "support")       return <ChatSupport />;
  if (role === "superadmin")    return <ChatSuperAdmin />;
  return <ChatStudent />;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { role } = useRole();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если роль не студент и пользователь попал на "/" — редиректим на правильный дом
  if (location.pathname === "/" && role !== "student") {
    return <Navigate to={ROLE_HOME[role] ?? "/admin"} replace />;
  }

  // Специалист ТП — только /chat и /support-tenants
  if (role === "support" && location.pathname !== "/chat" && location.pathname !== "/support-tenants") {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const { role } = useRole();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={ROLE_HOME[role] ?? "/admin"} replace /> : <Login />}
      />
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/courses" element={<RequireAuth><Courses /></RequireAuth>} />
      <Route path="/course/:id" element={<RequireAuth><CoursePage /></RequireAuth>} />
      <Route path="/my-learning"   element={<RequireAuth><MyLearning /></RequireAuth>} />
      <Route path="/achievements"  element={<RequireAuth><Achievements /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
      <Route path="/super-admin" element={<RequireAuth><SuperAdmin /></RequireAuth>} />
      <Route path="/sales" element={<RequireAuth><SalesManager /></RequireAuth>} />
      <Route path="/catalog" element={<RequireAuth><Catalog /></RequireAuth>} />
      <Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />
      <Route path="/support-tenants" element={<RequireAuth><SupportTenants /></RequireAuth>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <RoleProvider>
  <StatsProvider>
  <BrandingProvider>
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AccessibilityProvider>
            <AppRoutes />
          </AccessibilityProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
  </BrandingProvider>
  </StatsProvider>
  </RoleProvider>
);

export default App;