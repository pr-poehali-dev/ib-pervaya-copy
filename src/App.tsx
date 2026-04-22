import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CoursePage from "./pages/CoursePage";
import Profile from "./pages/Profile";
import MyLearning from "./pages/MyLearning";
import Achievements from "./pages/Achievements";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import SuperAdmin from "./pages/SuperAdmin";
import SalesManager from "./pages/SalesManager";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import ChatStudent from "./pages/ChatStudent";
import ChatTenant from "./pages/ChatTenant";
import ChatSalesManager from "./pages/ChatSalesManager";
import ChatSupport from "./pages/ChatSupport";
import ChatSuperAdmin from "./pages/ChatSuperAdmin";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StatsProvider } from "./contexts/StatsContext";
import { RoleProvider, useRole } from "./contexts/RoleContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

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

  // Специалист ТП — только /chat и /profile
  if (role === "support" && location.pathname !== "/chat" && location.pathname !== "/profile") {
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <RoleProvider>
  <StatsProvider>
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
  </StatsProvider>
  </RoleProvider>
);

export default App;