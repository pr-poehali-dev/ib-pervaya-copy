import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Lesson from "./pages/Lesson";
import Profile from "./pages/Profile";
import MyLearning from "./pages/MyLearning";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import SuperAdmin from "./pages/SuperAdmin";
import SalesManager from "./pages/SalesManager";
import Catalog from "./pages/Catalog";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StatsProvider } from "./contexts/StatsContext";
import { RoleProvider } from "./contexts/RoleContext";

const queryClient = new QueryClient();

const App = () => (
  <RoleProvider>
  <StatsProvider>
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/lesson/:id" element={<Lesson />} />
          <Route path="/my-learning" element={<MyLearning />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/super-admin" element={<SuperAdmin />} />
          <Route path="/sales" element={<SalesManager />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
  </StatsProvider>
  </RoleProvider>
);

export default App;