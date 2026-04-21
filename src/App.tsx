import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Lesson from "./pages/Lesson";
import CoursePage from "./pages/CoursePage";
import Profile from "./pages/Profile";
import MyLearning from "./pages/MyLearning";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import SuperAdmin from "./pages/SuperAdmin";
import SalesManager from "./pages/SalesManager";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StatsProvider } from "./contexts/StatsContext";
import { RoleProvider } from "./contexts/RoleContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />}
      />
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/courses" element={<RequireAuth><Courses /></RequireAuth>} />
      <Route path="/lesson/:id" element={<RequireAuth><Lesson /></RequireAuth>} />
      <Route path="/course/:id" element={<RequireAuth><CoursePage /></RequireAuth>} />
      <Route path="/my-learning" element={<RequireAuth><MyLearning /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
      <Route path="/super-admin" element={<RequireAuth><SuperAdmin /></RequireAuth>} />
      <Route path="/sales" element={<RequireAuth><SalesManager /></RequireAuth>} />
      <Route path="/catalog" element={<RequireAuth><Catalog /></RequireAuth>} />
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